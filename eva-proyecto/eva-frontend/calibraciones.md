# Modal de Calibraciones - Reporte Técnico Detallado

## Descripción General

El modal de calibraciones es un componente integral del sistema de gestión de equipos que permite visualizar, gestionar y exportar información relacionada con las calibraciones de equipos médicos/industriales. Este modal proporciona una interfaz centralizada para el manejo completo del ciclo de vida de las calibraciones.

## Estructura del Modal

### Modal Principal (`modal_calibraciones`)
- **Identificador**: `#modal_calibraciones`
- **Tipo**: Modal Bootstrap con ancho del 90% de la pantalla
- **Función**: Contenedor principal que muestra la vista consolidada de todas las calibraciones

### Componentes del Modal

#### 1. **Encabezado del Modal**
- Botón de cierre (X)
- Título dinámico con estilo personalizado (fondo gris, texto blanco, fuente Calibri, tamaño 30px)

#### 2. **Cuerpo del Modal**
- Contenedor principal con clase `impresion` para funcionalidad de impresión
- Carga contenido dinámico mediante AJAX

#### 3. **Pie del Modal**
- Botón "Cerrar" con estilo de peligro (rojo)

## Funcionalidades Principales

### 1. **Visualización de Calibraciones**
- **Tabla de datos**: Muestra información consolidada de calibraciones
- **Columnas principales**:
  - Código de calibración
  - Fecha de ejecución
  - Nombre del equipo
  - Marca
  - Modelo
  - Número de serie
  - Código del equipo
  - Ubicación (servicio)
  - Archivo adjunto

### 2. **Exportación de Datos**
- **Exportar Consolidado**: Botón que genera archivo Excel (.xls)
- **Formato de exportación**: CalibracionesEB.xls
- **Contenido del archivo**:
  - Código calibración
  - Fecha de ejecución
  - Marca
  - Código
  - Serie
  - Nombre equipo
  - ID equipo
  - Archivo
  - Ubicación

### 3. **Gestión de Archivos**
- **Visualización**: Enlaces a archivos PDF/documentos de calibración
- **Ubicación**: Carpeta `assets/upload_calibraciones/`
- **Acceso**: Apertura en nueva ventana/pestaña

### 4. **Filtrado y Ordenamiento**
- **DataTable**: Implementación de tabla interactiva
- **Ordenamiento**: Por fecha de calibración (ascendente por defecto)
- **Filtros**: Por tipo de equipo según usuario logueado

## Modales Auxiliares

### 1. **Modal de Agregar Calibración** (`modal_add_calibracion`)
- **Campos del formulario**:
  - Código de calibración (texto requerido)
  - Fecha de ejecución (date, limitada hasta mañana)
  - Fecha programada (date, calculada automáticamente)
  - Archivo asociado (upload de archivos)
- **Validaciones**: Fechas mínimas desde 2015, máxima hasta día siguiente

### 2. **Modal de Editar Calibración** (`modal_update_calibracion`)
- **Funcionalidad**: Modificación de calibraciones existentes
- **Campos**: Idénticos al modal de agregar
- **Carga de datos**: Automática mediante AJAX al abrir

## Tablas de Base de Datos Relacionadas

### Tabla Principal: `calibracion`
- **Columnas principales**:
  - `id` (Primary Key)
  - `equipo_id` (Foreign Key)
  - `description` (Código de calibración)
  - `fecha_calibracion` (Fecha de ejecución)
  - `fecha_programada` (Fecha programada)
  - `file` (Nombre del archivo)

### Tabla Secundaria: `calibracion_ind`
- **Uso**: Calibraciones para equipos industriales
- **Estructura**: Similar a tabla principal

### Tablas Relacionadas:
- **`equipos`**: Información del equipo
  - `id`, `name`, `marca`, `modelo`, `serial`, `code`, `servicio_id`, `status`, `tipo_id`
- **`servicios`**: Ubicaciones/servicios
  - `id`, `name`
- **`cambios_hdv`**: Historial de cambios
  - Para auditoría de modificaciones

## Flujo de Trabajo General

### 1. **Agregar Nueva Calibración**
- Usuario completa formulario con código, fechas y archivo
- Sistema valida información y guarda archivo
- Se registra automáticamente en historial de cambios
- Actualización de vistas en tiempo real

### 2. **Consultar Calibraciones**
- Visualización de tabla consolidada con todas las calibraciones
- Filtrado automático por tipo de usuario
- Ordenamiento por fecha de calibración
- Acceso directo a archivos adjuntos

### 3. **Editar Calibración Existente**
- Carga automática de datos en formulario
- Posibilidad de cambiar archivo adjunto
- Manejo inteligente de archivos (elimina anterior si se cambia)
- Registro de modificación en historial

### 4. **Eliminar Calibración**
- Confirmación obligatoria del usuario
- Eliminación completa del registro y archivo asociado
- Registro de eliminación en historial de cambios

## Características del Sistema

### **Gestión de Archivos**
- Upload automático con nombres encriptados
- Almacenamiento en carpeta dedicada
- Enlaces directos para descarga
- Eliminación automática al borrar registros

### **Auditoría y Trazabilidad**
- Registro automático de todas las operaciones
- Historial completo de cambios por equipo
- Identificación del usuario que realiza cada acción

### **Exportación de Datos**
- Generación de reportes consolidados en Excel
- Incluye toda la información relevante del equipo y calibración
- Formato estándar para análisis externos

### **Interfaz de Usuario**
- Modal responsive que se adapta al tamaño de pantalla
- Tablas interactivas con búsqueda y paginación
- Feedback visual durante procesamiento
- Confirmaciones para operaciones críticas

## Flujo de Trabajo Típico

1. **Acceso**: Usuario abre modal desde página de equipos
2. **Visualización**: Sistema carga tabla con calibraciones existentes
3. **Gestión**: Usuario puede agregar, editar o eliminar registros
4. **Exportación**: Generación de reportes en Excel
5. **Archivos**: Descarga de documentos asociados
6. **Auditoría**: Registro automático de todas las operaciones

Este modal representa una solución completa para la gestión de calibraciones, integrando funcionalidades de visualización, edición, exportación y auditoría en una interfaz cohesiva y eficiente.
