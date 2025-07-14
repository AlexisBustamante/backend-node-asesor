const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, requirePermission, requireAnyRole } = require('../middleware/auth');

// Aplicar middleware de autenticación a todas las rutas
router.use(authenticateToken);

// Rutas para gestión de usuarios (solo admin y supervisor)
router.get('/', requireAnyRole(['admin', 'supervisor']), userController.getUsers);
router.get('/roles', requireAnyRole(['admin', 'supervisor']), userController.getRoles);
router.get('/:id', requireAnyRole(['admin', 'supervisor']), userController.getUserById);
router.post('/', requirePermission('users:write'), userController.userValidation, userController.createUser);
router.put('/:id', requirePermission('users:write'), userController.userValidation, userController.updateUser);
router.delete('/:id', requirePermission('users:delete'), userController.deleteUser);

module.exports = router; 