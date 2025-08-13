<?php
require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

try {
    // Obtener datos completos del equipo ID 1
    $equipo = \Illuminate\Support\Facades\DB::table('equipos')
        ->where('id', 1)
        ->first();
    
    if ($equipo) {
        echo "=== VERIFICACIÓN COMPLETA DEL EQUIPO ID 1 ===\n";
        echo "Nombre: " . $equipo->name . "\n\n";
        
        // Verificar campos de select más importantes
        $selectFields = [
            'servicio_id' => 'servicios',
            'area_id' => 'areas', 
            'sede_id' => 'sedes',
            'propietario_id' => 'propietarios',
            'fuente_id' => 'fuenteal',
            'tecnologia_id' => 'tecnologiap',
            'frecuencia_id' => 'frecuenciam',
            'cbiomedica_id' => 'cbiomedica',
            'criesgo_id' => 'criesgo',
            'tadquisicion_id' => 'tadquisicion',
            'estadoequipo_id' => 'estadoequipos'
        ];
        
        foreach ($selectFields as $field => $table) {
            $value = $equipo->$field ?? 'NULL';
            echo "📋 $field: $value";
            
            // Verificar si el valor existe en la tabla correspondiente
            if ($value && $value !== 'NULL' && $value != 0) {
                try {
                    $exists = \Illuminate\Support\Facades\DB::table($table)
                        ->where('id', $value)
                        ->exists();
                    
                    if ($exists) {
                        $record = \Illuminate\Support\Facades\DB::table($table)
                            ->where('id', $value)
                            ->first();
                        $name = $record->name ?? $record->descripcion ?? $record->nombre ?? 'Sin nombre';
                        echo " ✅ EXISTE: $name";
                    } else {
                        echo " ❌ NO EXISTE en tabla $table";
                    }
                } catch (Exception $e) {
                    echo " ⚠️ Error verificando tabla $table: " . $e->getMessage();
                }
            } else {
                echo " ⚪ VACÍO";
            }
            echo "\n";
        }
        
        echo "\n=== VERIFICACIÓN DE DATOS SERIALIZADOS ===\n";
        echo "Manual: " . ($equipo->manual ?: 'NULL') . "\n";
        echo "Plano: " . ($equipo->plano ?: 'NULL') . "\n";
        
        // Campos de fecha
        echo "\n=== FECHAS ===\n";
        $dateFields = [
            'fecha_fabricacion',
            'fecha_instalacion', 
            'fecha_adquisicion',
            'fecha_recepcion_almacen',
            'fecha_acta_recibo',
            'fecha_inicio_operacion'
        ];
        
        foreach ($dateFields as $field) {
            $value = $equipo->$field ?? 'NULL';
            echo "$field: $value\n";
        }
        
        // Campos booleanos
        echo "\n=== CAMPOS BOOLEANOS ===\n";
        echo "calibracion: " . ($equipo->calibracion ?? 'NULL') . "\n";
        echo "repuesto_pendiente: " . ($equipo->repuesto_pendiente ?? 'NULL') . "\n";
        
    } else {
        echo "Equipo no encontrado\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
