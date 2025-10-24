@echo off
chcp 65001 >nul
echo.
echo ========================================
echo   🚀 DEPLOY EVA CON XAMPP MySQL
echo ========================================
echo.

REM Obtener IP del host automáticamente
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /C:"IPv4"') do (
    for /f "tokens=1" %%b in ("%%a") do (
        set HOST_IP=%%b
        goto :found
    )
)
:found

REM Limpiar espacios
set HOST_IP=%HOST_IP: =%

echo 📡 IP detectada: %HOST_IP%
echo.

REM Verificar que XAMPP MySQL esté corriendo en puerto 3307
echo 🔍 Verificando XAMPP MySQL en puerto 3307...
netstat -an | findstr :3307 >nul
if errorlevel 1 (
    echo ❌ ERROR: XAMPP MySQL no está corriendo en puerto 3307
    echo 💡 Por favor:
    echo    1. Abre XAMPP Control Panel como Administrador
    echo    2. Configura MySQL en puerto 3307 
    echo    3. Inicia MySQL en XAMPP
    echo    4. Vuelve a ejecutar este script
    pause
    exit /b 1
)
echo ✅ XAMPP MySQL detectado en puerto 3307
echo.

REM Generar archivo temporal con IP
echo 📝 Generando configuración temporal...
powershell -Command "(Get-Content 'docker-compose-xampp.yml') -replace 'HOST_IP', '%HOST_IP%' | Set-Content 'docker-compose-xampp.tmp.yml'"

REM Limpiar contenedores existentes
echo 🧹 Limpiando contenedores existentes...
docker-compose -f docker-compose-xampp.tmp.yml down 2>nul

echo.
echo 🔨 Construyendo contenedores...
docker-compose -f docker-compose-xampp.tmp.yml build

echo.
echo 🚀 Iniciando servicios EVA con XAMPP...
docker-compose -f docker-compose-xampp.tmp.yml up -d

echo.
echo 📊 Estado de los contenedores:
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo.
echo ========================================
echo   ✅ DEPLOY COMPLETADO
echo ========================================
echo.
echo 🌐 URLs de acceso:
echo    - Frontend: http://%HOST_IP%:5173
echo    - Backend: http://%HOST_IP%:8001
echo    - XAMPP MySQL: %HOST_IP%:3307
echo.
echo 💡 Notas importantes:
echo    - Asegúrate que XAMPP MySQL esté corriendo en puerto 3307
echo    - La base de datos 'gestionthuv' debe existir en XAMPP
echo    - Usuario MySQL: root (sin contraseña por defecto)
echo.
pause
