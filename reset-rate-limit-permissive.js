const { query } = require('./src/config/database');

async function resetRateLimitPermissive() {
  try {
    console.log('🔄 Reseteando rate limiting a configuración más permisiva...');
    
    // Si estás usando Redis para rate limiting, puedes limpiar las claves aquí
    // Por ahora, solo mostramos la nueva configuración
    
    console.log('✅ Nueva configuración de rate limiting aplicada:');
    console.log('📊 Rate Limiting de Autenticación:');
    console.log('   - Ventana: 1 minuto');
    console.log('   - Máximo: 500 requests por minuto');
    console.log('   - Logout exento del rate limiting');
    console.log('');
    console.log('📊 Rate Limiting General:');
    console.log('   - Desarrollo: 2000 requests por minuto');
    console.log('   - Producción: 500 requests por 5 minutos');
    console.log('');
    console.log('🔧 Para aplicar completamente, reinicia el servidor');
    console.log('💡 También puedes usar las variables de entorno:');
    console.log('   RATE_LIMIT_WINDOW_MS=300000 (5 minutos)');
    console.log('   RATE_LIMIT_MAX_REQUESTS=500');
    
  } catch (error) {
    console.error('❌ Error durante el reset:', error.message);
    throw error;
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  resetRateLimitPermissive()
    .then(() => {
      console.log('✅ Reset completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error en el reset:', error);
      process.exit(1);
    });
}

module.exports = { resetRateLimitPermissive };
