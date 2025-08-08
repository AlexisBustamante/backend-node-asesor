const express = require('express');
const router = express.Router();
const { crearCotizacion, crearCotizacionAdmin, obtenerCotizaciones, obtenerCotizacionPorId, consultarEstadoCotizacion, actualizarEstadoCotizacion, obtenerOpcionesFiltros, obtenerEstadisticas, actualizarCotizacion, actualizarCotizacionValidation } = require('../controllers/cotizacionController');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Rutas públicas
router.post('/', crearCotizacion);
router.get('/estado/:cotizacion_id', consultarEstadoCotizacion);

// Rutas protegidas para administradores

router.get('/estadisticas', authenticateToken, requireRole('admin'), obtenerEstadisticas);
router.get('/filtros', authenticateToken, requireRole('admin'), obtenerOpcionesFiltros);
router.get('/', authenticateToken, requireRole('admin'), obtenerCotizaciones);
router.get('/:id', authenticateToken, requireRole('admin'), obtenerCotizacionPorId);
router.post('/admin', authenticateToken, requireRole('admin'), crearCotizacionAdmin);
router.put('/:id/estado', authenticateToken, requireRole('admin'), actualizarEstadoCotizacion);
router.put('/:id', authenticateToken, requireRole('admin'), actualizarCotizacionValidation, actualizarCotizacion);

module.exports = router; 