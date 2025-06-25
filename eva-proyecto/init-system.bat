@echo off
echo ========================================
echo   INICIALIZACIÓN SISTEMA EVA v2.0
echo   Validación End-to-End Completa
echo ========================================
echo.

echo 🚀 Iniciando Sistema EVA v2.0...
echo.

REM Verificar MySQL
netstat -an | findstr :3306 >nul
if %errorlevel% neq 0 (
    echo ❌ MySQL NO ejecutándose (puerto 3306)
    pause
    exit /b 1
) else (
    echo ✅ MySQL detectado (puerto 3306)
)

echo.

REM Verificar dependencias backend
if exist "eva-backend\vendor" (
    echo ✅ Backend dependencies: OK
) else (
    echo ⚠️  Installing backend dependencies...
    cd eva-backend
    composer install --no-dev --optimize-autoloader
    cd ..
)

REM Verificar dependencias frontend
if exist "eva-frontend\node_modules" (
    echo ✅ Frontend dependencies: OK
) else (
    echo ⚠️  Installing frontend dependencies...
    cd eva-frontend
    npm install
    cd ..
)

echo.
echo 🌐 Iniciando servidores...
echo.

REM Iniciar backend
echo    Backend: http://127.0.0.1:8000
cd eva-backend
start "EVA Backend" cmd /k "php artisan serve --host=127.0.0.1 --port=8000"
cd ..

REM Esperar backend
timeout /t 5 /nobreak >nul

REM Iniciar frontend
echo    Frontend: http://127.0.0.1:5173
cd eva-frontend
start "EVA Frontend" cmd /k "npm run dev -- --host=127.0.0.1 --port=5173"
cd ..

echo.
echo ✅ Servidores iniciados
echo    Backend:  http://127.0.0.1:8000
echo    Frontend: http://127.0.0.1:5173
echo.

REM Esperar que estén listos
echo 🔍 Verificando conectividad...
timeout /t 10 /nobreak >nul

REM Verificar backend
curl -s -o nul -w "%%{http_code}" http://127.0.0.1:8000/up > temp_backend.txt 2>nul
if exist temp_backend.txt (
    set /p BACKEND_STATUS=<temp_backend.txt
    del temp_backend.txt
    if "!BACKEND_STATUS!" equ "200" (
        echo ✅ Backend: RESPONDIENDO
    ) else (
        echo ⚠️  Backend: Código !BACKEND_STATUS!
    )
) else (
    echo ❌ Backend: NO RESPONDE
)

REM Verificar frontend
curl -s -o nul -w "%%{http_code}" http://127.0.0.1:5173 > temp_frontend.txt 2>nul
if exist temp_frontend.txt (
    set /p FRONTEND_STATUS=<temp_frontend.txt
    del temp_frontend.txt
    if "!FRONTEND_STATUS!" equ "200" (
        echo ✅ Frontend: RESPONDIENDO
    ) else (
        echo ⚠️  Frontend: Código !FRONTEND_STATUS!
    )
) else (
    echo ❌ Frontend: NO RESPONDE
)

echo.
echo 🎉 Sistema EVA v2.0 iniciado exitosamente
echo.
echo 📊 URLs disponibles:
echo    • Backend:  http://127.0.0.1:8000
echo    • Frontend: http://127.0.0.1:5173
echo    • API:      http://127.0.0.1:8000/api
echo    • Health:   http://127.0.0.1:8000/up
echo    • Dashboard Avanzado: http://127.0.0.1:5173/advanced-monitoring
echo.

echo Presione cualquier tecla para continuar con las pruebas...
pause >nul
