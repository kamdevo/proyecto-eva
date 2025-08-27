<?php
/**
 * Fix admin user status and test activation system
 */

echo "🔧 FIXING ADMIN USER STATUS\n";
echo str_repeat("=", 50) . "\n\n";

// Database connection
$host = 'localhost';
$dbname = 'gestionthuv';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "✅ Database connection successful\n\n";
    
    // 1. Check current admin user status
    echo "1. 🔍 Checking admin user status...\n";
    
    $stmt = $pdo->prepare("SELECT id, nombre, username, rol_id, active FROM usuarios WHERE username = 'admin' OR id = 1");
    $stmt->execute();
    $adminUsers = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($adminUsers as $user) {
        echo "   User ID: {$user['id']}\n";
        echo "   Name: {$user['nombre']}\n";
        echo "   Username: {$user['username']}\n";
        echo "   Role ID: {$user['rol_id']}\n";
        echo "   Active: {$user['active']}\n";
        echo "   ---\n";
    }
    
    // 2. Activate the admin user (ID 1)
    echo "\n2. 🔧 Activating admin user (ID 1)...\n";
    
    $stmt = $pdo->prepare("UPDATE usuarios SET active = 'true' WHERE id = 1");
    $result = $stmt->execute();
    
    if ($result) {
        echo "✅ Admin user activated successfully\n";
    } else {
        echo "❌ Failed to activate admin user\n";
    }
    
    // 3. Check roles table
    echo "\n3. 🔍 Checking roles table...\n";
    
    $stmt = $pdo->prepare("SELECT * FROM roles ORDER BY id");
    $stmt->execute();
    $roles = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($roles as $role) {
        echo "   Role ID: {$role['id']} - Name: {$role['nombre']}\n";
    }
    
    // 4. Verify admin user after update
    echo "\n4. ✅ Verifying admin user after update...\n";
    
    $stmt = $pdo->prepare("SELECT id, nombre, username, rol_id, active FROM usuarios WHERE id = 1");
    $stmt->execute();
    $adminUser = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($adminUser) {
        echo "   User ID: {$adminUser['id']}\n";
        echo "   Name: {$adminUser['nombre']}\n";
        echo "   Username: {$adminUser['username']}\n";
        echo "   Role ID: {$adminUser['rol_id']}\n";
        echo "   Active: {$adminUser['active']}\n";
        
        if ($adminUser['rol_id'] == 1 && $adminUser['active'] === 'true') {
            echo "✅ Admin user is now properly configured!\n";
        } else {
            echo "⚠️ Admin user still has issues\n";
        }
    }
    
    // 5. Test activation on another user
    echo "\n5. 🧪 Testing activation on user ID 6...\n";
    
    // Get current status
    $stmt = $pdo->prepare("SELECT id, nombre, username, active FROM usuarios WHERE id = 6");
    $stmt->execute();
    $testUser = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($testUser) {
        echo "   Before: User {$testUser['id']} ({$testUser['nombre']}) - Active: {$testUser['active']}\n";
        
        // Toggle activation
        $newStatus = $testUser['active'] === 'true' ? 'false' : 'true';
        $stmt = $pdo->prepare("UPDATE usuarios SET active = ? WHERE id = 6");
        $result = $stmt->execute([$newStatus]);
        
        if ($result) {
            echo "   ✅ User activation toggled successfully\n";
            
            // Check new status
            $stmt = $pdo->prepare("SELECT active FROM usuarios WHERE id = 6");
            $stmt->execute();
            $updatedUser = $stmt->fetch(PDO::FETCH_ASSOC);
            
            echo "   After: User 6 - Active: {$updatedUser['active']}\n";
            
            $action = $newStatus === 'true' ? 'activated' : 'deactivated';
            echo "   📝 User was $action\n";
        } else {
            echo "   ❌ Failed to toggle user activation\n";
        }
    } else {
        echo "   ❌ User ID 6 not found\n";
    }
    
} catch (PDOException $e) {
    echo "❌ Database error: " . $e->getMessage() . "\n";
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}

echo "\n" . str_repeat("=", 50) . "\n";
echo "Admin user status fix completed\n";
echo str_repeat("=", 50) . "\n";
?>
