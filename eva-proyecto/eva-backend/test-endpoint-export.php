<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make('Illuminate\Contracts\Http\Kernel');

// Simular una petición HTTP GET
$request = Illuminate\Http\Request::create(
    '/api/v1/equipos/export',
    'GET',
    [] // Sin filtros, debería exportar todo
);

echo "\n";
echo "========================================\n";
echo "PRUEBA DE ENDPOINT DE EXPORTACIÓN\n";
echo "========================================\n\n";

try {
    $response = $kernel->handle($request);
    
    echo "Status Code: " . $response->getStatusCode() . "\n";
    echo "Content Type: " . $response->headers->get('Content-Type') . "\n\n";
    
    if ($response->getStatusCode() === 200) {
        echo "✅ Exportación exitosa\n";
        echo "Archivo generado correctamente\n";
    } else {
        echo "❌ Error en la exportación\n";
        echo "Response:\n";
        echo $response->getContent() . "\n";
    }
    
} catch (\Exception $e) {
    echo "\n❌ EXCEPCIÓN:\n";
    echo "Mensaje: " . $e->getMessage() . "\n";
    echo "Archivo: " . $e->getFile() . ":" . $e->getLine() . "\n";
    echo "\nStack trace:\n";
    echo $e->getTraceAsString() . "\n";
}

echo "\n========================================\n";
