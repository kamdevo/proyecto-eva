#!/bin/bash

echo "🚀 Iniciando Sistema EVA Backend..."

# Esperar a que MySQL esté disponible
echo "⏳ Esperando conexión a MySQL..."
while ! mysqladmin ping -h mysql -u eva_user -peva_password_2024 --silent; do
    echo "MySQL no está listo - esperando..."
    sleep 2
done

echo "✅ MySQL conectado exitosamente"

# Cambiar a usuario root temporalmente para configurar permisos
USER_BACKUP=$(whoami)

# Configurar permisos (ejecutar como root)
echo "🔧 Configurando permisos..."
chown -R eva:eva /var/www/html/storage
chown -R eva:eva /var/www/html/bootstrap/cache
chmod -R 775 /var/www/html/storage
chmod -R 775 /var/www/html/bootstrap/cache

# Generar key de aplicación si no existe
if [ ! -f /var/www/html/.env ]; then
    echo "📋 Copiando archivo .env..."
    if [ -f /var/www/html/.env.docker-simple ]; then
        echo "📋 Usando configuración simple (3 contenedores)..."
        cp /var/www/html/.env.docker-simple /var/www/html/.env
    else
        echo "📋 Usando configuración completa..."
        cp /var/www/html/.env.docker /var/www/html/.env
    fi
fi

# Generar application key
echo "🔑 Generando application key..."
php artisan key:generate --force

# Limpiar cache
echo "🧹 Limpiando cache..."
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear

# Optimizar aplicación
echo "⚡ Optimizando aplicación..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Ejecutar migraciones
echo "🗄️ Ejecutando migraciones..."
php artisan migrate --force

# Crear storage link
echo "🔗 Creando storage link..."
php artisan storage:link

# Seeders (si es primera instalación)
if [ "$FIRST_INSTALL" = "true" ]; then
    echo "🌱 Ejecutando seeders..."
    php artisan db:seed --force
fi

echo "✅ Backend EVA iniciado correctamente"

# Iniciar supervisord
exec /usr/bin/supervisord -c /etc/supervisord.conf
