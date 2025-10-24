<?php

// VERIFICAR SI EXISTE EL PREVENTIVO Y USUARIOS
require_once __DIR__ . '/eva-backend/vendor/autoload.php';

// Cargar configuración de Laravel
$app = require_once __DIR__ . '/eva-backend/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

echo "=== DIAGNÓSTICO PREVENTIVO Y USUARIOS ===\n";

try {
    // 1. Verificar si existe preventivo_id = 1
    echo "\n1️⃣ Verificando preventivo_id = 1:\n";
    $preventivo = DB::table('mantenimiento')
        ->leftJoin('equipos', 'mantenimiento.equipo_id', '=', 'equipos.id')
        ->leftJoin('servicios', 'equipos.servicio_id', '=', 'servicios.id')
        ->select([
            'mantenimiento.*',
            'equipos.name as equipo_nombre',
            'equipos.servicio_id',
            'servicios.name as servicio_nombre'
        ])
        ->where('mantenimiento.id', 1)
        ->first();
    
    if ($preventivo) {
        echo "✅ Preventivo encontrado:\n";
        echo "   - ID: {$preventivo->id}\n";
        echo "   - Equipo: {$preventivo->equipo_nombre}\n";
        echo "   - Servicio ID: {$preventivo->servicio_id}\n";
        echo "   - Servicio: {$preventivo->servicio_nombre}\n";
        
        // 2. Verificar usuarios en ese servicio
        echo "\n2️⃣ Verificando usuarios del servicio {$preventivo->servicio_id}:\n";
        $usuarios = DB::table('usuarios')
            ->where('servicio_id', $preventivo->servicio_id)
            ->whereNotNull('email')
            ->where('email', '!=', '')
            ->get(['id', 'nombre', 'email', 'servicio_id']);
        
        echo "Usuarios encontrados: " . $usuarios->count() . "\n";
        foreach ($usuarios as $usuario) {
            echo "   - {$usuario->nombre} ({$usuario->email})\n";
        }
        
        if ($usuarios->count() === 0) {
            echo "\n⚠️ NO HAY USUARIOS en el servicio {$preventivo->servicio_id}\n";
            
            // 3. Verificar admins como fallback
            echo "\n3️⃣ Verificando administradores (fallback):\n";
            $admins = DB::table('usuarios')
                ->where('rol_id', 1)
                ->whereNotNull('email')
                ->where('email', '!=', '')
                ->get(['id', 'nombre', 'email', 'rol_id']);
            
            echo "Admins encontrados: " . $admins->count() . "\n";
            foreach ($admins as $admin) {
                echo "   - {$admin->nombre} ({$admin->email})\n";
            }
        }
        
    } else {
        echo "❌ NO EXISTE preventivo_id = 1\n";
        
        // Buscar otros preventivos disponibles
        echo "\n3️⃣ Buscando otros preventivos disponibles:\n";
        $preventivos = DB::table('mantenimiento')
            ->leftJoin('equipos', 'mantenimiento.equipo_id', '=', 'equipos.id')
            ->select(['mantenimiento.id', 'equipos.name as equipo_nombre'])
            ->limit(5)
            ->get();
        
        echo "Preventivos disponibles:\n";
        foreach ($preventivos as $p) {
            echo "   - ID: {$p->id}, Equipo: {$p->equipo_nombre}\n";
        }
    }
    
    // 4. Verificar tabla usuarios en general
    echo "\n4️⃣ Verificando usuarios con email:\n";
    $totalUsuarios = DB::table('usuarios')
        ->whereNotNull('email')
        ->where('email', '!=', '')
        ->count();
    
    echo "Total usuarios con email: {$totalUsuarios}\n";
    
    // Mostrar algunos usuarios
    $algunosUsuarios = DB::table('usuarios')
        ->whereNotNull('email')
        ->where('email', '!=', '')
        ->limit(3)
        ->get(['id', 'nombre', 'email', 'servicio_id', 'rol_id']);
    
    echo "Ejemplos de usuarios:\n";
    foreach ($algunosUsuarios as $u) {
        echo "   - {$u->nombre} ({$u->email}) - Servicio: {$u->servicio_id}, Rol: {$u->rol_id}\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}

echo "\n=== FIN DIAGNÓSTICO ===\n";
?>
