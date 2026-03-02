#!/bin/bash
# ============================================================
# SCRIPT DE CONFIGURACIÓN - EVA en cPanel
# Ejecutar desde la raíz del proyecto (eva-proyecto/)
# ============================================================

echo "=========================================="
echo " CONFIGURANDO EVA EN CPANEL"
echo "=========================================="

# ============================================================
# PASO 1: BACKEND - Instalar dependencias PHP
# ============================================================
echo ""
echo "[PASO 1/5] Instalando dependencias de Laravel (composer install)..."
cd eva-backend

# Verificar si composer está disponible
if command -v composer &> /dev/null; then
    composer install --optimize-autoloader --no-dev
elif [ -f ~/composer.phar ]; then
    php ~/composer.phar install --optimize-autoloader --no-dev
else
    echo "ERROR: composer no encontrado. Instalar con:"
    echo "  curl -sS https://getcomposer.org/installer | php"
    echo "  mv composer.phar ~/composer.phar"
    exit 1
fi

echo "[OK] Dependencias de Laravel instaladas"

# ============================================================
# PASO 2: BACKEND - Crear archivo .env
# ============================================================
echo ""
echo "[PASO 2/5] Creando archivo .env..."

if [ ! -f .env ]; then
    cp .env.example .env
    echo "[OK] .env creado desde .env.example"
    echo ""
    echo "  >>> IMPORTANTE: Edita eva-backend/.env y cambia:"
    echo "  >>> DB_PASSWORD=TU_CONTRASEÑA_AQUI  ->  DB_PASSWORD=tu_contraseña_real"
    echo ""
else
    echo "[INFO] .env ya existe, no se sobreescribe"
fi

# ============================================================
# PASO 3: BACKEND - Permisos de carpetas
# ============================================================
echo ""
echo "[PASO 3/5] Configurando permisos..."

# Crear carpetas necesarias si no existen
mkdir -p storage/framework/cache/data
mkdir -p storage/framework/sessions
mkdir -p storage/framework/views
mkdir -p storage/logs
mkdir -p bootstrap/cache

# Dar permisos de escritura
chmod -R 775 storage
chmod -R 775 bootstrap/cache

# Crear archivo de log si no existe
touch storage/logs/laravel.log
chmod 664 storage/logs/laravel.log

echo "[OK] Permisos configurados"

# ============================================================
# PASO 4: BACKEND - Comandos de Laravel
# ============================================================
echo ""
echo "[PASO 4/5] Ejecutando comandos de Laravel..."

# Limpiar cache
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear

# Generar cache de configuración para producción
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Crear link simbólico para storage público
php artisan storage:link 2>/dev/null || echo "[INFO] storage:link ya existe o no se pudo crear"

echo "[OK] Laravel configurado"

# ============================================================
# PASO 5: Volver a raíz y verificar
# ============================================================
cd ..
echo ""
echo "[PASO 5/5] Verificando instalación..."

# Verificar que vendor existe
if [ -d "eva-backend/vendor" ]; then
    echo "[OK] vendor/ existe"
else
    echo "[ERROR] vendor/ NO existe - composer install falló"
fi

# Verificar que .env existe
if [ -f "eva-backend/.env" ]; then
    echo "[OK] .env existe"
else
    echo "[ERROR] .env NO existe"
fi

# Verificar permisos de storage
if [ -w "eva-backend/storage" ]; then
    echo "[OK] storage/ tiene permisos de escritura"
else
    echo "[ERROR] storage/ NO tiene permisos de escritura"
fi

# Verificar frontend
if [ -f "eva-frontend/dist/index.html" ]; then
    echo "[OK] Frontend dist/index.html existe"
else
    echo "[ERROR] Frontend dist/index.html NO existe"
fi

if [ -f "eva-frontend/dist/.htaccess" ]; then
    echo "[OK] Frontend dist/.htaccess existe"
else
    echo "[ERROR] Frontend dist/.htaccess NO existe"
fi

echo ""
echo "=========================================="
echo " CONFIGURACIÓN COMPLETADA"
echo "=========================================="
echo ""
echo " RECUERDA:"
echo " 1. Editar eva-backend/.env con la contraseña real de MySQL"
echo " 2. Importar la base de datos si aún no lo has hecho"
echo " 3. Verificar que el dominio apunte correctamente:"
echo "    - eva2.huv.gov.co -> eva-frontend/dist/"
echo "    - Backend API -> eva-backend/public/"
echo ""
echo " Para probar el backend, visita:"
echo "    http://eva2.huv.gov.co/api (si todo apunta al backend)"
echo "    o la URL del backend que tengas configurada"
echo ""
