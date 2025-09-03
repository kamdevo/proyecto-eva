<?php

require_once __DIR__ . '/vendor/autoload.php';

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

// Bootstrap Laravel
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== DEBUGGING EQUIPMENT EXPORT ===\n\n";

// Check if tables exist
$tables = ['equipos', 'equipos_industriales'];

foreach ($tables as $table) {
    echo "Checking table: {$table}\n";
    
    if (Schema::hasTable($table)) {
        echo "✓ Table exists\n";
        
        // Get column names
        $columns = Schema::getColumnListing($table);
        echo "Columns: " . implode(', ', $columns) . "\n";
        
        // Get total count
        $count = DB::table($table)->count();
        echo "Total records: {$count}\n";
        
        // Check for status/active field
        if (in_array('status', $columns)) {
            $activeCount = DB::table($table)->where('status', true)->count();
            $inactiveCount = DB::table($table)->where('status', false)->count();
            echo "Active: {$activeCount}, Inactive: {$inactiveCount}\n";
        } elseif (in_array('activo', $columns)) {
            $activeCount = DB::table($table)->where('activo', 1)->count();
            $inactiveCount = DB::table($table)->where('activo', 0)->count();
            echo "Active: {$activeCount}, Inactive: {$inactiveCount}\n";
        }
        
        // Check for sede/location field
        $locationFields = ['sede', 'ubicacion', 'servicio', 'area'];
        foreach ($locationFields as $field) {
            if (in_array($field, $columns)) {
                echo "Location field '{$field}' found\n";
                $locations = DB::table($table)->select($field)->distinct()->limit(10)->pluck($field);
                echo "Sample locations: " . implode(', ', $locations->toArray()) . "\n";
                break;
            }
        }
        
    } else {
        echo "✗ Table does not exist\n";
    }
    
    echo "\n";
}

// Test actual queries
echo "=== TESTING QUERIES ===\n\n";

$table = 'equipos';
if (Schema::hasTable($table)) {
    echo "Testing queries on {$table}:\n";
    
    // Total count
    $total = DB::table($table)->count();
    echo "Total: {$total}\n";
    
    // Try different status field names
    $statusFields = ['status', 'activo', 'estado'];
    foreach ($statusFields as $statusField) {
        if (Schema::hasColumn($table, $statusField)) {
            echo "Using status field: {$statusField}\n";
            
            if ($statusField === 'status') {
                $active = DB::table($table)->where('status', true)->count();
                $inactive = DB::table($table)->where('status', false)->count();
            } elseif ($statusField === 'activo') {
                $active = DB::table($table)->where('activo', 1)->count();
                $inactive = DB::table($table)->where('activo', 0)->count();
            } else {
                $active = DB::table($table)->where($statusField, 'activo')->count();
                $inactive = DB::table($table)->where($statusField, 'inactivo')->count();
            }
            
            echo "Active: {$active}, Inactive: {$inactive}\n";
            break;
        }
    }
    
    // Try location queries
    $locationFields = ['sede', 'ubicacion', 'servicio_id', 'area_id'];
    foreach ($locationFields as $locationField) {
        if (Schema::hasColumn($table, $locationField)) {
            echo "Using location field: {$locationField}\n";
            
            if ($locationField === 'sede' || $locationField === 'ubicacion') {
                $norte = DB::table($table)
                    ->where($locationField, 'LIKE', '%norte%')
                    ->orWhere($locationField, 'LIKE', '%Norte%')
                    ->orWhere($locationField, 'LIKE', '%NORTE%')
                    ->count();
            } else {
                // For ID fields, we need to join with related tables
                $norte = 0; // Will implement if needed
            }
            
            echo "Norte locations: {$norte}\n";
            break;
        }
    }
}

echo "\n=== SAMPLE DATA ===\n";
if (Schema::hasTable('equipos')) {
    $sample = DB::table('equipos')->limit(3)->get();
    foreach ($sample as $equipment) {
        echo "ID: {$equipment->id}\n";
        if (isset($equipment->name)) echo "Name: {$equipment->name}\n";
        if (isset($equipment->status)) echo "Status: " . ($equipment->status ? 'Active' : 'Inactive') . "\n";
        if (isset($equipment->activo)) echo "Activo: {$equipment->activo}\n";
        if (isset($equipment->sede)) echo "Sede: {$equipment->sede}\n";
        if (isset($equipment->ubicacion)) echo "Ubicacion: {$equipment->ubicacion}\n";
        echo "---\n";
    }
}
