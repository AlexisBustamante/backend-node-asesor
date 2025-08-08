// Script de prueba para verificar CORS
const fetch = require('node-fetch');

async function testCORS() {
  console.log('🧪 Probando CORS...');
  
  try {
    // Probar petición OPTIONS (preflight)
    console.log('1. Probando petición OPTIONS...');
    const optionsResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:5173',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type, Authorization'
      }
    });
    
    console.log('Status OPTIONS:', optionsResponse.status);
    console.log('Headers OPTIONS:', Object.fromEntries(optionsResponse.headers.entries()));
    
    // Probar petición POST real
    console.log('\n2. Probando petición POST...');
    const postResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Origin': 'http://localhost:5173',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'test@test.com',
        password: 'test123'
      })
    });
    
    console.log('Status POST:', postResponse.status);
    console.log('Headers POST:', Object.fromEntries(postResponse.headers.entries()));
    
    const responseText = await postResponse.text();
    console.log('Response body:', responseText);
    
  } catch (error) {
    console.error('❌ Error en prueba CORS:', error.message);
  }
}

testCORS(); 