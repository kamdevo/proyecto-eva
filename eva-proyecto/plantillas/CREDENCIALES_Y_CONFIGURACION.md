# EVA — Credenciales y Configuración del Sistema

**Sistema:** EVA – Sistema de Gestión de Equipos Médicos e Industriales  
**Organización:** Hospital Universitario del Valle (HUV)  
**Fecha de documento:** Mayo 2026  
**Versión:** 2.0.0

---

## 1. URLs del Sistema en Producción

| Componente | URL |
|---|---|
| Frontend (aplicación web) | `http://eva2.huv.gov.co` |
| Backend / API | `http://api.eva2.huv.gov.co` |
| API base path | `http://api.eva2.huv.gov.co/api/v1/` |

---

## 2. Variables de Entorno — Backend (`.env`)

Archivo ubicado en `eva-backend/.env`. Las variables críticas son:

```env
APP_NAME="EVA - Sistema de Gestión de Equipos"
APP_ENV=production
APP_KEY=base64:<clave_generada_con_artisan_key:generate>
APP_DEBUG=false                        # Cambiar a false en producción
APP_URL=http://api.eva2.huv.gov.co

APP_LOCALE=es
APP_TIMEZONE=America/Bogota

# ─── BASE DE DATOS ───────────────────────────────────
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=gestionthuv
DB_USERNAME=root
DB_PASSWORD=<contraseña_db>

# ─── AUTENTICACIÓN (Laravel Sanctum) ─────────────────
SANCTUM_STATEFUL_DOMAINS=eva2.huv.gov.co,api.eva2.huv.gov.co,www.eva2.huv.gov.co

# ─── CORS ────────────────────────────────────────────
CORS_ALLOWED_ORIGINS=http://eva2.huv.gov.co,http://api.eva2.huv.gov.co
CORS_ALLOWED_METHODS=GET,POST,PUT,DELETE,OPTIONS
CORS_ALLOWED_HEADERS=Origin,X-Requested-With,Content-Type,Accept,Authorization,X-CSRF-TOKEN

# ─── SESIÓN ──────────────────────────────────────────
SESSION_DRIVER=file
SESSION_LIFETIME=120
SESSION_DOMAIN=.eva2.huv.gov.co

# ─── CACHE / COLAS ───────────────────────────────────
CACHE_STORE=file
QUEUE_CONNECTION=sync

# ─── CORREO (configurar según proveedor HUV) ─────────
MAIL_MAILER=smtp
MAIL_HOST=<servidor_smtp>
MAIL_PORT=587
MAIL_USERNAME=<usuario>
MAIL_PASSWORD=<contraseña>
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=eva@huv.gov.co
MAIL_FROM_NAME="EVA - HUV"
```

> **⚠ Importante:** Nunca compartir el `APP_KEY` ni las contraseñas de base de datos en repositorios de código.

---

## 3. Configuración del Frontend

El frontend usa variables de entorno de Vite (archivos `.env` en `eva-frontend/`):

```env
# eva-frontend/.env.production
VITE_API_BASE_URL=http://api.eva2.huv.gov.co/api/v1
VITE_APP_NAME="EVA - HUV"
```

El archivo `vite.config.js` está configurado con:
- Build output: `eva-frontend/dist/`
- Alias `@` → `src/`
- SWC para compilación React (rápida)

---

## 4. Base de Datos

| Parámetro | Valor |
|---|---|
| Motor | MySQL 8.x |
| Nombre BD | `gestionthuv` |
| Host | `127.0.0.1` (localhost) |
| Puerto | `3306` |
| Colación recomendada | `utf8mb4_unicode_ci` |

### Tablas principales

| Tabla | Descripción |
|---|---|
| `users` | Usuarios del sistema |
| `roles` | Roles (superadmin, admin, avanzado, normal) |
| `permisos` | Permisos por módulo y rol |
| `equipos` | Inventario de equipos (biomédicos e industriales) |
| `servicios` | Servicios/dependencias del hospital |
| `areas` | Áreas dentro de cada servicio |
| `centros` | Centros de costo |
| `correctivos_generales` | Órdenes de trabajo / tickets correctivos |
| `planes_mantenimientos` | Plan anual de mantenimiento preventivo |
| `calibraciones_ind` | Registros de calibración de equipos |
| `contingencias` | Equipos en contingencia |
| `repuestos` | Inventario de repuestos |
| `periodos_garantias` | Catálogo de períodos de garantía |
| `frecuenciam` | Frecuencias de mantenimiento |
| `vigencias_mantenimiento` | Año/vigencia activa de mantenimiento |
| `propietarios` | Propietarios/instituciones de los equipos |
| `sedes` | Sedes del hospital |
| `empresas_mantenimiento` | Empresas de mantenimiento externo |

---

## 5. Roles de Usuario

| `rol_id` | Nombre | Acceso |
|---|---|---|
| 1 | **Super Administrador** | Acceso total, gestión de usuarios, todas las vistas |
| 2 | **Administrador** | Todas las vistas + Dashboard + Configuración |
| 3 | **Avanzado** | Equipos, Tickets, Repuestos, Configuración básica |
| 4 | **Normal** | Solo Mis Tickets y Equipos (solo lectura) |

Los permisos granulares (leer, insertar, editar, eliminar) se configuran por módulo en la tabla `permisos`.

---

## 6. Autenticación — Laravel Sanctum

- **Método:** Token Bearer (SPA token)
- **Endpoint login:** `POST /api/v1/auth/login`
- **Header requerido en todas las llamadas autenticadas:**
  ```
  Authorization: Bearer <token>
  Accept: application/json
  ```
- **Timeout de sesión inactiva:** 30 minutos (configurable en `useIdleTimeout` hook)
- **Verificación de email:** Habilitada. Nuevos usuarios deben confirmar su cuenta mediante enlace enviado por correo.

---

## 7. Procedimiento de Despliegue Rápido

### Backend (Laravel)
```bash
cd eva-backend
composer install --no-dev
php artisan key:generate
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### Frontend (React + Vite)
```bash
cd eva-frontend
npm ci
npm run build       # genera: eva-frontend/dist/
# Copiar dist/ al servidor web (nginx/apache)
```

Para guía completa de despliegue ver: `plantillas/GUIA DE DESPLIEGUE DEL APLICATIVO.pdf`

---

## 8. Rate Limiting

La API implementa rate limiting global:
- **60 requests por minuto** por IP autenticada
- Configurado via middleware `throttle:60,1` en todas las rutas `/api/v1/`

---

## 9. Logs y Monitoreo

| Tipo | Ubicación |
|---|---|
| Logs Laravel | `eva-backend/storage/logs/laravel.log` |
| Logs de colas | `eva-backend/storage/logs/` |
| Errores frontend | Consola del navegador / Sentry (si configurado) |

Para leer logs:
```bash
php read-log.php
# o directamente:
tail -f storage/logs/laravel.log
```
