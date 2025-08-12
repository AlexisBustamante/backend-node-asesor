# 🔐 Endpoint de Cambio de Contraseña

## Resumen

Se ha implementado un endpoint seguro para que los usuarios autenticados puedan cambiar su contraseña. Este endpoint incluye validaciones robustas y medidas de seguridad adicionales.

## Endpoint

### Cambiar Contraseña

**POST** `/api/auth/change-password`

Permite a un usuario autenticado cambiar su contraseña actual por una nueva.

#### Headers Requeridos
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

#### Body de la Petición
```json
{
  "currentPassword": "ContraseñaActual123",
  "newPassword": "NuevaContraseña456",
  "confirmNewPassword": "NuevaContraseña456"
}
```

#### Parámetros del Body
- `currentPassword` (string, requerido): La contraseña actual del usuario
- `newPassword` (string, requerido): La nueva contraseña deseada
- `confirmNewPassword` (string, requerido): Confirmación de la nueva contraseña

#### Respuesta Exitosa (200)
```json
{
  "success": true,
  "message": "Contraseña cambiada exitosamente. Por seguridad, tu sesión ha sido cerrada."
}
```

#### Respuesta de Error (400) - Validación
```json
{
  "success": false,
  "message": "Datos de entrada inválidos",
  "errors": [
    {
      "field": "currentPassword",
      "message": "La contraseña actual es requerida"
    }
  ]
}
```

#### Respuesta de Error (400) - Contraseña Actual Incorrecta
```json
{
  "success": false,
  "message": "La contraseña actual es incorrecta"
}
```

#### Respuesta de Error (400) - Nueva Contraseña Igual
```json
{
  "success": false,
  "message": "La nueva contraseña debe ser diferente a la actual"
}
```

#### Respuesta de Error (401)
```json
{
  "success": false,
  "message": "Token de acceso inválido"
}
```

#### Respuesta de Error (404)
```json
{
  "success": false,
  "message": "Usuario no encontrado"
}
```

#### Respuesta de Error (500)
```json
{
  "success": false,
  "message": "Error interno del servidor"
}
```

## Validaciones

### Contraseña Actual
- **Requerida**: No puede estar vacía
- **Verificación**: Debe coincidir con la contraseña almacenada en la base de datos

### Nueva Contraseña
- **Longitud mínima**: 8 caracteres
- **Complejidad**: Debe contener al menos:
  - Una letra minúscula
  - Una letra mayúscula
  - Un número
- **Diferencia**: No puede ser igual a la contraseña actual

### Confirmación
- **Coincidencia**: Debe ser idéntica a la nueva contraseña

## Seguridad

### Medidas Implementadas

1. **Autenticación Requerida**: Solo usuarios autenticados pueden cambiar su contraseña
2. **Verificación de Contraseña Actual**: Se valida que la contraseña actual sea correcta
3. **Encriptación**: La nueva contraseña se encripta con bcrypt (12 salt rounds)
4. **Invalidación de Sesiones**: Todos los tokens de refresco se invalidan después del cambio
5. **Validaciones Robustas**: Múltiples capas de validación para prevenir errores

### Flujo de Seguridad

1. **Verificación de Token**: Se valida que el usuario esté autenticado
2. **Validación de Datos**: Se verifican todos los campos requeridos
3. **Verificación de Contraseña Actual**: Se compara con la contraseña encriptada
4. **Validación de Nueva Contraseña**: Se verifica complejidad y diferencia
5. **Encriptación**: Se encripta la nueva contraseña
6. **Actualización**: Se actualiza en la base de datos
7. **Invalidación**: Se invalidan todas las sesiones activas

## Implementación en el Frontend

### Servicio (authService.js)
```javascript
async changePassword(currentPassword, newPassword, confirmNewPassword) {
  try {
    const response = await api.post('/auth/change-password', {
      currentPassword,
      newPassword,
      confirmNewPassword
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}
```

### Uso en Componente Vue
```javascript
// En el método del componente
async cambiarContraseña() {
  try {
    const result = await this.authService.changePassword(
      this.currentPassword,
      this.newPassword,
      this.confirmNewPassword
    );
    
    if (result.success) {
      // Mostrar mensaje de éxito
      this.$toast.success(result.message);
      
      // Redirigir al login ya que la sesión se cerró
      this.$router.push('/login');
    }
  } catch (error) {
    // Manejar errores de validación
    if (error.response?.status === 400) {
      const errors = error.response.data.errors;
      errors.forEach(error => {
        this.$toast.error(error.message);
      });
    } else {
      // Manejar otros errores
      this.$toast.error(error.response?.data?.message || 'Error cambiando contraseña');
    }
  }
}
```

## Ejemplos de Uso

### cURL
```bash
# Cambiar contraseña
curl -X POST http://localhost:3000/api/auth/change-password \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "ContraseñaActual123",
    "newPassword": "NuevaContraseña456",
    "confirmNewPassword": "NuevaContraseña456"
  }'
```

### JavaScript (Axios)
```javascript
const cambiarContraseña = async (currentPassword, newPassword, confirmNewPassword) => {
  try {
    const response = await axios.post('/api/auth/change-password', {
      currentPassword,
      newPassword,
      confirmNewPassword
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Contraseña cambiada:', response.data);
  } catch (error) {
    console.error('Error:', error.response.data);
  }
};
```

### JavaScript (Fetch)
```javascript
const cambiarContraseña = async (currentPassword, newPassword, confirmNewPassword) => {
  try {
    const response = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        currentPassword,
        newPassword,
        confirmNewPassword
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('Contraseña cambiada:', data);
    } else {
      console.error('Error:', data);
    }
  } catch (error) {
    console.error('Error de red:', error);
  }
};
```

## Pruebas

### Script de Pruebas
Se ha creado un script de pruebas completo en `test-cambiar-password.js` que incluye:

1. **Cambio exitoso**: Prueba el cambio de contraseña con datos válidos
2. **Contraseña actual incorrecta**: Verifica que no se pueda cambiar con contraseña incorrecta
3. **Nueva contraseña igual**: Verifica que no se pueda cambiar por la misma contraseña
4. **Confirmación incorrecta**: Verifica que las contraseñas coincidan
5. **Contraseña débil**: Verifica las validaciones de complejidad
6. **Sin autenticación**: Verifica que se requiera autenticación

### Ejecutar Pruebas
```bash
# Instalar dependencias si no están instaladas
npm install axios

# Ejecutar pruebas (reemplazar ADMIN_TOKEN con un token válido)
node test-cambiar-password.js
```

## Consideraciones Importantes

### ⚠️ Advertencias
- **Sesión cerrada**: Después del cambio, todas las sesiones se invalidan
- **Re-login requerido**: El usuario debe volver a iniciar sesión
- **Tokens invalidados**: Todos los refresh tokens se eliminan

### 🔒 Seguridad
- Solo el propietario de la cuenta puede cambiar su contraseña
- Se requiere la contraseña actual para confirmar la identidad
- Las contraseñas se encriptan con bcrypt
- Se invalidan todas las sesiones activas

### 📊 Auditoría
- Los cambios de contraseña se registran en los logs del servidor
- Se recomienda implementar logging adicional para auditoría

## Flujo de Trabajo Recomendado

### En el Frontend
1. **Formulario**: Crear formulario con campos para contraseña actual, nueva y confirmación
2. **Validación**: Validar campos en tiempo real
3. **Confirmación**: Mostrar diálogo de confirmación antes de cambiar
4. **Cambio**: Llamar al endpoint POST
5. **Feedback**: Mostrar mensaje de éxito/error
6. **Redirección**: Redirigir al login después del cambio exitoso

### Ejemplo de Confirmación
```javascript
async confirmarCambioContraseña() {
  const confirmed = await this.$confirm(
    '¿Estás seguro de que deseas cambiar tu contraseña? Tu sesión se cerrará automáticamente.',
    'Confirmar cambio de contraseña',
    {
      confirmButtonText: 'Cambiar',
      cancelButtonText: 'Cancelar',
      type: 'warning'
    }
  );
  
  if (confirmed) {
    await this.cambiarContraseña();
  }
}
```

## Integración con el Sistema Existente

### Rutas
La nueva ruta se integra con el sistema de rutas existente:
```
POST /api/auth/change-password
```

### Middleware
Utiliza los mismos middlewares de autenticación:
- `authenticateToken`: Verifica el token JWT

### Controlador
Se integra con el controlador existente `authController.js`:
- Función: `changePassword`
- Validaciones: `changePasswordValidation`
- Exportada en `module.exports`
- Manejo de errores consistente con el resto del sistema

## Mantenimiento

### Logs
Los errores se registran con el formato:
```
Error cambiando contraseña: [detalles del error]
```

### Monitoreo
Se recomienda monitorear:
- Frecuencia de cambios de contraseña
- Errores de cambio de contraseña
- Intentos fallidos de cambio de contraseña

---

## 📝 Notas de Implementación

- **Fecha de implementación**: Diciembre 2024
- **Versión**: 1.0.0
- **Compatibilidad**: Compatible con el sistema existente
- **Dependencias**: No requiere nuevas dependencias
- **Seguridad**: Implementa mejores prácticas de seguridad



