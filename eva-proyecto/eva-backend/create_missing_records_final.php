<?php

/**
 * Create missing records with correct table structure
 */

require_once __DIR__ . '/vendor/autoload.php';
use Illuminate\Support\Facades\DB;

echo "🔧 CREATING MISSING RECORDS WITH CORRECT STRUCTURE\n";
echo "==================================================\n\n";

try {
    $app = require_once __DIR__ . '/bootstrap/app.php';
    $app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();
    
    $now = now();
    
    echo "📋 Creating records with correct field structure...\n\n";
    
    // Create records based on actual table structure
    $recordsToCreate = [
        'fuenteal' => [
            'id' => 1,
            'name' => 'Eléctrica',
            'created_at' => $now,
            'status' => 1
        ],
        'tecnologiap' => [
            'id' => 1,
            'name' => 'Digital',
            'status' => 1,
            'created_at' => $now
        ],
        'frecuenciam' => [
            'id' => 1,
            'name' => 'Anual',
            'created_at' => $now,
            'status' => 1
        ],
        'tadquisicion' => [
            'id' => 1,
            'name' => 'Compra',
            'created_at' => $now,
            'status' => 1
        ]
    ];
    
    foreach ($recordsToCreate as $table => $record) {
        echo "🔧 Creating record in table: {$table}\n";
        
        try {
            // Check if record already exists
            $exists = DB::table($table)->where('id', $record['id'])->exists();
            
            if (!$exists) {
                DB::table($table)->insert($record);
                echo "   ✅ Created record ID {$record['id']}: {$record['name']}\n";
            } else {
                echo "   ✅ Record ID {$record['id']} already exists\n";
            }
        } catch (Exception $e) {
            echo "   ❌ Error creating record: " . $e->getMessage() . "\n";
        }
        echo "\n";
    }
    
    echo "📋 Final verification of ALL foreign key relationships...\n\n";
    
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
    $validCount = 0;
    $invalidCount = 0;
    
    foreach ($foreignKeyChecks as $field => $check) {
        try {
            $exists = DB::table($check['table'])->where('id', $check['value'])->exists();
            if ($exists) {
                echo "✅ {$field}: Value {$check['value']} exists in {$check['table']}\n";
                $validCount++;
            } else {
                echo "❌ {$field}: Value {$check['value']} NOT found in {$check['table']}\n";
                $invalidCount++;
                $allValid = false;
            }
        } catch (Exception $e) {
            echo "❌ {$field}: Error checking {$check['table']} - " . $e->getMessage() . "\n";
            $invalidCount++;
            $allValid = false;
        }
    }
    
    echo "\n🎯 VALIDATION SUMMARY:\n";
    echo "======================\n";
    echo "✅ Valid relationships: {$validCount}\n";
    echo "❌ Invalid relationships: {$invalidCount}\n";
    echo "📊 Success rate: " . round(($validCount / ($validCount + $invalidCount)) * 100, 1) . "%\n\n";
    
    if ($allValid) {
        echo "🎉 ✅ ALL FOREIGN KEY RELATIONSHIPS ARE NOW VALID!\n";
        echo "The update endpoint should work without 500 errors.\n\n";
    } else {
        echo "⚠️ Some relationships are still invalid.\n";
        echo "Let's modify the controller to handle this gracefully.\n\n";
    }
    
    echo "📋 Testing complete update workflow...\n";
    
    try {
        // Test complete update with all fields
        $updateData = [
            'name' => 'Test Registration Flow - FINAL TEST',
            'code' => $equipment->code,
            'serial' => $equipment->serial,
            'marca' => $equipment->marca,
            'modelo' => $equipment->modelo,
            'descripcion' => 'Updated description for final test',
            'manual' => '{"operacion":true,"mantenimiento":false,"partes":true,"otros":false}',
            'plano' => '{"electrico":false,"electronico":true,"neumatico":false,"mecanico":true}',
            'fecha_cambio' => $now
        ];
        
        $updateResult = DB::table('equipos')
            ->where('id', 69)
            ->update($updateData);
        
        if ($updateResult) {
            echo "✅ Complete update successful!\n";
            
            // Verify all changes
            $updated = DB::table('equipos')->where('id', 69)->first();
            echo "✅ Verified changes:\n";
            echo "   name: {$updated->name}\n";
            echo "   descripcion: {$updated->descripcion}\n";
            echo "   manual: {$updated->manual}\n";
            echo "   plano: {$updated->plano}\n";
            
            // Parse and display JSON
            $manuales = json_decode($updated->manual, true);
            $planos = json_decode($updated->plano, true);
            
            echo "\n✅ Checkbox states:\n";
            echo "   MANUALES:\n";
            foreach ($manuales as $key => $value) {
                $status = $value ? 'CHECKED ✓' : 'UNCHECKED ○';
                echo "     {$key}: {$status}\n";
            }
            echo "   PLANOS:\n";
            foreach ($planos as $key => $value) {
                $status = $value ? 'CHECKED ✓' : 'UNCHECKED ○';
                echo "     {$key}: {$status}\n";
            }
        }
    } catch (Exception $e) {
        echo "❌ Update test failed: " . $e->getMessage() . "\n";
    }
    
    echo "\n🚀 FINAL RECOMMENDATIONS:\n";
    echo "=========================\n";
    
    if ($validCount >= 7) {  // Most relationships are valid
        echo "✅ GOOD NEWS: Most foreign key relationships are now valid!\n";
        echo "✅ The 500 error should be resolved or significantly reduced.\n\n";
        
        echo "📋 NEXT STEPS:\n";
        echo "1. Try the edit modal update again\n";
        echo "2. The PUT /v1/equipos/69 endpoint should work\n";
        echo "3. If it still fails, check Laravel logs for specific errors\n";
        echo "4. Consider temporarily disabling strict validation for missing tables\n\n";
        
        echo "🎯 TESTING INSTRUCTIONS:\n";
        echo "1. Open the edit modal for Equipment ID 69\n";
        echo "2. Make a small change (e.g., modify the name)\n";
        echo "3. Click 'Actualizar Equipo'\n";
        echo "4. Check if the update succeeds without 500 error\n";
        
    } else {
        echo "⚠️ Several foreign key relationships are still invalid.\n";
        echo "⚠️ The controller validation may need to be modified.\n\n";
        
        echo "📋 ALTERNATIVE SOLUTIONS:\n";
        echo "1. Modify controller validation to make some fields optional\n";
        echo "2. Create the remaining missing tables and records\n";
        echo "3. Update equipment record to use valid foreign key values\n";
    }
    
} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}

echo "\n📋 Final record creation completed.\n";
