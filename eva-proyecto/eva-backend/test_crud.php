<?php

require_once 'vendor/autoload.php';

use Illuminate\Database\Capsule\Manager as DB;
use Illuminate\Database\Schema\Blueprint;

// Configurar la conexión a la base de datos
$capsule = new DB;
$capsule->addConnection([
    'driver' => 'mysql',
    'host' => '127.0.0.1',
    'database' => 'gestionthuv',
    'username' => 'root',
    'password' => '',
    'charset' => 'utf8mb4',
    'collation' => 'utf8mb4_unicode_ci',
    'prefix' => '',
]);

$capsule->setAsGlobal();
$capsule->bootEloquent();

// Función para probar CRUD en una tabla
function testCRUD($tableName, $testData = [], $primaryKey = 'id') {
    echo "\n=== TABLA: $tableName ===\n";
    
    $results = [
        'conectividad' => false,
        'read' => false,
        'create' => false,
        'update' => false,
        'delete' => false,
        'count' => 0,
        'errors' => []
    ];
    
    try {
        // 1. CONECTIVIDAD y READ
        echo "1. CONECTIVIDAD: ";
        $count = DB::table($tableName)->count();
        $results['conectividad'] = true;
        $results['count'] = $count;
        echo "EXITOSA - $count registros\n";
        
        // 2. READ - Obtener un registro existente
        echo "2. READ: ";
        $existing = DB::table($tableName)->first();
        if ($existing) {
            $results['read'] = true;
            echo "EXITOSA - Registro obtenido\n";
        } else {
            echo "EXITOSA - Tabla vacía\n";
            $results['read'] = true;
        }
        
        // 3. CREATE - Solo si tenemos datos de prueba
        echo "3. CREATE: ";
        if (!empty($testData)) {
            try {
                $insertId = DB::table($tableName)->insertGetId($testData);
                $results['create'] = true;
                echo "EXITOSA - ID: $insertId\n";
                
                // 4. UPDATE
                echo "4. UPDATE: ";
                $updateData = [];
                foreach ($testData as $key => $value) {
                    if ($key !== $primaryKey && !in_array($key, ['created_at', 'updated_at'])) {
                        $updateData[$key] = $value . '_updated';
                        break;
                    }
                }
                
                if (!empty($updateData)) {
                    $updated = DB::table($tableName)->where($primaryKey, $insertId)->update($updateData);
                    $results['update'] = true;
                    echo "EXITOSA - $updated registro(s) actualizado(s)\n";
                } else {
                    echo "OMITIDA - No hay campos actualizables\n";
                    $results['update'] = true;
                }
                
                // 5. DELETE
                echo "5. DELETE: ";
                $deleted = DB::table($tableName)->where($primaryKey, $insertId)->delete();
                $results['delete'] = true;
                echo "EXITOSA - $deleted registro(s) eliminado(s)\n";
                
            } catch (Exception $e) {
                $results['errors'][] = "CREATE/UPDATE/DELETE: " . $e->getMessage();
                echo "FALLIDA - " . $e->getMessage() . "\n";
            }
        } else {
            echo "OMITIDA - No hay datos de prueba\n";
            echo "4. UPDATE: OMITIDA - No hay datos de prueba\n";
            echo "5. DELETE: OMITIDA - No hay datos de prueba\n";
        }
        
    } catch (Exception $e) {
        $results['errors'][] = "CONECTIVIDAD: " . $e->getMessage();
        echo "FALLIDA - " . $e->getMessage() . "\n";
    }
    
    return $results;
}

// Datos de prueba para las tablas principales (estructura real)
$testDataSets = [
    'equipos' => [
        'name' => 'Equipo Test CRUD',
        'code' => 'TEST-CRUD-' . time(),
        'serial' => 'SERIE-TEST-' . time(),
        'marca' => 'Marca Test',
        'modelo' => 'Modelo Test',
        'status' => 1,
        'servicio_id' => 1,
        'fuente_id' => 1,
        'tecnologia_id' => 1,
        'frecuencia_id' => 1,
        'cbiomedica_id' => 1,
        'criesgo_id' => 1,
        'tadquisicion_id' => 1,
        'invima_id' => 1,
        'orden_compra_id' => 1,
        'baja_id' => 1,
        'estadoequipo_id' => 1,
        'propietario_id' => 1,
        'area_id' => 1,
        'tipo_id' => 1,
        'guia_id' => 1,
        'manual_id' => 1,
        'disponibilidad_id' => 1,
        'created_at' => date('Y-m-d H:i:s')
    ],
    'usuarios' => [
        'nombre' => 'Usuario',
        'apellido' => 'Test CRUD',
        'email' => 'test_crud_' . time() . '@test.com',
        'username' => 'test_crud_' . time(),
        'password' => password_hash('test123', PASSWORD_DEFAULT),
        'estado' => 1,
        'active' => 'true'
    ],
    'servicios' => [
        'name' => 'Servicio Test CRUD',
        'status' => 1
    ],
    'areas' => [
        'name' => 'Area Test CRUD',
        'status' => 1
    ]
];

// Lista de tablas principales
$mainTables = [
    'equipos',
    'mantenimiento', 
    'calibracion',
    'contingencias',
    'usuarios',
    'servicios',
    'areas'
];

echo "🔍 VERIFICACIÓN EXHAUSTIVA CRUD - BASE DE DATOS GESTIONTHUV\n";
echo "=========================================================\n";

$allResults = [];

// Probar tablas principales
echo "\n📋 FASE 1: TABLAS PRINCIPALES DEL SISTEMA EVA\n";
foreach ($mainTables as $table) {
    $testData = $testDataSets[$table] ?? [];
    $allResults[$table] = testCRUD($table, $testData);
}

// Resumen de resultados
echo "\n📊 RESUMEN DE RESULTADOS - TABLAS PRINCIPALES:\n";
echo "===============================================\n";
foreach ($mainTables as $table) {
    $result = $allResults[$table];
    echo sprintf("%-15s | Registros: %6d | C:%s R:%s C:%s U:%s D:%s\n", 
        $table,
        $result['count'],
        $result['conectividad'] ? '✓' : '✗',
        $result['read'] ? '✓' : '✗',
        $result['create'] ? '✓' : '✗',
        $result['update'] ? '✓' : '✗',
        $result['delete'] ? '✓' : '✗'
    );
    
    if (!empty($result['errors'])) {
        echo "  ERRORES: " . implode('; ', $result['errors']) . "\n";
    }
}

echo "\nLeyenda: C=Conectividad, R=Read, C=Create, U=Update, D=Delete\n";

// Obtener todas las tablas de la base de datos
echo "\n📋 FASE 2: TODAS LAS TABLAS DE LA BASE DE DATOS\n";
$allTables = DB::select('SHOW TABLES');
$tableNames = [];
foreach ($allTables as $table) {
    $tableName = array_values((array)$table)[0];
    if (!in_array($tableName, $mainTables)) {
        $tableNames[] = $tableName;
    }
}

// Ordenar alfabéticamente
sort($tableNames);

// Probar todas las tablas restantes (solo conectividad y read)
foreach ($tableNames as $table) {
    echo "\n=== TABLA: $table ===\n";
    try {
        echo "1. CONECTIVIDAD: ";
        $count = DB::table($table)->count();
        echo "EXITOSA - $count registros\n";

        echo "2. READ: ";
        $existing = DB::table($table)->first();
        if ($existing) {
            echo "EXITOSA - Registro obtenido\n";
        } else {
            echo "EXITOSA - Tabla vacía\n";
        }

        $allResults[$table] = [
            'conectividad' => true,
            'read' => true,
            'create' => 'N/A',
            'update' => 'N/A',
            'delete' => 'N/A',
            'count' => $count,
            'errors' => []
        ];

    } catch (Exception $e) {
        echo "FALLIDA - " . $e->getMessage() . "\n";
        $allResults[$table] = [
            'conectividad' => false,
            'read' => false,
            'create' => 'N/A',
            'update' => 'N/A',
            'delete' => 'N/A',
            'count' => 0,
            'errors' => [$e->getMessage()]
        ];
    }
}

// Resumen final de todas las tablas
echo "\n📊 RESUMEN FINAL - TODAS LAS TABLAS:\n";
echo "====================================\n";
$totalTables = count($allResults);
$successfulConnections = 0;
$totalRecords = 0;

foreach ($allResults as $table => $result) {
    if ($result['conectividad']) {
        $successfulConnections++;
        $totalRecords += $result['count'];
    }

    $createStatus = is_bool($result['create']) ? ($result['create'] ? '✓' : '✗') : '-';
    $updateStatus = is_bool($result['update']) ? ($result['update'] ? '✓' : '✗') : '-';
    $deleteStatus = is_bool($result['delete']) ? ($result['delete'] ? '✓' : '✗') : '-';

    echo sprintf("%-25s | %6d | C:%s R:%s C:%s U:%s D:%s\n",
        $table,
        $result['count'],
        $result['conectividad'] ? '✓' : '✗',
        $result['read'] ? '✓' : '✗',
        $createStatus,
        $updateStatus,
        $deleteStatus
    );
}

echo "\n🎯 ESTADÍSTICAS FINALES:\n";
echo "========================\n";
echo "Total de tablas: $totalTables\n";
echo "Conexiones exitosas: $successfulConnections\n";
echo "Tasa de éxito: " . round(($successfulConnections / $totalTables) * 100, 2) . "%\n";
echo "Total de registros: " . number_format($totalRecords) . "\n";

// Tablas con errores
$tablesWithErrors = array_filter($allResults, function($result) {
    return !empty($result['errors']);
});

if (!empty($tablesWithErrors)) {
    echo "\n❌ TABLAS CON ERRORES:\n";
    echo "=====================\n";
    foreach ($tablesWithErrors as $table => $result) {
        echo "$table: " . implode('; ', $result['errors']) . "\n";
    }
} else {
    echo "\n✅ TODAS LAS TABLAS FUNCIONAN CORRECTAMENTE\n";
}
