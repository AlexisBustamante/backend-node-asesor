const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');
const { query } = require('../config/database');
const { generateTokens, refreshTokens, deleteAllUserRefreshTokens } = require('../utils/jwt');
const { sendVerificationEmail, sendPasswordResetEmail, sendWelcomeEmail } = require('../utils/email');
const { renderEmailVerified, renderEmailVerificationError } = require('../utils/htmlRenderer');

// Validaciones para registro
const registerValidation = [
  body('rut')
    .isLength({ min: 9, max: 12 })
    .withMessage('El RUT debe tener entre 9 y 12 caracteres')
    .matches(/^[0-9]{1,2}\.[0-9]{3}\.[0-9]{3}-[0-9kK]$/)
    .withMessage('Formato de RUT inválido (ej: 12.345.678-9)'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email inválido'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('La contraseña debe tener al menos 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('La contraseña debe contener al menos una mayúscula, una minúscula y un número'),
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres'),
  body('lastName')
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
    .withMessage('ID de rol inválido')
];

// Validaciones para login
const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email inválido'),
  body('password')
    .notEmpty()
    .withMessage('Contraseña requerida')
];

// Validaciones para restablecimiento de contraseña
const resetPasswordValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email inválido')
];

// Validaciones para nueva contraseña
const newPasswordValidation = [
  body('password')
    .isLength({ min: 8 })
    .withMessage('La contraseña debe tener al menos 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('La contraseña debe contener al menos una mayúscula, una minúscula y un número'),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Las contraseñas no coinciden');
      }
      return true;
    })
];

// Registrar nuevo usuario
const register = async (req, res) => {
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

    const { rut, email, password, firstName, lastName, phone, address, region, comuna, roleId } = req.body;

    // Verificar si el email ya existe
    const existingEmail = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingEmail.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'El email ya está registrado'
      });
    }

    // Verificar si el RUT ya existe
    const existingRut = await query('SELECT id FROM users WHERE rut = $1', [rut]);
    if (existingRut.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'El RUT ya está registrado'
      });
    }

    // Encriptar contraseña
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Generar token de verificación
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Insertar usuario
    const result = await query(`
      INSERT INTO users (rut, email, password_hash, first_name, last_name, phone, address, region, comuna, role_id, email_verification_token)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id, email, first_name, last_name
    `, [rut, email, passwordHash, firstName, lastName, phone, address, region, comuna, roleId, verificationToken]);

    const user = result.rows[0];

    // Enviar email de verificación
    await sendVerificationEmail(email, verificationToken, firstName);

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente. Por favor verifica tu email.',
      data: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name
      }
    });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Iniciar sesión
const login = async (req, res) => {
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

    const { email, password } = req.body;

    // Buscar usuario
    const result = await query(`
      SELECT u.id, u.email, u.password_hash, u.first_name, u.last_name, u.is_active, u.email_verified,
             r.name as role_name, r.permissions
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE u.email = $1
    `, [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    const user = result.rows[0];

    // Verificar si el usuario está activo
    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Cuenta inactiva'
      });
    }

    // Verificar si el email está verificado
    if (!user.email_verified) {
      return res.status(401).json({
        success: false,
        message: 'Por favor verifica tu email antes de iniciar sesión'
      });
    }

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Generar tokens
    const tokens = await generateTokens(user.id);

    // Actualizar último login
    await query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);

    res.json({
      success: true,
      message: 'Inicio de sesión exitoso',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role_name,
          permissions: user.permissions || []
        },
        tokens: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresIn: tokens.expiresIn
        }
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Verificar email
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    // Buscar usuario con el token
    const result = await query(
      'SELECT id, email, first_name FROM users WHERE email_verification_token = $1',
      [token]
    );

    if (result.rows.length === 0) {
      // Renderizar página de error
      const html = await renderEmailVerificationError({
        errorMessage: 'Token de verificación inválido o expirado'
      });
      return res.status(400).send(html);
    }

    const user = result.rows[0];

    // Marcar email como verificado
    await query(
      'UPDATE users SET email_verified = true, email_verification_token = NULL WHERE id = $1',
      [user.id]
    );

    // Enviar email de bienvenida
    await sendWelcomeEmail(user.email, user.first_name);

    // Renderizar página de éxito
    const html = await renderEmailVerified({
      userName: user.first_name,
      userEmail: user.email
    });
    
    res.setHeader('Content-Type', 'text/html');
    res.send(html);

  } catch (error) {
    console.error('Error verificando email:', error);
    
    // Renderizar página de error
    const html = await renderEmailVerificationError({
      errorMessage: 'Error interno del servidor'
    });
    res.status(500).send(html);
  }
};

// Verificar email con query parameter
const verifyEmailQuery = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      // Renderizar página de error
      const html = await renderEmailVerificationError({
        errorMessage: 'Token de verificación requerido'
      });
      return res.status(400).send(html);
    }

    // Buscar usuario con el token
    const result = await query(
      'SELECT id, email, first_name FROM users WHERE email_verification_token = $1',
      [token]
    );

    if (result.rows.length === 0) {
      // Renderizar página de error
      const html = await renderEmailVerificationError({
        errorMessage: 'Token de verificación inválido o expirado'
      });
      return res.status(400).send(html);
    }

    const user = result.rows[0];

    // Marcar email como verificado
    await query(
      'UPDATE users SET email_verified = true, email_verification_token = NULL WHERE id = $1',
      [user.id]
    );

    // Enviar email de bienvenida
    await sendWelcomeEmail(user.email, user.first_name);

    // Renderizar página de éxito
    const html = await renderEmailVerified({
      userName: user.first_name,
      userEmail: user.email
    });
    
    res.setHeader('Content-Type', 'text/html');
    res.send(html);

  } catch (error) {
    console.error('Error verificando email:', error);
    
    // Renderizar página de error
    const html = await renderEmailVerificationError({
      errorMessage: 'Error interno del servidor'
    });
    res.status(500).send(html);
  }
};

// Solicitar restablecimiento de contraseña
const forgotPassword = async (req, res) => {
  try {
    // Verificar errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Email inválido',
        errors: errors.array()
      });
    }

    const { email } = req.body;

    // Buscar usuario
    const result = await query(
      'SELECT id, email, first_name FROM users WHERE email = $1 AND is_active = true',
      [email]
    );

    if (result.rows.length === 0) {
      // Por seguridad, no revelar si el email existe o no
      return res.json({
        success: true,
        message: 'Si el email existe, recibirás un enlace para restablecer tu contraseña'
      });
    }

    const user = result.rows[0];

    // Generar token de restablecimiento
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    // Guardar token en base de datos
    await query(
      'UPDATE users SET password_reset_token = $1, password_reset_expires = $2 WHERE id = $3',
      [resetToken, resetExpires, user.id]
    );

    // Enviar email
    await sendPasswordResetEmail(user.email, resetToken, user.first_name);

    res.json({
      success: true,
      message: 'Si el email existe, recibirás un enlace para restablecer tu contraseña'
    });

  } catch (error) {
    console.error('Error en forgot password:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Restablecer contraseña
const resetPassword = async (req, res) => {
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

    const { token, password } = req.body;

    // Buscar usuario con token válido
    const result = await query(
      'SELECT id FROM users WHERE password_reset_token = $1 AND password_reset_expires > NOW()',
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Token inválido o expirado'
      });
    }

    const user = result.rows[0];

    // Encriptar nueva contraseña
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Actualizar contraseña y limpiar token
    await query(
      'UPDATE users SET password_hash = $1, password_reset_token = NULL, password_reset_expires = NULL WHERE id = $2',
      [passwordHash, user.id]
    );

    // Eliminar todos los refresh tokens del usuario
    await deleteAllUserRefreshTokens(user.id);

    res.json({
      success: true,
      message: 'Contraseña restablecida exitosamente'
    });

  } catch (error) {
    console.error('Error en reset password:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Refrescar token
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token requerido'
      });
    }

    // Refrescar tokens
    const tokens = await refreshTokens(refreshToken);

    res.json({
      success: true,
      message: 'Tokens refrescados exitosamente',
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: tokens.expiresIn
      }
    });

  } catch (error) {
    console.error('Error refrescando token:', error);
    res.status(401).json({
      success: false,
      message: 'Refresh token inválido o expirado'
    });
  }
};

// Cerrar sesión
const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      // Eliminar refresh token específico
      await deleteAllUserRefreshTokens(req.user.id);
    }

    res.json({
      success: true,
      message: 'Sesión cerrada exitosamente'
    });

  } catch (error) {
    console.error('Error en logout:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener perfil del usuario
const getProfile = async (req, res) => {
  try {
    const result = await query(`
      SELECT u.id, u.email, u.rut, u.first_name, u.last_name, u.phone, u.address, u.region, u.comuna,
             r.name as role_name, r.permissions, u.created_at, u.last_login
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE u.id = $1
    `, [req.user.id]);

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
        email: user.email,
        rut: user.rut,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        address: user.address,
        region: user.region,
        comuna: user.comuna,
        role: user.role_name,
        permissions: user.permissions || [],
        createdAt: user.created_at,
        lastLogin: user.last_login
      }
    });

  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

module.exports = {
  registerValidation,
  loginValidation,
  resetPasswordValidation,
  newPasswordValidation,
  register,
  login,
  verifyEmail,
  verifyEmailQuery,
  forgotPassword,
  resetPassword,
  refreshToken,
  logout,
  getProfile
}; 