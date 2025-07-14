const express = require('express');
const router = express.Router();
const { crearCotizacion, obtenerCotizaciones, consultarEstadoCotizacion, actualizarEstadoCotizacion } = require('../controllers/cotizacionController');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Rutas públicas
router.post('/', crearCotizacion);
router.get('/estado/:cotizacion_id', consultarEstadoCotizacion);

// Rutas protegidas para administradores
router.get('/', authenticateToken, requireRole('admin'), obtenerCotizaciones);
router.put('/:id/estado', authenticateToken, requireRole('admin'), actualizarEstadoCotizacion);

module.exports = router; 