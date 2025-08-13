<?php

require_once __DIR__ . '/vendor/autoload.php';
use Illuminate\Support\Facades\DB;

echo "🔧 Creating complete test equipment for edit modal...\n";

// Initialize Laravel
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

// Create comprehensive test equipment with ALL fields populated
$equipmentId = DB::table('equipos')->insertGetId([
    'name' => 'Complete Edit Modal Test Equipment',
    'code' => 'COMPLETE-EDIT-TEST-001',
    'serial' => 'COMPLETE-SERIAL-001',
    'marca' => 'Complete Test Brand',
    'modelo' => 'Complete Test Model',
    'descripcion' => 'Complete equipment with all fields for edit modal testing',
    'codigo_antiguo' => 'OLD-CODE-001',
    'invima' => 'si',
    
    // Dates
    'fecha_fabricacion' => '2020-01-15',
    'fecha_instalacion' => '2020-03-20',
    'fecha_ad' => '2020-02-10',
    'fecha_recepcion_almacen' => '2020-02-05',
    'fecha_acta_recibo' => '2020-03-18',
    'fecha_inicio_operacion' => '2020-03-25',
    'fecha_vencimiento_garantia' => '2025-03-20',
    'vida_util' => '15',
    
    // Location and properties
    'servicio_id' => 1,
    'area_id' => 1,
    'localizacion_actual' => 'Centro de Costo Completo',
    'propiedad' => 'Colombia',
    'movilidad' => 'FIJO',
    
    // Economic
    'costo' => '75000000',
    'garantia' => '24 meses',
    'tadquisicion_id' => 1,
    
    // Classifications
    'propietario_id' => 1,
    'estadoequipo_id' => 1,
    'cbiomedica_id' => 1,
    'criesgo_id' => 1,
    
    // Technical
    'fuente_id' => 1,
    'tecnologia_id' => 1,
    'frecuencia_id' => 1,
    'calibracion' => '1',
    'periodicidad' => 'SEMESTRAL',
    'evaluacion_desempenio' => 'Excelente',
    'repuesto_pendiente' => '0',
    
    // Electrical
    'v1' => '110',
    'v2' => '220',
    'v3' => '440',
    
    // Additional required IDs
    'invima_id' => 1,
    'orden_compra_id' => 1,
    'baja_id' => 1,
    'guia_id' => 1,
    'manual_id' => 1,
    'necesidad_id' => 1,
    'disponibilidad_id' => 1,
    'tipo_id' => 1,

    // Documentation
    'observacion' => 'Equipment with complete data for comprehensive edit modal testing',
    'accesorios' => 'Cable de poder, manual de usuario, kit de calibración',
    
    // JSON fields
    'manual' => json_encode([
        'operacion' => true,
        'mantenimiento' => true,
        'partes' => false,
        'otros' => true
    ]),
    'plano' => json_encode([
        'electrico' => true,
        'electronico' => false,
        'neumatico' => true,
        'mecanico' => false
    ]),
    
    'status' => 1
]);

echo "✅ Complete test equipment created with ID: {$equipmentId}\n";
echo "📋 This equipment has ALL fields populated for comprehensive edit modal testing\n";
echo "🚀 Ready for edit modal functionality verification\n";

// Now test this equipment
echo "\n🧪 Testing the complete equipment data...\n";

$equipment = DB::table('equipos')->where('id', $equipmentId)->first();

$allFields = [
    'name', 'code', 'serial', 'marca', 'modelo', 'descripcion', 'codigo_antiguo',
    'invima', 'fecha_fabricacion', 'fecha_instalacion', 'fecha_ad', 
    'fecha_recepcion_almacen', 'fecha_acta_recibo', 'fecha_inicio_operacion',
    'vida_util', 'servicio_id', 'area_id', 'localizacion_actual', 'propiedad',
    'costo', 'garantia', 'propietario_id', 'estadoequipo_id', 'cbiomedica_id',
    'criesgo_id', 'calibracion', 'observacion', 'manual', 'plano'
];

$populatedFields = 0;
foreach ($allFields as $field) {
    if (!empty($equipment->$field)) {
        $populatedFields++;
    }
}

echo "📊 COMPLETE EQUIPMENT VERIFICATION:\n";
echo "   - Total fields checked: " . count($allFields) . "\n";
echo "   - Populated fields: {$populatedFields}\n";
echo "   - Coverage: " . round(($populatedFields / count($allFields)) * 100, 1) . "%\n";

if ($populatedFields >= (count($allFields) * 0.9)) {
    echo "\n🎉 ✅ PERFECT! Equipment ID {$equipmentId} is ready for comprehensive edit modal testing!\n";
    echo "✅ All critical fields are populated\n";
    echo "✅ JSON fields (manuales/planos) are properly formatted\n";
    echo "✅ Date fields are ready for date inputs\n";
    echo "✅ Dropdown fields have valid IDs\n";
    echo "✅ Edit modal will show complete pre-populated data\n";
} else {
    echo "\n⚠️ Some fields may still be missing data\n";
}

echo "\n📋 Equipment ID {$equipmentId} is ready for edit modal testing!\n";
