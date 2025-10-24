@echo off
chcp 65001 >nul
echo.
echo ========================================
echo   🚀 INICIAR EVA CON XAMPP NATIVO
echo ========================================
echo.

REM Obtener IP automáticamente
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /C:"IPv4"') do (
    for /f "tokens=1" %%b in ("%%a") do (
        set HOST_IP=%%b
        goto :found
    )
)
:found
set HOST_IP=%HOST_IP: =%

echo 📡 IP detectada: %HOST_IP%
echo.

REM Verificar XAMPP MySQL
echo 🔍 Verificando XAMPP MySQL...
netstat -an | findstr :3307 >nul
if errorlevel 1 (
    echo ❌ ERROR: XAMPP MySQL no está corriendo en puerto 3307
    echo 💡 Por favor inicia MySQL en XAMPP control panel
    pause
    exit /b 1
)
echo ✅ XAMPP MySQL funcionando
echo.

REM Verificar configuración
if not exist "eva-backend\.env" (
    echo ❌ ERROR: Archivo .env no encontrado
    echo 💡 Ejecuta primero: cambiar-a-xampp.bat
    pause
    exit /b 1
)

echo 🔧 Limpiando caché Laravel...
cd eva-backend
php artisan config:clear >nul 2>&1
cd ..

echo.
echo 🚀 Iniciando Backend Laravel (puerto 8001)...
start "EVA Backend" cmd /k "cd eva-backend && php artisan serve --host=0.0.0.0 --port=8001"

echo.
echo 🚀 Iniciando Frontend React (puerto 5174)...
start "EVA Frontend" cmd /k "cd eva-frontend && npm run dev -- --host=0.0.0.0 --port=5174"

echo.
echo ⏳ Esperando que los servicios inicien...
timeout /t 10 >nul

echo.
echo ========================================
echo   ✅ EVA INICIADO CORRECTAMENTE
echo ========================================
echo.
echo 🌐 URLs de acceso:
echo    - Frontend: http://%HOST_IP%:5174
echo    - Backend API: http://%HOST_IP%:8001/api
echo    - MySQL XAMPP: localhost:3307
echo.
echo 📱 Accesible desde cualquier dispositivo en la red:
echo    - Celular: http://%HOST_IP%:5174
echo    - Tablet: http://%HOST_IP%:5174
echo    - Otro PC: http://%HOST_IP%:5174
echo.
echo 💡 Para parar los servicios ejecuta: parar-eva-xampp.bat
echo.
pause
