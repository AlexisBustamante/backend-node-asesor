const axios = require('axios');

// Script simple para resetear el rate limiting haciendo una petición de prueba
async function resetRateLimit() {
  try {
    console.log('🔄 Intentando resetear rate limiting...');
    
    // Hacer una petición de prueba al endpoint de logout
    const response = await axios.post('http://localhost:3000/api/auth/logout', {}, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 5000
    });
    
    console.log('✅ Rate limiting reseteado exitosamente');
    console.log('Respuesta:', response.data);
    
  } catch (error) {
    if (error.response && error.response.status === 429) {
      console.log('⚠️ Aún hay rate limiting activo');
      console.log('💡 Soluciones:');
      console.log('   1. Espera 1-2 minutos y vuelve a intentar');
      console.log('   2. Reinicia el servidor');
      console.log('   3. Usa el script reset-rate-limit-auth.js');
    } else {
      console.error('❌ Error:', error.message);
    }
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  resetRateLimit();
}

module.exports = { resetRateLimit };
