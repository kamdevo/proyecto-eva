# EVA — Manual de Usuario (Administrador / Técnico)

**Sistema:** EVA – Sistema de Gestión de Equipos Médicos e Industriales  
**Organización:** Hospital Universitario del Valle (HUV)  
**Versión:** 2.0.0 | **Fecha:** Mayo 2026  
**Audiencia:** Administradores del sistema y técnicos de mantenimiento biomédico

---

## Índice

1. [Acceso al Sistema](#1-acceso-al-sistema)
2. [Navegación General](#2-navegación-general)
3. [Módulo Equipos Biomédicos](#3-módulo-equipos-biomédicos)
4. [Módulo Equipos Industriales](#4-módulo-equipos-industriales)
5. [Módulo Órdenes de Trabajo (Tickets)](#5-módulo-órdenes-de-trabajo-tickets)
6. [Módulo Planes de Mantenimiento](#6-módulo-planes-de-mantenimiento)
7. [Módulo Repuestos](#7-módulo-repuestos)
8. [Módulo Capacitaciones](#8-módulo-capacitaciones)
9. [Dashboard y Estadísticas](#9-dashboard-y-estadísticas)
10. [Módulo Configuración](#10-módulo-configuración)
11. [Módulo Administrador](#11-módulo-administrador)
12. [Perfil de Usuario](#12-perfil-de-usuario)
13. [Búsqueda Global](#13-búsqueda-global)

---

## 1. Acceso al Sistema

**URL:** `http://eva2.huv.gov.co`

### 1.1 Inicio de Sesión
1. Ingresar al navegador la URL del sistema
2. Escribir **correo electrónico** y **contraseña**
3. Hacer clic en **"Iniciar sesión"**

> Si es la primera vez, el sistema enviará un correo de verificación. Confirmar la cuenta antes de iniciar sesión.

### 1.2 Cierre de Sesión Automático
Por seguridad, la sesión se cierra automáticamente tras **30 minutos de inactividad**. El sistema mostrará una alerta 2 minutos antes con la opción de continuar.

### 1.3 Recuperación de Contraseña
Contactar al administrador del sistema (`rol_id = 1`) para restablecimiento de contraseña.

---

## 2. Navegación General

La aplicación tiene dos elementos de navegación:

**Barra Superior (Header):**
- Logo y nombre del sistema a la izquierda
- Barra de búsqueda global de equipos al centro
- Nombre del usuario y opciones de perfil/salida a la derecha

**Menú Lateral (Sidebar):**
- Se abre/cierra con el botón ☰ en la barra superior
- Organizado en secciones: INICIO, EQUIPOS, PLANES, ORDENES, REPUESTOS, CAPACITACIONES, DASHBOARD, CONFIGURACIÓN, ADMINISTRADOR
- Las secciones con submenú se expanden al hacer clic

> El menú muestra solo las secciones a las que el usuario tiene acceso según su rol y permisos.

---

## 3. Módulo Equipos Biomédicos

**Ruta:** `EQUIPOS → BIOMEDICOS` (`/equipos/biomedicos`)

### 3.1 Vista General
- Lista todos los equipos biomédicos del inventario
- Dos modos de visualización: **Tarjetas** (cards) y **Tabla**
- Indicador de cantidad total, activos e inactivos

### 3.2 Filtros y Búsqueda
- **Búsqueda por texto:** busca en nombre, código, serie, marca
- **Filtros avanzados** (botón "Filtrar"): por servicio, área, estado, tipo, marca, propietario, fecha
- **Ordenamiento** en modo tabla: hacer clic en el encabezado de cualquier columna

### 3.3 Acciones por Equipo
Al posicionar el cursor sobre una tarjeta o hacer clic en los botones de la fila:

| Acción | Descripción |
|---|---|
| 👁 Ver | Abre el detalle completo del equipo (solo lectura) |
| ✏️ Editar | Abre el formulario de edición del equipo |
| 📎 Documentos | Gestiona documentos adjuntos (manuales, certificados) |
| 📋 Correctivo | Crea una orden de trabajo correctiva |
| 🔧 Preventivo | Registra actividad de mantenimiento preventivo |
| 📏 Calibración | Registra una calibración del equipo |
| 📌 Observación | Agrega una observación al equipo |
| ⬇️ Baja | Registra el equipo como dado de baja |
| 🗑 Eliminar | Elimina el equipo (requiere confirmación) |

### 3.4 Agregar Equipo
1. Clic en botón **"Agregar Equipo"** (esquina superior derecha)
2. Completar las pestañas del formulario:
   - **Información General:** nombre, código, serie, marca, modelo, tipo
   - **Adquisición:** fecha compra, valor, proveedor, garantía
   - **Técnica:** voltaje, potencia, peso, dimensiones, riesgo
3. Clic en **"Guardar"**

### 3.5 Editar Equipo
1. Clic en ✏️ sobre el equipo
2. Modificar los campos necesarios
3. Los campos desplegables (Garantía, Estado, etc.) muestran el valor actualmente guardado
4. Clic en **"Guardar cambios"**

### 3.6 Exportaciones
- **Excel:** exporta el listado completo o filtrado
- **PDF individual:** desde el modal de detalle de cada equipo
- **PDF masivo:** descarga todos los equipos visibles en PDF

### 3.7 Sub-módulos de Equipos

| Sub-módulo | Descripción |
|---|---|
| **Contingencias** | Equipos temporalmente fuera de servicio con sustituto |
| **Guías Rápidas** | Instrucciones de uso rápido asociadas a equipos |
| **Manuales** | Repositorio de manuales técnicos en PDF |
| **Órdenes de Compra** | Equipos en proceso de adquisición |
| **Bajas** | Equipos desincorporados del inventario activo |
| **Consultas** | Búsquedas avanzadas en equipos industriales |

---

## 4. Módulo Equipos Industriales

**Ruta:** `EQUIPOS → INDUSTRIALES` (`/equipos/industriales`)

Funciona igual que Biomédicos pero muestra equipos de tipo industrial (planta física, redes, etc.).

---

## 5. Módulo Órdenes de Trabajo (Tickets)

### 5.1 Mis Tickets
**Ruta:** `ORDENES → MIS TICKETS` (`/ordenes/mis-tickets`)

- Muestra los tickets creados por el usuario que inició sesión
- Vista en tarjetas o tabla
- Permite ver el detalle y descargar PDF de cada ticket

### 5.2 Gestión de Tickets
**Ruta:** `ORDENES → GESTION DE TICKETS` (`/ordenes/gestion-tickets`)

> Requiere permiso de gestión. Solo para técnicos y administradores.

- Muestra **todos** los tickets del sistema
- Filtros por: estado, sede, tipo de equipo, reportante
- Acciones disponibles:
  - **Ver detalle:** información completa del ticket
  - **Editar:** modificar datos del ticket
  - **Cerrar:** finalizar el ticket con diagnóstico y solución
  - **Eliminar:** eliminar ticket (con confirmación)

#### Crear Ticket (desde Gestión de Tickets)
1. Clic en **"Nuevo Ticket"**
2. Seleccionar el equipo afectado (búsqueda por nombre o código)
3. Describir el problema (soporta formato: **negrilla**, *cursiva*)
4. Seleccionar tipo de mantenimiento y prioridad
5. Clic en **"Crear"**

### 5.3 Tickets Cerrados
**Ruta:** `ORDENES → TICKETS CERRADOS` (`/ordenes/tickets-cerrados`)

- Historial de todas las órdenes de trabajo finalizadas
- Permite consultar, filtrar y descargar reportes de actividades pasadas

---

## 6. Módulo Planes de Mantenimiento

**Ruta:** `PLANES → MTTO. PREVENTIVO` (`/planes/preventivo`)

### 6.1 Vista del Plan Anual
- Muestra el cronograma del año vigente
- Por cada equipo: frecuencia de mantenimiento y meses programados
- Indicador de cumplimiento mes a mes

### 6.2 Agregar Equipo al Plan
1. Clic en **"Agregar al plan"**
2. Buscar y seleccionar el equipo
3. Definir frecuencia (mensual, trimestral, semestral, anual)
4. Seleccionar los meses programados
5. Asignar técnico responsable

### 6.3 Registrar Mantenimiento Ejecutado
1. Ubicar el equipo en el cronograma
2. Clic en el mes correspondiente
3. Registrar: fecha, técnico, actividades realizadas, observaciones
4. El sistema marcará el mes como ejecutado ✅

### 6.4 Exportar Cronograma
- **Excel:** exporta el plan completo con todos los meses
- **Plantilla:** descarga plantilla para importación masiva

---

## 7. Módulo Repuestos

**Ruta:** `REPUESTOS → REPUESTOS` (`/repuestos`)

- Inventario de partes y repuestos disponibles
- Permite agregar, editar y consultar repuestos
- Asociar repuestos a equipos específicos

---

## 8. Módulo Capacitaciones

**Ruta:** `CAPACITACIONES → CAPACITACIONES` (`/capacitaciones`)

- Registro de capacitaciones realizadas al personal
- Asociar capacitación a equipos biomédicos o industriales
- Registrar asistentes y fecha de realización

---

## 9. Dashboard y Estadísticas

**Ruta:** `DASHBOARD → DASHBOARD` (`/dashboard/reportes`)  
> Solo visible para Administradores (rol 1 y 2)

El dashboard tiene 4 pestañas:

### Pestaña Resumen
- **KPIs globales:** total de equipos, equipos activos, en mantenimiento
- **Tarjetas de estadística:** correctivos abiertos, preventivos cumplidos, calibraciones pendientes
- **Exportaciones rápidas:** botones para descargar reportes Excel de correctivos, tickets, preventivos y calibraciones

### Pestaña Correctivos
- **Gráfico de torta:** distribución de tickets por estado (abierto, cerrado, en proceso)
- **Gráfico de torta:** distribución por tipo de equipo (biomédico, industrial, infraestructura)

### Pestaña Preventivos
- Indicador de cumplimiento del plan anual (barra de progreso)
- Detalle por mes

### Pestaña Equipos
- Resumen del inventario por categoría
- Métricas de equipos activos vs inactivos

---

## 10. Módulo Configuración

**Ruta:** `CONFIGURACIÓN → ...` (solo rol 1, 2 y 3)

| Sub-módulo | Ruta | Descripción |
|---|---|---|
| Servicios | `/config/servicios` | Gestionar servicios/dependencias del hospital |
| Contactos | `/config/contactos` | Directorio de contactos de equipos y proveedores |
| Áreas | `/config/areas` | Áreas dentro de cada servicio |
| Tipos de Mantenimiento | `/config/tipos-mantenimiento` | Catálogo de tipos de mantenimiento |
| Materiales | `/config/materiales` | Materiales e insumos de mantenimiento |
| Sedes | `/config/sedes` | Sedes y locaciones del hospital |
| Empresas de Mtto. | `/config/empresas-mantenimiento` | Empresas externas de mantenimiento |

### Operaciones Comunes en Configuración
Cada sub-módulo de configuración permite:
1. **Listar** los registros existentes
2. **Agregar** nuevo registro con el botón "+" o "Agregar"
3. **Editar** con el ícono ✏️
4. **Eliminar** con el ícono 🗑 (pide confirmación)

---

## 11. Módulo Administrador

**Ruta:** `ADMINISTRADOR → ...` (solo rol 1 y 2)

### Usuarios
**Ruta:** `/admin/usuarios`
- Ver todos los usuarios registrados
- Activar/desactivar cuentas
- Asignar roles
- Configurar permisos granulares por módulo (leer/insertar/editar/eliminar)

### Propietarios
**Ruta:** `/admin/propietarios`
- Gestionar las instituciones propietarias de los equipos
- Cada propietario puede tener logo y datos de contacto

---

## 12. Perfil de Usuario

**Ruta:** Usuario (esquina superior derecha) → **Perfil**

Permite:
- Ver datos del usuario: nombre, correo, rol asignado
- Cambiar contraseña
- Ver empresa/dependencia asignada

---

## 13. Búsqueda Global

La barra de búsqueda en la parte superior central permite buscar equipos por:
- Nombre del equipo
- Código interno
- Número de serie
- Marca / Modelo

Al seleccionar un resultado, abre directamente el detalle del equipo.

---

## Guía de Referencia Rápida

| Tarea | Ruta |
|---|---|
| Ver todos los equipos biomédicos | EQUIPOS → BIOMEDICOS |
| Crear orden de trabajo | EQUIPOS → equipo → botón "Correctivo" |
| Ver mis tickets | ORDENES → MIS TICKETS |
| Gestionar todos los tickets | ORDENES → GESTION DE TICKETS |
| Ver cronograma preventivo | PLANES → MTTO. PREVENTIVO |
| Exportar reporte Excel | DASHBOARD → Resumen → botón de exportación |
| Agregar usuario | ADMINISTRADOR → USUARIOS |
| Agregar servicio nuevo | CONFIGURACIÓN → SERVICIOS |
| Cambiar contraseña | Usuario → PERFIL |
