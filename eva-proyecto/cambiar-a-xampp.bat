@echo off
chcp 65001 >nul
echo.
echo ========================================
echo   🔄 CAMBIAR A MODO XAMPP NATIVO
echo ========================================
echo.

REM Parar contenedores Docker si están corriendo
echo 🛑 Parando contenedores Docker...
docker-compose -f docker-compose-simple.tmp.yml down >nul 2>&1

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
echo 🔍 Verificando XAMPP MySQL en puerto 3307...
netstat -an | findstr :3307 >nul
if errorlevel 1 (
    echo ❌ ERROR: XAMPP MySQL no está corriendo en puerto 3307
    echo 💡 Por favor inicia MySQL en XAMPP control panel
    pause
    exit /b 1
)
echo ✅ XAMPP MySQL detectado en puerto 3307
echo.

REM Configurar .env para XAMPP
echo 📝 Configurando para XAMPP...
powershell -Command "(Get-Content 'eva-backend\.env.docker-simple') -replace 'DB_HOST=mysql', 'DB_HOST=localhost' -replace 'DB_PORT=3306', 'DB_PORT=3307' -replace 'DB_USERNAME=eva_user', 'DB_USERNAME=root' -replace 'DB_PASSWORD=eva_password_2024', 'DB_PASSWORD=' -replace 'APP_ENV=production', 'APP_ENV=development' -replace 'APP_DEBUG=false', 'APP_DEBUG=true' -replace 'LOG_LEVEL=error', 'LOG_LEVEL=debug' -replace 'DOCKER_ENVIRONMENT=true', 'DOCKER_ENVIRONMENT=false' -replace '192.168.56.1', '%HOST_IP%' -replace ':5173', ':5174' | Set-Content 'eva-backend\.env'"

REM Configurar frontend .env
powershell -Command "(Get-Content 'eva-frontend\.env') -replace '192.168.56.1', '%HOST_IP%' -replace ':5173', ':5174' | Set-Content 'eva-frontend\.env'"

echo.
echo ========================================
echo   ✅ CONFIGURADO PARA XAMPP
echo ========================================
echo.
echo 🌐 URLs que estarán disponibles:
echo    - Frontend: http://%HOST_IP%:5174
echo    - Backend: http://%HOST_IP%:8001
echo    - MySQL XAMPP: localhost:3307
echo.
echo 💡 Para iniciar los servicios ejecuta:
echo    iniciar-eva-xampp.bat
echo.
pause
