const axios = require('axios');

// Configuración de la API
const API_BASE_URL = 'http://localhost:3000/api';
const ADMIN_TOKEN = 'tu_token_admin_aqui'; // Reemplazar con un token válido

async function testCambiarPassword() {
  try {
    console.log('🔐 Probando funcionalidad de cambio de contraseña...\n');

    // 1. Probar cambio de contraseña con datos válidos
    console.log('1. Probando cambio de contraseña con datos válidos...');
    try {
      const changePasswordData = {
        currentPassword: 'Password123',
        newPassword: 'NewPassword123',
        confirmNewPassword: 'NewPassword123'
      };

      const response = await axios.post(`${API_BASE_URL}/auth/change-password`, changePasswordData, {
        headers: {
          'Authorization': `Bearer ${ADMIN_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        console.log('✅ Contraseña cambiada exitosamente');
        console.log('📝 Mensaje:', response.data.message);
      } else {
        console.log('❌ Error cambiando contraseña:', response.data.message);
      }
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('❌ Error de validación:', error.response.data.message);
      } else if (error.response?.status === 401) {
        console.log('❌ Error de autenticación:', error.response.data.message);
      } else {
        console.log('❌ Error inesperado:', error.response?.data?.message || error.message);
      }
    }

    // 2. Probar con contraseña actual incorrecta
    console.log('\n2. Probando con contraseña actual incorrecta...');
    try {
      const invalidData = {
        currentPassword: 'WrongPassword123',
        newPassword: 'NewPassword456',
        confirmNewPassword: 'NewPassword456'
      };

      await axios.post(`${API_BASE_URL}/auth/change-password`, invalidData, {
        headers: {
          'Authorization': `Bearer ${ADMIN_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('❌ Error: Se cambió la contraseña con contraseña actual incorrecta');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Correcto: No se puede cambiar con contraseña actual incorrecta');
        console.log('📝 Mensaje:', error.response.data.message);
      } else {
        console.log('❌ Error inesperado:', error.response?.data?.message || error.message);
      }
    }

    // 3. Probar con nueva contraseña igual a la actual
    console.log('\n3. Probando con nueva contraseña igual a la actual...');
    try {
      const samePasswordData = {
        currentPassword: 'Password123',
        newPassword: 'Password123',
        confirmNewPassword: 'Password123'
      };

      await axios.post(`${API_BASE_URL}/auth/change-password`, samePasswordData, {
        headers: {
          'Authorization': `Bearer ${ADMIN_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('❌ Error: Se cambió la contraseña por la misma');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Correcto: No se puede cambiar por la misma contraseña');
        console.log('📝 Mensaje:', error.response.data.message);
      } else {
        console.log('❌ Error inesperado:', error.response?.data?.message || error.message);
      }
    }

    // 4. Probar con contraseñas que no coinciden
    console.log('\n4. Probando con contraseñas que no coinciden...');
    try {
      const mismatchData = {
        currentPassword: 'Password123',
        newPassword: 'NewPassword123',
        confirmNewPassword: 'DifferentPassword123'
      };

      await axios.post(`${API_BASE_URL}/auth/change-password`, mismatchData, {
        headers: {
          'Authorization': `Bearer ${ADMIN_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('❌ Error: Se cambió la contraseña con confirmación incorrecta');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Correcto: No se puede cambiar con confirmación incorrecta');
        console.log('📝 Mensaje:', error.response.data.message);
      } else {
        console.log('❌ Error inesperado:', error.response?.data?.message || error.message);
      }
    }

    // 5. Probar con contraseña débil
    console.log('\n5. Probando con contraseña débil...');
    try {
      const weakPasswordData = {
        currentPassword: 'Password123',
        newPassword: '123',
        confirmNewPassword: '123'
      };

      await axios.post(`${API_BASE_URL}/auth/change-password`, weakPasswordData, {
        headers: {
          'Authorization': `Bearer ${ADMIN_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('❌ Error: Se cambió la contraseña con contraseña débil');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Correcto: No se puede cambiar con contraseña débil');
        console.log('📝 Mensaje:', error.response.data.message);
      } else {
        console.log('❌ Error inesperado:', error.response?.data?.message || error.message);
      }
    }

    // 6. Probar sin autenticación
    console.log('\n6. Probando sin autenticación...');
    try {
      const noAuthData = {
        currentPassword: 'Password123',
        newPassword: 'NewPassword123',
        confirmNewPassword: 'NewPassword123'
      };

      await axios.post(`${API_BASE_URL}/auth/change-password`, noAuthData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('❌ Error: Se cambió la contraseña sin autenticación');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Correcto: Se requiere autenticación para cambiar contraseña');
        console.log('📝 Mensaje:', error.response.data.message);
      } else {
        console.log('❌ Error inesperado:', error.response?.data?.message || error.message);
      }
    }

    console.log('\n🎉 Pruebas de cambio de contraseña completadas!');

  } catch (error) {
    console.error('❌ Error en las pruebas:', error.response?.data || error.message);
  }
}

// Función para probar con datos específicos
async function testCambiarPasswordEspecifico(currentPassword, newPassword) {
  try {
    console.log(`\n🔐 Probando cambio de contraseña específico...`);
    console.log(`Contraseña actual: ${currentPassword}`);
    console.log(`Nueva contraseña: ${newPassword}`);

    const changePasswordData = {
      currentPassword,
      newPassword,
      confirmNewPassword: newPassword
    };

    const response = await axios.post(`${API_BASE_URL}/auth/change-password`, changePasswordData, {
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.data.success) {
      console.log('✅ Contraseña cambiada exitosamente');
      console.log('📝 Mensaje:', response.data.message);
      return true;
    } else {
      console.log('❌ Error cambiando contraseña:', response.data.message);
      return false;
    }

  } catch (error) {
    if (error.response?.status === 400) {
      console.log('❌ Error de validación:', error.response.data.message);
    } else if (error.response?.status === 401) {
      console.log('❌ Error de autenticación:', error.response.data.message);
    } else {
      console.log('❌ Error inesperado:', error.response?.data?.message || error.message);
    }
    return false;
  }
}

// Ejecutar pruebas
async function ejecutarPruebas() {
  console.log('🚀 Iniciando pruebas de cambio de contraseña...\n');
  
  await testCambiarPassword();
  
  console.log('\n✨ Todas las pruebas completadas!');
}

// Ejecutar si se llama directamente
if (require.main === module) {
  ejecutarPruebas().catch(console.error);
}

module.exports = { testCambiarPassword, testCambiarPasswordEspecifico };
