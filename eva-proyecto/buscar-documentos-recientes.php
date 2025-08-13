<?php
require_once 'eva-backend/vendor/autoload.php';

$app = require_once 'eva-backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

echo "=== BUSCANDO DOCUMENTOS RECIENTES EN TODOS LOS EQUIPOS ===\n";

$hoy = date('Y-m-d');
$ayer = date('Y-m-d', strtotime('-1 day'));

echo "Fecha actual: $hoy\n";
echo "Fecha ayer: $ayer\n\n";

try {
    // Buscar documentos de los últimos 2 días
    $documentosRecientes = DB::select("
        SELECT 
            ea.id, 
            ea.equipo_id, 
            e.name as equipo_nombre,
            e.marca,
            e.modelo,
            a.name as tipo_documento, 
            ea.created_at as fecha_subida,
            ea.vinculo,
            ea.otro
        FROM equipo_archivo ea
        INNER JOIN archivos a ON ea.archivo_id = a.id
        INNER JOIN equipos e ON ea.equipo_id = e.id
        WHERE DATE(ea.created_at) >= ?
        ORDER BY ea.created_at DESC
        LIMIT 20
    ", [$ayer]);

    echo "DOCUMENTOS SUBIDOS EN LOS ÚLTIMOS 2 DÍAS:\n";
    if (count($documentosRecientes) > 0) {
        foreach ($documentosRecientes as $doc) {
            echo "✅ DOCUMENTO ENCONTRADO:\n";
            echo "   ID del documento: {$doc->id}\n";
            echo "   Equipo ID: {$doc->equipo_id}\n";
            echo "   Equipo: {$doc->equipo_nombre}\n";
            echo "   Marca: {$doc->marca}\n";
            echo "   Modelo: {$doc->modelo}\n";
            echo "   Tipo documento: {$doc->tipo_documento}\n";
            echo "   Fecha subida: {$doc->fecha_subida}\n";
            echo "   Archivo: {$doc->vinculo}\n";
            if ($doc->otro) {
                echo "   Info adicional: {$doc->otro}\n";
            }
            
            // Generar links directos
            echo "   🔗 LINKS DE ACCESO:\n";
            echo "      - Equipo: http://localhost:3000/equipos/{$doc->equipo_id}\n";
            echo "      - Documentos: http://localhost:3000/equipos/{$doc->equipo_id}/documentos\n";
            echo "      - Ver archivo: http://localhost:8000/api/v1/equipos/{$doc->equipo_id}/documents/{$doc->id}/download\n";
            echo "   ========================\n\n";
        }
    } else {
        echo "❌ No se encontraron documentos subidos en los últimos 2 días.\n\n";
    }

    // Verificar documentos de HOY específicamente
    $documentosHoy = DB::select("
        SELECT 
            ea.id, 
            ea.equipo_id, 
            e.name as equipo_nombre,
            a.name as tipo_documento, 
            ea.created_at as fecha_subida,
            ea.vinculo
        FROM equipo_archivo ea
        INNER JOIN archivos a ON ea.archivo_id = a.id
        INNER JOIN equipos e ON ea.equipo_id = e.id
        WHERE DATE(ea.created_at) = ?
        ORDER BY ea.created_at DESC
    ", [$hoy]);

    echo "DOCUMENTOS SUBIDOS HOY ($hoy):\n";
    if (count($documentosHoy) > 0) {
        foreach ($documentosHoy as $doc) {
            echo "🎉 DOCUMENTO DE HOY:\n";
            echo "   Documento ID: {$doc->id}\n";
            echo "   Equipo: {$doc->equipo_nombre} (ID: {$doc->equipo_id})\n";
            echo "   Tipo: {$doc->tipo_documento}\n";
            echo "   Hora: {$doc->fecha_subida}\n";
            echo "   🔗 ACCESO DIRECTO: http://localhost:3000/equipos/{$doc->equipo_id}/documentos\n";
            echo "   ---\n";
        }
    } else {
        echo "No hay documentos subidos hoy.\n";
    }

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}

echo "\n=== INFORMACIÓN DE ACCESO ===\n";
echo "🌐 Sistema: http://localhost:3000\n";
echo "👤 Para ingresar, necesitas:\n";
echo "   - Email: admin@hospital.com\n";
echo "   - Password: admin123\n";
echo "\n🔍 Si subiste un documento:\n";
echo "   1. Ve a: http://localhost:3000\n";
echo "   2. Inicia sesión\n";
echo "   3. Busca el equipo en la lista\n";
echo "   4. Haz clic en 'Documentos' del equipo\n";
?>
