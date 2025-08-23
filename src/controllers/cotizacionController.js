const { query } = require('../config/database');
const nodemailer = require('nodemailer');
const { renderEmailCliente, renderEmailAdmin } = require('../utils/htmlRenderer');
const { body, validationResult } = require('express-validator');
require('dotenv').config();

// Validaciones para actualizar cotización
const actualizarCotizacionValidation = [
  body('nombre')
    .optional()
    .trim()
    .isLength({ min: 2, max: 150 })
    .withMessage('El nombre debe tener entre 2 y 150 caracteres'),
  body('apellidos')
    .optional()
    .trim(),
  body('edad')
    .optional()
    .isNumeric()
    .withMessage('La edad debe ser un número'),
  body('telefono')
    .optional()
    .matches(/^\+?[0-9\s\-\(\)]+$/)
    .withMessage('Formato de teléfono inválido'),
  body('email')
    .optional()
    .custom((value) => {
      if (value === '' || value === null || value === undefined) {
        return true; // Permitir valores vacíos
      }
      // Solo validar email si se proporciona un valor
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        throw new Error('Email inválido');
      }
      return true;
    })
    .withMessage('Email inválido'),
  body('isapre')
    .optional()
    .custom((value) => {
      if (value === '' || value === null || value === undefined) {
        return true; // Permitir valores vacíos
      }
      if (value.length < 2 || value.length > 100) {
        throw new Error('La ISAPRE debe tener entre 2 y 100 caracteres');
      }
      return true;
    })
    .withMessage('La ISAPRE debe tener entre 2 y 100 caracteres'),
  body('valor_mensual')
    .optional()
    .isNumeric()
    .withMessage('El valor mensual debe ser un número'),
  body('clinica')
    .optional()
    .custom((value) => {
      if (value === '' || value === null || value === undefined) {
        return true; // Permitir valores vacíos
      }
      if (value.length < 2 || value.length > 100) {
        throw new Error('La clínica debe tener entre 2 y 100 caracteres');
      }
      return true;
    })
    .withMessage('La clínica debe tener entre 2 y 100 caracteres'),
  body('renta')
    .optional()
    .isNumeric()
    .withMessage('La renta debe ser un número'),
  body('numero_cargas')
    .optional()
    .isNumeric()
    .withMessage('El número de cargas debe ser un número'),
  body('edades_cargas')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Las edades de cargas no pueden exceder 100 caracteres'),
  body('mensaje')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('El mensaje no puede exceder 1000 caracteres'),
  body('procedencia')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('La procedencia no puede exceder 255 caracteres'),
  body('tipo_ingreso')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('El tipo de ingreso no puede exceder 100 caracteres'),
  body('estado')
    .optional()
    .isIn(['pendiente', 'en_revision', 'contactado', 'cliente_ingresado', 'nunca_respondio', 'cotizado', 'cerrado'])
    .withMessage('Estado no válido')
];

// Crear nueva cotización (pública - con emails)
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
      mensaje,
      procedencia,
      tipo_ingreso
    } = req.body;


    // Validar longitud del nombre
    if (nombre.trim().length < 2 || nombre.trim().length > 150) {
      return res.status(400).json({
        success: false,
        message: 'El nombre debe tener entre 2 y 150 caracteres'
      });
    }

    // Validar campos obligatorios
    if (!email || email.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'El email es obligatorio'
      });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: 'El formato del email no es válido'
      });
    }

    // Asignar valores por defecto para campos opcionales
    const edadNum = edad && edad.toString().trim() !== '' ? parseInt(edad) || 0 : null;
    const telefonoFinal = telefono && telefono.toString().trim() !== '' ? telefono.toString().trim() : '';
    const rentaNum = renta && renta.toString().trim() !== '' ? parseInt(renta) || 0 : 0;
    const numeroCargasNum = numero_cargas && numero_cargas.toString().trim() !== '' ? parseInt(numero_cargas) || 0 : 0;
    const valorMensualNum = valor_mensual && valor_mensual.toString().trim() !== '' ? parseInt(valor_mensual) || 0 : 0;

    // Campos de texto con valores por defecto
    const apellidosFinal = apellidos && apellidos.toString().trim() !== '' ? apellidos.toString().trim() : '';
    const isapreFinal = isapre && isapre.toString().trim() !== '' ? isapre.toString().trim() : '';
    const clinicaFinal = clinica && clinica.toString().trim() !== '' ? clinica.toString().trim() : '';
    const edadesCargasFinal = edades_cargas && edades_cargas.toString().trim() !== '' ? edades_cargas.toString().trim() : '';
    const mensajeFinal = mensaje && mensaje.toString().trim() !== '' ? mensaje.toString().trim() : '';
    const procedenciaFinal = procedencia && procedencia.toString().trim() !== '' ? procedencia.toString().trim() : '';
    const tipoIngresoFinal = tipo_ingreso && tipo_ingreso.toString().trim() !== '' ? tipo_ingreso.toString().trim() : '';

    // Limpiar email
    const emailFinal = email.trim();

    // Generar ID único temporal basado en timestamp
    const fecha = new Date();
    const fechaStr = fecha.getFullYear().toString() + 
                    (fecha.getMonth() + 1).toString().padStart(2, '0') + 
                    (fecha.getDate()).toString().padStart(2, '0');
    const timestamp = Date.now().toString().slice(-6); // Últimos 6 dígitos del timestamp
    const cotizacionId = `COT-${fechaStr}-${timestamp}`;

    // Insertar cotización en la base de datos con el cotizacion_id generado
    const result = await query(`
      INSERT INTO cotizacion (cotizacion_id, nombre, apellidos, edad, telefono, email, isapre,
                             valor_mensual, clinica, renta, numero_cargas, edades_cargas, mensaje, procedencia, tipo_ingreso)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING id, nombre, apellidos, email, fecha_envio
    `, [cotizacionId, nombre, apellidosFinal, edadNum, telefonoFinal, emailFinal, isapreFinal,
        valorMensualNum, clinicaFinal, rentaNum, numeroCargasNum, edadesCargasFinal, mensajeFinal, procedenciaFinal, tipoIngresoFinal]);

    const cotizacion = result.rows[0];
    
    // Preparar datos para el template del email del cliente
    const emailClienteData = {
      cotizacion_id: cotizacionId,
      nombre,
      apellidos: apellidosFinal,
      edad: edadNum,
      telefono: telefonoFinal,
      email: emailFinal,
      isapre: isapreFinal,
      valor_mensual: valorMensualNum,
      clinica: clinicaFinal,
      renta: rentaNum,
      numero_cargas: numeroCargasNum,
      edades_cargas: edadesCargasFinal,
      mensaje: mensajeFinal,
      procedencia: procedenciaFinal,
      tipo_ingreso: tipoIngresoFinal
    };

    // Renderizar email del cliente
    const emailClienteHtml = await renderEmailCliente(emailClienteData);

    const emailCliente = {
      to: emailFinal,
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
        apellidos: apellidosFinal,
        edad: edadNum,
        telefono: telefonoFinal,
        email: emailFinal,
        isapre: isapreFinal,
        valor_mensual: valorMensualNum,
        clinica: clinicaFinal,
        renta: rentaNum,
        numero_cargas: numeroCargasNum,
        edades_cargas: edadesCargasFinal,
        mensaje: mensajeFinal,
        procedencia: procedenciaFinal,
        tipo_ingreso: tipoIngresoFinal,
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

// Crear nueva cotización desde panel de administración (sin emails)
const crearCotizacionAdmin = async (req, res) => {
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
      mensaje,
      procedencia,
      tipo_ingreso
    } = req.body;

    // Validar longitud del nombre
    if (nombre.trim().length < 2 || nombre.trim().length > 150) {
      return res.status(400).json({
        success: false,
        message: 'El nombre debe tener entre 2 y 150 caracteres'
      });
    }

    // Validar formato de email solo si se proporciona
    let emailFinal = '';
    if (email && email.trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        return res.status(400).json({
          success: false,
          message: 'El formato del email no es válido'
        });
      }
      emailFinal = email.trim();
    }

    // Asignar valores por defecto para campos opcionales
    const edadNum = edad && edad.toString().trim() !== '' ? parseInt(edad) || 0 : null;
    const telefonoFinal = telefono && telefono.toString().trim() !== '' ? telefono.toString().trim() : '';
    const rentaNum = renta && renta.toString().trim() !== '' ? parseInt(renta) || 0 : 0;
    const numeroCargasNum = numero_cargas && numero_cargas.toString().trim() !== '' ? parseInt(numero_cargas) || 0 : 0;
    const valorMensualNum = valor_mensual && valor_mensual.toString().trim() !== '' ? parseInt(valor_mensual) || 0 : 0;

    // Campos de texto con valores por defecto
    const apellidosFinal = apellidos && apellidos.toString().trim() !== '' ? apellidos.toString().trim() : '';
    const isapreFinal = isapre && isapre.toString().trim() !== '' ? isapre.toString().trim() : '';
    const clinicaFinal = clinica && clinica.toString().trim() !== '' ? clinica.toString().trim() : '';
    const edadesCargasFinal = edades_cargas && edades_cargas.toString().trim() !== '' ? edades_cargas.toString().trim() : '';
    const mensajeFinal = mensaje && mensaje.toString().trim() !== '' ? mensaje.toString().trim() : '';
    const procedenciaFinal = procedencia && procedencia.toString().trim() !== '' ? procedencia.toString().trim() : '';
    const tipoIngresoFinal = tipo_ingreso && tipo_ingreso.toString().trim() !== '' ? tipo_ingreso.toString().trim() : '';

    // Generar ID único temporal basado en timestamp
    const fecha = new Date();
    const fechaStr = fecha.getFullYear().toString() + 
                    (fecha.getMonth() + 1).toString().padStart(2, '0') + 
                    (fecha.getDate()).toString().padStart(2, '0');
    const timestamp = Date.now().toString().slice(-6); // Últimos 6 dígitos del timestamp
    const cotizacionId = `COT-${fechaStr}-${timestamp}`;

    // Insertar cotización en la base de datos con el cotizacion_id generado
    const result = await query(`
      INSERT INTO cotizacion (cotizacion_id, nombre, apellidos, edad, telefono, email, isapre,
                             valor_mensual, clinica, renta, numero_cargas, edades_cargas, mensaje, procedencia, tipo_ingreso)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING id, nombre, apellidos, email, fecha_envio
    `, [cotizacionId, nombre, apellidosFinal, edadNum, telefonoFinal, emailFinal, isapreFinal,
        valorMensualNum, clinicaFinal, rentaNum, numeroCargasNum, edadesCargasFinal, mensajeFinal, procedenciaFinal, tipoIngresoFinal]);

    const cotizacion = result.rows[0];
    
    res.status(201).json({
      success: true,
      message: 'Cotización creada exitosamente desde el panel de administración.',
      data: {
        id: cotizacion.id,
        cotizacion_id: cotizacionId,
        nombre: cotizacion.nombre,
        apellidos: cotizacion.apellidos,
        email: cotizacion.email,
        fecha_envio: cotizacion.fecha_envio
      }
    });

  } catch (error) {
    console.error('Error creando cotización desde admin:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener todas las cotizaciones (para administradores)
const obtenerCotizaciones = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const estado = req.query.estado || '';
    const isapre = req.query.isapre || '';
    const clinica = req.query.clinica || '';
    const procedencia = req.query.procedencia || '';
    const tipo_ingreso = req.query.tipo_ingreso || '';
    const fechaDesde = req.query.fechaDesde || '';
    const fechaHasta = req.query.fechaHasta || '';

    let whereConditions = [];
    let queryParams = [];
    let paramCount = 0;

    // Filtro de búsqueda
    if (search) {
      paramCount++;
      whereConditions.push(`(c.nombre ILIKE $${paramCount} OR c.apellidos ILIKE $${paramCount} OR c.email ILIKE $${paramCount} OR c.cotizacion_id ILIKE $${paramCount})`);
      queryParams.push(`%${search}%`);
    }

    // Filtro por estado
    if (estado) {
      paramCount++;
      whereConditions.push(`c.estado = $${paramCount}`);
      queryParams.push(estado);
    }

    // Filtro por ISAPRE
    if (isapre) {
      paramCount++;
      whereConditions.push(`c.isapre ILIKE $${paramCount}`);
      queryParams.push(`%${isapre}%`);
    }

    // Filtro por clínica
    if (clinica) {
      paramCount++;
      whereConditions.push(`c.clinica ILIKE $${paramCount}`);
      queryParams.push(`%${clinica}%`);
    }

    // Filtro por procedencia
    if (procedencia) {
      paramCount++;
      whereConditions.push(`c.procedencia ILIKE $${paramCount}`);
      queryParams.push(`%${procedencia}%`);
    }

    // Filtro por tipo de ingreso
    if (tipo_ingreso) {
      paramCount++;
      whereConditions.push(`c.tipo_ingreso ILIKE $${paramCount}`);
      queryParams.push(`%${tipo_ingreso}%`);
    }

    // Filtro por fecha desde
    if (fechaDesde) {
      paramCount++;
      whereConditions.push(`DATE(c.fecha_envio) >= $${paramCount}`);
      queryParams.push(fechaDesde);
    }

    // Filtro por fecha hasta
    if (fechaHasta) {
      paramCount++;
      whereConditions.push(`DATE(c.fecha_envio) <= $${paramCount}`);
      queryParams.push(fechaHasta);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Query para contar total de registros
    const countQuery = `
      SELECT COUNT(*) as total
      FROM cotizacion c
      ${whereClause}
    `;
    const countResult = await query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].total);

    // Query principal
    const mainQuery = `
      SELECT 
        c.id, 
        c.cotizacion_id, 
        c.nombre, 
        c.apellidos, 
        c.edad, 
        c.telefono, 
        c.email, 
        c.isapre, 
        c.valor_mensual, 
        c.clinica, 
        c.renta, 
        c.numero_cargas, 
        c.edades_cargas, 
        c.mensaje, 
        c.procedencia,
        c.tipo_ingreso,
        c.estado, 
        c.fecha_envio
      FROM cotizacion c
      ${whereClause}
      ORDER BY c.fecha_envio DESC
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;
    
    queryParams.push(limit, offset);
    const result = await query(mainQuery, queryParams);

    // Obtener estadísticas adicionales
    const statsQuery = `
      SELECT 
        COUNT(*) as total_cotizaciones,
        COUNT(CASE WHEN estado = 'pendiente' THEN 1 END) as pendientes,
        COUNT(CASE WHEN estado = 'en_revision' THEN 1 END) as en_revision,
        COUNT(CASE WHEN estado = 'contactado' THEN 1 END) as contactados,
        COUNT(CASE WHEN estado = 'cotizado' THEN 1 END) as cotizados,
        COUNT(CASE WHEN estado = 'cerrado' THEN 1 END) as cerrados,
        COUNT(CASE WHEN DATE(fecha_envio) >= DATE_TRUNC('month', CURRENT_DATE) THEN 1 END) as cotizaciones_este_mes,
        COUNT(CASE WHEN DATE(fecha_envio) >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as cotizaciones_esta_semana,
        COUNT(CASE WHEN DATE(fecha_envio) = CURRENT_DATE THEN 1 END) as cotizaciones_hoy
      FROM cotizacion
    `;
    const statsResult = await query(statsQuery);

    // Obtener estadísticas por mes de los últimos 6 meses
    const statsPorMesQuery = `
      SELECT 
        TO_CHAR(DATE_TRUNC('month', fecha_envio), 'YYYY-MM') as mes,
        COUNT(*) as total,
        COUNT(CASE WHEN estado = 'pendiente' THEN 1 END) as pendientes,
        COUNT(CASE WHEN estado = 'en_revision' THEN 1 END) as en_revision,
        COUNT(CASE WHEN estado = 'contactado' THEN 1 END) as contactados,
        COUNT(CASE WHEN estado = 'cliente_ingresado' THEN 1 END) as cliente_ingresado,
        COUNT(CASE WHEN estado = 'nunca_respondio' THEN 1 END) as nunca_respondio,
        COUNT(CASE WHEN estado = 'cotizado' THEN 1 END) as cotizados,
        COUNT(CASE WHEN estado = 'cerrado' THEN 1 END) as cerrados
      FROM cotizacion 
      WHERE fecha_envio >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '5 months')
      GROUP BY DATE_TRUNC('month', fecha_envio)
      ORDER BY mes DESC
    `;
    const statsPorMesResult = await query(statsPorMesQuery);

    // Obtener estadísticas de ISAPREs más solicitadas este mes
    const isapresEsteMesQuery = `
      SELECT 
        isapre,
        COUNT(*) as cantidad
      FROM cotizacion 
      WHERE DATE(fecha_envio) >= DATE_TRUNC('month', CURRENT_DATE)
        AND isapre IS NOT NULL AND isapre != ''
      GROUP BY isapre 
      ORDER BY cantidad DESC 
      LIMIT 5
    `;
    const isapresEsteMesResult = await query(isapresEsteMesQuery);

    // Obtener estadísticas de clínicas más solicitadas este mes
    const clinicasEsteMesQuery = `
      SELECT 
        clinica,
        COUNT(*) as cantidad
      FROM cotizacion 
      WHERE DATE(fecha_envio) >= DATE_TRUNC('month', CURRENT_DATE)
        AND clinica IS NOT NULL AND clinica != ''
      GROUP BY clinica 
      ORDER BY cantidad DESC 
      LIMIT 5
    `;
    const clinicasEsteMesResult = await query(clinicasEsteMesQuery);

    res.json({
      success: true,
      data: {
        cotizaciones: result.rows,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        },
        stats: {
          ...statsResult.rows[0],
          porMes: statsPorMesResult.rows,
          isapresEsteMes: isapresEsteMesResult.rows,
          clinicasEsteMes: clinicasEsteMesResult.rows
        }
      }
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

// Obtener cotización por ID
const obtenerCotizacionPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(`
      SELECT id, cotizacion_id, nombre, apellidos, edad, telefono, email, isapre, 
             valor_mensual, clinica, renta, numero_cargas, edades_cargas, mensaje, 
             procedencia, tipo_ingreso, estado, fecha_envio
      FROM cotizacion 
      WHERE id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Cotización no encontrada'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error obteniendo cotización:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Actualizar cotización completa
const actualizarCotizacion = async (req, res) => {
  try {
    console.log('=== ACTUALIZAR COTIZACIÓN ===');
    console.log('Params:', req.params);
    console.log('Body:', req.body);
    console.log('Headers:', req.headers);
    
    // Verificar errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Errores de validación:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
        errors: errors.array()
      });
    }

    const { id } = req.params;
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
      mensaje,
      procedencia,
      tipo_ingreso,
      estado
    } = req.body;

    // Verificar si la cotización existe
    const existingCotizacion = await query('SELECT id FROM cotizacion WHERE id = $1', [id]);
    if (existingCotizacion.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Cotización no encontrada'
      });
    }

    // Construir query de actualización dinámicamente
    let updateFields = [];
    let queryParams = [];
    let paramCount = 0;

    if (nombre !== undefined) {
      paramCount++;
      updateFields.push(`nombre = $${paramCount}`);
      queryParams.push(nombre);
    }

    if (apellidos !== undefined) {
      paramCount++;
      updateFields.push(`apellidos = $${paramCount}`);
      queryParams.push(apellidos); // Mantener el valor tal como viene (incluyendo string vacío)
    }

    if (edad !== undefined) {
      paramCount++;
      updateFields.push(`edad = $${paramCount}`);
      queryParams.push(edad);
    }

    if (telefono !== undefined) {
      paramCount++;
      updateFields.push(`telefono = $${paramCount}`);
      queryParams.push(telefono); // Mantener el valor tal como viene (incluyendo string vacío)
    }

    if (email !== undefined) {
      paramCount++;
      updateFields.push(`email = $${paramCount}`);
      queryParams.push(email); // Mantener el valor tal como viene (incluyendo string vacío)
    }

    if (isapre !== undefined) {
      paramCount++;
      updateFields.push(`isapre = $${paramCount}`);
      queryParams.push(isapre); // Mantener el valor tal como viene (incluyendo string vacío)
    }

    if (valor_mensual !== undefined) {
      paramCount++;
      updateFields.push(`valor_mensual = $${paramCount}`);
      queryParams.push(valor_mensual);
    }

    if (clinica !== undefined) {
      paramCount++;
      updateFields.push(`clinica = $${paramCount}`);
      queryParams.push(clinica); // Mantener el valor tal como viene (incluyendo string vacío)
    }

    if (renta !== undefined) {
      paramCount++;
      updateFields.push(`renta = $${paramCount}`);
      queryParams.push(renta);
    }

    if (numero_cargas !== undefined) {
      paramCount++;
      updateFields.push(`numero_cargas = $${paramCount}`);
      queryParams.push(numero_cargas);
    }

    if (edades_cargas !== undefined) {
      paramCount++;
      updateFields.push(`edades_cargas = $${paramCount}`);
      queryParams.push(edades_cargas); // Mantener el valor tal como viene (incluyendo string vacío)
    }

    if (mensaje !== undefined) {
      paramCount++;
      updateFields.push(`mensaje = $${paramCount}`);
      queryParams.push(mensaje); // Mantener el valor tal como viene (incluyendo string vacío)
    }

    if (procedencia !== undefined) {
      paramCount++;
      updateFields.push(`procedencia = $${paramCount}`);
      queryParams.push(procedencia); // Mantener el valor tal como viene (incluyendo string vacío)
    }

    if (tipo_ingreso !== undefined) {
      paramCount++;
      updateFields.push(`tipo_ingreso = $${paramCount}`);
      queryParams.push(tipo_ingreso); // Mantener el valor tal como viene (incluyendo string vacío)
    }

    if (estado !== undefined) {
      // Validar estado
      const estadosValidos = ['pendiente', 'en_revision', 'contactado', 'cliente_ingresado', 'nunca_respondio', 'cotizado', 'cerrado'];
      if (!estadosValidos.includes(estado)) {
        return res.status(400).json({
          success: false,
          message: 'Estado no válido'
        });
      }
      paramCount++;
      updateFields.push(`estado = $${paramCount}`);
      queryParams.push(estado);
    }

    if (updateFields.length === 0) {
      console.log('No se proporcionaron campos para actualizar');
      return res.status(400).json({
        success: false,
        message: 'No se proporcionaron campos para actualizar'
      });
    }

    // Agregar ID de la cotización
    paramCount++;
    queryParams.push(id);

    const updateQuery = `
      UPDATE cotizacion 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, cotizacion_id, nombre, apellidos, edad, telefono, email, 
                isapre, valor_mensual, clinica, renta, numero_cargas, 
                edades_cargas, mensaje, procedencia, tipo_ingreso, estado, fecha_envio
    `;

    console.log('Query de actualización:', updateQuery);
    console.log('Parámetros:', queryParams);

    const result = await query(updateQuery, queryParams);
    console.log('Resultado de la query:', result.rows);
    
    const cotizacion = result.rows[0];

    console.log('Cotización actualizada:', cotizacion);
    console.log('=== FIN ACTUALIZAR COTIZACIÓN ===');

    res.json({
      success: true,
      message: 'Cotización actualizada exitosamente',
      data: cotizacion
    });

  } catch (error) {
    console.error('Error actualizando cotización:', error);
    
    // Manejar errores específicos de base de datos
    if (error.code === '23505') { // Unique violation
      return res.status(400).json({
        success: false,
        message: 'Ya existe una cotización con estos datos'
      });
    }
    
    if (error.code === '23502') { // Not null violation
      return res.status(400).json({
        success: false,
        message: 'Faltan campos requeridos'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Función de prueba para debugging
const testUpdate = async (req, res) => {
  try {
    console.log('Body recibido:', req.body);
    console.log('Params recibidos:', req.params);
    
    res.json({
      success: true,
      message: 'Test endpoint funcionando',
      body: req.body,
      params: req.params
    });
  } catch (error) {
    console.error('Error en test:', error);
    res.status(500).json({
      success: false,
      message: 'Error en test',
      error: error.message
    });
  }
};

// Función de actualización sin validaciones para debugging
const actualizarCotizacionSimple = async (req, res) => {
  try {
    console.log('=== ACTUALIZAR COTIZACIÓN SIMPLE ===');
    console.log('Params:', req.params);
    console.log('Body:', req.body);
    
    const { id } = req.params;
    const updateData = req.body;
    
    // Verificar si la cotización existe
    const existingCotizacion = await query('SELECT id FROM cotizacion WHERE id = $1', [id]);
    if (existingCotizacion.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Cotización no encontrada'
      });
    }
    
    // Construir query de actualización dinámicamente
    let updateFields = [];
    let queryParams = [];
    let paramCount = 0;
    
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined && updateData[key] !== null) {
        paramCount++;
        updateFields.push(`${key} = $${paramCount}`);
        queryParams.push(updateData[key]);
      }
    });
    
    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No se proporcionaron campos para actualizar'
      });
    }
    
    // Agregar ID de la cotización
    paramCount++;
    queryParams.push(id);
    
    const updateQuery = `
      UPDATE cotizacion 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;
    
    console.log('Query:', updateQuery);
    console.log('Parámetros:', queryParams);
    
    const result = await query(updateQuery, queryParams);
    const cotizacion = result.rows[0];
    
    console.log('Resultado:', cotizacion);
    console.log('=== FIN ACTUALIZAR COTIZACIÓN SIMPLE ===');
    
    res.json({
      success: true,
      message: 'Cotización actualizada exitosamente',
      data: cotizacion
    });
    
  } catch (error) {
    console.error('Error en actualización simple:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Actualizar estado de cotización
const actualizarEstadoCotizacion = async (req, res) => {
  try {
    console.log('🔍 Debug - actualizarEstadoCotizacion iniciado');
    console.log('📝 Parámetros:', req.params);
    console.log('📦 Body:', req.body);
    console.log('👤 Usuario:', req.user);

    const { id } = req.params;
    const { estado } = req.body;

    console.log('🆔 ID recibido:', id);
    console.log('📊 Estado recibido:', estado);

    const estadosValidos = ['pendiente', 'en_revision', 'contactado', 'cliente_ingresado', 'nunca_respondio', 'cotizado', 'cerrado'];
    
    if (!estadosValidos.includes(estado)) {
      console.log('❌ Estado no válido:', estado);
      return res.status(400).json({
        success: false,
        message: 'Estado no válido'
      });
    }

    console.log('✅ Estado válido, ejecutando query...');

    const result = await query(`
      UPDATE cotizacion 
      SET estado = $1 
      WHERE id = $2 
      RETURNING id, nombre, apellidos, estado
    `, [estado, id]);

    console.log('📊 Resultado de la query:', result.rows);

    if (result.rows.length === 0) {
      console.log('❌ Cotización no encontrada con ID:', id);
      return res.status(404).json({
        success: false,
        message: 'Cotización no encontrada'
      });
    }

    console.log('✅ Estado actualizado exitosamente');

    res.json({
      success: true,
      message: 'Estado actualizado correctamente',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('💥 Error actualizando estado:', error);
    console.error('📋 Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Obtener estadísticas generales
const obtenerEstadisticas = async (req, res) => {
  try {
    // Obtener estadísticas generales
    const statsQuery = `
      SELECT 
        COUNT(*) as total_cotizaciones,
        COUNT(CASE WHEN estado = 'pendiente' THEN 1 END) as pendientes,
        COUNT(CASE WHEN estado = 'en_revision' THEN 1 END) as en_revision,
        COUNT(CASE WHEN estado = 'contactado' THEN 1 END) as contactados,
        COUNT(CASE WHEN estado = 'cliente_ingresado' THEN 1 END) as cliente_ingresado,
        COUNT(CASE WHEN estado = 'nunca_respondio' THEN 1 END) as nunca_respondio,
        COUNT(CASE WHEN estado = 'cotizado' THEN 1 END) as cotizados,
        COUNT(CASE WHEN estado = 'cerrado' THEN 1 END) as cerrados,
        COUNT(CASE WHEN DATE(fecha_envio) >= DATE_TRUNC('month', CURRENT_DATE) THEN 1 END) as cotizaciones_este_mes,
        COUNT(CASE WHEN DATE(fecha_envio) >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as cotizaciones_esta_semana,
        COUNT(CASE WHEN DATE(fecha_envio) = CURRENT_DATE THEN 1 END) as cotizaciones_hoy
      FROM cotizacion
    `;
    const statsResult = await query(statsQuery);

    // Obtener estadísticas por mes de los últimos 6 meses
    const statsPorMesQuery = `
      SELECT 
        TO_CHAR(DATE_TRUNC('month', fecha_envio), 'YYYY-MM') as mes,
        COUNT(*) as total,
        COUNT(CASE WHEN estado = 'pendiente' THEN 1 END) as pendientes,
        COUNT(CASE WHEN estado = 'en_revision' THEN 1 END) as en_revision,
        COUNT(CASE WHEN estado = 'contactado' THEN 1 END) as contactados,
        COUNT(CASE WHEN estado = 'cliente_ingresado' THEN 1 END) as cliente_ingresado,
        COUNT(CASE WHEN estado = 'nunca_respondio' THEN 1 END) as nunca_respondio,
        COUNT(CASE WHEN estado = 'cotizado' THEN 1 END) as cotizados,
        COUNT(CASE WHEN estado = 'cerrado' THEN 1 END) as cerrados
      FROM cotizacion 
      WHERE fecha_envio >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '5 months')
      GROUP BY DATE_TRUNC('month', fecha_envio)
      ORDER BY mes DESC
    `;
    const statsPorMesResult = await query(statsPorMesQuery);

    // Obtener estadísticas de ISAPREs más solicitadas este mes
    const isapresEsteMesQuery = `
      SELECT 
        isapre,
        COUNT(*) as cantidad
      FROM cotizacion 
      WHERE DATE(fecha_envio) >= DATE_TRUNC('month', CURRENT_DATE)
        AND isapre IS NOT NULL AND isapre != ''
      GROUP BY isapre 
      ORDER BY cantidad DESC 
      LIMIT 5
    `;
    const isapresEsteMesResult = await query(isapresEsteMesQuery);

    // Obtener estadísticas de clínicas más solicitadas este mes
    const clinicasEsteMesQuery = `
      SELECT 
        clinica,
        COUNT(*) as cantidad
      FROM cotizacion 
      WHERE DATE(fecha_envio) >= DATE_TRUNC('month', CURRENT_DATE)
        AND clinica IS NOT NULL AND clinica != ''
      GROUP BY clinica 
      ORDER BY cantidad DESC 
      LIMIT 5
    `;
    const clinicasEsteMesResult = await query(clinicasEsteMesQuery);

    // Obtener estadísticas por procedencia (total)
    const procedenciaTotalQuery = `
      SELECT 
        COALESCE(procedencia, 'Sin especificar') as procedencia,
        COUNT(*) as cantidad
      FROM cotizacion 
      WHERE procedencia IS NOT NULL AND procedencia != ''
      GROUP BY procedencia 
      ORDER BY cantidad DESC
    `;
    const procedenciaTotalResult = await query(procedenciaTotalQuery);

    // Obtener estadísticas por procedencia este mes
    const procedenciaEsteMesQuery = `
      SELECT 
        COALESCE(procedencia, 'Sin especificar') as procedencia,
        COUNT(*) as cantidad
      FROM cotizacion 
      WHERE DATE(fecha_envio) >= DATE_TRUNC('month', CURRENT_DATE)
        AND procedencia IS NOT NULL AND procedencia != ''
      GROUP BY procedencia 
      ORDER BY cantidad DESC
    `;
    const procedenciaEsteMesResult = await query(procedenciaEsteMesQuery);

    // Obtener estadísticas por procedencia esta semana
    const procedenciaEstaSemanaQuery = `
      SELECT 
        COALESCE(procedencia, 'Sin especificar') as procedencia,
        COUNT(*) as cantidad
      FROM cotizacion 
      WHERE DATE(fecha_envio) >= CURRENT_DATE - INTERVAL '7 days'
        AND procedencia IS NOT NULL AND procedencia != ''
      GROUP BY procedencia 
      ORDER BY cantidad DESC
    `;
    const procedenciaEstaSemanaResult = await query(procedenciaEstaSemanaQuery);

    // Contar específicamente Instagram, Facebook, Página Web y WhatsApp
    const procedenciaEspecificaQuery = `
      SELECT 
        COUNT(CASE WHEN LOWER(procedencia) LIKE '%instagram%' THEN 1 END) as instagram,
        COUNT(CASE WHEN LOWER(procedencia) LIKE '%facebook%' OR LOWER(procedencia) LIKE '%fb%' THEN 1 END) as facebook,
        COUNT(CASE WHEN LOWER(procedencia) LIKE '%pagina%' OR LOWER(procedencia) LIKE '%web%' OR LOWER(procedencia) LIKE '%sitio%' THEN 1 END) as pagina_web,
        COUNT(CASE WHEN LOWER(procedencia) LIKE '%whatsapp%' OR LOWER(procedencia) LIKE '%wsp%' OR LOWER(procedencia) LIKE '%wa%' THEN 1 END) as whatsapp,
        COUNT(CASE WHEN procedencia IS NULL OR procedencia = '' THEN 1 END) as sin_especificar
      FROM cotizacion
    `;
    const procedenciaEspecificaResult = await query(procedenciaEspecificaQuery);

    // Contar específicamente Instagram, Facebook, Página Web y WhatsApp este mes
    const procedenciaEspecificaEsteMesQuery = `
      SELECT 
        COUNT(CASE WHEN LOWER(procedencia) LIKE '%instagram%' THEN 1 END) as instagram,
        COUNT(CASE WHEN LOWER(procedencia) LIKE '%facebook%' OR LOWER(procedencia) LIKE '%fb%' THEN 1 END) as facebook,
        COUNT(CASE WHEN LOWER(procedencia) LIKE '%pagina%' OR LOWER(procedencia) LIKE '%web%' OR LOWER(procedencia) LIKE '%sitio%' THEN 1 END) as pagina_web,
        COUNT(CASE WHEN LOWER(procedencia) LIKE '%whatsapp%' OR LOWER(procedencia) LIKE '%wsp%' OR LOWER(procedencia) LIKE '%wa%' THEN 1 END) as whatsapp,
        COUNT(CASE WHEN procedencia IS NULL OR procedencia = '' THEN 1 END) as sin_especificar
      FROM cotizacion
      WHERE DATE(fecha_envio) >= DATE_TRUNC('month', CURRENT_DATE)
    `;
    const procedenciaEspecificaEsteMesResult = await query(procedenciaEspecificaEsteMesQuery);

    res.json({
      success: true,
      data: {
        ...statsResult.rows[0],
        porMes: statsPorMesResult.rows,
        isapresEsteMes: isapresEsteMesResult.rows,
        clinicasEsteMes: clinicasEsteMesResult.rows,
        procedenciaTotal: procedenciaTotalResult.rows,
        procedenciaEsteMes: procedenciaEsteMesResult.rows,
        procedenciaEstaSemana: procedenciaEstaSemanaResult.rows,
        procedenciaEspecifica: procedenciaEspecificaResult.rows[0],
        procedenciaEspecificaEsteMes: procedenciaEspecificaEsteMesResult.rows[0]
      }
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener opciones de filtros
const obtenerOpcionesFiltros = async (req, res) => {
  try {
    // Obtener ISAPREs únicas
    const isapresResult = await query(`
      SELECT DISTINCT isapre 
      FROM cotizacion 
      WHERE isapre IS NOT NULL AND isapre != ''
      ORDER BY isapre
    `);

    // Obtener clínicas únicas
    const clinicasResult = await query(`
      SELECT DISTINCT clinica 
      FROM cotizacion 
      WHERE clinica IS NOT NULL AND clinica != ''
      ORDER BY clinica
    `);

    // Obtener procedencias únicas
    const procedenciasResult = await query(`
      SELECT DISTINCT procedencia 
      FROM cotizacion 
      WHERE procedencia IS NOT NULL AND procedencia != ''
      ORDER BY procedencia
    `);

    // Obtener tipos de ingreso únicos
    const tiposIngresoResult = await query(`
      SELECT DISTINCT tipo_ingreso 
      FROM cotizacion 
      WHERE tipo_ingreso IS NOT NULL AND tipo_ingreso != ''
      ORDER BY tipo_ingreso
    `);

    // Estados disponibles
    const estados = [
      { value: 'pendiente', label: 'Pendiente', description: 'Cotización recibida, pendiente de revisión', icon: '⏳' },
      { value: 'en_revision', label: 'En Revisión', description: 'Analizando información del cliente', icon: '👁️' },
      { value: 'contactado', label: 'Contactado', description: 'Cliente contactado para más información', icon: '📞' },
      { value: 'cliente_ingresado', label: 'Cliente Ingresado', description: 'Cliente ha ingresado al sistema', icon: '👤' },
      { value: 'nunca_respondio', label: 'Nunca Respondió', description: 'Cliente no ha respondido a contactos', icon: '❌' },
      { value: 'cotizado', label: 'Cotizado', description: 'Cotización enviada al cliente', icon: '✅' },
      { value: 'cerrado', label: 'Cerrado', description: 'Proceso completado o cancelado', icon: '🔒' }
    ];

    res.json({
      success: true,
      data: {
        isapres: isapresResult.rows.map(row => row.isapre),
        clinicas: clinicasResult.rows.map(row => row.clinica),
        procedencias: procedenciasResult.rows.map(row => row.procedencia),
        tipos_ingreso: tiposIngresoResult.rows.map(row => row.tipo_ingreso),
        estados: estados
      }
    });

  } catch (error) {
    console.error('Error obteniendo opciones de filtros:', error);
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

// Eliminar cotización
const eliminarCotizacion = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si la cotización existe usando cotizacion_id
    const existingCotizacion = await query('SELECT id, cotizacion_id, nombre, email FROM cotizacion WHERE cotizacion_id = $1', [id]);
    if (existingCotizacion.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Cotización no encontrada'
      });
    }

    const cotizacion = existingCotizacion.rows[0];

    // Eliminar cotización usando el id interno
    await query('DELETE FROM cotizacion WHERE id = $1', [cotizacion.id]);

    res.json({
      success: true,
      message: 'Cotización eliminada exitosamente',
      data: {
        cotizacion_id: cotizacion.cotizacion_id,
        nombre: cotizacion.nombre,
        email: cotizacion.email
      }
    });

  } catch (error) {
    console.error('Error eliminando cotización:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

module.exports = {
  crearCotizacion,
  crearCotizacionAdmin,
  obtenerCotizaciones,
  obtenerCotizacionPorId,
  consultarEstadoCotizacion,
  actualizarEstadoCotizacion,
  obtenerOpcionesFiltros,
  obtenerEstadisticas,
  actualizarCotizacion,
  actualizarCotizacionValidation,
  testUpdate,
  actualizarCotizacionSimple,
  eliminarCotizacion
}; 