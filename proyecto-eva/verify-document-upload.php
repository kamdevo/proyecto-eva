<?php

require_once 'eva-backend/vendor/autoload.php';
$app = require_once 'eva-backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

echo "🔍 VERIFICACIÓN DE FUNCIONALIDAD DE SUBIDA DE DOCUMENTOS\n";
echo "=" . str_repeat("=", 70) . "\n\n";

try {
    // 1. Verificar estructura de directorios
    echo "1. VERIFICACIÓN DE ESTRUCTURA DE DIRECTORIOS:\n";
    echo "-" . str_repeat("-", 50) . "\n";
    
    $storageBasePath = storage_path('app/public');
    $equiposArchivosPath = $storageBasePath . '/equipos/archivos';
    
    echo "   Ruta base storage: {$storageBasePath}\n";
    echo "   Ruta equipos/archivos: {$equiposArchivosPath}\n";
    
    if (!file_exists($storageBasePath)) {
        echo "   ❌ Directorio storage/app/public NO EXISTE\n";
        mkdir($storageBasePath, 0755, true);
        echo "   ✅ Directorio storage/app/public CREADO\n";
    } else {
        echo "   ✅ Directorio storage/app/public EXISTE\n";
    }
    
    if (!file_exists($equiposArchivosPath)) {
        echo "   ❌ Directorio equipos/archivos NO EXISTE\n";
        mkdir($equiposArchivosPath, 0755, true);
        echo "   ✅ Directorio equipos/archivos CREADO\n";
    } else {
        echo "   ✅ Directorio equipos/archivos EXISTE\n";
    }
    
    // Verificar permisos de escritura
    if (is_writable($equiposArchivosPath)) {
        echo "   ✅ Directorio equipos/archivos TIENE PERMISOS DE ESCRITURA\n";
    } else {
        echo "   ❌ Directorio equipos/archivos NO TIENE PERMISOS DE ESCRITURA\n";
    }
    
    echo "\n";

    // 2. Verificar tabla archivos (catálogo de tipos)
    echo "2. VERIFICACIÓN DE CATÁLOGO DE TIPOS DE DOCUMENTOS:\n";
    echo "-" . str_repeat("-", 50) . "\n";
    
    try {
        $tiposDocumentos = DB::table('archivos')
            ->select('id', 'name')
            ->orderBy('id')
            ->get();
        
        echo "   Total tipos de documentos: " . $tiposDocumentos->count() . "\n";
        
        if ($tiposDocumentos->count() > 0) {
            echo "   Tipos disponibles:\n";
            foreach ($tiposDocumentos as $tipo) {
                echo "     - ID {$tipo->id}: {$tipo->name}\n";
            }
        } else {
            echo "   ❌ NO HAY TIPOS DE DOCUMENTOS CONFIGURADOS\n";
            echo "   📋 Se necesita insertar datos en la tabla 'archivos'\n";
        }
    } catch (Exception $e) {
        echo "   ❌ Error al consultar tabla archivos: " . $e->getMessage() . "\n";
    }
    
    echo "\n";

    // 3. Verificar tabla equipo_archivo
    echo "3. VERIFICACIÓN DE TABLA EQUIPO_ARCHIVO:\n";
    echo "-" . str_repeat("-", 50) . "\n";
    
    try {
        $relacionesCount = DB::table('equipo_archivo')->count();
        echo "   Total relaciones equipo-archivo: {$relacionesCount}\n";
        
        if ($relacionesCount > 0) {
            $ultimasRelaciones = DB::table('equipo_archivo')
                ->leftJoin('archivos', 'equipo_archivo.archivo_id', '=', 'archivos.id')
                ->select(
                    'equipo_archivo.id',
                    'equipo_archivo.equipo_id',
                    'equipo_archivo.archivo_id',
                    'equipo_archivo.vinculo',
                    'equipo_archivo.created_at',
                    'archivos.name as tipo_documento'
                )
                ->orderBy('equipo_archivo.created_at', 'desc')
                ->limit(5)
                ->get();
            
            echo "   Últimas 5 relaciones:\n";
            foreach ($ultimasRelaciones as $rel) {
                echo "     - Equipo {$rel->equipo_id} | Tipo: {$rel->tipo_documento} | Archivo: {$rel->vinculo}\n";
            }
        } else {
            echo "   ⚠️  NO HAY DOCUMENTOS SUBIDOS AÚN\n";
        }
    } catch (Exception $e) {
        echo "   ❌ Error al consultar tabla equipo_archivo: " . $e->getMessage() . "\n";
    }
    
    echo "\n";

    // 4. Verificar equipos disponibles para prueba
    echo "4. EQUIPOS DISPONIBLES PARA PRUEBA:\n";
    echo "-" . str_repeat("-", 50) . "\n";
    
    try {
        $equipos = DB::table('equipos')
            ->select('id', 'name', 'code')
            ->limit(5)
            ->get();
        
        if ($equipos->count() > 0) {
            echo "   Equipos disponibles para probar subida:\n";
            foreach ($equipos as $equipo) {
                echo "     - ID {$equipo->id}: " . ($equipo->name ?: 'Sin nombre') . " | Código: " . ($equipo->code ?: 'Sin código') . "\n";
            }
        } else {
            echo "   ❌ NO HAY EQUIPOS DISPONIBLES\n";
        }
    } catch (Exception $e) {
        echo "   ❌ Error al consultar equipos: " . $e->getMessage() . "\n";
    }
    
    echo "\n";

    // 5. Verificar archivos físicos existentes
    echo "5. VERIFICACIÓN DE ARCHIVOS FÍSICOS:\n";
    echo "-" . str_repeat("-", 50) . "\n";
    
    if (file_exists($equiposArchivosPath)) {
        $archivos = scandir($equiposArchivosPath);
        $archivos = array_filter($archivos, function($archivo) {
            return !in_array($archivo, ['.', '..']);
        });
        
        echo "   Archivos físicos encontrados: " . count($archivos) . "\n";
        
        if (count($archivos) > 0) {
            echo "   Primeros 5 archivos:\n";
            $contador = 0;
            foreach ($archivos as $archivo) {
                if ($contador >= 5) break;
                $rutaCompleta = $equiposArchivosPath . '/' . $archivo;
                $tamaño = filesize($rutaCompleta);
                echo "     - {$archivo} (" . round($tamaño/1024, 2) . " KB)\n";
                $contador++;
            }
        }
    }
    
    echo "\n";

    // 6. Resumen y recomendaciones
    echo "6. RESUMEN Y RECOMENDACIONES:\n";
    echo "-" . str_repeat("-", 50) . "\n";
    
    echo "   ✅ Endpoint de subida: POST /v1/equipos/{id}/upload-document\n";
    echo "   ✅ Endpoint de tipos: GET /v1/document-types\n";
    echo "   ✅ Endpoint de listado: GET /v1/equipos/{id}/documents\n";
    echo "   ✅ Ruta de archivos: /storage/equipos/archivos/{filename}\n";
    echo "\n";
    echo "   📋 Para probar la funcionalidad:\n";
    echo "   1. Usar cualquier equipo ID disponible arriba\n";
    echo "   2. Seleccionar un tipo de documento del catálogo\n";
    echo "   3. Subir un archivo PDF/DOC/IMG (máx 10MB)\n";
    echo "   4. Verificar que se guarde en: {$equiposArchivosPath}\n";
    echo "   5. Verificar que se cree registro en tabla equipo_archivo\n";

    echo "\n" . "=" . str_repeat("=", 70) . "\n";
    echo "✅ VERIFICACIÓN COMPLETADA\n";

} catch (Exception $e) {
    echo "❌ ERROR GENERAL: " . $e->getMessage() . "\n";
    echo "📍 Archivo: " . $e->getFile() . "\n";
    echo "📍 Línea: " . $e->getLine() . "\n";
}

echo "\n🔚 Fin de la verificación\n";
