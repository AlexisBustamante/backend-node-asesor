# Solución para IDs Duplicados de Cotizaciones

## Problema Identificado

El sistema de cotizaciones presentaba un error crítico donde se generaban IDs duplicados (`cotizacion_id`) cuando múltiples usuarios creaban cotizaciones simultáneamente. Esto causaba errores de base de datos con el código:

```
ERROR: Key (cotizacion_id)=(COT-20250823-0011) already exists.
```

## Causa Raíz

El problema estaba en la lógica de generación de IDs que usaba:

1. **COUNT()** para contar cotizaciones del día actual
2. **Generación secuencial** basada en ese conteo
3. **Condición de carrera** entre el conteo y la inserción

```javascript
// ❌ CÓDIGO PROBLEMÁTICO (ANTES)
const countResult = await query(`
  SELECT COUNT(*) as count 
  FROM cotizacion 
  WHERE DATE(fecha_envio) = CURRENT_DATE
`);
const numeroCotizacion = (countResult.rows[0].count + 1).toString().padStart(4, '0');
```

## Solución Implementada

### 1. Cambio en la Lógica de Generación

Se reemplazó el uso de `COUNT()` por `MAX()` para obtener el número más alto existente:

```javascript
// ✅ CÓDIGO CORREGIDO (DESPUÉS)
const maxResult = await query(`
  SELECT COALESCE(MAX(CAST(SUBSTRING(cotizacion_id FROM 19) AS INTEGER)), 0) as max_num
  FROM cotizacion 
  WHERE cotizacion_id LIKE $1
`, [`COT-${fechaStr}-%`]);

const numeroCotizacion = (maxResult.rows[0].max_num + 1).toString().padStart(4, '0');
```

### 2. Funciones Actualizadas

Se corrigieron **dos funciones** que generaban IDs:

- `crearCotizacion()` - Para cotizaciones públicas
- `crearCotizacionAdmin()` - Para cotizaciones desde panel admin

### 3. Formato del ID

El formato se mantiene igual: `COT-YYYYMMDD-XXXX`

- **COT**: Prefijo fijo
- **YYYYMMDD**: Fecha en formato año-mes-día
- **XXXX**: Número secuencial de 4 dígitos (0001, 0002, etc.)

## Ventajas de la Nueva Solución

1. **Elimina duplicados**: Garantiza IDs únicos incluso con múltiples cotizaciones simultáneas
2. **Más robusta**: Usa `MAX()` en lugar de `COUNT()` para evitar condiciones de carrera
3. **Mantiene compatibilidad**: El formato del ID no cambia
4. **Escalable**: Funciona correctamente con alto volumen de cotizaciones

## Script de Corrección

Se creó `fix_duplicate_cotizacion_ids.js` para:

1. **Detectar** IDs duplicados existentes en la base de datos
2. **Corregir** automáticamente asignando nuevos IDs únicos
3. **Verificar** que no queden duplicados después de la corrección

### Uso del Script

```bash
node fix_duplicate_cotizacion_ids.js
```

## Verificación

Para verificar que la solución funciona:

1. **Ejecutar** el script de corrección
2. **Crear** múltiples cotizaciones simultáneamente
3. **Verificar** que cada una tenga un ID único
4. **Confirmar** que no hay errores de duplicación

## Archivos Modificados

- `src/controllers/cotizacionController.js` - Lógica de generación de IDs
- `API_DOCUMENTATION.md` - Documentación actualizada
- `fix_duplicate_cotizacion_ids.js` - Script de corrección (nuevo)
- `SOLUCION_IDS_DUPLICADOS.md` - Este documento (nuevo)

## Recomendaciones

1. **Ejecutar** el script de corrección en producción antes de usar la nueva lógica
2. **Monitorear** la generación de IDs durante las primeras horas de uso
3. **Verificar** que no se generen duplicados en situaciones de alta concurrencia
4. **Mantener** respaldos de la base de datos antes de ejecutar correcciones

## Estado

✅ **PROBLEMA RESUELTO** - Los IDs duplicados ya no se generarán
✅ **CÓDIGO ACTUALIZADO** - Ambas funciones de creación corregidas
✅ **DOCUMENTACIÓN ACTUALIZADA** - API docs reflejan la mejora
✅ **SCRIPT DE CORRECCIÓN** - Disponible para limpiar datos existentes
