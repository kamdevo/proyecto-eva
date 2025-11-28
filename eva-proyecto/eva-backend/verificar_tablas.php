<?php

/**
 * Script para verificar estructura de tablas en la base de datos
 * Ejecutar desde: eva-backend/
 * Comando: php verificar_tablas.php
 */

require __DIR__ . '/vendor/autoload.php';

// Cargar variables de entorno
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

// Configuración de base de datos desde .env
$host = $_ENV['DB_HOST'] ?? 'localhost';
$database = $_ENV['DB_DATABASE'] ?? 'eva_db';
$username = $_ENV['DB_USERNAME'] ?? 'root';
$password = $_ENV['DB_PASSWORD'] ?? '';

echo "==========================================\n";
echo "VERIFICACIÓN DE TABLAS EN BASE DE DATOS\n";
echo "==========================================\n";
echo "Base de datos: {$database}\n";
echo "Host: {$host}\n\n";

try {
    // Conectar a la base de datos
    $pdo = new PDO(
        "mysql:host={$host};dbname={$database};charset=utf8mb4",
        $username,
        $password,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
    
    echo "✅ Conexión exitosa\n\n";
    
    // Tablas a verificar
    $tablasVerificar = [
        'planes_mantenimientos',
        'cambios_cronograma',
        'equipos',
        'mantenimiento',
        'frecuenciam',
        'proveedores_mantenimiento',
        'usuarios'
    ];
    
    foreach ($tablasVerificar as $tabla) {
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
        echo "TABLA: {$tabla}\n";
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
        
        // Verificar si existe la tabla
        $stmt = $pdo->prepare("SHOW TABLES LIKE ?");
        $stmt->execute([$tabla]);
        $existe = $stmt->fetch();
        
        if (!$existe) {
            echo "❌ La tabla NO EXISTE\n\n";
            continue;
        }
        
        echo "✅ La tabla EXISTE\n\n";
        
        // Obtener estructura de la tabla
        $stmt = $pdo->prepare("DESCRIBE {$tabla}");
        $stmt->execute();
        $columnas = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo "COLUMNAS:\n";
        printf("%-30s %-20s %-8s %-8s %-15s\n", 
            "Campo", "Tipo", "Nulo", "Key", "Extra"
        );
        echo str_repeat("-", 90) . "\n";
        
        foreach ($columnas as $col) {
            printf("%-30s %-20s %-8s %-8s %-15s\n",
                $col['Field'],
                $col['Type'],
                $col['Null'],
                $col['Key'],
                $col['Extra']
            );
        }
        
        // Contar registros
        $stmt = $pdo->query("SELECT COUNT(*) as total FROM {$tabla}");
        $count = $stmt->fetch(PDO::FETCH_ASSOC);
        echo "\nRegistros en tabla: " . $count['total'] . "\n";
        
        // Información adicional específica por tabla
        if ($tabla === 'planes_mantenimientos' && $count['total'] > 0) {
            $stmt = $pdo->query("
                SELECT 
                    COUNT(CASE WHEN usuario_id IS NULL THEN 1 END) as sin_usuario,
                    COUNT(CASE WHEN usuario_id IS NOT NULL THEN 1 END) as con_usuario,
                    MIN(anio) as min_anio,
                    MAX(anio) as max_anio
                FROM planes_mantenimientos
            ");
            $info = $stmt->fetch(PDO::FETCH_ASSOC);
            echo "  - Registros SIN usuario_id: " . $info['sin_usuario'] . "\n";
            echo "  - Registros CON usuario_id: " . $info['con_usuario'] . "\n";
            echo "  - Años: " . $info['min_anio'] . " - " . $info['max_anio'] . "\n";
        }
        
        if ($tabla === 'cambios_cronograma' && $count['total'] > 0) {
            $stmt = $pdo->query("
                SELECT 
                    COUNT(DISTINCT planes_mantenimientos_id) as planes_con_cambios,
                    MIN(created_at) as primer_cambio,
                    MAX(created_at) as ultimo_cambio
                FROM cambios_cronograma
            ");
            $info = $stmt->fetch(PDO::FETCH_ASSOC);
            echo "  - Planes con cambios: " . $info['planes_con_cambios'] . "\n";
            echo "  - Primer cambio: " . $info['primer_cambio'] . "\n";
            echo "  - Último cambio: " . $info['ultimo_cambio'] . "\n";
        }
        
        if ($tabla === 'frecuenciam' && $count['total'] > 0) {
            $stmt = $pdo->query("SELECT id, name FROM frecuenciam ORDER BY id");
            $frecuencias = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo "  Frecuencias disponibles:\n";
            foreach ($frecuencias as $f) {
                echo "    {$f['id']}. {$f['name']}\n";
            }
        }
        
        echo "\n";
    }
    
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
    echo "RESUMEN\n";
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";
    
    // Verificar foreign keys
    echo "FOREIGN KEYS en planes_mantenimientos:\n";
    $stmt = $pdo->query("
        SELECT 
            CONSTRAINT_NAME,
            COLUMN_NAME,
            REFERENCED_TABLE_NAME,
            REFERENCED_COLUMN_NAME
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
        WHERE TABLE_SCHEMA = '{$database}'
        AND TABLE_NAME = 'planes_mantenimientos'
        AND REFERENCED_TABLE_NAME IS NOT NULL
    ");
    $fks = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (empty($fks)) {
        echo "  ⚠️  No hay foreign keys definidas\n";
    } else {
        foreach ($fks as $fk) {
            echo "  ✅ {$fk['COLUMN_NAME']} -> {$fk['REFERENCED_TABLE_NAME']}({$fk['REFERENCED_COLUMN_NAME']})\n";
        }
    }
    
    echo "\n";
    
    // Verificar índices
    echo "ÍNDICES en cambios_cronograma:\n";
    $stmt = $pdo->query("SHOW INDEX FROM cambios_cronograma");
    $indices = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($indices as $idx) {
        if ($idx['Key_name'] !== 'PRIMARY') {
            echo "  - {$idx['Key_name']} en columna {$idx['Column_name']}\n";
        }
    }
    
    echo "\n==========================================\n";
    echo "✅ Verificación completada\n";
    echo "==========================================\n";
    
} catch (PDOException $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
    exit(1);
}
