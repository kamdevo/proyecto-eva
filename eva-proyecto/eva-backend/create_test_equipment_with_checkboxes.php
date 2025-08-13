<?php

/**
 * Create test equipment with checkbox data for edit modal testing
 */

require_once __DIR__ . '/vendor/autoload.php';
use Illuminate\Support\Facades\DB;

echo "🔧 Creating test equipment with checkbox data...\n\n";

try {
    $app = require_once __DIR__ . '/bootstrap/app.php';
    $app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();
    
    // Create equipment with complete data including JSON fields
    $equipmentData = [
        'name' => 'Test Equipment with Checkboxes',
        'code' => 'TEST-CHECKBOX-001',
        'serial' => 'CHECKBOX-SERIAL-001',
        'marca' => 'Test Brand',
        'modelo' => 'Test Model',
        'descripcion' => 'Test equipment for verifying edit modal checkbox functionality',
        
        // Required IDs
        'servicio_id' => 1,
        'area_id' => 1,
        'propietario_id' => 1,
        'estadoequipo_id' => 1,
        'cbiomedica_id' => 1,
        'criesgo_id' => 1,
        'fuente_id' => 1,
        'tecnologia_id' => 1,
        'frecuencia_id' => 1,
        'tadquisicion_id' => 1,
        'invima_id' => 1,
        'orden_compra_id' => 1,
        'baja_id' => 1,
        'guia_id' => 1,
        'manual_id' => 1,
        'necesidad_id' => 1,
        'disponibilidad_id' => 1,
        'tipo_id' => 1,
        
        // Dates
        'fecha_fabricacion' => '2023-01-15',
        'fecha_instalacion' => '2023-03-20',
        'fecha_ad' => '2023-02-10',
        'fecha_recepcion_almacen' => '2023-02-05',
        'fecha_acta_recibo' => '2023-03-18',
        'fecha_inicio_operacion' => '2023-03-25',
        
        // Other fields
        'costo' => '25000000',
        'vida_util' => '10',
        'localizacion_actual' => 'Test Location',
        'propiedad' => 'Test Country',
        'invima' => 'si',
        'calibracion' => '1',
        'observacion' => 'Test equipment for edit modal verification',
        
        // JSON fields with some checkboxes checked
        'manual' => json_encode([
            'operacion' => true,
            'mantenimiento' => false,
            'partes' => true,
            'otros' => false
        ]),
        'plano' => json_encode([
            'electrico' => false,
            'electronico' => true,
            'neumatico' => false,
            'mecanico' => true
        ]),
        
        'status' => 1
    ];
    
    $equipmentId = DB::table('equipos')->insertGetId($equipmentData);
    
    echo "✅ Test equipment created successfully!\n";
    echo "   Equipment ID: {$equipmentId}\n";
    echo "   Name: {$equipmentData['name']}\n";
    echo "   Serial: {$equipmentData['serial']}\n";
    echo "   Code: {$equipmentData['code']}\n\n";
    
    echo "📋 Checkbox data created:\n";
    echo "   MANUALES:\n";
    $manuales = json_decode($equipmentData['manual'], true);
    foreach ($manuales as $key => $value) {
        $status = $value ? 'CHECKED' : 'UNCHECKED';
        echo "     {$key}: {$status}\n";
    }
    echo "   PLANOS:\n";
    $planos = json_decode($equipmentData['plano'], true);
    foreach ($planos as $key => $value) {
        $status = $value ? 'CHECKED' : 'UNCHECKED';
        echo "     {$key}: {$status}\n";
    }
    
    echo "\n🧪 Testing complete-info endpoint simulation...\n";
    
    // Get the created equipment
    $equipment = DB::table('equipos')->where('id', $equipmentId)->first();
    
    // Get sede information
    $sede = DB::table('sedes')
        ->join('servicios', 'servicios.sede_id', '=', 'sedes.id')
        ->where('servicios.id', $equipment->servicio_id)
        ->select('sedes.id as sede_id', 'sedes.name as sede_nombre')
        ->first();
    
    echo "✅ Complete equipment data for edit modal:\n";
    echo "   ID: {$equipment->id}\n";
    echo "   Name: {$equipment->name}\n";
    echo "   Serial: {$equipment->serial}\n";
    echo "   Code: {$equipment->code}\n";
    echo "   Marca: {$equipment->marca}\n";
    echo "   Modelo: {$equipment->modelo}\n";
    echo "   Servicio ID: {$equipment->servicio_id}\n";
    echo "   Sede ID: {$sede->sede_id}\n";
    echo "   Sede Name: {$sede->sede_nombre}\n";
    echo "   Manual JSON: {$equipment->manual}\n";
    echo "   Plano JSON: {$equipment->plano}\n";
    
    echo "\n🎯 EDIT MODAL TESTING INSTRUCTIONS:\n";
    echo "====================================\n";
    echo "1. Open the edit modal for equipment ID {$equipmentId}\n";
    echo "2. Verify these fields are pre-populated:\n";
    echo "   • Name: '{$equipment->name}'\n";
    echo "   • Serial: '{$equipment->serial}'\n";
    echo "   • Code: '{$equipment->code}'\n";
    echo "   • Marca: '{$equipment->marca}'\n";
    echo "   • Modelo: '{$equipment->modelo}'\n";
    echo "3. Verify these checkboxes are CHECKED:\n";
    echo "   • Manuales: Operación, Partes\n";
    echo "   • Planos: Electrónico, Mecánico\n";
    echo "4. Verify these checkboxes are UNCHECKED:\n";
    echo "   • Manuales: Mantenimiento, Otros\n";
    echo "   • Planos: Eléctrico, Neumático\n";
    echo "5. Make a change and save to test complete workflow\n";
    
    echo "\n🎉 ✅ TEST EQUIPMENT READY FOR EDIT MODAL VERIFICATION!\n";
    echo "Equipment ID {$equipmentId} has complete data with mixed checkbox states\n";
    echo "This will definitively test if the edit modal is working correctly\n";
    
} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}

echo "\n📋 Test equipment creation completed.\n";
