@echo off
REM Script para ver logs de Sistema EVA Docker
REM Hospital Universitario del Valle
REM =============================================

echo.
echo ==========================================
echo   🏥 SISTEMA EVA - LOGS EN TIEMPO REAL
echo ==========================================
echo.

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

echo 📋 Servicios disponibles:
echo    1. Todos los servicios
echo    2. Solo Backend (Laravel)
echo    3. Solo Frontend (React)
echo    4. Solo MySQL
echo    5. Solo Redis
echo    6. Solo Nginx
echo.

set /p CHOICE="Selecciona una opción (1-6): "

if "%CHOICE%"=="1" (
    echo 📊 Mostrando logs de todos los servicios...
    docker-compose -f %COMPOSE_FILE% logs -f
) else if "%CHOICE%"=="2" (
    echo 📊 Mostrando logs del Backend...
    docker-compose -f %COMPOSE_FILE% logs -f backend
) else if "%CHOICE%"=="3" (
    echo 📊 Mostrando logs del Frontend...
    docker-compose -f %COMPOSE_FILE% logs -f frontend
) else if "%CHOICE%"=="4" (
    echo 📊 Mostrando logs de MySQL...
    docker-compose -f %COMPOSE_FILE% logs -f mysql
) else if "%CHOICE%"=="5" (
    echo 📊 Mostrando logs de Redis...
    docker-compose -f %COMPOSE_FILE% logs -f redis
) else if "%CHOICE%"=="6" (
    echo 📊 Mostrando logs de Nginx...
    docker-compose -f %COMPOSE_FILE% logs -f nginx
) else (
    echo ❌ Opción inválida
    pause
    exit /b 1
)

echo.
echo ✅ Logs finalizados
pause
