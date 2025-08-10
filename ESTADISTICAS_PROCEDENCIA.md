# 📊 Estadísticas de Procedencia - API de Cotizaciones

## Descripción
Se han agregado nuevas estadísticas al endpoint `/api/cotizaciones/estadisticas` para analizar las cotizaciones por procedencia (Instagram, Facebook, Página Web, WhatsApp, etc.).

## Nuevas Estadísticas Agregadas

### 1. **Estadísticas por Procedencia (Total)**
```json
"procedenciaTotal": [
  {
    "procedencia": "Instagram",
    "cantidad": 45
  },
  {
    "procedencia": "Facebook",
    "cantidad": 32
  },
  {
    "procedencia": "Página Web",
    "cantidad": 28
  },
  {
    "procedencia": "WhatsApp",
    "cantidad": 15
  }
]
```

### 2. **Estadísticas por Procedencia (Este Mes)**
```json
"procedenciaEsteMes": [
  {
    "procedencia": "Instagram",
    "cantidad": 12
  },
  {
    "procedencia": "Facebook",
    "cantidad": 8
  }
]
```

### 3. **Estadísticas por Procedencia (Esta Semana)**
```json
"procedenciaEstaSemana": [
  {
    "procedencia": "Instagram",
    "cantidad": 3
  },
  {
    "procedencia": "Página Web",
    "cantidad": 2
  }
]
```

### 4. **Estadísticas Específicas (Total)**
```json
"procedenciaEspecifica": {
  "instagram": 45,
  "facebook": 32,
  "pagina_web": 28,
  "whatsapp": 15,
  "sin_especificar": 8
}
```

### 5. **Estadísticas Específicas (Este Mes)**
```json
"procedenciaEspecificaEsteMes": {
  "instagram": 12,
  "facebook": 8,
  "pagina_web": 5,
  "whatsapp": 3,
  "sin_especificar": 2
}
```

## Lógica de Detección

### Instagram
- Busca: `%instagram%` (case insensitive)

### Facebook
- Busca: `%facebook%` o `%fb%` (case insensitive)

### Página Web
- Busca: `%pagina%` o `%web%` o `%sitio%` (case insensitive)

### WhatsApp
- Busca: `%whatsapp%` o `%wsp%` o `%wa%` (case insensitive)

### Sin Especificar
- Registros donde `procedencia` es `NULL` o vacío

## Ejemplo de Respuesta Completa

```json
{
  "success": true,
  "data": {
    "total_cotizaciones": 128,
    "pendientes": 15,
    "en_revision": 8,
    "contactados": 25,
    "cotizados": 45,
    "cerrados": 35,
    "cotizaciones_este_mes": 30,
    "cotizaciones_esta_semana": 8,
    "cotizaciones_hoy": 2,
    "porMes": [...],
    "isapresEsteMes": [...],
    "clinicasEsteMes": [...],
    "procedenciaTotal": [
      {
        "procedencia": "Instagram",
        "cantidad": 45
      },
      {
        "procedencia": "Facebook",
        "cantidad": 32
      }
    ],
    "procedenciaEsteMes": [
      {
        "procedencia": "Instagram",
        "cantidad": 12
      }
    ],
    "procedenciaEstaSemana": [
      {
        "procedencia": "Instagram",
        "cantidad": 3
      }
    ],
    "procedenciaEspecifica": {
      "instagram": 45,
      "facebook": 32,
      "pagina_web": 28,
      "whatsapp": 15,
      "sin_especificar": 8
    },
    "procedenciaEspecificaEsteMes": {
      "instagram": 12,
      "facebook": 8,
      "pagina_web": 5,
      "whatsapp": 3,
      "sin_especificar": 2
    }
  }
}
```

## Uso en el Frontend

### Ejemplo con JavaScript
```javascript
const obtenerEstadisticas = async () => {
  try {
    const response = await fetch('/api/cotizaciones/estadisticas', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    if (data.success) {
      const stats = data.data;
      
      // Mostrar estadísticas específicas
      console.log('Instagram:', stats.procedenciaEspecifica.instagram);
      console.log('Facebook:', stats.procedenciaEspecifica.facebook);
      console.log('Página Web:', stats.procedenciaEspecifica.pagina_web);
      console.log('WhatsApp:', stats.procedenciaEspecifica.whatsapp);
      
      // Mostrar estadísticas de este mes
      console.log('Instagram este mes:', stats.procedenciaEspecificaEsteMes.instagram);
      
      // Mostrar todas las procedencias
      stats.procedenciaTotal.forEach(item => {
        console.log(`${item.procedencia}: ${item.cantidad}`);
      });
    }
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
  }
};
```

### Ejemplo con Chart.js
```javascript
// Crear gráfico de procedencias
const ctx = document.getElementById('procedenciaChart').getContext('2d');
const procedenciaChart = new Chart(ctx, {
  type: 'doughnut',
  data: {
    labels: ['Instagram', 'Facebook', 'Página Web', 'WhatsApp', 'Sin especificar'],
    datasets: [{
      data: [
        stats.procedenciaEspecifica.instagram,
        stats.procedenciaEspecifica.facebook,
        stats.procedenciaEspecifica.pagina_web,
        stats.procedenciaEspecifica.whatsapp,
        stats.procedenciaEspecifica.sin_especificar
      ],
      backgroundColor: [
        '#E4405F', // Instagram
        '#1877F2', // Facebook
        '#4285F4', // Web
        '#25D366', // WhatsApp
        '#6C757D'  // Sin especificar
      ]
    }]
  },
  options: {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom'
      },
      title: {
        display: true,
        text: 'Cotizaciones por Procedencia'
      }
    }
  }
});
```

## Casos de Uso

### 1. **Dashboard Principal**
- Mostrar gráfico de procedencias totales
- Comparar procedencias del mes actual vs mes anterior

### 2. **Análisis de Marketing**
- Identificar qué canales generan más cotizaciones
- Medir efectividad de campañas por canal

### 3. **Reportes Mensuales**
- Generar reportes de procedencias por período
- Analizar tendencias de crecimiento por canal

### 4. **Optimización de Recursos**
- Enfocar esfuerzos en canales más efectivos
- Identificar canales con menor rendimiento

## Notas Importantes

- ✅ **Case Insensitive**: La búsqueda no distingue entre mayúsculas y minúsculas
- ✅ **Flexible**: Detecta variaciones como "fb", "wsp", "wa", etc.
- ✅ **Sin Especificar**: Cuenta registros sin procedencia definida
- ✅ **Tiempo Real**: Las estadísticas se calculan en tiempo real
- ✅ **Filtros Temporales**: Disponible para total, este mes y esta semana

## Archivos Modificados

- `src/controllers/cotizacionController.js` - Función `obtenerEstadisticas` actualizada

## Testing

Para probar las nuevas estadísticas:

```bash
curl -X GET http://localhost:3000/api/cotizaciones/estadisticas \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

Las nuevas estadísticas estarán disponibles inmediatamente después de la implementación.
