<?php
/**
 * Script para probar si Laravel puede iniciarse correctamente
 */

echo "🚀 PROBANDO INICIO DE SERVIDOR LARAVEL\n";
echo str_repeat("=", 50) . "\n\n";

// 1. Verificar archivos necesarios
echo "1️⃣ VERIFICANDO ARCHIVOS NECESARIOS:\n";

$requiredFiles = [
    'artisan' => 'Archivo artisan',
    'vendor/autoload.php' => 'Autoloader de Composer',
    'bootstrap/app.php' => 'Bootstrap de Laravel',
    '.env' => 'Archivo de configuración'
];

foreach ($requiredFiles as $file => $description) {
    if (file_exists($file)) {
        echo "✅ $description: $file\n";
    } else {
        echo "❌ $description: $file (NO ENCONTRADO)\n";
    }
}

echo "\n" . str_repeat("-", 30) . "\n\n";

// 2. Verificar configuración de Laravel
echo "2️⃣ VERIFICANDO CONFIGURACIÓN:\n";

try {
    // Cargar Laravel sin iniciar servidor
    require_once 'vendor/autoload.php';
    $app = require_once 'bootstrap/app.php';
    
    echo "✅ Laravel cargado correctamente\n";
    
    // Verificar configuración de base de datos
    $app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();
    
    $dbConfig = config('database.connections.mysql');
    echo "✅ Configuración de BD cargada:\n";
    echo "   Host: " . $dbConfig['host'] . "\n";
    echo "   Database: " . $dbConfig['database'] . "\n";
    echo "   Username: " . $dbConfig['username'] . "\n";
    
    // Probar conexión
    $db = \Illuminate\Support\Facades\DB::connection();
    $db->getPdo();
    echo "✅ Conexión a BD exitosa\n";
    
} catch (Exception $e) {
    echo "❌ Error cargando Laravel: " . $e->getMessage() . "\n";
    echo "📍 Línea: " . $e->getLine() . "\n";
    
    // Si hay error, mostrar más detalles
    if (strpos($e->getMessage(), 'database') !== false) {
        echo "\n💡 Problema de base de datos detectado\n";
        echo "Verifica que MySQL esté ejecutándose\n";
    }
    
    if (strpos($e->getMessage(), 'vendor') !== false) {
        echo "\n💡 Problema de dependencias detectado\n";
        echo "Ejecuta: composer install\n";
    }
}

echo "\n" . str_repeat("-", 30) . "\n\n";

// 3. Probar comando artisan
echo "3️⃣ PROBANDO COMANDO ARTISAN:\n";

$output = [];
$returnVar = 0;

exec('php artisan --version 2>&1', $output, $returnVar);

if ($returnVar === 0) {
    echo "✅ Artisan funcionando: " . implode(' ', $output) . "\n";
} else {
    echo "❌ Error con artisan:\n";
    echo implode("\n", $output) . "\n";
}

echo "\n" . str_repeat("-", 30) . "\n\n";

// 4. Verificar puerto 8000
echo "4️⃣ VERIFICANDO PUERTO 8000:\n";

$socket = @fsockopen('127.0.0.1', 8000, $errno, $errstr, 5);
if ($socket) {
    echo "⚠️ Puerto 8000 ya está en uso\n";
    fclose($socket);
    
    // Intentar matar procesos en puerto 8000
    echo "🔄 Intentando liberar puerto 8000...\n";
    exec('netstat -ano | findstr :8000', $output);
    if (!empty($output)) {
        echo "Procesos en puerto 8000:\n";
        foreach ($output as $line) {
            echo "   $line\n";
        }
    }
} else {
    echo "✅ Puerto 8000 disponible\n";
}

echo "\n" . str_repeat("=", 50) . "\n";
echo "🎯 RECOMENDACIONES:\n\n";

echo "1. Iniciar servidor Laravel:\n";
echo "   php artisan serve --host=127.0.0.1 --port=8000\n\n";

echo "2. Si el puerto está ocupado, usar otro puerto:\n";
echo "   php artisan serve --port=8001\n\n";

echo "3. Verificar logs de Laravel:\n";
echo "   tail -f storage/logs/laravel.log\n\n";

echo "4. Limpiar cache si hay problemas:\n";
echo "   php artisan config:clear\n";
echo "   php artisan cache:clear\n";

?>
