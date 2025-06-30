#!/bin/bash

# 🚀 Script de Deployment para EVA Backend
# Autor: Equipo de Desarrollo EVA
# Versión: 1.0.0

set -e  # Salir si cualquier comando falla

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuración
PROJECT_NAME="EVA Backend"
BACKUP_DIR="backups"
LOG_FILE="deployment.log"

# Funciones de utilidad
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a $LOG_FILE
}

success() {
    echo -e "${GREEN}✅ $1${NC}" | tee -a $LOG_FILE
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}" | tee -a $LOG_FILE
}

error() {
    echo -e "${RED}❌ $1${NC}" | tee -a $LOG_FILE
    exit 1
}

# Verificar requisitos
check_requirements() {
    log "Verificando requisitos del sistema..."
    
    # Verificar PHP
    if ! command -v php &> /dev/null; then
        error "PHP no está instalado"
    fi
    
    PHP_VERSION=$(php -r "echo PHP_VERSION;")
    if [[ $(echo "$PHP_VERSION 8.2" | awk '{print ($1 >= $2)}') == 0 ]]; then
        error "Se requiere PHP 8.2 o superior. Versión actual: $PHP_VERSION"
    fi
    success "PHP $PHP_VERSION ✓"
    
    # Verificar Composer
    if ! command -v composer &> /dev/null; then
        error "Composer no está instalado"
    fi
    success "Composer $(composer --version | cut -d' ' -f3) ✓"
    
    # Verificar extensiones PHP requeridas
    REQUIRED_EXTENSIONS=("bcmath" "ctype" "fileinfo" "json" "mbstring" "openssl" "pdo" "tokenizer" "xml" "gd" "zip")
    for ext in "${REQUIRED_EXTENSIONS[@]}"; do
        if ! php -m | grep -q "^$ext$"; then
            error "Extensión PHP requerida no encontrada: $ext"
        fi
    done
    success "Extensiones PHP ✓"
}

# Crear backup antes del deployment
create_backup() {
    log "Creando backup antes del deployment..."
    
    if [ -f ".env" ]; then
        mkdir -p $BACKUP_DIR
        TIMESTAMP=$(date +%Y%m%d_%H%M%S)
        
        # Backup de .env
        cp .env "$BACKUP_DIR/.env.backup.$TIMESTAMP"
        success "Backup de .env creado"
        
        # Backup de base de datos si existe
        if [ -f "database/database.sqlite" ]; then
            cp database/database.sqlite "$BACKUP_DIR/database.backup.$TIMESTAMP.sqlite"
            success "Backup de base de datos creado"
        fi
        
        # Backup de archivos subidos
        if [ -d "storage/app/public" ]; then
            tar -czf "$BACKUP_DIR/uploads.backup.$TIMESTAMP.tar.gz" storage/app/public/
            success "Backup de archivos subidos creado"
        fi
    fi
}

# Instalar dependencias
install_dependencies() {
    log "Instalando dependencias de Composer..."
    
    if [ "$1" == "production" ]; then
        composer install --no-dev --optimize-autoloader --no-interaction
    else
        composer install --optimize-autoloader --no-interaction
    fi
    
    success "Dependencias instaladas"
}

# Configurar aplicación
configure_app() {
    log "Configurando aplicación..."
    
    # Generar clave de aplicación si no existe
    if ! grep -q "APP_KEY=base64:" .env 2>/dev/null; then
        php artisan key:generate --force
        success "Clave de aplicación generada"
    fi
    
    # Crear enlace de storage
    php artisan storage:link
    success "Enlace de storage creado"
    
    # Limpiar cache
    php artisan config:clear
    php artisan route:clear
    php artisan view:clear
    php artisan cache:clear
    success "Cache limpiado"
}

# Ejecutar migraciones
run_migrations() {
    log "Ejecutando migraciones de base de datos..."
    
    # Verificar si hay migraciones pendientes
    if php artisan migrate:status | grep -q "Pending"; then
        warning "Se encontraron migraciones pendientes"
        read -p "¿Desea ejecutar las migraciones? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            php artisan migrate --force
            success "Migraciones ejecutadas"
        else
            warning "Migraciones omitidas"
        fi
    else
        success "No hay migraciones pendientes"
    fi
}

# Optimizar para producción
optimize_production() {
    log "Optimizando para producción..."
    
    # Cache de configuración
    php artisan config:cache
    success "Configuración cacheada"
    
    # Cache de rutas
    php artisan route:cache
    success "Rutas cacheadas"
    
    # Cache de vistas
    php artisan view:cache
    success "Vistas cacheadas"
    
    # Optimizar autoloader
    composer dump-autoload --optimize
    success "Autoloader optimizado"
}

# Verificar salud del sistema
health_check() {
    log "Verificando salud del sistema..."
    
    # Verificar que la aplicación responda
    if command -v curl &> /dev/null; then
        if curl -f -s http://localhost:8000/up > /dev/null; then
            success "Aplicación responde correctamente"
        else
            warning "La aplicación no responde en el puerto 8000"
        fi
    fi
    
    # Ejecutar health check personalizado
    if php artisan system:health-check --format=json > /dev/null 2>&1; then
        success "Health check del sistema pasó"
    else
        warning "Health check del sistema falló"
    fi
}

# Configurar permisos
set_permissions() {
    log "Configurando permisos de archivos..."
    
    # Permisos para directorios de storage y cache
    chmod -R 775 storage/
    chmod -R 775 bootstrap/cache/
    
    # Permisos para logs
    if [ -d "storage/logs" ]; then
        chmod -R 664 storage/logs/*.log 2>/dev/null || true
    fi
    
    success "Permisos configurados"
}

# Función principal
main() {
    echo -e "${BLUE}"
    echo "🏥 =================================="
    echo "   EVA Backend Deployment Script"
    echo "   Versión: 1.0.0"
    echo "==================================${NC}"
    echo
    
    # Determinar entorno
    ENVIRONMENT=${1:-development}
    log "Iniciando deployment para entorno: $ENVIRONMENT"
    
    # Verificar que estamos en el directorio correcto
    if [ ! -f "artisan" ]; then
        error "No se encontró el archivo artisan. ¿Estás en el directorio correcto?"
    fi
    
    # Ejecutar pasos del deployment
    check_requirements
    create_backup
    install_dependencies $ENVIRONMENT
    configure_app
    run_migrations
    set_permissions
    
    if [ "$ENVIRONMENT" == "production" ]; then
        optimize_production
    fi
    
    health_check
    
    echo
    success "🎉 Deployment completado exitosamente!"
    echo
    echo -e "${YELLOW}📋 Próximos pasos:${NC}"
    echo "1. Verificar que la aplicación funcione correctamente"
    echo "2. Revisar los logs en storage/logs/"
    echo "3. Configurar el servidor web (Nginx/Apache)"
    echo "4. Configurar SSL/HTTPS"
    echo "5. Configurar backup automático"
    echo
    echo -e "${BLUE}📚 Documentación: README.md${NC}"
    echo -e "${BLUE}🔧 Health Check: php artisan system:health-check${NC}"
    echo
}

# Manejo de señales
trap 'error "Deployment interrumpido por el usuario"' INT TERM

# Ejecutar función principal con argumentos
main "$@"
