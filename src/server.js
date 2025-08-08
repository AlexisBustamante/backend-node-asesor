const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

// Importar configuración de base de datos
const { testConnection } = require('./config/database');

// Importar rutas
const apiRoutes = require('./routes');
const publicRoutes = require('./routes/public');

// Importar utilidades
const { cleanupExpiredTokens } = require('./utils/jwt');

// Importar migraciones para producción
const { runMigrations } = require('./database/migrate-prod');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // máximo 100 requests por ventana
  message: {
    success: false,
    message: 'Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Configuración de CORS (DEBE IR PRIMERO)
const allowedOrigins = [
  'http://localhost:3000',  // Frontend en puerto 3000
  'http://localhost:5173',  // Vite dev server
  'http://localhost:4173',  // Vite preview
  'http://127.0.0.1:5173',  // Vite con IP
  'http://127.0.0.1:4173',  // Vite preview con IP
  'https://pamelacossioasesora.netlify.app', // Frontend en Netlify (sin slash final)
  'https://pamelacossioasesoria.cl'
];

// Agregar FRONTEND_URL si está definido
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

// Agregar BACK_URL_PROD si está definido
if (process.env.BACK_URL_PROD) {
  allowedOrigins.push(process.env.BACK_URL_PROD);
}

// Configurar CORS antes que cualquier otro middleware
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  optionsSuccessStatus: 200
}));

// Middleware para manejar peticiones OPTIONS (preflight)
app.options('*', cors());

// Middleware adicional para manejar CORS en todas las rutas
app.use((req, res, next) => {
  // Verificar si el origen está permitido
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Manejar peticiones OPTIONS
  if (req.method === 'OPTIONS') {
    console.log('🔄 Petición OPTIONS recibida para:', req.url);
    res.sendStatus(200);
  } else {
    next();
  }
});

// Middleware de seguridad
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Middleware de compresión
app.use(compression());

// Middleware de logging
app.use(morgan('combined'));

// Middleware de rate limiting
app.use(limiter);

// Middleware para parsear JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware para servir archivos estáticos
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Middleware de manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error no manejado:', err);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor'
  });
});

// Configurar rutas públicas (sin prefijo /api)
app.use('/', publicRoutes);

// Configurar rutas de la API
app.use('/api', apiRoutes);

// Middleware para manejar rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada'
  });
});

// Función para limpiar tokens expirados periódicamente
const scheduleTokenCleanup = () => {
  setInterval(async () => {
    try {
      await cleanupExpiredTokens();
      console.log('🧹 Tokens expirados limpiados');
    } catch (error) {
      console.error('Error limpiando tokens expirados:', error);
    }
  }, 60 * 60 * 1000); // Cada hora
};

// Función para iniciar el servidor
const startServer = async () => {
  try {
    // Probar conexión a la base de datos
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.error('❌ No se pudo conectar a la base de datos');
      process.exit(1);
    }

    // Ejecutar migraciones en producción
    if (process.env.NODE_ENV === 'production') {
      console.log('🔄 Ejecutando migraciones de producción...');
      await runMigrations();
    }

    // Iniciar limpieza de tokens
    scheduleTokenCleanup();

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log('🚀 Servidor iniciado exitosamente');
      console.log(`📡 Puerto: ${PORT}`);
      console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 URL: http://localhost:${PORT}`);
      console.log(`📊 Health Check: ${ process.env.NODE_ENV === 'production' ? process.env.BACK_URL_PROD : 'http://localhost'}:${PORT}/health`);
    });

  } catch (error) {
    console.error('❌ Error iniciando el servidor:', error);
    process.exit(1);
  }
};

// Manejo de señales para cierre graceful
process.on('SIGTERM', () => {
  console.log('🛑 Recibida señal SIGTERM, cerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Recibida señal SIGINT, cerrando servidor...');
  process.exit(0);
});

// Manejo de errores no capturados
process.on('uncaughtException', (error) => {
  console.error('💥 Error no capturado:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Promesa rechazada no manejada:', reason);
  process.exit(1);
});

// Iniciar servidor si se ejecuta directamente
if (require.main === module) {
  startServer();
}

module.exports = app; 