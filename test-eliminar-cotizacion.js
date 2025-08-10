const axios = require('axios');

// Configuración de la API
const API_BASE_URL = 'http://localhost:3000/api';
const ADMIN_TOKEN = 'tu_token_admin_aqui'; // Reemplazar con un token válido

async function testEliminarCotizacion() {
  try {
    console.log('🧪 Probando funcionalidad de eliminar cotizaciones...\n');

    // 1. Primero obtener todas las cotizaciones para ver cuáles existen
    console.log('1. Obteniendo lista de cotizaciones...');
    const cotizacionesResponse = await axios.get(`${API_BASE_URL}/cotizaciones`, {
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`
      }
    });
    
    if (!cotizacionesResponse.data.success) {
      console.log('❌ Error obteniendo cotizaciones');
      return;
    }

    const cotizaciones = cotizacionesResponse.data.data.cotizaciones;
    console.log(`✅ Se encontraron ${cotizaciones.length} cotizaciones`);

    if (cotizaciones.length === 0) {
      console.log('⚠️ No hay cotizaciones para eliminar. Creando una cotización de prueba...');
      
      // Crear una cotización de prueba
      const cotizacionPrueba = {
        nombre: 'Cliente Prueba',
        apellidos: 'Para Eliminar',
        edad: 30,
        telefono: '+56912345678',
        email: 'prueba@eliminar.com',
        isapre: 'Banmédica',
        valor_mensual: 50000,
        clinica: 'Clínica Alemana',
        renta: 1500000,
        numero_cargas: 2,
        edades_cargas: '5, 8',
        mensaje: 'Cotización de prueba para eliminar',
        procedencia: 'Test'
      };

      const crearResponse = await axios.post(`${API_BASE_URL}/cotizaciones/admin`, cotizacionPrueba, {
        headers: {
          'Authorization': `Bearer ${ADMIN_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });

      if (crearResponse.data.success) {
        console.log('✅ Cotización de prueba creada con ID:', crearResponse.data.data.id);
        const cotizacionId = crearResponse.data.data.id;
        
        // Continuar con la eliminación
        await testEliminacion(cotizacionId);
      } else {
        console.log('❌ Error creando cotización de prueba');
      }
    } else {
      // Usar la primera cotización para la prueba
      const cotizacionId = cotizaciones[0].id;
      console.log(`📝 Usando cotización ID: ${cotizacionId} para la prueba`);
      
      await testEliminacion(cotizacionId);
    }

  } catch (error) {
    console.error('❌ Error en las pruebas:', error.response?.data || error.message);
  }
}

async function testEliminacion(cotizacionId) {
  try {
    // 2. Verificar que la cotización existe antes de eliminar
    console.log(`\n2. Verificando que la cotización ${cotizacionId} existe...`);
    const verificarResponse = await axios.get(`${API_BASE_URL}/cotizaciones/${cotizacionId}`, {
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`
      }
    });
    
    if (verificarResponse.data.success) {
      console.log('✅ Cotización encontrada:', verificarResponse.data.data.nombre);
    } else {
      console.log('❌ Cotización no encontrada');
      return;
    }

    // 3. Eliminar la cotización
    console.log(`\n3. Eliminando cotización ${cotizacionId}...`);
    const eliminarResponse = await axios.delete(`${API_BASE_URL}/cotizaciones/${cotizacionId}`, {
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`
      }
    });
    
    if (eliminarResponse.data.success) {
      console.log('✅ Cotización eliminada exitosamente');
      console.log('📝 Datos de la cotización eliminada:', eliminarResponse.data.data);
    } else {
      console.log('❌ Error eliminando cotización');
      return;
    }

    // 4. Verificar que la cotización ya no existe
    console.log(`\n4. Verificando que la cotización ${cotizacionId} ya no existe...`);
    try {
      await axios.get(`${API_BASE_URL}/cotizaciones/${cotizacionId}`, {
        headers: {
          'Authorization': `Bearer ${ADMIN_TOKEN}`
        }
      });
      console.log('❌ Error: La cotización aún existe después de eliminarla');
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('✅ Confirmado: La cotización ya no existe');
      } else {
        console.log('❌ Error inesperado verificando eliminación:', error.response?.data || error.message);
      }
    }

    // 5. Intentar eliminar una cotización que no existe
    console.log('\n5. Probando eliminar una cotización inexistente...');
    try {
      await axios.delete(`${API_BASE_URL}/cotizaciones/999999`, {
        headers: {
          'Authorization': `Bearer ${ADMIN_TOKEN}`
        }
      });
      console.log('❌ Error: Se eliminó una cotización inexistente');
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('✅ Correcto: No se puede eliminar una cotización inexistente');
      } else {
        console.log('❌ Error inesperado:', error.response?.data || error.message);
      }
    }

    console.log('\n🎉 Pruebas de eliminación de cotizaciones completadas exitosamente!');

  } catch (error) {
    console.error('❌ Error en la prueba de eliminación:', error.response?.data || error.message);
  }
}

// Función para probar sin autenticación
async function testSinAutenticacion() {
  try {
    console.log('\n🔒 Probando acceso sin autenticación...');
    
    try {
      await axios.delete(`${API_BASE_URL}/cotizaciones/1`);
      console.log('❌ Error: Se eliminó una cotización sin autenticación');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Correcto: Se requiere autenticación para eliminar cotizaciones');
      } else {
        console.log('❌ Error inesperado:', error.response?.data || error.message);
      }
    }

  } catch (error) {
    console.error('❌ Error en prueba sin autenticación:', error.response?.data || error.message);
  }
}

// Ejecutar pruebas
async function ejecutarPruebas() {
  console.log('🚀 Iniciando pruebas de eliminación de cotizaciones...\n');
  
  await testEliminarCotizacion();
  await testSinAutenticacion();
  
  console.log('\n✨ Todas las pruebas completadas!');
}

// Ejecutar si se llama directamente
if (require.main === module) {
  ejecutarPruebas().catch(console.error);
}

module.exports = { testEliminarCotizacion, testSinAutenticacion };
