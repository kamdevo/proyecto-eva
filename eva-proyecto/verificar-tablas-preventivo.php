<?php
echo "=== VERIFICACIÓN TABLAS MANTENIMIENTO PREVENTIVO ===\n";
echo "Base de datos: gestionthuv\n\n";

try {
    $pdo = new PDO('mysql:host=localhost;dbname=gestionthuv', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Tablas principales del sistema de mantenimiento preventivo
    $tablas = [
        'planes_mantenimientos',
        'mantenimiento', 
        'cambios_cronograma',
        'preventivos_notas',
        'proveedor_mantenimiento',
        'repuestos',
        'equipos',
        'servicios',
        'sedes',
        'areas',
        'usuarios'
    ];
    
    echo "1. VERIFICACIÓN DE EXISTENCIA DE TABLAS:\n";
    foreach ($tablas as $tabla) {
        try {
            $stmt = $pdo->query("SHOW TABLES LIKE '$tabla'");
            if ($stmt->rowCount() > 0) {
                echo "✓ $tabla - EXISTE\n";
            } else {
                echo "✗ $tabla - NO EXISTE\n";
            }
        } catch (Exception $e) {
            echo "✗ $tabla - ERROR: " . $e->getMessage() . "\n";
        }
    }
    
    echo "\n2. ESTRUCTURA DE TABLAS PRINCIPALES:\n";
    
    // Verificar planes_mantenimientos
    echo "\n--- TABLA: planes_mantenimientos ---\n";
    try {
        $stmt = $pdo->query("DESCRIBE planes_mantenimientos");
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            echo "  {$row['Field']} ({$row['Type']}) - {$row['Null']} - {$row['Key']}\n";
        }
    } catch (Exception $e) {
        echo "Error: " . $e->getMessage() . "\n";
    }
    
    // Verificar mantenimiento
    echo "\n--- TABLA: mantenimiento ---\n";
    try {
        $stmt = $pdo->query("DESCRIBE mantenimiento");
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            echo "  {$row['Field']} ({$row['Type']}) - {$row['Null']} - {$row['Key']}\n";
        }
    } catch (Exception $e) {
        echo "Error: " . $e->getMessage() . "\n";
    }
    
    // Verificar proveedor_mantenimiento
    echo "\n--- TABLA: proveedor_mantenimiento ---\n";
    try {
        $stmt = $pdo->query("DESCRIBE proveedor_mantenimiento");
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            echo "  {$row['Field']} ({$row['Type']}) - {$row['Null']} - {$row['Key']}\n";
        }
    } catch (Exception $e) {
        echo "Error: " . $e->getMessage() . "\n";
    }
    
    echo "\n3. DATOS DE PRUEBA:\n";
    
    // Contar registros
    $tablasDatos = ['planes_mantenimientos', 'mantenimiento', 'proveedor_mantenimiento', 'equipos'];
    foreach ($tablasDatos as $tabla) {
        try {
            $stmt = $pdo->query("SELECT COUNT(*) as total FROM $tabla");
            $count = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
            echo "  $tabla: $count registros\n";
        } catch (Exception $e) {
            echo "  $tabla: Error - " . $e->getMessage() . "\n";
        }
    }
    
    // Verificar proveedores de mantenimiento
    echo "\n4. PROVEEDORES DE MANTENIMIENTO:\n";
    try {
        $stmt = $pdo->query("SELECT id, name, estado FROM proveedor_mantenimiento LIMIT 10");
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            echo "  ID: {$row['id']}, Nombre: {$row['name']}, Estado: {$row['estado']}\n";
        }
    } catch (Exception $e) {
        echo "Error: " . $e->getMessage() . "\n";
    }
    
    // Verificar planes existentes
    echo "\n5. PLANES DE MANTENIMIENTO EXISTENTES:\n";
    try {
        $stmt = $pdo->query("SELECT anio, COUNT(*) as total FROM planes_mantenimientos GROUP BY anio ORDER BY anio DESC LIMIT 5");
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            echo "  Año {$row['anio']}: {$row['total']} planes\n";
        }
    } catch (Exception $e) {
        echo "Error: " . $e->getMessage() . "\n";
    }
    
} catch (Exception $e) {
    echo "ERROR DE CONEXIÓN: " . $e->getMessage() . "\n";
}

echo "\n=== FIN VERIFICACIÓN ===\n";
?>
