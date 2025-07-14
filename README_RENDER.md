# 🚀 Despliegue en Render - Backend Asesoría de Seguros

## 📋 Requisitos Previos

1. **Cuenta en Render** (gratuita en https://render.com)
2. **Repositorio en GitHub** con el código del backend
3. **Configuración de email** (Gmail recomendado)

## 🔧 Configuración en Render

### 1. **Crear Nuevo Web Service**

1. Ve a [Render Dashboard](https://dashboard.render.com)
2. Haz clic en **"New +"** → **"Web Service"**
3. Conecta tu repositorio de GitHub
4. Selecciona el repositorio del backend

### 2. **Configurar el Servicio**

- **Name:** `back-asesoria-seguros`
- **Environment:** `Node`
- **Region:** `Oregon (US West)` (más cercano a Chile)
- **Branch:** `main`
- **Build Command:** `npm install`
- **Start Command:** `npm start`

### 3. **Variables de Entorno**

Configura las siguientes variables en Render:

```env
# Base de datos (se configura automáticamente con render.yaml)
NODE_ENV=production
PORT=10000

# JWT (se generan automáticamente)
JWT_SECRET=auto-generated
JWT_REFRESH_SECRET=auto-generated

# Email (configurar manualmente)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=tu-password-de-aplicacion
EMAIL_FROM=Pamela Cossio <info@pamelacossio.cl>

# URLs (configurar manualmente)
BACK_URL_PROD=https://tu-app.onrender.com

# Admin (opcional)
ADMIN_PASSWORD=9z2fvdm4

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 4. **Configurar Base de Datos**

1. En el dashboard de Render, ve a **"New +"** → **"PostgreSQL"**
2. **Name:** `asesoria-seguros-db`
3. **Database:** `asesoria_seguros`
4. **User:** `asesoria_user`
5. **Plan:** `Starter` (gratuito)

### 5. **Conectar Base de Datos al Servicio**

1. En tu servicio web, ve a **"Environment"**
2. Agrega la variable `DATABASE_URL` con la URL de conexión de PostgreSQL
3. La URL se ve así: `postgresql://asesoria_user:password@host:port/asesoria_seguros`

## 🔄 Despliegue Automático

Una vez configurado:

1. **Push a GitHub** → Despliegue automático
2. **Migraciones automáticas** → Se ejecutan al iniciar
3. **Usuario admin creado** → `desdevnode1@gmail.com` / `9z2fvdm4`

## 📊 Verificar Despliegue

### 1. **Health Check**
```bash
curl https://tu-app.onrender.com/api/health
```

### 2. **Login Admin**
```bash
curl -X POST https://tu-app.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "desdevnode1@gmail.com",
    "password": "9z2fvdm4"
  }'
```

### 3. **Crear Cotización**
```bash
curl -X POST https://tu-app.onrender.com/api/cotizaciones \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan Carlos",
    "apellidos": "Pérez González",
    "telefono": "+56912345678",
    "email": "juan.perez@email.com",
    "isapre_actual": "Fonasa",
    "cuanto_paga": "50000",
    "clinica_preferencia": "Clínica Alemana",
    "renta_imponible": "1500000",
    "mensaje": "Necesito cotización para plan familiar"
  }'
```

## 🔧 Configuración de Email

### Gmail (Recomendado)

1. **Habilitar 2FA** en tu cuenta de Gmail
2. **Generar contraseña de aplicación:**
   - Ve a Configuración de Google Account
   - Seguridad → Verificación en 2 pasos
   - Contraseñas de aplicación → Generar
3. **Usar esa contraseña** en `EMAIL_PASS`

### Variables de Email
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=tu-password-de-aplicacion
EMAIL_FROM=Pamela Cossio <info@pamelacossio.cl>
```

## 🚨 Solución de Problemas

### Error de CORS
- Verificar que el frontend esté en la lista de orígenes permitidos
- Agregar la URL del frontend en `FRONTEND_URL`

### Error de Base de Datos
- Verificar que `DATABASE_URL` esté configurada correctamente
- Revisar logs en Render Dashboard

### Error de Email
- Verificar configuración de Gmail
- Revisar que `EMAIL_PASS` sea una contraseña de aplicación

### Migraciones Fallidas
- Revisar logs en Render Dashboard
- Verificar que la base de datos esté conectada

## 📱 URLs Importantes

- **API Base:** `https://tu-app.onrender.com/api`
- **Health Check:** `https://tu-app.onrender.com/api/health`
- **Documentación:** `https://tu-app.onrender.com/api/docs`

## 🔐 Seguridad

- ✅ HTTPS automático
- ✅ Variables de entorno seguras
- ✅ Rate limiting configurado
- ✅ CORS configurado
- ✅ JWT con secretos únicos

## 💰 Costos

- **Web Service:** Gratuito (hasta 750 horas/mes)
- **PostgreSQL:** Gratuito (hasta 1GB)
- **Total:** $0/mes para desarrollo

---

**¡Listo! Tu backend estará funcionando en producción en minutos.** 🎉 