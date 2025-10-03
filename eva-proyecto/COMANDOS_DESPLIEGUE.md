# 🚀 COMANDOS PARA DESPLIEGUE - EVA

## 📋 PREPARACIÓN LOCAL (Antes de subir)

### 1. BACKEND (Laravel) - Preparación

```bash
cd eva-backend

# 1. Hacer backup de la base de datos
php backup_database.php

# 2. Generar migraciones desde BD actual
php generate_migrations.php

# 3. Instalar dependencias de producción
composer install --no-dev --optimize-autoloader --no-interaction

# 4. Limpiar cache
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# 5. Optimizar para producción
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

# 6. Verificar que todo esté bien
php artisan about
```

### 2. FRONTEND (Vite + React) - Preparación

```bash
cd eva-frontend

# 1. Instalar dependencias
npm ci

# 2. Crear archivo .env.production
cp .env.production.example .env.production
# Editar .env.production con valores de producción

# 3. Ejecutar linter (opcional)
npm run lint

# 4. Generar build de producción
npm run build

# 5. Verificar el build
ls -lh dist/
```

---

## 🌐 EN EL SERVIDOR (Después de subir)

### PASO 1: Configurar el Servidor

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar PHP 8.1 y extensiones
sudo apt install -y php8.1 php8.1-fpm php8.1-mysql php8.1-xml \
    php8.1-mbstring php8.1-curl php8.1-zip php8.1-gd \
    php8.1-redis php8.1-bcmath

# Instalar MySQL
sudo apt install -y mysql-server

# Instalar Redis
sudo apt install -y redis-server

# Instalar Nginx
sudo apt install -y nginx

# Instalar Composer
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer

# Instalar Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar Supervisor (para workers)
sudo apt install -y supervisor
```

### PASO 2: Subir el Código

```bash
# Opción A: Clonar desde Git
cd /var/www
sudo git clone https://github.com/TU_USUARIO/proyecto-eva.git eva
cd eva

# Opción B: Subir con SCP/SFTP
# Desde tu máquina local:
scp -r proyecto-eva usuario@servidor:/var/www/eva
```

### PASO 3: Configurar Backend en el Servidor

```bash
cd /var/www/eva/eva-backend

# 1. Instalar dependencias
composer install --no-dev --optimize-autoloader

# 2. Copiar y configurar .env
cp .env.production.example .env
nano .env  # Editar con valores del servidor

# 3. Generar key de aplicación
php artisan key:generate

# 4. Crear enlace simbólico de storage
php artisan storage:link

# 5. Configurar permisos
sudo chown -R www-data:www-data storage bootstrap/cache
sudo chmod -R 775 storage bootstrap/cache

# 6. Crear base de datos
mysql -u root -p
```

```sql
CREATE DATABASE gestionthuv_prod CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'eva_user'@'localhost' IDENTIFIED BY 'TU_CONTRASEÑA_SEGURA';
GRANT ALL PRIVILEGES ON gestionthuv_prod.* TO 'eva_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

```bash
# 7. Importar base de datos (si tienes backup)
mysql -u eva_user -p gestionthuv_prod < backup_gestionthuv_FECHA.sql

# O ejecutar migraciones (si es BD nueva)
php artisan migrate --force

# 8. Optimizar para producción
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache
```

### PASO 4: Configurar Frontend en el Servidor

```bash
cd /var/www/eva/eva-frontend

# 1. Instalar dependencias
npm ci

# 2. Copiar y configurar .env
cp .env.production.example .env.production
nano .env.production  # Editar con valores del servidor

# 3. Generar build de producción
npm run build

# 4. Verificar que se generó dist/
ls -lh dist/
```

### PASO 5: Configurar Nginx

#### Backend (API)

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
    add_header X-XSS-Protection "1; mode=block";

    index index.php;
    charset utf-8;

    # Logs
    access_log /var/log/nginx/eva-api-access.log;
    error_log /var/log/nginx/eva-api-error.log;

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
        fastcgi_hide_header X-Powered-By;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }

    # Configuración de archivos estáticos
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### Frontend

```bash
sudo nano /etc/nginx/sites-available/eva-frontend
```

```nginx
server {
    listen 80;
    server_name eva.huv.gov.co www.eva.huv.gov.co;
    root /var/www/eva/eva-frontend/dist;

    index index.html;
    charset utf-8;

    # Logs
    access_log /var/log/nginx/eva-frontend-access.log;
    error_log /var/log/nginx/eva-frontend-error.log;

    # Configuración para SPA (React Router)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Configuración de archivos estáticos
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # Compresión Gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript image/svg+xml;
    gzip_comp_level 6;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

#### Activar sitios

```bash
# Crear enlaces simbólicos
sudo ln -s /etc/nginx/sites-available/eva-api /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/eva-frontend /etc/nginx/sites-enabled/

# Verificar configuración
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
```

### PASO 6: Configurar SSL (HTTPS)

```bash
# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtener certificados SSL para backend
sudo certbot --nginx -d api.eva.huv.gov.co

# Obtener certificados SSL para frontend
sudo certbot --nginx -d eva.huv.gov.co -d www.eva.huv.gov.co

# Verificar renovación automática
sudo certbot renew --dry-run
```

### PASO 7: Configurar Workers (Supervisor)

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

```bash
# Recargar Supervisor
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start eva-worker:*

# Ver estado
sudo supervisorctl status
```

### PASO 8: Configurar Cron Jobs

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

## 🔄 ACTUALIZACIONES FUTURAS

### Usando el Script Automático

```bash
cd /var/www/eva/eva-backend
./deploy.sh
```

### Manual

```bash
cd /var/www/eva/eva-backend

# 1. Modo mantenimiento
php artisan down

# 2. Backup
php backup_database.php

# 3. Obtener cambios
git pull origin main

# 4. Instalar dependencias
composer install --no-dev --optimize-autoloader

# 5. Migraciones (si hay)
php artisan migrate --force

# 6. Limpiar cache
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# 7. Optimizar
php artisan config:cache
php artisan route:cache
php artisan view:cache

# 8. Reiniciar workers
sudo supervisorctl restart eva-worker:*

# 9. Desactivar mantenimiento
php artisan up
```

---

## ✅ VERIFICACIÓN FINAL

```bash
# Verificar servicios
sudo systemctl status nginx
sudo systemctl status php8.1-fpm
sudo systemctl status mysql
sudo systemctl status redis-server
sudo supervisorctl status

# Verificar logs
tail -f /var/www/eva/eva-backend/storage/logs/laravel.log
tail -f /var/log/nginx/eva-api-error.log
tail -f /var/log/nginx/eva-frontend-error.log

# Probar API
curl https://api.eva.huv.gov.co/api/v1/health

# Probar Frontend
curl https://eva.huv.gov.co
```

---

## 🆘 COMANDOS DE EMERGENCIA

```bash
# Reiniciar todo
sudo systemctl restart nginx
sudo systemctl restart php8.1-fpm
sudo supervisorctl restart eva-worker:*

# Ver logs en tiempo real
tail -f /var/www/eva/eva-backend/storage/logs/laravel.log

# Limpiar todo el cache
php artisan optimize:clear

# Verificar permisos
sudo chown -R www-data:www-data /var/www/eva/eva-backend/storage
sudo chmod -R 775 /var/www/eva/eva-backend/storage
```

---

**¡El sistema está listo para producción!** 🎉
