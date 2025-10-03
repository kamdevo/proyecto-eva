#!/bin/bash

# ========================================
# SCRIPT DE DESPLIEGUE - EVA
# ========================================
# Este script automatiza el proceso de despliegue
# en el servidor de producción

set -e  # Detener si hay algún error

echo "========================================="
echo "  DESPLIEGUE EVA - PRODUCCIÓN"
echo "========================================="
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para imprimir mensajes
print_message() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Verificar que estamos en el directorio correcto
if [ ! -f "composer.json" ]; then
    print_error "Error: No se encontró composer.json. Ejecuta este script desde la raíz del proyecto backend."
    exit 1
fi

# ========================================
# 1. MODO MANTENIMIENTO
# ========================================
print_message "Activando modo mantenimiento..."
php artisan down --message="Actualizando sistema EVA" --retry=60

# ========================================
# 2. BACKUP DE BASE DE DATOS
# ========================================
print_message "Creando backup de la base de datos..."
php backup_database.php

# ========================================
# 3. GIT PULL
# ========================================
print_message "Obteniendo últimos cambios del repositorio..."
git pull origin main

# ========================================
# 4. COMPOSER
# ========================================
print_message "Instalando dependencias de Composer..."
composer install --no-dev --optimize-autoloader --no-interaction

# ========================================
# 5. NPM (si es necesario)
# ========================================
if [ -f "package.json" ]; then
    print_message "Instalando dependencias de NPM..."
    npm ci --production
    npm run build
fi

# ========================================
# 6. MIGRACIONES
# ========================================
print_warning "¿Ejecutar migraciones? (s/n)"
read -r response
if [[ "$response" =~ ^([sS][iI]|[sS])$ ]]; then
    print_message "Ejecutando migraciones..."
    php artisan migrate --force
else
    print_warning "Migraciones omitidas"
fi

# ========================================
# 7. CACHE
# ========================================
print_message "Limpiando y optimizando cache..."
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan cache:clear

print_message "Generando cache optimizado..."
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

# ========================================
# 8. STORAGE LINK
# ========================================
print_message "Creando enlace simbólico de storage..."
php artisan storage:link

# ========================================
# 9. PERMISOS
# ========================================
print_message "Configurando permisos..."
chmod -R 755 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache

# ========================================
# 10. QUEUE RESTART
# ========================================
print_message "Reiniciando workers de cola..."
php artisan queue:restart

# ========================================
# 11. DESACTIVAR MODO MANTENIMIENTO
# ========================================
print_message "Desactivando modo mantenimiento..."
php artisan up

# ========================================
# FINALIZADO
# ========================================
echo ""
echo "========================================="
print_message "DESPLIEGUE COMPLETADO EXITOSAMENTE"
echo "========================================="
echo ""
print_message "Fecha: $(date)"
print_message "Usuario: $(whoami)"
print_message "Servidor: $(hostname)"
echo ""
print_warning "Verifica que la aplicación funcione correctamente en:"
print_warning "https://eva.huv.gov.co"
echo ""
