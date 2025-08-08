# Migración: Campo Procedencia

## Descripción
Se ha agregado un nuevo campo opcional llamado `procedencia` a la tabla `cotizacion` para almacenar información sobre el origen o procedencia de las cotizaciones.

## Cambios Realizados

### 1. Base de Datos
- **Campo agregado**: `procedencia VARCHAR(255)` (permite NULL)
- **Ubicación**: Tabla `cotizacion`
- **Tipo**: Texto de hasta 255 caracteres
- **Obligatorio**: No (campo opcional)

### 2. Backend (Node.js)
- **Controlador actualizado**: `src/controllers/cotizacionController.js`
  - Validación agregada para el campo procedencia
  - Incluido en todas las operaciones CRUD
  - Agregado a los templates de email

- **Migraciones actualizadas**:
  - `src/database/migrate.js`
  - `src/database/migrate-prod.js`

### 3. Templates de Email
- **Email Admin**: `src/views/emailCotizacionAdmin.html`
- **Email Cliente**: `src/views/emailCotizacionCliente.html`
- Ambos templates ahora muestran el campo procedencia cuando está presente

## Archivos Creados/Modificados

### Nuevos Archivos
- `add_procedencia_field.sql` - Script SQL para agregar el campo
- `migrate_procedencia_field.js` - Script de migración Node.js
- `MIGRACION_PROCEDENCIA.md` - Esta documentación

### Archivos Modificados
- `src/controllers/cotizacionController.js`
- `src/database/migrate.js`
- `src/database/migrate-prod.js`
- `src/views/emailCotizacionAdmin.html`
- `src/views/emailCotizacionCliente.html`
- `create_table_cotizacion.sql`

## Instrucciones de Migración

### Opción 1: Usando el script SQL
```bash
# Ejecutar directamente en la base de datos
psql -d tu_base_de_datos -f add_procedencia_field.sql
```

### Opción 2: Usando el script Node.js
```bash
# Ejecutar el script de migración
node migrate_procedencia_field.js
```

### Opción 3: Usando las migraciones existentes
```bash
# Para desarrollo
node src/database/migrate.js

# Para producción
node src/database/migrate-prod.js
```

## Verificación

Para verificar que la migración se aplicó correctamente:

```sql
-- Verificar que el campo existe
SELECT column_name, data_type, is_nullable, character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'cotizacion' 
AND column_name = 'procedencia';

-- Verificar la estructura completa de la tabla
SELECT column_name, data_type, is_nullable, ordinal_position
FROM information_schema.columns 
WHERE table_name = 'cotizacion' 
ORDER BY ordinal_position;
```

## Uso del Campo

### En el Frontend
El campo `procedencia` se puede enviar en el body de las peticiones:

```json
{
  "nombre": "Juan",
  "apellidos": "Pérez",
  "edad": 30,
  "telefono": "912345678",
  "email": "juan@ejemplo.com",
  "isapre": "Banmédica",
  "valor_mensual": "50000",
  "clinica": "Clínica Alemana",
  "renta": "800000",
  "numero_cargas": 2,
  "edades_cargas": "5, 8",
  "procedencia": "Redes sociales",
  "mensaje": "Necesito información sobre planes"
}
```

### En las Consultas
El campo se incluye automáticamente en:
- Creación de cotizaciones
- Actualización de cotizaciones
- Consulta de cotizaciones
- Emails de notificación

## Compatibilidad

- ✅ **Retrocompatible**: El campo es opcional, por lo que no afecta las cotizaciones existentes
- ✅ **Validación**: Incluye validación de longitud máxima (255 caracteres)
- ✅ **Emails**: Se muestra en los templates de email cuando está presente
- ✅ **API**: Incluido en todas las respuestas de la API

## Notas Importantes

1. **Campo opcional**: No es obligatorio, las cotizaciones existentes no se ven afectadas
2. **Longitud máxima**: 255 caracteres
3. **Tipo de dato**: VARCHAR (texto)
4. **Permite NULL**: Sí, es un campo opcional
5. **Índices**: No se crean índices adicionales para este campo

## Rollback (si es necesario)

Si necesitas revertir la migración:

```sql
-- Eliminar el campo procedencia
ALTER TABLE cotizacion DROP COLUMN IF EXISTS procedencia;
```

**⚠️ Advertencia**: Esto eliminará todos los datos almacenados en el campo procedencia.
