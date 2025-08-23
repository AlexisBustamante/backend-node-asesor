# Solución para Error 429 (Too Many Requests) en Logout

## Problema
El endpoint `/api/auth/logout` está devolviendo error 429 (Too Many Requests) debido a la configuración restrictiva del rate limiting.

## Causas
1. **Rate limiting muy restrictivo**: 50 requests por minuto para autenticación
2. **Logout no exento**: El logout está siendo contado en el rate limiting
3. **Ventana de tiempo corta**: 1 minuto puede ser insuficiente para operaciones críticas

## Soluciones Implementadas

### 1. Modificación del Servidor (Recomendado)
Se modificó `src/server.js` para:
- Aumentar el límite de 50 a 100 requests por minuto
- Exentar el logout del rate limiting
- Hacer el sistema más permisivo para operaciones críticas

### 2. Scripts de Reseteo

#### reset-rate-limit-auth.js
Configura un nuevo rate limiter más permisivo:
```bash
node reset-rate-limit-auth.js
```

#### reset-rate-limit-simple.js
Intenta resetear el rate limiting inmediatamente:
```bash
node reset-rate-limit-simple.js
```

## Soluciones Inmediatas

### Opción 1: Esperar
- El rate limiting se resetea automáticamente cada minuto
- Espera 1-2 minutos y vuelve a intentar

### Opción 2: Reiniciar Servidor
```bash
# Detener servidor (Ctrl+C)
# Reiniciar
npm start
```

### Opción 3: Usar Script de Reseteo
```bash
node reset-rate-limit-simple.js
```

## Configuración Recomendada

### Variables de Entorno
```env
# Rate limiting más permisivo para desarrollo
RATE_LIMIT_WINDOW_MS=60000        # 1 minuto
RATE_LIMIT_MAX_REQUESTS=200       # 200 requests por minuto
```

### Configuración del Servidor
```javascript
const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,        // 1 minuto
  max: 200,                        // 200 requests por minuto
  skip: (req) => {
    // Exentar operaciones críticas
    return req.path === '/logout' || 
           req.path.endsWith('/logout') ||
           req.path === '/refresh-token';
  }
});
```

## Prevención

### 1. Monitoreo
- Revisar logs del servidor para identificar picos de requests
- Implementar alertas cuando se alcance el 80% del límite

### 2. Configuración Adaptativa
- Límites más altos en desarrollo
- Límites moderados en staging
- Límites estrictos solo en producción

### 3. Excepciones para Operaciones Críticas
- Logout siempre debe funcionar
- Refresh token debe ser confiable
- Operaciones de seguridad no deben fallar por rate limiting

## Verificación
Para verificar que la solución funciona:

1. **Reinicia el servidor**
2. **Intenta hacer logout**
3. **Verifica que no hay error 429**
4. **Revisa los logs del servidor**

## Notas Importantes
- El rate limiting es una medida de seguridad importante
- No lo desactives completamente en producción
- Configura límites apropiados para tu caso de uso
- Monitorea el comportamiento del sistema regularmente
