<?php

// Conexión directa a la base de datos
$host = 'localhost';
$dbname = 'gestionthuv';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "🔍 VERIFICANDO ESTRUCTURA DE ORDENES DE COMPRA...\n";
    echo "=" . str_repeat("=", 60) . "\n\n";
    
    // Verificar qué tabla existe realmente
    $tablas = ['ordenes_compra', 'orden_compras'];
    $tablaReal = null;
    
    foreach ($tablas as $tabla) {
        $sql = "SHOW TABLES LIKE '$tabla'";
        $stmt = $pdo->prepare($sql);
        $stmt->execute();
        $existe = $stmt->fetchAll();
        
        if (count($existe) > 0) {
            echo "✅ Tabla '$tabla' existe\n";
            $tablaReal = $tabla;
            
            // Obtener estructura
            $sql = "DESCRIBE $tabla";
            $stmt = $pdo->prepare($sql);
            $stmt->execute();
            $estructura = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo "📋 Estructura de $tabla:\n";
            foreach ($estructura as $campo) {
                echo "   {$campo['Field']} | {$campo['Type']} | {$campo['Null']} | {$campo['Default']}\n";
            }
            
            // Contar registros
            $sql = "SELECT COUNT(*) as count FROM $tabla";
            $stmt = $pdo->prepare($sql);
            $stmt->execute();
            $count = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
            echo "📊 Total registros: $count\n";
            
            if ($count > 0) {
                echo "📄 Primeros 3 registros:\n";
                $sql = "SELECT * FROM $tabla LIMIT 3";
                $stmt = $pdo->prepare($sql);
                $stmt->execute();
                $registros = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                foreach ($registros as $registro) {
                    echo "   ID: {$registro['id']}\n";
                    if (isset($registro['orden'])) echo "   Orden: {$registro['orden']}\n";
                    if (isset($registro['fecha'])) echo "   Fecha: {$registro['fecha']}\n";
                    if (isset($registro['proveedor_id'])) echo "   Proveedor ID: {$registro['proveedor_id']}\n";
                    if (isset($registro['tipo_compra_id'])) echo "   Tipo Compra ID: {$registro['tipo_compra_id']}\n";
                    echo "   " . str_repeat('-', 30) . "\n";
                }
            }
            echo "\n";
            break;
        } else {
            echo "❌ Tabla '$tabla' no existe\n";
        }
    }
    
    if (!$tablaReal) {
        echo "❌ No se encontró ninguna tabla de órdenes de compra\n";
        exit(1);
    }
    
    // Verificar tablas relacionadas
    echo "🔗 VERIFICANDO TABLAS RELACIONADAS:\n";
    $relacionadas = ['tipos_compra', 'proveedores_mantenimiento'];
    
    foreach ($relacionadas as $tabla) {
        $sql = "SHOW TABLES LIKE '$tabla'";
        $stmt = $pdo->prepare($sql);
        $stmt->execute();
        $existe = $stmt->fetchAll();
        
        if (count($existe) > 0) {
            $sql = "SELECT COUNT(*) as count FROM $tabla";
            $stmt = $pdo->prepare($sql);
            $stmt->execute();
            $count = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
            echo "✅ $tabla: $count registros\n";
            
            if ($count > 0 && $count <= 10) {
                $sql = "SELECT * FROM $tabla";
                $stmt = $pdo->prepare($sql);
                $stmt->execute();
                $registros = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                foreach ($registros as $registro) {
                    $nombre = $registro['name'] ?? $registro['tipo_compra'] ?? 'Sin nombre';
                    echo "   ID {$registro['id']}: $nombre\n";
                }
            }
        } else {
            echo "❌ $tabla: no existe\n";
        }
    }
    
    // Verificar si hay datos de ejemplo para mostrar
    if ($tablaReal && $count > 0) {
        echo "\n🎯 DATOS PARA FRONTEND:\n";
        echo "Tabla real: $tablaReal\n";
        echo "Campos disponibles: ";
        
        $camposImportantes = [];
        foreach ($estructura as $campo) {
            $camposImportantes[] = $campo['Field'];
        }
        echo implode(', ', $camposImportantes) . "\n";
        
        echo "\n📋 RECOMENDACIONES:\n";
        echo "1. Usar tabla: $tablaReal\n";
        echo "2. Corregir modelo OrdenCompra para usar tabla correcta\n";
        echo "3. Crear endpoint que incluya JOINs con tablas relacionadas\n";
        echo "4. Implementar paginación en frontend\n";
    }
    
} catch (PDOException $e) {
    echo "❌ ERROR DE CONEXIÓN: " . $e->getMessage() . "\n";
} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
}

echo "\n🔚 Fin de la verificación\n";
