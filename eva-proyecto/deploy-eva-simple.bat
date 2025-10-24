@echo off
REM Script de despliegue SIMPLE para Sistema EVA (3 contenedores)
REM Hospital Universitario del Valle
REM ===============================================================

setlocal enabledelayedexpansion

echo.
echo ==================================================
echo   🏥 SISTEMA EVA - DESPLIEGUE SIMPLE (3 CONTENEDORES)
echo   🐳 MySQL + Backend + Frontend
echo ==================================================
echo.

REM Obtener IP del equipo automáticamente
echo 🔍 Detectando IP del equipo...
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
    set "ip=%%a"
    set "ip=!ip: =!"
    if not "!ip!"=="" (
        echo 🌐 IP detectada: !ip!
        set HOST_IP=!ip!
        goto :ip_found
    )
)

:ip_found
if "%HOST_IP%"=="" (
    echo ❌ No se pudo detectar la IP automáticamente
    set /p HOST_IP="Ingresa la IP manualmente: "
)

echo.
echo 📋 Configuración SIMPLE del despliegue:
echo    - IP del Host: %HOST_IP%
echo    - Frontend: http://%HOST_IP%:5173
echo    - Backend: http://%HOST_IP%:8001
echo    - MySQL: %HOST_IP%:3306
echo.
echo ⚡ Contenedores: SOLO 3 (sin Redis, sin Nginx)
echo.

REM Verificar si Docker está instalado
echo 🔧 Verificando Docker...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker no está instalado o no está en el PATH
    echo    Descarga Docker Desktop desde https://docker.com
    pause
    exit /b 1
)

docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker Compose no está disponible
    pause
    exit /b 1
)

echo ✅ Docker disponible

REM Actualizar archivo .env.docker-simple con la IP detectada
echo 🔧 Configurando variables de entorno SIMPLES...
powershell -Command "(Get-Content 'eva-backend\.env.docker-simple') -replace 'HOST_IP', '%HOST_IP%' | Set-Content 'eva-backend\.env.docker-simple.tmp'"
move eva-backend\.env.docker-simple.tmp eva-backend\.env.docker-simple

REM Actualizar docker-compose-simple.yml con la IP
powershell -Command "(Get-Content 'docker-compose-simple.yml') -replace 'HOST_IP', '%HOST_IP%' | Set-Content 'docker-compose-simple.tmp.yml'"

REM Preguntar si quiere limpiar contenedores anteriores
echo.
set /p CLEAN="¿Limpiar contenedores anteriores? (S/n): "
if /i "%CLEAN%"=="S" (
    echo 🧹 Limpiando contenedores anteriores...
    docker-compose -f docker-compose-simple.tmp.yml down -v
    docker system prune -f
)

REM Construir y levantar servicios
echo.
echo 🚀 Construyendo e iniciando servicios SIMPLES...
echo    Solo 3 contenedores: MySQL + Backend + Frontend
echo    Esto puede tomar varios minutos la primera vez...

docker-compose -f docker-compose-simple.tmp.yml build --no-cache
if %errorlevel% neq 0 (
    echo ❌ Error en la construcción de imágenes
    pause
    exit /b 1
)

docker-compose -f docker-compose-simple.tmp.yml up -d
if %errorlevel% neq 0 (
    echo ❌ Error al iniciar servicios
    pause
    exit /b 1
)

REM Esperar a que los servicios estén listos
echo.
echo ⏳ Esperando a que los servicios estén listos...
timeout /t 30 /nobreak >nul

REM Verificar que los servicios estén corriendo
echo 🔍 Verificando estado de servicios...
docker-compose -f docker-compose-simple.tmp.yml ps

REM Mostrar información de acceso
echo.
echo ====================================================
echo   ✅ SISTEMA EVA SIMPLE DESPLEGADO EXITOSAMENTE
echo ====================================================
echo.
echo 🌐 URLs de acceso desde cualquier equipo en la red:
echo.
echo   Frontend (Aplicación Principal):
echo   📱 http://%HOST_IP%:5173
echo.
echo   Backend (API):
echo   🔗 http://%HOST_IP%:8001/api
echo.
echo   Base de datos:
echo   🗄️  %HOST_IP%:3306 (usuario: eva_user)
echo.
echo 📋 Para monitorear logs:
echo    docker-compose -f docker-compose-simple.tmp.yml logs -f
echo.
echo 🛠️  Para detener el sistema:
echo    docker-compose -f docker-compose-simple.tmp.yml down
echo.
echo 🔄 Para reiniciar servicios:
echo    docker-compose -f docker-compose-simple.tmp.yml restart
echo.
echo 📊 Recursos utilizados:
echo    - Memoria: Menos que la versión completa
echo    - CPU: Más eficiente
echo    - Disco: Solo lo esencial
echo.
echo ====================================================

REM Preguntar si quiere abrir la aplicación
set /p OPEN="¿Abrir la aplicación en el navegador? (S/n): "
if /i "%OPEN%"=="S" (
    start http://%HOST_IP%:5173
)

REM Limpiar archivo temporal
del docker-compose-simple.tmp.yml

echo.
echo ✅ Despliegue SIMPLE completado exitosamente.
echo 🎯 Solo 3 contenedores corriendo: MySQL + Backend + Frontend
echo 🌐 Comparte la URL http://%HOST_IP%:5173 con otros usuarios.
echo.
echo 💡 Nota: Esta versión usa cache en base de datos (sin Redis)
echo    Si necesitas más performance, usa deploy-eva-docker.bat
echo.
pause
