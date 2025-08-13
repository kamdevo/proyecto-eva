<?php

/**
 * Test the update endpoint to identify the 500 error
 */

require_once __DIR__ . '/vendor/autoload.php';
use Illuminate\Support\Facades\DB;

echo "🔍 TESTING UPDATE ENDPOINT FOR 500 ERROR\n";
echo "========================================\n\n";

try {
    $app = require_once __DIR__ . '/bootstrap/app.php';
    $app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();
    
    echo "📋 Step 1: Checking validation table existence...\n";
    
    $validationTables = [
        'servicios' => 'Services',
        'areas' => 'Areas',
        'propietarios' => 'Owners',
        'fuenteal' => 'Power sources',
        'tecnologiap' => 'Technologies',
        'frecuenciam' => 'Maintenance frequencies',
        'cbiomedica' => 'Biomedical classifications',
        'criesgo' => 'Risk classifications',
        'tadquisicion' => 'Acquisition types',
        'estadoequipos' => 'Equipment states',
        'tipos' => 'Types'
    ];
    
    $missingTables = [];
    $existingTables = [];
    
    foreach ($validationTables as $table => $description) {
        try {
            $count = DB::table($table)->count();
            echo "✅ {$table}: {$count} records ({$description})\n";
            $existingTables[] = $table;
        } catch (Exception $e) {
            echo "❌ {$table}: NOT FOUND ({$description})\n";
            $missingTables[] = $table;
        }
    }
    
    echo "\n📋 Step 2: Checking current equipment data...\n";
    
    $equipment = DB::table('equipos')->where('id', 69)->first();
    
    if (!$equipment) {
        echo "❌ Equipment ID 69 not found\n";
        exit(1);
    }
    
    echo "✅ Equipment ID 69 found\n";
    echo "Current data:\n";
    echo "   name: {$equipment->name}\n";
    echo "   code: {$equipment->code}\n";
    echo "   servicio_id: {$equipment->servicio_id}\n";
    echo "   area_id: {$equipment->area_id}\n";
    echo "   propietario_id: {$equipment->propietario_id}\n";
    echo "   estadoequipo_id: {$equipment->estadoequipo_id}\n";
    echo "   fuente_id: {$equipment->fuente_id}\n";
    echo "   tecnologia_id: {$equipment->tecnologia_id}\n";
    echo "   frecuencia_id: {$equipment->frecuencia_id}\n";
    echo "   cbiomedica_id: {$equipment->cbiomedica_id}\n";
    echo "   criesgo_id: {$equipment->criesgo_id}\n";
    echo "   tadquisicion_id: {$equipment->tadquisicion_id}\n";
    echo "   tipo_id: {$equipment->tipo_id}\n";
    
    echo "\n📋 Step 3: Checking if foreign key values exist in related tables...\n";
    
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
    
    $validationErrors = [];
    
    foreach ($foreignKeyChecks as $field => $check) {
        if (in_array($check['table'], $existingTables)) {
            try {
                $exists = DB::table($check['table'])->where('id', $check['value'])->exists();
                if ($exists) {
                    echo "✅ {$field}: Value {$check['value']} exists in {$check['table']}\n";
                } else {
                    echo "❌ {$field}: Value {$check['value']} NOT found in {$check['table']}\n";
                    $validationErrors[] = "{$field} value {$check['value']} not found in {$check['table']}";
                }
            } catch (Exception $e) {
                echo "❌ {$field}: Error checking {$check['table']} - " . $e->getMessage() . "\n";
                $validationErrors[] = "{$field} table {$check['table']} error: " . $e->getMessage();
            }
        } else {
            echo "❌ {$field}: Table {$check['table']} does not exist\n";
            $validationErrors[] = "{$field} table {$check['table']} missing";
        }
    }
    
    echo "\n📋 Step 4: Creating missing records for validation...\n";
    
    // Create missing records to fix validation errors
    foreach ($missingTables as $table) {
        echo "Creating default record for missing table: {$table}\n";
        
        try {
            switch ($table) {
                case 'fuenteal':
                    DB::table($table)->insert(['id' => 1, 'name' => 'Eléctrica']);
                    echo "✅ Created default fuenteal record\n";
                    break;
                    
                case 'tecnologiap':
                    DB::table($table)->insert(['id' => 1, 'name' => 'Digital']);
                    echo "✅ Created default tecnologiap record\n";
                    break;
                    
                case 'frecuenciam':
                    DB::table($table)->insert(['id' => 1, 'name' => 'Anual']);
                    echo "✅ Created default frecuenciam record\n";
                    break;
                    
                case 'cbiomedica':
                    DB::table($table)->insert(['id' => 1, 'name' => 'Clase I']);
                    echo "✅ Created default cbiomedica record\n";
                    break;
                    
                case 'criesgo':
                    DB::table($table)->insert(['id' => 1, 'name' => 'Bajo']);
                    echo "✅ Created default criesgo record\n";
                    break;
                    
                case 'tadquisicion':
                    DB::table($table)->insert(['id' => 1, 'name' => 'Compra']);
                    echo "✅ Created default tadquisicion record\n";
                    break;
                    
                case 'tipos':
                    DB::table($table)->insert(['id' => 1, 'name' => 'Equipo Médico']);
                    echo "✅ Created default tipos record\n";
                    break;
                    
                default:
                    echo "⚠️ Don't know how to create default record for {$table}\n";
            }
        } catch (Exception $e) {
            echo "❌ Error creating record for {$table}: " . $e->getMessage() . "\n";
        }
    }
    
    echo "\n📋 Step 5: Simulating update request...\n";
    
    // Simulate the update request data
    $updateData = [
        'name' => 'Test Registration Flow - EDITADO UPDATED',
        'code' => $equipment->code,
        'serial' => $equipment->serial,
        'marca' => $equipment->marca,
        'modelo' => $equipment->modelo,
        'descripcion' => $equipment->descripcion,
        'servicio_id' => $equipment->servicio_id,
        'area_id' => $equipment->area_id,
        'propietario_id' => $equipment->propietario_id,
        'estadoequipo_id' => $equipment->estadoequipo_id,
        'fuente_id' => $equipment->fuente_id,
        'tecnologia_id' => $equipment->tecnologia_id,
        'frecuencia_id' => $equipment->frecuencia_id,
        'cbiomedica_id' => $equipment->cbiomedica_id,
        'criesgo_id' => $equipment->criesgo_id,
        'tadquisicion_id' => $equipment->tadquisicion_id,
        'tipo_id' => $equipment->tipo_id,
        'manuales' => '{"operacion":true,"mantenimiento":true,"partes":false,"otros":true}',
        'planos' => '{"electrico":false,"electronico":true,"neumatico":true,"mecanico":false}'
    ];
    
    echo "Update data prepared:\n";
    echo "   name: {$updateData['name']}\n";
    echo "   manuales: {$updateData['manuales']}\n";
    echo "   planos: {$updateData['planos']}\n";
    
    echo "\n📋 Step 6: Testing direct database update...\n";
    
    try {
        // Test direct update
        $updateResult = DB::table('equipos')
            ->where('id', 69)
            ->update([
                'name' => $updateData['name'],
                'manual' => $updateData['manuales'],
                'plano' => $updateData['planos'],
                'fecha_cambio' => now()
            ]);
        
        if ($updateResult) {
            echo "✅ Direct database update successful\n";
            
            // Verify the update
            $updatedEquipment = DB::table('equipos')->where('id', 69)->first();
            echo "✅ Verification: name = {$updatedEquipment->name}\n";
            echo "✅ Verification: manual = {$updatedEquipment->manual}\n";
            echo "✅ Verification: plano = {$updatedEquipment->plano}\n";
        } else {
            echo "❌ Direct database update failed\n";
        }
    } catch (Exception $e) {
        echo "❌ Database update error: " . $e->getMessage() . "\n";
    }
    
    echo "\n🎯 DIAGNOSIS RESULTS:\n";
    echo "====================\n";
    
    if (empty($validationErrors) && empty($missingTables)) {
        echo "🎉 ✅ ALL VALIDATION REQUIREMENTS MET!\n";
        echo "The 500 error is likely due to:\n";
        echo "1. Missing relationship methods in the Equipo model\n";
        echo "2. Incorrect relationship loading in the controller\n";
        echo "3. Database constraint violations\n\n";
        
        echo "🔧 RECOMMENDED FIXES:\n";
        echo "1. Check Equipo model relationships\n";
        echo "2. Remove problematic relationship loading\n";
        echo "3. Add better error handling\n";
    } else {
        echo "❌ VALIDATION ISSUES FOUND:\n";
        foreach ($validationErrors as $error) {
            echo "   • {$error}\n";
        }
        
        if (!empty($missingTables)) {
            echo "\n❌ MISSING TABLES:\n";
            foreach ($missingTables as $table) {
                echo "   • {$table}\n";
            }
        }
    }
    
} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}

echo "\n📋 Update endpoint test completed.\n";
