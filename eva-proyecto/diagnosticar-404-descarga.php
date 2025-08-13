<?php
require_once 'eva-backend/vendor/autoload.php';

$app = require_once 'eva-backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

echo "=== DIAGNÓSTICO DEL ERROR 404 EN DESCARGA ===\n";

// ID del documento que encontramos antes
$documentoId = 45458;
$equipoId = 10020;

echo "Documento ID: $documentoId\n";
echo "Equipo ID: $equipoId\n\n";

try {
    // Verificar que el documento existe
    $documento = DB::select("
        SELECT 
            ea.id, 
            ea.equipo_id, 
            ea.archivo_id,
            ea.vinculo,
            ea.otro,
            ea.created_at,
            a.name as tipo_documento
        FROM equipo_archivo ea
        INNER JOIN archivos a ON ea.archivo_id = a.id
        WHERE ea.id = ?
    ", [$documentoId]);

    if (count($documento) > 0) {
        $doc = $documento[0];
        echo "✅ DOCUMENTO ENCONTRADO EN BD:\n";
        echo "   ID: {$doc->id}\n";
        echo "   Equipo ID: {$doc->equipo_id}\n";
        echo "   Archivo ID: {$doc->archivo_id}\n";
        echo "   Tipo: {$doc->tipo_documento}\n";
        echo "   Archivo: {$doc->vinculo}\n";
        echo "   Fecha: {$doc->created_at}\n";
        
        // Verificar si el archivo físico existe
        $rutaArchivo = "eva-backend/storage/app/documents/{$doc->vinculo}";
        echo "\n🔍 VERIFICANDO ARCHIVO FÍSICO:\n";
        echo "   Ruta esperada: $rutaArchivo\n";
        
        if (file_exists($rutaArchivo)) {
            echo "   ✅ Archivo existe físicamente\n";
            echo "   📏 Tamaño: " . filesize($rutaArchivo) . " bytes\n";
        } else {
            echo "   ❌ Archivo NO existe físicamente\n";
            
            // Buscar en otras ubicaciones posibles
            $posiblesRutas = [
                "eva-backend/storage/app/public/documents/{$doc->vinculo}",
                "eva-backend/public/storage/documents/{$doc->vinculo}",
                "eva-backend/storage/documents/{$doc->vinculo}",
                "eva-proyecto/eva-backend/storage/app/documents/{$doc->vinculo}"
            ];
            
            echo "   🔍 Buscando en otras ubicaciones:\n";
            foreach ($posiblesRutas as $ruta) {
                if (file_exists($ruta)) {
                    echo "   ✅ ENCONTRADO EN: $ruta\n";
                    break;
                } else {
                    echo "   ❌ No está en: $ruta\n";
                }
            }
        }
        
    } else {
        echo "❌ DOCUMENTO NO ENCONTRADO EN BD\n";
    }

    // Verificar las rutas de la API
    echo "\n🛣️ VERIFICANDO RUTAS DE API:\n";
    
    // Intentar diferentes URLs
    $urlsProbar = [
        "http://localhost:8000/api/v1/equipos/$equipoId/documents/$documentoId/download",
        "http://localhost:8000/api/equipos/$equipoId/documents/$documentoId/download", 
        "http://localhost:8000/api/v1/documents/$documentoId/download",
        "http://localhost:8000/api/documents/$documentoId/download"
    ];

    foreach ($urlsProbar as $url) {
        echo "Probando: $url\n";
        
        // Usar curl para probar la URL
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HEADER, true);
        curl_setopt($ch, CURLOPT_NOBODY, true); // Solo headers
        curl_setopt($ch, CURLOPT_TIMEOUT, 5);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        echo "   Código HTTP: $httpCode\n";
        
        if ($httpCode == 200) {
            echo "   ✅ ESTA URL FUNCIONA!\n";
            break;
        } elseif ($httpCode == 404) {
            echo "   ❌ 404 Not Found\n";
        } elseif ($httpCode == 0) {
            echo "   ⚠️ No se pudo conectar\n";
        } else {
            echo "   ⚠️ Código: $httpCode\n";
        }
        echo "\n";
    }

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}

echo "\n=== SOLUCIONES POSIBLES ===\n";
echo "1. Verificar que el servidor Laravel esté corriendo en puerto 8000\n";
echo "2. Revisar las rutas en routes/api.php\n";
echo "3. Verificar permisos de archivos en storage/\n";
echo "4. Comprobar configuración de storage en Laravel\n";
?>
