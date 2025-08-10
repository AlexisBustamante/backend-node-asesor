const { query } = require('../config/database');
const { body, validationResult } = require('express-validator');

// Validaciones para crear comentario (público)
const crearComentarioValidation = [
  body('nombre')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
  body('estrellas')
    .isInt({ min: 1, max: 5 })
    .withMessage('Las estrellas deben ser un número entre 1 y 5'),
  body('comentario')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('El comentario debe tener entre 10 y 1000 caracteres')
];

// Validaciones para crear comentario desde admin
const crearComentarioAdminValidation = [
  body('nombre')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
  body('estrellas')
    .isInt({ min: 1, max: 5 })
    .withMessage('Las estrellas deben ser un número entre 1 y 5'),
  body('comentario')
    .trim()
    .isLength({ min: 0, max: 1000 })
    .withMessage('El comentario debe tener entre 10 y 1000 caracteres'),
  body('ver')
    .optional()
    .isBoolean()
    .withMessage('El campo ver debe ser true o false')
];

// Validaciones para actualizar comentario
const actualizarComentarioValidation = [
  body('nombre')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
  body('estrellas')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Las estrellas deben ser un número entre 1 y 5'),
  body('comentario')
    .optional()
    .trim()
    .isLength({ min: 0, max: 1000 })
    .withMessage('El comentario debe tener entre 10 y 1000 caracteres'),
  body('ver')
    .optional()
    .isBoolean()
    .withMessage('El campo ver debe ser true o false')
];

// Crear comentario (público)
const crearComentario = async (req, res) => {
  try {
    // Verificar errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
        errors: errors.array()
      });
    }

    const { nombre, estrellas, comentario } = req.body;

    // Insertar comentario en la base de datos (por defecto ver = false)
    const result = await query(`
      INSERT INTO comentarios (nombre, estrellas, comentario, ver)
      VALUES ($1, $2, $3, false)
      RETURNING id, nombre, estrellas, comentario, ver, fecha_creacion
    `, [nombre, estrellas, comentario]);

    const comentarioCreado = result.rows[0];

    res.status(201).json({
      success: true,
      message: 'Comentario enviado exitosamente. Será revisado por nuestro equipo.',
      data: {
        id: comentarioCreado.id,
        nombre: comentarioCreado.nombre,
        estrellas: comentarioCreado.estrellas,
        comentario: comentarioCreado.comentario,
        fecha_creacion: comentarioCreado.fecha_creacion
      }
    });

  } catch (error) {
    console.error('Error creando comentario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Crear comentario desde panel de administración
const crearComentarioAdmin = async (req, res) => {
  try {
    // Verificar errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
        errors: errors.array()
      });
    }

    const { nombre, estrellas, comentario, ver = false } = req.body;

    // Insertar comentario en la base de datos
    const result = await query(`
      INSERT INTO comentarios (nombre, estrellas, comentario, ver)
      VALUES ($1, $2, $3, $4)
      RETURNING id, nombre, estrellas, comentario, ver, fecha_creacion
    `, [nombre, estrellas, comentario, ver]);

    const comentarioCreado = result.rows[0];

    res.status(201).json({
      success: true,
      message: 'Comentario creado exitosamente desde el panel de administración.',
      data: comentarioCreado
    });

  } catch (error) {
    console.error('Error creando comentario desde admin:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener comentarios públicos (solo los que tienen ver = true)
const obtenerComentariosPublicos = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Query para contar total de comentarios públicos
    const countQuery = `
      SELECT COUNT(*) as total
      FROM comentarios
      WHERE ver = true
    `;
    const countResult = await query(countQuery);
    const total = parseInt(countResult.rows[0].total);

    // Query principal para obtener comentarios públicos
    const mainQuery = `
      SELECT 
        id, 
        nombre, 
        estrellas, 
        comentario, 
        fecha_creacion
      FROM comentarios
      WHERE ver = true
      ORDER BY fecha_creacion DESC
      LIMIT $1 OFFSET $2
    `;
    
    const result = await query(mainQuery, [limit, offset]);

    // Calcular promedio de estrellas
    const avgQuery = `
      SELECT AVG(estrellas) as promedio_estrellas
      FROM comentarios
      WHERE ver = true
    `;
    const avgResult = await query(avgQuery);
    const promedioEstrellas = parseFloat(avgResult.rows[0].promedio_estrellas) || 0;

    res.json({
      success: true,
      data: {
        comentarios: result.rows,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        },
        estadisticas: {
          promedio_estrellas: Math.round(promedioEstrellas * 10) / 10,
          total_comentarios: total
        }
      }
    });

  } catch (error) {
    console.error('Error obteniendo comentarios públicos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener todos los comentarios (para administradores)
const obtenerComentarios = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const ver = req.query.ver || '';
    const estrellas = req.query.estrellas || '';

    let whereConditions = [];
    let queryParams = [];
    let paramCount = 0;

    // Filtro de búsqueda
    if (search) {
      paramCount++;
      whereConditions.push(`(nombre ILIKE $${paramCount} OR comentario ILIKE $${paramCount})`);
      queryParams.push(`%${search}%`);
    }

    // Filtro por visibilidad
    if (ver !== '') {
      paramCount++;
      whereConditions.push(`ver = $${paramCount}`);
      queryParams.push(ver === 'true');
    }

    // Filtro por estrellas
    if (estrellas) {
      paramCount++;
      whereConditions.push(`estrellas = $${paramCount}`);
      queryParams.push(parseInt(estrellas));
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Query para contar total de registros
    const countQuery = `
      SELECT COUNT(*) as total
      FROM comentarios
      ${whereClause}
    `;
    const countResult = await query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].total);

    // Query principal
    const mainQuery = `
      SELECT 
        id, 
        nombre, 
        estrellas, 
        comentario, 
        ver, 
        fecha_creacion,
        fecha_actualizacion
      FROM comentarios
      ${whereClause}
      ORDER BY fecha_creacion DESC
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;
    
    queryParams.push(limit, offset);
    const result = await query(mainQuery, queryParams);

    // Obtener estadísticas
    const statsQuery = `
      SELECT 
        COUNT(*) as total_comentarios,
        COUNT(CASE WHEN ver = true THEN 1 END) as comentarios_visibles,
        COUNT(CASE WHEN ver = false THEN 1 END) as comentarios_ocultos,
        AVG(estrellas) as promedio_estrellas,
        COUNT(CASE WHEN estrellas = 5 THEN 1 END) as cinco_estrellas,
        COUNT(CASE WHEN estrellas = 4 THEN 1 END) as cuatro_estrellas,
        COUNT(CASE WHEN estrellas = 3 THEN 1 END) as tres_estrellas,
        COUNT(CASE WHEN estrellas = 2 THEN 1 END) as dos_estrellas,
        COUNT(CASE WHEN estrellas = 1 THEN 1 END) as una_estrella
      FROM comentarios
    `;
    const statsResult = await query(statsQuery);

    res.json({
      success: true,
      data: {
        comentarios: result.rows,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        },
        estadisticas: {
          ...statsResult.rows[0],
          promedio_estrellas: Math.round(parseFloat(statsResult.rows[0].promedio_estrellas) * 10) / 10 || 0
        }
      }
    });

  } catch (error) {
    console.error('Error obteniendo comentarios:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener comentario por ID
const obtenerComentarioPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(`
      SELECT id, nombre, estrellas, comentario, ver, fecha_creacion, fecha_actualizacion
      FROM comentarios 
      WHERE id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Comentario no encontrado'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error obteniendo comentario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Actualizar comentario
const actualizarComentario = async (req, res) => {
  try {
    // Verificar errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { nombre, estrellas, comentario, ver } = req.body;

    // Verificar si el comentario existe
    const existingComentario = await query('SELECT id FROM comentarios WHERE id = $1', [id]);
    if (existingComentario.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Comentario no encontrado'
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

    if (estrellas !== undefined) {
      paramCount++;
      updateFields.push(`estrellas = $${paramCount}`);
      queryParams.push(estrellas);
    }

    if (comentario !== undefined) {
      paramCount++;
      updateFields.push(`comentario = $${paramCount}`);
      queryParams.push(comentario);
    }

    if (ver !== undefined) {
      paramCount++;
      updateFields.push(`ver = $${paramCount}`);
      queryParams.push(ver);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No se proporcionaron campos para actualizar'
      });
    }

    // Agregar fecha de actualización (no necesita parámetro)
    updateFields.push(`fecha_actualizacion = CURRENT_TIMESTAMP`);

    // Agregar ID del comentario
    paramCount++;
    queryParams.push(id);

    const updateQuery = `
      UPDATE comentarios 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, nombre, estrellas, comentario, ver, fecha_creacion, fecha_actualizacion
    `;

    const result = await query(updateQuery, queryParams);
    const comentarioActualizado = result.rows[0];

    res.json({
      success: true,
      message: 'Comentario actualizado exitosamente',
      data: comentarioActualizado
    });

  } catch (error) {
    console.error('Error actualizando comentario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Eliminar comentario
const eliminarComentario = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si el comentario existe
    const existingComentario = await query('SELECT id, nombre FROM comentarios WHERE id = $1', [id]);
    if (existingComentario.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Comentario no encontrado'
      });
    }

    // Eliminar comentario
    await query('DELETE FROM comentarios WHERE id = $1', [id]);

    res.json({
      success: true,
      message: 'Comentario eliminado exitosamente',
      data: {
        id: parseInt(id),
        nombre: existingComentario.rows[0].nombre
      }
    });

  } catch (error) {
    console.error('Error eliminando comentario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Cambiar visibilidad de comentario (toggle ver)
const cambiarVisibilidad = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si el comentario existe
    const existingComentario = await query('SELECT id, ver FROM comentarios WHERE id = $1', [id]);
    if (existingComentario.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Comentario no encontrado'
      });
    }

    const nuevoEstado = !existingComentario.rows[0].ver;

    // Actualizar visibilidad
    const result = await query(`
      UPDATE comentarios 
      SET ver = $1, fecha_actualizacion = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, nombre, estrellas, comentario, ver, fecha_creacion, fecha_actualizacion
    `, [nuevoEstado, id]);

    const comentarioActualizado = result.rows[0];

    res.json({
      success: true,
      message: `Comentario ${nuevoEstado ? 'publicado' : 'ocultado'} exitosamente`,
      data: comentarioActualizado
    });

  } catch (error) {
    console.error('Error cambiando visibilidad:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener estadísticas de comentarios
const obtenerEstadisticas = async (req, res) => {
  try {
    const statsQuery = `
      SELECT 
        COUNT(*) as total_comentarios,
        COUNT(CASE WHEN ver = true THEN 1 END) as comentarios_visibles,
        COUNT(CASE WHEN ver = false THEN 1 END) as comentarios_ocultos,
        AVG(estrellas) as promedio_estrellas,
        COUNT(CASE WHEN estrellas = 5 THEN 1 END) as cinco_estrellas,
        COUNT(CASE WHEN estrellas = 4 THEN 1 END) as cuatro_estrellas,
        COUNT(CASE WHEN estrellas = 3 THEN 1 END) as tres_estrellas,
        COUNT(CASE WHEN estrellas = 2 THEN 1 END) as dos_estrellas,
        COUNT(CASE WHEN estrellas = 1 THEN 1 END) as una_estrella,
        COUNT(CASE WHEN DATE(fecha_creacion) = CURRENT_DATE THEN 1 END) as comentarios_hoy,
        COUNT(CASE WHEN DATE(fecha_creacion) >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as comentarios_esta_semana,
        COUNT(CASE WHEN DATE(fecha_creacion) >= DATE_TRUNC('month', CURRENT_DATE) THEN 1 END) as comentarios_este_mes
      FROM comentarios
    `;
    const statsResult = await query(statsQuery);

    // Obtener comentarios por mes de los últimos 6 meses
    const statsPorMesQuery = `
      SELECT 
        TO_CHAR(DATE_TRUNC('month', fecha_creacion), 'YYYY-MM') as mes,
        COUNT(*) as total,
        COUNT(CASE WHEN ver = true THEN 1 END) as visibles,
        COUNT(CASE WHEN ver = false THEN 1 END) as ocultos,
        AVG(estrellas) as promedio_estrellas
      FROM comentarios 
      WHERE fecha_creacion >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '5 months')
      GROUP BY DATE_TRUNC('month', fecha_creacion)
      ORDER BY mes DESC
    `;
    const statsPorMesResult = await query(statsPorMesQuery);

    res.json({
      success: true,
      data: {
        ...statsResult.rows[0],
        promedio_estrellas: Math.round(parseFloat(statsResult.rows[0].promedio_estrellas) * 10) / 10 || 0,
        porMes: statsPorMesResult.rows.map(row => ({
          ...row,
          promedio_estrellas: Math.round(parseFloat(row.promedio_estrellas) * 10) / 10 || 0
        }))
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

module.exports = {
  crearComentario,
  crearComentarioAdmin,
  obtenerComentariosPublicos,
  obtenerComentarios,
  obtenerComentarioPorId,
  actualizarComentario,
  eliminarComentario,
  cambiarVisibilidad,
  obtenerEstadisticas,
  crearComentarioValidation,
  crearComentarioAdminValidation,
  actualizarComentarioValidation
};
