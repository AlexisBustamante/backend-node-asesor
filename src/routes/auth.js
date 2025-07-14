const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

// Rutas públicas
router.post('/register', authController.registerValidation, authController.register);
router.post('/login', authController.loginValidation, authController.login);
router.get('/verify-email/:token', authController.verifyEmail);
router.get('/verify-email', authController.verifyEmailQuery);
router.post('/forgot-password', authController.resetPasswordValidation, authController.forgotPassword);
router.post('/reset-password', authController.newPasswordValidation, authController.resetPassword);
router.post('/refresh-token', authController.refreshToken);

// Rutas protegidas
router.post('/logout', authenticateToken, authController.logout);
router.get('/profile', authenticateToken, authController.getProfile);

module.exports = router; 