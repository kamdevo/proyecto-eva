# Dockerfile SIMPLE para Backend Laravel - Sistema EVA (Desarrollo Local)
FROM php:8.2-fpm-alpine

LABEL maintainer="Sistema EVA - Hospital Universitario del Valle"
LABEL version="1.0.0-dev"
LABEL description="Backend PHP/Laravel para Sistema EVA - Desarrollo Local"

# Instalar dependencias del sistema (simplificado)
RUN apk add --no-cache \
    nginx \
    curl \
    zip \
    unzip \
    git \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    libzip-dev \
    icu-dev \
    oniguruma-dev \
    mysql-client \
    bash \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
        pdo_mysql \
        mysqli \
        gd \
        zip \
        intl \
        mbstring \
        exif \
        pcntl \
        bcmath \
    && rm -rf /var/cache/apk/*

# Instalar Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Configurar directorio de trabajo
WORKDIR /var/www/html

# Copiar composer files primero
COPY composer.json composer.lock ./

# Instalar dependencias sin scripts de Laravel
RUN composer install --no-interaction --no-scripts --no-dev

# Copiar el resto del proyecto
COPY . .

# Ahora ejecutar los scripts de Laravel
RUN composer run-script post-autoload-dump

# Crear directorios necesarios y configurar permisos
RUN mkdir -p /var/www/html/storage/logs \
    && mkdir -p /var/www/html/storage/framework/cache \
    && mkdir -p /var/www/html/storage/framework/sessions \
    && mkdir -p /var/www/html/storage/framework/views \
    && mkdir -p /var/www/html/storage/app/public \
    && mkdir -p /var/www/html/bootstrap/cache \
    && chmod -R 777 /var/www/html/storage \
    && chmod -R 777 /var/www/html/bootstrap/cache

# Configurar Nginx simple
RUN echo 'server {' > /etc/nginx/http.d/default.conf && \
    echo '    listen 8001;' >> /etc/nginx/http.d/default.conf && \
    echo '    root /var/www/html/public;' >> /etc/nginx/http.d/default.conf && \
    echo '    index index.php;' >> /etc/nginx/http.d/default.conf && \
    echo '    location / { try_files $uri $uri/ /index.php?$query_string; }' >> /etc/nginx/http.d/default.conf && \
    echo '    location ~ \.php$ {' >> /etc/nginx/http.d/default.conf && \
    echo '        fastcgi_pass 127.0.0.1:9000;' >> /etc/nginx/http.d/default.conf && \
    echo '        fastcgi_index index.php;' >> /etc/nginx/http.d/default.conf && \
    echo '        include fastcgi_params;' >> /etc/nginx/http.d/default.conf && \
    echo '        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;' >> /etc/nginx/http.d/default.conf && \
    echo '    }' >> /etc/nginx/http.d/default.conf && \
    echo '}' >> /etc/nginx/http.d/default.conf

# Crear script de inicio simple
RUN echo '#!/bin/bash' > /start.sh && \
    echo 'echo "🚀 Iniciando EVA Backend Simple..."' >> /start.sh && \
    echo '' >> /start.sh && \
    echo '# Esperar MySQL' >> /start.sh && \
    echo 'while ! mysql -h mysql -u eva_user -peva_password_2024 --skip-ssl -e "SELECT 1" >/dev/null 2>&1; do' >> /start.sh && \
    echo '    echo "Esperando MySQL..."' >> /start.sh && \
    echo '    sleep 2' >> /start.sh && \
    echo 'done' >> /start.sh && \
    echo 'echo "✅ MySQL conectado"' >> /start.sh && \
    echo '' >> /start.sh && \
    echo '# Configurar .env' >> /start.sh && \
    echo 'if [ -f .env.docker-simple ]; then' >> /start.sh && \
    echo '    cp .env.docker-simple .env' >> /start.sh && \
    echo 'fi' >> /start.sh && \
    echo '' >> /start.sh && \
    echo '# Laravel setup' >> /start.sh && \
    echo 'php artisan key:generate --force' >> /start.sh && \
    echo 'php artisan migrate --force' >> /start.sh && \
    echo 'php artisan storage:link' >> /start.sh && \
    echo '' >> /start.sh && \
    echo '# Iniciar servicios' >> /start.sh && \
    echo 'php-fpm -D' >> /start.sh && \
    echo 'nginx -g "daemon off;"' >> /start.sh && \
    chmod +x /start.sh

# Exponer puerto
EXPOSE 8001

# Health check simple
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8001 || exit 1

# Comando de inicio
CMD ["/start.sh"]
