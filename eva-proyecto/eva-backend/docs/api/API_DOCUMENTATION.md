# EVA API Documentation

**Versión:** 1.0.0
**Descripción:** API completa para el sistema de gestión de equipos biomédicos EVA
**Generado:** 25/06/2025 21:02:44

## 🔐 Autenticación

La API utiliza autenticación Bearer Token (Sanctum):

```
Authorization: Bearer YOUR_TOKEN_HERE
```

## 📊 Endpoints Disponibles

### `/login`

#### POST /login

**Resumen:** Iniciar sesión

**Descripción:** Autenticar usuario y obtener token de acceso

**Tags:** Autenticación

---

### `/export/equipos-consolidado`

#### POST /export/equipos-consolidado

**Resumen:** Exportar reporte consolidado de equipos

**Descripción:** Genera un reporte consolidado de equipos seleccionados con opciones configurables

**Tags:** Exportación

---

### `/export/plantilla-mantenimiento`

#### POST /export/plantilla-mantenimiento

**Resumen:** Exportar plantilla de mantenimiento

**Descripción:** Genera una plantilla de mantenimientos programados para un año específico

**Tags:** Exportación

---

### `/export/contingencias`

#### POST /export/contingencias

**Resumen:** Exportar reporte de contingencias

**Descripción:** Genera un reporte de contingencias en un rango de fechas

**Tags:** Exportación

---

### `/equipos`

#### GET /equipos

**Resumen:** Listar equipos

**Descripción:** Obtener lista paginada de equipos con filtros

**Tags:** Equipos

#### POST /equipos

**Resumen:** Crear equipo

**Descripción:** Crear un nuevo equipo médico

**Tags:** Equipos

---

### `/dashboard/stats`

#### GET /dashboard/stats

**Resumen:** Obtener estadísticas del dashboard

**Descripción:** Estadísticas generales del sistema

**Tags:** Dashboard

---

## 📱 Uso desde Frontend

```javascript
// Configuración base
const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  }
});
```

