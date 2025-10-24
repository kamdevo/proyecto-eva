@echo off
REM Script para detener Sistema EVA Docker
REM Hospital Universitario del Valle
REM ====================================

echo.
echo ==========================================
echo   🏥 SISTEMA EVA - DETENIENDO SERVICIOS
echo ==========================================
echo.

REM Verificar si Docker está corriendo
docker ps >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker no está corriendo o no está disponible
    pause
    exit /b 1
)

REM Buscar archivo docker-compose
if exist "docker-compose.yml" (
    set COMPOSE_FILE=docker-compose.yml
) else if exist "docker-compose.tmp.yml" (
    set COMPOSE_FILE=docker-compose.tmp.yml
) else (
    echo ❌ No se encontró archivo docker-compose.yml
    pause
    exit /b 1
)

echo 🛑 Deteniendo servicios de Sistema EVA...
docker-compose -f %COMPOSE_FILE% down

echo.
echo 📊 Estado final de contenedores:
docker ps -a --filter "name=eva_"

echo.
echo ✅ Sistema EVA detenido correctamente
echo.

REM Preguntar si quiere limpiar volúmenes
set /p CLEAN_VOLUMES="¿Eliminar volúmenes de datos? (S/n): "
if /i "%CLEAN_VOLUMES%"=="S" (
    echo 🗑️  Eliminando volúmenes...
    docker-compose -f %COMPOSE_FILE% down -v
    echo ✅ Volúmenes eliminados
)

pause
