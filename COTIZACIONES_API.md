# API de Cotizaciones - Documentación para Frontend

## Endpoints Disponibles

### 1. Obtener Lista de Cotizaciones
**GET** `/api/cotizaciones`

Obtiene todas las cotizaciones con paginación y filtros.

#### Parámetros de Query (opcionales):
- `page`: Número de página (default: 1)
- `limit`: Elementos por página (default: 10)
- `search`: Búsqueda por nombre, apellidos, email o ID de cotización
- `estado`: Filtro por estado (pendiente, en_revision, contactado, cotizado, cerrado)
- `isapre`: Filtro por ISAPRE
- `clinica`: Filtro por clínica
- `fechaDesde`: Filtro por fecha desde (formato: YYYY-MM-DD)
- `fechaHasta`: Filtro por fecha hasta (formato: YYYY-MM-DD)

#### Filtro de Rango de Fechas:
El filtro de fechas permite buscar cotizaciones dentro de un rango específico:
- **fechaDesde**: Fecha de inicio del rango (inclusive)
- **fechaHasta**: Fecha de fin del rango (inclusive)
- **Formato**: YYYY-MM-DD (ejemplo: 2024-12-01)
- **Comportamiento**: 
  - Si solo se especifica `fechaDesde`: Busca desde esa fecha hasta hoy
  - Si solo se especifica `fechaHasta`: Busca desde el inicio hasta esa fecha
  - Si se especifican ambos: Busca en el rango completo
  - Si no se especifica ninguno: No aplica filtro de fecha

#### Ejemplo de uso:
```javascript
// Obtener todas las cotizaciones
fetch('/api/cotizaciones', {
  headers: {
    'Authorization': 'Bearer ' + token
  }
})

// Con filtros básicos
fetch('/api/cotizaciones?page=1&limit=20&estado=pendiente&search=Juan', {
  headers: {
    'Authorization': 'Bearer ' + token
  }
})

// Con filtro de rango de fechas
fetch('/api/cotizaciones?fechaDesde=2024-12-01&fechaHasta=2024-12-31', {
  headers: {
    'Authorization': 'Bearer ' + token
  }
})

// Con múltiples filtros incluyendo fechas
fetch('/api/cotizaciones?page=1&limit=20&estado=pendiente&isapre=Fonasa&fechaDesde=2024-12-01&fechaHasta=2024-12-31', {
  headers: {
    'Authorization': 'Bearer ' + token
  }
})
```

#### Respuesta:

**Estadísticas incluidas:**
- `total_cotizaciones`: Total de cotizaciones en el sistema
- `cotizaciones_este_mes`: Cotizaciones del mes actual
- `cotizaciones_esta_semana`: Cotizaciones de los últimos 7 días
- `cotizaciones_hoy`: Cotizaciones del día actual
- `porMes`: Estadísticas desglosadas por mes (últimos 6 meses)
- `isapresEsteMes`: ISAPREs más solicitadas este mes
- `clinicasEsteMes`: Clínicas más solicitadas este mes

```json
{
  "success": true,
  "data": {
    "cotizaciones": [
      {
        "id": 1,
        "cotizacion_id": "COT-20241201-0001",
        "nombre": "Juan",
        "apellidos": "Pérez",
        "edad": 35,
        "telefono": "+56912345678",
        "email": "juan@email.com",
        "isapre": "Fonasa",
        "valor_mensual": 50000,
        "clinica": "Clínica Alemana",
        "renta": 1500000,
        "numero_cargas": 2,
        "edades_cargas": "5,8",
        "mensaje": "Necesito cotización para mi familia",
        "estado": "pendiente",
        "fecha_envio": "2024-12-01T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 150,
      "totalPages": 15
    },
         "stats": {
       "total_cotizaciones": 150,
       "pendientes": 45,
       "en_revision": 30,
       "contactados": 25,
       "cotizados": 35,
       "cerrados": 15,
       "cotizaciones_este_mes": 25,
       "cotizaciones_esta_semana": 8,
       "cotizaciones_hoy": 2,
       "porMes": [
         {
           "mes": "2024-12",
           "total": 25,
           "pendientes": 8,
           "en_revision": 5,
           "contactados": 4,
           "cotizados": 6,
           "cerrados": 2
         },
         {
           "mes": "2024-11",
           "total": 30,
           "pendientes": 10,
           "en_revision": 8,
           "contactados": 6,
           "cotizados": 4,
           "cerrados": 2
         }
       ],
       "isapresEsteMes": [
         { "isapre": "Fonasa", "cantidad": 12 },
         { "isapre": "Banmédica", "cantidad": 8 },
         { "isapre": "Colmena", "cantidad": 5 }
       ],
       "clinicasEsteMes": [
         { "clinica": "Clínica Alemana", "cantidad": 15 },
         { "clinica": "Clínica Las Condes", "cantidad": 8 },
         { "clinica": "Clínica Santa María", "cantidad": 2 }
       ]
     }
  }
}
```

### 2. Obtener Cotización por ID
**GET** `/api/cotizaciones/:id`

Obtiene una cotización específica por su ID.

#### Ejemplo de uso:
```javascript
fetch('/api/cotizaciones/1', {
  headers: {
    'Authorization': 'Bearer ' + token
  }
})
```

#### Respuesta:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "cotizacion_id": "COT-20241201-0001",
    "nombre": "Juan",
    "apellidos": "Pérez",
    "edad": 35,
    "telefono": "+56912345678",
    "email": "juan@email.com",
    "isapre": "Fonasa",
    "valor_mensual": 50000,
    "clinica": "Clínica Alemana",
    "renta": 1500000,
    "numero_cargas": 2,
    "edades_cargas": "5,8",
    "mensaje": "Necesito cotización para mi familia",
    "estado": "pendiente",
    "fecha_envio": "2024-12-01T10:30:00Z"
  }
}
```

### 3. Obtener Estadísticas
**GET** `/api/cotizaciones/estadisticas`

Obtiene estadísticas completas de cotizaciones para el dashboard.

#### Ejemplo de uso:
```javascript
fetch('/api/cotizaciones/estadisticas', {
  headers: {
    'Authorization': 'Bearer ' + token
  }
})
```

#### Respuesta:
```json
{
  "success": true,
  "data": {
    "total_cotizaciones": 150,
    "pendientes": 45,
    "en_revision": 30,
    "contactados": 25,
    "cotizados": 35,
    "cerrados": 15,
    "cotizaciones_este_mes": 25,
    "cotizaciones_esta_semana": 8,
    "cotizaciones_hoy": 2,
    "porMes": [
      {
        "mes": "2024-12",
        "total": 25,
        "pendientes": 8,
        "en_revision": 5,
        "contactados": 4,
        "cotizados": 6,
        "cerrados": 2
      }
    ],
    "isapresEsteMes": [
      { "isapre": "Fonasa", "cantidad": 12 },
      { "isapre": "Banmédica", "cantidad": 8 }
    ],
    "clinicasEsteMes": [
      { "clinica": "Clínica Alemana", "cantidad": 15 },
      { "clinica": "Clínica Las Condes", "cantidad": 8 }
    ]
  }
}
```

### 4. Obtener Opciones de Filtros
**GET** `/api/cotizaciones/filtros`

Obtiene las opciones disponibles para los filtros (ISAPREs, clínicas, estados).

#### Ejemplo de uso:
```javascript
fetch('/api/cotizaciones/filtros', {
  headers: {
    'Authorization': 'Bearer ' + token
  }
})
```

#### Respuesta:
```json
{
  "success": true,
  "data": {
    "isapres": [
      "Fonasa",
      "Banmédica",
      "Colmena",
      "Consalud",
      "Cruz Blanca",
      "Masvida",
      "Vida Tres"
    ],
    "clinicas": [
      "Clínica Alemana",
      "Clínica Las Condes",
      "Clínica Santa María",
      "Clínica Indisa",
      "Clínica Dávila"
    ],
    "estados": [
      { "value": "pendiente", "label": "Pendiente" },
      { "value": "en_revision", "label": "En Revisión" },
      { "value": "contactado", "label": "Contactado" },
      { "value": "cotizado", "label": "Cotizado" },
      { "value": "cerrado", "label": "Cerrado" }
    ]
  }
}
```

### 5. Actualizar Cotización Completa
**PUT** `/api/cotizaciones/:id`

Actualiza cualquier campo de una cotización específica.

#### Body (todos los campos son opcionales):
```json
{
  "nombre": "Juan Carlos Pérez González",
  "apellidos": "Pérez González",
  "edad": 35,
  "telefono": "+56987654321",
  "email": "juan.nuevo@email.com",
  "isapre": "Banmédica",
  "valor_mensual": 75000,
  "clinica": "Clínica Las Condes",
  "renta": 2000000,
  "numero_cargas": 3,
  "edades_cargas": "5,8,12",
  "mensaje": "Necesito cotización actualizada para mi familia",
  "estado": "en_revision"
}
```

#### Ejemplo de uso:
```javascript
fetch('/api/cotizaciones/1', {
  method: 'PUT',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    nombre: 'Juan Carlos Pérez González',
    estado: 'en_revision',
    mensaje: 'Cotización actualizada'
  })
})
```

#### Respuesta:
```json
{
  "success": true,
  "message": "Cotización actualizada exitosamente",
  "data": {
    "id": 1,
    "cotizacion_id": "COT-20241201-0001",
         "nombre": "Juan Carlos Pérez González",
    "apellidos": "Pérez",
    "edad": 35,
    "telefono": "+56987654321",
    "email": "juan.nuevo@email.com",
    "isapre": "Banmédica",
    "valor_mensual": 75000,
    "clinica": "Clínica Las Condes",
    "renta": 2000000,
    "numero_cargas": 3,
    "edades_cargas": "5,8,12",
    "mensaje": "Necesito cotización actualizada para mi familia",
    "estado": "en_revision",
    "fecha_envio": "2024-12-01T10:30:00Z"
  }
}
```

### 6. Actualizar Estado de Cotización
**PUT** `/api/cotizaciones/:id/estado`

Actualiza el estado de una cotización específica.

#### Body:
```json
{
  "estado": "contactado"
}
```

#### Estados válidos:
- `pendiente`
- `en_revision`
- `contactado`
- `cotizado`
- `cerrado`

#### Ejemplo de uso:
```javascript
fetch('/api/cotizaciones/1/estado', {
  method: 'PUT',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    estado: 'contactado'
  })
})
```

#### Respuesta:
```json
{
  "success": true,
  "message": "Estado actualizado correctamente",
  "data": {
    "id": 1,
    "nombre": "Juan",
    "apellidos": "Pérez",
    "estado": "contactado"
  }
}
```

## Autenticación

Todos los endpoints requieren autenticación con token JWT en el header:
```
Authorization: Bearer <token>
```

## Manejo de Errores

### Error de autenticación (401):
```json
{
  "success": false,
  "message": "Token no válido"
}
```

### Error de autorización (403):
```json
{
  "success": false,
  "message": "Acceso denegado"
}
```

### Error de validación (400):
```json
{
  "success": false,
  "message": "Datos de entrada inválidos",
  "errors": [
    {
      "field": "estado",
      "message": "Estado no válido"
    }
  ]
}
```

### Error interno (500):
```json
{
  "success": false,
  "message": "Error interno del servidor"
}
```

## Casos de Uso Comunes para Filtro de Fechas

### 1. Cotizaciones del Día Actual
```javascript
const hoy = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
const cotizacionesHoy = await cotizacionesService.getCotizaciones({
  fechaDesde: hoy,
  fechaHasta: hoy
});
```

### 2. Cotizaciones de la Semana Actual
```javascript
const obtenerFechasSemana = () => {
  const hoy = new Date();
  const inicioSemana = new Date(hoy.setDate(hoy.getDate() - hoy.getDay()));
  const finSemana = new Date(hoy.setDate(hoy.getDate() - hoy.getDay() + 6));
  
  return {
    desde: inicioSemana.toISOString().split('T')[0],
    hasta: finSemana.toISOString().split('T')[0]
  };
};

const { desde, hasta } = obtenerFechasSemana();
const cotizacionesSemana = await cotizacionesService.getCotizaciones({
  fechaDesde: desde,
  fechaHasta: hasta
});
```

### 3. Cotizaciones del Mes Actual
```javascript
const obtenerFechasMes = () => {
  const hoy = new Date();
  const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  const finMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
  
  return {
    desde: inicioMes.toISOString().split('T')[0],
    hasta: finMes.toISOString().split('T')[0]
  };
};

const { desde, hasta } = obtenerFechasMes();
const cotizacionesMes = await cotizacionesService.getCotizaciones({
  fechaDesde: desde,
  fechaHasta: hasta
});
```

### 4. Cotizaciones de los Últimos 30 Días
```javascript
const obtenerUltimos30Dias = () => {
  const hoy = new Date();
  const hace30Dias = new Date(hoy.getTime() - (30 * 24 * 60 * 60 * 1000));
  
  return {
    desde: hace30Dias.toISOString().split('T')[0],
    hasta: hoy.toISOString().split('T')[0]
  };
};

const { desde, hasta } = obtenerUltimos30Dias();
const cotizacionesUltimos30Dias = await cotizacionesService.getCotizaciones({
  fechaDesde: desde,
  fechaHasta: hasta
});
```

## Ejemplo de Implementación en Frontend

```javascript
class CotizacionesService {
  constructor(token) {
    this.token = token;
    this.baseURL = '/api/cotizaciones';
  }

  async getCotizaciones(filters = {}) {
    const params = new URLSearchParams(filters);
    const response = await fetch(`${this.baseURL}?${params}`, {
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    });
    return response.json();
  }

  async getCotizacion(id) {
    const response = await fetch(`${this.baseURL}/${id}`, {
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    });
    return response.json();
  }

  async getEstadisticas() {
    const response = await fetch(`${this.baseURL}/estadisticas`, {
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    });
    return response.json();
  }

  async getFiltros() {
    const response = await fetch(`${this.baseURL}/filtros`, {
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    });
    return response.json();
  }

  async updateCotizacion(id, data) {
    const response = await fetch(`${this.baseURL}/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    return response.json();
  }

  async updateEstado(id, estado) {
    const response = await fetch(`${this.baseURL}/${id}/estado`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ estado })
    });
    return response.json();
  }
}

// Uso

// Ejemplo de uso con filtros de fecha
const cotizacionesService = new CotizacionesService(token);

// Obtener cotizaciones del último mes
const cotizacionesUltimoMes = await cotizacionesService.getCotizaciones({
  fechaDesde: '2024-12-01',
  fechaHasta: '2024-12-31'
});

// Obtener cotizaciones pendientes de esta semana
const cotizacionesEstaSemana = await cotizacionesService.getCotizaciones({
  estado: 'pendiente',
  fechaDesde: '2024-12-23', // Lunes
  fechaHasta: '2024-12-29'  // Domingo
});

// Obtener cotizaciones de una ISAPRE específica en un rango de fechas
const cotizacionesFonasa = await cotizacionesService.getCotizaciones({
  isapre: 'Fonasa',
  fechaDesde: '2024-11-01',
  fechaHasta: '2024-11-30'
});

// Ejemplo con React/Vue para componentes de filtro de fecha
const FiltroFechas = () => {
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');

  const aplicarFiltros = async () => {
    const filtros = {};
    if (fechaDesde) filtros.fechaDesde = fechaDesde;
    if (fechaHasta) filtros.fechaHasta = fechaHasta;
    
    const resultado = await cotizacionesService.getCotizaciones(filtros);
    // Actualizar estado con los resultados
  };

  return (
    <div>
      <input 
        type="date" 
        value={fechaDesde} 
        onChange={(e) => setFechaDesde(e.target.value)}
        placeholder="Fecha desde"
      />
      <input 
        type="date" 
        value={fechaHasta} 
        onChange={(e) => setFechaHasta(e.target.value)}
        placeholder="Fecha hasta"
      />
      <button onClick={aplicarFiltros}>Aplicar Filtros</button>
    </div>
  );
};
const cotizacionesService = new CotizacionesService(userToken);

// Obtener cotizaciones
const { data } = await cotizacionesService.getCotizaciones({
  page: 1,
  limit: 20,
  estado: 'pendiente'
});

// Obtener estadísticas
const { data: estadisticas } = await cotizacionesService.getEstadisticas();

// Obtener filtros
const { data: filtros } = await cotizacionesService.getFiltros();

// Actualizar cotización completa
await cotizacionesService.updateCotizacion(1, {
  nombre: 'Juan Carlos Pérez González',
  estado: 'en_revision',
  mensaje: 'Cotización actualizada'
});

// Actualizar solo estado
await cotizacionesService.updateEstado(1, 'contactado');
``` 