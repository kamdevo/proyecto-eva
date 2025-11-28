# Flujo del Cronograma de Mantenimiento Preventivo

## Descripción General

El sistema permite gestionar un cronograma anual de mantenimiento preventivo para equipos médicos/industriales. Los usuarios pueden cargar un archivo Excel con la programación de mantenimientos del año, y el sistema procesa, almacena y visualiza esta información de manera estructurada.

---

## 1. CARGA DEL ARCHIVO EXCEL

### 1.1 Interfaz de Usuario

La página de mantenimiento preventivo presenta un formulario de carga con los siguientes elementos:

**Campos del formulario:**
- **Año del cronograma**: Selector desplegable para elegir el año de vigencia del plan de mantenimiento (ejemplo: 2019, 2020, 2021, 2022, 2023)
- **Reemplazar información**: Selector con opciones "Sí" o "No" que determina si se debe:
  - **Sí**: Eliminar todos los registros del año seleccionado y reemplazarlos con los nuevos datos
  - **No**: Mantener los registros existentes y solo agregar/actualizar los que vienen en el archivo
- **Archivo Excel**: Input de tipo file para seleccionar el archivo

**Ayuda visual:**
La interfaz muestra una tabla de ejemplo con el formato esperado del Excel y observaciones importantes sobre cómo preparar el archivo.

### 1.2 Formato del Archivo Excel

El archivo debe ser un Excel plano (.xlsx o .xls) con una sola hoja y **sin fila de encabezados** (o se debe eliminar antes de procesar). Las columnas deben estar en el siguiente orden:

| Columna | Nombre Campo | Descripción | Tipo de Dato | Ejemplo |
|---------|--------------|-------------|--------------|---------|
| A | ID Equipo | Identificador único del equipo en el sistema | Número entero | 200 |
| B | Mes 1 | Primer mes programado para mantenimiento | Número (1-12) | 1 |
| C | Mes 2 | Segundo mes programado (opcional) | Número (1-12) o vacío | 7 |
| D | Mes 3 | Tercer mes programado (opcional) | Número (1-12) o vacío | - |
| E | Responsable | Empresa o persona responsable del mantenimiento | Texto | SYSMED |
| F | Frecuencia | Tipo de frecuencia del mantenimiento | Texto | ANUAL |

**Ejemplo de contenido:**
```
200    1    7         SYSMED    SEMESTRAL
320    2    8         SYSMED    SEMESTRAL
450    1    5    9    TECNOLOGO  CUATRIMESTRAL
```

**Notas importantes:**
- Los meses deben ser valores numéricos del 1 al 12
- Los meses deben estar en orden ascendente lógico
- El responsable debe escribirse siempre igual para evitar duplicados
- Mes2 y Mes3 pueden quedar vacíos si la frecuencia es anual
- No incluir la fila de títulos/encabezados

---

## 2. PROCESAMIENTO DEL ARCHIVO

### 2.1 Flujo de Procesamiento

Cuando el usuario presiona el botón "Send", el sistema ejecuta los siguientes pasos:

**Paso 1: Recepción de datos**
- El sistema recibe el archivo Excel
- Captura el año seleccionado
- Captura la opción de reemplazar (Sí/No)
- Identifica al usuario que realiza la carga

**Paso 2: Validación inicial**
- Se verifica que el archivo sea un formato Excel válido
- Se carga el archivo en memoria usando una librería de procesamiento de Excel

**Paso 3: Procesamiento según opción de reemplazo**

Si la opción "Reemplazar" es **"Sí"**:
- Se eliminan TODOS los registros existentes en la base de datos para el año seleccionado
- Esto permite una actualización completa del cronograma anual

Si la opción "Reemplazar" es **"No"**:
- Se mantienen todos los registros existentes
- Solo se actualizan los registros de equipos que vengan en el archivo

**Paso 4: Lectura e inserción fila por fila**

El sistema lee el archivo desde la fila 2 hasta la última fila (la fila 1 se asume como encabezados aunque no debería incluirse):

Para cada fila del Excel:
1. Extrae los valores de las columnas A, B, C, D, E, F
2. Elimina cualquier registro previo del mismo equipo y año (evita duplicados)
3. Crea un nuevo registro con la siguiente información:
   - ID del equipo (Columna A)
   - Año del cronograma
   - Mes 1 (Columna B)
   - Mes 2 (Columna C)
   - Mes 3 (Columna D)
   - Responsable del mantenimiento (Columna E)
   - ID de frecuencia (Columna F)
   - ID del usuario que carga el archivo
   - Fecha de creación automática
4. Inserta el registro en la tabla de planes de mantenimiento

**Paso 5: Actualización de estados**
- Al finalizar la carga, el sistema actualiza automáticamente el estado de mantenimiento de todos los equipos afectados

**Paso 6: Confirmación**
- Se muestra un mensaje de éxito al usuario
- Se actualiza la tabla de visualización con los nuevos datos

### 2.2 Estructura de Almacenamiento en Base de Datos

Los datos se guardan en las siguientes tablas de la base de datos:

#### Tabla Principal: `planes_mantenimientos`

Esta es la tabla donde se almacenan todos los registros del cronograma cargados desde el Excel.

| Campo | Tipo | Descripción | Se llena desde |
|-------|------|-------------|----------------|
| `id` | INT (Primary Key, Auto Increment) | Identificador único del registro | Automático |
| `equipo_id` | INT | Referencia al equipo (FK a tabla equipos) | Columna A del Excel |
| `anio` | INT | Año de vigencia del plan | Selector de año del formulario |
| `mes1` | INT (1-12) | Primer mes programado para mantenimiento | Columna B del Excel |
| `mes2` | INT (1-12) o NULL | Segundo mes programado (opcional) | Columna C del Excel |
| `mes3` | INT (1-12) o NULL | Tercer mes programado (opcional) | Columna D del Excel |
| `responsable` | VARCHAR | Empresa o persona responsable del mantenimiento | Columna E del Excel |
| `frecuencia_id` | INT | Referencia a la frecuencia de mantenimiento (FK) | Columna F del Excel |
| `usuario_id` | INT | Usuario que creó el registro (FK a tabla usuarios) | Usuario autenticado en sesión |
| `created_at` | TIMESTAMP | Fecha y hora de creación del registro | Automático (timestamp actual) |

**Ejemplo de registro:**
```
id: 1
equipo_id: 200
anio: 2022
mes1: 1
mes2: 7
mes3: NULL
responsable: "SYSMED"
frecuencia_id: 2
usuario_id: 5
created_at: "2022-01-15 10:30:00"
```

#### Tabla de Control de Cambios: `cambios_cronograma`

Esta tabla registra todas las modificaciones realizadas a los registros del cronograma.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | INT (Primary Key, Auto Increment) | Identificador único del cambio |
| `planes_mantenimientos_id` | INT | Referencia al registro modificado (FK a planes_mantenimientos) |
| `usuario_id` | INT | Usuario que realizó el cambio (FK a tabla usuarios) |
| `cambio` | TEXT | Descripción textual del cambio realizado |
| `created_at` | TIMESTAMP | Fecha y hora del cambio |

**Ejemplo de registro de cambio:**
```
id: 1
planes_mantenimientos_id: 1
usuario_id: 5
cambio: "(mes1: 1 -> 2)(responsable: SYSMED -> TECNOLOGO)"
created_at: "2022-03-10 14:25:00"
```

#### Tabla de Mantenimientos Ejecutados: `mantenimiento`

Esta tabla almacena los mantenimientos preventivos que realmente se ejecutaron.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | INT (Primary Key, Auto Increment) | Identificador único del mantenimiento |
| `equipo_id` | INT | Referencia al equipo (FK a tabla equipos) |
| `fecha_mantenimiento` | DATE | Fecha en que se ejecutó el mantenimiento |
| `fecha_programada` | DATE | Fecha en que estaba programado |
| `description` | VARCHAR | Código o descripción del mantenimiento |
| `observacion` | TEXT | Observaciones sobre el mantenimiento |
| `file` | VARCHAR | Nombre del archivo adjunto (evidencia) |
| `proveedor_mantenimiento_id` | INT | Proveedor que realizó el mantenimiento (FK) |
| `repuesto_pendiente` | ENUM('si','no') | Indica si quedó pendiente algún repuesto |
| `repuesto_id` | INT | Referencia al repuesto pendiente (FK) |

**Nota:** Esta tabla se utiliza para contar los mantenimientos ejecutados y compararlos con los programados en el cronograma.

#### Tabla de Equipos: `equipos`

Esta tabla contiene la información maestra de todos los equipos.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | INT (Primary Key, Auto Increment) | Identificador único del equipo |
| `name` | VARCHAR | Nombre descriptivo del equipo |
| `code` | VARCHAR | Código de identificación del equipo |
| `serial` | VARCHAR | Número de serie del fabricante |
| `marca` | VARCHAR | Marca/Fabricante del equipo |
| `modelo` | VARCHAR | Modelo del equipo |
| `propiedad` | VARCHAR | Propiedad (Propio, Comodato, Alquiler, etc.) |
| `servicio_id` | INT | Servicio al que pertenece (FK a tabla servicios) |
| `area_id` | INT | Área específica (FK a tabla areas) |
| `estadoequipo_id` | INT | Estado del equipo (FK a tabla estadoequipos) |
| `estado_mantenimiento` | INT | Estado del mantenimiento (FK a tabla estadosm) |
| `frecuencia_id` | INT | Frecuencia de mantenimiento (FK a tabla frecuenciam) |
| `tipo_id` | INT | Tipo de equipo/subproceso |
| `tadquisicion_id` | INT | Tipo de adquisición |
| `status` | INT | Estado activo/inactivo (1/0) |
| `repuesto_pendiente` | ENUM('si','no') | Si tiene repuestos pendientes |

#### Tablas Relacionales/Catálogos

Estas tablas contienen información de referencia utilizada en las consultas:

**Tabla `servicios`:**
- `id`: Identificador del servicio
- `name`: Nombre del servicio (Ej: "Urgencias", "Cirugía", etc.)
- `sede_id`: Referencia a la sede (FK a tabla sedes)

**Tabla `areas`:**
- `id`: Identificador del área
- `name`: Nombre del área (Ej: "Piso 3", "UCI", etc.)

**Tabla `sedes`:**
- `id`: Identificador de la sede
- `name`: Nombre de la sede (Ej: "Sede Principal", "Sede Norte", etc.)

**Tabla `estadoequipos`:**
- `id`: Identificador del estado
- `name`: Nombre del estado (Ej: "Activo", "Inactivo", "En reparación", etc.)

**Tabla `estadosm`:**
- `id`: Identificador del estado de mantenimiento
- `name`: Nombre del estado (Ej: "Al día", "Pendiente", "Vencido", etc.)

**Tabla `frecuenciam`:**
- `id`: Identificador de la frecuencia
- `name`: Nombre de la frecuencia (Ej: "ANUAL", "SEMESTRAL", "TRIMESTRAL", etc.)

**Tabla `usuarios`:**
- `id`: Identificador del usuario
- `nombre`: Nombre del usuario
- `apellido`: Apellido del usuario
- `username`: Nombre de usuario (login)

**Tabla `proveedores_mantenimiento`:**
- `id`: Identificador del proveedor
- `name`: Nombre del proveedor (Ej: "SYSMED", "TECNOLOGO", etc.)

---

## 3. VISUALIZACIÓN DE LA INFORMACIÓN

### 3.1 Tabla Principal del Cronograma

Después de cargar el Excel, la información se muestra en una tabla interactiva con las siguientes columnas:

| Columna | Información Mostrada | Fuente de Datos |
|---------|---------------------|-----------------|
| **Acciones** | Botones de editar y ver control de cambios | Generado dinámicamente |
| **ID Equipo** | Número identificador del equipo | Directo de la tabla de planes |
| **Equipo** | Nombre descriptivo del equipo | Relacionado desde tabla de equipos |
| **Código** | Código de identificación del equipo | Relacionado desde tabla de equipos |
| **Serie** | Número de serie del equipo | Relacionado desde tabla de equipos |
| **Marca** | Fabricante del equipo | Relacionado desde tabla de equipos |
| **Modelo** | Modelo del equipo | Relacionado desde tabla de equipos |
| **Responsable** | Empresa/persona responsable del mantenimiento | Directo de la tabla de planes |
| **Rango Programado 1** | Primer y último día del mes 1 | Calculado: primer_dia_mes1 \| último_dia_mes1 |
| **Rango Programado 2** | Primer y último día del mes 2 | Calculado: primer_dia_mes2 \| último_dia_mes2 (o "N/A" si no aplica) |
| **Rango Programado 3** | Primer y último día del mes 3 | Calculado: primer_dia_mes3 \| último_dia_mes3 (o "N/A" si no aplica) |
| **Cantidad Ejecutados** | Total de mantenimientos realizados en el año | Conteo de registros de mantenimiento del equipo en el año |
| **Cantidad Programados** | Total de mantenimientos planeados | Suma de meses con valor (si mes1, mes2, mes3 tienen valor) |
| **Cumplimiento Global** | Indicador de cumplimiento | "Si cumple" si ejecutados ≥ programados, "No cumple" en caso contrario |

### 3.2 Cálculos y Datos Derivados

El sistema realiza varios cálculos automáticos para enriquecer la información:

**Rangos de Fechas:**
- Para cada mes programado (mes1, mes2, mes3), el sistema calcula:
  - **Primer día del mes**: Día 1 del mes en el año especificado
  - **Último día del mes**: Último día del mes (28, 29, 30 o 31 según corresponda)
- Ejemplo: Si mes1 = 3 y año = 2022, el rango sería: "2022-03-01 | 2022-03-31"

**Cantidad de Preventivos Ejecutados:**
- El sistema consulta la tabla de mantenimientos
- Cuenta cuántos registros de mantenimiento preventivo se realizaron para ese equipo
- Filtra por el año del cronograma
- Ejemplo: Si el plan es para 2022, cuenta todos los mantenimientos con fecha en 2022

**Cantidad de Preventivos Programados:**
- Cuenta cuántos meses tienen un valor asignado
- Si mes1=1, mes2=7, mes3=NULL → programados = 2
- Si mes1=2, mes2=5, mes3=8 → programados = 3

**Cumplimiento Global:**
- Compara ejecutados vs programados
- Si ejecutados ≥ programados → "Si cumple"
- Si ejecutados < programados → "No cumple"

### 3.3 Información Adicional en Exportación

Cuando se exporta el cronograma a Excel, se incluyen columnas adicionales:

**Columnas de Auditoría:**
- Fecha de creación del registro
- Usuario responsable de la creación
- Fecha de última actualización
- Descripción del último cambio realizado
- Usuario que realizó la última edición

**Columnas de Ejecución:**
- Información de la primera visita: código del mantenimiento, fecha, proveedor
- Información de la segunda visita: código del mantenimiento, fecha, proveedor
- Información de la tercera visita: código del mantenimiento, fecha, proveedor
- Información de la cuarta visita: código del mantenimiento, fecha, proveedor

**Columnas de Estado:**
- Estado del equipo (activo, inactivo, dado de baja, etc.)
- Estado del mantenimiento (al día, pendiente, vencido, etc.)
- Propiedad del equipo
- Sede donde se encuentra
- Servicio al que pertenece
- Área específica

---

## 4. FUNCIONALIDADES COMPLEMENTARIAS

### 4.1 Filtrado por Año

La página incluye un selector de año que permite:
- Visualizar únicamente los registros del año seleccionado
- Cambiar entre diferentes años sin recargar la página
- El filtro se aplica automáticamente al cambiar la selección

### 4.2 Edición Manual de Registros

Para cada registro del cronograma, el usuario puede:
- Hacer clic en el botón de editar
- Se abre un formulario modal con los datos actuales
- Campos editables:
  - Mes 1
  - Mes 2
  - Mes 3
  - Responsable del mantenimiento
- Al guardar, el sistema:
  - Registra el cambio en una tabla de control de cambios
  - Guarda el usuario que realizó el cambio
  - Guarda la fecha y hora del cambio
  - Guarda una descripción del cambio (qué campo cambió y de qué valor a qué valor)
  - Actualiza el registro principal

### 4.3 Control de Cambios

El sistema mantiene un historial completo de modificaciones:
- Cada vez que se edita un registro, se guarda un registro en la tabla de control de cambios
- El usuario puede ver el historial haciendo clic en el ícono de "libro"
- La información mostrada incluye:
  - Usuario que realizó el cambio
  - Descripción del cambio (ejemplo: "mes1: 1 → 2, responsable: SYSMED → TECNOLOGO")
  - Fecha y hora exacta del cambio
- Esto permite auditar quién modificó qué y cuándo

### 4.4 Exportación a Excel

**Exportar Consolidado:**
- Genera un archivo Excel con TODOS los registros del sistema
- Incluye todas las columnas mencionadas anteriormente
- Útil para reportes y análisis externos

**Descargar Plantilla:**
- Proporciona un archivo Excel de ejemplo
- El archivo viene con el formato correcto
- Facilita la preparación de datos para importación

### 4.5 Búsqueda y Paginación

La tabla de visualización incluye:
- Buscador en tiempo real que filtra por:
  - Nombre del equipo
  - Código
  - Serie
  - ID del equipo
  - Responsable
  - Cumplimiento (Si cumple / No cumple)
- Paginación configurable (5, 10 o 20 registros por página)
- Contador de registros totales y filtrados

---

## 5. RELACIÓN CON OTRAS SECCIONES DEL SISTEMA

### 5.1 Vínculo con Mantenimientos Ejecutados

El cronograma está conectado con los mantenimientos preventivos ejecutados:
- Cuando se registra un mantenimiento preventivo en otra sección del sistema
- El sistema automáticamente lo asocia al equipo y al año
- Esto actualiza el contador de "preventivos ejecutados" en el cronograma
- Permite calcular el cumplimiento en tiempo real

### 5.2 Estado del Mantenimiento

El sistema actualiza automáticamente el estado de mantenimiento de cada equipo:
- Compara la fecha actual con las fechas programadas
- Determina si el mantenimiento está:
  - Al día: Se realizó dentro del rango programado
  - Pendiente: Aún no se realiza pero está dentro del período
  - Vencido: No se realizó y ya pasó la fecha programada
- Este estado se refleja en otras secciones del sistema

### 5.3 Información Mostrada en Otras Páginas

La información del cronograma se utiliza en:
- **Página de equipos**: Muestra el próximo mantenimiento programado
- **Dashboard/Indicadores**: Calcula porcentajes de cumplimiento global
- **Reportes**: Genera estadísticas de mantenimientos por período
- **Alertas**: Envía notificaciones cuando se acerca una fecha programada

---

## 6. REGLAS DE NEGOCIO Y VALIDACIONES

### 6.1 Validaciones en la Carga

- El año del cronograma debe estar seleccionado
- El archivo debe ser un Excel válido
- La opción de reemplazar debe estar seleccionada (Sí/No)
- Cada fila debe tener al menos el ID del equipo y el mes1
- Los valores de mes deben ser números entre 1 y 12
- El ID del equipo debe existir en la base de datos de equipos

### 6.2 Prevención de Duplicados

- El sistema elimina automáticamente registros previos del mismo equipo y año
- Esto asegura que no existan múltiples planes para el mismo equipo en el mismo año
- Si se carga dos veces el mismo equipo en el mismo archivo, prevalece el último registro

### 6.3 Registro de Auditoría

- Cada inserción registra el usuario que realizó la carga
- Cada modificación registra el usuario y el detalle del cambio
- Las fechas de creación y modificación se guardan automáticamente
- Esto permite rastrear completamente el historial de cada plan

---

## 7. FLUJO COMPLETO RESUMIDO

```
1. USUARIO PREPARA EXCEL
   ↓
   - Descarga plantilla (opcional)
   - Llena datos según formato
   - Guarda archivo sin encabezados

2. USUARIO ACCEDE A LA PÁGINA
   ↓
   - Navega a la sección de mantenimiento preventivo
   - Ve el formulario de carga

3. USUARIO CONFIGURA CARGA
   ↓
   - Selecciona año del cronograma
   - Selecciona opción reemplazar (Sí/No)
   - Selecciona archivo Excel
   - Presiona botón "Send"

4. SISTEMA PROCESA ARCHIVO
   ↓
   - Valida formato y datos
   - Si reemplazar=Sí: elimina registros del año
   - Lee fila por fila desde fila 2
   - Por cada fila:
     * Elimina registro anterior del equipo/año
     * Crea nuevo registro con datos del Excel
     * Inserta en tabla de planes
   - Actualiza estados de equipos
   - Muestra mensaje de éxito

5. SISTEMA MUESTRA INFORMACIÓN
   ↓
   - Consulta base de datos
   - Calcula rangos de fechas
   - Cuenta mantenimientos ejecutados
   - Calcula cumplimiento
   - Renderiza tabla con toda la información

6. USUARIO VISUALIZA Y GESTIONA
   ↓
   - Ve tabla con cronograma cargado
   - Puede filtrar por año
   - Puede buscar equipos
   - Puede editar registros individuales
   - Puede ver historial de cambios
   - Puede exportar a Excel

7. SISTEMA MANTIENE SINCRONIZACIÓN
   ↓
   - Cuando se registran mantenimientos ejecutados
   - Actualiza contadores automáticamente
   - Recalcula cumplimiento
   - Actualiza estados de equipos
```

---

## 8. CONSIDERACIONES TÉCNICAS PARA REPLICACIÓN

### 8.1 Base de Datos

Se requieren las siguientes tablas con sus nombres y campos específicos:

#### 1. **Tabla: `planes_mantenimientos`** (Tabla Principal)
   ```sql
   CREATE TABLE planes_mantenimientos (
       id INT PRIMARY KEY AUTO_INCREMENT,
       equipo_id INT NOT NULL,
       anio INT NOT NULL,
       mes1 INT,
       mes2 INT,
       mes3 INT,
       responsable VARCHAR(255),
       frecuencia_id INT,
       usuario_id INT,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       FOREIGN KEY (equipo_id) REFERENCES equipos(id),
       FOREIGN KEY (frecuencia_id) REFERENCES frecuenciam(id),
       FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
   );
   ```

#### 2. **Tabla: `equipos`** (Información de Equipos)
   ```sql
   CREATE TABLE equipos (
       id INT PRIMARY KEY AUTO_INCREMENT,
       name VARCHAR(255),
       code VARCHAR(100),
       serial VARCHAR(100),
       marca VARCHAR(100),
       modelo VARCHAR(100),
       propiedad VARCHAR(100),
       servicio_id INT,
       area_id INT,
       estadoequipo_id INT,
       estado_mantenimiento INT,
       frecuencia_id INT,
       tipo_id INT,
       tadquisicion_id INT,
       status INT DEFAULT 1,
       repuesto_pendiente ENUM('si','no'),
       FOREIGN KEY (servicio_id) REFERENCES servicios(id),
       FOREIGN KEY (area_id) REFERENCES areas(id),
       FOREIGN KEY (estadoequipo_id) REFERENCES estadoequipos(id),
       FOREIGN KEY (estado_mantenimiento) REFERENCES estadosm(id),
       FOREIGN KEY (frecuencia_id) REFERENCES frecuenciam(id)
   );
   ```

#### 3. **Tabla: `mantenimiento`** (Mantenimientos Ejecutados)
   ```sql
   CREATE TABLE mantenimiento (
       id INT PRIMARY KEY AUTO_INCREMENT,
       equipo_id INT NOT NULL,
       fecha_mantenimiento DATE,
       fecha_programada DATE,
       description VARCHAR(255),
       observacion TEXT,
       file VARCHAR(255),
       proveedor_mantenimiento_id INT,
       repuesto_pendiente ENUM('si','no'),
       repuesto_id INT,
       FOREIGN KEY (equipo_id) REFERENCES equipos(id),
       FOREIGN KEY (proveedor_mantenimiento_id) REFERENCES proveedores_mantenimiento(id)
   );
   ```

#### 4. **Tabla: `cambios_cronograma`** (Control de Cambios)
   ```sql
   CREATE TABLE cambios_cronograma (
       id INT PRIMARY KEY AUTO_INCREMENT,
       planes_mantenimientos_id INT NOT NULL,
       usuario_id INT NOT NULL,
       cambio TEXT,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       FOREIGN KEY (planes_mantenimientos_id) REFERENCES planes_mantenimientos(id),
       FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
   );
   ```

#### 5. **Tablas Relacionales/Catálogos**

   **Tabla: `frecuenciam`**
   ```sql
   CREATE TABLE frecuenciam (
       id INT PRIMARY KEY AUTO_INCREMENT,
       name VARCHAR(100)
   );
   -- Ejemplos: ANUAL, SEMESTRAL, TRIMESTRAL, CUATRIMESTRAL
   ```

   **Tabla: `estadoequipos`**
   ```sql
   CREATE TABLE estadoequipos (
       id INT PRIMARY KEY AUTO_INCREMENT,
       name VARCHAR(100)
   );
   -- Ejemplos: Activo, Inactivo, En reparación, Dado de baja
   ```

   **Tabla: `estadosm`** (Estados de Mantenimiento)
   ```sql
   CREATE TABLE estadosm (
       id INT PRIMARY KEY AUTO_INCREMENT,
       name VARCHAR(100)
   );
   -- Ejemplos: Al día, Pendiente, Vencido
   ```

   **Tabla: `servicios`**
   ```sql
   CREATE TABLE servicios (
       id INT PRIMARY KEY AUTO_INCREMENT,
       name VARCHAR(255),
       sede_id INT,
       FOREIGN KEY (sede_id) REFERENCES sedes(id)
   );
   -- Ejemplos: Urgencias, Cirugía, UCI, Hospitalización
   ```

   **Tabla: `areas`**
   ```sql
   CREATE TABLE areas (
       id INT PRIMARY KEY AUTO_INCREMENT,
       name VARCHAR(255)
   );
   -- Ejemplos: Piso 1, Piso 2, UCI, Sala de Operaciones
   ```

   **Tabla: `sedes`**
   ```sql
   CREATE TABLE sedes (
       id INT PRIMARY KEY AUTO_INCREMENT,
       name VARCHAR(255)
   );
   -- Ejemplos: Sede Principal, Sede Norte, Sede Sur
   ```

   **Tabla: `usuarios`**
   ```sql
   CREATE TABLE usuarios (
       id INT PRIMARY KEY AUTO_INCREMENT,
       nombre VARCHAR(100),
       apellido VARCHAR(100),
       username VARCHAR(50) UNIQUE,
       password VARCHAR(255)
   );
   ```

   **Tabla: `proveedores_mantenimiento`**
   ```sql
   CREATE TABLE proveedores_mantenimiento (
       id INT PRIMARY KEY AUTO_INCREMENT,
       name VARCHAR(255)
   );
   -- Ejemplos: SYSMED, TECNOLOGO, BIOMEDICA XYZ
   ```

#### Relaciones entre Tablas

```
planes_mantenimientos
    ├── equipo_id → equipos.id
    ├── frecuencia_id → frecuenciam.id
    └── usuario_id → usuarios.id

equipos
    ├── servicio_id → servicios.id
    ├── area_id → areas.id
    ├── estadoequipo_id → estadoequipos.id
    ├── estado_mantenimiento → estadosm.id
    └── frecuencia_id → frecuenciam.id

servicios
    └── sede_id → sedes.id

mantenimiento
    ├── equipo_id → equipos.id
    └── proveedor_mantenimiento_id → proveedores_mantenimiento.id

cambios_cronograma
    ├── planes_mantenimientos_id → planes_mantenimientos.id
    └── usuario_id → usuarios.id
```

#### Consultas SQL Principales

**1. Inserción de registro del cronograma:**
```sql
INSERT INTO planes_mantenimientos
(equipo_id, anio, mes1, mes2, mes3, responsable, frecuencia_id, usuario_id)
VALUES
(200, 2022, 1, 7, NULL, 'SYSMED', 2, 5);
```

**2. Eliminación de registros del año (cuando se selecciona reemplazar):**
```sql
DELETE FROM planes_mantenimientos WHERE anio = 2022;
```

**3. Eliminación de registro anterior del equipo/año (evita duplicados):**
```sql
DELETE FROM planes_mantenimientos
WHERE equipo_id = 200 AND anio = 2022;
```

**4. Consulta para contar mantenimientos ejecutados:**
```sql
SELECT COUNT(*) AS total
FROM mantenimiento
WHERE equipo_id = 200
AND YEAR(fecha_mantenimiento) = 2022;
```

**5. Consulta para calcular cumplimiento:**
```sql
SELECT
    pm.id,
    pm.equipo_id,
    (IF(pm.mes1 IS NOT NULL AND pm.mes1 != '', 1, 0) +
     IF(pm.mes2 IS NOT NULL AND pm.mes2 != '', 1, 0) +
     IF(pm.mes3 IS NOT NULL AND pm.mes3 != '', 1, 0)) AS cantidad_programados,
    (SELECT COUNT(*)
     FROM mantenimiento m
     WHERE m.equipo_id = pm.equipo_id
     AND YEAR(m.fecha_mantenimiento) = pm.anio) AS cantidad_ejecutados,
    IF((SELECT COUNT(*)
        FROM mantenimiento m
        WHERE m.equipo_id = pm.equipo_id
        AND YEAR(m.fecha_mantenimiento) = pm.anio) >=
       (IF(pm.mes1 IS NOT NULL AND pm.mes1 != '', 1, 0) +
        IF(pm.mes2 IS NOT NULL AND pm.mes2 != '', 1, 0) +
        IF(pm.mes3 IS NOT NULL AND pm.mes3 != '', 1, 0)),
       'Si cumple', 'No cumple') AS cumplimiento_global
FROM planes_mantenimientos pm
WHERE pm.anio = 2022;
```

**6. Registro de cambio en control de cambios:**
```sql
INSERT INTO cambios_cronograma
(planes_mantenimientos_id, usuario_id, cambio)
VALUES
(1, 5, '(mes1: 1 -> 2)(responsable: SYSMED -> TECNOLOGO)');
```

**7. Consulta completa con JOINs para visualización:**
```sql
SELECT
    pm.id,
    pm.equipo_id,
    pm.anio,
    pm.mes1,
    pm.mes2,
    pm.mes3,
    pm.responsable,
    eq.name AS equipo,
    eq.code,
    eq.serial,
    eq.marca,
    eq.modelo,
    s.name AS servicio,
    a.name AS area,
    sd.name AS sede,
    ee.name AS estadoequipo,
    fm.name AS frecuencia,
    LAST_DAY(CONCAT(pm.anio, '-', pm.mes1, '-', 15)) AS last_day_m1,
    DATE_ADD(CONCAT(pm.anio, '-', pm.mes1, '-', 15),
             INTERVAL -DAY(CONCAT(pm.anio, '-', pm.mes1, '-', 15)) +1 DAY) AS first_day_m1,
    (SELECT COUNT(*) FROM mantenimiento m
     WHERE m.equipo_id = pm.equipo_id
     AND YEAR(m.fecha_mantenimiento) = pm.anio) AS cantidad_ejecutados
FROM planes_mantenimientos pm
INNER JOIN equipos eq ON eq.id = pm.equipo_id
LEFT JOIN servicios s ON s.id = eq.servicio_id
LEFT JOIN areas a ON a.id = eq.area_id
LEFT JOIN sedes sd ON sd.id = s.sede_id
LEFT JOIN estadoequipos ee ON ee.id = eq.estadoequipo_id
LEFT JOIN frecuenciam fm ON fm.id = eq.frecuencia_id
WHERE pm.anio = 2022
ORDER BY eq.name ASC;
```

### 8.2 Componentes Necesarios del Sistema

**Procesamiento del lado del servidor:**
- Capacidad de lectura y procesamiento de archivos Excel
- Arquitectura que separe la lógica de negocio, acceso a datos y presentación
- Sistema de autenticación y gestión de sesiones de usuarios
- Manejo seguro de carga de archivos
- Sistema de validación de datos

**Procesamiento del lado del cliente:**
- Tablas dinámicas con capacidad de búsqueda, ordenamiento y paginación
- Ventanas modales para edición de información
- Controles de selección (dropdowns) para filtrado
- Gestión de envío de formularios con archivos adjuntos

### 8.3 Funcionalidades del Servidor

- Recepción y procesamiento de archivos Excel cargados
- Consulta de datos con soporte para filtros y paginación
- Actualización de registros individuales
- Consulta de historial de cambios por registro
- Generación y descarga de archivos Excel
- Validación de datos antes de insertar en base de datos
- Gestión de transacciones para garantizar integridad de datos

### 8.4 Funcionalidades de la Interfaz

- Formulario de carga con validación de campos requeridos
- Tabla interactiva con:
  - Búsqueda en tiempo real
  - Paginación configurable
  - Ordenamiento por columnas
  - Contador de registros
- Ventana modal de edición con formulario
- Ventana modal de historial de cambios
- Selectores para filtrado por año
- Botones de exportación y descarga de plantillas

---

## CONCLUSIÓN

Este sistema proporciona una solución completa para la gestión del cronograma de mantenimiento preventivo, permitiendo:

- Carga masiva de datos mediante Excel
- Visualización clara y organizada de la programación
- Seguimiento del cumplimiento en tiempo real
- Edición y control de cambios
- Exportación para análisis externo
- Integración con el resto del sistema de gestión de equipos

La arquitectura modular permite replicar esta funcionalidad en cualquier sistema que requiera gestión de cronogramas y seguimiento de cumplimiento.
