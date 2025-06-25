<?php

require_once 'vendor/autoload.php';

use Illuminate\Database\Capsule\Manager as DB;

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

// Función para obtener la estructura de una tabla
function getTableStructure($tableName) {
    try {
        $columns = DB::select("DESCRIBE $tableName");
        $structure = [];
        foreach ($columns as $column) {
            $structure[$column->Field] = [
                'type' => $column->Type,
                'null' => $column->Null === 'YES',
                'key' => $column->Key,
                'default' => $column->Default,
                'extra' => $column->Extra
            ];
        }
        return $structure;
    } catch (Exception $e) {
        return false;
    }
}

// Función para generar datos de prueba basados en la estructura
function generateTestData($tableName, $structure) {
    $testData = [];
    $timestamp = time();
    
    foreach ($structure as $field => $info) {
        // Saltar campos auto_increment y primary keys
        if (strpos($info['extra'], 'auto_increment') !== false) {
            continue;
        }
        
        // Saltar campos timestamp que se actualizan automáticamente
        if (strpos($info['extra'], 'on update') !== false) {
            continue;
        }
        
        $type = strtolower($info['type']);
        
        // Generar valor basado en el tipo de campo
        if (strpos($type, 'varchar') !== false || strpos($type, 'text') !== false) {
            $maxLength = 50; // Longitud por defecto
            if (preg_match('/varchar\((\d+)\)/', $type, $matches)) {
                $maxLength = min(50, intval($matches[1]));
            }
            $testData[$field] = substr("Test_CRUD_{$tableName}_{$field}_{$timestamp}", 0, $maxLength);
            
        } elseif (strpos($type, 'int') !== false) {
            // Para campos que parecen foreign keys, usar 1
            if (strpos($field, '_id') !== false || $field === 'id') {
                $testData[$field] = 1;
            } else {
                $testData[$field] = rand(1, 100);
            }
            
        } elseif (strpos($type, 'decimal') !== false || strpos($type, 'float') !== false || strpos($type, 'double') !== false) {
            $testData[$field] = round(rand(1, 1000) / 10, 2);
            
        } elseif (strpos($type, 'date') !== false) {
            if (strpos($type, 'datetime') !== false) {
                $testData[$field] = date('Y-m-d H:i:s');
            } else {
                $testData[$field] = date('Y-m-d');
            }
            
        } elseif (strpos($type, 'timestamp') !== false) {
            $testData[$field] = date('Y-m-d H:i:s');
            
        } elseif (strpos($type, 'tinyint') !== false) {
            $testData[$field] = rand(0, 1);
            
        } elseif (strpos($type, 'enum') !== false) {
            // Para campos enum, usar el primer valor
            if (preg_match("/enum\('([^']+)'/", $type, $matches)) {
                $testData[$field] = $matches[1];
            } else {
                $testData[$field] = 'test';
            }
            
        } else {
            // Valor por defecto para tipos no reconocidos
            $testData[$field] = "test_value_{$timestamp}";
        }
        
        // Si el campo no puede ser null y no tiene valor por defecto, asegurar que tenga valor
        if (!$info['null'] && $info['default'] === null && !isset($testData[$field])) {
            $testData[$field] = 'required_value';
        }
    }
    
    return $testData;
}

// Función para probar CRUD completo en una tabla
function testCompleteCRUD($tableName) {
    echo "\n=== TABLA: $tableName ===\n";
    
    $results = [
        'conectividad' => false,
        'read' => false,
        'create' => false,
        'update' => false,
        'delete' => false,
        'count' => 0,
        'errors' => [],
        'test_id' => null
    ];
    
    try {
        // 1. CONECTIVIDAD y READ
        echo "1. CONECTIVIDAD: ";
        $count = DB::table($tableName)->count();
        $results['conectividad'] = true;
        $results['count'] = $count;
        echo "EXITOSA - $count registros\n";
        
        // 2. READ
        echo "2. READ: ";
        $existing = DB::table($tableName)->first();
        $results['read'] = true;
        echo "EXITOSA\n";
        
        // 3. Obtener estructura de la tabla
        $structure = getTableStructure($tableName);
        if (!$structure) {
            throw new Exception("No se pudo obtener la estructura de la tabla");
        }
        
        // 4. Generar datos de prueba
        $testData = generateTestData($tableName, $structure);
        
        // 5. CREATE
        echo "3. CREATE: ";
        try {
            $insertId = DB::table($tableName)->insertGetId($testData);
            $results['create'] = true;
            $results['test_id'] = $insertId;
            echo "EXITOSA - ID: $insertId\n";
            
            // 6. UPDATE
            echo "4. UPDATE: ";
            $updateData = [];
            foreach ($testData as $key => $value) {
                if (!in_array($key, ['id', 'created_at', 'updated_at']) && 
                    !strpos($structure[$key]['extra'], 'auto_increment')) {
                    if (is_string($value)) {
                        $updateData[$key] = $value . '_updated';
                    } else {
                        $updateData[$key] = $value + 1;
                    }
                    break;
                }
            }
            
            if (!empty($updateData)) {
                $primaryKey = 'id';
                // Buscar la clave primaria real
                foreach ($structure as $field => $info) {
                    if ($info['key'] === 'PRI') {
                        $primaryKey = $field;
                        break;
                    }
                }
                
                $updated = DB::table($tableName)->where($primaryKey, $insertId)->update($updateData);
                $results['update'] = true;
                echo "EXITOSA - $updated registro(s) actualizado(s)\n";
            } else {
                echo "OMITIDA - No hay campos actualizables\n";
                $results['update'] = true;
            }
            
            // 7. DELETE
            echo "5. DELETE: ";
            $deleted = DB::table($tableName)->where($primaryKey, $insertId)->delete();
            $results['delete'] = true;
            echo "EXITOSA - $deleted registro(s) eliminado(s)\n";
            
        } catch (Exception $e) {
            $results['errors'][] = "CRUD: " . $e->getMessage();
            echo "FALLIDA - " . $e->getMessage() . "\n";
            
            // Intentar limpiar si se creó el registro
            if ($results['test_id']) {
                try {
                    DB::table($tableName)->where('id', $results['test_id'])->delete();
                } catch (Exception $cleanupError) {
                    // Ignorar errores de limpieza
                }
            }
        }
        
    } catch (Exception $e) {
        $results['errors'][] = "CONECTIVIDAD: " . $e->getMessage();
        echo "FALLIDA - " . $e->getMessage() . "\n";
    }
    
    return $results;
}

echo "🔥 VERIFICACIÓN CRUD EXHAUSTIVA - TODAS LAS TABLAS\n";
echo "==================================================\n";

// Obtener todas las tablas
$allTables = DB::select('SHOW TABLES');
$tableNames = [];
foreach ($allTables as $table) {
    $tableName = array_values((array)$table)[0];
    $tableNames[] = $tableName;
}

// Ordenar alfabéticamente
sort($tableNames);

echo "📊 Total de tablas a probar: " . count($tableNames) . "\n";
echo "⚠️  ADVERTENCIA: Se realizarán operaciones CREATE/UPDATE/DELETE en TODAS las tablas\n";
echo "🔄 Iniciando pruebas...\n";

$allResults = [];
$successCount = 0;
$totalOperations = 0;

// Probar cada tabla
foreach ($tableNames as $table) {
    $allResults[$table] = testCompleteCRUD($table);
    
    // Contar operaciones exitosas
    foreach (['conectividad', 'read', 'create', 'update', 'delete'] as $operation) {
        $totalOperations++;
        if ($allResults[$table][$operation]) {
            $successCount++;
        }
    }
    
    // Pausa pequeña para no sobrecargar la base de datos
    usleep(100000); // 0.1 segundos
}

echo "\n📊 RESUMEN FINAL - TODAS LAS TABLAS:\n";
echo "====================================\n";
foreach ($allResults as $table => $result) {
    echo sprintf("%-30s | %6d | C:%s R:%s C:%s U:%s D:%s\n", 
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

echo "\n🎯 ESTADÍSTICAS FINALES:\n";
echo "========================\n";
echo "Total de tablas: " . count($tableNames) . "\n";
echo "Total de operaciones: $totalOperations\n";
echo "Operaciones exitosas: $successCount\n";
echo "Tasa de éxito: " . round(($successCount / $totalOperations) * 100, 2) . "%\n";

// Contar por tipo de operación
$operationStats = [
    'conectividad' => 0,
    'read' => 0,
    'create' => 0,
    'update' => 0,
    'delete' => 0
];

foreach ($allResults as $result) {
    foreach ($operationStats as $op => $count) {
        if ($result[$op]) {
            $operationStats[$op]++;
        }
    }
}

echo "\n📈 ESTADÍSTICAS POR OPERACIÓN:\n";
echo "==============================\n";
foreach ($operationStats as $operation => $count) {
    $percentage = round(($count / count($tableNames)) * 100, 2);
    echo sprintf("%-15s: %3d/%3d (%6.2f%%)\n", 
        strtoupper($operation), $count, count($tableNames), $percentage);
}

// Tablas con errores
$tablesWithErrors = array_filter($allResults, function($result) {
    return !empty($result['errors']);
});

if (!empty($tablesWithErrors)) {
    echo "\n❌ TABLAS CON ERRORES:\n";
    echo "=====================\n";
    foreach ($tablesWithErrors as $table => $result) {
        echo "$table:\n";
        foreach ($result['errors'] as $error) {
            echo "  - $error\n";
        }
    }
} else {
    echo "\n✅ TODAS LAS OPERACIONES CRUD EXITOSAS EN TODAS LAS TABLAS\n";
}

echo "\nLeyenda: C=Conectividad, R=Read, C=Create, U=Update, D=Delete\n";
