# Ejemplos de Endpoints de Exportación - EVA Backend

## 📋 Guía de Uso de APIs de Exportación

Esta documentación proporciona ejemplos prácticos de uso para todos los endpoints de exportación refactorizados del sistema EVA.

---

## 🔐 Autenticación

Todos los endpoints requieren autenticación Bearer Token:

```javascript
headers: {
  'Authorization': 'Bearer YOUR_TOKEN_HERE',
  'Content-Type': 'application/json',
  'Accept': 'application/json'
}
```

---

## 📊 Endpoints de Exportación

### 1. Exportar Equipos Consolidado

**Endpoint**: `POST /api/export/equipos-consolidado`

**Descripción**: Genera un reporte consolidado de equipos seleccionados con información configurable.

#### Ejemplo de Request:
```javascript
const response = await fetch('/api/export/equipos-consolidado', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    equipos_ids: [1, 2, 3, 4, 5],
    formato: 'excel',
    incluir: {
      detalles_equipo: true,
      cronograma: true,
      cumplimiento: true,
      responsables: true,
      estadisticas: true
    }
  })
});
```

#### Parámetros:
- `equipos_ids` (array, requerido): IDs de equipos a incluir
- `formato` (string, requerido): "pdf", "excel", "csv"
- `incluir` (object, requerido): Opciones de información
  - `detalles_equipo` (boolean): Marca, modelo, serie, estado, riesgo
  - `cronograma` (boolean): Último y próximo mantenimiento
  - `cumplimiento` (boolean): Estadísticas de cumplimiento
  - `responsables` (boolean): Usuario responsable
  - `estadisticas` (boolean): Métricas adicionales

#### Respuesta Exitosa (Excel/CSV):
```
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Content-Disposition: attachment; filename="reporte_consolidado_equipos.xlsx"
[Binary file content]
```

#### Respuesta Exitosa (PDF):
```json
{
  "status": "success",
  "message": "Datos preparados para exportación PDF",
  "data": {
    "html_content": "<h1>Reporte Consolidado de Equipos</h1>...",
    "titulo": "Reporte Consolidado de Equipos",
    "formato": "pdf",
    "total_registros": 5
  }
}
```

---

### 2. Exportar Plantilla de Mantenimiento

**Endpoint**: `POST /api/export/plantilla-mantenimiento`

**Descripción**: Genera una plantilla de mantenimientos programados para un período específico.

#### Ejemplo de Request:
```javascript
const response = await fetch('/api/export/plantilla-mantenimiento', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    año: 2024,
    mes: 3, // Opcional
    servicio_id: 1, // Opcional
    formato: 'excel'
  })
});
```

#### Parámetros:
- `año` (integer, requerido): Año de la plantilla (2020-2030)
- `mes` (integer, opcional): Mes específico (1-12)
- `servicio_id` (integer, opcional): Filtrar por servicio
- `formato` (string, requerido): "pdf", "excel"

---

### 3. Exportar Contingencias

**Endpoint**: `POST /api/export/contingencias`

**Descripción**: Genera un reporte de contingencias en un rango de fechas con filtros opcionales.

#### Ejemplo de Request:
```javascript
const response = await fetch('/api/export/contingencias', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    fecha_desde: '2024-01-01',
    fecha_hasta: '2024-12-31',
    estado: 'Activa', // Opcional
    severidad: 'Alta', // Opcional
    formato: 'csv'
  })
});
```

#### Parámetros:
- `fecha_desde` (date, requerido): Fecha de inicio (YYYY-MM-DD)
- `fecha_hasta` (date, requerido): Fecha de fin (YYYY-MM-DD)
- `estado` (string, opcional): "Activa", "En Proceso", "Resuelta"
- `severidad` (string, opcional): "Baja", "Media", "Alta", "Crítica"
- `formato` (string, requerido): "pdf", "excel", "csv"

---

### 4. Exportar Estadísticas de Cumplimiento

**Endpoint**: `POST /api/export/estadisticas-cumplimiento`

**Descripción**: Genera estadísticas de cumplimiento de mantenimientos por año.

#### Ejemplo de Request:
```javascript
const response = await fetch('/api/export/estadisticas-cumplimiento', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    año: 2024,
    servicio_id: 2, // Opcional
    formato: 'pdf'
  })
});
```

#### Parámetros:
- `año` (integer, requerido): Año de las estadísticas (2020-2030)
- `servicio_id` (integer, opcional): Filtrar por servicio
- `formato` (string, requerido): "pdf", "excel"

---

### 5. Exportar Equipos Críticos

**Endpoint**: `POST /api/export/equipos-criticos`

**Descripción**: Genera un reporte de equipos clasificados como críticos.

#### Ejemplo de Request:
```javascript
const response = await fetch('/api/export/equipos-criticos', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    formato: 'excel'
  })
});
```

#### Parámetros:
- `formato` (string, requerido): "pdf", "excel", "csv"

---

### 6. Exportar Tickets

**Endpoint**: `POST /api/export/tickets`

**Descripción**: Genera un reporte de tickets en un rango de fechas con filtros opcionales.

#### Ejemplo de Request:
```javascript
const response = await fetch('/api/export/tickets', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    fecha_desde: '2024-01-01',
    fecha_hasta: '2024-12-31',
    estado: 'abierto', // Opcional
    categoria: 'mantenimiento', // Opcional
    formato: 'excel'
  })
});
```

#### Parámetros:
- `fecha_desde` (date, requerido): Fecha de inicio (YYYY-MM-DD)
- `fecha_hasta` (date, requerido): Fecha de fin (YYYY-MM-DD)
- `estado` (string, opcional): "abierto", "en_proceso", "pendiente", "resuelto", "cerrado"
- `categoria` (string, opcional): Categoría del ticket
- `formato` (string, requerido): "pdf", "excel", "csv"

---

### 7. Exportar Calibraciones

**Endpoint**: `POST /api/export/calibraciones`

**Descripción**: Genera un reporte de calibraciones por año con filtros opcionales.

#### Ejemplo de Request:
```javascript
const response = await fetch('/api/export/calibraciones', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    año: 2024,
    mes: 6, // Opcional
    estado: 'programada', // Opcional
    formato: 'csv'
  })
});
```

#### Parámetros:
- `año` (integer, requerido): Año de las calibraciones (2020-2030)
- `mes` (integer, opcional): Mes específico (1-12)
- `estado` (string, opcional): "programada", "completada", "vencida"
- `formato` (string, requerido): "pdf", "excel", "csv"

---

### 8. Exportar Inventario de Repuestos

**Endpoint**: `POST /api/export/inventario-repuestos`

**Descripción**: Genera un reporte del inventario de repuestos con filtros opcionales.

#### Ejemplo de Request:
```javascript
const response = await fetch('/api/export/inventario-repuestos', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    categoria: 'filtros', // Opcional
    bajo_stock: true, // Opcional
    criticos: false, // Opcional
    formato: 'excel'
  })
});
```

#### Parámetros:
- `categoria` (string, opcional): Categoría de repuesto
- `bajo_stock` (boolean, opcional): Solo repuestos con stock <= stock_mínimo
- `criticos` (boolean, opcional): Solo repuestos marcados como críticos
- `formato` (string, requerido): "pdf", "excel", "csv"

---

## ⚠️ Manejo de Errores

### Error de Validación (422):
```json
{
  "status": "error",
  "message": "Los datos proporcionados no son válidos",
  "errors": {
    "año": ["El campo año es obligatorio"],
    "formato": ["El formato seleccionado no es válido"]
  }
}
```

### Error del Servidor (500):
```json
{
  "status": "error",
  "message": "Error al exportar: Database connection failed",
  "code": 500
}
```

### Error de Autenticación (401):
```json
{
  "message": "Unauthenticated."
}
```

---

## 🔧 Ejemplos con JavaScript/Axios

### Configuración Base:
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Interceptor para token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Ejemplo Completo:
```javascript
async function exportarEquiposConsolidado() {
  try {
    const response = await api.post('/export/equipos-consolidado', {
      equipos_ids: [1, 2, 3],
      formato: 'excel',
      incluir: {
        detalles_equipo: true,
        cronograma: true,
        cumplimiento: true,
        responsables: true,
        estadisticas: true
      }
    }, {
      responseType: 'blob' // Para archivos binarios
    });

    // Crear enlace de descarga
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'reporte_equipos.xlsx');
    document.body.appendChild(link);
    link.click();
    link.remove();
    
  } catch (error) {
    console.error('Error al exportar:', error.response?.data || error.message);
  }
}
```

---

## 📱 Ejemplos con React

### Hook Personalizado:
```javascript
import { useState } from 'react';
import { api } from '../config/api';

export const useExport = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const exportData = async (endpoint, data) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post(endpoint, data, {
        responseType: data.formato === 'pdf' ? 'json' : 'blob'
      });

      if (data.formato === 'pdf') {
        // Manejar respuesta PDF (HTML content)
        return response.data;
      } else {
        // Descargar archivo
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `export.${data.formato === 'excel' ? 'xlsx' : 'csv'}`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al exportar');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { exportData, loading, error };
};
```

### Componente de Uso:
```javascript
import React from 'react';
import { useExport } from '../hooks/useExport';

const ExportButton = ({ equiposIds }) => {
  const { exportData, loading, error } = useExport();

  const handleExport = async () => {
    await exportData('/export/equipos-consolidado', {
      equipos_ids: equiposIds,
      formato: 'excel',
      incluir: {
        detalles_equipo: true,
        cronograma: true,
        cumplimiento: true,
        responsables: true,
        estadisticas: true
      }
    });
  };

  return (
    <div>
      <button onClick={handleExport} disabled={loading}>
        {loading ? 'Exportando...' : 'Exportar Equipos'}
      </button>
      {error && <p style={{color: 'red'}}>{error}</p>}
    </div>
  );
};
```

---

## 🎯 Notas Importantes

1. **Formatos soportados**: PDF, Excel (.xlsx), CSV
2. **Autenticación requerida**: Todos los endpoints requieren Bearer Token
3. **Rate limiting**: 120 requests por minuto por usuario autenticado
4. **Tamaño máximo**: Los reportes grandes pueden requerir más tiempo de procesamiento
5. **Compatibilidad**: 100% compatible con la API anterior
6. **Arquitectura**: Servicios especializados con inyección de dependencias
