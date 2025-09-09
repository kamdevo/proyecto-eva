# Página de Mantenimiento Preventivo - Reporte Detallado

## Descripción General
La página de Mantenimiento Preventivo es un módulo integral del sistema EVA-ORG que permite gestionar cronogramas de mantenimiento, programar actividades preventivas y controlar la ejecución de mantenimientos para equipos biomédicos. Esta página centraliza la planificación anual de mantenimientos y proporciona herramientas para el seguimiento y control de cumplimiento.

## Origen de los Datos

### Tablas Principales de Base de Datos

#### Tablas de Planificación
- **`planes_mantenimientos`**: Información principal de los planes de mantenimiento
  - Columnas: `id`, `equipo_id`, `anio`, `mes1`, `mes2`, `mes3`, `responsable`, `frecuencia`, `created_at`, `updated_at`

#### Tablas de Ejecución de Mantenimientos
- **`mantenimiento`**: Registros de mantenimientos ejecutados
  - Columnas: `id`, `equipo_id`, `description`, `fecha_mantenimiento`, `fecha_programada`, `file`, `observacion`, `proveedor_mantenimiento_id`, `repuesto_pendiente`, `repuesto_id`

#### Tablas de Control de Cambios
- **`cambios_cronograma`**: Registro de modificaciones al cronograma
  - Columnas: `id`, `planes_mantenimientos_id`, `cambio`, `usuario_id`, `created_at`

#### Tablas de Notas y Seguimiento
- **`preventivos_notas`**: Notas adicionales en mantenimientos preventivos
  - Columnas: `id`, `preventivo_id`, `description`, `usuario_id`, `fecha_nota`

#### Tablas Relacionadas
- **`equipos`**: Información de equipos biomédicos
  - Columnas: `id`, `name`, `marca`, `modelo`, `serial`, `code`, `servicio_id`, `estadoequipo_id`
- **`servicios`**: Ubicaciones de equipos
  - Columnas: `id`, `name`, `sede_id`
- **`sedes`**: Sedes hospitalarias
  - Columnas: `id`, `name`
- **`areas`**: Áreas específicas dentro de servicios
  - Columnas: `id`, `name`, `servicio_id`
- **`usuarios`**: Usuarios del sistema
  - Columnas: `id`, `nombre`, `apellido`, `username`
- **`proveedor_mantenimiento`**: Proveedores de mantenimiento
  - Columnas: `id`, `name`, `estado`
- **`repuestos`**: Catálogo de repuestos
  - Columnas: `id`, `name`, `descripcion`

## Estructura de la Página

### Encabezado Principal
- **Título**: "Schedule"
- **Subtítulo**: "List"
- **Contexto**: Módulo de gestión de cronogramas preventivos

## Secciones Principales

### 1. Sección de Carga de Cronogramas

#### Título del Panel
- **Encabezado**: "Ingresar Plan de mantenimiento preventivo"
- **Propósito**: Carga masiva de cronogramas anuales

#### Formulario de Carga
**Campos del formulario:**
- **Año del Cronograma**: Selector de año (2019-2023+)
- **Reemplazar Información**: Opción para sobrescribir datos existentes
- **Archivo**: Selector de archivo Excel para carga masiva
- **Botón de Envío**: "Send" para procesar el archivo

#### Opciones de Reemplazo
- **Sí**: Reemplaza registros existentes del año seleccionado
- **No**: Conserva registros existentes y agrega solo nuevos

### 2. Sección de Instrucciones

#### Título y Contexto
- **Icono**: Símbolo de pregunta grande
- **Propósito**: Guía para formato correcto de archivos

#### Tabla de Ejemplo
**Estructura requerida del archivo Excel:**
| Campo | Descripción | Ejemplo |
|-------|-------------|---------|
| **Id equipo** | Identificador único del equipo | 200, 320 |
| **Mes1** | Primer mes programado | 1, 2 |
| **Mes2** | Segundo mes programado | 7, 8 |
| **Mes3** | Tercer mes programado | (opcional) |
| **Responsable** | Proveedor de mantenimiento | SYSMED |
| **Frecuencia de mantenimiento** | Periodicidad | ANUAL, SEMESTRAL |

#### Observaciones Importantes
**Instrucciones detalladas:**
1. **Reemplazo de Información**: 
   - "Sí" actualiza registros existentes y agrega nuevos
   - "No" conserva existentes y solo agrega nuevos
2. **Campos de Meses**: 
   - Valores numéricos correspondientes al mes
   - Orden ascendente lógico
3. **ID de Equipo**: 
   - Identificador inequívoco en la base de datos
   - Debe corresponder al sistema
4. **Responsable**: 
   - Nombre exacto del proveedor
   - Evitar variaciones para mantener consistencia
5. **Formato de Archivo**: 
   - Subir sin títulos de columna
   - Solo datos puros en formato Excel

### 3. Sección de Consulta y Gestión

#### Controles de Año
- **Selector de Año**: Dropdown para filtrar cronogramas
- **Año por Defecto**: 2022 (preseleccionado)

#### Botones de Exportación
**Funcionalidades disponibles:**
- **Exportar Consolidado**: Genera reporte completo del cronograma
- **Exportar Plantilla**: Descarga formato Excel para carga

#### Tabla Principal de Planes
**Columnas de información:**
| Columna | Contenido | Propósito |
|---------|-----------|-----------|
| **Botón Expandir** | Control de detalle | Acceso a información adicional |
| **Id equipo** | Identificador del equipo | Referencia única |
| **Equipo** | Nombre del equipo | Identificación |
| **Código** | Código interno | Referencia alterna |
| **Serie** | Número de serie | Identificación física |
| **Marca** | Fabricante | Información técnica |
| **Modelo** | Modelo específico | Identificación técnica |
| **Responsable** | Proveedor asignado | Responsabilidad |
| **Rango programado 1** | Primer período | Programación |
| **Rango programado 2** | Segundo período | Programación |
| **Rango programado 3** | Tercer período | Programación |
| **Cantidad ejecutados** | Mantenimientos realizados | Seguimiento |
| **Cantidad programados** | Mantenimientos planeados | Control |
| **Cumplimiento global** | Porcentaje de cumplimiento | Indicador |
| **Acciones** | Botones de gestión | Operaciones |

## Modales del Sistema

### 1. Modal de Registro de Mantenimiento Preventivo

#### Información del Modal
- **Título**: "Agregar"
- **Subtítulo**: "Preventivo"
- **Propósito**: Registrar mantenimiento ejecutado

#### Campos del Formulario
**Sección de Identificación:**
- **Código Preventivo**: Identificador del mantenimiento
- **Proveedor Mantenimiento**: Selector de empresa responsable

**Sección de Observaciones:**
- **Observaciones**: Área de texto para detalles adicionales
- **Placeholder**: Ajustes, equipo fuera de servicio, etc.

**Sección de Programación:**
- **Primer Mes**: Muestra mes programado 1
- **Segundo Mes**: Muestra mes programado 2
- **Tercer Mes**: Muestra mes programado 3

**Sección de Ejecución:**
- **Fecha Ejecución**: Selector de fecha de realización
- **Restricción**: Desde 2010 hasta fecha actual

**Sección de Documentación:**
- **Archivo Asociado**: Subida de documento de respaldo
- **Repuesto Pendiente**: Campo para repuestos requeridos

#### Validaciones
- Código preventivo obligatorio
- Proveedor mantenimiento requerido
- Fecha de ejecución obligatoria
- Rango de fechas controlado

### 2. Modal de Edición de Mantenimiento Preventivo

#### Información del Modal
- **Título**: "Editar"
- **Subtítulo**: "Preventivo"
- **Propósito**: Modificar mantenimiento registrado

#### Campos Adicionales de Edición
**Funcionalidades extendidas:**
- **Sistema de Notas**: Agregar notas adicionales al mantenimiento
- **Ícono de Notas**: Acceso al modal de notas
- **Checkbox Repuesto Pendiente**: Control de estado de repuestos
- **Tabla de Notas**: Visualización de notas existentes

#### Estructura de Notas
**Información mostrada:**
- **Nota**: Contenido de la observación
- **Quien Registra**: Usuario y alias
- **Fecha**: Momento del registro

#### Rango de Fechas Extendido
- **Fecha Mínima**: 2010-01-01
- **Fecha Máxima**: Un mes adicional desde fecha actual

### 3. Modal de Agregar Nota

#### Propósito
- **Función**: Agregar observaciones específicas a mantenimientos
- **Contexto**: Notas detalladas sobre procedimientos específicos

#### Campos del Modal
- **Descripción de Nota**: Área de texto para observación
- **Usuario**: Automáticamente asignado al usuario actual
- **Fecha**: Timestamp automático

### 4. Modal de Cambios de Cronograma

#### Información del Modal
- **Título**: "Control de Cambios"
- **Propósito**: Auditoría de modificaciones al cronograma

#### Tabla de Control de Cambios
**Columnas mostradas:**
- **Fecha de Cambio**: Momento de la modificación
- **Usuario**: Quien realizó el cambio
- **Descripción del Cambio**: Detalle de la modificación
- **Equipo Afectado**: Equipo relacionado con el cambio

## Funcionalidades Principales

### Gestión de Cronogramas
- **Carga Masiva**: Importación de cronogramas desde Excel
- **Validación**: Verificación de datos importados
- **Reemplazo Controlado**: Opciones de actualización o adición
- **Exportación**: Generación de reportes consolidados

### Registro de Mantenimientos
- **Creación**: Registro de mantenimientos ejecutados
- **Edición**: Modificación de registros existentes
- **Documentación**: Adjunto de archivos de respaldo
- **Observaciones**: Notas detalladas sobre procedimientos

### Sistema de Notas
- **Notas Específicas**: Observaciones detalladas por mantenimiento
- **Trazabilidad**: Usuario y fecha de cada nota
- **Historial**: Conservación de todas las notas agregadas

### Control de Repuestos
- **Identificación**: Registro de repuestos pendientes
- **Seguimiento**: Estado de repuestos requeridos
- **Integración**: Vinculación con módulo de repuestos

### Auditoría y Control
- **Control de Cambios**: Registro de modificaciones al cronograma
- **Trazabilidad**: Usuario y fecha de cada cambio
- **Histórico**: Conservación de historial completo

## Flujos Operativos Principales

### 1. Flujo de Carga de Cronograma

#### Secuencia de Operaciones
```
Inicio → Selección de Año → Opción de Reemplazo → 
Selección de Archivo → Validación → Procesamiento → 
Confirmación → Actualización de Tabla → Fin
```

#### Pasos Detallados
1. **Preparación**: Usuario prepara archivo Excel con formato correcto
2. **Acceso**: Ingreso a página de mantenimiento preventivo
3. **Configuración**: Selección de año y opción de reemplazo
4. **Carga**: Selección y subida del archivo Excel
5. **Procesamiento**: Sistema valida y procesa datos
6. **Importación**: Registro de planes en base de datos
7. **Confirmación**: Notificación de resultado de importación
8. **Visualización**: Actualización de tabla con nuevos datos

### 2. Flujo de Registro de Mantenimiento

#### Secuencia de Operaciones
```
Inicio → Selección de Equipo → Apertura de Modal → 
Completar Datos → Subir Archivo → Validación → 
Registro → Actualización de Estados → Fin
```

#### Pasos Detallados
1. **Identificación**: Localización del equipo en la tabla
2. **Activación**: Apertura del modal de registro
3. **Datos Básicos**: Ingreso de código y proveedor
4. **Observaciones**: Adición de notas pertinentes
5. **Programación**: Verificación de meses programados
6. **Ejecución**: Registro de fecha de realización
7. **Documentación**: Subida de archivo de respaldo
8. **Repuestos**: Identificación de repuestos pendientes
9. **Confirmación**: Validación y registro en sistema
10. **Actualización**: Refresh de indicadores y contadores

### 3. Flujo de Seguimiento y Control

#### Secuencia de Consulta
```
Inicio → Filtro por Año → Visualización de Tabla → 
Análisis de Cumplimiento → Identificación de Pendientes → 
Acciones Correctivas → Fin
```

#### Pasos de Seguimiento
1. **Filtrado**: Selección del año de interés
2. **Visualización**: Análisis de tabla de cumplimiento
3. **Identificación**: Localización de equipos pendientes
4. **Análisis**: Revisión de porcentajes de cumplimiento
5. **Planificación**: Programación de mantenimientos faltantes
6. **Ejecución**: Registro de mantenimientos realizados
7. **Control**: Monitoreo continuo de avances

## Instrucciones para Subir Cronograma

### Preparación del Archivo Excel

#### Estructura Requerida
**Formato de columnas (sin encabezados):**
1. **Columna A**: ID del equipo (numérico)
2. **Columna B**: Mes 1 (número 1-12)
3. **Columna C**: Mes 2 (número 1-12, opcional)
4. **Columna D**: Mes 3 (número 1-12, opcional)
5. **Columna E**: Responsable (texto)
6. **Columna F**: Frecuencia (ANUAL, SEMESTRAL, etc.)

#### Ejemplo de Datos
```
200    1    7        SYSMED    SEMESTRAL
320    2    8        SYSMED    SEMESTRAL
450    3    9    12  BIOMEDI   CUATRIMESTRAL
```

#### Validaciones de Datos
**Requisitos obligatorios:**
- ID de equipo debe existir en el sistema
- Meses deben ser valores entre 1 y 12
- Meses deben estar en orden ascendente
- Responsable debe ser texto válido
- Frecuencia debe ser valor reconocido

### Proceso de Carga

#### Pasos Específicos
1. **Preparar Archivo**:
   - Crear Excel con una sola hoja
   - Ingresar datos sin títulos de columna
   - Verificar formato correcto

2. **Configurar Carga**:
   - Seleccionar año del cronograma
   - Elegir opción de reemplazo
   - Seleccionar archivo preparado

3. **Ejecutar Importación**:
   - Hacer clic en botón "Send"
   - Esperar procesamiento del sistema
   - Verificar mensajes de confirmación

4. **Validar Resultados**:
   - Revisar tabla actualizada
   - Verificar datos importados
   - Confirmar cantidades correctas

#### Consideraciones Importantes
**Mejores Prácticas:**
- Verificar IDs de equipos antes de carga
- Mantener nomenclatura consistente de responsables
- Respaldar datos existentes antes de reemplazo
- Probar con archivo pequeño primero
- Verificar permisos de escritura en sistema

## Indicadores y Métricas

### Métricas de Planificación
- **Equipos Programados**: Total de equipos en cronograma
- **Cobertura por Año**: Porcentaje de equipos con plan
- **Distribución Mensual**: Carga de trabajo por mes
- **Responsables Asignados**: Distribución por proveedor

### Métricas de Cumplimiento
- **Cumplimiento Global**: Porcentaje general de ejecución
- **Cumplimiento por Equipo**: Indicador individual
- **Mantenimientos Ejecutados**: Cantidad realizada
- **Mantenimientos Pendientes**: Cantidad faltante

### Métricas de Control
- **Cambios de Cronograma**: Frecuencia de modificaciones
- **Notas por Mantenimiento**: Detalle de documentación
- **Repuestos Pendientes**: Control de materiales
- **Archivos Adjuntos**: Documentación de respaldo

## Beneficios del Sistema

### Planificación Mejorada
- **Cronograma Anual**: Visión completa del año
- **Carga Masiva**: Eficiencia en programación
- **Distribución Equitativa**: Balance de carga mensual
- **Flexibilidad**: Ajustes según necesidades

### Control de Cumplimiento
- **Seguimiento en Tiempo Real**: Monitoreo continuo
- **Indicadores Visuales**: Porcentajes de cumplimiento
- **Identificación de Rezagos**: Detección temprana
- **Planificación Correctiva**: Acciones de recuperación

### Gestión Documental
- **Archivos de Respaldo**: Documentación completa
- **Notas Detalladas**: Observaciones específicas
- **Trazabilidad**: Historial completo de cambios
- **Auditoría**: Control de modificaciones

### Integración Operativa
- **Vinculación con Equipos**: Conexión directa
- **Control de Repuestos**: Gestión integrada
- **Proveedores**: Asignación clara de responsabilidades
- **Reportes**: Información para toma de decisiones

## Conclusión

La página de Mantenimiento Preventivo constituye una herramienta fundamental para la gestión de cronogramas anuales de mantenimiento, proporcionando capacidades completas de planificación, ejecución y control. Su diseño permite una gestión eficiente de recursos, asegurando el cumplimiento de programas preventivos y manteniendo la disponibilidad operativa de equipos biomédicos críticos para la institución hospitalaria.

El sistema integra funcionalidades de carga masiva, seguimiento detallado y control de cumplimiento, facilitando la gestión proactiva del mantenimiento preventivo y contribuyendo significativamente a la continuidad operativa de los servicios de salud.
