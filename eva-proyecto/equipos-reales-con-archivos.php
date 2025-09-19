<?php

/**
 * Script simple para encontrar equipos reales con archivos de mantenimiento
 */

echo "=== EQUIPOS REALES CON ARCHIVOS DE MANTENIMIENTO ===\n\n";

try {
    require_once 'eva-backend/vendor/autoload.php';
    $app = require_once 'eva-backend/bootstrap/app.php';
    $app->make('Illuminate\\Contracts\\Console\\Kernel')->bootstrap();
    
    // Buscar equipos con archivos de mantenimiento (método simple)
    $equiposConArchivos = DB::select("
        SELECT DISTINCT 
            e.id, 
            e.name, 
            e.code, 
            e.marca, 
            e.modelo,
            m.file,
            m.fecha_mantenimiento,
            m.id as mantenimiento_id
        FROM equipos e 
        INNER JOIN mantenimiento m ON e.id = m.equipo_id 
        WHERE m.file IS NOT NULL 
        AND m.file != '' 
        ORDER BY m.fecha_mantenimiento DESC 
        LIMIT 5
    ");
    
    if (count($equiposConArchivos) > 0) {
        echo "✅ EQUIPOS ENCONTRADOS:\n\n";
        
        foreach ($equiposConArchivos as $index => $equipo) {
            echo "📋 EQUIPO #" . ($index + 1) . ":\n";
            echo "   🆔 ID: {$equipo->id}\n";
            echo "   📛 Nombre: {$equipo->name}\n";
            echo "   🔢 Código: {$equipo->code}\n";
            echo "   🏭 Marca: {$equipo->marca}\n";
            echo "   📦 Modelo: {$equipo->modelo}\n";
            echo "   📄 Archivo: {$equipo->file}\n";
            echo "   📅 Fecha: {$equipo->fecha_mantenimiento}\n";
            echo "   🔧 Mantenimiento ID: {$equipo->mantenimiento_id}\n";
            
            // Verificar archivo físico
            $rutasArchivo = [
                "eva-backend/storage/app/public/mantenimientos/{$equipo->file}",
                "eva-backend/storage/app/public/correctivos_asociados/{$equipo->file}"
            ];
            
            foreach ($rutasArchivo as $ruta) {
                if (file_exists($ruta)) {
                    echo "   ✅ Archivo existe en: $ruta\n";
                    break;
                }
            }
            
            echo "   🌐 URL: http://127.0.0.1:8001/storage/mantenimientos/{$equipo->file}\n";
            echo "\n" . str_repeat("-", 50) . "\n\n";
        }
        
        // Recomendar el primero
        $recomendado = $equiposConArchivos[0];
        echo "🎯 EQUIPO RECOMENDADO:\n";
        echo "=====================\n";
        echo "🆔 ID: {$recomendado->id}\n";
        echo "📛 Nombre: {$recomendado->name}\n";
        echo "🔢 Código: {$recomendado->code}\n";
        echo "📄 Archivo: {$recomendado->file}\n";
        
        echo "\n🔍 PARA BUSCAR EN LA UI:\n";
        echo "========================\n";
        echo "1. Busca por ID: {$recomendado->id}\n";
        echo "2. Busca por código: {$recomendado->code}\n";
        echo "3. Busca por nombre: {$recomendado->name}\n";
        echo "4. Haz clic en el icono Link (🔗) del último mantenimiento\n";
        
    } else {
        echo "❌ No se encontraron equipos con archivos\n";
        
        // Verificar si hay equipos en general
        $totalEquipos = DB::table('equipos')->count();
        $totalMantenimientos = DB::table('mantenimiento')->count();
        
        echo "\n📊 ESTADÍSTICAS:\n";
        echo "   📋 Total equipos: $totalEquipos\n";
        echo "   🔧 Total mantenimientos: $totalMantenimientos\n";
        
        // Mostrar algunos equipos sin filtro
        $algunosEquipos = DB::table('equipos')->limit(5)->get();
        echo "\n📋 ALGUNOS EQUIPOS (sin filtro):\n";
        foreach ($algunosEquipos as $eq) {
            echo "   🆔 {$eq->id} | 📛 {$eq->name} | 🔢 {$eq->code}\n";
        }
    }
    
} catch (Exception $e) {
    echo "❌ Error: {$e->getMessage()}\n";
    echo "Trace: {$e->getTraceAsString()}\n";
}

?>
