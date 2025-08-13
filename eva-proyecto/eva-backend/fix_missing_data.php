<?php

/**
 * Verificar y crear datos faltantes para que el modal funcione
 */

require_once __DIR__ . '/vendor/autoload.php';
use Illuminate\Support\Facades\DB;

echo "🔧 VERIFICANDO Y CREANDO DATOS FALTANTES\n";
echo "========================================\n\n";

try {
    $app = require_once __DIR__ . '/bootstrap/app.php';
    $app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();
    
    echo "📋 Paso 1: Verificando tablas existentes...\n";
    
    $tables = ['areas', 'propietarios', 'estadosequipos', 'estados_equipos'];
    $existingTables = [];
    
    foreach ($tables as $table) {
        try {
            DB::table($table)->limit(1)->get();
            $existingTables[] = $table;
            echo "✅ Tabla {$table} existe\n";
        } catch (Exception $e) {
            echo "❌ Tabla {$table} NO existe\n";
        }
    }
    
    echo "\n📋 Paso 2: Verificando datos en tablas existentes...\n";
    
    // Verificar áreas
    if (in_array('areas', $existingTables)) {
        $areasCount = DB::table('areas')->count();
        echo "✅ Tabla areas: {$areasCount} registros\n";
        
        if ($areasCount == 0) {
            echo "   Creando área por defecto...\n";
            DB::table('areas')->insert([
                'id' => 1,
                'name' => 'Área General',
                'servicio_id' => 1,
                'centro_id' => 1,
                'piso_id' => 1,
                'status' => 1,
                'responsable_id' => 1,
                'telefono' => '123456789',
                'email' => 'area@hospital.com',
                'ubicacion' => 'Planta Baja'
            ]);
            echo "   ✅ Área creada\n";
        } else {
            $area1 = DB::table('areas')->where('id', 1)->first();
            if (!$area1) {
                echo "   Área ID 1 no existe, creando...\n";
                DB::table('areas')->insert([
                    'id' => 1,
                    'name' => 'Área General',
                    'servicio_id' => 1,
                    'centro_id' => 1,
                    'piso_id' => 1,
                    'status' => 1,
                    'responsable_id' => 1,
                    'telefono' => '123456789',
                    'email' => 'area@hospital.com',
                    'ubicacion' => 'Planta Baja'
                ]);
                echo "   ✅ Área ID 1 creada\n";
            } else {
                echo "   ✅ Área ID 1 existe: {$area1->name}\n";
            }
        }
    }
    
    // Verificar propietarios
    if (in_array('propietarios', $existingTables)) {
        $propietariosCount = DB::table('propietarios')->count();
        echo "✅ Tabla propietarios: {$propietariosCount} registros\n";
        
        if ($propietariosCount == 0) {
            echo "   Creando propietario por defecto...\n";
            DB::table('propietarios')->insert([
                'id' => 1,
                'nombre' => 'Hospital Principal',
                'logo' => 'hospital_logo.png'
            ]);
            echo "   ✅ Propietario creado\n";
        } else {
            $propietario1 = DB::table('propietarios')->where('id', 1)->first();
            if (!$propietario1) {
                echo "   Propietario ID 1 no existe, creando...\n";
                DB::table('propietarios')->insert([
                    'id' => 1,
                    'nombre' => 'Hospital Principal',
                    'logo' => 'hospital_logo.png'
                ]);
                echo "   ✅ Propietario ID 1 creado\n";
            } else {
                echo "   ✅ Propietario ID 1 existe: {$propietario1->nombre}\n";
            }
        }
    }
    
    // Verificar estados de equipos
    $estadosTable = null;
    if (in_array('estadosequipos', $existingTables)) {
        $estadosTable = 'estadosequipos';
    } elseif (in_array('estados_equipos', $existingTables)) {
        $estadosTable = 'estados_equipos';
    }
    
    if ($estadosTable) {
        $estadosCount = DB::table($estadosTable)->count();
        echo "✅ Tabla {$estadosTable}: {$estadosCount} registros\n";
        
        if ($estadosCount == 0) {
            echo "   Creando estado por defecto...\n";
            $estadoData = [
                'id' => 1,
                'name' => 'Operativo'
            ];
            
            // Verificar si la tabla usa 'nombre' en lugar de 'name'
            $columns = DB::select("DESCRIBE {$estadosTable}");
            $hasNombre = false;
            foreach ($columns as $column) {
                if ($column->Field === 'nombre') {
                    $hasNombre = true;
                    break;
                }
            }
            
            if ($hasNombre) {
                $estadoData['nombre'] = $estadoData['name'];
                unset($estadoData['name']);
            }
            
            DB::table($estadosTable)->insert($estadoData);
            echo "   ✅ Estado creado\n";
        } else {
            $estado1 = DB::table($estadosTable)->where('id', 1)->first();
            if (!$estado1) {
                echo "   Estado ID 1 no existe, creando...\n";
                $estadoData = [
                    'id' => 1,
                    'name' => 'Operativo'
                ];
                
                // Verificar si la tabla usa 'nombre' en lugar de 'name'
                $columns = DB::select("DESCRIBE {$estadosTable}");
                $hasNombre = false;
                foreach ($columns as $column) {
                    if ($column->Field === 'nombre') {
                        $hasNombre = true;
                        break;
                    }
                }
                
                if ($hasNombre) {
                    $estadoData['nombre'] = $estadoData['name'];
                    unset($estadoData['name']);
                }
                
                DB::table($estadosTable)->insert($estadoData);
                echo "   ✅ Estado ID 1 creado\n";
            } else {
                $nombreEstado = $estado1->name ?? $estado1->nombre ?? 'Sin nombre';
                echo "   ✅ Estado ID 1 existe: {$nombreEstado}\n";
            }
        }
    } else {
        echo "❌ No se encontró tabla de estados de equipos\n";
        echo "   Necesitas crear la tabla 'estadosequipos' o 'estados_equipos'\n";
    }
    
    echo "\n📋 Paso 3: Verificando datos después de las correcciones...\n";
    
    $equipo = DB::table('equipos')->where('id', 69)->first();
    
    // Verificar servicio
    $servicio = DB::table('servicios')->where('id', $equipo->servicio_id)->first();
    echo "✅ Servicio ID {$equipo->servicio_id}: " . ($servicio ? $servicio->name : 'NO ENCONTRADO') . "\n";
    
    // Verificar área
    $area = DB::table('areas')->where('id', $equipo->area_id)->first();
    echo "✅ Área ID {$equipo->area_id}: " . ($area ? $area->name : 'NO ENCONTRADO') . "\n";
    
    // Verificar propietario
    $propietario = DB::table('propietarios')->where('id', $equipo->propietario_id)->first();
    echo "✅ Propietario ID {$equipo->propietario_id}: " . ($propietario ? $propietario->nombre : 'NO ENCONTRADO') . "\n";
    
    // Verificar estado
    if ($estadosTable) {
        $estado = DB::table($estadosTable)->where('id', $equipo->estadoequipo_id)->first();
        $nombreEstado = $estado ? ($estado->name ?? $estado->nombre ?? 'Sin nombre') : 'NO ENCONTRADO';
        echo "✅ Estado ID {$equipo->estadoequipo_id}: {$nombreEstado}\n";
    }
    
    // Verificar sede
    $sede = DB::table('sedes')
        ->join('servicios', 'servicios.sede_id', '=', 'sedes.id')
        ->where('servicios.id', $equipo->servicio_id)
        ->select('sedes.id as sede_id', 'sedes.name as sede_nombre')
        ->first();
    echo "✅ Sede: " . ($sede ? "{$sede->sede_nombre} (ID: {$sede->sede_id})" : 'NO ENCONTRADO') . "\n";
    
    echo "\n🎯 RESULTADO:\n";
    echo "=============\n";
    
    $allDataExists = $servicio && $area && $propietario && ($estadosTable ? DB::table($estadosTable)->where('id', $equipo->estadoequipo_id)->exists() : false) && $sede;
    
    if ($allDataExists) {
        echo "🎉 ✅ TODOS LOS DATOS NECESARIOS EXISTEN AHORA!\n";
        echo "Los dropdowns del modal de edición deberían mostrar:\n";
        echo "   • Sede: {$sede->sede_nombre}\n";
        echo "   • Servicio: {$servicio->name}\n";
        echo "   • Área: {$area->name}\n";
        echo "   • Propietario: {$propietario->nombre}\n";
        if ($estadosTable) {
            $estado = DB::table($estadosTable)->where('id', $equipo->estadoequipo_id)->first();
            $nombreEstado = $estado ? ($estado->name ?? $estado->nombre ?? 'Sin nombre') : 'NO ENCONTRADO';
            echo "   • Estado: {$nombreEstado}\n";
        }
        echo "\n🚀 Ahora prueba el modal de edición nuevamente!\n";
    } else {
        echo "❌ Aún faltan algunos datos. Revisa los errores arriba.\n";
    }
    
} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}

echo "\n📋 Verificación y corrección completada.\n";
