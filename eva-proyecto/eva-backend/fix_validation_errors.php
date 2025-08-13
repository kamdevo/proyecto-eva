<?php

/**
 * Fix validation errors by creating missing foreign key records
 */

require_once __DIR__ . '/vendor/autoload.php';
use Illuminate\Support\Facades\DB;

echo "🔧 FIXING VALIDATION ERRORS FOR UPDATE ENDPOINT\n";
echo "===============================================\n\n";

try {
    $app = require_once __DIR__ . '/bootstrap/app.php';
    $app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();
    
    echo "📋 Creating missing foreign key records...\n\n";
    
    // Create missing records for each table
    $recordsToCreate = [
        'fuenteal' => [
            ['id' => 1, 'name' => 'Eléctrica'],
        ],
        'tecnologiap' => [
            ['id' => 1, 'name' => 'Digital'],
        ],
        'frecuenciam' => [
            ['id' => 1, 'name' => 'Anual'],
        ],
        'cbiomedica' => [
            ['id' => 1, 'name' => 'Clase I'],
        ],
        'criesgo' => [
            ['id' => 1, 'name' => 'Bajo'],
        ],
        'tadquisicion' => [
            ['id' => 1, 'name' => 'Compra'],
        ],
        'tipos' => [
            ['id' => 1, 'name' => 'Equipo Médico'],
        ]
    ];
    
    foreach ($recordsToCreate as $table => $records) {
        echo "🔧 Processing table: {$table}\n";
        
        try {
            foreach ($records as $record) {
                // Check if record already exists
                $exists = DB::table($table)->where('id', $record['id'])->exists();
                
                if (!$exists) {
                    DB::table($table)->insert($record);
                    echo "   ✅ Created record ID {$record['id']}: {$record['name']}\n";
                } else {
                    echo "   ✅ Record ID {$record['id']} already exists\n";
                }
            }
        } catch (Exception $e) {
            echo "   ❌ Error with table {$table}: " . $e->getMessage() . "\n";
            
            // Try to create the table if it doesn't exist
            if (strpos($e->getMessage(), "doesn't exist") !== false) {
                echo "   🔧 Attempting to create table {$table}...\n";
                
                try {
                    switch ($table) {
                        case 'fuenteal':
                            DB::statement("CREATE TABLE fuenteal (id INT PRIMARY KEY, name VARCHAR(255))");
                            break;
                        case 'tecnologiap':
                            DB::statement("CREATE TABLE tecnologiap (id INT PRIMARY KEY, name VARCHAR(255))");
                            break;
                        case 'frecuenciam':
                            DB::statement("CREATE TABLE frecuenciam (id INT PRIMARY KEY, name VARCHAR(255))");
                            break;
                        case 'cbiomedica':
                            DB::statement("CREATE TABLE cbiomedica (id INT PRIMARY KEY, name VARCHAR(255))");
                            break;
                        case 'criesgo':
                            DB::statement("CREATE TABLE criesgo (id INT PRIMARY KEY, name VARCHAR(255))");
                            break;
                        case 'tadquisicion':
                            DB::statement("CREATE TABLE tadquisicion (id INT PRIMARY KEY, name VARCHAR(255))");
                            break;
                        case 'tipos':
                            DB::statement("CREATE TABLE tipos (id INT PRIMARY KEY, name VARCHAR(255))");
                            break;
                    }
                    
                    echo "   ✅ Table {$table} created\n";
                    
                    // Now insert the records
                    foreach ($records as $record) {
                        DB::table($table)->insert($record);
                        echo "   ✅ Created record ID {$record['id']}: {$record['name']}\n";
                    }
                    
                } catch (Exception $createError) {
                    echo "   ❌ Failed to create table {$table}: " . $createError->getMessage() . "\n";
                }
            }
        }
        echo "\n";
    }
    
    echo "📋 Verifying all foreign key relationships...\n\n";
    
    $equipment = DB::table('equipos')->where('id', 69)->first();
    
    $foreignKeyChecks = [
        'servicio_id' => ['table' => 'servicios', 'value' => $equipment->servicio_id],
        'area_id' => ['table' => 'areas', 'value' => $equipment->area_id],
        'propietario_id' => ['table' => 'propietarios', 'value' => $equipment->propietario_id],
        'estadoequipo_id' => ['table' => 'estadoequipos', 'value' => $equipment->estadoequipo_id],
        'fuente_id' => ['table' => 'fuenteal', 'value' => $equipment->fuente_id],
        'tecnologia_id' => ['table' => 'tecnologiap', 'value' => $equipment->tecnologia_id],
        'frecuencia_id' => ['table' => 'frecuenciam', 'value' => $equipment->frecuencia_id],
        'cbiomedica_id' => ['table' => 'cbiomedica', 'value' => $equipment->cbiomedica_id],
        'criesgo_id' => ['table' => 'criesgo', 'value' => $equipment->criesgo_id],
        'tadquisicion_id' => ['table' => 'tadquisicion', 'value' => $equipment->tadquisicion_id],
        'tipo_id' => ['table' => 'tipos', 'value' => $equipment->tipo_id]
    ];
    
    $allValid = true;
    
    foreach ($foreignKeyChecks as $field => $check) {
        try {
            $exists = DB::table($check['table'])->where('id', $check['value'])->exists();
            if ($exists) {
                echo "✅ {$field}: Value {$check['value']} exists in {$check['table']}\n";
            } else {
                echo "❌ {$field}: Value {$check['value']} NOT found in {$check['table']}\n";
                $allValid = false;
            }
        } catch (Exception $e) {
            echo "❌ {$field}: Error checking {$check['table']} - " . $e->getMessage() . "\n";
            $allValid = false;
        }
    }
    
    echo "\n📋 Testing update endpoint simulation...\n";
    
    if ($allValid) {
        echo "🎉 ✅ ALL FOREIGN KEY RELATIONSHIPS ARE VALID!\n";
        echo "The update endpoint should now work without 500 errors.\n\n";
        
        // Test a simple update
        try {
            $testUpdate = DB::table('equipos')
                ->where('id', 69)
                ->update([
                    'name' => 'Test Registration Flow - VALIDATION FIXED',
                    'fecha_cambio' => now()
                ]);
            
            if ($testUpdate) {
                echo "✅ Test update successful!\n";
                
                // Verify
                $updated = DB::table('equipos')->where('id', 69)->first();
                echo "✅ Verified: name = {$updated->name}\n";
            }
        } catch (Exception $e) {
            echo "❌ Test update failed: " . $e->getMessage() . "\n";
        }
        
        echo "\n🚀 NEXT STEPS:\n";
        echo "=============\n";
        echo "1. The validation errors are now fixed\n";
        echo "2. Try the edit modal update again\n";
        echo "3. The PUT /v1/equipos/69 endpoint should work\n";
        echo "4. All foreign key validations will pass\n";
        
    } else {
        echo "❌ Some foreign key relationships are still invalid\n";
        echo "Manual intervention may be required\n";
    }
    
} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}

echo "\n📋 Validation error fix completed.\n";
