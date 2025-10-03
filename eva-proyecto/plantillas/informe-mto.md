El usuario accede a la URL y el sistema verifica permisos de acceso

Se carga la interfaz principal con dos secciones principales:

Formulario de carga masiva (parte superior)

Tabla de consulta de planes (parte inferior)

2. Sección de Carga Masiva de Cronograma
Formulario de importación:

Año del cronograma: Selección obligatoria (2019-2023)

Reemplazar información: Opción "sí" o "no"

"Sí": Elimina todos los registros del año seleccionado y los reemplaza

"No": Mantiene registros existentes y solo agrega nuevos

Archivo Excel: Carga obligatoria del cronograma

3. Estructura del Archivo Excel que se Sube
Formato requerido (sin encabezados):

Columna A: ID del equipo (identificador único en la base de datos)

Columna B: Mes 1 (número del mes 1-12)

Columna C: Mes 2 (número del mes 1-12 o vacío)

Columna D: Mes 3 (número del mes 1-12 o vacío)

Columna E: Responsable del mantenimiento (texto)

Columna F: Frecuencia de mantenimiento (ANUAL, SEMESTRAL, etc.)

4. Proceso de Carga del Archivo
Validaciones y procesamiento:

El sistema lee el archivo Excel fila por fila (desde la fila 2)

Para cada equipo, elimina registros anteriores del mismo año si existen

Inserta el nuevo registro con los datos del Excel

Actualiza automáticamente el estado de mantenimiento de todos los equipos

Registra el usuario que realizó la carga

Lo que pasa internamente:

Se utiliza la librería PHPExcel para leer el archivo

Los datos se insertan en la tabla planes_mantenimientos

Se ejecuta updateEstadomAutomatico() para recalcular estados

5. Visualización de Planes Existentes
Tabla principal muestra:

ID del equipo

Información del equipo (nombre, código, serie, marca, modelo)

Responsable del mantenimiento

Rangos programados: Fechas calculadas para cada mes programado

Cantidad de preventivos ejecutados vs programados

Porcentaje de cumplimiento global

6. Funcionalidades de la Tabla
Filtros y controles:

Selector de año: Filtra los planes por año específico

Paginación: Manejo de grandes volúmenes de datos

Búsqueda: Filtrado en tiempo real

Exportación: Descarga del consolidado completo en Excel

7. Edición Individual de Planes
Modal de edición permite modificar:

Mes 1, Mes 2, Mes 3 (números de meses)

Responsable del mantenimiento (lista desplegable)

Control de cambios:

Cada modificación se registra automáticamente

Se guarda qué cambió, quién lo cambió y cuándo

Se puede consultar el historial de cambios por plan

8. Exportaciones Disponibles
Plantilla de importación:

Descarga archivo Excel con el formato correcto

Ubicado en: assets/Plantilla importacion cronograma.xlsx

Consolidado completo:

Exporta todos los planes con información detallada

Incluye datos del equipo, fechas programadas, cumplimiento, etc.

9. Cálculos Automáticos
El sistema calcula automáticamente:

Rangos de fechas: Primer y último día de cada mes programado

Preventivos ejecutados: Cuenta real de mantenimientos realizados

Preventivos programados: Basado en la frecuencia configurada

Cumplimiento global: Porcentaje de ejecución vs programación

10. Integración con el Sistema
Impacto en otros módulos:

Los planes alimentan el cronograma de mantenimientos

Se relacionan con los preventivos ejecutados

Afectan el cálculo de indicadores de gestión

Determinan alertas y notificaciones del sistema