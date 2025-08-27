<?php
/**
 * Script para corregir el hash de la contraseña del admin
 */

$host = 'localhost';
$dbname = 'gestionthuv';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    
    echo "🔗 Conectado a la base de datos\n";
    
    // Obtener usuario admin
    $stmt = $pdo->prepare("SELECT id, username, password FROM usuarios WHERE username = 'admin'");
    $stmt->execute();
    $admin = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($admin) {
        echo "👤 Usuario admin encontrado\n";
        echo "🔐 Contraseña actual: " . $admin['password'] . "\n";
        
        // Crear hash bcrypt para la contraseña 'admin'
        $hashedPassword = password_hash('admin', PASSWORD_DEFAULT);
        
        echo "🔄 Actualizando a hash bcrypt...\n";
        echo "🔐 Nuevo hash: " . substr($hashedPassword, 0, 30) . "...\n";
        
        // Actualizar contraseña
        $stmt = $pdo->prepare("UPDATE usuarios SET password = ? WHERE username = 'admin'");
        $stmt->execute([$hashedPassword]);
        
        echo "✅ Contraseña actualizada exitosamente\n";
        
        // Verificar que el hash funciona
        if (password_verify('admin', $hashedPassword)) {
            echo "✅ Verificación de hash exitosa\n";
        } else {
            echo "❌ Error en verificación de hash\n";
        }
        
        echo "\n🔑 CREDENCIALES FINALES:\n";
        echo "   Username: admin\n";
        echo "   Password: admin\n";
        echo "   Hash: bcrypt (compatible con Laravel)\n";
        
    } else {
        echo "❌ Usuario admin no encontrado\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>
