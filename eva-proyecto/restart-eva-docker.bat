@echo off
REM Script para reiniciar Sistema EVA Docker
REM Hospital Universitario del Valle
REM =========================================

echo.
echo ==========================================
echo   🏥 SISTEMA EVA - REINICIO DE SERVICIOS
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

echo 📋 Opciones de reinicio:
echo    1. Reiniciar todos los servicios
echo    2. Reiniciar solo Backend
echo    3. Reiniciar solo Frontend
echo    4. Reiniciar solo MySQL
echo    5. Reinicio completo (down + up)
echo.

set /p CHOICE="Selecciona una opción (1-5): "

if "%CHOICE%"=="1" (
    echo 🔄 Reiniciando todos los servicios...
    docker-compose -f %COMPOSE_FILE% restart
) else if "%CHOICE%"=="2" (
    echo 🔄 Reiniciando Backend...
    docker-compose -f %COMPOSE_FILE% restart backend
) else if "%CHOICE%"=="3" (
    echo 🔄 Reiniciando Frontend...
    docker-compose -f %COMPOSE_FILE% restart frontend
) else if "%CHOICE%"=="4" (
    echo 🔄 Reiniciando MySQL...
    docker-compose -f %COMPOSE_FILE% restart mysql
) else if "%CHOICE%"=="5" (
    echo 🔄 Reinicio completo (down + up)...
    docker-compose -f %COMPOSE_FILE% down
    timeout /t 5 /nobreak >nul
    docker-compose -f %COMPOSE_FILE% up -d
) else (
    echo ❌ Opción inválida
    pause
    exit /b 1
)

echo.
echo ✅ Reinicio completado

REM Mostrar estado de servicios
echo 📊 Estado de servicios después del reinicio:
docker-compose -f %COMPOSE_FILE% ps

pause
