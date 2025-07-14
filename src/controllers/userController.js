const bcrypt = require('bcryptjs');
const { body, validationResult, query } = require('express-validator');
const { query: dbQuery } = require('../config/database');

// Validaciones para crear/actualizar usuario
const userValidation = [
  body('rut')
    .optional()
    .isLength({ min: 9, max: 12 })
    .withMessage('El RUT debe tener entre 9 y 12 caracteres')
    .matches(/^[0-9]{1,2}\.[0-9]{3}\.[0-9]{3}-[0-9kK]$/)
    .withMessage('Formato de RUT inválido (ej: 12.345.678-9)'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Email inválido'),
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('El apellido debe tener entre 2 y 50 caracteres'),
  body('phone')
    .optional()
    .matches(/^\+?[0-9\s\-\(\)]+$/)
    .withMessage('Formato de teléfono inválido'),
  body('roleId')
    .optional()
    .isInt()
    .withMessage('ID de rol inválido'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('Estado activo debe ser booleano')
];

// Obtener todos los usuarios (con paginación y filtros)
const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const role = req.query.role || '';
    const isActive = req.query.isActive;

    let whereConditions = [];
    let queryParams = [];
    let paramCount = 0;

    // Filtro de búsqueda
    if (search) {
      paramCount++;
      whereConditions.push(`(u.first_name ILIKE $${paramCount} OR u.last_name ILIKE $${paramCount} OR u.email ILIKE $${paramCount} OR u.rut ILIKE $${paramCount})`);
      queryParams.push(`%${search}%`);
    }

    // Filtro por rol
    if (role) {
      paramCount++;
      whereConditions.push(`r.name = $${paramCount}`);
      queryParams.push(role);
    }

    // Filtro por estado activo
    if (isActive !== undefined) {
      paramCount++;
      whereConditions.push(`u.is_active = $${paramCount}`);
      queryParams.push(isActive === 'true');
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Query para contar total de registros
    const countQuery = `
      SELECT COUNT(*) as total
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      ${whereClause}
    `;
    const countResult = await dbQuery(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].total);

    // Query principal
    const mainQuery = `
      SELECT u.id, u.rut, u.email, u.first_name, u.last_name, u.phone, u.address, u.region, u.comuna,
             u.is_active, u.email_verified, u.last_login, u.created_at,
             r.id as role_id, r.name as role_name, r.description as role_description
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      ${whereClause}
      ORDER BY u.created_at DESC
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;
    
    queryParams.push(limit, offset);
    const result = await dbQuery(mainQuery, queryParams);

    const users = result.rows.map(user => ({
      id: user.id,
      rut: user.rut,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      phone: user.phone,
      address: user.address,
      region: user.region,
      comuna: user.comuna,
      isActive: user.is_active,
      emailVerified: user.email_verified,
      lastLogin: user.last_login,
      createdAt: user.created_at,
      role: {
        id: user.role_id,
        name: user.role_name,
        description: user.role_description
      }
    }));

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener usuario por ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await dbQuery(`
      SELECT u.id, u.rut, u.email, u.first_name, u.last_name, u.phone, u.address, u.region, u.comuna,
             u.is_active, u.email_verified, u.last_login, u.created_at, u.updated_at,
             r.id as role_id, r.name as role_name, r.description as role_description, r.permissions
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE u.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    const user = result.rows[0];

    res.json({
      success: true,
      data: {
        id: user.id,
        rut: user.rut,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        address: user.address,
        region: user.region,
        comuna: user.comuna,
        isActive: user.is_active,
        emailVerified: user.email_verified,
        lastLogin: user.last_login,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
        role: {
          id: user.role_id,
          name: user.role_name,
          description: user.role_description,
          permissions: user.permissions || []
        }
      }
    });

  } catch (error) {
    console.error('Error obteniendo usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Crear nuevo usuario
const createUser = async (req, res) => {
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

    const { rut, email, password, firstName, lastName, phone, address, region, comuna, roleId, isActive = true } = req.body;

    // Verificar si el email ya existe
    if (email) {
      const existingEmail = await dbQuery('SELECT id FROM users WHERE email = $1', [email]);
      if (existingEmail.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'El email ya está registrado'
        });
      }
    }

    // Verificar si el RUT ya existe
    if (rut) {
      const existingRut = await dbQuery('SELECT id FROM users WHERE rut = $1', [rut]);
      if (existingRut.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'El RUT ya está registrado'
        });
      }
    }

    // Encriptar contraseña si se proporciona
    let passwordHash = null;
    if (password) {
      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
      passwordHash = await bcrypt.hash(password, saltRounds);
    }

    // Insertar usuario
    const result = await dbQuery(`
      INSERT INTO users (rut, email, password_hash, first_name, last_name, phone, address, region, comuna, role_id, is_active, email_verified)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING id, email, first_name, last_name, is_active
    `, [rut, email, passwordHash, firstName, lastName, phone, address, region, comuna, roleId, isActive, true]);

    const user = result.rows[0];

    res.status(201).json({
      success: true,
      message: 'Usuario creado exitosamente',
      data: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        isActive: user.is_active
      }
    });

  } catch (error) {
    console.error('Error creando usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Actualizar usuario
const updateUser = async (req, res) => {
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
    const { rut, email, password, firstName, lastName, phone, address, region, comuna, roleId, isActive } = req.body;

    // Verificar si el usuario existe
    const existingUser = await dbQuery('SELECT id FROM users WHERE id = $1', [id]);
    if (existingUser.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Verificar si el email ya existe (excluyendo el usuario actual)
    if (email) {
      const existingEmail = await dbQuery('SELECT id FROM users WHERE email = $1 AND id != $2', [email, id]);
      if (existingEmail.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'El email ya está registrado'
        });
      }
    }

    // Verificar si el RUT ya existe (excluyendo el usuario actual)
    if (rut) {
      const existingRut = await dbQuery('SELECT id FROM users WHERE rut = $1 AND id != $2', [rut, id]);
      if (existingRut.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'El RUT ya está registrado'
        });
      }
    }

    // Construir query de actualización dinámicamente
    let updateFields = [];
    let queryParams = [];
    let paramCount = 0;

    if (rut !== undefined) {
      paramCount++;
      updateFields.push(`rut = $${paramCount}`);
      queryParams.push(rut);
    }

    if (email !== undefined) {
      paramCount++;
      updateFields.push(`email = $${paramCount}`);
      queryParams.push(email);
    }

    if (firstName !== undefined) {
      paramCount++;
      updateFields.push(`first_name = $${paramCount}`);
      queryParams.push(firstName);
    }

    if (lastName !== undefined) {
      paramCount++;
      updateFields.push(`last_name = $${paramCount}`);
      queryParams.push(lastName);
    }

    if (phone !== undefined) {
      paramCount++;
      updateFields.push(`phone = $${paramCount}`);
      queryParams.push(phone);
    }

    if (address !== undefined) {
      paramCount++;
      updateFields.push(`address = $${paramCount}`);
      queryParams.push(address);
    }

    if (region !== undefined) {
      paramCount++;
      updateFields.push(`region = $${paramCount}`);
      queryParams.push(region);
    }

    if (comuna !== undefined) {
      paramCount++;
      updateFields.push(`comuna = $${paramCount}`);
      queryParams.push(comuna);
    }

    if (roleId !== undefined) {
      paramCount++;
      updateFields.push(`role_id = $${paramCount}`);
      queryParams.push(roleId);
    }

    if (isActive !== undefined) {
      paramCount++;
      updateFields.push(`is_active = $${paramCount}`);
      queryParams.push(isActive);
    }

    // Actualizar contraseña si se proporciona
    if (password) {
      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
      const passwordHash = await bcrypt.hash(password, saltRounds);
      paramCount++;
      updateFields.push(`password_hash = $${paramCount}`);
      queryParams.push(passwordHash);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No se proporcionaron campos para actualizar'
      });
    }

    // Agregar updated_at y id del usuario
    paramCount++;
    updateFields.push(`updated_at = NOW()`);
    paramCount++;
    queryParams.push(id);

    const updateQuery = `
      UPDATE users 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, email, first_name, last_name, is_active
    `;

    const result = await dbQuery(updateQuery, queryParams);
    const user = result.rows[0];

    res.json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      data: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        isActive: user.is_active
      }
    });

  } catch (error) {
    console.error('Error actualizando usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Eliminar usuario
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si el usuario existe
    const existingUser = await dbQuery('SELECT id FROM users WHERE id = $1', [id]);
    if (existingUser.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    // Verificar si el usuario tiene pólizas o cotizaciones asociadas
    const hasQuotes = await dbQuery('SELECT id FROM quotes WHERE advisor_id = $1 LIMIT 1', [id]);
    const hasPolicies = await dbQuery('SELECT id FROM policies WHERE advisor_id = $1 LIMIT 1', [id]);

    if (hasQuotes.rows.length > 0 || hasPolicies.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'No se puede eliminar el usuario porque tiene cotizaciones o pólizas asociadas'
      });
    }

    // Eliminar usuario
    await dbQuery('DELETE FROM users WHERE id = $1', [id]);

    res.json({
      success: true,
      message: 'Usuario eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error eliminando usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener roles disponibles
const getRoles = async (req, res) => {
  try {
    const result = await dbQuery('SELECT id, name, description, permissions FROM roles ORDER BY name');
    
    const roles = result.rows.map(role => ({
      id: role.id,
      name: role.name,
      description: role.description,
      permissions: role.permissions || []
    }));

    res.json({
      success: true,
      data: roles
    });

  } catch (error) {
    console.error('Error obteniendo roles:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

module.exports = {
  userValidation,
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getRoles
}; 