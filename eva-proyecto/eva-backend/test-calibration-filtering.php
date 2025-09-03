<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;

echo "=== TESTING CALIBRATION FILTERING ===\n\n";

try {
    // Test 1: Check if calibraciones table exists and has data
    echo "1. Checking calibraciones table...\n";
    $totalCalibraciones = DB::table('calibraciones')->count();
    echo "Total calibraciones: {$totalCalibraciones}\n";
    
    if ($totalCalibraciones > 0) {
        // Show sample data structure
        $sample = DB::table('calibraciones')->first();
        echo "Sample calibracion structure:\n";
        foreach ($sample as $key => $value) {
            echo "  - {$key}: {$value}\n";
        }
        echo "\n";
        
        // Test 2: Check date field name
        echo "2. Testing date field names...\n";
        $columns = DB::getSchemaBuilder()->getColumnListing('calibraciones');
        echo "Available columns: " . implode(', ', $columns) . "\n";
        
        $dateColumns = array_filter($columns, function($col) {
            return strpos($col, 'fecha') !== false;
        });
        echo "Date columns: " . implode(', ', $dateColumns) . "\n\n";
        
        // Test 3: Test date filtering with different field names
        echo "3. Testing date filtering...\n";
        
        // Try different possible date field names
        $possibleDateFields = ['fecha_calibracion', 'fecha', 'created_at', 'fecha_programada'];
        
        foreach ($possibleDateFields as $dateField) {
            if (in_array($dateField, $columns)) {
                echo "Testing with field: {$dateField}\n";
                
                // Test filtering for January 2024
                $startDate = '2024-01-01';
                $endDate = '2024-01-31';
                
                $count = DB::table('calibraciones')
                    ->whereDate($dateField, '>=', $startDate)
                    ->whereDate($dateField, '<=', $endDate)
                    ->count();
                    
                echo "  Records in January 2024: {$count}\n";
                
                // Show some sample dates
                $samples = DB::table('calibraciones')
                    ->select('id', $dateField)
                    ->whereNotNull($dateField)
                    ->limit(5)
                    ->get();
                    
                echo "  Sample dates:\n";
                foreach ($samples as $sample) {
                    echo "    ID {$sample->id}: {$sample->$dateField}\n";
                }
                echo "\n";
            }
        }
        
        // Test 4: Simulate the actual API call
        echo "4. Simulating API call with filters...\n";
        
        $query = DB::table('calibraciones');
        
        // Apply filters like the controller does
        $fechaDesde = '2024-01-01';
        $fechaHasta = '2024-01-31';
        
        if (in_array('fecha_calibracion', $columns)) {
            $query->whereDate('fecha_calibracion', '>=', $fechaDesde)
                  ->whereDate('fecha_calibracion', '<=', $fechaHasta);
        } elseif (in_array('fecha', $columns)) {
            $query->whereDate('fecha', '>=', $fechaDesde)
                  ->whereDate('fecha', '<=', $fechaHasta);
        }
        
        $filteredCount = $query->count();
        echo "Filtered results (Jan 2024): {$filteredCount}\n";
        
        if ($filteredCount > 0) {
            $results = $query->limit(3)->get();
            echo "Sample filtered results:\n";
            foreach ($results as $result) {
                echo "  ID: {$result->id}\n";
            }
        }
        
    } else {
        echo "❌ No calibrations found in database\n";
        
        // Check if table exists
        $tableExists = DB::getSchemaBuilder()->hasTable('calibraciones');
        echo "Table 'calibraciones' exists: " . ($tableExists ? 'Yes' : 'No') . "\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "Stack trace: " . $e->getTraceAsString() . "\n";
}

echo "\n=== TEST COMPLETE ===\n";
