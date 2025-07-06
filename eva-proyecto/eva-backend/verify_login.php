<?php

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== VERIFICACIÓN DE CREDENCIALES ===\n";

$email = 'frontend@test.com';
$password = 'TempPass123!';

echo "Buscando usuario con email: {$email}\n";

try {
    // Find user with DB query
    $usuario = DB::table('usuarios')
        ->where('email', $email)
        ->orWhere('username', $email)
        ->first();
    
    if (!$usuario) {
        echo "❌ Usuario no encontrado\n";
        echo "Usuarios disponibles:\n";
        $users = DB::table('usuarios')->select('id', 'email', 'username')->get();
        foreach ($users as $user) {
            echo "  - ID: {$user->id}, Email: {$user->email}, Username: {$user->username}\n";
        }
        exit;
    }
    
    echo "✅ Usuario encontrado:\n";
    echo "  - ID: {$usuario->id}\n";
    echo "  - Nombre: {$usuario->nombre} {$usuario->apellido}\n";
    echo "  - Email: {$usuario->email}\n";
    echo "  - Username: {$usuario->username}\n";
    echo "  - Estado: {$usuario->estado}\n";
    echo "  - Hash de contraseña: " . substr($usuario->password, 0, 20) . "...\n";
    
    // Check password
    if (Hash::check($password, $usuario->password)) {
        echo "✅ Contraseña correcta\n";
        
        // Try to load the User model
        $userModel = \App\Models\Usuario::find($usuario->id);
        if ($userModel) {
            echo "✅ Modelo Usuario cargado correctamente\n";
            
            // Try to create a token
            try {
                $token = $userModel->createToken('test-token')->plainTextToken;
                echo "✅ Token creado exitosamente: " . substr($token, 0, 20) . "...\n";
            } catch (Exception $e) {
                echo "❌ Error creando token: " . $e->getMessage() . "\n";
            }
        } else {
            echo "❌ Error cargando el modelo Usuario\n";
        }
    } else {
        echo "❌ Contraseña incorrecta\n";
        echo "Password provided: {$password}\n";
        echo "Hash in DB: {$usuario->password}\n";
        
        // Test with bcrypt directly
        echo "Test bcrypt check: " . (password_verify($password, $usuario->password) ? 'true' : 'false') . "\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}
