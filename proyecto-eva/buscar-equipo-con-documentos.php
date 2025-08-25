<?php

require_once 'eva-backend/vendor/autoload.php';
$app = require_once 'eva-backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

use Illuminate\Support\Facades\DB;

echo "🔍 BUSCANDO EQUIPOS CON DOCUMENTOS LOCALES\n";
echo "=" . str_repeat("=", 60) . "\n\n";

try {
    // 1. Buscar equipos que tengan documentos asociados
    echo "1. EQUIPOS CON DOCUMENTOS EN BASE DE DATOS:\n";
    echo "-" . str_repeat("-", 40) . "\n";
    
    $equiposConDocumentos = DB::table('equipos')
        ->join('equipo_archivo', 'equipos.id', '=', 'equipo_archivo.equipo_id')
        ->leftJoin('archivos', 'equipo_archivo.archivo_id', '=', 'archivos.id')
        ->select(
            'equipos.id as equipo_id',
            'equipos.name as equipo_nombre',
            'equipos.code as equipo_codigo',
            'equipos.marca',
            'equipos.modelo',
            'equipo_archivo.vinculo as nombre_archivo',
            'equipo_archivo.created_at as fecha_subida',
            'archivos.name as tipo_documento',
            'equipo_archivo.otro as descripcion'
        )
        ->orderBy('equipo_archivo.created_at', 'desc')
        ->get();
    
    if ($equiposConDocumentos->count() == 0) {
        echo "❌ NO HAY EQUIPOS CON DOCUMENTOS EN LA BASE DE DATOS\n";
        echo "\n📋 CREANDO DATOS DE PRUEBA...\n";
        
        // Crear un documento de prueba
        $equipoPrueba = DB::table('equipos')->first();
        if ($equipoPrueba) {
            // Buscar un tipo de documento
            $tipoDocumento = DB::table('archivos')->first();
            if (!$tipoDocumento) {
                // Crear tipo de documento si no existe
                $tipoDocumentoId = DB::table('archivos')->insertGetId([
                    'name' => 'Manual de Usuario'
                ]);
            } else {
                $tipoDocumentoId = $tipoDocumento->id;
            }
            
            // Crear archivo de prueba
            $nombreArchivoPrueba = 'manual_prueba_' . time() . '.pdf';
            $rutaArchivoPrueba = __DIR__ . '/eva-backend/storage/app/public/equipos/archivos/' . $nombreArchivoPrueba;
            
            // Crear directorio si no existe
            $directorioArchivos = dirname($rutaArchivoPrueba);
            if (!file_exists($directorioArchivos)) {
                mkdir($directorioArchivos, 0755, true);
                echo "✅ Directorio creado: {$directorioArchivos}\n";
            }
            
            // Crear archivo PDF de prueba
            $contenidoPDF = "%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
100 700 Td
(Manual de Prueba EVA) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000206 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
300
%%EOF";
            
            if (file_put_contents($rutaArchivoPrueba, $contenidoPDF)) {
                echo "✅ Archivo PDF de prueba creado: {$nombreArchivoPrueba}\n";
                
                // Insertar relación en base de datos
                DB::table('equipo_archivo')->insert([
                    'equipo_id' => $equipoPrueba->id,
                    'archivo_id' => $tipoDocumentoId,
                    'vinculo' => $nombreArchivoPrueba,
                    'otro' => 'Documento de prueba creado automáticamente',
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
                
                echo "✅ Relación creada en base de datos\n";
                echo "\n📋 EQUIPO DE PRUEBA CREADO:\n";
                echo "   ID: {$equipoPrueba->id}\n";
                echo "   Nombre: " . ($equipoPrueba->name ?: 'Sin nombre') . "\n";
                echo "   Código: " . ($equipoPrueba->code ?: 'Sin código') . "\n";
                echo "   Archivo: {$nombreArchivoPrueba}\n";
                echo "   Ruta: {$rutaArchivoPrueba}\n";
                echo "   URL: /storage/equipos/archivos/{$nombreArchivoPrueba}\n";
                
                // Volver a buscar equipos con documentos
                $equiposConDocumentos = DB::table('equipos')
                    ->join('equipo_archivo', 'equipos.id', '=', 'equipo_archivo.equipo_id')
                    ->leftJoin('archivos', 'equipo_archivo.archivo_id', '=', 'archivos.id')
                    ->select(
                        'equipos.id as equipo_id',
                        'equipos.name as equipo_nombre',
                        'equipos.code as equipo_codigo',
                        'equipos.marca',
                        'equipos.modelo',
                        'equipo_archivo.vinculo as nombre_archivo',
                        'equipo_archivo.created_at as fecha_subida',
                        'archivos.name as tipo_documento',
                        'equipo_archivo.otro as descripcion'
                    )
                    ->orderBy('equipo_archivo.created_at', 'desc')
                    ->get();
            } else {
                echo "❌ Error al crear archivo de prueba\n";
                exit(1);
            }
        } else {
            echo "❌ No hay equipos en la base de datos\n";
            exit(1);
        }
    }
    
    echo "\n2. VERIFICACIÓN DE ARCHIVOS FÍSICOS:\n";
    echo "-" . str_repeat("-", 40) . "\n";
    
    $equiposConArchivosLocales = [];
    $directorioBase = __DIR__ . '/eva-backend/storage/app/public/equipos/archivos/';
    
    foreach ($equiposConDocumentos as $equipo) {
        $rutaArchivo = $directorioBase . $equipo->nombre_archivo;
        $existeArchivo = file_exists($rutaArchivo);
        
        echo "📄 Equipo ID {$equipo->equipo_id}:\n";
        echo "   Nombre: " . ($equipo->equipo_nombre ?: 'Sin nombre') . "\n";
        echo "   Código: " . ($equipo->equipo_codigo ?: 'Sin código') . "\n";
        echo "   Archivo: {$equipo->nombre_archivo}\n";
        echo "   Tipo: " . ($equipo->tipo_documento ?: 'Sin tipo') . "\n";
        echo "   Fecha: " . ($equipo->fecha_subida ?: 'Sin fecha') . "\n";
        echo "   Archivo físico: " . ($existeArchivo ? "✅ EXISTE" : "❌ NO EXISTE") . "\n";
        
        if ($existeArchivo) {
            $tamañoArchivo = filesize($rutaArchivo);
            echo "   Tamaño: " . round($tamañoArchivo / 1024, 2) . " KB\n";
            echo "   Ruta completa: {$rutaArchivo}\n";
            echo "   URL acceso: /storage/equipos/archivos/{$equipo->nombre_archivo}\n";
            
            $equiposConArchivosLocales[] = $equipo;
        }
        echo "\n";
    }
    
    echo "3. RECOMENDACIONES PARA PRUEBA:\n";
    echo "-" . str_repeat("-", 40) . "\n";
    
    if (count($equiposConArchivosLocales) > 0) {
        $equipoRecomendado = $equiposConArchivosLocales[0];
        
        echo "🎯 EQUIPO RECOMENDADO PARA PROBAR:\n";
        echo "   ID: {$equipoRecomendado->equipo_id}\n";
        echo "   Nombre: " . ($equipoRecomendado->equipo_nombre ?: 'Sin nombre') . "\n";
        echo "   Código: " . ($equipoRecomendado->equipo_codigo ?: 'Sin código') . "\n";
        echo "   Archivo: {$equipoRecomendado->nombre_archivo}\n";
        echo "   Tipo: " . ($equipoRecomendado->tipo_documento ?: 'Sin tipo') . "\n";
        echo "\n📋 PASOS PARA PROBAR:\n";
        echo "   1. Ve al sistema EVA en el navegador\n";
        echo "   2. Busca el equipo con ID: {$equipoRecomendado->equipo_id}\n";
        echo "   3. Abre el modal de 'Lista de Documentos'\n";
        echo "   4. Deberías ver el archivo: {$equipoRecomendado->nombre_archivo}\n";
        echo "   5. Haz clic en el archivo para visualizarlo\n";
        echo "   6. El archivo debería abrirse en una nueva pestaña\n";
        echo "\n🔗 URL DIRECTA DEL ARCHIVO:\n";
        echo "   http://localhost:8001/storage/equipos/archivos/{$equipoRecomendado->nombre_archivo}\n";
        
        if (count($equiposConArchivosLocales) > 1) {
            echo "\n📋 OTROS EQUIPOS CON DOCUMENTOS:\n";
            for ($i = 1; $i < min(3, count($equiposConArchivosLocales)); $i++) {
                $equipo = $equiposConArchivosLocales[$i];
                echo "   - ID {$equipo->equipo_id}: {$equipo->nombre_archivo}\n";
            }
        }
    } else {
        echo "❌ NO HAY EQUIPOS CON ARCHIVOS FÍSICOS DISPONIBLES\n";
        echo "📋 Se necesita subir documentos a través del sistema\n";
    }

    echo "\n" . "=" . str_repeat("=", 60) . "\n";
    echo "✅ BÚSQUEDA COMPLETADA\n";

} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
    echo "📍 Archivo: " . $e->getFile() . "\n";
    echo "📍 Línea: " . $e->getLine() . "\n";
}

echo "\n🔚 Fin de la búsqueda\n";
