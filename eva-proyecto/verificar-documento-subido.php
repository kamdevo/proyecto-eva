<?php
require_once 'eva-backend/vendor/autoload.php';

$app = require_once 'eva-backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

echo "=== VERIFICANDO DOCUMENTOS DEL EQUIPO DE PRUEBA ===\n";

// Verificar documentos del equipo 4880 (Torre de Cistoscopia)
$equipoId = 4880;

echo "Consultando documentos del equipo ID: $equipoId\n\n";

try {
    // Obtener información del equipo
    $equipo = DB::table('equipos')->where('id', $equipoId)->first();
    if ($equipo) {
        echo "EQUIPO ENCONTRADO:\n";
        echo "ID: {$equipo->id}\n";
        echo "Nombre: {$equipo->name}\n";
        echo "Marca: {$equipo->marca}\n";
        echo "Modelo: {$equipo->modelo}\n";
        echo "Serie: {$equipo->serial}\n";
        echo "---\n\n";
    }

    // Buscar documentos recientes (últimos 10)
    $documentosRecientes = DB::select("
        SELECT ea.*, a.name as tipo_documento, ea.created_at as fecha_subida
        FROM equipo_archivo ea
        INNER JOIN archivos a ON ea.archivo_id = a.id
        WHERE ea.equipo_id = ?
        ORDER BY ea.created_at DESC
        LIMIT 10
    ", [$equipoId]);

    echo "DOCUMENTOS ENCONTRADOS (últimos 10):\n";
    if (count($documentosRecientes) > 0) {
        foreach ($documentosRecientes as $doc) {
            echo "- ID: {$doc->id}\n";
            echo "  Tipo: {$doc->tipo_documento}\n";
            echo "  Fecha: {$doc->fecha_subida}\n";
            echo "  Vínculo: {$doc->vinculo}\n";
            if ($doc->otro) {
                echo "  Info adicional: {$doc->otro}\n";
            }
            echo "  ---\n";
        }
    } else {
        echo "No se encontraron documentos para este equipo.\n";
    }

    // Verificar si hay documentos subidos HOY
    $hoy = date('Y-m-d');
    $documentosHoy = DB::select("
        SELECT ea.*, a.name as tipo_documento, ea.created_at as fecha_subida
        FROM equipo_archivo ea
        INNER JOIN archivos a ON ea.archivo_id = a.id
        WHERE ea.equipo_id = ? AND DATE(ea.created_at) = ?
        ORDER BY ea.created_at DESC
    ", [$equipoId, $hoy]);

    echo "\nDOCUMENTOS SUBIDOS HOY ($hoy):\n";
    if (count($documentosHoy) > 0) {
        foreach ($documentosHoy as $doc) {
            echo "✅ DOCUMENTO RECIENTE ENCONTRADO:\n";
            echo "   ID: {$doc->id}\n";
            echo "   Tipo: {$doc->tipo_documento}\n";
            echo "   Fecha: {$doc->fecha_subida}\n";
            echo "   Archivo: {$doc->vinculo}\n";
            
            // Generar link directo
            $baseUrl = "http://localhost:3000"; // Ajusta según tu configuración
            $linkDirecto = "$baseUrl/equipos/{$equipoId}/documentos";
            echo "   🔗 LINK DIRECTO: $linkDirecto\n";
            echo "   ---\n";
        }
    } else {
        echo "No se encontraron documentos subidos hoy.\n";
        echo "El documento puede haberse subido en otra fecha.\n";
    }

    // Total de documentos
    $totalDocs = DB::table('equipo_archivo')->where('equipo_id', $equipoId)->count();
    echo "\nTOTAL DE DOCUMENTOS EN EL EQUIPO: $totalDocs\n";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}

echo "\n=== LINKS DE ACCESO ===\n";
echo "🌐 Frontend: http://localhost:3000\n";
echo "📋 Equipo específico: http://localhost:3000/equipos/$equipoId\n";
echo "📄 Documentos del equipo: http://localhost:3000/equipos/$equipoId/documentos\n";
echo "🔧 Backend API: http://localhost:8000\n";
?>
