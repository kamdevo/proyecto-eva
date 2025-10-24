<?php
echo "=== DIAGNÓSTICO DETALLADO DE AUTENTICACIÓN ===\n\n";

echo "🔍 PASOS PARA DIAGNOSTICAR EL PROBLEMA:\n\n";

echo "1. ⚡ VERIFICAR ENDPOINTS BÁSICOS:\n";
$endpoints = [
    "http://192.168.2.146:8001/api/v1/user",
    "http://192.168.2.146:8001/sanctum/csrf-cookie",
    "http://192.168.2.146:8001/api/auth/login",
];

foreach ($endpoints as $endpoint) {
    echo "   🔗 $endpoint\n";
}

echo "\n2. 🧪 COMANDOS DE PRUEBA MANUAL:\n\n";

echo "   💻 Prueba directa del endpoint de usuario:\n";
echo "   curl -H \"Accept: application/json\" \\\n";
echo "        -H \"Content-Type: application/json\" \\\n";
echo "        \"http://192.168.2.146:8001/api/v1/user\"\n\n";

echo "   🍪 Prueba CSRF cookie:\n";
echo "   curl -c cookies.txt \\\n";
echo "        \"http://192.168.2.146:8001/sanctum/csrf-cookie\"\n\n";

echo "3. 🔍 VERIFICAR EN EL NAVEGADOR:\n";
echo "   - Abre DevTools (F12)\n";
echo "   - Ve a Network tab\n";
echo "   - Recarga la página\n";
echo "   - Busca la request a: /api/v1/user\n";
echo "   - Verifica:\n";
echo "     ✅ Status Code (debe ser 200)\n";
echo "     ✅ Request Headers (Authorization: Bearer ...)\n";
echo "     ✅ Response (debe contener datos del usuario)\n\n";

echo "4. 🧹 LIMPIAR CACHE Y STORAGE:\n";
echo "   - Ctrl+Shift+Delete (limpiar todo)\n";
echo "   - O manualmente:\n";
echo "     - localStorage.clear()\n";
echo "     - sessionStorage.clear()\n";
echo "     - Cookies del dominio\n\n";

echo "5. 📊 VERIFICAR DATOS EN LOCALSTORAGE:\n";
echo "   En DevTools > Application > LocalStorage:\n";
echo "   - eva_auth_token: [debe existir]\n";
echo "   - eva_user: [debe existir con datos JSON]\n\n";

echo "6. 🔧 POSIBLES PROBLEMAS Y SOLUCIONES:\n\n";

echo "   A) PROBLEMA DE CORS:\n";
echo "   ❌ Síntoma: Error 'CORS policy' en console\n";
echo "   ✅ Solución: Verificar config/cors.php en backend\n";
echo "   ✅ Verificar que backend esté en 192.168.2.146:8001\n\n";

echo "   B) PROBLEMA DE TOKEN EXPIRADO:\n";
echo "   ❌ Síntoma: Error 401 Unauthorized\n";
echo "   ✅ Solución: Hacer login nuevamente\n";
echo "   ✅ Verificar configuración de expiración en backend\n\n";

echo "   C) PROBLEMA DE HEADERS:\n";
echo "   ❌ Síntoma: Token no se envía en requests\n";
echo "   ✅ Solución: Verificar httpService.js\n";
echo "   ✅ Verificar que setAuthToken() funcione\n\n";

echo "   D) PROBLEMA DE PARSING JSON:\n";
echo "   ❌ Síntoma: Error al parsear eva_user de localStorage\n";
echo "   ✅ Solución: Limpiar localStorage y hacer login nuevo\n\n";

echo "7. 🎯 SCRIPT DE DIAGNÓSTICO PARA BROWSER:\n\n";
echo "Pega esto en la Console del navegador:\n\n";
echo "```javascript\n";
echo "// Verificar localStorage\n";
echo "console.log('Token:', localStorage.getItem('eva_auth_token'));\n";
echo "console.log('User:', localStorage.getItem('eva_user'));\n\n";
echo "// Hacer request manual\n";
echo "fetch('http://192.168.2.146:8001/api/v1/user', {\n";
echo "  headers: {\n";
echo "    'Authorization': 'Bearer ' + localStorage.getItem('eva_auth_token'),\n";
echo "    'Accept': 'application/json',\n";
echo "    'Content-Type': 'application/json'\n";
echo "  }\n";
echo "})\n";
echo ".then(r => r.json())\n";
echo ".then(d => console.log('API Response:', d))\n";
echo ".catch(e => console.error('API Error:', e));\n";
echo "```\n\n";

echo "8. 🚨 SI NADA FUNCIONA - RESET COMPLETO:\n\n";
echo "   A) BACKEND:\n";
echo "   - Reiniciar servidor: php artisan serve --host=0.0.0.0 --port=8001\n";
echo "   - Limpiar cache: php artisan cache:clear\n";
echo "   - Verificar .env: APP_URL=http://192.168.2.146:8001\n\n";
echo "   B) FRONTEND:\n";
echo "   - Parar servidor (Ctrl+C)\n";
echo "   - Limpiar node_modules: rm -rf node_modules && npm install\n";
echo "   - Reiniciar: npm run dev\n\n";
echo "   C) NAVEGADOR:\n";
echo "   - Cerrar todas las pestañas\n";
echo "   - Limpiar datos del sitio completamente\n";
echo "   - Abrir en incógnito\n\n";

echo "9. 📋 CHECKLIST DE VERIFICACIÓN:\n\n";
echo "   □ Backend corriendo en 192.168.2.146:8001\n";
echo "   □ Frontend corriendo y conectando a la IP correcta\n";
echo "   □ CORS configurado correctamente\n";
echo "   □ Token válido en localStorage\n";
echo "   □ User data válido en localStorage\n";
echo "   □ Endpoint /api/v1/user responde correctamente\n";
echo "   □ Headers Authorization se envían\n";
echo "   □ No hay errores de CORS/Network en console\n\n";

echo "🔍 EJECUTA ESTAS PRUEBAS Y REPORTA LOS RESULTADOS:\n";
echo "1. ¿Qué aparece en Network tab al recargar?\n";
echo "2. ¿Hay errores en Console?\n";
echo "3. ¿Qué devuelve el script de diagnóstico?\n";
echo "4. ¿El token existe en localStorage?\n\n";

echo "🎯 CON ESTA INFORMACIÓN PODREMOS IDENTIFICAR EL PROBLEMA EXACTO.\n";
?>
