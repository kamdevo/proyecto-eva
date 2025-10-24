@echo off
REM Script de Health Check para Sistema EVA Docker
REM Hospital Universitario del Valle
REM ==============================================

echo.
echo ==========================================
echo   🏥 SISTEMA EVA - HEALTH CHECK COMPLETO
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

REM Verificar contenedores
echo.
echo 📦 Estado de contenedores:
docker ps --filter "name=eva_" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo.
echo 🔍 Realizando Health Checks...

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

REM Health Check - Redis
set /a TOTAL_CHECKS+=1
echo.
echo 🟥 Verificando Redis...
docker exec eva_redis redis-cli -a eva_redis_password_2024 ping >nul 2>&1
if %errorlevel%==0 (
    echo ✅ Redis: Respondiendo correctamente
    set /a PASSED_CHECKS+=1
) else (
    echo ❌ Redis: Error de conexión
)

REM Health Check - Storage/Files
set /a TOTAL_CHECKS+=1
echo.
echo 📁 Verificando Storage...
curl -s -o nul -w "%%{http_code}" http://%HOST_IP%:8001/storage > temp_status.txt
set /p STORAGE_STATUS=<temp_status.txt
if "%STORAGE_STATUS%"=="403" (
    echo ✅ Storage: Accesible (403 esperado para directorio)
    set /a PASSED_CHECKS+=1
) else if "%STORAGE_STATUS%"=="200" (
    echo ✅ Storage: Accesible completamente
    set /a PASSED_CHECKS+=1
) else (
    echo ❌ Storage: Error - Código HTTP %STORAGE_STATUS%
)

REM Verificar logs recientes
echo.
echo 📋 Verificando logs recientes...
docker-compose logs --tail=5 --since=5m > recent_logs.txt 2>&1
find /c "ERROR" recent_logs.txt >nul
if %errorlevel%==0 (
    echo ⚠️  Se encontraron errores en logs recientes
    echo    Revisar archivo recent_logs.txt
) else (
    echo ✅ No se encontraron errores críticos en logs
)

REM Verificar uso de recursos
echo.
echo 💻 Uso de recursos:
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}"

REM Verificar espacio en disco
echo.
echo 💾 Espacio en disco Docker:
docker system df

REM Resumen final
echo.
echo ==========================================
echo   📊 RESUMEN DEL HEALTH CHECK
echo ==========================================
echo.
echo 🎯 Checks realizados: %TOTAL_CHECKS%
echo ✅ Checks exitosos: %PASSED_CHECKS%
set /a FAILED_CHECKS=%TOTAL_CHECKS%-%PASSED_CHECKS%
echo ❌ Checks fallidos: %FAILED_CHECKS%

if %PASSED_CHECKS%==%TOTAL_CHECKS% (
    echo.
    echo 🎉 ¡SISTEMA EVA FUNCIONANDO PERFECTAMENTE!
    echo    Todas las verificaciones pasaron exitosamente.
    echo.
    echo 🌐 URLs de acceso:
    echo    Frontend: http://%HOST_IP%:5173
    echo    Backend:  http://%HOST_IP%:8001/api
) else (
    echo.
    echo ⚠️  SISTEMA EVA CON PROBLEMAS
    echo    %FAILED_CHECKS% de %TOTAL_CHECKS% verificaciones fallaron.
    echo.
    echo 🔧 Acciones recomendadas:
    echo    1. Revisar logs: logs-eva-docker.bat
    echo    2. Reiniciar servicios: restart-eva-docker.bat
    echo    3. Verificar configuración de red
)

echo.
echo 📝 Archivos generados:
echo    - recent_logs.txt (logs recientes)
echo    - temp_status.txt (códigos de estado)
echo.

:end
REM Limpiar archivos temporales
if exist temp_status.txt del temp_status.txt

echo ==========================================
pause
