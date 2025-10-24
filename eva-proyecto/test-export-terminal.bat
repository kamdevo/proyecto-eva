@echo off
echo === PRUEBAS ENDPOINT EXPORTAR CONSOLIDADO ===
echo.

echo 1. PROBANDO ENDPOINT SIN AUTENTICACION:
echo curl -X GET "http://192.168.2.146:8001/api/v1/planes-mantenimientos/export?anio=2024&formato=excel"
curl -X GET "http://192.168.2.146:8001/api/v1/planes-mantenimientos/export?anio=2024&formato=excel" -v
echo.
echo.

echo 2. PROBANDO ENDPOINT CON TOKEN (necesitas el token real):
echo Primero obtener token de localStorage...
echo.

echo 3. VERIFICANDO SI EL ENDPOINT EXISTE:
echo curl -X GET "http://192.168.2.146:8001/api/v1/planes-mantenimientos"
curl -X GET "http://192.168.2.146:8001/api/v1/planes-mantenimientos" -v
echo.
echo.

echo 4. VERIFICANDO LOGS DEL SERVIDOR:
echo Revisa los logs de Laravel en eva-backend/storage/logs/laravel.log
echo.

pause
