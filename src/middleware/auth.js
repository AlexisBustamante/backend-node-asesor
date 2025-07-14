const jwt = require('jsonwebtoken');
const { query } = require('../config/database');

// Middleware para verificar token JWT
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token de acceso requerido'
      });
    }

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verificar que el usuario existe y está activo
    const userResult = await query(`
      SELECT u.id, u.email, u.rut, u.first_name, u.last_name, u.is_active, u.email_verified,
             r.name as role_name, r.permissions
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE u.id = $1
    `, [decoded.userId]);

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    const user = userResult.rows[0];

    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Usuario inactivo'
      });
    }

    if (!user.email_verified) {
      return res.status(401).json({
        success: false,
        message: 'Email no verificado'
      });
    }

    // Agregar información del usuario al request
    req.user = {
      id: user.id,
      email: user.email,
      rut: user.rut,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role_name,
      permissions: user.permissions || []
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }

    console.error('Error en autenticación:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Middleware para verificar permisos específicos
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Autenticación requerida'
      });
    }

    if (!req.user.permissions.includes(permission)) {
      return res.status(403).json({
        success: false,
        message: 'Permisos insuficientes'
      });
    }

    next();
  };
};

// Middleware para verificar rol específico
const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Autenticación requerida'
      });
    }

    if (req.user.role !== role) {
      return res.status(403).json({
        success: false,
        message: 'Rol requerido: ' + role
      });
    }

    next();
  };
};

// Middleware para verificar múltiples roles
const requireAnyRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Autenticación requerida'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Rol requerido: ' + roles.join(' o ')
      });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  requirePermission,
  requireRole,
  requireAnyRole
}; 