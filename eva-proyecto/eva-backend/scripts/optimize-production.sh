#!/bin/bash

# ========================================
# SCRIPT DE OPTIMIZACIÓN PARA PRODUCCIÓN
# ========================================

set -e

echo "========================================="
echo "  OPTIMIZACIÓN LARAVEL - PRODUCCIÓN"
echo "========================================="
echo ""

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_message() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Verificar que estamos en el directorio correcto
if [ ! -f "artisan" ]; then
    echo "Error: Este script debe ejecutarse desde el directorio raíz de Laravel"
    exit 1
fi

# 1. Limpiar cache existente
print_message "Limpiando cache existente..."
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# 2. Optimizar autoload de Composer
print_message "Optimizando autoload de Composer..."
composer dump-autoload --optimize --no-dev

# 3. Cachear configuración
print_message "Cacheando configuración..."
php artisan config:cache

# 4. Cachear rutas
print_message "Cacheando rutas..."
php artisan route:cache

# 5. Cachear vistas
print_message "Cacheando vistas..."
php artisan view:cache

# 6. Cachear eventos
print_message "Cacheando eventos..."
php artisan event:cache

# 7. Optimizar general
print_message "Ejecutando optimización general..."
php artisan optimize

# 8. Verificar permisos
print_message "Verificando permisos..."
chmod -R 775 storage bootstrap/cache

# 9. Crear enlace simbólico de storage (si no existe)
if [ ! -L "public/storage" ]; then
    print_message "Creando enlace simbólico de storage..."
    php artisan storage:link
fi

echo ""
echo "========================================="
print_message "OPTIMIZACIÓN COMPLETADA"
echo "========================================="
echo ""
print_warning "Recuerda:"
print_warning "1. Verificar que APP_ENV=production en .env"
print_warning "2. Verificar que APP_DEBUG=false en .env"
print_warning "3. Configurar Redis para cache y sesiones"
print_warning "4. Iniciar workers de cola con Supervisor"
echo ""
