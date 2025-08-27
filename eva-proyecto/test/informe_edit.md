# Informe Técnico: Modal de Edición de Equipos Biomédicos

## Sistema de Gestión de Equipos Médicos

### Hospital Universitario del Valle "Evaristo García"

---

## 1. PROPÓSITO DEL MODAL

### 1.1 Función Principal

El modal de edición de equipos biomédicos es una interfaz especializada diseñada para permitir la **modificación controlada de la información** de equipos médicos ya registrados en el sistema hospitalario. Su propósito principal es mantener actualizada la base de datos de activos médicos del hospital, asegurando que toda la información técnica, administrativa y operativa de los equipos esté siempre vigente y sea precisa.

### 1.2 Importancia en el Sistema Hospitalario

Esta funcionalidad es crítica para:

- **Gestión de inventarios médicos**: Mantener un registro actualizado de todos los equipos biomédicos
- **Cumplimiento regulatorio**: Asegurar que la información cumple con normativas sanitarias
- **Mantenimiento preventivo**: Facilitar la programación y seguimiento de mantenimientos
- **Control de costos**: Monitorear valores, depreciación y vida útil de los equipos
- **Trazabilidad completa**: Mantener un historial detallado de cambios y actualizaciones
- **Seguridad del paciente**: Garantizar que la información técnica y de clasificación de riesgo esté actualizada

### 1.3 Usuarios Objetivo

El modal está diseñado para ser utilizado por:

- Personal de ingeniería biomédica
- Administradores de inventarios médicos
- Supervisores de servicios clínicos
- Personal técnico especializado
- Auditores internos y externos

---

## 2. CAMPOS EDITABLES

### 2.1 Identificación del Equipo

#### Información Básica

- **Nombre del equipo**: Denominación comercial o técnica del dispositivo médico
- **Descripción adicional**: Información complementaria que ayude a identificar el equipo
- **Número de serie**: Identificador único asignado por el fabricante
- **Marca**: Fabricante del equipo médico
- **Modelo**: Especificación exacta del modelo según el fabricante

#### Códigos de Inventario

- **Código de inventario antiguo**: Referencia del sistema previo del hospital
- **Código de inventario nuevo**: Código actual del sistema de inventarios
- **Código del sistema**: Identificador interno del sistema EVA

### 2.2 Especificaciones Temporales

- **Año de fabricación**: Año en que fue manufacturado el equipo
- **Año de instalación**: Año en que el equipo fue puesto en servicio en el hospital
- **Vida útil estimada**: Tiempo esperado de funcionamiento óptimo en años

### 2.3 Ubicación y Movilidad

#### Localización Física

- **Servicio médico**: Departamento o área clínica donde está asignado el equipo
- **Área específica**: Ubicación detallada dentro del servicio (sala, consultorio, etc.)
- **Piso**: Nivel del edificio donde se encuentra ubicado

#### Características de Movilidad

- **Tipo de equipo**: Clasificación como "FIJO" o "MÓVIL" según su capacidad de traslado

### 2.4 Información Económica

#### Datos Financieros

- **Valor de adquisición**: Costo original de compra del equipo
- **Valor actual**: Valor depreciado o de mercado en el momento actual
- **Forma de adquisición**: Método de obtención (compra directa, donación, comodato, leasing, etc.)

#### Información Geográfica

- **País de origen**: Nación donde fue fabricado el equipo

### 2.5 Clasificaciones Especializadas (Solo Equipos Biomédicos)

#### Clasificaciones Regulatorias

- **Clasificación biomédica**: Categorización según normativas sanitarias nacionales e internacionales
- **Clasificación de riesgo**: Nivel de riesgo asociado al uso del equipo (Clase I, II, III, etc.)

### 2.6 Documentación Digital

#### Archivos Asociados

- **Archivo Excel de hoja de vida**: Documento complementario con información técnica detallada
- **Imagen del equipo**: Fotografía representativa para identificación visual

### 2.7 Información de Contactos

#### Proveedores y Fabricantes

- **Datos de fabricantes**: Información de contacto del fabricante original
- **Datos de proveedores**: Información del proveedor local o distribuidor
- **Datos de distribuidores**: Información de distribuidores autorizados

Para cada contacto se puede editar:

- Nombre de la empresa o contacto
- Dirección de correo electrónico
- Número telefónico
- Tipo de relación comercial

### 2.8 Especificaciones Técnicas

#### Parámetros Técnicos Variables

- **Especificaciones dinámicas**: Campos que varían según el tipo de equipo (voltaje, potencia, frecuencia, capacidad, etc.)
- **Características operativas**: Parámetros específicos de funcionamiento
- **Requisitos ambientales**: Condiciones necesarias para el funcionamiento óptimo

### 2.9 Repuestos y Accesorios

#### Gestión de Componentes

- **Nombre del repuesto o accesorio**: Identificación específica del componente
- **Observaciones**: Notas adicionales sobre el repuesto o su instalación
- **Fecha de instalación**: Cuándo se instaló o reemplazó el componente
- **Cantidad**: Número de unidades del repuesto instaladas o disponibles
- **Documentación asociada**: Archivos relacionados con el repuesto

---

## 3. CAMPOS NO EDITABLES

### 3.1 Identificadores del Sistema

#### Claves Primarias

- **ID único del equipo**: Identificador interno inmutable del sistema de base de datos
- **Timestamp de creación**: Fecha y hora exacta de cuando se registró inicialmente el equipo
- **ID del usuario creador**: Referencia al usuario que realizó el registro original

#### Tokens de Seguridad

- **Token CSRF**: Código de seguridad para prevenir ataques de falsificación de solicitudes
- **Códigos de sesión**: Identificadores temporales de la sesión del usuario

### 3.2 Metadatos Automáticos

#### Información de Auditoría

- **Fecha de última modificación**: Se actualiza automáticamente cada vez que se guarda el formulario
- **Usuario que realizó la última modificación**: Referencia automática al usuario actual
- **Número de versión**: Contador automático de modificaciones realizadas
- **Log de cambios**: Historial automático de todas las modificaciones

#### Datos Calculados

- **Antigüedad del equipo**: Se calcula automáticamente desde el año de fabricación
- **Tiempo en servicio**: Se determina automáticamente desde el año de instalación
- **Porcentaje de vida útil consumida**: Cálculo automático basado en la vida útil estimada
- **Estado de depreciación**: Valor calculado según políticas contables del hospital

### 3.3 Referencias Cruzadas

#### Contadores Automáticos

- **Número total de mantenimientos**: Contador de intervenciones registradas en el sistema
- **Número de calibraciones**: Contador de calibraciones realizadas
- **Número de reparaciones**: Contador de reparaciones ejecutadas
- **Número de observaciones**: Contador de notas y observaciones registradas

#### Relaciones con Otros Módulos

- **Estado operativo actual**: Se determina automáticamente según el historial de mantenimientos
- **Próxima fecha de mantenimiento**: Se calcula según la programación establecida
- **Estado de calibración**: Se determina según el historial de calibraciones
- **Alertas activas**: Notificaciones automáticas generadas por el sistema

### 3.4 Información Contextual

#### Datos Derivados de la Ubicación

- **Centro de costo**: Se asigna automáticamente según el servicio seleccionado
- **Código del centro**: Identificador numérico que se genera según la ubicación
- **Responsable del área**: Se determina automáticamente según el servicio asignado

#### Información Regulatoria Automática

- **Fecha de vencimiento de certificaciones**: Se calcula según las clasificaciones asignadas
- **Requisitos regulatorios aplicables**: Se determinan según el tipo y clasificación del equipo
- **Estado de cumplimiento**: Se evalúa automáticamente según las normativas vigentes

---

## 4. CONTEXTO DEL SISTEMA

### 4.1 Integración Hospitalaria

El modal de edición forma parte integral del **Sistema de Gestión de Equipos Médicos del Hospital Universitario del Valle "Evaristo García"**, una institución de alta complejidad que requiere un control riguroso de sus activos médicos para garantizar:

- **Continuidad del servicio médico**: Asegurar que todos los equipos estén operativos y bien mantenidos
- **Seguridad del paciente**: Mantener información actualizada sobre equipos críticos para la atención
- **Eficiencia operativa**: Optimizar el uso y distribución de equipos en diferentes servicios
- **Cumplimiento normativo**: Satisfacer los requisitos de entidades regulatorias como el INVIMA

### 4.2 Importancia Estratégica

#### Para la Gestión Hospitalaria

- **Control de inventarios**: Mantener un registro preciso de todos los activos médicos
- **Planificación financiera**: Facilitar decisiones sobre renovación y adquisición de equipos
- **Gestión de riesgos**: Identificar equipos críticos y sus estados operativos
- **Optimización de recursos**: Mejorar la distribución y utilización de equipos

#### Para el Cumplimiento Regulatorio

- **Trazabilidad completa**: Mantener un historial detallado requerido por auditorías
- **Documentación actualizada**: Asegurar que toda la información esté vigente
- **Clasificaciones correctas**: Mantener las categorizaciones según normativas sanitarias
- **Reportes regulatorios**: Facilitar la generación de informes para entidades de control

### 4.3 Impacto en la Operación

#### Beneficios Operativos

- **Reducción de tiempos de búsqueda**: Localización rápida de equipos y su información
- **Mejora en la programación**: Facilitar la planificación de mantenimientos y calibraciones
- **Optimización de costos**: Mejor control sobre gastos de mantenimiento y reposición
- **Calidad en la atención**: Asegurar que los equipos estén en condiciones óptimas

#### Beneficios Administrativos

- **Automatización de procesos**: Reducir tareas manuales de actualización de información
- **Mejora en reportes**: Generar informes más precisos y actualizados
- **Control de cambios**: Mantener un registro detallado de todas las modificaciones
- **Integración de datos**: Conectar información de equipos con otros sistemas hospitalarios

---

## 5. FLUJO DE TRABAJO

### 5.1 Proceso de Edición

#### Acceso al Modal

1. **Identificación del equipo**: El usuario localiza el equipo que necesita modificar
2. **Apertura del modal**: Se carga automáticamente toda la información actual del equipo
3. **Verificación de permisos**: El sistema valida que el usuario tenga autorización para editar

#### Modificación de Datos

1. **Edición de campos**: El usuario modifica únicamente los campos necesarios
2. **Validación en tiempo real**: El sistema verifica la consistencia de los datos ingresados
3. **Verificación de unicidad**: Se valida que códigos e identificadores sigan siendo únicos

#### Guardado y Confirmación

1. **Validación final**: El sistema ejecuta todas las validaciones antes de guardar
2. **Actualización de metadatos**: Se actualizan automáticamente fechas y referencias de auditoría
3. **Confirmación**: El usuario recibe confirmación de que los cambios se guardaron exitosamente

### 5.2 Controles de Calidad

#### Validaciones Automáticas

- **Consistencia temporal**: Las fechas deben ser lógicamente coherentes
- **Integridad referencial**: Las referencias a otros registros deben ser válidas
- **Formato de datos**: Los campos deben cumplir con formatos específicos
- **Reglas de negocio**: Se aplican automáticamente las políticas hospitalarias

#### Verificaciones de Seguridad

- **Control de acceso**: Solo usuarios autorizados pueden realizar modificaciones
- **Trazabilidad**: Todos los cambios quedan registrados para auditoría
- **Validación de archivos**: Los documentos cargados se verifican por seguridad
- **Integridad de datos**: Se mantiene la consistencia de la información en todo el sistema

---

## 6. CONSIDERACIONES ESPECIALES

### 6.1 Equipos en Diferentes Estados

#### Equipos Activos

- **Modificación completa**: Se pueden editar todos los campos disponibles
- **Validaciones estrictas**: Se aplican todas las reglas de negocio
- **Impacto inmediato**: Los cambios afectan inmediatamente la operación

#### Equipos en Mantenimiento

- **Restricciones temporales**: Algunos campos pueden estar bloqueados durante intervenciones
- **Coordinación necesaria**: Cambios pueden requerir coordinación con personal técnico
- **Validación adicional**: Modificaciones pueden necesitar aprobación especial

#### Equipos Dados de Baja

- **Edición limitada**: Solo se pueden modificar campos específicos
- **Información histórica**: Se mantiene la integridad de datos históricos
- **Propósitos de auditoría**: Las modificaciones se limitan a correcciones necesarias

### 6.2 Tipos de Equipos

#### Equipos Biomédicos

- **Campos especializados**: Incluyen clasificaciones biomédicas y de riesgo
- **Regulaciones específicas**: Deben cumplir normativas sanitarias estrictas
- **Validaciones adicionales**: Requieren verificaciones especiales

#### Equipos Industriales

- **Campos simplificados**: No requieren clasificaciones biomédicas
- **Enfoque operativo**: Se centran en aspectos técnicos y de mantenimiento
- **Flexibilidad mayor**: Menos restricciones regulatorias

### 6.3 Impacto de las Modificaciones

#### En Otros Módulos del Sistema

- **Programación de mantenimientos**: Los cambios pueden afectar calendarios establecidos
- **Reportes e indicadores**: Las modificaciones se reflejan en estadísticas y reportes
- **Alertas automáticas**: Cambios pueden generar o cancelar notificaciones
- **Integración con otros sistemas**: Las modificaciones se propagan a sistemas conectados

#### En la Operación Hospitalaria

- **Disponibilidad de equipos**: Cambios en ubicación afectan la disponibilidad
- **Programación de servicios**: Modificaciones pueden impactar la planificación clínica
- **Costos operativos**: Cambios en valores afectan cálculos financieros
- **Cumplimiento regulatorio**: Modificaciones deben mantener el cumplimiento normativo

---

## 7. CONCLUSIONES

### 7.1 Importancia Estratégica

El modal de edición de equipos biomédicos representa una herramienta fundamental para la gestión eficiente de activos médicos en el Hospital Universitario del Valle "Evaristo García". Su diseño balanceado entre flexibilidad para modificaciones necesarias y controles para mantener la integridad de los datos lo convierte en una pieza clave del sistema de gestión hospitalaria.

### 7.2 Beneficios Principales

- **Mantenimiento de información actualizada**: Garantiza que los datos de equipos estén siempre vigentes
- **Cumplimiento regulatorio**: Facilita el cumplimiento de normativas sanitarias
- **Eficiencia operativa**: Mejora la gestión y utilización de equipos médicos
- **Trazabilidad completa**: Mantiene un historial detallado para auditorías y control
- **Seguridad de datos**: Protege la integridad de la información crítica del hospital

### 7.3 Valor para la Institución

Esta funcionalidad contribuye significativamente a la misión del hospital de brindar atención médica de alta calidad, asegurando que todos los equipos biomédicos estén adecuadamente documentados, controlados y mantenidos según los más altos estándares de calidad y seguridad.

## 8.1 Modal Overview and Purpose

The equipment file upload modal is a specialized interface designed for associating various types of documents and files with specific equipment records. This modal enables users to upload, categorize, and manage documentation that supports equipment lifecycle management, compliance requirements, and operational procedures.

#### Primary Functions

- Upload multiple file types for equipment documentation
- Categorize files by document type (manuals, certifications, training materials, etc.)
- Associate files with specific equipment through junction tables
- Support both individual equipment and bulk file associations
- Manage file versioning and replacement workflows

### 8.2 Database Architecture

#### Primary Tables Structure

##### Table: `equipo_archivo` (Junction Table)

This is the core junction table that links equipment with their associated files and documents.

| Column       | Data Type          | Purpose                               | Constraints                 |
| ------------ | ------------------ | ------------------------------------- | --------------------------- |
| `id`         | INT AUTO_INCREMENT | Primary key                           | NOT NULL, PRIMARY KEY       |
| `equipo_id`  | INT                | Foreign key to equipos table          | NOT NULL, FK to equipos.id  |
| `archivo_id` | INT                | Foreign key to archivos table         | NOT NULL, FK to archivos.id |
| `vinculo`    | VARCHAR(255)       | Actual filename/path of uploaded file | NULL allowed                |
| `created_at` | DATETIME           | Upload timestamp                      | NOT NULL                    |

**Purpose**: Establishes many-to-many relationship between equipment and file types, storing the actual uploaded file reference.

##### Table: `archivos` (File Categories Catalog)

This table defines the types of documents that can be associated with equipment.

| Column   | Data Type          | Purpose                | Constraints           |
| -------- | ------------------ | ---------------------- | --------------------- |
| `id`     | INT AUTO_INCREMENT | Primary key            | NOT NULL, PRIMARY KEY |
| `name`   | VARCHAR(255)       | Document type name     | NOT NULL              |
| `status` | INT                | Active/inactive status | DEFAULT 1             |

**Common File Types** (based on system analysis):

- ID 1: Manuales de operación
- ID 2: Manuales de mantenimiento
- ID 3: Manuales de partes
- ID 4: Planos eléctricos
- ID 5: Planos electrónicos
- ID 6: Planos neumáticos
- ID 7: Planos mecánicos
- ID 8: Protocolos de calibración
- **ID 9: Capacitaciones** (special category with enhanced functionality)
- ID 10: Certificados de calibración
- ID 11: Hojas de seguridad
- ID 12: Guías de instalación
- ID 13: Certificados de conformidad
- ID 14: Reportes de mantenimiento
- ID 15: Documentación técnica
- ID 16: Garantías
- ID 17: Facturas
- ID 18: Órdenes de compra
- ID 19: Otros documentos de ingreso

### 8.3 Modal Field Structure and Data Flow

#### Essential Form Fields

##### Equipment Identification

| Field Name  | Form Element | Database Target            | Validation | Purpose                          |
| ----------- | ------------ | -------------------------- | ---------- | -------------------------------- |
| `equipo_id` | Hidden input | `equipo_archivo.equipo_id` | Required   | Links file to specific equipment |

##### File Classification

| Field Name   | Form Element    | Database Target             | Validation | Purpose                   |
| ------------ | --------------- | --------------------------- | ---------- | ------------------------- |
| `archivo_id` | Select dropdown | `equipo_archivo.archivo_id` | Required   | Categorizes document type |

**Dropdown Population Query**:

```sql
SELECT id, name
FROM archivos
WHERE status = 1
ORDER BY name ASC
```

##### File Upload

| Field Name | Form Element | Database Target          | Validation                | Purpose              |
| ---------- | ------------ | ------------------------ | ------------------------- | -------------------- |
| `vinculo`  | File input   | `equipo_archivo.vinculo` | Required, file validation | Stores uploaded file |

##### Special Fields for Training Files (archivo_id = 9)

| Field Name           | Form Element | Database Target                 | Validation            | Purpose       |
| -------------------- | ------------ | ------------------------------- | --------------------- | ------------- |
| `fecha_capacitacion` | Date input   | Combined with hora_capacitacion | Required for training | Training date |
| `hora_capacitacion`  | Time input   | Combined to create created_at   | Required for training | Training time |

**Combined Timestamp Creation**:

```php
$_POST['created_at'] = $_POST['fecha_capacitacion'] . ' ' . $_POST['hora_capacitacion'];
```

##### Special Fields for Other Documents (archivo_id = 19)

| Field Name | Form Element | Database Target       | Validation | Purpose                      |
| ---------- | ------------ | --------------------- | ---------- | ---------------------------- |
| `otro`     | Text input   | Custom field handling | Optional   | Specify custom document type |
