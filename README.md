# 🏥 Backend de Asesoría de Seguros Médicos

Sistema backend completo para gestión de asesoría de seguros médicos en Chile, desarrollado con Node.js, Express, PostgreSQL y JWT.

## 🚀 Características

- **Autenticación JWT** con refresh tokens
- **Manejo de usuarios** con roles y permisos
- **Verificación de email** para nuevos usuarios
- **Restablecimiento de contraseña** por email
- **Base de datos PostgreSQL** con migraciones
- **Docker** para desarrollo y producción
- **Seguridad robusta** con rate limiting, CORS, Helmet
- **API RESTful** completa y documentada
- **Validaciones** de entrada con express-validator
- **Logging** y manejo de errores

## 📋 Requisitos Previos

- Node.js 18+ 
- Docker y Docker Compose
- PostgreSQL (si no usas Docker)
- Git

## 🛠️ Instalación

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd back-asesoria
```

### 2. Configurar variables de entorno

```bash
# Copiar archivo de ejemplo
cp env.example .env

# Editar variables de entorno
nano .env
```

### 3. Configurar variables de entorno

Edita el archivo `.env` con tus configuraciones:

```env
# Configuración del servidor
NODE_ENV=development
PORT=3000

# Base de datos PostgreSQL
DATABASE_URL=postgresql://postgres:password@localhost:5432/asesoria_seguros

# JWT Secrets (¡CAMBIAR EN PRODUCCIÓN!)
JWT_SECRET=tu_jwt_secret_super_seguro_aqui_cambiar_en_produccion
JWT_REFRESH_SECRET=tu_refresh_secret_super_seguro_aqui_cambiar_en_produccion
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Configuración de email (Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_password_de_aplicacion
EMAIL_FROM=Asesoría Seguros <tu_email@gmail.com>

# Configuración de seguridad
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Configuración de archivos
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
```

### 4. Instalar dependencias

```bash
npm install
```

### 5. Configurar base de datos

#### Opción A: Con Docker (Recomendado)

```bash
# Iniciar servicios con Docker Compose
docker-compose up -d db

# Esperar a que PostgreSQL esté listo (30-60 segundos)
# Luego ejecutar migraciones
npm run migrate

# Poblar datos iniciales
npm run seed
```

#### Opción B: PostgreSQL local

```bash
# Crear base de datos
createdb asesoria_seguros

# Ejecutar migraciones
npm run migrate

# Poblar datos iniciales
npm run seed
```

### 6. Iniciar el servidor

#### Desarrollo
```bash
npm run dev
```

#### Producción
```bash
npm start
```

#### Con Docker
```bash
docker-compose up -d
```

## 🐳 Docker

### Desarrollo
```bash
# Construir e iniciar todos los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f app

# Detener servicios
docker-compose down
```

### Producción
```bash
# Construir imagen de producción
docker build -t asesoria-seguros .

# Ejecutar contenedor
docker run -d \
  --name asesoria-seguros \
  -p 3000:3000 \
  --env-file .env \
  asesoria-seguros
```

## 📊 Estructura de la Base de Datos

### Tablas Principales

- **users**: Usuarios del sistema (asesores, administradores)
- **roles**: Roles y permisos
- **clients**: Clientes de seguros
- **insurance_companies**: Aseguradoras
- **insurance_plans**: Planes de seguro
- **quotes**: Cotizaciones
- **policies**: Pólizas activas
- **client_follow_ups**: Seguimiento de clientes
- **refresh_tokens**: Tokens de refresh para JWT

## 🔐 Autenticación y Autorización

### Roles del Sistema

1. **admin**: Acceso completo al sistema
2. **supervisor**: Gestión de asesores y reportes
3. **asesor**: Gestión de clientes y cotizaciones

### Endpoints de Autenticación

```
POST /api/auth/register          # Registrar nuevo usuario
POST /api/auth/login             # Iniciar sesión
GET  /api/auth/verify-email/:token # Verificar email
POST /api/auth/forgot-password   # Solicitar reset de contraseña
POST /api/auth/reset-password    # Restablecer contraseña
POST /api/auth/refresh-token     # Refrescar token
POST /api/auth/logout            # Cerrar sesión
GET  /api/auth/profile           # Obtener perfil
```

### Uso de JWT

```javascript
// Headers requeridos para endpoints protegidos
Authorization: Bearer <access_token>

// Refresh token en body
{
  "refreshToken": "<refresh_token>"
}
```

## 👥 Gestión de Usuarios

### Endpoints de Usuarios

```
GET    /api/users              # Listar usuarios (con filtros)
GET    /api/users/roles        # Obtener roles disponibles
GET    /api/users/:id          # Obtener usuario por ID
POST   /api/users              # Crear nuevo usuario
PUT    /api/users/:id          # Actualizar usuario
DELETE /api/users/:id          # Eliminar usuario
```

### Filtros Disponibles

- `search`: Búsqueda por nombre, email o RUT
- `role`: Filtrar por rol
- `isActive`: Filtrar por estado activo
- `page`: Número de página
- `limit`: Elementos por página

## 📧 Configuración de Email

### Gmail (Recomendado)

1. Habilitar autenticación de 2 factores
2. Generar contraseña de aplicación
3. Usar esa contraseña en `EMAIL_PASS`

### Otros proveedores

Modificar `EMAIL_HOST` y `EMAIL_PORT` según el proveedor:

- **Outlook**: `smtp-mail.outlook.com:587`
- **Yahoo**: `smtp.mail.yahoo.com:587`
- **Proveedor propio**: Consultar documentación

## 🔧 Scripts Disponibles

```bash
npm start              # Iniciar servidor en producción
npm run dev            # Iniciar servidor en desarrollo
npm run migrate        # Ejecutar migraciones de BD
npm run seed           # Poblar datos iniciales
npm test               # Ejecutar tests
```

## 📝 Datos Iniciales

Al ejecutar `npm run seed` se crean:

### Usuarios de Prueba
- **Admin**: `admin@asesoriaseguros.cl` / `admin123`
- **Asesor**: `asesor@asesoriaseguros.cl` / `asesor123`

### Aseguradoras de Ejemplo
- Banmédica
- Colmena Golden Cross
- Consalud
- Cruz Blanca
- Fonasa

### Planes de Seguro
- Plan Premium Banmédica
- Plan Básico Colmena
- Plan Familiar Consalud

## 🛡️ Seguridad

### Características Implementadas

- **Rate Limiting**: 100 requests por 15 minutos por IP
- **Helmet**: Headers de seguridad
- **CORS**: Configuración restrictiva
- **Validación de entrada**: Express-validator
- **Encriptación de contraseñas**: bcryptjs
- **JWT seguro**: Con refresh tokens
- **Sanitización**: De datos de entrada

### Recomendaciones de Producción

1. **Cambiar secrets JWT** en variables de entorno
2. **Usar HTTPS** en producción
3. **Configurar firewall** apropiado
4. **Monitorear logs** regularmente
5. **Backups automáticos** de base de datos
6. **Actualizar dependencias** regularmente

## 📊 Monitoreo y Logs

### Health Check
```
GET /health
```

### Logs
Los logs se guardan en formato combinado con Morgan:
- Accesos HTTP
- Errores de aplicación
- Tokens expirados limpiados automáticamente

## 🚀 Despliegue

### Heroku
```bash
# Configurar variables de entorno en Heroku
heroku config:set NODE_ENV=production
heroku config:set DATABASE_URL=postgresql://...

# Desplegar
git push heroku main
```

### DigitalOcean App Platform
1. Conectar repositorio
2. Configurar variables de entorno
3. Desplegar automáticamente

### AWS EC2
```bash
# Clonar en servidor
git clone <repo>

# Instalar dependencias
npm ci --production

# Configurar PM2
pm2 start src/server.js --name asesoria-seguros

# Configurar nginx como proxy reverso
```

## 🧪 Testing

```bash
# Ejecutar tests
npm test

# Tests con coverage
npm run test:coverage
```

## 📚 API Documentation

### Respuestas Estándar

```json
{
  "success": true,
  "message": "Operación exitosa",
  "data": {
    // Datos de la respuesta
  }
}
```

### Códigos de Error

- `400`: Datos de entrada inválidos
- `401`: No autenticado
- `403`: No autorizado
- `404`: Recurso no encontrado
- `500`: Error interno del servidor

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🆘 Soporte

Para soporte técnico o preguntas:

- 📧 Email: soporte@asesoriaseguros.cl
- 📱 Teléfono: +56 9 1234 5678
- 💬 Slack: #asesoria-seguros

## 🔄 Changelog

### v1.0.0
- ✅ Sistema de autenticación JWT completo
- ✅ Gestión de usuarios con roles
- ✅ Verificación de email
- ✅ Restablecimiento de contraseña
- ✅ Base de datos PostgreSQL
- ✅ Docker y Docker Compose
- ✅ Seguridad robusta
- ✅ API RESTful completa

---

**Desarrollado con ❤️ para asesores de seguros médicos en Chile** 