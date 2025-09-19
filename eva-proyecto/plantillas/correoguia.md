# Sistema de Notificaciones y Recordatorios por Correo - EVA

## Descripción General
El sistema de notificaciones y recordatorios por correo electrónico del sistema EVA permite enviar alertas automáticas y recordatorios sobre mantenimientos preventivos, calibraciones, contingencias y otros eventos importantes del sistema.

## Tipos de Notificaciones

### 1. Notificaciones de Mantenimiento Preventivo
- **Recordatorio de mantenimiento próximo** (7, 3 y 1 día antes)
- **Mantenimiento vencido** (diario hasta completar)
- **Mantenimiento programado** (confirmación de programación)
- **Mantenimiento completado** (confirmación de finalización)
- **Cambios en cronograma** (modificaciones de fechas)

### 2. Notificaciones de Calibración
- **Calibración próxima a vencer** (30, 15, 7 días antes)
- **Calibración vencida** (diario hasta renovar)
- **Calibración completada** (confirmación de realización)

### 3. Notificaciones de Contingencias
- **Nueva contingencia registrada** (inmediato)
- **Contingencia crítica** (inmediato + escalamiento)
- **Actualización de estado** (cambios de estado)
- **Contingencia resuelta** (confirmación de cierre)

### 4. Notificaciones de Equipos
- **Cambio de estado de equipo** (activo, mantenimiento, baja)
- **Equipo dado de baja** (confirmación de baja)
- **Equipo reactivado** (confirmación de reactivación)

### 5. Notificaciones Administrativas
- **Exportación completada** (archivos listos para descarga)
- **Respaldo de datos** (confirmación de respaldos)
- **Actualizaciones del sistema** (nuevas funcionalidades)

## Configuración de Destinatarios

### Roles y Permisos
- **Super Administrador**: Todas las notificaciones
- **Administrador**: Notificaciones de su área/sede
- **Técnico**: Mantenimientos asignados
- **Supervisor**: Equipos bajo su responsabilidad
- **Usuario**: Equipos que utiliza

### Personalización por Usuario
- **Frecuencia de recordatorios**: Diario, semanal, mensual
- **Tipos de notificación**: Selección de categorías
- **Horario de envío**: Configuración de horarios preferidos
- **Formato**: HTML, texto plano

## Plantillas de Correo

### Estructura Base
- **Encabezado**: Logo EVA + información de la institución
- **Saludo personalizado**: Nombre del destinatario
- **Contenido principal**: Información específica del evento
- **Acciones**: Botones para acceder al sistema
- **Pie de página**: Información de contacto + enlace de desuscripción

### Variables Dinámicas
- `{usuario_nombre}`: Nombre completo del usuario
- `{equipo_nombre}`: Nombre del equipo
- `{equipo_codigo}`: Código del equipo
- `{fecha_programada}`: Fecha programada del evento
- `{dias_restantes}`: Días restantes hasta el evento
- `{responsable}`: Responsable asignado
- `{servicio}`: Servicio/área del equipo
- `{sede}`: Sede donde se encuentra el equipo

## Configuración de Envío

### Horarios Programados
- **Recordatorios diarios**: 8:00 AM
- **Recordatorios semanales**: Lunes 8:00 AM
- **Recordatorios mensuales**: Primer día del mes 8:00 AM
- **Notificaciones inmediatas**: En tiempo real

### Configuración SMTP
- **Servidor**: Configurable por variables de entorno
- **Puerto**: 587 (TLS) / 465 (SSL)
- **Autenticación**: Usuario y contraseña
- **Encriptación**: TLS/SSL
- **Límite de envío**: 100 correos por hora (configurable)

## Funcionalidades del Sistema

### Gestión de Suscripciones
- **Suscripción automática**: Nuevos usuarios suscritos por defecto
- **Gestión de preferencias**: Panel de usuario para configurar notificaciones
- **Desuscripción**: Enlace en cada correo para desuscribirse
- **Reactivación**: Opción para reactivar notificaciones

### Seguimiento y Estadísticas
- **Log de envíos**: Registro de todos los correos enviados
- **Tasa de entrega**: Estadísticas de entrega exitosa
- **Tasa de apertura**: Seguimiento de correos abiertos
- **Errores de envío**: Log de errores y reintentos

### Cola de Envío
- **Procesamiento en segundo plano**: Jobs en cola para envío masivo
- **Reintentos automáticos**: 3 intentos en caso de fallo
- **Priorización**: Notificaciones críticas con mayor prioridad
- **Limitación de velocidad**: Control de velocidad de envío

## Implementación Técnica

### Comandos de Consola
- `php artisan notifications:send-reminders`: Envío de recordatorios diarios
- `php artisan notifications:send-weekly`: Envío de recordatorios semanales
- `php artisan notifications:send-monthly`: Envío de recordatorios mensuales
- `php artisan notifications:cleanup`: Limpieza de logs antiguos

### API Endpoints
- `GET /api/notifications/preferences`: Obtener preferencias del usuario
- `PUT /api/notifications/preferences`: Actualizar preferencias
- `POST /api/notifications/test`: Enviar correo de prueba
- `GET /api/notifications/stats`: Estadísticas de envío

### Eventos y Listeners
- **MaintenanceScheduled**: Mantenimiento programado
- **MaintenanceCompleted**: Mantenimiento completado
- **CalibrationDue**: Calibración próxima a vencer
- **ContingencyCreated**: Nueva contingencia
- **EquipmentStatusChanged**: Cambio de estado de equipo

## Configuración de Variables de Entorno

```env
# Configuración de correo
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=eva-system@hospital.com
MAIL_FROM_NAME="Sistema EVA"

# URLs del frontend
APP_FRONTEND_URL=http://localhost:3000

# Configuración de notificaciones
NOTIFICATIONS_ENABLED=true
NOTIFICATIONS_QUEUE=notifications
NOTIFICATIONS_RATE_LIMIT=100
```

## Seguridad y Privacidad

### Protección de Datos
- **Encriptación**: Todas las comunicaciones encriptadas
- **Tokens de desuscripción**: Tokens únicos para cada usuario
- **Validación de destinatarios**: Verificación de direcciones válidas
- **Logs seguros**: Información sensible no almacenada en logs

### Cumplimiento
- **GDPR**: Cumplimiento con regulaciones de privacidad
- **Consentimiento**: Usuarios pueden optar por no recibir notificaciones
- **Retención de datos**: Logs eliminados después de 90 días
- **Auditoría**: Registro de todas las acciones de notificación
