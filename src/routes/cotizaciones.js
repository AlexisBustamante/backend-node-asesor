const express = require('express');
const router = express.Router();
const { crearCotizacion, crearCotizacionAdmin, obtenerCotizaciones, obtenerCotizacionPorId, consultarEstadoCotizacion, actualizarEstadoCotizacion, obtenerOpcionesFiltros, obtenerEstadisticas, actualizarCotizacion, actualizarCotizacionValidation, eliminarCotizacion } = require('../controllers/cotizacionController');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { extractPropietario, validatePropietario, filterByPropietario } = require('../middleware/propietario');

// Rutas públicas
router.post('/', extractPropietario, filterByPropietario, crearCotizacion);
router.get('/estado/:cotizacion_id', extractPropietario, filterByPropietario, consultarEstadoCotizacion);

// Rutas protegidas para administradores
router.get('/estadisticas', extractPropietario, authenticateToken, requireRole('admin'), validatePropietario, obtenerEstadisticas);
router.get('/filtros', extractPropietario, authenticateToken, requireRole('admin'), validatePropietario, obtenerOpcionesFiltros);
router.get('/', extractPropietario, authenticateToken, requireRole('admin'), validatePropietario, obtenerCotizaciones);
router.get('/:id', extractPropietario, authenticateToken, requireRole('admin'), validatePropietario, obtenerCotizacionPorId);
router.post('/admin', extractPropietario, authenticateToken, requireRole('admin'), validatePropietario, crearCotizacionAdmin);
router.put('/:id/estado', extractPropietario, authenticateToken, requireRole('admin'), validatePropietario, actualizarEstadoCotizacion);
router.put('/:id', extractPropietario, authenticateToken, requireRole('admin'), validatePropietario, actualizarCotizacionValidation, actualizarCotizacion);
router.delete('/:id', extractPropietario, authenticateToken, requireRole('admin'), validatePropietario, eliminarCotizacion);

module.exports = router; 