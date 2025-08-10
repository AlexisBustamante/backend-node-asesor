const redis = require('redis');

// Configuración de Redis
const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

async function resetRateLimit() {
  try {
    console.log('🔄 Conectando a Redis...');
    await redisClient.connect();
    
    console.log('🧹 Limpiando rate limiting...');
    
    // Obtener todas las claves relacionadas con rate limiting
    const keys = await redisClient.keys('*rate-limit*');
    
    if (keys.length > 0) {
      console.log(`📋 Encontradas ${keys.length} claves de rate limiting:`);
      keys.forEach(key => console.log(`   - ${key}`));
      
      // Eliminar todas las claves de rate limiting
      await redisClient.del(keys);
      console.log('✅ Rate limiting limpiado exitosamente');
    } else {
      console.log('ℹ️ No se encontraron claves de rate limiting');
    }
    
    // También limpiar claves específicas de IP
    const ipKeys = await redisClient.keys('*::ffff:*');
    if (ipKeys.length > 0) {
      console.log(`📋 Encontradas ${ipKeys.length} claves de IP:`);
      ipKeys.forEach(key => console.log(`   - ${key}`));
      
      await redisClient.del(ipKeys);
      console.log('✅ Claves de IP limpiadas exitosamente');
    }
    
  } catch (error) {
    console.error('❌ Error limpiando rate limiting:', error);
  } finally {
    await redisClient.quit();
    console.log('🔌 Conexión a Redis cerrada');
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  resetRateLimit().catch(console.error);
}

module.exports = { resetRateLimit };
