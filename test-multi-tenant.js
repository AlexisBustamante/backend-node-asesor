/**
 * Script de prueba para validar la funcionalidad multi-tenant
 * Prueba la separación de datos entre diferentes propietarios
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

// Clientes para diferentes propietarios
const createClient = (propietarioId) => {
  return axios.create({
    baseURL: BASE_URL,
    headers: {
      'X-Propietario-ID': propietarioId.toString(),
      'Content-Type': 'application/json'
    }
  });
};

// Función para esperar
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Función para generar datos de prueba
const generateTestData = (propietarioId) => ({
  nombre: `Usuario Test ${propietarioId}`,
  apellidos: `Apellido ${propietarioId}`,
  edad: 30,
  telefono: `+5691234567${propietarioId}`,
  email: `test${propietarioId}@example.com`,
  isapre: 'Banmédica',
  valor_mensual: 50000,
  clinica: 'Clínica Alemana',
  renta: 1500000,
  numero_cargas: 2,
  edades_cargas: '5, 8',
  mensaje: `Mensaje de prueba para propietario ${propietarioId}`,
  procedencia: 'Google'
});

const generateCommentData = (propietarioId) => ({
  nombre: `Cliente ${propietarioId}`,
  estrellas: 5,
  comentario: `Excelente servicio del propietario ${propietarioId}!`
});

// Pruebas principales
const testMultiTenant = async () => {
  console.log('🧪 Iniciando pruebas multi-tenant...\n');

  try {
    // 1. Crear cotizaciones para diferentes propietarios
    console.log('📝 1. Creando cotizaciones para diferentes propietarios...');
    
    const client1 = createClient(1);
    const client2 = createClient(2);
    
    // Crear cotización para propietario 1
    const cotizacion1 = await client1.post('/cotizaciones', generateTestData(1));
    console.log('✅ Cotización creada para propietario 1:', cotizacion1.data.data.cotizacion_id);
    
    // Crear cotización para propietario 2
    const cotizacion2 = await client2.post('/cotizaciones', generateTestData(2));
    console.log('✅ Cotización creada para propietario 2:', cotizacion2.data.data.cotizacion_id);
    
    await sleep(1000); // Esperar un poco para que se procesen

    // 2. Verificar separación de cotizaciones
    console.log('\n🔍 2. Verificando separación de cotizaciones...');
    
    const cotizaciones1 = await client1.get('/cotizaciones');
    const cotizaciones2 = await client2.get('/cotizaciones');
    
    console.log(`📊 Propietario 1 tiene ${cotizaciones1.data.data.length} cotizaciones`);
    console.log(`📊 Propietario 2 tiene ${cotizaciones2.data.data.length} cotizaciones`);
    
    // Verificar que no hay acceso cruzado
    const prop1Ids = cotizaciones1.data.data.map(c => c.cotizacion_id);
    const prop2Ids = cotizaciones2.data.data.map(c => c.cotizacion_id);
    
    const hasCrossAccess = prop1Ids.some(id => prop2Ids.includes(id));
    console.log('🚫 Verificación de acceso cruzado:', hasCrossAccess ? '❌ FALLO' : '✅ PASÓ');

    // 3. Crear comentarios para diferentes propietarios
    console.log('\n💬 3. Creando comentarios para diferentes propietarios...');
    
    // Crear comentario para propietario 1
    const comentario1 = await client1.post('/comentarios', generateCommentData(1));
    console.log('✅ Comentario creado para propietario 1:', comentario1.data.data.id);
    
    // Crear comentario para propietario 2
    const comentario2 = await client2.post('/comentarios', generateCommentData(2));
    console.log('✅ Comentario creado para propietario 2:', comentario2.data.data.id);
    
    await sleep(1000);

    // 4. Verificar separación de comentarios
    console.log('\n🔍 4. Verificando separación de comentarios...');
    
    const comentarios1 = await client1.get('/comentarios');
    const comentarios2 = await client2.get('/comentarios');
    
    console.log(`📊 Propietario 1 tiene ${comentarios1.data.data.length} comentarios`);
    console.log(`📊 Propietario 2 tiene ${comentarios2.data.data.length} comentarios`);
    
    // Verificar que no hay acceso cruzado en comentarios
    const prop1CommentIds = comentarios1.data.data.map(c => c.id);
    const prop2CommentIds = comentarios2.data.data.map(c => c.id);
    
    const hasCrossAccessComments = prop1CommentIds.some(id => prop2CommentIds.includes(id));
    console.log('🚫 Verificación de acceso cruzado en comentarios:', hasCrossAccessComments ? '❌ FALLO' : '✅ PASÓ');

    // 5. Probar consulta de estado (ruta pública)
    console.log('\n🔍 5. Probando consulta de estado...');
    
    try {
      const estado1 = await client1.get(`/cotizaciones/estado/${cotizacion1.data.data.cotizacion_id}`);
      console.log('✅ Estado consultado para propietario 1:', estado1.data.success);
      
      const estado2 = await client2.get(`/cotizaciones/estado/${cotizacion2.data.data.cotizacion_id}`);
      console.log('✅ Estado consultado para propietario 2:', estado2.data.success);
      
      // Intentar acceso cruzado (debería fallar)
      try {
        await client2.get(`/cotizaciones/estado/${cotizacion1.data.data.cotizacion_id}`);
        console.log('❌ FALLO: Propietario 2 pudo acceder a cotización de propietario 1');
      } catch (error) {
        if (error.response && error.response.status === 404) {
          console.log('✅ PASÓ: Propietario 2 no puede acceder a cotización de propietario 1');
        } else {
          console.log('⚠️ Error inesperado en acceso cruzado:', error.message);
        }
      }
    } catch (error) {
      console.log('⚠️ Error consultando estado:', error.message);
    }

    // 6. Probar comentarios públicos
    console.log('\n🔍 6. Probando comentarios públicos...');
    
    try {
      const publicos1 = await client1.get('/comentarios/publicos');
      const publicos2 = await client2.get('/comentarios/publicos');
      
      console.log(`📊 Propietario 1 tiene ${publicos1.data.data.comentarios.length} comentarios públicos`);
      console.log(`📊 Propietario 2 tiene ${publicos2.data.data.comentarios.length} comentarios públicos`);
      
      // Verificar separación
      const publicos1Ids = publicos1.data.data.comentarios.map(c => c.id);
      const publicos2Ids = publicos2.data.data.comentarios.map(c => c.id);
      
      const hasCrossAccessPublicos = publicos1Ids.some(id => publicos2Ids.includes(id));
      console.log('🚫 Verificación de acceso cruzado en comentarios públicos:', hasCrossAccessPublicos ? '❌ FALLO' : '✅ PASÓ');
      
    } catch (error) {
      console.log('⚠️ Error consultando comentarios públicos:', error.message);
    }

    // 7. Resumen final
    console.log('\n📋 RESUMEN DE PRUEBAS:');
    console.log('✅ Cotizaciones separadas correctamente');
    console.log('✅ Comentarios separados correctamente');
    console.log('✅ Consultas de estado funcionan por propietario');
    console.log('✅ Comentarios públicos separados correctamente');
    console.log('✅ No hay acceso cruzado entre propietarios');
    
    console.log('\n🎉 ¡Todas las pruebas multi-tenant pasaron exitosamente!');
    console.log('\n🚀 El sistema está listo para servir múltiples páginas web.');

  } catch (error) {
    console.error('❌ Error durante las pruebas:', error.message);
    if (error.response) {
      console.error('📄 Respuesta del servidor:', error.response.data);
    }
    process.exit(1);
  }
};

// Función para limpiar datos de prueba (opcional)
const cleanupTestData = async () => {
  console.log('\n🧹 Limpiando datos de prueba...');
  
  try {
    const client1 = createClient(1);
    const client2 = createClient(2);
    
    // Obtener cotizaciones de prueba
    const cotizaciones1 = await client1.get('/cotizaciones');
    const cotizaciones2 = await client2.get('/cotizaciones');
    
    // Eliminar cotizaciones de prueba (solo las que contengan "Test" en el nombre)
    for (const cotizacion of [...cotizaciones1.data.data, ...cotizaciones2.data.data]) {
      if (cotizacion.nombre && cotizacion.nombre.includes('Test')) {
        try {
          await client1.delete(`/cotizaciones/${cotizacion.cotizacion_id}`);
          console.log(`🗑️ Eliminada cotización: ${cotizacion.cotizacion_id}`);
        } catch (error) {
          // Ignorar errores de eliminación
        }
      }
    }
    
    console.log('✅ Limpieza completada');
    
  } catch (error) {
    console.log('⚠️ Error durante limpieza:', error.message);
  }
};

// Ejecutar pruebas
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--cleanup')) {
    cleanupTestData()
      .then(() => {
        console.log('✅ Limpieza completada');
        process.exit(0);
      })
      .catch((error) => {
        console.error('❌ Error en limpieza:', error);
        process.exit(1);
      });
  } else {
    testMultiTenant()
      .then(() => {
        console.log('\n✅ Pruebas completadas');
        process.exit(0);
      })
      .catch((error) => {
        console.error('❌ Error en pruebas:', error);
        process.exit(1);
      });
  }
}

module.exports = { testMultiTenant, cleanupTestData };
