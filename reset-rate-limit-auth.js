const rateLimit = require('express-rate-limit');

// Script para resetear el rate limiting de autenticación
console.log('🔄 Reseteando rate limiting de autenticación...');

// Crear un nuevo limiter más permisivo para auth
const newAuthLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 200, // 200 requests por minuto para auth (muy permisivo)
  message: {
    success: false,
    message: 'Demasiadas solicitudes de autenticación, intenta de nuevo más tarde'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Saltar rate limiting para logout y otras operaciones críticas
    return req.path === '/logout' || 
           req.path.endsWith('/logout') ||
           req.path === '/refresh-token' ||
           req.path.endsWith('/refresh-token');
  }
});

console.log('✅ Nuevo rate limiter de autenticación configurado:');
console.log('   - Máximo: 200 requests por minuto');
console.log('   - Logout y refresh-token exentos del rate limiting');
console.log('   - Ventana de tiempo: 1 minuto');

// Para aplicar este cambio, necesitas reiniciar el servidor
console.log('\n📝 Para aplicar estos cambios:');
console.log('   1. Detén el servidor (Ctrl+C)');
console.log('   2. Reinicia el servidor (npm start o node src/server.js)');
console.log('   3. Los cambios se aplicarán automáticamente');
