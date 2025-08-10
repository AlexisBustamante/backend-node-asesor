const axios = require('axios');

// Configuración de la API
const API_BASE_URL = 'http://localhost:3000/api';
const ADMIN_TOKEN = 'tu_token_admin_aqui'; // Reemplazar con un token válido

async function testProcedenciaFilter() {
  try {
    console.log('🧪 Probando filtro de procedencia...\n');

    // 1. Obtener opciones de filtros (incluyendo procedencias)
    console.log('1. Obteniendo opciones de filtros...');
    const filtrosResponse = await axios.get(`${API_BASE_URL}/cotizaciones/filtros`, {
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`
      }
    });

    if (filtrosResponse.data.success) {
      console.log('✅ Opciones de filtros obtenidas correctamente');
      console.log('📊 Procedencias disponibles:', filtrosResponse.data.data.procedencias);
    } else {
      console.log('❌ Error obteniendo opciones de filtros');
      return;
    }

    // 2. Probar filtro por procedencia específica
    console.log('\n2. Probando filtro por procedencia...');
    const procedencias = filtrosResponse.data.data.procedencias;
    
    if (procedencias.length > 0) {
      const procedenciaTest = procedencias[0]; // Usar la primera procedencia disponible
      console.log(`🔍 Filtrando por procedencia: "${procedenciaTest}"`);
      
      const cotizacionesResponse = await axios.get(`${API_BASE_URL}/cotizaciones`, {
        headers: {
          'Authorization': `Bearer ${ADMIN_TOKEN}`
        },
        params: {
          procedencia: procedenciaTest,
          limit: 5
        }
      });

      if (cotizacionesResponse.data.success) {
        console.log('✅ Filtro de procedencia funcionando correctamente');
        console.log(`📋 Cotizaciones encontradas: ${cotizacionesResponse.data.data.cotizaciones.length}`);
        
        // Mostrar algunas cotizaciones encontradas
        cotizacionesResponse.data.data.cotizaciones.forEach((cotizacion, index) => {
          console.log(`   ${index + 1}. ${cotizacion.nombre} ${cotizacion.apellidos} - ${cotizacion.procedencia}`);
        });
      } else {
        console.log('❌ Error en filtro de procedencia');
      }
    } else {
      console.log('⚠️  No hay procedencias disponibles para probar');
    }

    // 3. Probar búsqueda general que incluya procedencia
    console.log('\n3. Probando búsqueda general...');
    const searchResponse = await axios.get(`${API_BASE_URL}/cotizaciones`, {
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`
      },
      params: {
        search: 'instagram', // Buscar cotizaciones que contengan "instagram" en cualquier campo
        limit: 5
      }
    });

    if (searchResponse.data.success) {
      console.log('✅ Búsqueda general funcionando');
      console.log(`📋 Resultados encontrados: ${searchResponse.data.data.cotizaciones.length}`);
    } else {
      console.log('❌ Error en búsqueda general');
    }

    console.log('\n🎉 Pruebas completadas exitosamente!');

  } catch (error) {
    console.error('❌ Error en las pruebas:', error.response?.data || error.message);
  }
}

// Ejecutar pruebas
testProcedenciaFilter();
