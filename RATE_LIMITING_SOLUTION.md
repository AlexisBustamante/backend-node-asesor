# 🔄 Solución para Rate Limiting (Error 429)

## Problema

El error `429 (Too Many Requests)` indica que has excedido el límite de solicitudes permitidas por el servidor. Esto es común durante el desarrollo cuando se hacen muchas peticiones rápidas.

## ✅ Soluciones Implementadas

### 1. **Rate Limiting Mejorado**

Se ha configurado un rate limiting más flexible para desarrollo:

- **Desarrollo**: 1000 requests por minuto
- **Producción**: 100 requests por 15 minutos
- **Autenticación**: 50 requests por minuto (más permisivo)

### 2. **Configuración Específica por Rutas**

```javascript
// Rate limiting específico para autenticación
app.use('/api/auth', authLimiter);

// Rate limiting general para el resto
app.use(generalLimiter);
```

## 🚀 Soluciones Inmediatas

### Opción 1: Reiniciar el Servidor (Recomendado)

```bash
# Detener el servidor (Ctrl+C)
# Luego reiniciar
npm start
```

### Opción 2: Usar el Script de Reinicio

```bash
node reset-rate-limit-simple.js
```

### Opción 3: Limpiar Redis (Si usas Redis)

```bash
# Instalar redis si no está instalado
npm install redis

# Ejecutar script de limpieza
node reset-rate-limit.js
```

## 🔧 Configuración Personalizada

### Variables de Entorno

Puedes ajustar el rate limiting modificando estas variables en tu `.env`:

```env
# Rate limiting general
RATE_LIMIT_WINDOW_MS=60000        # Ventana de tiempo en ms (1 minuto)
RATE_LIMIT_MAX_REQUESTS=1000      # Máximo de requests por ventana

# Ambiente
NODE_ENV=development              # Para desarrollo más permisivo
```

### Configuración por Ambiente

```javascript
const isDevelopment = process.env.NODE_ENV !== 'production';

// Desarrollo: 1000 requests por minuto
// Producción: 100 requests por 15 minutos
```

## 📊 Monitoreo

### Verificar Rate Limiting

Puedes verificar el estado del rate limiting revisando los headers de respuesta:

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

### Logs del Servidor

El servidor registra cuando se alcanza el límite:

```
Rate limit exceeded for IP: ::ffff:127.0.0.1
```

## 🛠️ Soluciones para el Frontend

### 1. **Implementar Retry con Backoff**

```javascript
async function apiCallWithRetry(url, options, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      
      if (response.status === 429) {
        // Esperar antes de reintentar
        const waitTime = Math.pow(2, i) * 1000; // Exponential backoff
        console.log(`Rate limited, waiting ${waitTime}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
      
      return response;
    } catch (error) {
      if (i === maxRetries - 1) throw error;
    }
  }
}
```

### 2. **Manejar Error 429 en Axios**

```javascript
// Interceptor para manejar rate limiting
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 429) {
      console.log('Rate limited, retrying in 5 seconds...');
      
      return new Promise(resolve => {
        setTimeout(() => {
          resolve(axios.request(error.config));
        }, 5000);
      });
    }
    
    return Promise.reject(error);
  }
);
```

### 3. **Reducir Frecuencia de Peticiones**

```javascript
// En lugar de hacer peticiones cada segundo
setInterval(() => {
  // Hacer petición
}, 1000);

// Usar un intervalo más largo
setInterval(() => {
  // Hacer petición
}, 5000); // 5 segundos
```

## 🔍 Diagnóstico

### Verificar si es Rate Limiting

1. **Revisar el código de estado**: `429`
2. **Revisar headers de respuesta**: `X-RateLimit-*`
3. **Revisar logs del servidor**: Mensajes de rate limit

### Comandos de Diagnóstico

```bash
# Verificar si Redis está corriendo (si usas Redis)
redis-cli ping

# Verificar claves de rate limiting
redis-cli keys "*rate-limit*"

# Limpiar rate limiting manualmente
redis-cli flushall
```

## 📝 Prevención

### 1. **Desarrollo**

- Usar rate limiting más permisivo
- Implementar retry automático en el frontend
- Monitorear logs del servidor

### 2. **Producción**

- Configurar rate limiting apropiado
- Implementar caching donde sea posible
- Usar CDN para recursos estáticos

### 3. **Testing**

- Usar mocks para pruebas unitarias
- Implementar rate limiting en pruebas de integración
- Usar herramientas como Artillery para testing de carga

## 🆘 Contacto

Si continúas experimentando problemas con rate limiting:

1. Revisa los logs del servidor
2. Verifica la configuración de variables de entorno
3. Considera aumentar los límites temporalmente
4. Implementa caching para reducir peticiones

---

## 📋 Checklist de Solución

- [ ] Reiniciar el servidor
- [ ] Verificar variables de entorno
- [ ] Implementar retry en el frontend
- [ ] Monitorear logs del servidor
- [ ] Ajustar configuración si es necesario
