# 🗑️ Funcionalidad de Eliminar Cotizaciones

## Resumen

Se ha implementado la funcionalidad para que los administradores puedan eliminar cotizaciones desde el panel de administración. Esta funcionalidad incluye validaciones de seguridad y manejo de errores.

## Endpoint

### Eliminar Cotización

**DELETE** `/api/cotizaciones/:id`

Elimina una cotización específica del sistema.

#### Parámetros de URL
- `id` (number, requerido): ID de la cotización a eliminar

#### Headers Requeridos
```
Authorization: Bearer <access_token>
```

#### Respuesta Exitosa (200)
```json
{
  "success": true,
  "message": "Cotización eliminada exitosamente",
  "data": {
    "id": 123,
    "nombre": "Juan Pérez",
    "email": "juan@ejemplo.com"
  }
}
```

#### Respuesta de Error (404)
```json
{
  "success": false,
  "message": "Cotización no encontrada"
}
```

#### Respuesta de Error (401)
```json
{
  "success": false,
  "message": "Token de acceso inválido"
}
```

#### Respuesta de Error (403)
```json
{
  "success": false,
  "message": "Acceso denegado. Se requieren permisos de administrador"
}
```

#### Respuesta de Error (500)
```json
{
  "success": false,
  "message": "Error interno del servidor"
}
```

## Seguridad

### Autenticación
- Requiere token JWT válido
- Solo administradores pueden eliminar cotizaciones

### Validaciones
- Verifica que la cotización existe antes de eliminar
- Valida permisos de administrador
- Manejo de errores de base de datos

## Implementación en el Frontend

### Servicio (cotizacionesService.js)
```javascript
async deleteCotizacion(cotizacionId) {
  try {
    const response = await api.delete(`/cotizaciones/${cotizacionId}`)
    return response.data
  } catch (error) {
    throw error
  }
}
```

### Uso en Componente Vue
```javascript
// En el método del componente
async eliminarCotizacion(cotizacionId) {
  try {
    const result = await this.cotizacionesService.deleteCotizacion(cotizacionId)
    
    if (result.success) {
      // Mostrar mensaje de éxito
      this.$toast.success(result.message)
      
      // Recargar lista de cotizaciones
      await this.loadCotizaciones()
    }
  } catch (error) {
    // Manejar error
    this.$toast.error(error.response?.data?.message || 'Error eliminando cotización')
  }
}
```

## Ejemplos de Uso

### cURL
```bash
# Eliminar cotización con ID 123
curl -X DELETE http://localhost:3000/api/cotizaciones/123 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### JavaScript (Axios)
```javascript
const eliminarCotizacion = async (id) => {
  try {
    const response = await axios.delete(`/api/cotizaciones/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Cotización eliminada:', response.data);
  } catch (error) {
    console.error('Error:', error.response.data);
  }
};
```

### JavaScript (Fetch)
```javascript
const eliminarCotizacion = async (id) => {
  try {
    const response = await fetch(`/api/cotizaciones/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('Cotización eliminada:', data);
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
Se ha creado un script de pruebas completo en `test-eliminar-cotizacion.js` que incluye:

1. **Verificación de existencia**: Confirma que la cotización existe antes de eliminar
2. **Eliminación exitosa**: Prueba la eliminación de una cotización válida
3. **Verificación post-eliminación**: Confirma que la cotización ya no existe
4. **Manejo de errores**: Prueba intentar eliminar cotizaciones inexistentes
5. **Seguridad**: Verifica que se requiere autenticación

### Ejecutar Pruebas
```bash
# Instalar dependencias si no están instaladas
npm install axios

# Ejecutar pruebas (reemplazar ADMIN_TOKEN con un token válido)
node test-eliminar-cotizacion.js
```

## Consideraciones Importantes

### ⚠️ Advertencias
- **Eliminación permanente**: Esta operación elimina permanentemente la cotización de la base de datos
- **Sin confirmación**: El endpoint no incluye confirmación, debe implementarse en el frontend
- **Sin respaldo**: No se crea respaldo automático antes de eliminar

### 🔒 Seguridad
- Solo administradores pueden eliminar cotizaciones
- Se valida la existencia de la cotización antes de eliminar
- Se registran errores en el servidor para auditoría

### 📊 Auditoría
- Los errores de eliminación se registran en los logs del servidor
- Se recomienda implementar logging adicional para auditoría

## Flujo de Trabajo Recomendado

### En el Frontend
1. **Confirmación**: Mostrar diálogo de confirmación antes de eliminar
2. **Validación**: Verificar que el usuario tiene permisos
3. **Eliminación**: Llamar al endpoint DELETE
4. **Feedback**: Mostrar mensaje de éxito/error
5. **Actualización**: Recargar la lista de cotizaciones

### Ejemplo de Confirmación
```javascript
async confirmarEliminacion(cotizacionId, nombreCliente) {
  const confirmed = await this.$confirm(
    `¿Estás seguro de que deseas eliminar la cotización de ${nombreCliente}?`,
    'Confirmar eliminación',
    {
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      type: 'warning'
    }
  );
  
  if (confirmed) {
    await this.eliminarCotizacion(cotizacionId);
  }
}
```

## Integración con el Sistema Existente

### Rutas
La nueva ruta se integra con el sistema de rutas existente:
```
DELETE /api/cotizaciones/:id
```

### Middleware
Utiliza los mismos middlewares de autenticación y autorización:
- `authenticateToken`: Verifica el token JWT
- `requireRole('admin')`: Verifica permisos de administrador

### Controlador
Se integra con el controlador existente `cotizacionController.js`:
- Función: `eliminarCotizacion`
- Exportada en `module.exports`
- Manejo de errores consistente con el resto del sistema

## Mantenimiento

### Logs
Los errores se registran con el formato:
```
Error eliminando cotización: [detalles del error]
```

### Monitoreo
Se recomienda monitorear:
- Frecuencia de eliminaciones
- Errores de eliminación
- Intentos de eliminación sin autorización

---

## 📝 Notas de Implementación

- **Fecha de implementación**: Diciembre 2024
- **Versión**: 1.0.0
- **Compatibilidad**: Compatible con el sistema existente
- **Dependencias**: No requiere nuevas dependencias
