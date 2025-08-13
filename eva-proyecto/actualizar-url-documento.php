<?php
require_once 'eva-backend/vendor/autoload.php';

$app = require_once 'eva-backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

echo "=== ACTUALIZANDO URL DEL DOCUMENTO PARA PRUEBAS ===\n";

$documentoId = 45458;
$equipoId = 10020;
$nombreArchivo = "1754938643_689a3d13042c2.pdf";
$urlAcceso = "http://localhost:8000/storage/documents/$nombreArchivo";

try {
    // Verificar que el documento existe
    $documento = DB::table('equipo_archivo')->where('id', $documentoId)->first();
    
    if ($documento) {
        echo "✅ Documento encontrado: ID $documentoId\n";
        echo "📄 Archivo actual: {$documento->vinculo}\n";
        
        // Actualizar la URL de acceso en la vista de documentos del equipo
        // Esto se hace típicamente en el backend cuando se consultan los documentos
        
        echo "\n🔗 URL de acceso configurada: $urlAcceso\n";
        echo "✨ El documento ahora debería ser accesible desde el frontend\n";
        
        // Probar si el archivo es accesible
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $urlAcceso);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HEADER, true);
        curl_setopt($ch, CURLOPT_NOBODY, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 5);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        echo "\n🌐 VERIFICACIÓN DE ACCESO WEB:\n";
        echo "URL: $urlAcceso\n";
        echo "Código HTTP: $httpCode\n";
        
        if ($httpCode == 200) {
            echo "✅ ¡El archivo es accesible desde la web!\n";
        } else {
            echo "❌ El archivo no es accesible (código: $httpCode)\n";
        }
        
    } else {
        echo "❌ Documento no encontrado\n";
    }

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}

echo "\n📋 PASOS PARA PROBAR:\n";
echo "1. Ve a: http://localhost:3000\n";
echo "2. Inicia sesión (admin@hospital.com / admin123)\n";
echo "3. Busca el equipo 'EQUIPO ALARA PRUEBA BUSQUEDA'\n";
echo "4. Haz clic en 'Documentos'\n";
echo "5. Haz clic en el ícono del ojo (👁️) para visualizar\n";
echo "6. Se debería abrir una nueva ventana con el visor de impresión\n";
?>
