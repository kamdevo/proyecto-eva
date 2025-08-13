<?php
echo "=== VERIFICANDO NUEVA UBICACIÓN DE ARCHIVO ===\n";

$documentoId = 45458;
$equipoId = 10020;
$nombreArchivo = "1754938643_689a3d13042c2.pdf";
$nuevaUrlAcceso = "http://localhost:8000/storage/equipos/archivos/$nombreArchivo";

echo "📄 Archivo: $nombreArchivo\n";
echo "🔗 Nueva URL: $nuevaUrlAcceso\n\n";

// Probar si el archivo es accesible con la nueva URL
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $nuevaUrlAcceso);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HEADER, true);
curl_setopt($ch, CURLOPT_NOBODY, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 5);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "🌐 VERIFICACIÓN DE ACCESO WEB:\n";
echo "URL: $nuevaUrlAcceso\n";
echo "Código HTTP: $httpCode\n";

if ($httpCode == 200) {
    echo "✅ ¡El archivo es accesible desde la web!\n";
    echo "\n🎉 FUNCIONALIDAD LISTA PARA PRUEBAS:\n";
    echo "1. Ve a: http://localhost:3000\n";
    echo "2. Inicia sesión (admin@hospital.com / admin123)\n";
    echo "3. Busca el equipo 'EQUIPO ALARA PRUEBA BUSQUEDA'\n";
    echo "4. Haz clic en 'Documentos'\n";
    echo "5. Haz clic en el ícono del ojo (👁️) para visualizar\n";
    echo "6. Se abrirá una nueva ventana con:\n";
    echo "   - Visor del PDF embebido\n";
    echo "   - Botón 'Imprimir' para abrir la interfaz del navegador\n";
    echo "   - Se abrirá automáticamente el diálogo de impresión\n";
} elseif ($httpCode == 404) {
    echo "❌ Archivo no encontrado (404)\n";
} elseif ($httpCode == 403) {
    echo "❌ Sin permisos de acceso (403)\n";
} else {
    echo "❌ Error de acceso (código: $httpCode)\n";
}

echo "\n📋 INFORMACIÓN TÉCNICA:\n";
echo "- La funcionalidad de visualización ya está implementada\n";
echo "- Al hacer clic en 'Visualizar' se abre una ventana con:\n";
echo "  * Iframe del PDF\n";
echo "  * Botón de impresión manual\n";
echo "  * Diálogo de impresión automático después de 1 segundo\n";
echo "- La URL del documento debe configurarse correctamente en el backend\n";
?>
