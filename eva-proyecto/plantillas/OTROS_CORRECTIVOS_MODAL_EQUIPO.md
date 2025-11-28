# Sección "Otros Correctivos" en el Modal de Edición del Equipo

## Descripción General

En el modal de edición del equipo existe una sección llamada "**OTROS CORRECTIVOS**" que muestra un listado de mantenimientos correctivos no asociados a tickets del sistema de órdenes de trabajo. Estos son correctivos registrados de forma independiente, diferentes a los correctivos que vienen desde el sistema de tickets.

Este documento explica de dónde provienen estos datos, qué información se muestra y cómo se estructura.

---

## 1. FUENTE DE DATOS

### 1.1 Tabla Principal

Los datos provienen de la tabla:

**Tabla: `correctivos_generales`**

Esta tabla almacena todos los mantenimientos correctivos que no están vinculados al sistema de tickets o que se registran de forma independiente.

### 1.2 Consulta SQL Base

```sql
SELECT
    correctivos_generales.*,
    codificacion_cierres.name AS descripcion_codigo,
    codificacion_cierres.code AS codigo_cierre,
    (SELECT COUNT(*)
     FROM avances_correctivos
     WHERE avances_correctivos.correctivo_general_id = correctivos_generales.id) AS notas_avance,
    (SELECT description
     FROM avances_correctivos
     WHERE avances_correctivos.correctivo_general_id = correctivos_generales.id
     ORDER BY date DESC
     LIMIT 1) AS last_description
FROM correctivos_generales
LEFT JOIN codificacion_cierres
    ON codificacion_cierres.id = correctivos_generales.cierre_id
WHERE correctivos_generales.equipo_id = [ID_DEL_EQUIPO]
ORDER BY correctivos_generales.fecha_inicio DESC;
```

---

## 2. ESTRUCTURA DE LA TABLA `correctivos_generales`

### 2.1 Campos Principales

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | INT (Primary Key, Auto Increment) | Identificador único del correctivo |
| `equipo_id` | INT | Referencia al equipo (FK a tabla equipos) |
| `code_orden` | VARCHAR | Número de orden del trabajo |
| `orden` | TEXT | Descripción de la orden de trabajo |
| `fecha_inicio` | DATETIME | Fecha y hora de inicio del correctivo |
| `code_diagnostico` | VARCHAR | Código del diagnóstico |
| `diagnostico` | TEXT | Descripción del diagnóstico realizado |
| `fecha_diagnostico` | DATETIME | Fecha y hora del diagnóstico |
| `code` | VARCHAR | Código del mantenimiento correctivo |
| `description` | TEXT | Descripción del trabajo realizado |
| `fecha_mantenimiento` | DATETIME | Fecha y hora de ejecución del mantenimiento |
| `observacion` | TEXT | Observaciones adicionales |
| `image` | VARCHAR | Nombre del archivo de imagen/evidencia |
| `cierre_id` | INT | Tipo de cierre (FK a tabla codificacion_cierres) |
| `repuesto_pendiente` | ENUM('si','no') | Indica si quedó repuesto pendiente |
| `repuesto_id` | INT | Referencia al repuesto pendiente (FK) |
| `tipo_falla_id` | INT | Tipo de falla (FK a tabla tipos_fallas) |

### 2.2 Ejemplo de Registro

```
id: 1
equipo_id: 200
code_orden: "ORD-2023-001"
orden: "Equipo presenta error en pantalla"
fecha_inicio: "2023-05-10 14:30:00"
code_diagnostico: "DIAG-001"
diagnostico: "Pantalla LCD con píxeles muertos"
fecha_diagnostico: "2023-05-10 15:00:00"
code: "MTC-001"
description: "Se reemplazó pantalla LCD"
fecha_mantenimiento: "2023-05-11 10:00:00"
observacion: "Se probó equipo por 2 horas"
image: "evidencia_123abc.jpg"
cierre_id: 1
repuesto_pendiente: "no"
tipo_falla_id: 3
```

---

## 3. INFORMACIÓN RELACIONADA

### 3.1 Tabla de Codificación de Cierres

**Tabla: `codificacion_cierres`**

Esta tabla contiene los códigos y descripciones de los tipos de cierre para los correctivos.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | INT (Primary Key) | Identificador único |
| `code` | VARCHAR | Código del cierre (ej: "001", "002", etc.) |
| `name` | VARCHAR | Descripción del cierre (ej: "Reparado", "Pendiente", etc.) |

**Valores ejemplo:**
- id: 1, code: "001", name: "Reparado y entregado"
- id: 2, code: "002", name: "Pendiente de repuesto"
- id: 14, code: "014", name: "Abierto" (estado por defecto para nuevos correctivos)

### 3.2 Tabla de Avances/Notas del Correctivo

**Tabla: `avances_correctivos`**

Almacena las notas de seguimiento de cada correctivo general.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | INT (Primary Key) | Identificador único |
| `correctivo_general_id` | INT | Referencia al correctivo (FK a correctivos_generales) |
| `description` | TEXT | Descripción del avance o nota |
| `date` | DATETIME | Fecha y hora del avance |
| `usuario_id` | INT | Usuario que registró el avance (FK) |

**Uso:**
- Permite llevar un seguimiento detallado del correctivo
- Múltiples notas pueden estar asociadas a un mismo correctivo
- Se cuenta cuántas notas tiene cada correctivo
- Se muestra la última nota registrada

### 3.3 Tabla de Tipos de Fallas

**Tabla: `tipos_fallas`**

Catálogo de tipos de fallas que pueden presentar los equipos.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | INT (Primary Key) | Identificador único |
| `name` | VARCHAR | Nombre del tipo de falla |

**Ejemplos:**
- Falla eléctrica
- Falla mecánica
- Falla de software
- Desgaste normal

---

## 4. INFORMACIÓN MOSTRADA EN LA INTERFAZ

### 4.1 Columna: Información de la Orden de Trabajo

Esta columna muestra los datos del inicio del correctivo:

**Datos mostrados:**
1. **Número de orden**: Campo `code_orden`
   - Ejemplo: "ORD-2023-001"
   - Si es NULL o vacío: muestra "NO REGISTRA"

2. **Descripción**: Campo `orden` (limitado visualmente)
   - Texto descriptivo de la orden de trabajo
   - Ejemplo: "Equipo presenta error en pantalla"
   - Si es NULL o vacío: muestra "NO REGISTRA"

3. **Fecha de inicio**: Campo `fecha_inicio`
   - Formato: "YYYY-MM-DD HH:MM:SS"
   - Si es NULL o "0000-00-00 00:00:00": muestra "NO REGISTRA"

**Ejemplo visual:**
```
Número de orden: ORD-2023-001
┌───────────────────────────────────────┐
│ Descripción:                          │
│ Equipo presenta error en pantalla     │
│ ──────────────────────────────────    │
│ 2023-05-10 14:30:00                   │
└───────────────────────────────────────┘
```

### 4.2 Columna: Información de Cierre

Esta columna muestra el resultado y cierre del correctivo:

**Sección 1: Diagnóstico**
1. **Código del diagnóstico**: Campo `code_diagnostico`
   - Ejemplo: "DIAG-001"

2. **Descripción del diagnóstico**: Campo `diagnostico`
   - Ejemplo: "Pantalla LCD con píxeles muertos"

3. **Fecha del diagnóstico**: Campo `fecha_diagnostico`
   - Formato: "YYYY-MM-DD HH:MM:SS"

**Sección 2: Trabajo Realizado**
1. **Código del trabajo**: Campo `code`
   - Ejemplo: "MTC-001"

2. **Descripción del trabajo**: Campo `description`
   - Ejemplo: "Se reemplazó pantalla LCD"

3. **Fecha de ejecución**: Campo `fecha_mantenimiento`
   - Formato: "YYYY-MM-DD HH:MM:SS"

**Sección 3: Cierre**
1. **Código de cierre**: Campo `codigo_cierre` (de tabla codificacion_cierres)
   - Ejemplo: "001"

2. **Descripción del cierre**: Campo `descripcion_codigo`
   - Ejemplo: "Reparado y entregado"

**Sección 4: Notas de Avance**
1. **Cantidad de notas**: Campo calculado `notas_avance`
   - Muestra un badge con el número
   - Ejemplo: "3 notas"

2. **Última nota**: Campo calculado `last_description`
   - Muestra la descripción de la última nota registrada
   - Permite ver el estado más reciente

**Ejemplo visual:**
```
┌─────────────────────────────────────────┐
│ DIAGNÓSTICO                             │
│ Código: DIAG-001                        │
│ Pantalla LCD con píxeles muertos        │
│ Fecha: 2023-05-10 15:00:00             │
├─────────────────────────────────────────┤
│ TRABAJO REALIZADO                       │
│ Código: MTC-001                         │
│ Se reemplazó pantalla LCD               │
│ Fecha: 2023-05-11 10:00:00             │
├─────────────────────────────────────────┤
│ CIERRE                                  │
│ Código: 001                             │
│ Reparado y entregado                    │
├─────────────────────────────────────────┤
│ NOTAS: [3]                              │
│ Última: "Equipo probado exitosamente"  │
└─────────────────────────────────────────┘
```

### 4.3 Acciones Disponibles

En cada registro de correctivo se muestran botones de acción:

1. **Ver detalle**: Abre modal con toda la información del correctivo
2. **Editar**: Permite modificar la información del correctivo
3. **Eliminar**: Elimina el registro (con confirmación)
4. **Agregar nota**: Permite agregar una nota de avance

---

## 5. FLUJO DE DATOS COMPLETO

### 5.1 Cuando se abre el modal de edición del equipo

```
1. Usuario hace clic en "Editar" equipo
   ↓
2. Se abre el modal con toda la información del equipo
   ↓
3. El sistema ejecuta una función JavaScript:
   list_correctivos_generales2(equipo_id)
   ↓
4. Esta función hace una petición AJAX al servidor:
   URL: correctivo_general/Ccorrectivos_generales/get
   Parámetro: equipo_id = [ID del equipo]
   ↓
5. El servidor ejecuta la consulta SQL:
   - Consulta tabla correctivos_generales
   - Filtra por equipo_id
   - Hace JOIN con codificacion_cierres
   - Calcula cantidad de notas
   - Obtiene última nota
   - Ordena por fecha_inicio descendente
   ↓
6. El servidor devuelve JSON con los datos
   ↓
7. JavaScript procesa el JSON:
   - Itera cada correctivo
   - Valida campos NULL o vacíos
   - Genera HTML dinámicamente
   - Inserta en la tabla
   ↓
8. Se muestra la tabla con los correctivos en el modal
```

### 5.2 Consulta SQL ejecutada en el servidor

```sql
SELECT
    correctivos_generales.*,
    codificacion_cierres.name AS descripcion_codigo,
    codificacion_cierres.code AS codigo_cierre,

    -- Cuenta cuántas notas de avance tiene este correctivo
    (SELECT COUNT(*)
     FROM avances_correctivos
     WHERE avances_correctivos.correctivo_general_id = correctivos_generales.id) AS notas_avance,

    -- Obtiene la última nota registrada
    (SELECT description
     FROM avances_correctivos
     WHERE avances_correctivos.correctivo_general_id = correctivos_generales.id
     ORDER BY date DESC
     LIMIT 1) AS last_description

FROM correctivos_generales

-- Une con la tabla de cierres para obtener descripción
LEFT JOIN codificacion_cierres
    ON codificacion_cierres.id = correctivos_generales.cierre_id

-- Filtra solo los correctivos de este equipo
WHERE correctivos_generales.equipo_id = 200

-- Ordena del más reciente al más antiguo
ORDER BY correctivos_generales.fecha_inicio DESC;
```

### 5.3 Ejemplo de respuesta JSON

```json
[
    {
        "id": 1,
        "equipo_id": 200,
        "code_orden": "ORD-2023-001",
        "orden": "Equipo presenta error en pantalla",
        "fecha_inicio": "2023-05-10 14:30:00",
        "code_diagnostico": "DIAG-001",
        "diagnostico": "Pantalla LCD con píxeles muertos",
        "fecha_diagnostico": "2023-05-10 15:00:00",
        "code": "MTC-001",
        "description": "Se reemplazó pantalla LCD",
        "fecha_mantenimiento": "2023-05-11 10:00:00",
        "observacion": "Se probó equipo por 2 horas",
        "image": "evidencia_123abc.jpg",
        "cierre_id": 1,
        "repuesto_pendiente": "no",
        "descripcion_codigo": "Reparado y entregado",
        "codigo_cierre": "001",
        "notas_avance": 3,
        "last_description": "Equipo probado exitosamente"
    },
    {
        "id": 2,
        "equipo_id": 200,
        "code_orden": "ORD-2023-015",
        "orden": "No enciende",
        "fecha_inicio": "2023-04-15 09:00:00",
        ...
    }
]
```

---

## 6. DIFERENCIA CON "CORRECTIVOS TICKETS"

En el mismo modal existe otra sección llamada "**CORRECTIVOS TICKETS**". Es importante entender la diferencia:

### 6.1 Correctivos Tickets
- Provienen del sistema de tickets/órdenes de trabajo
- Están vinculados a órdenes formales del sistema
- Tienen un flujo de aprobación y seguimiento más formal
- Tabla origen: `ordenes` (sistema de tickets)

### 6.2 Otros Correctivos (correctivos_generales)
- Son correctivos registrados de forma independiente
- No requieren pasar por el sistema de tickets
- Más ágiles para registrar trabajos menores
- Tabla origen: `correctivos_generales`

**Ambas secciones se muestran en el modal del equipo** para dar una visión completa del historial de mantenimientos correctivos.

---

## 7. CASOS DE USO

### 7.1 ¿Cuándo se usa "Otros Correctivos"?

1. **Mantenimientos correctivos menores** que no justifican crear un ticket formal
2. **Trabajos realizados por personal externo** sin acceso al sistema de tickets
3. **Registro retroactivo** de trabajos ya realizados
4. **Ajustes y calibraciones** que no son preventivos pero tampoco tickets formales

### 7.2 Información que debe registrarse

**Mínimo requerido:**
- Número de orden (identificador interno)
- Descripción de la orden
- Fecha de inicio

**Recomendado:**
- Diagnóstico realizado
- Trabajo ejecutado
- Fechas de diagnóstico y ejecución
- Tipo de cierre
- Observaciones

**Opcional:**
- Imagen/evidencia
- Repuesto pendiente
- Tipo de falla
- Notas de seguimiento

---

## 8. VALIDACIONES Y REGLAS

### 8.1 Campos NULL o Vacíos

El sistema valida y reemplaza valores NULL o vacíos con "NO REGISTRA":
- Si `code_orden` es NULL → muestra "NO REGISTRA"
- Si `orden` es NULL → muestra "NO REGISTRA"
- Si `fecha_inicio` es NULL o "0000-00-00 00:00:00" → muestra "NO REGISTRA"
- Similar para diagnóstico, trabajo realizado, etc.

### 8.2 Estado por Defecto

Cuando se crea un nuevo correctivo general:
- `cierre_id` se establece en 14 (estado "Abierto")
- Esto indica que el correctivo está en proceso
- Al finalizar, se cambia a otro código de cierre

### 8.3 Repuestos Pendientes

Si durante el correctivo se identifica necesidad de repuesto:
- Se marca `repuesto_pendiente` = "si"
- Se relaciona con `repuesto_id`
- El equipo se marca con indicador de repuesto pendiente
- Se puede enviar notificación por email

---

## 9. RESUMEN DE TABLAS Y RELACIONES

### Tablas involucradas:

```
correctivos_generales (Principal)
    ├── equipo_id → equipos.id
    ├── cierre_id → codificacion_cierres.id
    ├── tipo_falla_id → tipos_fallas.id
    └── repuesto_id → repuestos.id

avances_correctivos (Notas de seguimiento)
    └── correctivo_general_id → correctivos_generales.id

codificacion_cierres (Tipos de cierre)
    └── Relación inversa desde correctivos_generales

tipos_fallas (Catálogo de fallas)
    └── Relación inversa desde correctivos_generales
```

### Consulta con todas las relaciones:

```sql
SELECT
    cg.*,
    cc.name AS descripcion_codigo,
    cc.code AS codigo_cierre,
    tf.name AS tipo_falla,
    (SELECT COUNT(*) FROM avances_correctivos ac
     WHERE ac.correctivo_general_id = cg.id) AS notas_avance,
    (SELECT description FROM avances_correctivos ac
     WHERE ac.correctivo_general_id = cg.id
     ORDER BY date DESC LIMIT 1) AS last_description
FROM correctivos_generales cg
LEFT JOIN codificacion_cierres cc ON cc.id = cg.cierre_id
LEFT JOIN tipos_fallas tf ON tf.id = cg.tipo_falla_id
WHERE cg.equipo_id = [ID_EQUIPO]
ORDER BY cg.fecha_inicio DESC;
```

---

## CONCLUSIÓN

La sección "Otros Correctivos" en el modal de edición del equipo muestra todos los mantenimientos correctivos no vinculados a tickets formales, obtenidos desde la tabla `correctivos_generales`.

**Características principales:**
- Consulta por `equipo_id` específico
- Muestra información completa del trabajo (orden, diagnóstico, ejecución, cierre)
- Incluye notas de seguimiento y última actualización
- Ordenados cronológicamente del más reciente al más antiguo
- Permite gestión completa (ver, editar, eliminar, agregar notas)

Este sistema proporciona un registro completo y flexible de todos los trabajos correctivos realizados en cada equipo, complementando el sistema formal de tickets con registros más ágiles e independientes.
