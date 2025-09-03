<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== TESTING ROUTE REGISTRATION ===\n\n";

// Test route registration
$router = app('router');
$routes = $router->getRoutes();

echo "Looking for calibracion routes...\n";
$found = false;

foreach ($routes as $route) {
    $uri = $route->uri();
    if (strpos($uri, 'calibracion') !== false) {
        echo "Found: " . $route->methods()[0] . " " . $uri . "\n";
        $found = true;
    }
}

if (!$found) {
    echo "❌ No calibracion routes found!\n";
} else {
    echo "✅ Calibracion routes found\n";
}

echo "\n=== DIRECT TEST ===\n";

// Test direct endpoint
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'http://127.0.0.1:8001/api/v1/calibracion');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Accept: application/json']);
curl_setopt($ch, CURLOPT_TIMEOUT, 5);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

if ($error) {
    echo "❌ cURL Error: {$error}\n";
} else {
    echo "Status Code: {$httpCode}\n";
    if ($httpCode == 404) {
        echo "❌ Route not found (404)\n";
    } elseif ($httpCode == 401) {
        echo "✅ Route exists but requires auth (401)\n";
    } elseif ($httpCode == 200) {
        echo "✅ Route working (200)\n";
    } else {
        echo "⚠️ Unexpected status: {$httpCode}\n";
    }
}

echo "\n=== TEST COMPLETED ===\n";
