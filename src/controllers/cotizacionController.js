const { query } = require('../config/database');
const nodemailer = require('nodemailer');
require('dotenv').config();

// Crear nueva cotización
const crearCotizacion = async (req, res) => {
  try {
    // Mapear los campos del frontend a los nombres usados internamente
    const {
      nombre,
      apellidos,
      telefono,
      email,
      isapre,
      isapre_actual,
      valor_mensual,
      cuanto_paga,
      clinica,
      clinica_preferencia,
      renta,
      renta_imponible,
      mensaje
    } = req.body;

    // Usar los campos del frontend si existen, si no, los antiguos
    const _isapre_actual = isapre_actual || isapre;
    const _cuanto_paga = cuanto_paga || valor_mensual;
    const _clinica_preferencia = clinica_preferencia || clinica;
    const _renta_imponible = renta_imponible || renta;

    // Validar campos requeridos
    if (!nombre || !apellidos || !_clinica_preferencia || !email || !_isapre_actual || 
        !_cuanto_paga || !_renta_imponible || !telefono) {
      return res.status(400).json({
        success: false,
        message: 'Todos los campos marcados con * son obligatorios'
      });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'El formato del email no es válido'
      });
    }

    // Generar ID único para la cotización (formato: COT-YYYYMMDD-XXXX)
    const fecha = new Date();
    const fechaStr = fecha.getFullYear().toString() + 
                    (fecha.getMonth() + 1).toString().padStart(2, '0') + 
                    fecha.getDate().toString().padStart(2, '0');
    
    // Obtener el siguiente número de cotización del día
    const countResult = await query(`
      SELECT COUNT(*) as count 
      FROM cotizacion 
      WHERE DATE(fecha_envio) = CURRENT_DATE
    `);
    const numeroCotizacion = (countResult.rows[0].count + 1).toString().padStart(4, '0');
    const cotizacionId = `COT-${fechaStr}-${numeroCotizacion}`;

    // Insertar cotización en la base de datos
    const result = await query(`
      INSERT INTO cotizacion (cotizacion_id, nombre, apellidos, telefono, email, isapre_actual, 
                             cuanto_paga, clinica_preferencia, renta_imponible, mensaje)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id, cotizacion_id, nombre, apellidos, email, fecha_envio
    `, [cotizacionId, nombre, apellidos, telefono, email, _isapre_actual, 
        _cuanto_paga, _clinica_preferencia, _renta_imponible, mensaje]);

    const cotizacion = result.rows[0];

    // Enviar email de confirmación al cliente
    const emailCliente = {
      to: email,
      subject: `¡Tu solicitud de cotización ha sido recibida! [${cotizacionId}] - Pamela Cossio Asesoría`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa; padding: 20px;">
          <div style="background-color: #1E3A8A; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">¡Gracias por tu interés!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">Pamela Cossio - Asesoría de Seguros</p>
          </div>
          
          <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #1E3A8A; margin-top: 0;">Hola ${nombre} ${apellidos},</h2>
            
            <p>Hemos recibido tu solicitud de cotización exitosamente. Nuestro equipo revisará tu información y te contactaremos en las próximas 24 horas.</p>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1E3A8A; margin-top: 0;">Resumen de tu solicitud:</h3>
              <p><strong>ID de Cotización:</strong> <span style="background-color: #1E3A8A; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;">${cotizacionId}</span></p>
              <p><strong>Nombre:</strong> ${nombre} ${apellidos}</p>
              <p><strong>Teléfono:</strong> ${telefono}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Isapre actual:</strong> ${_isapre_actual}</p>
              <p><strong>Pago mensual:</strong> ${_cuanto_paga}</p>
              <p><strong>Clínica de preferencia:</strong> ${_clinica_preferencia}</p>
              <p><strong>Renta imponible:</strong> ${_renta_imponible}</p>
              ${mensaje ? `<p><strong>Mensaje:</strong> ${mensaje}</p>` : ''}
            </div>
            
            <p>Te contactaremos por WhatsApp o teléfono para agendar una reunión y encontrar el mejor plan para ti.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <p style="color: #1E3A8A; font-weight: bold;">¡Puedes contar siempre con nosotros!</p>
            </div>
            
            <div style="border-top: 2px solid #1E3A8A; padding-top: 20px; text-align: center;">
              <p style="color: #666; font-size: 14px;">
                Pamela Cossio<br>
                Asesora de Seguros<br>
                📧 info@pamelacossio.cl<br>
                📱 +56 9 XXXX XXXX
              </p>
            </div>
          </div>
        </div>
      `
    };

    // Enviar email de notificación a todos los administradores
    const admins = await query(`
      SELECT email, first_name, last_name 
      FROM users 
      WHERE role_id = (SELECT id FROM roles WHERE name = 'admin') 
      AND is_active = true
    `);

    if (admins.rows.length > 0) {
      const adminEmails = admins.rows.map(admin => admin.email);
      
      const emailAdmin = {
        to: adminEmails.join(', '),
        subject: `🚨 Nueva cotización recibida [${cotizacionId}] - Sistema de Asesoría`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa; padding: 20px;">
            <div style="background-color: #1E3A8A; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="margin: 0; font-size: 28px;">🚨 Nueva Cotización</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px;">Sistema de Asesoría - Pamela Cossio</p>
            </div>
            
            <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px;">
              <h2 style="color: #1E3A8A; margin-top: 0;">Se ha recibido una nueva solicitud de cotización</h2>
              
              <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #856404; margin-top: 0;">📋 Detalles del cliente:</h3>
                <p><strong>ID de Cotización:</strong> <span style="background-color: #1E3A8A; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;">${cotizacionId}</span></p>
                <p><strong>Nombre completo:</strong> ${nombre} ${apellidos}</p>
                <p><strong>Teléfono/WhatsApp:</strong> ${telefono}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Isapre actual:</strong> ${_isapre_actual}</p>
                <p><strong>Pago mensual actual:</strong> ${_cuanto_paga}</p>
                <p><strong>Clínica de preferencia:</strong> ${_clinica_preferencia}</p>
                <p><strong>Renta imponible:</strong> ${_renta_imponible}</p>
                ${mensaje ? `<p><strong>Mensaje adicional:</strong> ${mensaje}</p>` : ''}
                <p><strong>Fecha de envío:</strong> ${new Date().toLocaleString('es-CL')}</p>
              </div>
              
              <div style="background-color: #d1ecf1; border: 1px solid #bee5eb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #0c5460; margin-top: 0;">📞 Acción requerida:</h3>
                <p>Por favor, contacta al cliente en las próximas 24 horas para:</p>
                <ul>
                  <li>Confirmar los datos proporcionados</li>
                  <li>Agendar una reunión de asesoría</li>
                  <li>Evaluar las mejores opciones según su perfil</li>
                </ul>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <p style="color: #1E3A8A; font-weight: bold;">ID de cotización: <span style="background-color: #1E3A8A; color: white; padding: 6px 12px; border-radius: 6px; font-weight: bold; font-size: 16px;">${cotizacionId}</span></p>
              </div>
              
              <div style="border-top: 2px solid #1E3A8A; padding-top: 20px; text-align: center;">
                <p style="color: #666; font-size: 14px;">
                  Sistema de Asesoría Pamela Cossio<br>
                  📧 info@pamelacossio.cl<br>
                  🌐 www.pamelacossio.cl
                </p>
              </div>
            </div>
          </div>
        `
      };

      // Enviar emails
      await sendEmail(emailCliente);
      await sendEmail(emailAdmin);
    }

    res.status(201).json({
      success: true,
      message: 'Cotización enviada exitosamente. Te contactaremos pronto.',
      data: {
        id: cotizacion.id,
        cotizacion_id: cotizacionId,
        nombre: cotizacion.nombre,
        apellidos: cotizacion.apellidos
      }
    });

  } catch (error) {
    console.error('Error creando cotización:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener todas las cotizaciones (para administradores)
const obtenerCotizaciones = async (req, res) => {
  try {
    const result = await query(`
      SELECT id, cotizacion_id, nombre, apellidos, telefono, email, isapre_actual, 
             cuanto_paga, clinica_preferencia, renta_imponible, mensaje, 
             estado, fecha_envio
      FROM cotizacion 
      ORDER BY fecha_envio DESC
    `);

    res.json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error('Error obteniendo cotizaciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Consultar estado de cotización (público)
const consultarEstadoCotizacion = async (req, res) => {
  try {
    const { cotizacion_id } = req.params;

    const result = await query(`
      SELECT cotizacion_id, nombre, apellidos, estado, fecha_envio
      FROM cotizacion 
      WHERE cotizacion_id = $1
    `, [cotizacion_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Cotización no encontrada'
      });
    }

    const cotizacion = result.rows[0];

    res.json({
      success: true,
      data: {
        cotizacion_id: cotizacion.cotizacion_id,
        nombre: cotizacion.nombre,
        apellidos: cotizacion.apellidos,
        estado: cotizacion.estado,
        fecha_envio: cotizacion.fecha_envio
      }
    });

  } catch (error) {
    console.error('Error consultando estado:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Actualizar estado de cotización
const actualizarEstadoCotizacion = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    const estadosValidos = ['pendiente', 'en_revision', 'contactado', 'cotizado', 'cerrado'];
    
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({
        success: false,
        message: 'Estado no válido'
      });
    }

    const result = await query(`
      UPDATE cotizacion 
      SET estado = $1 
      WHERE id = $2 
      RETURNING id, nombre, apellidos, estado
    `, [estado, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Cotización no encontrada'
      });
    }

    res.json({
      success: true,
      message: 'Estado actualizado correctamente',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error actualizando estado:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Función para enviar emails
const sendEmail = async (emailData) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: emailData.to,
      subject: emailData.subject,
      html: emailData.html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email enviado:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error enviando email:', error);
    return false;
  }
};

module.exports = {
  crearCotizacion,
  obtenerCotizaciones,
  consultarEstadoCotizacion,
  actualizarEstadoCotizacion
}; 