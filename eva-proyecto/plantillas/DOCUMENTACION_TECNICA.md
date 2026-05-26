# EVA — Documentación Técnica

**Sistema:** EVA – Sistema de Gestión de Equipos Médicos e Industriales  
**Organización:** Hospital Universitario del Valle (HUV)  
**Versión:** 2.0.0 | **Fecha:** Mayo 2026

---

## 1. Resumen de Arquitectura

EVA es una aplicación web SPA (Single Page Application) con arquitectura cliente-servidor:

```
┌─────────────────────────────────────────────┐
│              CLIENTE (Browser)              │
│   React 19 + Vite + Tailwind CSS v4         │
│   eva2.huv.gov.co                           │
└──────────────────┬──────────────────────────┘
                   │ HTTPS / JSON API
                   │ Bearer Token (Sanctum)
┌──────────────────▼──────────────────────────┐
│              BACKEND (Servidor)             │
│   Laravel 12 + PHP 8.2                      │
│   api.eva2.huv.gov.co                       │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│           BASE DE DATOS                     │
│   MySQL 8.x — gestionthuv                  │
└─────────────────────────────────────────────┘
```

---

## 2. Stack Tecnológico

### Backend
| Tecnología | Versión | Uso |
|---|---|---|
| PHP | ^8.2 | Lenguaje del servidor |
| Laravel | ^12.0 | Framework principal |
| Laravel Sanctum | ^4.1 | Autenticación API (tokens) |
| Spatie Laravel Permission | ^6.20 | Sistema de roles y permisos |
| Maatwebsite Excel | ^3.1 | Exportación a Excel (.xlsx) |
| barryvdh/laravel-dompdf | ^3.1 | Generación de PDFs (servidor) |
| MySQL | 8.x | Base de datos relacional |

### Frontend
| Tecnología | Versión | Uso |
|---|---|---|
| React | 19.2.0 | UI framework |
| Vite | ^6.3.5 | Build tool y dev server |
| Tailwind CSS | ^4.1.10 | Estilos utilitarios |
| Shadcn/ui (Radix UI) | — | Componentes accesibles |
| React Router DOM | ^7.6.2 | Routing SPA |
| Axios | ^1.10.0 | Cliente HTTP |
| Recharts | ^3.8.0 | Gráficas y estadísticas |
| @react-pdf/renderer | ^4.3.0 | Generación PDFs en el cliente |
| Framer Motion | ^12.x | Animaciones UI |
| Sonner | ^2.0.6 | Notificaciones toast |
| Lucide React | ^0.517.0 | Íconos |

---

## 3. Estructura de Carpetas

### Backend (`eva-backend/`)
```
eva-backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/Api/     # Controladores de la API REST
│   │   ├── Middleware/          # Middleware personalizado
│   │   └── Requests/            # Validación de formularios
│   ├── Models/                  # Modelos Eloquent (mínimo uso, se prefieren queries directas)
│   └── Services/                # Lógica de negocio
├── config/                      # Configuraciones Laravel
├── database/
│   ├── migrations/              # Definición de tablas
│   └── seeders/                 # Datos iniciales
├── routes/
│   └── api.php                  # Todas las rutas de la API
└── storage/
    ├── logs/                    # Logs del sistema
    └── app/public/              # Archivos subidos
```

### Frontend (`eva-frontend/`)
```
eva-frontend/
└── src/
    ├── App.jsx                  # Router principal + layout
    ├── components/
    │   ├── modals/              # +100 modales de la app
    │   ├── pdf/                 # Generadores de PDF (react-pdf)
    │   ├── ui/                  # Componentes base (Shadcn)
    │   ├── equipment/           # Sub-componentes de equipos
    │   ├── common/              # Componentes reutilizables (Pagination, etc.)
    │   ├── skeletons/           # Estados de carga
    │   └── *.jsx                # Vistas principales de cada módulo
    ├── contexts/                # React Context (Auth, Toast, Tickets, EquipmentSearch)
    ├── hooks/                   # Custom hooks (useEquipment, useAuth, useIdleTimeout, etc.)
    ├── services/
    │   ├── httpService.js       # Cliente Axios con interceptors
    │   └── equipmentPrefetchCache.js  # Cache de opciones de formularios
    ├── config/                  # Constantes y configuración global
    └── utils/                   # Funciones utilitarias
```

---

## 4. Módulos del Sistema y Rutas

### 4.1 Módulo EQUIPOS
| Sub-módulo | Ruta Frontend | Descripción |
|---|---|---|
| Biomédicos | `/equipos/biomedicos` | Inventario y gestión de equipos biomédicos |
| Industriales | `/equipos/industriales` | Inventario y gestión de equipos industriales |
| Órdenes de Compra | `/equipos/ordenes-compra` | Equipos en proceso de compra |
| Bajas | `/equipos/bajas` | Equipos dados de baja |
| Contingencias | `/equipos/contingencias` | Equipos en contingencia/sustitución |
| Guías Rápidas | `/equipos/guias-rapidas` | Guías de uso rápidas |
| Manuales | `/equipos/manuales` | Manuales técnicos de equipos |
| Consultas | `/equipos/consultas` | Consultas generales de equipos industriales |

### 4.2 Módulo PLANES
| Sub-módulo | Ruta Frontend | Descripción |
|---|---|---|
| Mtto. Preventivo | `/planes/preventivo` | Plan anual de mantenimiento preventivo |

### 4.3 Módulo ÓRDENES (Tickets)
| Sub-módulo | Ruta Frontend | Descripción |
|---|---|---|
| Mis Tickets | `/ordenes/mis-tickets` | Tickets creados por el usuario actual |
| Gestión de Tickets | `/ordenes/gestion-tickets` | Panel admin de todos los tickets |
| Tickets Cerrados | `/ordenes/tickets-cerrados` | Historial de tickets finalizados |

### 4.4 Otros Módulos
| Módulo | Ruta Frontend | Acceso Mínimo |
|---|---|---|
| Repuestos | `/repuestos` | Rol 3+ |
| Capacitaciones | `/capacitaciones` | Todos |
| Dashboard | `/dashboard/reportes` | Rol 1-2 (admin) |
| Configuración | `/config/*` | Rol 1-3 |
| Administrador | `/admin/*` | Rol 1-2 |

---

## 5. API REST — Endpoints Principales

**Base URL:** `http://api.eva2.huv.gov.co/api/v1/`  
**Autenticación:** `Authorization: Bearer <token>`

### Autenticación
| Método | Endpoint | Descripción |
|---|---|---|
| POST | `/auth/login` | Iniciar sesión |
| POST | `/auth/logout` | Cerrar sesión |
| GET | `/auth/user` | Obtener usuario actual |

### Equipos
| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/equipos` | Listado paginado de equipos |
| GET | `/equipos/{id}` | Detalle de un equipo |
| POST | `/equipos` | Crear equipo |
| PUT | `/equipos/{id}` | Actualizar equipo |
| DELETE | `/equipos/{id}` | Eliminar equipo |
| GET | `/equipos/medical-devices-complete` | KPIs y métricas globales |
| GET | `/equipos/filter-options` | Opciones de formularios (catálogos) |

### Tickets / Correctivos
| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/correctivos-generales` | Listado de tickets |
| POST | `/correctivos-generales` | Crear ticket |
| PUT | `/correctivos-generales/{id}` | Actualizar ticket |
| GET | `/gestion-tickets` | Gestión administrativa de tickets |

### Planes de Mantenimiento
| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/planes-mantenimientos` | Listado de planes |
| POST | `/planes-mantenimientos` | Crear plan |
| PUT | `/planes-mantenimientos/{id}` | Actualizar plan |

### Catálogos y Configuración
| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/servicios` | Servicios del hospital |
| GET | `/areas` | Áreas por servicio |
| GET | `/users` | Usuarios del sistema |
| GET | `/roles` | Roles disponibles |
| GET | `/sedes` | Sedes del hospital |

---

## 6. Sistema de Autenticación y Permisos

### Flujo de Login
```
1. POST /api/v1/auth/login  { email, password }
2. Backend valida credenciales y verificación de email
3. Retorna: { token, user: { id, nombre, email, rol_id, id_empresa, ... } }
4. Frontend almacena token en AuthContext
5. Todas las peticiones incluyen: Authorization: Bearer <token>
```

### Roles y Permisos
Los permisos se gestionan de dos formas:
1. **Por rol (`rol_id`):** control de acceso a nivel de vista/ruta
2. **Por módulo en BD:** permisos granulares (leer, insertar, editar, eliminar) en tabla `permisos`

```
rol_id = 1: Super Administrador → acceso total
rol_id = 2: Administrador → sin gestión de super-admin
rol_id = 3: Avanzado → sin usuarios ni algunas config avanzadas
rol_id = 4: Normal → solo lectura de equipos + sus propios tickets
```

El `permissionService` en el frontend (`AuthContext.jsx`) filtra el menú de navegación según el rol y los permisos cargados desde el backend.

---

## 7. Generación de Reportes y Exportaciones

### Exportación a Excel (servidor)
Usa `Maatwebsite\Excel`. Exports disponibles:
- Listado de equipos biomédicos / industriales
- Cronograma de mantenimiento preventivo
- Registros de calibraciones
- Tickets / correctivos

Todos los endpoints de exportación retornan `Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` y el frontend crea un `Blob` para descarga directa.

### Generación de PDF (cliente)
Usa `@react-pdf/renderer`. Componentes en `eva-frontend/src/components/pdf/`:
- `TicketPDF.jsx` — PDF de ticket individual
- `equipment-modal-replica-pdf.jsx` — Ficha técnica de equipo

> **Nota técnica:** `@react-pdf/renderer` no puede renderizar HTML. Toda descripción HTML debe pasar por `stripHtml()` antes de incluirse en PDFs.

### Generación de PDF (servidor)
`barryvdh/laravel-dompdf` se usa en el backend para reportes que requieren plantilla Blade.

---

## 8. Seguridad

| Mecanismo | Implementación |
|---|---|
| Autenticación | Laravel Sanctum (Bearer tokens) |
| Autorización | Spatie Permission + permisos por módulo |
| Rate Limiting | `throttle:60,1` en todas las rutas API |
| CORS | Configurado para dominios HUV únicamente |
| Validación | `FormRequest` classes en cada endpoint |
| Contraseñas | Bcrypt (12 rondas) |
| Sesión inactiva | Timeout automático 30 min (frontend) |
| Verificación email | Requerida para nuevos usuarios |

---

## 9. Gestión de Imágenes de Equipos

- Las imágenes se suben via `POST /api/v1/equipos/{id}/image`
- Se almacenan en `storage/app/public/equipos/`
- Se sirven desde `APP_URL/storage/equipos/`
- El componente `EquipmentImage.jsx` maneja carga progresiva y fallback a imagen por defecto

---

## 10. Caché de Opciones de Formularios

El frontend usa `equipmentPrefetchCache.js` para cargar y cachear las opciones de selección (catálogos) que se usan en los formularios de equipos:
- Tipos de equipo, marcas, modelos
- Servicios, áreas
- Estados, propietarios
- Períodos de garantía, frecuencias de mantenimiento

El caché se precarga al abrir el modal de agregar/editar equipo y se invalida tras operaciones de escritura.
