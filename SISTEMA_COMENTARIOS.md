# Sistema de Comentarios - Documentación Completa

## Resumen

Se ha implementado un sistema completo de comentarios que permite a los clientes dejar reseñas y a los administradores gestionar su visibilidad. El sistema incluye calificaciones por estrellas, validaciones robustas y estadísticas detalladas.

## Estructura de la Base de Datos

### Tabla `comentarios`

```sql
CREATE TABLE comentarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    estrellas INTEGER NOT NULL CHECK (estrellas >= 1 AND estrellas <= 5),
    comentario TEXT NOT NULL,
    ver BOOLEAN DEFAULT false,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Campos
- **id**: Identificador único autoincremental
- **nombre**: Nombre del cliente (2-100 caracteres)
- **estrellas**: Calificación de 1 a 5 estrellas
- **comentario**: Texto del comentario (10-1000 caracteres)
- **ver**: Control de visibilidad (true/false)
- **fecha_creacion**: Fecha y hora de creación
- **fecha_actualizacion**: Fecha y hora de última modificación

### Índices
- `idx_comentarios_ver`: Para filtrar por visibilidad
- `idx_comentarios_fecha`: Para ordenar por fecha

## Funcionalidades Implementadas

### 🔓 Funcionalidades Públicas

#### 1. Crear Comentario
- **Endpoint**: `POST /api/comentarios`
- **Acceso**: Público
- **Validaciones**:
  - Nombre: 2-100 caracteres
  - Estrellas: 1-5
  - Comentario: 10-1000 caracteres
- **Comportamiento**: Los comentarios públicos se crean con `ver = false` por defecto

```json
{
  "nombre": "María González",
  "estrellas": 5,
  "comentario": "Excelente servicio, muy profesional y atenta."
}
```

#### 2. Obtener Comentarios Públicos
- **Endpoint**: `GET /api/comentarios/publicos`
- **Acceso**: Público
- **Filtros**: Solo comentarios con `ver = true`
- **Incluye**: Estadísticas de promedio de estrellas

```json
{
  "success": true,
  "data": {
    "comentarios": [...],
    "pagination": {...},
    "estadisticas": {
      "promedio_estrellas": 4.5,
      "total_comentarios": 25
    }
  }
}
```

### 🔐 Funcionalidades de Administrador

#### 1. Crear Comentario desde Admin
- **Endpoint**: `POST /api/comentarios/admin`
- **Acceso**: Solo administradores
- **Diferencias**: Permite establecer `ver` directamente

```json
{
  "nombre": "Juan Pérez",
  "estrellas": 4,
  "comentario": "Muy buen servicio, respondieron todas mis dudas.",
  "ver": true
}
```

#### 2. Obtener Todos los Comentarios
- **Endpoint**: `GET /api/comentarios`
- **Acceso**: Solo administradores
- **Filtros disponibles**:
  - `search`: Búsqueda en nombre y comentario
  - `ver`: Filtrar por visibilidad (true/false)
  - `estrellas`: Filtrar por calificación específica
  - `page`, `limit`: Paginación

#### 3. Obtener Comentario por ID
- **Endpoint**: `GET /api/comentarios/:id`
- **Acceso**: Solo administradores

#### 4. Actualizar Comentario
- **Endpoint**: `PUT /api/comentarios/:id`
- **Acceso**: Solo administradores
- **Campos opcionales**: nombre, estrellas, comentario, ver

#### 5. Eliminar Comentario
- **Endpoint**: `DELETE /api/comentarios/:id`
- **Acceso**: Solo administradores

#### 6. Cambiar Visibilidad
- **Endpoint**: `PATCH /api/comentarios/:id/visibilidad`
- **Acceso**: Solo administradores
- **Comportamiento**: Toggle automático del estado `ver`

#### 7. Obtener Estadísticas
- **Endpoint**: `GET /api/comentarios/estadisticas`
- **Acceso**: Solo administradores
- **Incluye**:
  - Total de comentarios
  - Comentarios visibles/ocultos
  - Promedio de estrellas
  - Distribución por calificación
  - Estadísticas por tiempo (hoy, semana, mes)
  - Estadísticas por mes (últimos 6 meses)

## Validaciones Implementadas

### Validaciones de Entrada
- **Nombre**: 2-100 caracteres, requerido
- **Estrellas**: 1-5, requerido, entero
- **Comentario**: 10-1000 caracteres, requerido
- **Ver**: Boolean opcional (solo admin)

### Validaciones de Base de Datos
- **Check constraint**: Estrellas entre 1 y 5
- **Not null**: Todos los campos requeridos
- **Default values**: Fechas automáticas

## Endpoints Completos

### Rutas Públicas
```
POST   /api/comentarios                    # Crear comentario
GET    /api/comentarios/publicos          # Obtener comentarios públicos
```

### Rutas de Administrador
```
GET    /api/comentarios                   # Obtener todos los comentarios
GET    /api/comentarios/:id               # Obtener comentario específico
POST   /api/comentarios/admin             # Crear comentario desde admin
PUT    /api/comentarios/:id               # Actualizar comentario
DELETE /api/comentarios/:id               # Eliminar comentario
PATCH  /api/comentarios/:id/visibilidad   # Cambiar visibilidad
GET    /api/comentarios/estadisticas      # Obtener estadísticas
```

## Ejemplos de Uso

### Crear Comentario Público
```bash
curl -X POST http://localhost:3000/api/comentarios \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Ana López",
    "estrellas": 5,
    "comentario": "Servicio excepcional, muy recomendado."
  }'
```

### Obtener Comentarios Públicos
```bash
curl http://localhost:3000/api/comentarios/publicos
```

### Crear Comentario desde Admin
```bash
curl -X POST http://localhost:3000/api/comentarios/admin \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Carlos Ruiz",
    "estrellas": 4,
    "comentario": "Buen servicio, muy profesional.",
    "ver": true
  }'
```

### Filtrar Comentarios
```bash
curl "http://localhost:3000/api/comentarios?search=excelente&ver=true&estrellas=5" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Cambiar Visibilidad
```bash
curl -X PATCH http://localhost:3000/api/comentarios/1/visibilidad \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Estadísticas Disponibles

### Estadísticas Generales
- Total de comentarios
- Comentarios visibles vs ocultos
- Promedio de estrellas
- Distribución por calificación (1-5 estrellas)

### Estadísticas Temporales
- Comentarios de hoy
- Comentarios de esta semana
- Comentarios de este mes
- Estadísticas por mes (últimos 6 meses)

### Ejemplo de Respuesta de Estadísticas
```json
{
  "success": true,
  "data": {
    "total_comentarios": 150,
    "comentarios_visibles": 120,
    "comentarios_ocultos": 30,
    "promedio_estrellas": 4.3,
    "cinco_estrellas": 75,
    "cuatro_estrellas": 45,
    "tres_estrellas": 20,
    "dos_estrellas": 7,
    "una_estrella": 3,
    "comentarios_hoy": 5,
    "comentarios_esta_semana": 25,
    "comentarios_este_mes": 80,
    "porMes": [...]
  }
}
```

## Flujo de Trabajo

### Para Clientes
1. **Crear comentario**: Envían comentario público
2. **Estado inicial**: `ver = false` (oculto)
3. **Revisión**: Administrador revisa el comentario
4. **Aprobación**: Administrador cambia `ver = true`
5. **Publicación**: Comentario visible en frontend

### Para Administradores
1. **Revisar**: Ver todos los comentarios (visibles y ocultos)
2. **Gestionar**: Aprobar/rechazar comentarios
3. **Crear**: Agregar comentarios directamente
4. **Editar**: Modificar comentarios existentes
5. **Eliminar**: Remover comentarios inapropiados
6. **Analizar**: Revisar estadísticas y tendencias

## Seguridad

### Autenticación
- Rutas públicas: Sin autenticación
- Rutas de admin: Requieren token JWT válido
- Validación de roles: Solo administradores

### Validación de Datos
- Sanitización de entrada
- Validación de tipos de datos
- Límites de longitud
- Validación de rangos numéricos

### Control de Acceso
- Separación clara entre funcionalidades públicas y privadas
- Middleware de autenticación en rutas protegidas
- Validación de permisos por rol

## Pruebas

### Script de Pruebas
Se incluye `test-comentarios.js` con pruebas completas:
- Creación de comentarios públicos y admin
- Obtención de comentarios y estadísticas
- Filtros y búsquedas
- Cambio de visibilidad
- Validaciones de entrada

### Ejecutar Pruebas
```bash
node test-comentarios.js
```

## Migración

### Ejecutar Migración
```bash
node src/database/migrate-prod.js
```

### Script SQL Independiente
```bash
psql -d tu_base_de_datos -f create_table_comentarios.sql
```

## Próximos Pasos

1. **Frontend**: Implementar interfaz de usuario
2. **Notificaciones**: Email a admin cuando hay nuevos comentarios
3. **Moderación**: Sistema automático de detección de spam
4. **Respuestas**: Permitir respuestas a comentarios
5. **Fotos**: Adjuntar imágenes a comentarios
6. **Reportes**: Sistema de reportes de comentarios inapropiados

## Notas Técnicas

- **Rendimiento**: Índices optimizados para consultas frecuentes
- **Escalabilidad**: Estructura preparada para alto volumen
- **Mantenibilidad**: Código modular y bien documentado
- **Compatibilidad**: API RESTful estándar
- **Extensibilidad**: Fácil agregar nuevas funcionalidades
