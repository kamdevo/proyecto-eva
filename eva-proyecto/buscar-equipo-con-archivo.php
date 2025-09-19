<?php

/**
 * Script para buscar equipos con último mantenimiento que tenga archivo accesible
 */

echo "=== BÚSQUEDA DE EQUIPOS CON ARCHIVOS DE MANTENIMIENTO ===\n\n";

try {
    require_once 'eva-backend/vendor/autoload.php';
    $app = require_once 'eva-backend/bootstrap/app.php';
    $app->make('Illuminate\\Contracts\\Console\\Kernel')->bootstrap();
    
    echo "🔍 BUSCANDO EQUIPOS CON ARCHIVOS DE MANTENIMIENTO...\n";
    echo "===================================================\n";
    
    // Buscar equipos que tengan mantenimientos con archivos
    $equiposConArchivos = DB::table('equipos as e')
        ->join('mantenimiento as m', 'e.id', '=', 'm.equipo_id')
        ->select([
            'e.id as equipo_id',
            'e.name as equipo_name',
            'e.code as equipo_code',
            'e.marca',
            'e.modelo',
            'e.serial',
            'm.id as mantenimiento_id',
            'm.file',
            'm.fecha_mantenimiento',
            'm.observacion'
        ])
        ->whereNotNull('m.file')
        ->where('m.file', '!=', '')
        ->orderBy('m.fecha_mantenimiento', 'desc')
        ->limit(10)
        ->get();
    
    if ($equiposConArchivos->count() > 0) {
        echo "✅ EQUIPOS ENCONTRADOS CON ARCHIVOS:\n\n";
        
        foreach ($equiposConArchivos as $index => $equipo) {
            echo "📋 EQUIPO #" . ($index + 1) . ":\n";
            echo "   🆔 ID: {$equipo->equipo_id}\n";
            echo "   📛 Nombre: {$equipo->equipo_name}\n";
            echo "   🔢 Código: {$equipo->equipo_code}\n";
            echo "   🏭 Marca: {$equipo->marca}\n";
            echo "   📦 Modelo: {$equipo->modelo}\n";
            echo "   🔖 Serial: {$equipo->serial}\n";
            echo "   🔧 Mantenimiento ID: {$equipo->mantenimiento_id}\n";
            echo "   📄 Archivo: {$equipo->file}\n";
            echo "   📅 Fecha: {$equipo->fecha_mantenimiento}\n";
            echo "   💬 Observación: {$equipo->observacion}\n";
            
            // Verificar si el archivo existe físicamente
            $rutasArchivo = [
                "eva-backend/storage/app/public/mantenimientos/{$equipo->file}",
                "eva-backend/storage/app/public/correctivos_asociados/{$equipo->file}",
                "eva-backend/storage/app/public/{$equipo->file}"
            ];
            
            $archivoEncontrado = false;
            foreach ($rutasArchivo as $ruta) {
                if (file_exists($ruta)) {
                    echo "   ✅ Archivo físico: EXISTE en $ruta\n";
                    $archivoEncontrado = true;
                    break;
                }
            }
            
            if (!$archivoEncontrado) {
                echo "   ❌ Archivo físico: NO ENCONTRADO\n";
            }
            
            // URL de acceso
            echo "   🌐 URL de acceso: http://127.0.0.1:8001/storage/mantenimientos/{$equipo->file}\n";
            echo "   🌐 URL alternativa: http://127.0.0.1:8001/storage/correctivos_asociados/{$equipo->file}\n";
            echo "\n" . str_repeat("-", 70) . "\n\n";
        }
        
        // Recomendar el primer equipo
        $recomendado = $equiposConArchivos->first();
        echo "🎯 EQUIPO RECOMENDADO PARA PRUEBAS:\n";
        echo "===================================\n";
        echo "🆔 ID del Equipo: {$recomendado->equipo_id}\n";
        echo "📛 Nombre: {$recomendado->equipo_name}\n";
        echo "🔢 Código: {$recomendado->equipo_code}\n";
        echo "📄 Archivo: {$recomendado->file}\n";
        echo "📅 Fecha Mantenimiento: {$recomendado->fecha_mantenimiento}\n";
        echo "\n🔗 PARA PROBAR EN LA UI:\n";
        echo "1. Busca el equipo con ID: {$recomendado->equipo_id}\n";
        echo "2. Busca el equipo con código: {$recomendado->equipo_code}\n";
        echo "3. Haz clic en el icono Link (🔗) en la columna 'Último Mantenimiento'\n";
        echo "4. Debería abrir el archivo: {$recomendado->file}\n";
        
    } else {
        echo "❌ NO SE ENCONTRARON EQUIPOS CON ARCHIVOS DE MANTENIMIENTO\n";
        
        // Buscar equipos sin archivos para referencia
        echo "\n📊 ESTADÍSTICAS:\n";
        $totalEquipos = DB::table('equipos')->count();
        $totalMantenimientos = DB::table('mantenimiento')->count();
        $mantenimientosConArchivo = DB::table('mantenimiento')
            ->whereNotNull('file')
            ->where('file', '!=', '')
            ->count();
        
        echo "   📋 Total equipos: $totalEquipos\n";
        echo "   🔧 Total mantenimientos: $totalMantenimientos\n";
        echo "   📄 Mantenimientos con archivo: $mantenimientosConArchivo\n";
    }
    
    echo "\n🗂️ VERIFICAR DIRECTORIOS DE ARCHIVOS:\n";
    echo "=====================================\n";
    
    $directorios = [
        'eva-backend/storage/app/public/mantenimientos/' => 'Mantenimientos',
        'eva-backend/storage/app/public/correctivos_asociados/' => 'Correctivos Asociados',
        'eva-backend/storage/app/public/correctivos_generales/' => 'Correctivos Generales'
    ];
    
    foreach ($directorios as $dir => $nombre) {
        if (is_dir($dir)) {
            $archivos = glob($dir . '*');
            $count = count($archivos);
            echo "📁 $nombre: $count archivos\n";
            
            if ($count > 0) {
                echo "   📄 Ejemplos: ";
                $ejemplos = array_slice($archivos, 0, 3);
                foreach ($ejemplos as $archivo) {
                    echo basename($archivo) . " ";
                }
                echo "\n";
            }
        } else {
            echo "❌ $nombre: Directorio no existe\n";
        }
    }
    
} catch (Exception $e) {
    echo "❌ Error: {$e->getMessage()}\n";
}

echo "\n🚀 LISTO PARA PRUEBAS!\n";

?>
