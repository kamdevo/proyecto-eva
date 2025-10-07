@echo off
echo 🎨 Iniciando servidor de preview de React Email...
echo.
echo 📧 Correos disponibles:
echo   • repuesto-pendiente.jsx - Email de preventivo
echo   • nuevo-ticket.jsx - Email de ticket  
echo   • test-email.jsx - Email de prueba
echo.
echo 🌐 El servidor se abrirá en: http://localhost:3000
echo 🔄 Hot reload activado - los cambios se ven en tiempo real
echo.
echo ⚠️  Para detener el servidor presiona Ctrl+C
echo.
pause
cd emails
npm run dev
