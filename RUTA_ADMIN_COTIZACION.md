# Nueva Ruta: Crear Cotización desde Panel de Administración

## Descripción
Se ha agregado una nueva ruta para que los administradores puedan crear cotizaciones directamente desde el panel de administración sin enviar emails automáticos.

## Nueva Ruta

### Endpoint
```
POST /api/cotizaciones/admin
```

### Autenticación
- **Requerida**: Sí
- **Rol requerido**: `admin`
- **Token**: Bearer token en header `Authorization`

### Headers
```
Content-Type: application/json
Authorization: Bearer <token>
```

## Campos del Body

### Campos Obligatorios
```json
{
  "nombre": "string (2-150 caracteres)",
  "edad": "number",
  "telefono": "string",
  "isapre": "string",
  "clinica": "string",
  "renta": "string",
  "numero_cargas": "number",
  "edades_cargas": "string"
}
```

### Campos Opcionales
```json
{
  "apellidos": "string",
  "email": "string (formato válido)",
  "valor_mensual": "string",
  "mensaje": "string (máximo 1000 caracteres)",
  "procedencia": "string (máximo 255 caracteres)"
}
```

## Ejemplo de Request

```json
{
  "nombre": "Juan Carlos",
  "apellidos": "Pérez González",
  "edad": 35,
  "telefono": "912345678",
  "email": "juan.perez@ejemplo.com",
  "isapre": "Banmédica",
  "valor_mensual": "45000",
  "clinica": "Clínica Alemana",
  "renta": "850000",
  "numero_cargas": 2,
  "edades_cargas": "8, 12",
  "procedencia": "Referido de cliente",
  "mensaje": "Cliente interesado en plan familiar"
}
```

## Respuesta Exitosa

### Status: 201 Created
```json
{
  "success": true,
  "message": "Cotización creada exitosamente desde el panel de administración.",
  "data": {
    "id": 123,
    "cotizacion_id": "COT-20241201-0001",
    "nombre": "Juan Carlos",
    "apellidos": "Pérez González",
    "email": "juan.perez@ejemplo.com",
    "fecha_envio": "2024-12-01T10:30:00.000Z"
  }
}
```

## Respuestas de Error

### Campos Obligatorios Faltantes
```json
{
  "success": false,
  "message": "Todos los campos marcados con * son obligatorios"
}
```

### Email Inválido
```json
{
  "success": false,
  "message": "El formato del email no es válido"
}
```

### Nombre Muy Corto/Largo
```json
{
  "success": false,
  "message": "El nombre debe tener entre 2 y 150 caracteres"
}
```

### Error de Autenticación
```json
{
  "success": false,
  "message": "Token no válido"
}
```

### Error de Autorización
```json
{
  "success": false,
  "message": "Acceso denegado. Se requiere rol de administrador."
}
```

## Diferencias con la Ruta Pública

| Aspecto | Ruta Pública (`POST /`) | Ruta Admin (`POST /admin`) |
|---------|------------------------|---------------------------|
| **Autenticación** | No requerida | Requerida (rol admin) |
| **Emails** | Envía emails automáticos | No envía emails |
| **Email** | Obligatorio | Opcional |
| **Validación** | Misma validación | Misma validación |
| **ID Generado** | Mismo formato | Mismo formato |
| **Estado inicial** | 'pendiente' | 'pendiente' |

## Uso en el Frontend

### Ejemplo con Fetch
```javascript
const crearCotizacionAdmin = async (datosCotizacion) => {
  try {
    const response = await fetch('/api/cotizaciones/admin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(datosCotizacion)
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('Cotización creada:', result.data);
      return result.data;
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('Error creando cotización:', error);
    throw error;
  }
};
```

### Ejemplo con Axios
```javascript
const crearCotizacionAdmin = async (datosCotizacion) => {
  try {
    const response = await axios.post('/api/cotizaciones/admin', datosCotizacion, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    return response.data.data;
  } catch (error) {
    console.error('Error creando cotización:', error.response?.data?.message || error.message);
    throw error;
  }
};
```

## Validaciones Implementadas

1. **Campos obligatorios**: Todos los campos marcados con * deben estar presentes
2. **Formato de email**: Si se proporciona, debe ser un email válido (opcional)
3. **Longitud del nombre**: Entre 2 y 150 caracteres
4. **Autenticación**: Token válido requerido
5. **Autorización**: Rol de administrador requerido

## Notas Importantes

- ✅ **Sin emails**: No se envían emails automáticos al crear desde el panel
- ✅ **Email opcional**: El campo email es opcional para administradores
- ✅ **ID único**: Genera IDs únicos con el mismo formato
- ✅ **Auditoría**: Registra quién creó la cotización (usuario autenticado)
- ✅ **Seguridad**: Solo administradores pueden acceder

## Archivos Modificados

- `src/controllers/cotizacionController.js` - Nueva función `crearCotizacionAdmin`
- `src/routes/cotizaciones.js` - Nueva ruta `POST /admin`

## Testing

Para probar la nueva ruta:

1. **Obtener token de administrador**:
   ```bash
   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email": "admin@ejemplo.com", "password": "password"}'
   ```

2. **Crear cotización**:
   ```bash
   curl -X POST http://localhost:3000/api/cotizaciones/admin \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer <token>" \
     -d '{
       "nombre": "Test User",
       "edad": 30,
       "telefono": "912345678",
       "email": "test@ejemplo.com",
       "isapre": "Banmédica",
       "clinica": "Clínica Alemana",
       "renta": "800000",
       "numero_cargas": 1,
       "edades_cargas": "5"
     }'
   ```
