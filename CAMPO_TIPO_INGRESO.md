# Campo Tipo Ingreso - Implementación

## Resumen
Se ha agregado exitosamente el campo `tipo_ingreso` a la tabla de cotizaciones y se han actualizado todos los controladores y funciones relacionadas.

## Cambios Realizados

### 1. Base de Datos
- **Archivo**: `add_tipo_ingreso_field.sql`
- **Descripción**: Script SQL para agregar el campo `tipo_ingreso` a la tabla `cotizacion`
- **Tipo de campo**: VARCHAR(100)
- **Índice**: Se crea un índice para mejorar el rendimiento de consultas

### 2. Script de Migración
- **Archivo**: `migrate_tipo_ingreso_field.js`
- **Descripción**: Script de migración en JavaScript para automatizar la adición del campo
- **Funcionalidades**:
  - Verifica si el campo ya existe
  - Agrega el campo si no existe
  - Crea el índice correspondiente
  - Valida que la operación se completó correctamente

### 3. Controlador de Cotizaciones
- **Archivo**: `src/controllers/cotizacionController.js`
- **Cambios realizados**:

#### Validaciones
- Se agregó validación para el campo `tipo_ingreso`
- Validación: máximo 100 caracteres, opcional, se recorta espacios

#### Función `crearCotizacion`
- Se agregó `tipo_ingreso` en el destructuring del body
- Se actualizó la consulta INSERT para incluir el nuevo campo
- Se agregó `tipo_ingreso` en los datos del email del cliente
- Se agregó `tipo_ingreso` en los datos del email del administrador

#### Función `crearCotizacionAdmin`
- Se agregó `tipo_ingreso` en el destructuring del body
- Se actualizó la consulta INSERT para incluir el nuevo campo

#### Función `obtenerCotizaciones`
- Se agregó filtro por `tipo_ingreso`
- Se incluyó el campo en la consulta SELECT
- Se agregó parámetro de query para filtrar por tipo de ingreso

#### Función `obtenerCotizacionPorId`
- Se incluyó `tipo_ingreso` en la consulta SELECT

#### Función `actualizarCotizacion`
- Se agregó `tipo_ingreso` en el destructuring del body
- Se agregó lógica de actualización para el campo
- Se incluyó en el RETURNING de la consulta UPDATE

#### Función `obtenerOpcionesFiltros`
- Se agregó consulta para obtener tipos de ingreso únicos
- Se incluyó en la respuesta para el frontend

## Cómo Ejecutar la Migración

### Opción 1: Script SQL Directo
```bash
psql -U usuario -d base_datos -f add_tipo_ingreso_field.sql
```

### Opción 2: Script de Migración JavaScript
```bash
node migrate_tipo_ingreso_field.js
```

## Estructura del Campo

```sql
ALTER TABLE cotizacion 
ADD COLUMN tipo_ingreso VARCHAR(100);

CREATE INDEX idx_cotizacion_tipo_ingreso ON cotizacion(tipo_ingreso);
```

## Validaciones

- **Tipo**: String (VARCHAR)
- **Longitud máxima**: 100 caracteres
- **Requerido**: No (opcional)
- **Formato**: Se recortan espacios automáticamente

## Filtros Disponibles

- **Búsqueda**: Se puede filtrar cotizaciones por tipo de ingreso
- **API**: `/api/cotizaciones?tipo_ingreso=valor`
- **Frontend**: Se incluye en las opciones de filtros disponibles

## Endpoints Afectados

### POST `/api/cotizaciones`
- Ahora acepta el campo `tipo_ingreso` en el body

### POST `/api/cotizaciones/admin`
- Ahora acepta el campo `tipo_ingreso` en el body

### PUT `/api/cotizaciones/:id`
- Ahora permite actualizar el campo `tipo_ingreso`

### GET `/api/cotizaciones`
- Ahora incluye `tipo_ingreso` en la respuesta
- Permite filtrar por `tipo_ingreso`

### GET `/api/cotizaciones/:id`
- Ahora incluye `tipo_ingreso` en la respuesta

### GET `/api/cotizaciones/filtros`
- Ahora incluye opciones de `tipos_ingreso` disponibles

## Emails

Los templates de email ahora incluyen el campo `tipo_ingreso`:
- Email de confirmación al cliente
- Email de notificación al administrador

## Consideraciones de Rendimiento

- Se creó un índice en el campo `tipo_ingreso` para optimizar consultas
- Las consultas de filtrado son eficientes gracias al índice
- No hay impacto significativo en el rendimiento de las operaciones existentes

## Próximos Pasos Recomendados

1. **Frontend**: Actualizar los formularios para incluir el campo `tipo_ingreso`
2. **Testing**: Probar todas las funcionalidades con el nuevo campo
3. **Documentación**: Actualizar la documentación de la API
4. **Validación**: Verificar que los emails se envíen correctamente con el nuevo campo

## Notas Importantes

- El campo es opcional, por lo que las cotizaciones existentes no se verán afectadas
- Se mantiene la compatibilidad hacia atrás
- Todos los endpoints existentes siguen funcionando normalmente
- El campo se puede dejar vacío o con valor NULL
