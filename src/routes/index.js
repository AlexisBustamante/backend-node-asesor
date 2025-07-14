const express = require('express');
const router = express.Router();

// Importar rutas
const authRoutes = require('./auth');
const userRoutes = require('./users');
const cotizacionRoutes = require('./cotizaciones');

// Configurar rutas
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/cotizaciones', cotizacionRoutes);

// Ruta de salud del servidor (con prefijo /api)
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Servidor funcionando correctamente',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

module.exports = router; 