// Configuración de Rate Limiting Muy Permisiva
// Usar solo en desarrollo o cuando necesites máxima flexibilidad

const rateLimit = require('express-rate-limit');

// Rate limiting de autenticación - MUY permisivo
const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 1000, // 1000 requests por minuto para auth
  message: {
    success: false,
    message: 'Demasiadas solicitudes de autenticación, intenta de nuevo más tarde'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Saltar rate limiting para logout y operaciones críticas
    return req.path === '/logout' || 
           req.path.endsWith('/logout') ||
           req.path.includes('/refresh-token') ||
           req.path.includes('/reset-password');
  }
});

// Rate limiting general - MUY permisivo
const generalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 5000, // 5000 requests por minuto
  message: {
    success: false,
    message: 'Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Saltar rate limiting para operaciones críticas
    return req.path.includes('/health') ||
           req.path.includes('/status') ||
           req.path.includes('/ping');
  }
});

// Rate limiting deshabilitado (para desarrollo extremo)
const noLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 100000, // Prácticamente sin límite
  message: {
    success: false,
    message: 'Rate limiting activo'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  authLimiter,
  generalLimiter,
  noLimit
};
