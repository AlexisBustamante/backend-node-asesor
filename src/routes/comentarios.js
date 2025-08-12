const express = require('express');
const router = express.Router();
const { 
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
} = require('../controllers/comentarioController');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { extractPropietario, validatePropietario, filterByPropietario } = require('../middleware/propietario');

// Rutas públicas
router.post('/', extractPropietario, filterByPropietario, crearComentarioValidation, crearComentario);
router.get('/publicos', extractPropietario, filterByPropietario, obtenerComentariosPublicos);

// Rutas protegidas para administradores
router.get('/estadisticas', extractPropietario, authenticateToken, requireRole('admin'), validatePropietario, obtenerEstadisticas);
router.get('/', extractPropietario, authenticateToken, requireRole('admin'), validatePropietario, obtenerComentarios);
router.get('/:id', extractPropietario, authenticateToken, requireRole('admin'), validatePropietario, obtenerComentarioPorId);
router.post('/admin', extractPropietario, authenticateToken, requireRole('admin'), validatePropietario, crearComentarioAdminValidation, crearComentarioAdmin);
router.put('/:id', extractPropietario, authenticateToken, requireRole('admin'), validatePropietario, actualizarComentarioValidation, actualizarComentario);
router.delete('/:id', extractPropietario, authenticateToken, requireRole('admin'), validatePropietario, eliminarComentario);
router.patch('/:id/visibilidad', extractPropietario, authenticateToken, requireRole('admin'), validatePropietario, cambiarVisibilidad);

module.exports = router;
