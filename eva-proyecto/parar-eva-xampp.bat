@echo off
chcp 65001 >nul
echo.
echo ========================================
echo   🛑 PARAR EVA XAMPP NATIVO
echo ========================================
echo.

echo 🛑 Parando Backend Laravel...
taskkill /F /IM php.exe >nul 2>&1

echo 🛑 Parando Frontend React...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5174') do taskkill /f /pid %%a >nul 2>&1

echo 🛑 Parando Node.js (si hay procesos)...
taskkill /F /IM node.exe >nul 2>&1

echo.
echo ✅ Servicios EVA detenidos
echo.
echo 💡 XAMPP MySQL sigue corriendo (no afectado)
echo 💡 Para iniciar de nuevo ejecuta: iniciar-eva-xampp.bat
echo.
pause
