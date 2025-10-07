<?php

require_once __DIR__ . '/eva-backend/vendor/autoload.php';

// Configurar Laravel
$app = require_once __DIR__ . '/eva-backend/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;

echo "🔍 VERIFICANDO ESTRUCTURA DE TABLAS REALES:\n\n";

// Verificar tabla tecnicos
try {
    $columns = DB::select('DESCRIBE tecnicos');
    echo "📋 Columnas de tabla tecnicos:\n";
    foreach ($columns as $col) {
        echo "• " . $col->Field . " (" . $col->Type . ")\n";
    }
} catch (Exception $e) {
    echo "❌ Error en tabla tecnicos: " . $e->getMessage() . "\n";
}

echo "\n";

// Verificar tabla ordenes
try {
    $columns = DB::select('DESCRIBE ordenes');
    echo "📋 Columnas de tabla ordenes:\n";
    foreach ($columns as $col) {
        echo "• " . $col->Field . " (" . $col->Type . ")\n";
    }
} catch (Exception $e) {
    echo "❌ Error en tabla ordenes: " . $e->getMessage() . "\n";
}

echo "\n";

// Verificar tabla mantenimiento
try {
    $columns = DB::select('DESCRIBE mantenimiento');
    echo "📋 Columnas de tabla mantenimiento:\n";
    foreach ($columns as $col) {
        echo "• " . $col->Field . " (" . $col->Type . ")\n";
    }
} catch (Exception $e) {
    echo "❌ Error en tabla mantenimiento: " . $e->getMessage() . "\n";
}

echo "\n";

// Verificar tabla usuarios
try {
    $columns = DB::select('DESCRIBE usuarios');
    echo "📋 Columnas de tabla usuarios:\n";
    foreach ($columns as $col) {
        echo "• " . $col->Field . " (" . $col->Type . ")\n";
    }
} catch (Exception $e) {
    echo "❌ Error en tabla usuarios: " . $e->getMessage() . "\n";
}

?>
