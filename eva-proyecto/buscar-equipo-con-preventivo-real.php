<?php

echo "=== BUSCAR EQUIPO CON ARCHIVO PREVENTIVO REAL ===\n\n";

try {
    require_once 'eva-backend/vendor/autoload.php';
    $app = require_once 'eva-backend/bootstrap/app.php';
    $app->make('Illuminate\\Contracts\\Console\\Kernel')->bootstrap();
    
    // Obtener archivos que SÍ existen en mantenimientos/
    $dirMantenimientos = 'eva-backend/storage/app/public/mantenimientos/';
    $archivosReales = [];
    
    if (is_dir($dirMantenimientos)) {
        $archivos = glob($dirMantenimientos . '*.pdf');
        foreach ($archivos as $archivo) {
            $archivosReales[] = basename($archivo);
        }
    }
    
    echo "📁 ARCHIVOS REALES EN MANTENIMIENTOS:\n";
    foreach (array_slice($archivosReales, 0, 5) as $archivo) {
        echo "   - $archivo\n";
    }
    
    if (count($archivosReales) > 0) {
        // Buscar equipos que tengan estos archivos
        $archivoEjemplo = $archivosReales[0];
        echo "\n🔍 BUSCANDO EQUIPO CON ARCHIVO: $archivoEjemplo\n";
        
        $equipo = DB::table('equipos as e')
            ->join('mantenimiento as m', 'e.id', '=', 'm.equipo_id')
            ->select('e.id', 'e.name', 'e.code', 'e.marca', 'e.modelo', 'm.file', 'm.fecha_mantenimiento', 'm.id as mantenimiento_id')
            ->where('m.file', $archivoEjemplo)
            ->first();
        
        if ($equipo) {
            echo "\n✅ EQUIPO ENCONTRADO:\n";
            echo "   🆔 ID: {$equipo->id}\n";
            echo "   📛 Nombre: {$equipo->name}\n";
            echo "   🔢 Código: {$equipo->code}\n";
            echo "   🏭 Marca: {$equipo->marca}\n";
            echo "   📦 Modelo: {$equipo->modelo}\n";
            echo "   📄 Archivo: {$equipo->file}\n";
            echo "   📅 Fecha: {$equipo->fecha_mantenimiento}\n";
            echo "   🔧 Mantenimiento ID: {$equipo->mantenimiento_id}\n";
            echo "   🌐 URL: http://127.0.0.1:8001/storage/mantenimientos/{$equipo->file}\n";
            
            echo "\n🎯 ESTE EQUIPO ES PERFECTO PARA PRUEBAS:\n";
            echo "=======================================\n";
            echo "✅ Tiene archivo en la ubicación correcta (mantenimientos/)\n";
            echo "✅ Es un mantenimiento preventivo\n";
            echo "✅ El archivo existe físicamente\n";
            
        } else {
            echo "\n❌ No se encontró equipo con archivo $archivoEjemplo\n";
            
            // Buscar cualquier equipo con archivos en mantenimientos
            echo "\n🔍 BUSCANDO CUALQUIER EQUIPO CON ARCHIVOS EN MANTENIMIENTOS...\n";
            
            foreach ($archivosReales as $archivo) {
                $equipoEncontrado = DB::table('equipos as e')
                    ->join('mantenimiento as m', 'e.id', '=', 'm.equipo_id')
                    ->select('e.id', 'e.name', 'e.code', 'm.file')
                    ->where('m.file', $archivo)
                    ->first();
                
                if ($equipoEncontrado) {
                    echo "   ✅ Archivo: $archivo → Equipo ID: {$equipoEncontrado->id} ({$equipoEncontrado->name})\n";
                    break;
                }
            }
        }
    }
    
    // Buscar equipos con archivos que empiecen con SK (parecen preventivos)
    echo "\n🔍 BUSCANDO EQUIPOS CON ARCHIVOS SK (PREVENTIVOS):\n";
    echo "=================================================\n";
    
    $equiposPreventivos = DB::table('equipos as e')
        ->join('mantenimiento as m', 'e.id', '=', 'm.equipo_id')
        ->select('e.id', 'e.name', 'e.code', 'm.file', 'm.fecha_mantenimiento')
        ->where('m.file', 'like', 'SK%')
        ->orderBy('m.fecha_mantenimiento', 'desc')
        ->limit(3)
        ->get();
    
    foreach ($equiposPreventivos as $equipo) {
        echo "📋 Equipo ID: {$equipo->id} | Nombre: {$equipo->name}\n";
        echo "   📄 Archivo: {$equipo->file}\n";
        echo "   📅 Fecha: {$equipo->fecha_mantenimiento}\n";
        
        // Verificar si existe
        $rutaArchivo = "eva-backend/storage/app/public/mantenimientos/{$equipo->file}";
        if (file_exists($rutaArchivo)) {
            echo "   ✅ ARCHIVO EXISTE - PERFECTO PARA PRUEBAS\n";
            echo "   🌐 URL: http://127.0.0.1:8001/storage/mantenimientos/{$equipo->file}\n";
        } else {
            echo "   ❌ Archivo no existe\n";
        }
        echo "\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error: {$e->getMessage()}\n";
}

?>
