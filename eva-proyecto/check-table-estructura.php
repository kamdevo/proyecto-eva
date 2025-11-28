<?php

require __DIR__ . '/eva-backend/bootstrap/app.php';

$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

echo "🔍 Verificando estructura de tabla planes_mantenimientos...\n\n";

try {
    $columns = Schema::getColumnListing('planes_mantenimientos');
    
    echo "✅ Columnas de la tabla:\n";
    echo str_repeat("=", 60) . "\n";
    
    foreach ($columns as $column) {
        echo "  - $column\n";
    }
    
    echo str_repeat("=", 60) . "\n";
    echo "\n📊 Total columnas: " . count($columns) . "\n";
    
} catch (\Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
