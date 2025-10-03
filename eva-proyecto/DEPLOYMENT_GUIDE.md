# 📋 GUÍA DE DESPLIEGUE - EVA (Hospital Universitario del Valle)

## 🚀 Preparación para Producción

### ⚠️ IMPORTANTE: ANTES DE EMPEZAR

**NUNCA ejecutes migraciones en la base de datos actual sin hacer backup primero.**

---

## 📦 PASO 1: GENERAR MIGRACIONES DESDE BD EXISTENTE

### 1.1 Hacer Backup de la Base de Datos

```bash
cd eva-backend
php backup_database.php
```

Este script:
- ✅ Crea un backup completo de la BD
- ✅ Lo comprime en formato ZIP
- ✅ Lo guarda en `storage/backups/`

**IMPORTANTE:** Descarga y guarda este backup en un lugar seguro.

### 1.2 Generar Archivos de Migración

```bash
php generate_migrations.php
```

Este script:
- ✅ Lee la estructura actual de la BD
- ✅ Genera archivos de migración en `database/migrations/`
- ✅ Preserva tipos de datos, índices y relaciones

### 1.3 Revisar Migraciones Generadas

```bash
# Ver las migraciones generadas
ls -la database/migrations/
```

**Revisa cada archivo** y ajusta si es necesario:
- Tipos de datos
- Índices y claves foráneas
- Valores por defecto

---

## 🔧 PASO 2: CONFIGURAR ENTORNO DE PRODUCCIÓN

### 2.1 Backend (Laravel)

```bash
cd eva-backend

# Copiar archivo de configuración
cp .env.production.example .env.production

# Editar con tus valores
nano .env.production
```

**Configuraciones críticas:**

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://eva.huv.gov.co

DB_DATABASE=gestionthuv_prod
DB_USERNAME=eva_user
DB_PASSWORD=TU_CONTRASEÑA_SEGURA

CACHE_DRIVER=redis
SESSION_DRIVER=redis
QUEUE_CONNECTION=redis
```

### 2.2 Frontend (React + Vite)

```bash
cd eva-frontend

# Copiar archivo de configuración
cp .env.production.example .env.production

# Editar con tus valores
nano .env.production
```

**Configuraciones críticas:**

```env
VITE_API_URL=https://api.eva.huv.gov.co
VITE_APP_URL=https://eva.huv.gov.co
VITE_APP_ENV=production
```

---

## 🏗️ PASO 3: PREPARAR SERVIDOR

### 3.1 Requisitos del Servidor

**Software necesario:**
- ✅ PHP 8.1 o superior
- ✅ MySQL 8.0 o superior
- ✅ Nginx o Apache
- ✅ Redis (recomendado)
- ✅ Composer
- ✅ Node.js 18+ y NPM
- ✅ Git
- ✅ Supervisor (para colas)

### 3.2 Instalar Dependencias (Ubuntu/Debian)

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# PHP y extensiones
sudo apt install -y php8.1 php8.1-fpm php8.1-mysql php8.1-xml php8.1-mbstring \
    php8.1-curl php8.1-zip php8.1-gd php8.1-redis php8.1-bcmath

# MySQL
sudo apt install -y mysql-server

# Redis
sudo apt install -y redis-server

# Nginx
sudo apt install -y nginx

# Composer
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer

# Node.js y NPM
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Supervisor
sudo apt install -y supervisor
```

---

## 📤 PASO 4: SUBIR CÓDIGO AL SERVIDOR

### 4.1 Clonar Repositorio

```bash
# En el servidor
cd /var/www
sudo git clone https://github.com/TU_USUARIO/proyecto-eva.git eva
cd eva
```

### 4.2 Configurar Backend

```bash
cd eva-backend

# Instalar dependencias
composer install --no-dev --optimize-autoloader

# Copiar y configurar .env
cp .env.production .env
nano .env

# Generar key de aplicación
php artisan key:generate

# Crear enlace simbólico de storage
php artisan storage:link

# Configurar permisos
sudo chown -R www-data:www-data storage bootstrap/cache
sudo chmod -R 775 storage bootstrap/cache
```

### 4.3 Configurar Frontend

```bash
cd ../eva-frontend

# Instalar dependencias
npm ci

# Copiar y configurar .env
cp .env.production .env
nano .env

# Generar build de producción
npm run build
```

---

## 🗄️ PASO 5: CONFIGURAR BASE DE DATOS

### 5.1 Crear Base de Datos en Producción

```bash
mysql -u root -p
```

```sql
-- Crear base de datos
CREATE DATABASE gestionthuv_prod CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Crear usuario
CREATE USER 'eva_user'@'localhost' IDENTIFIED BY 'TU_CONTRASEÑA_SEGURA';

-- Dar permisos
GRANT ALL PRIVILEGES ON gestionthuv_prod.* TO 'eva_user'@'localhost';
FLUSH PRIVILEGES;

EXIT;
```

### 5.2 Importar Datos (Opción A: Desde Backup)

```bash
# Si tienes un backup de la BD actual
mysql -u eva_user -p gestionthuv_prod < backup_gestionthuv_FECHA.sql
```

### 5.3 Usar Migraciones (Opción B: BD Nueva)

```bash
# Solo si es una BD completamente nueva
php artisan migrate --force
```

---

## 🌐 PASO 6: CONFIGURAR NGINX

### 6.1 Configuración para Backend (API)

```bash
sudo nano /etc/nginx/sites-available/eva-api
```

```nginx
server {
    listen 80;
    server_name api.eva.huv.gov.co;
    root /var/www/eva/eva-backend/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    index index.php;

    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

### 6.2 Configuración para Frontend

```bash
sudo nano /etc/nginx/sites-available/eva-frontend
```

```nginx
server {
    listen 80;
    server_name eva.huv.gov.co www.eva.huv.gov.co;
    root /var/www/eva/eva-frontend/dist;

    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

### 6.3 Activar Sitios

```bash
sudo ln -s /etc/nginx/sites-available/eva-api /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/eva-frontend /etc/nginx/sites-enabled/

# Verificar configuración
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
```

---

## 🔒 PASO 7: CONFIGURAR SSL (HTTPS)

### 7.1 Instalar Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 7.2 Obtener Certificados SSL

```bash
# Para el backend
sudo certbot --nginx -d api.eva.huv.gov.co

# Para el frontend
sudo certbot --nginx -d eva.huv.gov.co -d www.eva.huv.gov.co
```

### 7.3 Renovación Automática

```bash
# Verificar renovación automática
sudo certbot renew --dry-run
```

---

## ⚙️ PASO 8: CONFIGURAR COLAS Y WORKERS

### 8.1 Configurar Supervisor

```bash
sudo nano /etc/supervisor/conf.d/eva-worker.conf
```

```ini
[program:eva-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/eva/eva-backend/artisan queue:work redis --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=4
redirect_stderr=true
stdout_logfile=/var/www/eva/eva-backend/storage/logs/worker.log
stopwaitsecs=3600
```

### 8.2 Iniciar Workers

```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start eva-worker:*
```

---

## 📊 PASO 9: OPTIMIZACIONES DE PRODUCCIÓN

### 9.1 Optimizar Laravel

```bash
cd eva-backend

# Cachear configuración
php artisan config:cache

# Cachear rutas
php artisan route:cache

# Cachear vistas
php artisan view:cache

# Cachear eventos
php artisan event:cache

# Optimizar autoload de Composer
composer dump-autoload --optimize
```

### 9.2 Configurar Cron Jobs

```bash
sudo crontab -e
```

```cron
# Laravel Scheduler
* * * * * cd /var/www/eva/eva-backend && php artisan schedule:run >> /dev/null 2>&1

# Backup diario de BD (3 AM)
0 3 * * * cd /var/www/eva/eva-backend && php backup_database.php >> /var/www/eva/eva-backend/storage/logs/backup.log 2>&1
```

---

## 🔄 PASO 10: SCRIPT DE DESPLIEGUE AUTOMÁTICO

### 10.1 Hacer Ejecutable el Script

```bash
chmod +x deploy.sh
```

### 10.2 Uso del Script

```bash
# Despliegue completo
./deploy.sh
```

El script automáticamente:
1. ✅ Activa modo mantenimiento
2. ✅ Hace backup de BD
3. ✅ Obtiene últimos cambios de Git
4. ✅ Instala dependencias
5. ✅ Ejecuta migraciones (con confirmación)
6. ✅ Limpia y optimiza cache
7. ✅ Reinicia workers
8. ✅ Desactiva modo mantenimiento

---

## 📝 PASO 11: MONITOREO Y LOGS

### 11.1 Ver Logs en Tiempo Real

```bash
# Logs de Laravel
tail -f /var/www/eva/eva-backend/storage/logs/laravel.log

# Logs de Nginx
tail -f /var/log/nginx/error.log

# Logs de Workers
tail -f /var/www/eva/eva-backend/storage/logs/worker.log
```

### 11.2 Monitoreo de Recursos

```bash
# Ver uso de CPU y memoria
htop

# Ver procesos de PHP
ps aux | grep php

# Ver workers de cola
sudo supervisorctl status
```

---

## 🆘 SOLUCIÓN DE PROBLEMAS

### Error 500 - Internal Server Error

```bash
# Ver logs
tail -100 /var/www/eva/eva-backend/storage/logs/laravel.log

# Verificar permisos
sudo chown -R www-data:www-data storage bootstrap/cache
sudo chmod -R 775 storage bootstrap/cache

# Limpiar cache
php artisan cache:clear
php artisan config:clear
```

### Error de Conexión a BD

```bash
# Verificar que MySQL esté corriendo
sudo systemctl status mysql

# Probar conexión
mysql -u eva_user -p gestionthuv_prod

# Verificar .env
cat .env | grep DB_
```

### Workers No Funcionan

```bash
# Reiniciar Supervisor
sudo supervisorctl restart eva-worker:*

# Ver logs de workers
tail -f storage/logs/worker.log
```

---

## ✅ CHECKLIST FINAL

Antes de poner en producción, verifica:

- [ ] Backup de BD creado y guardado
- [ ] Variables de entorno configuradas (.env)
- [ ] SSL/HTTPS configurado y funcionando
- [ ] Migraciones revisadas y probadas
- [ ] Permisos de archivos correctos
- [ ] Workers de cola funcionando
- [ ] Cron jobs configurados
- [ ] Logs accesibles y monitoreados
- [ ] Modo debug desactivado (APP_DEBUG=false)
- [ ] Cache optimizado
- [ ] Pruebas de funcionalidad completadas

---

## 📞 SOPORTE

Para problemas o dudas:
- 📧 Email: soporte@huv.gov.co
- 📱 Teléfono: +57 XXX XXX XXXX
- 🌐 Documentación: https://docs.eva.huv.gov.co

---

**Última actualización:** $(date)
**Versión:** 1.0.0
