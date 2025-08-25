<?php

require_once 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

use Illuminate\Support\Facades\DB;

echo "🔍 BUSCANDO EQUIPO CON ARCHIVO test_excel_1752946957.xlsx...\n";
echo "=" . str_repeat("=", 60) . "\n\n";

try {
    $relacion = DB::table('equipo_archivo')
        ->leftJoin('equipos', 'equipo_archivo.equipo_id', '=', 'equipos.id')
        ->leftJoin('archivos', 'equipo_archivo.archivo_id', '=', 'archivos.id')
        ->where('equipo_archivo.vinculo', 'test_excel_1752946957.xlsx')
        ->select(
            'equipos.id as equipo_id',
            'equipos.name as equipo_nombre',
            'equipos.code as equipo_codigo',
            'equipos.marca',
            'equipos.modelo',
            'archivos.name as tipo_documento',
            'equipo_archivo.created_at',
            'equipo_archivo.otro as descripcion'
        )
        ->first();
    
    if ($relacion) {
        echo "✅ ENCONTRADO!\n";
        echo "🎯 Equipo ID: {$relacion->equipo_id}\n";
        echo "📝 Nombre: " . ($relacion->equipo_nombre ?: 'Sin nombre') . "\n";
        echo "🔢 Código: " . ($relacion->equipo_codigo ?: 'Sin código') . "\n";
        echo "🏭 Marca: " . ($relacion->marca ?: 'Sin marca') . "\n";
        echo "📋 Tipo: " . ($relacion->tipo_documento ?: 'Sin tipo') . "\n";
        echo "📅 Fecha: {$relacion->created_at}\n";
        echo "🔗 URL: /storage/equipos/archivos/test_excel_1752946957.xlsx\n";
        echo "\n📋 PASOS PARA PROBAR:\n";
        echo "1. Ve al sistema EVA en el navegador\n";
        echo "2. Busca el equipo con ID: {$relacion->equipo_id}\n";
        echo "3. Haz clic en 'Ver Documentos' o el ícono de documentos\n";
        echo "4. Deberías ver el archivo: test_excel_1752946957.xlsx\n";
        echo "5. Haz clic en el archivo para abrirlo\n";
        echo "6. El archivo debería abrirse/descargarse correctamente\n";
    } else {
        echo "❌ No encontrado en base de datos\n\n";
        
        // Buscar cualquier equipo con documentos
        echo "🔍 Buscando cualquier equipo con documentos...\n";
        $equiposConDocs = DB::table('equipo_archivo')
            ->leftJoin('equipos', 'equipo_archivo.equipo_id', '=', 'equipos.id')
            ->leftJoin('archivos', 'equipo_archivo.archivo_id', '=', 'archivos.id')
            ->select(
                'equipos.id as equipo_id',
                'equipos.name as equipo_nombre',
                'equipos.code as equipo_codigo',
                'equipo_archivo.vinculo as archivo',
                'archivos.name as tipo_documento',
                'equipo_archivo.created_at'
            )
            ->limit(5)
            ->get();
        
        if ($equiposConDocs->count() > 0) {
            echo "📋 Equipos con documentos encontrados:\n\n";
            foreach ($equiposConDocs as $equipo) {
                echo "🎯 Equipo ID: {$equipo->equipo_id}\n";
                echo "📝 Nombre: " . ($equipo->equipo_nombre ?: 'Sin nombre') . "\n";
                echo "🔢 Código: " . ($equipo->equipo_codigo ?: 'Sin código') . "\n";
                echo "📄 Archivo: {$equipo->archivo}\n";
                echo "📋 Tipo: " . ($equipo->tipo_documento ?: 'Sin tipo') . "\n";
                echo "📅 Fecha: {$equipo->created_at}\n";
                echo "🔗 URL: /storage/equipos/archivos/{$equipo->archivo}\n";
                echo "🌐 URL completa: http://localhost:8001/storage/equipos/archivos/{$equipo->archivo}\n";
                echo str_repeat("-", 50) . "\n";
            }
            
            $primer = $equiposConDocs->first();
            echo "\n🎯 RECOMENDACIÓN:\n";
            echo "Usar equipo ID: {$primer->equipo_id}\n";
            echo "Archivo: {$primer->archivo}\n";
        } else {
            echo "❌ No hay equipos con documentos en la base de datos\n";
        }
    }
    
    echo "\n🔗 PRUEBA DIRECTA:\n";
    echo "URL: http://localhost:8001/storage/equipos/archivos/test_excel_1752946957.xlsx\n";
    echo "Si esta URL funciona, el problema estaba en el enlace simbólico (ya solucionado)\n";

} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
}

echo "\n🔚 Fin de la búsqueda\n";
