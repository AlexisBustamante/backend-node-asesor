# 📚 Documentación de la API - Asesoría de Seguros

## 🔗 Base URL
```
http://localhost:3000/api
```

## 🔐 Autenticación

La API utiliza JWT (JSON Web Tokens) para autenticación. Los tokens deben incluirse en el header `Authorization`:

```
Authorization: Bearer <access_token>
```

### Flujo de Autenticación

1. **Login** → Obtener access_token y refresh_token
2. **Usar access_token** → Para todas las peticiones protegidas
3. **Refresh token** → Cuando el access_token expire
4. **Logout** → Invalidar tokens

---

## 📝 Endpoints de Autenticación

### 1. Registrar Usuario

**POST** `/auth/register`

Registra un nuevo usuario en el sistema.

**Body:**
```json
{
  "rut": "18.249.675-8",
  "email": "desdevnode1@gmail.com",
  "password": "admin123",
  "firstName": "Alexis",
  "lastName": "Bustamante",
  "phone": "+56950988293",
  "address": "Rucatyu 1265",
  "region": "Metropolitana",
  "comuna": "Maipú",
  "roleId": 1
}
```

**Respuesta exitosa (201):**
```json
{
  "success": true,
  "message": "Usuario registrado exitosamente. Por favor verifica tu email.",
  "data": {
    "id": 1,
    "email": "usuario@ejemplo.cl",
    "firstName": "Juan",
    "lastName": "Pérez"
  }
}
```

### 2. Iniciar Sesión

**POST** `/auth/login`

Inicia sesión y obtiene tokens de acceso.

**Body:**
```json
{
  "email": "usuario@ejemplo.cl",
  "password": "Contraseña123"
}
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Inicio de sesión exitoso",
  "data": {
    "user": {
      "id": 1,
      "email": "usuario@ejemplo.cl",
      "firstName": "Juan",
      "lastName": "Pérez",
      "role": "asesor",
      "permissions": ["clients:read", "clients:write", "quotes:read", "quotes:write"]
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "abc123def456...",
      "expiresIn": "15m"
    }
  }
}
```

### 3. Verificar Email

**GET** `/auth/verify-email/:token`

Verifica el email del usuario usando el token enviado por email.

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Email verificado exitosamente"
}
```

### 4. Solicitar Restablecimiento de Contraseña

**POST** `/auth/forgot-password`

Envía un email con enlace para restablecer la contraseña.

**Body:**
```json
{
  "email": "usuario@ejemplo.cl"
}
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Si el email existe, recibirás un enlace para restablecer tu contraseña"
}
```

### 5. Restablecer Contraseña

**POST** `/auth/reset-password`

Restablece la contraseña usando el token del email.

**Body:**
```json
{
  "token": "reset_token_del_email",
  "password": "NuevaContraseña123",
  "confirmPassword": "NuevaContraseña123"
}
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Contraseña restablecida exitosamente"
}
```

### 6. Refrescar Token

**POST** `/auth/refresh-token`

Obtiene nuevos tokens usando el refresh token.

**Body:**
```json
{
  "refreshToken": "abc123def456..."
}
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Tokens refrescados exitosamente",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "xyz789uvw012...",
    "expiresIn": "15m"
  }
}
```

### 7. Cerrar Sesión

**POST** `/auth/logout`

**Headers:** `Authorization: Bearer <access_token>`

**Body:**
```json
{
  "refreshToken": "abc123def456..."
}
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Sesión cerrada exitosamente"
}
```

### 8. Obtener Perfil

**GET** `/auth/profile`

**Headers:** `Authorization: Bearer <access_token>`

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "usuario@ejemplo.cl",
    "rut": "12.345.678-9",
    "firstName": "Juan",
    "lastName": "Pérez",
    "phone": "+56912345678",
    "address": "Av. Providencia 1234",
    "region": "Metropolitana",
    "comuna": "Providencia",
    "role": "asesor",
    "permissions": ["clients:read", "clients:write", "quotes:read", "quotes:write"],
    "createdAt": "2024-01-15T10:30:00.000Z",
    "lastLogin": "2024-01-15T14:20:00.000Z"
  }
}
```

---

## 👥 Endpoints de Usuarios

### 1. Listar Usuarios

**GET** `/users`

**Headers:** `Authorization: Bearer <access_token>`

**Query Parameters:**
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Elementos por página (default: 10)
- `search` (opcional): Búsqueda por nombre, email o RUT
- `role` (opcional): Filtrar por rol
- `isActive` (opcional): Filtrar por estado activo (true/false)

**Ejemplo:**
```
GET /users?page=1&limit=5&search=juan&role=asesor&isActive=true
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": 1,
        "rut": "12.345.678-9",
        "email": "juan@ejemplo.cl",
        "firstName": "Juan",
        "lastName": "Pérez",
        "phone": "+56912345678",
        "address": "Av. Providencia 1234",
        "region": "Metropolitana",
        "comuna": "Providencia",
        "isActive": true,
        "emailVerified": true,
        "lastLogin": "2024-01-15T14:20:00.000Z",
        "createdAt": "2024-01-15T10:30:00.000Z",
        "role": {
          "id": 2,
          "name": "asesor",
          "description": "Asesor de seguros médicos"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 5,
      "total": 25,
      "totalPages": 5
    }
  }
}
```

### 2. Obtener Roles

**GET** `/users/roles`

**Headers:** `Authorization: Bearer <access_token>`

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "admin",
      "description": "Administrador del sistema con acceso completo",
      "permissions": ["users:read", "users:write", "users:delete", "clients:read", "clients:write", "clients:delete"]
    },
    {
      "id": 2,
      "name": "asesor",
      "description": "Asesor de seguros médicos",
      "permissions": ["clients:read", "clients:write", "quotes:read", "quotes:write"]
    },
    {
      "id": 3,
      "name": "supervisor",
      "description": "Supervisor de asesores",
      "permissions": ["users:read", "clients:read", "clients:write", "quotes:read", "quotes:write"]
    }
  ]
}
```

### 3. Obtener Usuario por ID

**GET** `/users/:id`

**Headers:** `Authorization: Bearer <access_token>`

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "rut": "12.345.678-9",
    "email": "juan@ejemplo.cl",
    "firstName": "Juan",
    "lastName": "Pérez",
    "phone": "+56912345678",
    "address": "Av. Providencia 1234",
    "region": "Metropolitana",
    "comuna": "Providencia",
    "isActive": true,
    "emailVerified": true,
    "lastLogin": "2024-01-15T14:20:00.000Z",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T14:20:00.000Z",
    "role": {
      "id": 2,
      "name": "asesor",
      "description": "Asesor de seguros médicos",
      "permissions": ["clients:read", "clients:write", "quotes:read", "quotes:write"]
    }
  }
}
```

### 4. Crear Usuario

**POST** `/users`

**Headers:** `Authorization: Bearer <access_token>`

**Body:**
```json
{
  "rut": "98.765.432-1",
  "email": "nuevo@ejemplo.cl",
  "password": "Contraseña123",
  "firstName": "María",
  "lastName": "González",
  "phone": "+56987654321",
  "address": "Av. Las Condes 5678",
  "region": "Metropolitana",
  "comuna": "Las Condes",
  "roleId": 2,
  "isActive": true
}
```

**Respuesta exitosa (201):**
```json
{
  "success": true,
  "message": "Usuario creado exitosamente",
  "data": {
    "id": 2,
    "email": "nuevo@ejemplo.cl",
    "firstName": "María",
    "lastName": "González",
    "isActive": true
  }
}
```

### 5. Actualizar Usuario

**PUT** `/users/:id`

**Headers:** `Authorization: Bearer <access_token>`

**Body:**
```json
{
  "firstName": "María José",
  "phone": "+56987654322",
  "isActive": false
}
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Usuario actualizado exitosamente",
  "data": {
    "id": 2,
    "email": "nuevo@ejemplo.cl",
    "firstName": "María José",
    "lastName": "González",
    "isActive": false
  }
}
```

### 6. Eliminar Usuario

**DELETE** `/users/:id`

**Headers:** `Authorization: Bearer <access_token>`

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Usuario eliminado exitosamente"
}
```

---

## 📋 Endpoints de Cotizaciones

### 1. Crear Cotización (Público)

**POST** `/cotizaciones`

Crea una nueva cotización y envía emails de confirmación al cliente y notificación a los administradores.

**Body:**
```json
{
  "nombre": "Juan Carlos",
  "apellidos": "Pérez González",
  "telefono": "+56912345678",
  "email": "juan.perez@email.com",
  "isapre": "Fonasa",
  "isapre_actual": "Fonasa",
  "valor_mensual": "50000",
  "cuanto_paga": "50000",
  "clinica": "Clínica Alemana",
  "clinica_preferencia": "Clínica Alemana",
  "renta": "1500000",
  "renta_imponible": "1500000",
  "mensaje": "Necesito cotización para plan familiar"
}
```

**Campos requeridos:** `nombre`, `apellidos`, `telefono`, `email`, `clinica_preferencia`, `isapre_actual`, `cuanto_paga`, `renta_imponible`

**Respuesta exitosa (201):**
```json
{
  "success": true,
  "message": "Cotización enviada exitosamente. Te contactaremos pronto.",
  "data": {
    "id": 1,
    "cotizacion_id": "COT-20250714-0001",
    "nombre": "Juan Carlos",
    "apellidos": "Pérez González"
  }
}
```

**Notas importantes:**
- Se genera automáticamente un ID único legible (formato: `COT-YYYYMMDD-XXXX`)
- Se envía email de confirmación al cliente
- Se envía notificación a todos los administradores
- El ID de cotización aparece en el asunto de ambos emails

### 2. Listar Cotizaciones (Administradores)

**GET** `/cotizaciones`

**Headers:** `Authorization: Bearer <access_token>`

Obtiene todas las cotizaciones ordenadas por fecha de envío (más recientes primero).

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nombre": "Juan Carlos",
      "apellidos": "Pérez González",
      "telefono": "+56912345678",
      "email": "juan.perez@email.com",
      "isapre_actual": "Fonasa",
      "cuanto_paga": "50000",
      "clinica_preferencia": "Clínica Alemana",
      "renta_imponible": "1500000",
      "mensaje": "Necesito cotización para plan familiar",
      "estado": "pendiente",
      "fecha_envio": "2025-07-14T16:40:54.000Z"
    }
  ]
}
```

### 3. Consultar Estado de Cotización (Público)

**GET** `/cotizaciones/estado/:cotizacion_id`

Permite a los clientes consultar el estado de su cotización usando el ID único.

**Ejemplo:**
```
GET /api/cotizaciones/estado/COT-20250714-0001
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": {
    "cotizacion_id": "COT-20250714-0001",
    "nombre": "Juan Carlos",
    "apellidos": "Pérez González",
    "estado": "en_revision",
    "fecha_envio": "2025-07-14T16:40:54.000Z"
  }
}
```

**Respuesta si no existe (404):**
```json
{
  "success": false,
  "message": "Cotización no encontrada"
}
```

### 4. Actualizar Estado de Cotización (Administradores)

**PUT** `/cotizaciones/:id/estado`

**Headers:** `Authorization: Bearer <access_token>`

Permite a los administradores actualizar el estado de una cotización.

**Body:**
```json
{
  "estado": "contactado"
}
```

**Estados válidos:**
- `pendiente` - Cotización recién recibida
- `en_revision` - En proceso de revisión
- `contactado` - Cliente contactado
- `cotizado` - Cotización preparada
- `cerrado` - Proceso finalizado

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Estado actualizado correctamente",
  "data": {
    "id": 1,
    "nombre": "Juan Carlos",
    "apellidos": "Pérez González",
    "estado": "contactado"
  }
}
```

---

## 🔧 Endpoints de Utilidad

### Health Check

**GET** `/health`

Verifica el estado del servidor.

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Servidor funcionando correctamente",
  "timestamp": "2024-01-15T14:20:00.000Z",
  "environment": "development"
}
```

### Información de la API

**GET** `/`

Obtiene información general de la API.

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "API de Asesoría de Seguros Médicos",
  "version": "1.0.0",
  "endpoints": {
    "auth": "/api/auth",
    "users": "/api/users",
    "cotizaciones": "/api/cotizaciones",
    "health": "/health"
  }
}
```

---

## ⚠️ Códigos de Error

### 400 - Bad Request
```json
{
  "success": false,
  "message": "Datos de entrada inválidos",
  "errors": [
    {
      "field": "email",
      "message": "Email inválido"
    }
  ]
}
```

### 401 - Unauthorized
```json
{
  "success": false,
  "message": "Token de acceso requerido"
}
```

### 403 - Forbidden
```json
{
  "success": false,
  "message": "Permisos insuficientes"
}
```

### 404 - Not Found
```json
{
  "success": false,
  "message": "Usuario no encontrado"
}
```

### 500 - Internal Server Error
```json
{
  "success": false,
  "message": "Error interno del servidor"
}
```

---

## 🔐 Permisos del Sistema

### Permisos Disponibles

- `users:read` - Leer usuarios
- `users:write` - Crear/editar usuarios
- `users:delete` - Eliminar usuarios
- `clients:read` - Leer clientes
- `clients:write` - Crear/editar clientes
- `clients:delete` - Eliminar clientes
- `quotes:read` - Leer cotizaciones
- `quotes:write` - Crear/editar cotizaciones
- `quotes:delete` - Eliminar cotizaciones
- `policies:read` - Leer pólizas
- `policies:write` - Crear/editar pólizas
- `policies:delete` - Eliminar pólizas

### Roles y Permisos

| Rol | Permisos |
|-----|----------|
| admin | Todos los permisos |
| supervisor | users:read, clients:*, quotes:*, policies:* |
| asesor | clients:read, clients:write, quotes:read, quotes:write, policies:read, policies:write |

---

## 📝 Ejemplos de Uso

### Ejemplo 1: Flujo Completo de Autenticación

```javascript
// 1. Login
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@asesoriaseguros.cl',
    password: 'admin123'
  })
});

const { data: { tokens, user } } = await loginResponse.json();

// 2. Usar token para peticiones protegidas
const usersResponse = await fetch('/api/users', {
  headers: {
    'Authorization': `Bearer ${tokens.accessToken}`,
    'Content-Type': 'application/json'
  }
});

// 3. Refrescar token cuando expire
const refreshResponse = await fetch('/api/auth/refresh-token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    refreshToken: tokens.refreshToken
  })
});

// 4. Logout
await fetch('/api/auth/logout', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${tokens.accessToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    refreshToken: tokens.refreshToken
  })
});
```

### Ejemplo 2: Gestión de Usuarios

```javascript
// Listar usuarios con filtros
const usersResponse = await fetch('/api/users?page=1&limit=10&role=asesor', {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }
});

// Crear nuevo usuario
const createUserResponse = await fetch('/api/users', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    rut: '98.765.432-1',
    email: 'nuevo@ejemplo.cl',
    password: 'Contraseña123',
    firstName: 'María',
    lastName: 'González',
    roleId: 2
  })
});
```

### Ejemplo 3: Gestión de Cotizaciones

```javascript
// 1. Crear cotización (público - no requiere token)
const createQuoteResponse = await fetch('/api/cotizaciones', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    nombre: 'Juan Carlos',
    apellidos: 'Pérez González',
    telefono: '+56912345678',
    email: 'juan.perez@email.com',
    isapre_actual: 'Fonasa',
    cuanto_paga: '50000',
    clinica_preferencia: 'Clínica Alemana',
    renta_imponible: '1500000',
    mensaje: 'Necesito cotización para plan familiar'
  })
});

const { data: { cotizacion_id } } = await createQuoteResponse.json();

// 2. Consultar estado (público - no requiere token)
const statusResponse = await fetch(`/api/cotizaciones/estado/${cotizacion_id}`);
const { data: { estado } } = await statusResponse.json();

// 3. Listar cotizaciones (administradores)
const quotesResponse = await fetch('/api/cotizaciones', {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }
});

// 4. Actualizar estado (administradores)
const updateStatusResponse = await fetch('/api/cotizaciones/1/estado', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    estado: 'contactado'
  })
});
```

### Ejemplo 4: cURL para Crear Cotización

```bash
curl -X POST http://localhost:3000/api/cotizaciones \
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

### Ejemplo 5: cURL para Consultar Estado

```bash
curl -X GET http://localhost:3000/api/cotizaciones/estado/COT-20250714-0001
```

### Ejemplo 6: cURL para Actualizar Estado (Administradores)

```bash
curl -X PUT http://localhost:3000/api/cotizaciones/1/estado \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "estado": "contactado"
  }'
```

---

## 🚀 Configuración y Desarrollo

### ⚠️ Nota Importante: Problema de Cache

Si encuentras errores como "null value in column cotizacion_id violates not-null constraint", es porque el servidor está ejecutando una versión cacheada del código. Para solucionarlo:

1. **Reinicia completamente los contenedores:**
   ```bash
   docker-compose down
   docker-compose up --build
   ```

2. **O fuerza el reinicio del contenedor de la app:**
   ```bash
   docker-compose restart app
   ```

3. **Verifica que nodemon esté funcionando** (deberías ver logs de reinicio automático cuando cambias archivos).

### Variables de Entorno Requeridas

```env
# Base de datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=asesoria_seguros
DB_USER=postgres
DB_PASSWORD=password

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=tu-password-de-aplicacion
EMAIL_FROM=Pamela Cossio <info@pamelacossio.cl>

# JWT
JWT_SECRET=tu-secreto-super-seguro
JWT_REFRESH_SECRET=tu-refresh-secreto-super-seguro

# Redis
REDIS_URL=redis://localhost:6379

# Servidor
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Configuración de CORS

El servidor está configurado para permitir los siguientes orígenes:

- `http://localhost:3000` - Frontend en puerto 3000
- `http://localhost:5173` - Vite dev server (puerto por defecto)
- `http://localhost:4173` - Vite preview
- `http://127.0.0.1:5173` - Vite con IP
- `http://127.0.0.1:4173` - Vite preview con IP

Si necesitas agregar más orígenes, puedes:

1. **Usar la variable de entorno:**
   ```env
   FRONTEND_URL=http://tu-dominio.com
   ```

2. **O modificar directamente en `src/server.js`** agregando más URLs al array `allowedOrigins`.

### Comandos de Desarrollo

```bash
# Instalar dependencias
npm install

# Ejecutar migraciones
npm run migrate

# Ejecutar seeds
npm run seed

# Desarrollo con nodemon
npm run dev

# Producción
npm start

# Docker
docker-compose up
```

### Estructura de la Base de Datos

#### Tabla: cotizacion
```sql
CREATE TABLE cotizacion (
  id SERIAL PRIMARY KEY,
  cotizacion_id VARCHAR(20) UNIQUE NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  apellidos VARCHAR(100) NOT NULL,
  telefono VARCHAR(20) NOT NULL,
  email VARCHAR(100) NOT NULL,
  isapre_actual VARCHAR(100) NOT NULL,
  cuanto_paga VARCHAR(50) NOT NULL,
  clinica_preferencia VARCHAR(100) NOT NULL,
  renta_imponible VARCHAR(50) NOT NULL,
  mensaje TEXT,
  estado VARCHAR(20) DEFAULT 'pendiente',
  fecha_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🚀 Próximas Funcionalidades

- [x] Gestión de cotizaciones
- [x] Sistema de emails automáticos
- [x] IDs únicos legibles para cotizaciones
- [x] Consulta pública de estado de cotizaciones
- [ ] Gestión de clientes
- [ ] Gestión de pólizas
- [ ] Gestión de aseguradoras
- [ ] Gestión de planes de seguro
- [ ] Reportes y estadísticas
- [ ] Notificaciones push
- [ ] Subida de archivos
- [ ] API de búsqueda avanzada
- [ ] Webhooks para integraciones

---

**Para más información, consulta el README.md del proyecto.** 