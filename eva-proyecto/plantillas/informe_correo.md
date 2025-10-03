Configuración del servidor de correo:

Servidor SMTP: Gmail (ssl://smtp.googlemail.com:465)

Cuenta: mailto:evagestionahuv@gmail.com

Formato: HTML con plantillas personalizadas

Tipos de notificaciones automáticas:

A. Preventivos con Repuestos Pendientes
Cuándo se envía: Al registrar un preventivo con repuesto pendiente

Destinatarios: Usuarios del servicio donde está ubicado el equipo

Contenido:

Número del preventivo

Código del preventivo y fecha de ejecución

Información completa del equipo (ID, nombre, marca, modelo, serie)

Ubicación (servicio y área)

Descripción del repuesto faltante

Observaciones del mantenimiento

B. Creación de Tickets/Órdenes de Trabajo
Cuándo se envía: Al crear una nueva orden de trabajo

Destinatarios: Técnicos asignados y supervisores

Contenido:

Número del ticket

Asunto y descripción del problema

Información del equipo afectado

Ubicación del equipo

Prioridad asignada

Datos del solicitante

C. Actualizaciones de Órdenes
Cuándo se envía: Al cambiar estado, asignar técnico, agregar diagnóstico

Tipos: Email de asignación, diagnóstico, solicitud de cierre, cierre total

D. Observaciones de Equipos
Cuándo se envía: Al agregar observaciones importantes a equipos

Destinatarios: Responsables del área

2. Alertas Visuales en el Sistema
A. Alertas de Garantías
Garantías Próximas a Vencer:

Modal emergente: "Equipos próximos a perder garantía"

Se activa automáticamente al detectar equipos con garantía por vencer

Muestra listado completo de equipos afectados

Garantías Vencidas:

Modal emergente: "Equipos que terminaron recientemente su período de garantía"

Notifica equipos con garantía recién vencida

Permite tomar acciones correctivas

B. Indicadores Visuales en Interfaces
Estados de Equipos:

Repuestos Pendientes: Iconos rojos (RP) en listados

Estados de Mantenimiento: Colores diferenciados según estado

Cumplimiento de Planes: Porcentajes y alertas de incumplimiento

3. Alertas de Gestión de Mantenimiento
A. Alertas de Cronograma
Mantenimientos Vencidos: Equipos que no han recibido mantenimiento en fechas programadas

Cumplimiento Bajo: Alertas cuando el porcentaje de cumplimiento es inferior al esperado

Frecuencias No Cumplidas: Equipos que no cumplen con la periodicidad establecida

B. Notificaciones de Cambios
Control de Cambios: Registro automático de modificaciones en planes

Historial de Cambios: Trazabilidad completa de quién, qué y cuándo se modificó

4. Sistema de Destinatarios Inteligente
Lógica de envío:

Por Servicio: Los correos se envían a usuarios asociados al servicio donde está el equipo

Por Zona: Sistema de zonas que agrupa servicios y usuarios

Múltiples Destinatarios: Manejo automático de listas de correo

Validación: Solo envía si hay destinatarios válidos configurados

5. Alertas de Estado de Equipos
A. Estados Críticos
Fuera de Servicio: Alertas inmediatas

En Reparación: Seguimiento de tiempos

Repuestos Pendientes: Notificaciones continuas hasta resolución

B. Alertas de Calibración
Calibraciones Vencidas: Equipos que requieren recalibración

Próximas Calibraciones: Recordatorios preventivos

6. Configuración de Alertas
Personalización por Usuario:

Permisos específicos determinan qué alertas recibe cada usuario

Configuración por módulos (equipos, preventivos, correctivos, etc.)

Niveles de acceso que filtran información sensible

Frecuencia y Timing:

Inmediatas: Para eventos críticos (fallas, repuestos pendientes)

Diarias: Resúmenes de actividades

Semanales/Mensuales: Reportes de cumplimiento

7. Integración con Planes de Mantenimiento
Alertas Proactivas:

Mantenimientos Próximos: Recordatorios antes de fechas programadas

Recursos Necesarios: Alertas sobre disponibilidad de técnicos y repuestos

Planificación: Notificaciones para coordinación de actividades