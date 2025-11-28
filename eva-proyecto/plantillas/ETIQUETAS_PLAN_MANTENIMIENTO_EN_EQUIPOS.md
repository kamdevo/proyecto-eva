# Etiquetas del Plan de Mantenimiento en el Módulo de Equipos

## Descripción General

En el módulo de equipos, específicamente en la columna "Plan Ejecutado" de la tabla de equipos, se muestran dos etiquetas importantes que provienen del cronograma de mantenimiento:

1. **Inclusión en el plan de mantenimiento**: Indica si el equipo está o no incluido en el plan del año vigente
2. **Frecuencia del plan de mantenimiento**: Muestra la frecuencia programada (ANUAL, SEMESTRAL, TRIMESTRAL, etc.)

Este documento explica de dónde se obtiene esta información y qué cálculos se realizan.

---

## 1. AÑO VIGENTE DEL PLAN

### 1.1 Tabla de Vigencias

El sistema utiliza una tabla especial para almacenar el año vigente del plan de mantenimiento:

**Tabla: `vigencias_mantenimiento`**

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | INT (Primary Key, Auto Increment) | Identificador único |
| `anio` | INT | Año vigente del plan de mantenimiento |

**Propósito:**
Esta tabla contiene un único registro (o el registro más reciente) que indica cuál es el año activo para el plan de mantenimiento. Por ejemplo, si el valor es 2022, todas las consultas buscarán información del cronograma del año 2022.

**Consulta base:**
```sql
SELECT anio FROM vigencias_mantenimiento;
-- Resultado: 2022
```

**Nota importante:**
Este año vigente se utiliza en todas las subconsultas para obtener la información actual del plan de cada equipo.

---

## 2. INCLUSIÓN EN EL PLAN DE MANTENIMIENTO

### 2.1 Cómo se determina

La inclusión de un equipo en el plan de mantenimiento se determina mediante una consulta de conteo:

```sql
SELECT COUNT(*)
FROM planes_mantenimientos
WHERE equipo_id = [ID_DEL_EQUIPO]
AND anio = (SELECT anio FROM vigencias_mantenimiento);
```

### 2.2 Interpretación del resultado

- **Si COUNT = 0**: El equipo **NO está incluido** en el plan del año vigente
- **Si COUNT > 0** (normalmente 1): El equipo **SÍ está incluido** en el plan del año vigente

### 2.3 Visualización en la interfaz

En la tabla de equipos, esta información se muestra típicamente como:

- Etiqueta verde: "Incluido en plan 2022"
- Etiqueta roja: "No incluido en plan"
- Ícono o badge: ✓ (check) o ✗ (cruz)

### 2.4 Consulta completa en contexto

Cuando se consulta la lista de equipos, se agrega este campo calculado:

```sql
SELECT
    equipos.*,
    (SELECT COUNT(*)
     FROM planes_mantenimientos
     WHERE equipo_id = equipos.id
     AND anio = (SELECT anio FROM vigencias_mantenimiento)) AS cuenta_planes_mantenimientos
FROM equipos;
```

Luego, en la lógica de presentación:
- Si `cuenta_planes_mantenimientos` > 0 → Mostrar "Incluido"
- Si `cuenta_planes_mantenimientos` = 0 → Mostrar "No incluido"

---

## 3. FRECUENCIA DEL PLAN DE MANTENIMIENTO

### 3.1 Cómo se obtiene

La frecuencia del plan se obtiene mediante una subconsulta que hace JOIN con la tabla de frecuencias:

```sql
SELECT fm.name
FROM planes_mantenimientos pm
LEFT JOIN frecuenciam fm ON fm.id = pm.frecuencia_id
WHERE pm.equipo_id = [ID_DEL_EQUIPO]
AND pm.anio = (SELECT anio FROM vigencias_mantenimiento);
```

### 3.2 Desglose de la consulta

**Paso 1:** Buscar el registro del cronograma para el equipo en el año vigente
```sql
FROM planes_mantenimientos pm
WHERE pm.equipo_id = [ID_DEL_EQUIPO]
AND pm.anio = (SELECT anio FROM vigencias_mantenimiento)
```

**Paso 2:** Relacionar con la tabla de frecuencias
```sql
LEFT JOIN frecuenciam fm ON fm.id = pm.frecuencia_id
```

**Paso 3:** Obtener el nombre de la frecuencia
```sql
SELECT fm.name
```

### 3.3 Valores posibles

La tabla `frecuenciam` (catálogo de frecuencias) contiene valores como:

| id | name |
|----|------|
| 1 | ANUAL |
| 2 | SEMESTRAL |
| 3 | TRIMESTRAL |
| 4 | CUATRIMESTRAL |
| 5 | BIMESTRAL |
| 6 | MENSUAL |
| 7 | QUINCENAL |
| 8 | SEMANAL |

### 3.4 Visualización en la interfaz

En la tabla de equipos, esta información se muestra como:

- Badge o etiqueta: "SEMESTRAL"
- Tooltip: "Frecuencia: ANUAL"
- Color diferenciado según frecuencia

### 3.5 Consulta completa en contexto

```sql
SELECT
    equipos.*,
    (SELECT fm.name
     FROM planes_mantenimientos pm
     LEFT JOIN frecuenciam fm ON fm.id = pm.frecuencia_id
     WHERE pm.equipo_id = equipos.id
     AND pm.anio = (SELECT anio FROM vigencias_mantenimiento)) AS frecuencia_cronograma
FROM equipos;
```

### 3.6 Caso especial: Equipo no incluido

Si el equipo NO está en el plan del año vigente, la subconsulta devuelve **NULL**, y en la interfaz se muestra:
- "N/A" o "-"
- "Sin plan asignado"
- Campo vacío

---

## 4. INFORMACIÓN ADICIONAL RELACIONADA

Además de la inclusión y frecuencia, se obtienen otros datos del plan:

### 4.1 Meses programados

**Mes 1:**
```sql
SELECT pm.mes1
FROM planes_mantenimientos pm
WHERE pm.equipo_id = [ID_DEL_EQUIPO]
AND pm.anio = (SELECT anio FROM vigencias_mantenimiento);
```

**Mes 2:**
```sql
SELECT pm.mes2
FROM planes_mantenimientos pm
WHERE pm.equipo_id = [ID_DEL_EQUIPO]
AND pm.anio = (SELECT anio FROM vigencias_mantenimiento);
```

**Mes 3:**
```sql
SELECT pm.mes3
FROM planes_mantenimientos pm
WHERE pm.equipo_id = [ID_DEL_EQUIPO]
AND pm.anio = (SELECT anio FROM vigencias_mantenimiento);
```

### 4.2 Responsable del mantenimiento

```sql
SELECT pm.responsable
FROM planes_mantenimientos pm
WHERE pm.equipo_id = [ID_DEL_EQUIPO]
AND pm.anio = (SELECT anio FROM vigencias_mantenimiento)
ORDER BY pm.anio DESC
LIMIT 1;
```

### 4.3 Uso en la tabla de equipos

Estos campos adicionales pueden mostrarse en:
- Tooltips al pasar el mouse sobre la etiqueta
- Modal de detalle del equipo
- Columnas expandibles de la tabla
- Sección de "Información del plan"

---

## 5. FLUJO COMPLETO DE CONSULTA

### 5.1 Cuando se carga la tabla de equipos

```sql
SELECT
    -- Información básica del equipo
    equipos.id,
    equipos.name,
    equipos.code,
    equipos.serial,
    equipos.marca,
    equipos.modelo,

    -- ETIQUETA 1: Inclusión en el plan
    (SELECT COUNT(*)
     FROM planes_mantenimientos
     WHERE equipo_id = equipos.id
     AND anio = (SELECT anio FROM vigencias_mantenimiento)) AS incluido_en_plan,

    -- ETIQUETA 2: Frecuencia del plan
    (SELECT fm.name
     FROM planes_mantenimientos pm
     LEFT JOIN frecuenciam fm ON fm.id = pm.frecuencia_id
     WHERE pm.equipo_id = equipos.id
     AND pm.anio = (SELECT anio FROM vigencias_mantenimiento)) AS frecuencia_plan,

    -- Información adicional
    (SELECT pm.mes1
     FROM planes_mantenimientos pm
     WHERE pm.equipo_id = equipos.id
     AND pm.anio = (SELECT anio FROM vigencias_mantenimiento)) AS mes_programado1,

    (SELECT pm.mes2
     FROM planes_mantenimientos pm
     WHERE pm.equipo_id = equipos.id
     AND pm.anio = (SELECT anio FROM vigencias_mantenimiento)) AS mes_programado2,

    (SELECT pm.responsable
     FROM planes_mantenimientos pm
     WHERE pm.equipo_id = equipos.id
     AND pm.anio = (SELECT anio FROM vigencias_mantenimiento)) AS responsable_plan

FROM equipos
LEFT JOIN servicios ON servicios.id = equipos.servicio_id
LEFT JOIN areas ON areas.id = equipos.area_id
WHERE equipos.status = 1;
```

### 5.2 Procesamiento en la lógica de presentación

Para cada equipo en el resultado:

```
SI incluido_en_plan > 0 ENTONCES:
    Mostrar etiqueta verde: "✓ En plan [año vigente]"
    Mostrar frecuencia: "Frecuencia: [frecuencia_plan]"
    Mostrar meses: "Programado: [mes1], [mes2], [mes3]"
    Mostrar responsable: "Responsable: [responsable_plan]"
SINO:
    Mostrar etiqueta roja: "✗ No incluido en plan"
    No mostrar frecuencia ni meses
    Mensaje: "Este equipo no está en el cronograma del año [año vigente]"
FIN SI
```

---

## 6. CASOS ESPECIALES Y CONSIDERACIONES

### 6.1 Cambio de año vigente

Cuando se actualiza el año vigente en la tabla `vigencias_mantenimiento`:

1. Se actualiza el registro:
   ```sql
   UPDATE vigencias_mantenimiento SET anio = 2023;
   ```

2. Automáticamente todas las consultas empiezan a usar el nuevo año:
   - Las etiquetas se recalculan
   - Algunos equipos pueden pasar de "incluido" a "no incluido" o viceversa
   - Las frecuencias y meses se actualizan al plan del nuevo año

### 6.2 Equipo con múltiples registros en el mismo año

Aunque no debería ocurrir (hay validaciones), si existieran múltiples registros del mismo equipo para el año vigente:

- El COUNT seguirá siendo > 0, por lo que se mostrará como "incluido"
- La subconsulta de frecuencia tomará uno de los registros (normalmente el primero)
- Se recomienda usar `LIMIT 1` en las subconsultas para evitar errores

### 6.3 Performance

**Optimización:** Dado que estas son subconsultas correlacionadas (se ejecutan por cada fila), es recomendable:

1. Crear índices en:
   ```sql
   CREATE INDEX idx_planes_equipo_anio
   ON planes_mantenimientos(equipo_id, anio);
   ```

2. Si la tabla de equipos es muy grande, considerar:
   - Paginación del lado del servidor
   - Caché de consultas
   - Materialización de vistas (tabla temporal con resultados precalculados)

### 6.4 Visualización alternativa con JOIN

En lugar de subconsultas, se puede usar LEFT JOIN para mejor performance:

```sql
SELECT
    equipos.*,
    IF(pm.id IS NOT NULL, 1, 0) AS incluido_en_plan,
    fm.name AS frecuencia_plan,
    pm.mes1 AS mes_programado1,
    pm.mes2 AS mes_programado2,
    pm.responsable AS responsable_plan
FROM equipos
LEFT JOIN planes_mantenimientos pm
    ON pm.equipo_id = equipos.id
    AND pm.anio = (SELECT anio FROM vigencias_mantenimiento)
LEFT JOIN frecuenciam fm
    ON fm.id = pm.frecuencia_id
WHERE equipos.status = 1;
```

Ventajas:
- Más eficiente para grandes volúmenes
- Una sola consulta en lugar de múltiples subconsultas
- Más fácil de optimizar con índices

---

## 7. RESUMEN DE TABLAS Y CAMPOS UTILIZADOS

### Tablas involucradas:

1. **`equipos`**: Tabla principal de equipos
   - `id`: Identificador del equipo

2. **`vigencias_mantenimiento`**: Año vigente del plan
   - `anio`: Año activo (ej: 2022)

3. **`planes_mantenimientos`**: Cronograma de mantenimiento
   - `equipo_id`: Referencia al equipo
   - `anio`: Año del plan
   - `frecuencia_id`: Referencia a la frecuencia
   - `mes1`, `mes2`, `mes3`: Meses programados
   - `responsable`: Responsable del mantenimiento

4. **`frecuenciam`**: Catálogo de frecuencias
   - `id`: Identificador de frecuencia
   - `name`: Nombre (ANUAL, SEMESTRAL, etc.)

### Relaciones:

```
equipos.id ←→ planes_mantenimientos.equipo_id
planes_mantenimientos.frecuencia_id ←→ frecuenciam.id
vigencias_mantenimiento.anio = planes_mantenimientos.anio (criterio de filtro)
```

---

## 8. EJEMPLO PRÁCTICO COMPLETO

### Datos de ejemplo:

**Tabla `vigencias_mantenimiento`:**
| id | anio |
|----|------|
| 1  | 2022 |

**Tabla `equipos`:**
| id  | name              | code    |
|-----|-------------------|---------|
| 100 | Monitor Signos    | MON-001 |
| 200 | Ventilador Mecánico | VEN-002 |
| 300 | Bomba Infusión    | BOM-003 |

**Tabla `planes_mantenimientos`:**
| id | equipo_id | anio | mes1 | mes2 | mes3 | frecuencia_id | responsable |
|----|-----------|------|------|------|------|---------------|-------------|
| 1  | 100       | 2022 | 3    | 9    | NULL | 2             | SYSMED      |
| 2  | 200       | 2022 | 6    | NULL | NULL | 1             | TECNOLOGO   |

**Tabla `frecuenciam`:**
| id | name       |
|----|------------|
| 1  | ANUAL      |
| 2  | SEMESTRAL  |

### Consulta ejecutada:

```sql
SELECT
    e.id,
    e.name,
    e.code,
    (SELECT COUNT(*)
     FROM planes_mantenimientos
     WHERE equipo_id = e.id
     AND anio = (SELECT anio FROM vigencias_mantenimiento)) AS incluido_en_plan,
    (SELECT fm.name
     FROM planes_mantenimientos pm
     LEFT JOIN frecuenciam fm ON fm.id = pm.frecuencia_id
     WHERE pm.equipo_id = e.id
     AND pm.anio = (SELECT anio FROM vigencias_mantenimiento)) AS frecuencia_plan
FROM equipos e;
```

### Resultado:

| id  | name              | code    | incluido_en_plan | frecuencia_plan |
|-----|-------------------|---------|------------------|-----------------|
| 100 | Monitor Signos    | MON-001 | 1                | SEMESTRAL       |
| 200 | Ventilador Mecánico | VEN-002 | 1              | ANUAL           |
| 300 | Bomba Infusión    | BOM-003 | 0                | NULL            |

### Visualización en la interfaz:

**Equipo 100 (Monitor Signos):**
- Etiqueta: ✓ Incluido en plan 2022
- Frecuencia: SEMESTRAL
- Meses: Marzo, Septiembre

**Equipo 200 (Ventilador Mecánico):**
- Etiqueta: ✓ Incluido en plan 2022
- Frecuencia: ANUAL
- Meses: Junio

**Equipo 300 (Bomba Infusión):**
- Etiqueta: ✗ No incluido en plan 2022
- Frecuencia: -
- Meses: -

---

## CONCLUSIÓN

Las etiquetas de inclusión y frecuencia del plan de mantenimiento en el módulo de equipos se calculan dinámicamente mediante subconsultas que:

1. Consultan el año vigente desde la tabla `vigencias_mantenimiento`
2. Buscan si existe un registro del equipo en `planes_mantenimientos` para ese año
3. Obtienen la frecuencia mediante JOIN con la tabla `frecuenciam`
4. Presentan la información de forma visual mediante etiquetas, badges o indicadores

Este enfoque permite que la información se actualice automáticamente cuando se carga un nuevo cronograma o se cambia el año vigente, manteniendo siempre sincronizada la información mostrada en el módulo de equipos con el plan de mantenimiento actual.
