@echo off
REM Health Check SIMPLE para Sistema EVA (3 contenedores)
REM Hospital Universitario del Valle
REM ===================================================

echo.
echo ==========================================
echo   🏥 SISTEMA EVA - HEALTH CHECK SIMPLE
echo   🐳 Solo 3 contenedores
echo ==========================================
echo.

REM Obtener IP del host
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
    set "ip=%%a"
    set "ip=!ip: =!"
    if not "!ip!"=="" (
        set HOST_IP=!ip!
        goto :ip_found
    )
)

:ip_found
echo 🌐 IP detectada: %HOST_IP%
echo.

REM Verificar Docker
echo 🔍 Verificando Docker...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker no está disponible
    goto :end
)
echo ✅ Docker disponible

REM Verificar contenedores (solo 3)
echo.
echo 📦 Estado de contenedores SIMPLES:
docker ps --filter "name=eva_" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo.
echo 🔍 Realizando Health Checks (3 servicios)...

REM Variables para contadores
set /a TOTAL_CHECKS=0
set /a PASSED_CHECKS=0

REM Health Check - Frontend
set /a TOTAL_CHECKS+=1
echo.
echo 📱 Verificando Frontend (React)...
curl -s -o nul -w "%%{http_code}" http://%HOST_IP%:5173 > temp_status.txt
set /p FRONTEND_STATUS=<temp_status.txt
if "%FRONTEND_STATUS%"=="200" (
    echo ✅ Frontend: Funcionando correctamente
    set /a PASSED_CHECKS+=1
) else (
    echo ❌ Frontend: Error - Código HTTP %FRONTEND_STATUS%
)

REM Health Check - Backend API
set /a TOTAL_CHECKS+=1
echo.
echo 🔗 Verificando Backend API...
curl -s -o nul -w "%%{http_code}" http://%HOST_IP%:8001/api/health > temp_status.txt
set /p BACKEND_STATUS=<temp_status.txt
if "%BACKEND_STATUS%"=="200" (
    echo ✅ Backend API: Funcionando correctamente  
    set /a PASSED_CHECKS+=1
) else (
    echo ❌ Backend API: Error - Código HTTP %BACKEND_STATUS%
)

REM Health Check - MySQL
set /a TOTAL_CHECKS+=1
echo.
echo 🗄️  Verificando MySQL...
docker exec eva_mysql mysqladmin ping -h localhost -u eva_user -peva_password_2024 --silent >nul 2>&1
if %errorlevel%==0 (
    echo ✅ MySQL: Conectando correctamente
    set /a PASSED_CHECKS+=1
) else (
    echo ❌ MySQL: Error de conexión
)

REM Verificar espacio en disco
echo.
echo 💾 Espacio en disco Docker:
docker system df

REM Resumen final
echo.
echo ==========================================
echo   📊 RESUMEN DEL HEALTH CHECK SIMPLE
echo ==========================================
echo.
echo 🎯 Checks realizados: %TOTAL_CHECKS%
echo ✅ Checks exitosos: %PASSED_CHECKS%
set /a FAILED_CHECKS=%TOTAL_CHECKS%-%PASSED_CHECKS%
echo ❌ Checks fallidos: %FAILED_CHECKS%

if %PASSED_CHECKS%==%TOTAL_CHECKS% (
    echo.
    echo 🎉 ¡SISTEMA EVA SIMPLE FUNCIONANDO PERFECTAMENTE!
    echo    Los 3 contenedores están corriendo sin problemas.
    echo.
    echo 🌐 URLs de acceso:
    echo    Frontend: http://%HOST_IP%:5173
    echo    Backend:  http://%HOST_IP%:8001/api
    echo.
    echo ⚡ Configuración SIMPLE:
    echo    - MySQL: Base de datos ✅
    echo    - Backend: PHP/Laravel ✅
    echo    - Frontend: React/Vite ✅
    echo    - Cache: Base de datos (sin Redis)
) else (
    echo.
    echo ⚠️  SISTEMA EVA SIMPLE CON PROBLEMAS
    echo    %FAILED_CHECKS% de %TOTAL_CHECKS% verificaciones fallaron.
    echo.
    echo 🔧 Acciones recomendadas:
    echo    1. Verificar logs: docker-compose -f docker-compose-simple.yml logs
    echo    2. Reiniciar servicios: docker-compose -f docker-compose-simple.yml restart
    echo    3. Verificar configuración de red
)

echo.
echo 💡 Nota: Esta es la versión SIMPLE (3 contenedores)
echo    Si necesitas más performance, considera la versión completa
echo.

:end
REM Limpiar archivos temporales
if exist temp_status.txt del temp_status.txt

echo ==========================================
pause
