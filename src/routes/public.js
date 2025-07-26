const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Ruta de salud del servidor (accesible directamente)
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Servidor funcionando correctamente',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Ruta raíz (accesible directamente)
router.get('/', (req, res) => {
  res.json({
    success: true,
          message: 'API de Asesora de Salud Previsional',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      health: '/health',
      apiHealth: '/api/health'
    }
  });
});

// Rutas de verificación de email (accesibles directamente)
router.get('/verify-email', authController.verifyEmailQuery);
router.get('/verify-email/:token', authController.verifyEmail);

module.exports = router; 