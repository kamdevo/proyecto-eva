# Reporte de Exportaciones - Mantenimiento Preventivo

## 1. Botón "Exportar Plantilla"

### Qué Exporta
Descarga un archivo Excel vacío con el formato exacto para cargar cronogramas de mantenimiento al sistema.

### Contenido del Archivo

#### 6 Columnas Principales:

| Columna A | Columna B | Columna C | Columna D | Columna E | Columna F |
|-----------|-----------|-----------|-----------|-----------|-----------|
| **Id equipo** | **Mes1** | **Mes2** | **Mes3** | **Responsable** | **Frecuencia de mantenimiento** |

#### Datos que Contiene Cada Columna

**Columna A - Id equipo:**
- Número del equipo en el sistema
- Ejemplo: 200, 320, 450
- **Tabla relacionada**: `equipos.id`

**Columna B - Mes1:**
- Primer mes para mantenimiento (1-12)
- Ejemplo: 1 (Enero), 6 (Junio)
- **Tabla relacionada**: `planes_mantenimientos.mes1`

**Columna C - Mes2:**
- Segundo mes para mantenimiento (1-12)
- Ejemplo: 7 (Julio), 8 (Agosto)
- **Tabla relacionada**: `planes_mantenimientos.mes2`

**Columna D - Mes3:**
- Tercer mes para mantenimiento (1-12)
- Ejemplo: 9 (Septiembre), 10 (Octubre)
- **Tabla relacionada**: `planes_mantenimientos.mes3`

**Columna E - Responsable:**
- Nombre del proveedor de mantenimiento
- Ejemplo: "SYSMED", "BIOMEDI"
- **Tabla relacionada**: `planes_mantenimientos.responsable`

**Columna F - Frecuencia:**
- Cada cuánto se hace el mantenimiento
- Opciones: "ANUAL", "SEMESTRAL", "CUATRIMESTRAL", "TRIMESTRAL"
- **Tabla relacionada**: `planes_mantenimientos.frecuencia`

## 2. Botón "Exportar Consolidado"

### Qué Exporta
Genera un reporte completo en Excel con toda la información detallada de los cronogramas de mantenimiento.

### Contenido del Reporte (32 Columnas)

#### Información de Control:
1. **Fecha de creación del registro** - `planes_mantenimientos.created_at`
2. **Usuario responsable** - `usuarios.nombre + apellido + username`
3. **Fecha de la ultima actualización** - `cambios_cronograma.created_at`
4. **Ultima edición realizada** - `cambios_cronograma.cambio`
5. **Responsable de la edición** - `usuarios.nombre + apellido + username` (editor)

#### Información del Equipo:
6. **Equipo Id** - `equipos.id`
7. **Nombre** - `equipos.name`
8. **Marca** - `equipos.marca`
9. **Modelo** - `equipos.modelo`
10. **Serie** - `equipos.serial`
11. **Codigo** - `equipos.code`
12. **Servicio** - `servicios.name`
13. **Area** - `areas.name`
14. **Sede** - `sedes.name`
15. **Propiedad** - `equipos.propiedad`

#### Información de Planificación:
16. **Año vigencia mantenimiento** - `planes_mantenimientos.anio`
17. **Frecuencia de mantenimiento** - `frecuenciam.name`
18. **Mes1** - `planes_mantenimientos.mes1`
19. **Mes2** - `planes_mantenimientos.mes2`
20. **Mes3** - `planes_mantenimientos.mes3`
21. **Responsable del mantenimiento** - `planes_mantenimientos.responsable`
22. **Cantidad de preventivos realizados en el año** - COUNT de `mantenimiento`

#### Información de Mantenimientos Ejecutados:
23. **Soporte primer visita** - `mantenimiento.description + proveedor_mantenimiento.name`
24. **Fecha primer visita** - `mantenimiento.fecha_mantenimiento`
25. **Soporte segunda visita** - `mantenimiento.description + proveedor_mantenimiento.name`
26. **Fecha segunda visita** - `mantenimiento.fecha_mantenimiento`
27. **Soporte tercer visita** - `mantenimiento.description + proveedor_mantenimiento.name`
28. **Fecha tercer visita** - `mantenimiento.fecha_mantenimiento`
29. **Soporte cuarta visita** - `mantenimiento.description + proveedor_mantenimiento.name`
30. **Fecha cuarta visita** - `mantenimiento.fecha_mantenimiento`

#### Estados:
31. **Estado del equipo** - `estadoequipos.name`
32. **Estado del mantenimiento** - `estadosm.name`
