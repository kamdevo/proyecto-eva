<?php
require_once 'eva-backend/vendor/autoload.php';

// Configurar conexión a BD
$servername = "127.0.0.1";
$username = "root";
$password = "";
$dbname = "gestionthuv";
$port = 3307;

try {
    $pdo = new PDO("mysql:host=$servername;port=$port;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "=== VERIFICACIÓN TABLA USUARIOS_ZONAS ===\n\n";
    
    // Verificar si existe la tabla
    $stmt = $pdo->query("SHOW TABLES LIKE 'usuarios_zonas'");
    if ($stmt->rowCount() > 0) {
        echo "✅ Tabla 'usuarios_zonas' EXISTE\n";
        
        // Mostrar estructura
        echo "\n📋 ESTRUCTURA DE LA TABLA:\n";
        $stmt = $pdo->query("DESCRIBE usuarios_zonas");
        foreach ($stmt->fetchAll() as $column) {
            echo "- {$column['Field']} ({$column['Type']}) - {$column['Extra']}\n";
        }
        
        // Mostrar datos existentes
        echo "\n📊 DATOS EXISTENTES:\n";
        
        // Primero verificar qué columnas tienen las tablas usuarios y zonas
        echo "🔍 Verificando estructura de tabla usuarios:\n";
        $stmt = $pdo->query("DESCRIBE usuarios");
        $columnasUsuarios = [];
        foreach ($stmt->fetchAll() as $column) {
            $columnasUsuarios[] = $column['Field'];
            if (in_array($column['Field'], ['nombre', 'email', 'correo'])) {
                echo "  - {$column['Field']} ✅\n";
            }
        }
        
        echo "\n🔍 Verificando estructura de tabla zonas:\n";
        $stmt = $pdo->query("DESCRIBE zonas");
        $columnasZonas = [];
        foreach ($stmt->fetchAll() as $column) {
            $columnasZonas[] = $column['Field'];
            if (in_array($column['Field'], ['nombre', 'name', 'descripcion'])) {
                echo "  - {$column['Field']} ✅\n";
            }
        }
        
        // Consulta simple primero
        echo "\n📋 RELACIONES EXISTENTES (datos básicos):\n";
        $stmt = $pdo->query("SELECT * FROM usuarios_zonas LIMIT 5");
        $relaciones = $stmt->fetchAll();
        
        if (count($relaciones) > 0) {
            foreach ($relaciones as $rel) {
                echo "ID: {$rel['id']} | Usuario ID: {$rel['usuario_id']} | Zona ID: {$rel['zona_id']}\n";
            }
        } else {
            echo "❌ No hay datos en la tabla\n";
        }
        
    } else {
        echo "❌ Tabla 'usuarios_zonas' NO EXISTE\n";
        echo "🔧 Creando tabla...\n";
        
        $createTable = "
            CREATE TABLE usuarios_zonas (
                id INT AUTO_INCREMENT PRIMARY KEY,
                usuario_id INT NOT NULL,
                zona_id INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
                FOREIGN KEY (zona_id) REFERENCES zonas(id) ON DELETE CASCADE,
                UNIQUE KEY unique_usuario_zona (usuario_id, zona_id)
            )
        ";
        $pdo->exec($createTable);
        echo "✅ Tabla 'usuarios_zonas' creada exitosamente\n";
    }
    
    // Verificar tablas relacionadas
    echo "\n=== VERIFICANDO TABLAS RELACIONADAS ===\n";
    
    // Usuarios disponibles
    $stmt = $pdo->query("SELECT id, nombre, email FROM usuarios WHERE estado = 1 LIMIT 5");
    $usuarios = $stmt->fetchAll();
    echo "\n👥 USUARIOS DISPONIBLES:\n";
    foreach ($usuarios as $user) {
        echo "- ID: {$user['id']} | {$user['nombre']} ({$user['email']})\n";
    }
    
    // Zonas disponibles
    $stmt = $pdo->query("SELECT id, nombre FROM zonas LIMIT 5");
    $zonas = $stmt->fetchAll();
    echo "\n🏢 ZONAS DISPONIBLES:\n";
    foreach ($zonas as $zona) {
        echo "- ID: {$zona['id']} | {$zona['nombre']}\n";
    }
    
    echo "\n🎯 SISTEMA LISTO PARA IMPLEMENTAR CRUD\n";
    
} catch(PDOException $e) {
    echo "❌ Error de conexión: " . $e->getMessage() . "\n";
}
?>
