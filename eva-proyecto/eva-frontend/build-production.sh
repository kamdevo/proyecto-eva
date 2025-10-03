#!/bin/bash

# ========================================
# SCRIPT DE BUILD FRONTEND - EVA
# ========================================

set -e

echo "========================================="
echo "  BUILD FRONTEND EVA - PRODUCCIÓN"
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

# Verificar que existe package.json
if [ ! -f "package.json" ]; then
    echo "Error: No se encontró package.json"
    exit 1
fi

# Verificar que existe .env.production
if [ ! -f ".env.production" ]; then
    print_warning ".env.production no encontrado. Copiando desde .env.production.example"
    cp .env.production.example .env.production
    print_warning "IMPORTANTE: Configura .env.production con los valores correctos"
    exit 1
fi

# Limpiar instalación anterior
print_message "Limpiando node_modules y dist..."
rm -rf node_modules dist

# Instalar dependencias
print_message "Instalando dependencias..."
npm ci

# Ejecutar linter (opcional)
print_message "Ejecutando linter..."
npm run lint --if-present || true

# Build de producción
print_message "Generando build de producción..."
npm run build

# Verificar que se generó el build
if [ ! -d "dist" ]; then
    echo "Error: No se generó el directorio dist"
    exit 1
fi

# Tamaño del build
BUILD_SIZE=$(du -sh dist | cut -f1)
print_message "Build completado. Tamaño: $BUILD_SIZE"

# Crear archivo de versión
echo "{\"version\": \"$(date +%Y%m%d-%H%M%S)\", \"date\": \"$(date)\"}" > dist/version.json

echo ""
echo "========================================="
print_message "BUILD COMPLETADO"
echo "========================================="
echo ""
print_message "El build está listo en: ./dist"
print_warning "Sube el contenido de ./dist a tu servidor web"
echo ""
