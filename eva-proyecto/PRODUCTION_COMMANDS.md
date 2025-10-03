# 🛠️ COMANDOS ÚTILES PARA PRODUCCIÓN

## 📊 MONITOREO

### Ver Logs en Tiempo Real

```bash
# Logs de Laravel
tail -f eva-backend/storage/logs/laravel.log

# Logs de Nginx (Error)
sudo tail -f /var/log/nginx/error.log

# Logs de Nginx (Access)
sudo tail -f /var/log/nginx/access.log

# Logs de Workers
tail -f eva-backend/storage/logs/worker.log

# Logs de PHP-FPM
sudo tail -f /var/log/php8.1-fpm.log
```

### Monitoreo de Sistema

```bash
# Uso de CPU y RAM
htop

# Espacio en disco
df -h

# Procesos de PHP
ps aux | grep php

# Conexiones MySQL
mysqladmin -u root -p processlist

# Estado de Redis
redis-cli ping
redis-cli info
```

---

## 🔄 MANTENIMIENTO

### Modo Mantenimiento

```bash
# Activar
php artisan down --message="Mantenimiento programado" --retry=60

# Desactivar
php artisan up
```

### Limpiar Cache

```bash
# Limpiar todo el cache
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Regenerar cache optimizado
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### Optimizaciones

```bash
# Optimizar autoload de Composer
composer dump-autoload --optimize

# Optimizar configuración
php artisan optimize

# Limpiar optimizaciones
php artisan optimize:clear
```

---

## 💾 BACKUP Y RESTAURACIÓN

### Crear Backup

```bash
# Backup automático con script
php backup_database.php

# Backup manual con mysqldump
mysqldump -u eva_user -p gestionthuv_prod > backup_$(date +%Y%m%d_%H%M%S).sql

# Comprimir backup
gzip backup_*.sql
```

### Restaurar Backup

```bash
# Descomprimir si es necesario
gunzip backup_FECHA.sql.gz

# Restaurar
mysql -u eva_user -p gestionthuv_prod < backup_FECHA.sql
```

---

## 🔄 WORKERS Y COLAS

### Gestión de Workers (Supervisor)

```bash
# Ver estado
sudo supervisorctl status

# Reiniciar todos los workers
sudo supervisorctl restart eva-worker:*

# Detener workers
sudo supervisorctl stop eva-worker:*

# Iniciar workers
sudo supervisorctl start eva-worker:*

# Recargar configuración
sudo supervisorctl reread
sudo supervisorctl update
```

### Gestión de Colas (Laravel)

```bash
# Ver trabajos en cola
php artisan queue:monitor

# Limpiar trabajos fallidos
php artisan queue:flush

# Reiniciar workers
php artisan queue:restart

# Ver trabajos fallidos
php artisan queue:failed

# Reintentar trabajo fallido
php artisan queue:retry [ID]

# Reintentar todos los fallidos
php artisan queue:retry all
```

---

## 🗄️ BASE DE DATOS

### Migraciones

```bash
# Ver estado de migraciones
php artisan migrate:status

# Ejecutar migraciones pendientes
php artisan migrate --force

# Rollback última migración
php artisan migrate:rollback --step=1

# Refrescar BD (PELIGROSO - Solo en desarrollo)
# php artisan migrate:fresh --seed
```

### Consultas Rápidas

```bash
# Conectar a MySQL
mysql -u eva_user -p gestionthuv_prod

# Dentro de MySQL:
# Ver tablas
SHOW TABLES;

# Ver estructura de tabla
DESCRIBE nombre_tabla;

# Contar registros
SELECT COUNT(*) FROM nombre_tabla;

# Ver últimos registros
SELECT * FROM nombre_tabla ORDER BY id DESC LIMIT 10;
```

---

## 🌐 NGINX

### Gestión del Servicio

```bash
# Ver estado
sudo systemctl status nginx

# Reiniciar
sudo systemctl restart nginx

# Recargar configuración (sin downtime)
sudo systemctl reload nginx

# Detener
sudo systemctl stop nginx

# Iniciar
sudo systemctl start nginx

# Verificar configuración
sudo nginx -t
```

### Ver Sitios Activos

```bash
# Listar sitios disponibles
ls -la /etc/nginx/sites-available/

# Listar sitios habilitados
ls -la /etc/nginx/sites-enabled/
```

---

## 🔒 SSL/HTTPS

### Certbot (Let's Encrypt)

```bash
# Renovar certificados
sudo certbot renew

# Renovar forzado
sudo certbot renew --force-renewal

# Ver certificados instalados
sudo certbot certificates

# Probar renovación automática
sudo certbot renew --dry-run
```

---

## 📦 ACTUALIZACIONES

### Actualizar Código

```bash
# Obtener últimos cambios
git pull origin main

# Ver cambios pendientes
git status

# Ver diferencias
git diff
```

### Actualizar Dependencias

```bash
# Backend (Composer)
composer update --no-dev --optimize-autoloader

# Frontend (NPM)
cd eva-frontend
npm update
npm run build
```

---

## 🔍 DEBUGGING

### Ver Errores Recientes

```bash
# Últimos 100 errores de Laravel
tail -100 eva-backend/storage/logs/laravel.log | grep ERROR

# Errores de hoy
grep "$(date +%Y-%m-%d)" eva-backend/storage/logs/laravel.log | grep ERROR
```

### Verificar Configuración

```bash
# Ver variables de entorno
php artisan env

# Ver configuración actual
php artisan config:show

# Ver rutas registradas
php artisan route:list

# Ver eventos registrados
php artisan event:list
```

### Permisos

```bash
# Corregir permisos de storage
sudo chown -R www-data:www-data eva-backend/storage
sudo chmod -R 775 eva-backend/storage

# Corregir permisos de bootstrap/cache
sudo chown -R www-data:www-data eva-backend/bootstrap/cache
sudo chmod -R 775 eva-backend/bootstrap/cache
```

---

## 📊 ESTADÍSTICAS

### Tamaño de Base de Datos

```bash
mysql -u eva_user -p -e "
SELECT 
    table_schema AS 'Database',
    ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'Size (MB)'
FROM information_schema.tables 
WHERE table_schema = 'gestionthuv_prod'
GROUP BY table_schema;
"
```

### Tablas Más Grandes

```bash
mysql -u eva_user -p -e "
SELECT 
    table_name AS 'Table',
    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Size (MB)'
FROM information_schema.TABLES 
WHERE table_schema = 'gestionthuv_prod'
ORDER BY (data_length + index_length) DESC
LIMIT 10;
"
```

---

## 🚨 EMERGENCIAS

### Aplicación No Responde

```bash
# 1. Ver logs
tail -100 eva-backend/storage/logs/laravel.log

# 2. Reiniciar PHP-FPM
sudo systemctl restart php8.1-fpm

# 3. Reiniciar Nginx
sudo systemctl restart nginx

# 4. Limpiar cache
php artisan cache:clear
php artisan config:clear

# 5. Reiniciar workers
sudo supervisorctl restart eva-worker:*
```

### Base de Datos Lenta

```bash
# Ver procesos MySQL
mysqladmin -u root -p processlist

# Matar proceso específico
mysql -u root -p -e "KILL [PROCESS_ID];"

# Optimizar tablas
mysqlcheck -u root -p --optimize --all-databases
```

### Disco Lleno

```bash
# Ver uso de disco
df -h

# Encontrar archivos grandes
du -sh /* | sort -rh | head -10

# Limpiar logs antiguos
find eva-backend/storage/logs -name "*.log" -mtime +30 -delete

# Limpiar cache de Laravel
php artisan cache:clear
```

---

## 📝 NOTAS IMPORTANTES

- **Siempre** haz backup antes de cambios importantes
- **Nunca** ejecutes comandos destructivos en producción sin confirmar
- **Monitorea** los logs después de cada cambio
- **Documenta** cualquier cambio o problema encontrado
- **Prueba** en ambiente de desarrollo primero

---

**Última actualización:** $(date)
