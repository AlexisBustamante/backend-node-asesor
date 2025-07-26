const { query } = require('../config/database');
const nodemailer = require('nodemailer');
const { renderEmailCliente, renderEmailAdmin } = require('../utils/htmlRenderer');
require('dotenv').config();

// Crear nueva cotización
const crearCotizacion = async (req, res) => {
  try {
    // Mapear los campos del frontend a los nombres usados internamente
    const {
      nombre,
      apellidos,
      edad,
      telefono,
      email,
      isapre,
      valor_mensual,
      clinica,
      renta,
      numero_cargas,
      edades_cargas,
      mensaje
    } = req.body;


    // Validar campos requeridos (verificando que no estén vacíos)
    if (!nombre || nombre.trim() === '' || 
        !edad || edad.toString().trim() === '' || 
        !telefono || telefono.toString().trim() === '' || 
        !email || email.trim() === '' || 
        !isapre || isapre.trim() === '' || 
        !clinica || clinica.trim() === '' || 
        !renta || renta.toString().trim() === '' || 
        !numero_cargas || numero_cargas.toString().trim() === '' || 
        !edades_cargas || edades_cargas.toString().trim() === '') {
      
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
      INSERT INTO cotizacion (cotizacion_id, nombre, apellidos, edad, telefono, email, isapre, 
                             valor_mensual, clinica, renta, numero_cargas, edades_cargas, mensaje)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING id, cotizacion_id, nombre, apellidos, email, fecha_envio
    `, [cotizacionId, nombre, apellidos, edad, telefono, email, isapre, 
        valor_mensual, clinica, renta, numero_cargas, edades_cargas, mensaje]);

    const cotizacion = result.rows[0];

    // Preparar datos para el template del email del cliente
    const emailClienteData = {
      cotizacion_id: cotizacionId,
      nombre,
      apellidos,
      edad,
      telefono,
      email,
      isapre,
      valor_mensual,
      clinica,
      renta,
      numero_cargas,
      edades_cargas,
      mensaje
    };

    // Renderizar email del cliente
    const emailClienteHtml = await renderEmailCliente(emailClienteData);

    const emailCliente = {
      to: email,
      subject: `¡Tu solicitud de cotización ha sido recibida! [${cotizacionId}] - Pamela Cossio Asesoría`,
      html: emailClienteHtml
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
      
      // Preparar datos para el template del email del administrador
      const emailAdminData = {
        cotizacion_id: cotizacionId,
        nombre,
        apellidos,
        edad,
        telefono,
        email,
        isapre,
        valor_mensual,
        clinica,
        renta,
        numero_cargas,
        edades_cargas,
        mensaje,
        fecha_envio: new Date().toLocaleString('es-CL')
      };

      // Renderizar email del administrador
      const emailAdminHtml = await renderEmailAdmin(emailAdminData);
      
      const emailAdmin = {
        to: adminEmails.join(', '),
        subject: `🚨 Nueva cotización recibida [${cotizacionId}] - Sistema de Asesoría`,
        html: emailAdminHtml
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
      SELECT id, cotizacion_id, nombre, apellidos, edad, telefono, email, isapre, 
             valor_mensual, clinica, renta, numero_cargas, edades_cargas, mensaje, 
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