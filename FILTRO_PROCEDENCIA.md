# Filtro de Procedencia - Implementación

## Resumen

Se ha implementado exitosamente el filtro de **procedencia** en los filtros de búsqueda de cotizaciones. Este filtro permite a los administradores filtrar las cotizaciones por el origen o fuente de donde provienen los clientes.

## Cambios Realizados

### 1. Controlador de Cotizaciones (`src/controllers/cotizacionController.js`)

#### Función `obtenerCotizaciones`
- ✅ **Agregado parámetro de filtro**: `procedencia`
- ✅ **Implementado filtro ILIKE**: Búsqueda parcial insensible a mayúsculas/minúsculas
- ✅ **Integrado con filtros existentes**: Compatible con todos los demás filtros

```javascript
// Nuevo parámetro agregado
const procedencia = req.query.procedencia || '';

// Nuevo filtro implementado
if (procedencia) {
  paramCount++;
  whereConditions.push(`c.procedencia ILIKE $${paramCount}`);
  queryParams.push(`%${procedencia}%`);
}
```

#### Función `obtenerOpcionesFiltros`
- ✅ **Agregada consulta de procedencias únicas**: Obtiene todas las procedencias disponibles
- ✅ **Incluida en respuesta**: Las procedencias se devuelven junto con otros filtros

```javascript
// Nueva consulta agregada
const procedenciasResult = await query(`
  SELECT DISTINCT procedencia 
  FROM cotizacion 
  WHERE procedencia IS NOT NULL AND procedencia != ''
  ORDER BY procedencia
`);

// Incluida en la respuesta
procedencias: procedenciasResult.rows.map(row => row.procedencia)
```

## Funcionalidades Disponibles

### Filtros Actuales
1. **Búsqueda general** (`search`): Busca en nombre, apellidos, email, cotizacion_id
2. **Estado** (`estado`): pendiente, en_revision, contactado, cotizado, cerrado
3. **ISAPRE** (`isapre`): Filtro por ISAPRE específica
4. **Clínica** (`clinica`): Filtro por clínica específica
5. **🆕 Procedencia** (`procedencia`): Filtro por origen/fuente del cliente
6. **Fecha desde** (`fechaDesde`): Filtro por fecha de inicio
7. **Fecha hasta** (`fechaHasta`): Filtro por fecha de fin

### Endpoints Afectados

#### GET `/api/cotizaciones`
- **Nuevo parámetro**: `procedencia`
- **Uso**: `GET /api/cotizaciones?procedencia=instagram`
- **Combinación**: Se puede combinar con otros filtros

#### GET `/api/cotizaciones/filtros`
- **Nueva respuesta**: Incluye array `procedencias` con todas las opciones disponibles
- **Uso**: Para poblar dropdowns en el frontend

## Ejemplos de Uso

### 1. Filtrar por procedencia específica
```bash
GET /api/cotizaciones?procedencia=instagram
```

### 2. Combinar múltiples filtros
```bash
GET /api/cotizaciones?procedencia=facebook&estado=pendiente&limit=10
```

### 3. Obtener opciones de filtros
```bash
GET /api/cotizaciones/filtros
```
**Respuesta:**
```json
{
  "success": true,
  "data": {
    "isapres": ["Banmédica", "Colmena", "Consalud"],
    "clinicas": ["Clínica Alemana", "Clínica Las Condes"],
    "procedencias": ["Instagram", "Facebook", "Página Web", "WhatsApp"],
    "estados": [...]
  }
}
```

## Base de Datos

### Campo `procedencia`
- **Tipo**: `VARCHAR(255)`
- **Estado**: ✅ Ya existe en la tabla `cotizacion`
- **Migración**: ✅ Incluida en `migrate-prod.js`
- **Índices**: No requiere índices adicionales para el volumen actual

### Valores Típicos
- Instagram
- Facebook
- Página Web
- WhatsApp
- Referido
- Google Ads
- Otros

## Estadísticas

El campo `procedencia` ya está incluido en las estadísticas:
- ✅ **Estadísticas generales**: Conteo por procedencia
- ✅ **Estadísticas por mes**: Procedencias más populares por mes
- ✅ **Estadísticas por semana**: Procedencias más populares por semana
- ✅ **Estadísticas específicas**: Instagram, Facebook, Página Web, WhatsApp

## Pruebas

Se incluye un script de prueba (`test-procedencia-filter.js`) para verificar:
- ✅ Obtención de opciones de filtros
- ✅ Filtrado por procedencia específica
- ✅ Búsqueda general que incluya procedencia

## Compatibilidad

- ✅ **Backward compatible**: No afecta funcionalidades existentes
- ✅ **Frontend ready**: El frontend puede usar inmediatamente el nuevo filtro
- ✅ **API compatible**: Mantiene la estructura de respuesta existente

## Próximos Pasos

1. **Frontend**: Actualizar la interfaz para incluir el filtro de procedencia
2. **Testing**: Ejecutar pruebas con datos reales
3. **Documentación**: Actualizar documentación de la API
4. **Monitoreo**: Verificar el rendimiento del nuevo filtro

## Notas Técnicas

- **Rendimiento**: El filtro ILIKE es eficiente para el volumen actual
- **Seguridad**: No requiere cambios en autenticación/autorización
- **Escalabilidad**: Si el volumen crece, considerar índices en el campo `procedencia`
