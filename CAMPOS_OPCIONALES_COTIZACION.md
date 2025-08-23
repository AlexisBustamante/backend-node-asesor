# Manejo de Campos Opcionales en Cotizaciones

## Descripción

El sistema de cotizaciones maneja campos opcionales de manera inteligente y simple, asignando valores por defecto apropiados automáticamente. **No se requieren validaciones complejas** ya que el sistema convierte y asigna valores por defecto de forma segura.

## Sistema de Valores por Defecto

### **Campos Numéricos**
- **`edad`**: Si está vacío → `null`, si tiene valor → se convierte a entero
- **`renta`**: Si está vacío → `0`, si tiene valor → se convierte a entero  
- **`numero_cargas`**: Si está vacío → `0`, si tiene valor → se convierte a entero
- **`valor_mensual`**: Si está vacío → `0`, si tiene valor → se convierte a entero

### **Campos de Texto**
- **`telefono`**: Si está vacío → `''` (cadena vacía)
- **`apellidos`**: Si está vacío → `''` (cadena vacía)
- **`isapre`**: Si está vacío → `''` (cadena vacía)
- **`clinica`**: Si está vacío → `''` (cadena vacía)
- **`mensaje`**: Si está vacío → `''` (cadena vacía)
- **`procedencia`**: Si está vacío → `''` (cadena vacía)
- **`tipo_ingreso`**: Si está vacío → `''` (cadena vacía)
- **`edades_cargas`**: Si está vacío → `''` (cadena vacía)

## Ventajas del Sistema Simplificado

1. **Sin Validaciones Complejas**: El sistema asigna valores por defecto automáticamente
2. **Conversión Inteligente**: Convierte strings a números cuando es posible
3. **Valores Seguros**: Usa `|| 0` para evitar `NaN` en campos numéricos
4. **Código Limpio**: Elimina la necesidad de múltiples validaciones
5. **Flexibilidad Total**: Acepta cualquier tipo de entrada del frontend

## Ejemplo de Código Simplificado

```javascript
// ❌ ANTES: Validaciones complejas y repetitivas
if (edad && edad.toString().trim() !== '') {
  edadNum = parseInt(edad);
  if (isNaN(edadNum) || edadNum < 0 || edadNum > 150) {
    return res.status(400).json({...});
  }
} else {
  edadNum = null;
}

// ✅ AHORA: Asignación simple con valores por defecto
const edadNum = edad && edad.toString().trim() !== '' ? parseInt(edad) || 0 : null;
```

## Comportamiento del Sistema

### **Conversión Automática**
- **Strings vacíos** → valores por defecto apropiados
- **`null` o `undefined`** → valores por defecto apropiados  
- **Strings numéricos** → se convierten a enteros automáticamente
- **Strings no numéricos** → se asignan como texto

### **Manejo de Errores**
- **`parseInt("abc")`** → `NaN` → **`|| 0`** → `0`
- **`parseInt("")`** → `NaN` → **`|| 0`** → `0`
- **`parseInt(null)`** → `NaN` → **`|| 0`** → `0`

## Campos Obligatorios

### **Solo el Nombre es Requerido**
- **`nombre`**: Debe tener entre 2 y 150 caracteres
- **Todos los demás campos**: Completamente opcionales

## Ejemplos de Uso

### **Caso 1: Cotización Mínima**
```json
{
  "nombre": "Juan Pérez"
}
```
**Resultado**: Se crea con todos los demás campos como valores por defecto.

### **Caso 2: Cotización Parcial**
```json
{
  "nombre": "María López",
  "edad": "25",
  "procedencia": "Instagram"
}
```
**Resultado**: Se crea con los campos proporcionados y los demás como valores por defecto.

### **Caso 3: Datos del Frontend**
```json
{
  "nombre": "Pedro García",
  "edad": "",
  "telefono": null,
  "renta": "1500000"
}
```
**Resultado**: 
- `edad`: `null` (campo numérico vacío)
- `telefono`: `''` (campo texto null)
- `renta`: `1500000` (número válido)

## Notas Importantes

- **No se requieren validaciones** en el frontend para campos opcionales
- **El sistema es tolerante** a cualquier tipo de entrada
- **Los valores por defecto** son apropiados para el negocio
- **La conversión es segura** y evita errores de base de datos
- **El código es más limpio** y mantenible
