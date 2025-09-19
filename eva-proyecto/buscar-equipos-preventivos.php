<?php

/**
 * Script para buscar equipos con mantenimientos PREVENTIVOS que tengan archivos
 */

echo "=== BÚSQUEDA DE EQUIPOS CON MANTENIMIENTOS PREVENTIVOS ===\n\n";

try {
    require_once 'eva-backend/vendor/autoload.php';
    $app = require_once 'eva-backend/bootstrap/app.php';
    $app->make('Illuminate\\Contracts\\Console\\Kernel')->bootstrap();
    
    echo "🔍 BUSCANDO EQUIPOS CON MANTENIMIENTOS PREVENTIVOS...\n";
    echo "====================================================\n";
    
    // Buscar equipos que tengan mantenimientos preventivos con archivos
    $equiposConPreventivos = DB::select("
        SELECT DISTINCT 
            e.id, 
            e.name, 
            e.code, 
            e.marca, 
            e.modelo,
            m.file,
            m.fecha_mantenimiento,
            m.id as mantenimiento_id,
            m.observacion
        FROM equipos e 
        INNER JOIN mantenimiento m ON e.id = m.equipo_id 
        WHERE m.file IS NOT NULL 
        AND m.file != '' 
        AND (m.observacion NOT LIKE '%correctivo%' OR m.observacion IS NULL)
        ORDER BY m.fecha_mantenimiento DESC 
        LIMIT 10
    ");
    
    if (count($equiposConPreventivos) > 0) {
        echo "✅ EQUIPOS CON MANTENIMIENTOS PREVENTIVOS:\n\n";
        
        foreach ($equiposConPreventivos as $index => $equipo) {
            echo "📋 EQUIPO #" . ($index + 1) . ":\n";
            echo "   🆔 ID: {$equipo->id}\n";
            echo "   📛 Nombre: {$equipo->name}\n";
            echo "   🔢 Código: {$equipo->code}\n";
            echo "   🏭 Marca: {$equipo->marca}\n";
            echo "   📦 Modelo: {$equipo->modelo}\n";
            echo "   📄 Archivo: {$equipo->file}\n";
            echo "   📅 Fecha: {$equipo->fecha_mantenimiento}\n";
            echo "   🔧 Mantenimiento ID: {$equipo->mantenimiento_id}\n";
            echo "   💬 Observación: " . ($equipo->observacion ?: 'Sin observación') . "\n";
            
            // Verificar si el archivo existe físicamente en mantenimientos
            $rutaArchivo = "eva-backend/storage/app/public/mantenimientos/{$equipo->file}";
            
            if (file_exists($rutaArchivo)) {
                echo "   ✅ Archivo PREVENTIVO existe en: mantenimientos/\n";
                echo "   🌐 URL: http://127.0.0.1:8001/storage/mantenimientos/{$equipo->file}\n";
            } else {
                echo "   ❌ Archivo NO encontrado en mantenimientos/\n";
                
                // Verificar en otras ubicaciones
                $otrasRutas = [
                    "eva-backend/storage/app/public/correctivos_asociados/{$equipo->file}" => "correctivos_asociados",
                    "eva-backend/storage/app/public/correctivos_generales/{$equipo->file}" => "correctivos_generales"
                ];
                
                foreach ($otrasRutas as $ruta => $carpeta) {
                    if (file_exists($ruta)) {
                        echo "   ⚠️  Archivo encontrado en: $carpeta/ (ubicación incorrecta)\n";
                    }
                }
            }
            
            echo "\n" . str_repeat("-", 50) . "\n\n";
        }
        
        // Recomendar el primero
        $recomendado = $equiposConPreventivos[0];
        echo "🎯 EQUIPO RECOMENDADO PARA PRUEBAS:\n";
        echo "==================================\n";
        echo "🆔 ID: {$recomendado->id}\n";
        echo "📛 Nombre: {$recomendado->name}\n";
        echo "🔢 Código: {$recomendado->code}\n";
        echo "📄 Archivo: {$recomendado->file}\n";
        echo "📅 Fecha: {$recomendado->fecha_mantenimiento}\n";
        echo "🌐 URL: http://127.0.0.1:8001/storage/mantenimientos/{$recomendado->file}\n";
        
        echo "\n🔍 PARA BUSCAR EN LA UI:\n";
        echo "========================\n";
        echo "1. Busca por ID: {$recomendado->id}\n";
        echo "2. Busca por código: {$recomendado->code}\n";
        echo "3. Busca por nombre: {$recomendado->name}\n";
        echo "4. Haz clic en el icono Link (🔗) del ÚLTIMO PREVENTIVO\n";
        
    } else {
        echo "❌ No se encontraron equipos con mantenimientos preventivos\n";
        
        // Verificar estadísticas
        $totalMantenimientos = DB::table('mantenimiento')->count();
        $conArchivos = DB::table('mantenimiento')->whereNotNull('file')->where('file', '!=', '')->count();
        $correctivos = DB::table('mantenimiento')->where('observacion', 'like', '%correctivo%')->count();
        
        echo "\n📊 ESTADÍSTICAS:\n";
        echo "   🔧 Total mantenimientos: $totalMantenimientos\n";
        echo "   📄 Con archivos: $conArchivos\n";
        echo "   🔴 Correctivos: $correctivos\n";
        echo "   🔵 Preventivos estimados: " . ($conArchivos - $correctivos) . "\n";
    }
    
    echo "\n🗂️ CONTENIDO DE DIRECTORIO MANTENIMIENTOS:\n";
    echo "==========================================\n";
    
    $dirMantenimientos = 'eva-backend/storage/app/public/mantenimientos/';
    if (is_dir($dirMantenimientos)) {
        $archivos = glob($dirMantenimientos . '*');
        echo "📁 Total archivos en mantenimientos/: " . count($archivos) . "\n";
        
        if (count($archivos) > 0) {
            echo "📄 Primeros 5 archivos:\n";
            foreach (array_slice($archivos, 0, 5) as $archivo) {
                echo "   - " . basename($archivo) . "\n";
            }
        }
    } else {
        echo "❌ Directorio mantenimientos/ no existe\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error: {$e->getMessage()}\n";
}

echo "\n🚀 BÚSQUEDA COMPLETADA!\n";

?>
