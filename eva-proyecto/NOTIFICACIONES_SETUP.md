# 📧 Configuración del Sistema de Notificaciones - EVA

## 🚀 Instalación y Configuración Completa

### 1. Configuración de Variables de Entorno

Copie el archivo de ejemplo y configure las variables:

```bash
cp .env.notifications.example .env
```

#### Configuración Básica de Correo (Gmail):
```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=tu-email@gmail.com
MAIL_PASSWORD=tu-contraseña-de-aplicacion
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=eva-system@hospital.com
MAIL_FROM_NAME="Sistema EVA"
```

#### Configuración de Notificaciones:
```env
NOTIFICATIONS_ENABLED=true
NOTIFICATIONS_QUEUE=notifications
NOTIFICATIONS_RATE_LIMIT=100
APP_FRONTEND_URL=http://localhost:3000
```

### 2. Ejecutar Migraciones

Crear las tablas necesarias para el sistema de notificaciones:

```bash
php artisan migrate
```

### 3. Configurar Cola de Trabajos

#### Para Desarrollo (Base de Datos):
```bash
php artisan queue:table
php artisan migrate
```

#### Para Producción (Redis - Recomendado):
```env
QUEUE_CONNECTION=redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
```

### 4. Registrar Rutas de Notificaciones

Agregar al archivo `routes/api.php`:

```php
// Incluir rutas de notificaciones
require __DIR__.'/notifications.php';
```

### 5. Configurar Tareas Programadas

El sistema incluye tareas automáticas configuradas en `app/Console/Kernel.php`:

- **Recordatorios diarios**: 8:00 AM
- **Recordatorios semanales**: Lunes 9:00 AM  
- **Limpieza de logs**: Primer día del mes 2:00 AM
- **Health checks**: Cada 6 horas

Para activar el scheduler:

```bash
# Agregar al crontab del servidor
* * * * * cd /path/to/eva-backend && php artisan schedule:run >> /dev/null 2>&1
```

## 🔧 Comandos Disponibles

### Recordatorios de Mantenimiento
```bash
# Enviar recordatorios diarios (incluye vencidos)
php artisan notifications:send-maintenance-reminders --overdue

# Enviar recordatorios específicos (7, 3, 1 días antes)
php artisan notifications:send-maintenance-reminders --days=7,3,1

# Modo simulación (no envía correos reales)
php artisan notifications:send-maintenance-reminders --dry-run
```

### Recordatorios de Calibración
```bash
# Enviar recordatorios diarios (incluye vencidas)
php artisan notifications:send-calibration-reminders --expired

# Enviar recordatorios específicos (30, 15, 7 días antes)
php artisan notifications:send-calibration-reminders --days=30,15,7

# Modo simulación
php artisan notifications:send-calibration-reminders --dry-run
```

### Mantenimiento del Sistema
```bash
# Verificar salud del sistema
php artisan notifications:health-check

# Enviar reporte de salud por correo
php artisan notifications:health-check --send-report --email=admin@hospital.com

# Limpiar logs antiguos (90 días por defecto)
php artisan notifications:cleanup

# Limpiar con retención personalizada
php artisan notifications:cleanup --days=60

# Simular limpieza
php artisan notifications:cleanup --dry-run
```

## 📡 API Endpoints

### Gestión de Preferencias
```http
GET    /api/notifications/preferences          # Obtener preferencias del usuario
PUT    /api/notifications/preferences          # Actualizar preferencias
POST   /api/notifications/test                 # Enviar correo de prueba
GET    /api/notifications/stats                # Estadísticas personales
POST   /api/notifications/mark-read            # Marcar como leídas
```

### Endpoints Administrativos
```http
GET    /api/notifications/logs                 # Logs del sistema (admin)
GET    /api/notifications/system-stats         # Estadísticas del sistema (admin)
GET    /api/notifications/config               # Configuración del sistema (admin)
PUT    /api/notifications/config               # Actualizar configuración (admin)
```

### Desuscripción Pública
```http
GET    /api/notifications/unsubscribe?token=xxx   # Desuscribirse (sin auth)
```

## 🎨 Personalización de Plantillas

### Estructura de Correos
Todos los correos incluyen:
- **Encabezado**: Logo EVA + información institucional
- **Saludo personalizado**: Nombre del destinatario
- **Contenido principal**: Información específica del evento
- **Botón de acción**: Enlace al sistema
- **Pie de página**: Contacto + enlace de desuscripción

### Variables Disponibles
```php
{usuario_nombre}     // Nombre completo del usuario
{equipo_nombre}      // Nombre del equipo
{equipo_codigo}      // Código del equipo
{fecha_programada}   // Fecha programada del evento
{dias_restantes}     // Días restantes hasta el evento
{responsable}        // Responsable asignado
{servicio}           // Servicio/área del equipo
{sede}               // Sede donde se encuentra
```

## 🔒 Configuración de Seguridad

### Autenticación de Correo

#### Gmail:
1. Habilitar autenticación de 2 factores
2. Generar contraseña de aplicación
3. Usar la contraseña de aplicación en `MAIL_PASSWORD`

#### Outlook:
```env
MAIL_HOST=smtp-mail.outlook.com
MAIL_PORT=587
MAIL_ENCRYPTION=tls
```

#### Servidor SMTP Personalizado:
```env
MAIL_HOST=mail.tu-dominio.com
MAIL_PORT=587
MAIL_USERNAME=eva@tu-dominio.com
MAIL_PASSWORD=tu-contraseña-segura
MAIL_ENCRYPTION=tls
```

### Tokens de Desuscripción
El sistema genera tokens seguros para desuscripción:
- Basados en hash SHA256 + clave de aplicación
- Únicos por usuario
- No exponen información sensible

## 📊 Monitoreo y Logs

### Health Checks Automáticos
El sistema verifica automáticamente:
- ✅ Conectividad SMTP
- ✅ Estado de la cola de trabajos
- ✅ Tasas de entrega de correos
- ✅ Errores recientes
- ✅ Espacio en disco

### Logs del Sistema
```bash
# Ver logs de Laravel
tail -f storage/logs/laravel.log

# Ver logs específicos de notificaciones
grep "notification" storage/logs/laravel.log

# Ver estadísticas de la cola
php artisan queue:monitor
```

### Estadísticas Disponibles
- Total de correos enviados
- Tasa de entrega exitosa
- Errores por tipo
- Notificaciones por usuario
- Rendimiento del sistema

## 🚨 Troubleshooting

### Problemas Comunes

#### 1. Correos no se envían
```bash
# Verificar configuración
php artisan notifications:health-check

# Probar envío manual
php artisan notifications:test --type=general

# Verificar logs
tail -f storage/logs/laravel.log
```

#### 2. Cola de trabajos no procesa
```bash
# Iniciar worker de cola
php artisan queue:work

# Ver trabajos fallidos
php artisan queue:failed

# Reintentar trabajos fallidos
php artisan queue:retry all
```

#### 3. Recordatorios no se envían automáticamente
```bash
# Verificar crontab
crontab -l

# Ejecutar scheduler manualmente
php artisan schedule:run

# Ver próximas tareas programadas
php artisan schedule:list
```

#### 4. Errores de autenticación SMTP
- Verificar credenciales de correo
- Comprobar configuración de 2FA
- Revisar configuración de firewall
- Verificar puertos SMTP (587/465)

### Códigos de Error Comunes

| Error | Causa | Solución |
|-------|-------|----------|
| 535 | Credenciales inválidas | Verificar usuario/contraseña |
| 550 | Dirección rechazada | Verificar dirección FROM |
| 421 | Servidor no disponible | Verificar conectividad |
| 554 | Mensaje rechazado | Revisar contenido del correo |

## 🔄 Proceso de Actualización

### Actualizar Sistema Existente
```bash
# 1. Respaldar base de datos
php artisan backup:run

# 2. Ejecutar nuevas migraciones
php artisan migrate

# 3. Limpiar cache
php artisan cache:clear
php artisan config:clear

# 4. Reiniciar workers de cola
php artisan queue:restart
```

### Migrar Configuración
```bash
# Comparar configuración actual con ejemplo
diff .env .env.notifications.example

# Agregar nuevas variables necesarias
```

## 📈 Optimización para Producción

### Configuración Recomendada
```env
# Cola con Redis
QUEUE_CONNECTION=redis

# Límites de producción
NOTIFICATIONS_RATE_LIMIT=500

# Health checks frecuentes
HEALTH_CHECK_FREQUENCY=2

# Retención optimizada
NOTIFICATION_LOGS_RETENTION_DAYS=30
```

### Supervisión con Supervisor
```ini
[program:eva-queue-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /path/to/eva-backend/artisan queue:work --sleep=3 --tries=3
autostart=true
autorestart=true
numprocs=2
redirect_stderr=true
stdout_logfile=/path/to/eva-backend/storage/logs/worker.log
```

## 📞 Soporte

Para soporte técnico:
1. Revisar logs del sistema
2. Ejecutar health check
3. Consultar esta documentación
4. Contactar al equipo de desarrollo

---

**Sistema EVA - Gestión de Equipos Biomédicos**  
*Desarrollado para optimizar la gestión hospitalaria*
