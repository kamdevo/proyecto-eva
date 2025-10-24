<?php

require_once 'eva-backend/vendor/autoload.php';
$app = require_once 'eva-backend/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

echo "🔍 BUSCANDO USUARIO INNOVACIONDESA\n";
echo "=================================\n\n";

// Buscar por username
$user = DB::table('usuarios')->where('username', 'like', '%innovacion%')->first();

if ($user) {
    echo "✅ USUARIO ENCONTRADO POR USERNAME:\n";
    echo "   - ID: {$user->id}\n";
    echo "   - Nombre: {$user->nombre}\n";
    echo "   - Email: {$user->email}\n";
    echo "   - Username: {$user->username}\n";
    echo "\n📧 Los correos se enviarán a: {$user->email}\n";
} else {
    echo "❌ No se encontró usuario con 'innovacion' en username\n";
    
    // Buscar por nombre
    $userByName = DB::table('usuarios')->where('nombre', 'like', '%innovacion%')->first();
    
    if ($userByName) {
        echo "✅ USUARIO ENCONTRADO POR NOMBRE:\n";
        echo "   - ID: {$userByName->id}\n";
        echo "   - Nombre: {$userByName->nombre}\n";
        echo "   - Email: {$userByName->email}\n";
        echo "   - Username: {$userByName->username}\n";
    } else {
        echo "❌ Tampoco se encontró por nombre\n";
        echo "📋 Mostrando usuarios que podrían ser el buscado:\n\n";
        
        // Mostrar usuarios con nombres similares
        $similares = DB::table('usuarios')->where('nombre', 'like', '%inno%')
            ->orWhere('username', 'like', '%inno%')
            ->orWhere('nombre', 'like', '%desa%')
            ->orWhere('username', 'like', '%desa%')
            ->get();
        
        if ($similares->count() > 0) {
            foreach ($similares as $similar) {
                echo "   - ID: {$similar->id} | {$similar->nombre} | {$similar->username} | {$similar->email}\n";
            }
        } else {
            echo "   No se encontraron usuarios similares\n";
        }
    }
}

echo "\n✅ Búsqueda completada\n";
?>
