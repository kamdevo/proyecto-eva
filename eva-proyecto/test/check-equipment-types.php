<?php

require_once 'eva-backend/vendor/autoload.php';
$app = require_once 'eva-backend/bootstrap/app.php';

use Illuminate\Support\Facades\DB;

echo "🔍 CHECKING EQUIPMENT TYPES AND CLASSIFICATION\n";
echo "=" . str_repeat("=", 60) . "\n\n";

try {
    // Check tipos table
    echo "1. CHECKING TIPOS TABLE:\n";
    $tipos = DB::table('tipos')->select('id', 'name')->orderBy('id')->get();
    
    if ($tipos->count() > 0) {
        echo "✅ Found " . $tipos->count() . " equipment types:\n";
        foreach ($tipos as $tipo) {
            echo "   ID: {$tipo->id} - Name: {$tipo->name}\n";
        }
    } else {
        echo "❌ No equipment types found in 'tipos' table\n";
    }
    
    echo "\n" . str_repeat("-", 50) . "\n\n";
    
    // Check equipment distribution by tipo_id
    echo "2. EQUIPMENT DISTRIBUTION BY TIPO_ID:\n";
    $distribution = DB::table('equipos')
        ->select('tipo_id', DB::raw('COUNT(*) as count'))
        ->where('status', '!=', 0)
        ->groupBy('tipo_id')
        ->orderBy('tipo_id')
        ->get();
    
    if ($distribution->count() > 0) {
        echo "✅ Equipment distribution:\n";
        foreach ($distribution as $dist) {
            echo "   Tipo ID: {$dist->tipo_id} - Count: {$dist->count} equipments\n";
        }
    } else {
        echo "❌ No equipment found\n";
    }
    
    echo "\n" . str_repeat("-", 50) . "\n\n";
    
    // Check sample equipment for each type
    echo "3. SAMPLE EQUIPMENT BY TYPE:\n";
    foreach ($distribution as $dist) {
        echo "Type ID {$dist->tipo_id} - Sample equipment:\n";
        $samples = DB::table('equipos')
            ->select('id', 'name', 'code', 'marca', 'modelo')
            ->where('tipo_id', $dist->tipo_id)
            ->where('status', '!=', 0)
            ->limit(3)
            ->get();
        
        foreach ($samples as $sample) {
            echo "   ID: {$sample->id} | {$sample->name} | Code: {$sample->code} | {$sample->marca} {$sample->modelo}\n";
        }
        echo "\n";
    }
    
    echo str_repeat("-", 50) . "\n\n";
    
    // Check if there are separate industrial equipment tables
    echo "4. CHECKING FOR SEPARATE INDUSTRIAL TABLES:\n";
    
    $tables = DB::select("SHOW TABLES LIKE '%industrial%'");
    if (count($tables) > 0) {
        echo "✅ Found industrial-related tables:\n";
        foreach ($tables as $table) {
            $tableName = array_values((array)$table)[0];
            echo "   - {$tableName}\n";
            
            // Check record count
            try {
                $count = DB::table($tableName)->count();
                echo "     Records: {$count}\n";
            } catch (Exception $e) {
                echo "     Error counting records: " . $e->getMessage() . "\n";
            }
        }
    } else {
        echo "❌ No separate industrial tables found\n";
    }
    
    echo "\n" . str_repeat("-", 50) . "\n\n";
    
    // Determine classification logic
    echo "5. CLASSIFICATION RECOMMENDATION:\n";
    
    if ($tipos->count() > 0) {
        $biomedicalType = $tipos->where('id', 1)->first();
        $industrialTypes = $tipos->where('id', '!=', 1);
        
        echo "✅ CLASSIFICATION LOGIC:\n";
        echo "   Biomedical Equipment: tipo_id = 1";
        if ($biomedicalType) {
            echo " ({$biomedicalType->name})";
        }
        echo "\n";
        
        echo "   Industrial Equipment: tipo_id != 1\n";
        if ($industrialTypes->count() > 0) {
            echo "   Industrial types found:\n";
            foreach ($industrialTypes as $type) {
                echo "     - ID: {$type->id} ({$type->name})\n";
            }
        }
    } else {
        echo "❌ Cannot determine classification logic - no types found\n";
    }
    
} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
    echo "Stack trace: " . $e->getTraceAsString() . "\n";
}

echo "\n🔚 Equipment type analysis complete\n";
