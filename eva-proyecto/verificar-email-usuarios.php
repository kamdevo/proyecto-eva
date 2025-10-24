<?php

// Script para verificar correos de usuarios específicos

require_once 'eva-backend/vendor/autoload.php';

// Cargar configuración de Laravel
$app = require_once 'eva-backend/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

try {
    echo "📧 VERIFICANDO CORREOS DE USUARIOS\n";
    echo "================================\n\n";
    
    // Obtener algunos usuarios para verificar estructura
    echo "📋 PRIMEROS 10 USUARIOS EN LA BASE DE DATOS:\n";
    $usuarios = DB::table('usuarios')->limit(10)->get();
    
    foreach ($usuarios as $user) {
        echo "   - ID: {$user->id} | Nombre: {$user->nombre} | Email: " . 
             ($user->email ?? 'SIN EMAIL') . " | Username: " . ($user->username ?? 'N/A') . "\n";
    }
    
    echo "\n";
    
    // Obtener información del usuario ID 4 (probablemente innovaciondesa)
    $usuario4 = DB::table('usuarios')->where('id', 4)->first();
    
    if ($usuario4) {
        echo "👤 USUARIO ID 4:\n";
        echo "   - ID: {$usuario4->id}\n";
        echo "   - Nombre: {$usuario4->nombre}\n";
        echo "   - Apellido: " . ($usuario4->apellido ?? 'N/A') . "\n";
        echo "   - Email: " . ($usuario4->email ?? 'SIN EMAIL') . "\n";
        echo "   - Username: " . ($usuario4->username ?? 'N/A') . "\n";
        echo "   - Rol ID: " . ($usuario4->rol_id ?? 'N/A') . "\n";
        echo "\n";
        
        if (empty($usuario4->email)) {
            echo "❌ PROBLEMA: El usuario ID 4 NO tiene email configurado\n";
            echo "🔧 SOLUCIÓN: Agregar email a este usuario o usar fallback\n";
        } else {
            echo "✅ Usuario ID 4 tiene email: {$usuario4->email}\n";
            echo "📧 Los correos de tickets se enviarán a: {$usuario4->email}\n";
        }
    } else {
        echo "❌ No se encontró usuario con ID 4\n";
    }
    
    echo "\n" . str_repeat("-", 50) . "\n";
    
    // Verificar usuarios que han creado tickets (sin fecha para evitar errores)
    echo "📊 USUARIOS QUE HAN CREADO TICKETS:\n";
    
    $usuariosRecientes = DB::table('ordenes as o')
        ->join('usuarios as u', 'u.id', '=', 'o.reportante_id')
        ->select('u.id', 'u.nombre', 'u.email', 'u.username', DB::raw('COUNT(*) as tickets_creados'))
        ->groupBy('u.id', 'u.nombre', 'u.email', 'u.username')
        ->orderBy('tickets_creados', 'desc')
        ->limit(10)
        ->get();
    
    foreach ($usuariosRecientes as $usuario) {
        echo "   - ID: {$usuario->id} | {$usuario->nombre} | Email: " . 
             ($usuario->email ?: '❌ SIN EMAIL') . " | Tickets: {$usuario->tickets_creados}\n";
    }
    
    echo "\n" . str_repeat("-", 50) . "\n";
    
    // Verificar configuración actual de correos
    echo "⚙️ CONFIGURACIÓN ACTUAL:\n";
    echo "   - NOTIFICATION_EMAIL (fallback): " . (env('NOTIFICATION_EMAIL') ?: 'NO CONFIGURADO') . "\n";
    echo "   - MAIL_FROM_ADDRESS: " . (env('MAIL_FROM_ADDRESS') ?: 'NO CONFIGURADO') . "\n";
    
    echo "\n📋 RESUMEN DEL FLUJO DE CORREOS:\n";
    echo "1. Usuario crea ticket → Se obtiene su email de la tabla usuarios\n";
    echo "2. Si el usuario tiene email → Se envía a su correo personal\n";
    echo "3. Si el usuario NO tiene email → Se usa NOTIFICATION_EMAIL como fallback\n";
    echo "4. El correo incluye toda la información del ticket creado\n";
    
} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
}

echo "\n✅ Verificación completada\n";
?>
