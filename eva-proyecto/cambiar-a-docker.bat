@echo off
chcp 65001 >nul
echo.
echo ========================================
echo   🔄 CAMBIAR A MODO DOCKER
echo ========================================
echo.

REM Parar servicios nativos si están corriendo
echo 🛑 Parando servicios nativos...
taskkill /F /IM php.exe >nul 2>&1
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

REM Restaurar .env para Docker
echo 📝 Restaurando configuración Docker...
copy eva-backend\.env.docker-simple eva-backend\.env
powershell -Command "(Get-Content 'eva-backend\.env') -replace 'HOST_IP', '%HOST_IP%' | Set-Content 'eva-backend\.env'"

REM Generar docker-compose temporal
powershell -Command "(Get-Content 'docker-compose-simple.yml') -replace 'HOST_IP', '%HOST_IP%' | Set-Content 'docker-compose-simple.tmp.yml'"

echo.
echo 🚀 Iniciando servicios Docker...
docker-compose -f docker-compose-simple.tmp.yml up -d

echo.
echo ========================================
echo   ✅ CAMBIADO A MODO DOCKER
echo ========================================
echo.
echo 🌐 URLs de acceso:
echo    - Frontend: http://%HOST_IP%:5173
echo    - Backend: http://%HOST_IP%:8001
echo    - MySQL Docker: %HOST_IP%:3306
echo.
pause
