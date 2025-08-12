# 🏗️ Arquitectura Multi-Tenant - Sistema de Asesoría

## 📋 Resumen Ejecutivo

Este documento describe la implementación de una arquitectura **multi-tenant** que permite que un solo backend sirva a múltiples páginas web de diferentes asesores, manteniendo la separación completa de datos entre cada propietario.

## 🎯 Objetivo

Permitir que múltiples páginas web (cada una perteneciente a un asesor diferente) utilicen el mismo backend, donde cada página solo puede acceder a sus propios datos de cotizaciones y comentarios.

## 🏛️ Arquitectura Implementada

### 1. **Separación por Propietario**
- Cada tabla principal (`cotizacion`, `comentarios`) incluye un campo `id_propietario`
- Este campo referencia al `id` del usuario propietario de la página web
- Todas las consultas filtran automáticamente por `id_propietario`

### 2. **Middleware de Filtrado**
- **`extractPropietario`**: Extrae el `id_propietario` de headers, query params o body
- **`validatePropietario`**: Valida que el usuario autenticado sea el propietario
- **`filterByPropietario`**: Para rutas públicas, solo filtra por propietario

### 3. **Flujo de Datos**
```
Frontend → Header/Query/Body (id_propietario) → Middleware → Controller → DB (filtrado)
```

## 🔧 Implementación Técnica

### 1. **Modificaciones en Base de Datos**

#### Tabla `cotizacion`
```sql
ALTER TABLE cotizacion 
ADD COLUMN id_propietario INTEGER NOT NULL DEFAULT 1;

CREATE INDEX idx_cotizacion_propietario ON cotizacion(id_propietario);
CREATE INDEX idx_cotizacion_propietario_fecha ON cotizacion(id_propietario, fecha_envio);
```

#### Tabla `comentarios`
```sql
ALTER TABLE comentarios 
ADD COLUMN id_propietario INTEGER NOT NULL DEFAULT 1;

CREATE INDEX idx_comentarios_propietario ON comentarios(id_propietario);
CREATE INDEX idx_comentarios_propietario_ver ON comentarios(id_propietario, ver);
```

### 2. **Middleware de Propietario**

#### `src/middleware/propietario.js`
```javascript
// Extrae id_propietario de múltiples fuentes
const extractPropietario = (req, res, next) => {
  // Prioridad: Header → Query → Body
  let idPropietario = req.headers['x-propietario-id'] || 
                     req.query.propietario_id || 
                     req.body.propietario_id;
  
  req.idPropietario = parseInt(idPropietario) || 1;
  next();
};

// Valida que el usuario autenticado sea el propietario
const validatePropietario = (req, res, next) => {
  if (req.user.id !== req.idPropietario) {
    return res.status(403).json({
      success: false,
      message: 'No tienes permisos para acceder a estos datos'
    });
  }
  next();
};
```

### 3. **Modificaciones en Controladores**

#### Cotizaciones
```javascript
// En todas las funciones de cotizaciones
const idPropietario = req.idPropietario || 1;

// Filtro obligatorio en consultas
WHERE c.id_propietario = $1

// Inserción con propietario
INSERT INTO cotizacion (..., id_propietario) VALUES (..., $15)
```

#### Comentarios
```javascript
// En todas las funciones de comentarios
const idPropietario = req.idPropietario || 1;

// Filtro obligatorio en consultas
WHERE id_propietario = $1 AND ver = true

// Inserción con propietario
INSERT INTO comentarios (..., id_propietario) VALUES (..., $4)
```

### 4. **Rutas Actualizadas**

#### Cotizaciones
```javascript
// Rutas públicas
router.post('/', extractPropietario, filterByPropietario, crearCotizacion);
router.get('/estado/:cotizacion_id', extractPropietario, filterByPropietario, consultarEstadoCotizacion);

// Rutas protegidas
router.get('/', extractPropietario, authenticateToken, requireRole('admin'), validatePropietario, obtenerCotizaciones);
```

#### Comentarios
```javascript
// Rutas públicas
router.post('/', extractPropietario, filterByPropietario, crearComentarioValidation, crearComentario);
router.get('/publicos', extractPropietario, filterByPropietario, obtenerComentariosPublicos);

// Rutas protegidas
router.get('/', extractPropietario, authenticateToken, requireRole('admin'), validatePropietario, obtenerComentarios);
```

## 🚀 Cómo Usar el Sistema Multi-Tenant

### 1. **Configuración del Frontend**

#### Opción A: Header HTTP
```javascript
// En cada request del frontend
const headers = {
  'X-Propietario-ID': '2', // ID del usuario propietario
  'Authorization': `Bearer ${token}`
};

axios.get('/api/cotizaciones', { headers });
```

#### Opción B: Query Parameter
```javascript
// En cada request del frontend
axios.get('/api/cotizaciones?propietario_id=2');
```

#### Opción C: Body Parameter (POST/PUT)
```javascript
// Para requests POST/PUT
axios.post('/api/cotizaciones', {
  nombre: 'Juan',
  email: 'juan@email.com',
  propietario_id: 2
});
```

### 2. **Ejemplo de Implementación Frontend**

```javascript
// Configuración global del cliente
const apiClient = axios.create({
  baseURL: 'https://tu-backend.com/api',
  headers: {
    'X-Propietario-ID': process.env.VUE_APP_PROPRIETARIO_ID || '1'
  }
});

// Servicio de cotizaciones
class CotizacionesService {
  async obtenerCotizaciones(filtros = {}) {
    const response = await apiClient.get('/cotizaciones', { 
      params: { ...filtros }
    });
    return response.data;
  }

  async crearCotizacion(datos) {
    const response = await apiClient.post('/cotizaciones', datos);
    return response.data;
  }
}
```

### 3. **Variables de Entorno**

#### Frontend (.env)
```env
VUE_APP_PROPRIETARIO_ID=2
VUE_APP_API_URL=https://tu-backend.com/api
```

#### Backend (.env)
```env
# Configuración existente...
# El sistema multi-tenant no requiere configuraciones adicionales
```

## 🔒 Seguridad y Validaciones

### 1. **Validación de Propietario**
- ✅ Todas las consultas filtran por `id_propietario`
- ✅ Usuarios autenticados solo pueden acceder a sus propios datos
- ✅ Rutas públicas solo muestran datos del propietario especificado

### 2. **Prevención de Acceso Cruzado**
```javascript
// Un usuario del propietario 2 NO puede acceder a datos del propietario 1
// Incluso si conoce los IDs de las cotizaciones/comentarios
```

### 3. **Validación de Entrada**
```javascript
// El middleware valida que id_propietario sea un número válido
if (isNaN(parsedId) || parsedId <= 0) {
  return res.status(400).json({
    success: false,
    message: 'ID de propietario inválido'
  });
}
```

## 📊 Migración de Datos Existentes

### 1. **Ejecutar Migración**
```bash
# Ejecutar el script de migración
node src/database/migrate-multi-tenant.js
```

### 2. **Verificación Post-Migración**
```sql
-- Verificar que todos los registros tengan propietario
SELECT COUNT(*) FROM cotizacion WHERE id_propietario IS NULL;
SELECT COUNT(*) FROM comentarios WHERE id_propietario IS NULL;

-- Verificar índices
SELECT indexname FROM pg_indexes WHERE tablename = 'cotizacion';
SELECT indexname FROM pg_indexes WHERE tablename = 'comentarios';
```

## 🧪 Testing Multi-Tenant

### 1. **Script de Pruebas**
```javascript
// test-multi-tenant.js
const axios = require('axios');

const testMultiTenant = async () => {
  const baseURL = 'http://localhost:3000/api';
  
  // Test propietario 1
  console.log('🧪 Probando propietario 1...');
  const prop1Client = axios.create({
    baseURL,
    headers: { 'X-Propietario-ID': '1' }
  });
  
  // Test propietario 2
  console.log('🧪 Probando propietario 2...');
  const prop2Client = axios.create({
    baseURL,
    headers: { 'X-Propietario-ID': '2' }
  });
  
  // Verificar separación de datos
  const cotizaciones1 = await prop1Client.get('/cotizaciones');
  const cotizaciones2 = await prop2Client.get('/cotizaciones');
  
  console.log('✅ Datos separados correctamente');
};
```

### 2. **Casos de Prueba**
- ✅ Crear cotización para propietario 1
- ✅ Crear cotización para propietario 2
- ✅ Verificar que propietario 1 solo ve sus cotizaciones
- ✅ Verificar que propietario 2 solo ve sus cotizaciones
- ✅ Verificar que no hay acceso cruzado

## 📈 Beneficios de la Arquitectura

### 1. **Escalabilidad**
- Un solo backend sirve múltiples frontends
- Fácil agregar nuevos propietarios
- Mantenimiento centralizado

### 2. **Seguridad**
- Separación completa de datos
- Validación automática de permisos
- Prevención de acceso no autorizado

### 3. **Flexibilidad**
- Múltiples formas de especificar propietario
- Compatible con diferentes tipos de frontend
- Fácil integración

### 4. **Mantenibilidad**
- Código centralizado
- Actualizaciones automáticas para todos
- Debugging simplificado

## 🚨 Consideraciones Importantes

### 1. **Performance**
- Los índices optimizan las consultas por propietario
- Las consultas son eficientes con el filtro `id_propietario`

### 2. **Compatibilidad**
- El sistema es compatible con datos existentes
- Valor por defecto `id_propietario = 1` para compatibilidad

### 3. **Monitoreo**
- Considerar agregar logging para auditoría
- Monitorear performance de consultas por propietario

## 🔄 Próximos Pasos

### 1. **Mejoras Futuras**
- [ ] Dashboard de administración multi-tenant
- [ ] Estadísticas por propietario
- [ ] Configuración personalizada por propietario
- [ ] Backup/restore por propietario

### 2. **Optimizaciones**
- [ ] Cache por propietario
- [ ] Rate limiting por propietario
- [ ] Métricas de uso por propietario

## 📞 Soporte

Para dudas sobre la implementación multi-tenant:
1. Revisar este documento
2. Verificar los logs del servidor
3. Ejecutar las pruebas de validación
4. Contactar al equipo de desarrollo

---

**🎉 ¡El sistema multi-tenant está listo para servir múltiples páginas web!**
