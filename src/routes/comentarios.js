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

// Rutas públicas
router.post('/', crearComentarioValidation, crearComentario);
router.get('/publicos', obtenerComentariosPublicos);

// Rutas protegidas para administradores
router.get('/estadisticas', authenticateToken, requireRole('admin'), obtenerEstadisticas);
router.get('/', authenticateToken, requireRole('admin'), obtenerComentarios);
router.get('/:id', authenticateToken, requireRole('admin'), obtenerComentarioPorId);
router.post('/admin', authenticateToken, requireRole('admin'), crearComentarioAdminValidation, crearComentarioAdmin);
router.put('/:id', authenticateToken, requireRole('admin'), actualizarComentarioValidation, actualizarComentario);
router.delete('/:id', authenticateToken, requireRole('admin'), eliminarComentario);
router.patch('/:id/visibilidad', authenticateToken, requireRole('admin'), cambiarVisibilidad);

module.exports = router;
