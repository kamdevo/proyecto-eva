# EVA — Documentación Técnica Adicional

**Sistema:** EVA – Sistema de Gestión de Equipos Médicos e Industriales  
**Organización:** Hospital Universitario del Valle (HUV)  
**Versión:** 2.0.0 | **Fecha:** Mayo 2026

---

## 1. Arquitectura de Estado — Frontend

### 1.1 Contextos React (Global State)

| Contexto | Archivo | Responsabilidad |
|---|---|---|
| `AuthContext` | `contexts/AuthContext.jsx` | Usuario autenticado, token, permisos, logout |
| `ToastContext` | `contexts/ToastContext.jsx` | Notificaciones globales de la app |
| `TicketsContext` | `contexts/TicketsContext.jsx` | Estado compartido de tickets |
| `EquipmentSearchContext` | `contexts/EquipmentSearchContext.jsx` | Búsqueda global de equipos (barra superior) |

### 1.2 Custom Hooks

| Hook | Archivo | Descripción |
|---|---|---|
| `useAuth` | `hooks/useAuth.jsx` | Permisos del usuario actual, `isAdmin()`, `permissionService` |
| `useEquipment` | `hooks/useEquipment.js` | CRUD de equipos, paginación, filtros |
| `useIdleTimeout` | `hooks/useIdleTimeout.js` | Detecta inactividad (30 min) y dispara logout |
| `useSedes` | `hooks/useRoles.js` | Carga sedes desde la API |

### 1.3 Servicio HTTP

`services/httpService.js` — Instancia de Axios con:
- **Base URL** configurada desde `VITE_API_BASE_URL`
- **Interceptor de request:** inyecta `Authorization: Bearer <token>` en cada petición
- **Interceptor de response:** maneja errores 401 (redirige a login), 403, 422 (validación), 500
- **Timeout:** configurable (default 30s)

```js
// Ejemplo de uso en un componente
import httpService from "@/services/httpService";

const response = await httpService.get("/equipos");
const data = response.data;
```

---

## 2. Sistema de Permisos — Detalle Técnico

### 2.1 Backend (Spatie + permisos propios)

El sistema usa **dos capas** de autorización:

**Capa 1 — `rol_id` en tabla `users`:**  
Controla qué rutas y menús son visibles. Se verifica en middlewares y directamente en controladores.

**Capa 2 — Tabla `permisos` (CRUD por módulo):**  
Permite configurar permisos granulares: `leer`, `insertar`, `editar`, `eliminar` por módulo y por usuario/rol.

```
Módulos con permisos granulares:
- dashboard, equipos, equipos-industriales, planes-mantenimiento
- correctivos, tickets propios, tickets cerrados, ordenes
- repuestos, capacitaciones, manuales, guias-rapidas
- config-servicios, config-areas, config-materiales, etc.
```

### 2.2 Frontend (permissionService)

Cargado en `AuthContext` al hacer login, el `permissionService`:
1. Obtiene los permisos del usuario desde `GET /api/v1/permisos/usuario`
2. Expone métodos: `canRead(modulo)`, `canInsert(modulo)`, `canEdit(modulo)`, `canDelete(modulo)`
3. El método `filterMenuItems(navigationItems)` filtra el sidebar según permisos

`PermissionWrapper` es un componente que oculta secciones de UI si el usuario no tiene el permiso:
```jsx
<PermissionWrapper module="equipos" action="insertar">
  <Button>Agregar Equipo</Button>   {/* Solo visible si puede insertar */}
</PermissionWrapper>
```

---

## 3. Módulo de Equipos — Flujo Técnico Detallado

### 3.1 Carga de la Vista de Equipos Biomédicos

```
1. MedicalDevicesView.jsx monta
2. useEquipment hook hace GET /equipos?tipo=biomedico&page=1
3. Lista paginada renderizada con cards/tabla
4. Al hover sobre una card → prefetch de detalles (GET /equipos/{id})
5. Al abrir modal de edición → prefetchDropdownOptions() carga catálogos en caché
```

### 3.2 Prefetch y Caché de Opciones

`equipmentPrefetchCache.js` mapea la respuesta de `GET /equipos/filter-options`:

```js
{
  periodosGarantias: resp.data.data.periodos_garantias,  // [{id, name}]
  tiposEquipo: resp.data.data.tipos_equipo,
  marcas: resp.data.data.marcas,
  estadosEquipo: resp.data.data.estados_equipo,
  servicios: resp.data.data.servicios,
  // ... más catálogos
}
```

**Campos `<Select>` y coincidencia de valores:**
- Los `SelectItem` usan `value={pg.id.toString()}` para comparar con el valor guardado en BD (que es el ID numérico almacenado como string)
- **No** usar `value={pg.name}` ya que la BD almacena el ID

### 3.3 Modal de Edición de Equipo

`edit-equipment-modal.jsx` (>3000 líneas):
- Inicializa `formData` con todos los campos del equipo
- Tabs: Información General, Adquisición, Técnica, Documentos
- Al guardar: `PUT /api/v1/equipos/{id}` con todos los campos del formulario
- Los campos de tipo `<Select>` deben tener su `value` como `string` (nunca `number`)

---

## 4. Módulo de Tickets — Flujo Técnico

### 4.1 Tipos de Ticket
Los tickets en EVA corresponden a órdenes de trabajo correctivas. Se clasifican por:
- **Tipo de equipo:** Biomédico, Industrial, Infraestructura
- **Subproceso:** Biomédica, Industrial, Infraestructura (determina quién lo ve)
- **Estado:** Abierto, En proceso, Cerrado, Cancelado

### 4.2 Visibilidad por Empresa
```js
// GestionTickets.jsx — lógica de visibilidad
const userEmpresaId = user?.id_empresa;
const canSeeIndustrial = ![3, 6].includes(userEmpresaId);
const canSeeInfraestructura = ![3, 6].includes(userEmpresaId);
// empresa 3 y 6 = solo ven Biomédica
```

### 4.3 Renderizado de Descripciones HTML
Las descripciones de tickets se guardan con formato HTML (negritas, cursivas). Se renderizan con:
```jsx
// En vistas React:
<div dangerouslySetInnerHTML={{ __html: ticket.descripcion }} />

// En PDFs (@react-pdf/renderer NO soporta HTML):
const stripHtml = (html) => html ? String(html).replace(/<[^>]*>/g, '') : '';
<Text>{stripHtml(ticket.descripcion)}</Text>
```

---

## 5. Módulo Dashboard — Datos y Fuentes

`DashboardUnificado.jsx` consume 4 endpoints:

| Tab | Fuente de datos | Endpoint |
|---|---|---|
| Resumen (KPIs) | Equipos totales, activos, en mantenimiento | `GET /equipos/medical-devices-complete` |
| Correctivos | Tickets por estado y tipo | `GET /correctivos-generales` |
| Preventivos | Cumplimiento del plan anual | `GET /planes-mantenimientos` |
| Equipos | Resumen del inventario | `GET /equipos/medical-devices-complete` |

Los gráficos de torta usan `recharts` (`PieChart`, `Pie`, `Cell`).  
Los datos de correctivos se cargan **lazy** (solo al activar el tab Correctivos).

---

## 6. Mantenimiento Preventivo — Estructura de Datos

Cada registro en `planes_mantenimientos` tiene:

```
equipo_id         → FK a equipos
anio              → Año del plan (de vigencias_mantenimiento)
frecuencia_id     → FK a frecuenciam (mensual, trimestral, semestral, anual)
mes1..mes12       → booleanos: ¿Se hace mantenimiento en ese mes?
responsable       → Nombre del técnico responsable
estado_mes1..12   → Estado de ejecución por mes
```

La `vigencias_mantenimiento` define el año activo. Solo hay una vigencia activa a la vez.

---

## 7. Exportaciones Excel — Controladores Backend

| Export | Controller Method | Ruta |
|---|---|---|
| Equipos biomédicos | `EquipmentController::exportExcel` | `GET /equipos/export` |
| Correctivos | `CorrectivosController::export` | `GET /correctivos-generales/export` |
| Tickets | `TicketsController::export` | `GET /gestion-tickets/export` |
| Preventivos | `PlanesController::export` | `GET /planes-mantenimientos/export` |
| Calibraciones | `CalibracionController::export` | `GET /calibraciones/export` |

Todos usan `Maatwebsite\Excel\Facades\Excel::download()` con clases Export dedicadas en `app/Exports/`.

---

## 8. Dockerización

Ambos servicios tienen `Dockerfile`:

### Backend (`eva-backend/Dockerfile`)
- Base: `php:8.2-fpm`
- Instala extensiones: `pdo_mysql`, `mbstring`, `exif`, `pcntl`, `bcmath`, `gd`
- Expone puerto `9000` (PHP-FPM)
- Configuración Nginx en `eva-backend/docker/`

### Frontend (`eva-frontend/Dockerfile`)
- Build stage: `node:20-alpine` → `npm run build`
- Serve stage: `nginx:alpine` → sirve `dist/`
- Expone puerto `80`

Ver configuraciones completas en `eva-backend/docker/` y `eva-frontend/docker/`.

---

## 9. Convenciones de Código

### Frontend
- **Componentes:** PascalCase (`MedicalDevicesView.jsx`)
- **Hooks:** camelCase con prefijo `use` (`useEquipment.js`)
- **Servicios:** camelCase (`httpService.js`)
- **Importaciones de UI:** siempre desde `@/components/ui/...` (alias `@` = `src/`)
- **Estilos:** Tailwind CSS utility classes, sin CSS modules ni styled-components
- **No** usar `console.log` en producción (solo en desarrollo)
- Las rutas API se definen como constantes en `src/config/`

### Backend
- **Controladores:** `NombreController.php` en `app/Http/Controllers/Api/`
- **Requests:** `NombreRequest.php` para validación
- **Queries:** preferir `DB::table()` sobre Eloquent para performance en tablas grandes
- **Respuestas:** siempre JSON con estructura `{ success, data, message }`
- **Logs:** usar `Log::info()`, `Log::error()` en puntos críticos

---

## 10. Problemas Conocidos y Soluciones

| Problema | Causa | Solución |
|---|---|---|
| `<Select>` no muestra valor guardado | `value` del item no coincide con dato de BD | Usar `pg.id.toString()` como value de `SelectItem` |
| PDF con etiquetas HTML visibles | `@react-pdf/renderer` no soporta HTML | Usar `stripHtml()` antes de renderizar en PDF |
| Error 401 en rutas protegidas | Token expirado o no enviado | `httpService.js` redirige automáticamente a `/login` |
| Descripción de ticket muestra `<b>texto</b>` | Renderizado como texto plano | Usar `dangerouslySetInnerHTML={{ __html: value }}` |
| Modal de equipo muy grande en móvil | Dialog con `sm:max-w-lg` fijo | Pasar `className="sm:max-w-6xl"` para sobreescribir via tailwind-merge |
| Tabla de equipos muestra solo activos | Filtro `estado_id: 1` en query | Remover filtro para mostrar todos los estados |
