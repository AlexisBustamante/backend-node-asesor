const express = require('express');
const router = express.Router();
const cors = require('cors');
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

// Configuración específica de CORS para rutas de autenticación
const authCorsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:4173',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:4173',
    'https://pamelacossioasesora.netlify.app',
    'https://pamelacossioasesoria.cl'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
};

// Aplicar CORS a todas las rutas de autenticación
router.use(cors(authCorsOptions));

// Rutas públicas
router.post('/register', authController.registerValidation, authController.register);
router.post('/login', authController.loginValidation, authController.login);
router.get('/verify-email/:token', authController.verifyEmail);
router.get('/verify-email', authController.verifyEmailQuery);
router.post('/forgot-password', authController.resetPasswordValidation, authController.forgotPassword);
router.post('/reset-password', authController.newPasswordValidation, authController.resetPassword);
router.post('/refresh-token', authController.refreshToken);

// Rutas protegidas
router.post('/logout', authController.logout);
router.get('/profile', authenticateToken, authController.getProfile);
router.post('/change-password', authenticateToken, authController.changePasswordValidation, authController.changePassword);

module.exports = router; 