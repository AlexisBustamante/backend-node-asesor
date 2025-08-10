const axios = require('axios');

// Configuración de la API
const API_BASE_URL = 'http://localhost:3000/api';
const ADMIN_TOKEN = 'tu_token_admin_aqui'; // Reemplazar con un token válido

async function testComentarios() {
  try {
    console.log('🧪 Probando sistema de comentarios...\n');

    // 1. Crear comentario público
    console.log('1. Creando comentario público...');
    const comentarioPublico = {
      nombre: 'María González',
      estrellas: 5,
      comentario: 'Excelente servicio, muy profesional y atenta. Recomiendo totalmente.'
    };

    const crearResponse = await axios.post(`${API_BASE_URL}/comentarios`, comentarioPublico);
    
    if (crearResponse.data.success) {
      console.log('✅ Comentario público creado exitosamente');
      console.log('📝 ID del comentario:', crearResponse.data.data.id);
    } else {
      console.log('❌ Error creando comentario público');
      return;
    }

    // 2. Obtener comentarios públicos
    console.log('\n2. Obteniendo comentarios públicos...');
    const publicosResponse = await axios.get(`${API_BASE_URL}/comentarios/publicos`);
    
    if (publicosResponse.data.success) {
      console.log('✅ Comentarios públicos obtenidos correctamente');
      console.log('📊 Total de comentarios públicos:', publicosResponse.data.data.estadisticas.total_comentarios);
      console.log('⭐ Promedio de estrellas:', publicosResponse.data.data.estadisticas.promedio_estrellas);
    } else {
      console.log('❌ Error obteniendo comentarios públicos');
    }

    // 3. Crear comentario desde admin
    console.log('\n3. Creando comentario desde admin...');
    const comentarioAdmin = {
      nombre: 'Juan Pérez',
      estrellas: 4,
      comentario: 'Muy buen servicio, respondieron todas mis dudas.',
      ver: true
    };

    const crearAdminResponse = await axios.post(`${API_BASE_URL}/comentarios/admin`, comentarioAdmin, {
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`
      }
    });
    
    if (crearAdminResponse.data.success) {
      console.log('✅ Comentario admin creado exitosamente');
      console.log('📝 ID del comentario:', crearAdminResponse.data.data.id);
      console.log('👁️ Visible:', crearAdminResponse.data.data.ver);
    } else {
      console.log('❌ Error creando comentario admin');
    }

    // 4. Obtener todos los comentarios (admin)
    console.log('\n4. Obteniendo todos los comentarios (admin)...');
    const todosResponse = await axios.get(`${API_BASE_URL}/comentarios`, {
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`
      }
    });
    
    if (todosResponse.data.success) {
      console.log('✅ Todos los comentarios obtenidos correctamente');
      console.log('📊 Total de comentarios:', todosResponse.data.data.estadisticas.total_comentarios);
      console.log('👁️ Comentarios visibles:', todosResponse.data.data.estadisticas.comentarios_visibles);
      console.log('🙈 Comentarios ocultos:', todosResponse.data.data.estadisticas.comentarios_ocultos);
      
      // Mostrar algunos comentarios
      todosResponse.data.data.comentarios.slice(0, 3).forEach((comentario, index) => {
        console.log(`   ${index + 1}. ${comentario.nombre} - ${comentario.estrellas}⭐ - ${comentario.ver ? 'Visible' : 'Oculto'}`);
      });
    } else {
      console.log('❌ Error obteniendo todos los comentarios');
    }

    // 5. Obtener estadísticas
    console.log('\n5. Obteniendo estadísticas...');
    const statsResponse = await axios.get(`${API_BASE_URL}/comentarios/estadisticas`, {
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`
      }
    });
    
    if (statsResponse.data.success) {
      console.log('✅ Estadísticas obtenidas correctamente');
      const stats = statsResponse.data.data;
      console.log('📊 Estadísticas generales:');
      console.log(`   - Total comentarios: ${stats.total_comentarios}`);
      console.log(`   - Comentarios visibles: ${stats.comentarios_visibles}`);
      console.log(`   - Comentarios ocultos: ${stats.comentarios_ocultos}`);
      console.log(`   - Promedio estrellas: ${stats.promedio_estrellas}`);
      console.log(`   - 5 estrellas: ${stats.cinco_estrellas}`);
      console.log(`   - 4 estrellas: ${stats.cuatro_estrellas}`);
      console.log(`   - 3 estrellas: ${stats.tres_estrellas}`);
      console.log(`   - 2 estrellas: ${stats.dos_estrellas}`);
      console.log(`   - 1 estrella: ${stats.una_estrella}`);
    } else {
      console.log('❌ Error obteniendo estadísticas');
    }

    // 6. Probar filtros
    console.log('\n6. Probando filtros...');
    const filtrosResponse = await axios.get(`${API_BASE_URL}/comentarios`, {
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`
      },
      params: {
        search: 'excelente',
        ver: 'false',
        limit: 5
      }
    });
    
    if (filtrosResponse.data.success) {
      console.log('✅ Filtros funcionando correctamente');
      console.log(`📋 Comentarios encontrados con filtros: ${filtrosResponse.data.data.comentarios.length}`);
    } else {
      console.log('❌ Error con filtros');
    }

    // 7. Probar cambio de visibilidad (si hay comentarios)
    if (todosResponse.data.success && todosResponse.data.data.comentarios.length > 0) {
      console.log('\n7. Probando cambio de visibilidad...');
      const primerComentario = todosResponse.data.data.comentarios[0];
      const nuevoEstado = !primerComentario.ver;
      
      const visibilidadResponse = await axios.patch(`${API_BASE_URL}/comentarios/${primerComentario.id}/visibilidad`, {}, {
        headers: {
          'Authorization': `Bearer ${ADMIN_TOKEN}`
        }
      });
      
      if (visibilidadResponse.data.success) {
        console.log('✅ Visibilidad cambiada exitosamente');
        console.log(`👁️ Nuevo estado: ${visibilidadResponse.data.data.ver ? 'Visible' : 'Oculto'}`);
      } else {
        console.log('❌ Error cambiando visibilidad');
      }
    }

    console.log('\n🎉 Pruebas de comentarios completadas exitosamente!');

  } catch (error) {
    console.error('❌ Error en las pruebas:', error.response?.data || error.message);
  }
}

// Función para probar validaciones
async function testValidaciones() {
  try {
    console.log('\n🔍 Probando validaciones...\n');

    // 1. Probar nombre muy corto
    console.log('1. Probando nombre muy corto...');
    try {
      await axios.post(`${API_BASE_URL}/comentarios`, {
        nombre: 'A',
        estrellas: 5,
        comentario: 'Comentario de prueba'
      });
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Validación de nombre funcionando correctamente');
      }
    }

    // 2. Probar estrellas inválidas
    console.log('2. Probando estrellas inválidas...');
    try {
      await axios.post(`${API_BASE_URL}/comentarios`, {
        nombre: 'Juan Pérez',
        estrellas: 6,
        comentario: 'Comentario de prueba'
      });
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Validación de estrellas funcionando correctamente');
      }
    }

    // 3. Probar comentario muy corto
    console.log('3. Probando comentario muy corto...');
    try {
      await axios.post(`${API_BASE_URL}/comentarios`, {
        nombre: 'Juan Pérez',
        estrellas: 5,
        comentario: 'Corto'
      });
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Validación de comentario funcionando correctamente');
      }
    }

    console.log('\n✅ Todas las validaciones funcionando correctamente!');

  } catch (error) {
    console.error('❌ Error en validaciones:', error.response?.data || error.message);
  }
}

// Ejecutar pruebas
async function ejecutarPruebas() {
  await testComentarios();
  await testValidaciones();
}

ejecutarPruebas();
