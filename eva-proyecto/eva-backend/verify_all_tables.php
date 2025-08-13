<?php

/**
 * Systematic verification of all table names and relationships
 */

require_once __DIR__ . '/vendor/autoload.php';
use Illuminate\Support\Facades\DB;

echo "🔍 SYSTEMATIC TABLE VERIFICATION FOR EDIT MODAL\n";
echo "===============================================\n\n";

try {
    $app = require_once __DIR__ . '/bootstrap/app.php';
    $app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();
    
    echo "📋 Step 1: Finding all tables in database...\n";
    
    $allTables = [];
    $tables = DB::select('SHOW TABLES');
    foreach ($tables as $table) {
        $tableName = array_values((array)$table)[0];
        $allTables[] = $tableName;
    }
    
    echo "✅ Found " . count($allTables) . " tables total\n\n";
    
    echo "📋 Step 2: Identifying tables related to equipment edit modal...\n";
    
    $searchPatterns = [
        'estado' => 'Equipment states',
        'servicio' => 'Services', 
        'area' => 'Areas',
        'propietario' => 'Owners',
        'sede' => 'Locations/Sites',
        'equipo' => 'Equipment',
        'clasificacion' => 'Classifications',
        'tipo' => 'Types',
        'fuente' => 'Sources',
        'tecnologia' => 'Technologies',
        'frecuencia' => 'Frequencies',
        'adquisicion' => 'Acquisitions',
        'invima' => 'INVIMA',
        'orden' => 'Orders',
        'baja' => 'Decommissions',
        'guia' => 'Guides',
        'manual' => 'Manuals',
        'necesidad' => 'Needs',
        'disponibilidad' => 'Availability'
    ];
    
    $foundTables = [];
    
    foreach ($searchPatterns as $pattern => $description) {
        echo "🔍 Looking for tables containing '{$pattern}':\n";
        $matches = [];
        foreach ($allTables as $table) {
            if (stripos($table, $pattern) !== false) {
                $matches[] = $table;
            }
        }
        
        if (!empty($matches)) {
            echo "   ✅ Found: " . implode(', ', $matches) . "\n";
            $foundTables[$pattern] = $matches;
        } else {
            echo "   ❌ No tables found for '{$pattern}'\n";
        }
        echo "\n";
    }
    
    echo "📋 Step 3: Verifying specific table names used in edit modal...\n";
    
    $requiredTables = [
        'equipos' => 'Main equipment table',
        'servicios' => 'Services',
        'areas' => 'Areas', 
        'propietarios' => 'Owners',
        'sedes' => 'Sites/Locations'
    ];
    
    // Find equipment states table
    $statesTables = [];
    foreach ($allTables as $table) {
        if (stripos($table, 'estado') !== false && stripos($table, 'equipo') !== false) {
            $statesTables[] = $table;
        }
    }
    
    if (!empty($statesTables)) {
        echo "✅ Equipment states tables found: " . implode(', ', $statesTables) . "\n";
        $requiredTables[reset($statesTables)] = 'Equipment states';
    } else {
        echo "❌ No equipment states table found\n";
    }
    
    echo "\n📋 Step 4: Checking table existence and structure...\n";
    
    $validTables = [];
    
    foreach ($requiredTables as $tableName => $description) {
        if (in_array($tableName, $allTables)) {
            echo "✅ Table '{$tableName}' exists ({$description})\n";
            
            try {
                $count = DB::table($tableName)->count();
                echo "   Records: {$count}\n";
                
                if ($count > 0) {
                    $sample = DB::table($tableName)->limit(1)->first();
                    $columns = array_keys((array)$sample);
                    echo "   Columns: " . implode(', ', $columns) . "\n";
                }
                
                $validTables[$tableName] = $description;
            } catch (Exception $e) {
                echo "   ❌ Error accessing table: " . $e->getMessage() . "\n";
            }
        } else {
            echo "❌ Table '{$tableName}' does NOT exist\n";
        }
        echo "\n";
    }
    
    echo "📋 Step 5: Testing equipment ID 69 relationships...\n";
    
    $equipment = DB::table('equipos')->where('id', 69)->first();
    
    if (!$equipment) {
        echo "❌ Equipment ID 69 not found\n";
        exit(1);
    }
    
    echo "✅ Equipment ID 69 found: {$equipment->name}\n";
    echo "   servicio_id: {$equipment->servicio_id}\n";
    echo "   area_id: {$equipment->area_id}\n";
    echo "   propietario_id: {$equipment->propietario_id}\n";
    echo "   estadoequipo_id: {$equipment->estadoequipo_id}\n\n";
    
    $relationshipResults = [];
    
    // Test servicios relationship
    if (isset($validTables['servicios'])) {
        $servicio = DB::table('servicios')->where('id', $equipment->servicio_id)->first();
        if ($servicio) {
            echo "✅ Servicio found: {$servicio->name} (ID: {$servicio->id})\n";
            $relationshipResults['servicio'] = $servicio;
        } else {
            echo "❌ Servicio ID {$equipment->servicio_id} not found\n";
        }
    }
    
    // Test areas relationship
    if (isset($validTables['areas'])) {
        $area = DB::table('areas')->where('id', $equipment->area_id)->first();
        if ($area) {
            echo "✅ Area found: {$area->name} (ID: {$area->id})\n";
            $relationshipResults['area'] = $area;
        } else {
            echo "❌ Area ID {$equipment->area_id} not found\n";
        }
    }
    
    // Test propietarios relationship
    if (isset($validTables['propietarios'])) {
        $propietario = DB::table('propietarios')->where('id', $equipment->propietario_id)->first();
        if ($propietario) {
            $propietarioName = $propietario->nombre ?? $propietario->name ?? 'Unknown';
            echo "✅ Propietario found: {$propietarioName} (ID: {$propietario->id})\n";
            $relationshipResults['propietario'] = $propietario;
        } else {
            echo "❌ Propietario ID {$equipment->propietario_id} not found\n";
        }
    }
    
    // Test equipment states relationship
    $statesTableName = null;
    foreach ($statesTables as $table) {
        if (isset($validTables[$table])) {
            $statesTableName = $table;
            break;
        }
    }
    
    if ($statesTableName) {
        $estado = DB::table($statesTableName)->where('id', $equipment->estadoequipo_id)->first();
        if ($estado) {
            $estadoName = $estado->name ?? $estado->nombre ?? 'Unknown';
            echo "✅ Estado found: {$estadoName} (ID: {$estado->id}) in table '{$statesTableName}'\n";
            $relationshipResults['estado'] = $estado;
        } else {
            echo "❌ Estado ID {$equipment->estadoequipo_id} not found in table '{$statesTableName}'\n";
        }
    } else {
        echo "❌ No valid equipment states table found\n";
    }
    
    // Test sede relationship (through servicios)
    if (isset($relationshipResults['servicio']) && isset($validTables['sedes'])) {
        $sede = DB::table('sedes')->where('id', $relationshipResults['servicio']->sede_id)->first();
        if ($sede) {
            echo "✅ Sede found: {$sede->name} (ID: {$sede->id})\n";
            $relationshipResults['sede'] = $sede;
        } else {
            echo "❌ Sede ID {$relationshipResults['servicio']->sede_id} not found\n";
        }
    }
    
    echo "\n📋 Step 6: Creating missing records if needed...\n";
    
    $missingRecords = [];
    
    // Check and create missing area
    if (!isset($relationshipResults['area'])) {
        echo "Creating missing area record...\n";
        try {
            DB::table('areas')->insert([
                'id' => $equipment->area_id,
                'name' => 'Área General',
                'servicio_id' => $equipment->servicio_id,
                'centro_id' => 1,
                'piso_id' => 1,
                'status' => 1,
                'responsable_id' => 1,
                'telefono' => '123456789',
                'email' => 'area@hospital.com',
                'ubicacion' => 'Planta Baja'
            ]);
            echo "✅ Area record created\n";
        } catch (Exception $e) {
            echo "❌ Error creating area: " . $e->getMessage() . "\n";
        }
    }
    
    // Check and create missing propietario
    if (!isset($relationshipResults['propietario'])) {
        echo "Creating missing propietario record...\n";
        try {
            DB::table('propietarios')->insert([
                'id' => $equipment->propietario_id,
                'nombre' => 'Hospital Principal',
                'logo' => 'hospital_logo.png'
            ]);
            echo "✅ Propietario record created\n";
        } catch (Exception $e) {
            echo "❌ Error creating propietario: " . $e->getMessage() . "\n";
        }
    }
    
    // Check and create missing estado
    if (!isset($relationshipResults['estado']) && $statesTableName) {
        echo "Creating missing estado record...\n";
        try {
            $columns = DB::select("DESCRIBE {$statesTableName}");
            $hasNombre = false;
            foreach ($columns as $column) {
                if ($column->Field === 'nombre') {
                    $hasNombre = true;
                    break;
                }
            }
            
            $estadoData = ['id' => $equipment->estadoequipo_id];
            if ($hasNombre) {
                $estadoData['nombre'] = 'Operativo';
            } else {
                $estadoData['name'] = 'Operativo';
            }
            
            DB::table($statesTableName)->insert($estadoData);
            echo "✅ Estado record created in table '{$statesTableName}'\n";
        } catch (Exception $e) {
            echo "❌ Error creating estado: " . $e->getMessage() . "\n";
        }
    }
    
    echo "\n📋 Step 7: Final verification after fixes...\n";
    
    // Re-test all relationships
    $finalResults = [];
    
    if (isset($validTables['servicios'])) {
        $servicio = DB::table('servicios')->where('id', $equipment->servicio_id)->first();
        $finalResults['servicio'] = $servicio ? $servicio->name : 'NOT FOUND';
    }
    
    if (isset($validTables['areas'])) {
        $area = DB::table('areas')->where('id', $equipment->area_id)->first();
        $finalResults['area'] = $area ? $area->name : 'NOT FOUND';
    }
    
    if (isset($validTables['propietarios'])) {
        $propietario = DB::table('propietarios')->where('id', $equipment->propietario_id)->first();
        $finalResults['propietario'] = $propietario ? ($propietario->nombre ?? $propietario->name) : 'NOT FOUND';
    }
    
    if ($statesTableName) {
        $estado = DB::table($statesTableName)->where('id', $equipment->estadoequipo_id)->first();
        $finalResults['estado'] = $estado ? ($estado->name ?? $estado->nombre) : 'NOT FOUND';
    }
    
    if (isset($validTables['sedes']) && isset($relationshipResults['servicio'])) {
        $sede = DB::table('sedes')->where('id', $relationshipResults['servicio']->sede_id)->first();
        $finalResults['sede'] = $sede ? $sede->name : 'NOT FOUND';
    }
    
    echo "🎯 FINAL RESULTS:\n";
    echo "=================\n\n";
    
    $allGood = true;
    foreach ($finalResults as $type => $name) {
        if ($name === 'NOT FOUND') {
            echo "❌ {$type}: NOT FOUND\n";
            $allGood = false;
        } else {
            echo "✅ {$type}: {$name}\n";
        }
    }
    
    if ($allGood) {
        echo "\n🎉 ✅ ALL RELATIONSHIPS ARE NOW WORKING!\n";
        echo "The edit modal dropdowns should now show:\n";
        foreach ($finalResults as $type => $name) {
            echo "   • " . ucfirst($type) . ": {$name}\n";
        }
        echo "\n🚀 Test the edit modal now - dropdowns should show actual values instead of placeholders!\n";
    } else {
        echo "\n❌ Some relationships are still missing. Check the errors above.\n";
    }
    
} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}

echo "\n📋 Systematic table verification completed.\n";
