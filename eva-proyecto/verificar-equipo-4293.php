<?php

/**
 * Script para verificar específicamente el equipo ID 4293
 */

echo "=== VERIFICACIÓN ESPECÍFICA DEL EQUIPO ID 4293 ===\n\n";

try {
    require_once 'eva-backend/vendor/autoload.php';
    $app = require_once 'eva-backend/bootstrap/app.php';
    $app->make('Illuminate\\Contracts\\Console\\Kernel')->bootstrap();
    
    echo "🔍 VERIFICANDO EQUIPO ID 4293...\n";
    echo "================================\n";
    
    // Buscar el equipo específico
    $equipo = DB::table('equipos')->where('id', 4293)->first();
    
    if ($equipo) {
        echo "✅ EQUIPO ENCONTRADO:\n";
        echo "   🆔 ID: {$equipo->id}\n";
        echo "   📛 Nombre: {$equipo->name}\n";
        echo "   🔢 Código: {$equipo->code}\n";
        echo "   🏭 Marca: {$equipo->marca}\n";
        echo "   📦 Modelo: {$equipo->modelo}\n";
        echo "   🔖 Serial: {$equipo->serial}\n";
        echo "   📊 Estado: {$equipo->status}\n";
        echo "   🏥 Sede ID: {$equipo->sede_id}\n";
        echo "   🏢 Servicio ID: {$equipo->servicio_id}\n";
        echo "   📍 Área ID: {$equipo->area_id}\n";
        
        // Buscar mantenimientos de este equipo
        echo "\n🔧 MANTENIMIENTOS DEL EQUIPO:\n";
        echo "=============================\n";
        
        $mantenimientos = DB::table('mantenimiento')
            ->where('equipo_id', 4293)
            ->orderBy('fecha_mantenimiento', 'desc')
            ->get();
        
        if ($mantenimientos->count() > 0) {
            echo "📊 Total mantenimientos: {$mantenimientos->count()}\n\n";
            
            foreach ($mantenimientos as $index => $mant) {
                echo "🔧 Mantenimiento #" . ($index + 1) . ":\n";
                echo "   🆔 ID: {$mant->id}\n";
                echo "   📅 Fecha: {$mant->fecha_mantenimiento}\n";
                echo "   📄 Archivo: " . ($mant->file ?: 'Sin archivo') . "\n";
                echo "   💬 Observación: " . ($mant->observacion ?: 'Sin observación') . "\n";
                echo "   📊 Estado: {$mant->status}\n";
                
                if ($mant->file) {
                    // Verificar si el archivo existe
                    $rutasArchivo = [
                        "eva-backend/storage/app/public/mantenimientos/{$mant->file}",
                        "eva-backend/storage/app/public/correctivos_asociados/{$mant->file}",
                        "eva-backend/storage/app/public/{$mant->file}"
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
                }
                echo "\n";
            }
            
            // Último mantenimiento con archivo
            $ultimoConArchivo = DB::table('mantenimiento')
                ->where('equipo_id', 4293)
                ->whereNotNull('file')
                ->where('file', '!=', '')
                ->orderBy('fecha_mantenimiento', 'desc')
                ->first();
            
            if ($ultimoConArchivo) {
                echo "🎯 ÚLTIMO MANTENIMIENTO CON ARCHIVO:\n";
                echo "====================================\n";
                echo "   🆔 Mantenimiento ID: {$ultimoConArchivo->id}\n";
                echo "   📅 Fecha: {$ultimoConArchivo->fecha_mantenimiento}\n";
                echo "   📄 Archivo: {$ultimoConArchivo->file}\n";
                echo "   🌐 URL: http://127.0.0.1:8001/storage/mantenimientos/{$ultimoConArchivo->file}\n";
            }
            
        } else {
            echo "❌ No se encontraron mantenimientos para este equipo\n";
        }
        
    } else {
        echo "❌ EQUIPO NO ENCONTRADO con ID 4293\n";
        
        // Buscar equipos similares
        echo "\n🔍 BUSCANDO EQUIPOS SIMILARES...\n";
        echo "================================\n";
        
        $equiposSimilares = DB::table('equipos')
            ->where('name', 'like', '%OXIGENO%')
            ->orWhere('name', 'like', '%LIQUIDO%')
            ->limit(10)
            ->get();
        
        if ($equiposSimilares->count() > 0) {
            echo "📋 EQUIPOS CON NOMBRES SIMILARES:\n\n";
            foreach ($equiposSimilares as $eq) {
                echo "   🆔 ID: {$eq->id} | 📛 Nombre: {$eq->name} | 🔢 Código: {$eq->code}\n";
            }
        }
    }
    
    echo "\n📊 ESTADÍSTICAS GENERALES:\n";
    echo "==========================\n";
    
    $totalEquipos = DB::table('equipos')->count();
    $equiposActivos = DB::table('equipos')->where('status', 1)->count();
    $equiposConMantenimiento = DB::table('equipos')
        ->join('mantenimiento', 'equipos.id', '=', 'mantenimiento.equipo_id')
        ->distinct()
        ->count('equipos.id');
    
    echo "📋 Total equipos: $totalEquipos\n";
    echo "✅ Equipos activos: $equiposActivos\n";
    echo "🔧 Equipos con mantenimiento: $equiposConMantenimiento\n";
    
    // Buscar algunos equipos que SÍ tengan archivos de mantenimiento
    echo "\n🎯 EQUIPOS ALTERNATIVOS CON ARCHIVOS:\n";
    echo "====================================\n";
    
    $equiposConArchivos = DB::table('equipos as e')
        ->join('mantenimiento as m', 'e.id', '=', 'm.equipo_id')
        ->select('e.id', 'e.name', 'e.code', 'm.file', 'm.fecha_mantenimiento')
        ->whereNotNull('m.file')
        ->where('m.file', '!=', '')
        ->orderBy('m.fecha_mantenimiento', 'desc')
        ->limit(5)
        ->get();
    
    if ($equiposConArchivos->count() > 0) {
        echo "📋 EQUIPOS RECOMENDADOS PARA PRUEBAS:\n\n";
        foreach ($equiposConArchivos as $eq) {
            echo "   🆔 ID: {$eq->id} | 📛 Nombre: {$eq->name} | 🔢 Código: {$eq->code}\n";
            echo "   📄 Archivo: {$eq->file} | 📅 Fecha: {$eq->fecha_mantenimiento}\n\n";
        }
    }
    
} catch (Exception $e) {
    echo "❌ Error: {$e->getMessage()}\n";
}

echo "🚀 VERIFICACIÓN COMPLETADA!\n";

?>
