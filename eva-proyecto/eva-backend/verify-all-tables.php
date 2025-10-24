<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

echo "\n========================================\n";
echo "VERIFICACIÓN DE TODAS LAS TABLAS\n";
echo "========================================\n\n";

// Tablas mencionadas en el controlador
$tablasEnControlador = [
    'equipos',
    'servicios',
    'areas',
    'sedes',
    'estadoequipos',
    'frecuenciam',
    'ordenes_compra',
    'tipos_compra',
    'contacto',
    'fuenteal',
    'tecnologiap',
    'cbiomedica',
    'criesgo',
    'tadquisicion',
    'propietarios',
    'bajas_equipos',
    'mantenimiento',
    'proveedores_mantenimiento',
    'calibracion',
    'planes_mantenimientos',
    'ordenes',
    'equipo_contacto',
    'manuales'
];

// Obtener todas las tablas de la BD
$tablasBD = DB::select('SHOW TABLES');
$tablasExistentes = [];
foreach ($tablasBD as $tabla) {
    $tableName = array_values((array)$tabla)[0];
    $tablasExistentes[] = $tableName;
}

echo "Tablas en la BD: " . count($tablasExistentes) . "\n\n";

$errores = [];
$correctas = [];

foreach ($tablasEnControlador as $tabla) {
    if (in_array($tabla, $tablasExistentes)) {
        $correctas[] = $tabla;
        echo "✅ $tabla\n";
    } else {
        $errores[] = $tabla;
        echo "❌ $tabla - NO EXISTE\n";
        
        // Buscar nombre similar
        foreach ($tablasExistentes as $existente) {
            if (stripos($existente, substr($tabla, 0, 5)) !== false) {
                echo "   💡 Posible coincidencia: $existente\n";
            }
        }
    }
}

echo "\n========================================\n";
echo "RESUMEN:\n";
echo "========================================\n";
echo "✅ Correctas: " . count($correctas) . "\n";
echo "❌ Con errores: " . count($errores) . "\n\n";

if (count($errores) > 0) {
    echo "TABLAS QUE NECESITAN CORRECCIÓN:\n";
    foreach ($errores as $error) {
        echo "  - $error\n";
    }
    echo "\n";
}

echo "========================================\n\n";
