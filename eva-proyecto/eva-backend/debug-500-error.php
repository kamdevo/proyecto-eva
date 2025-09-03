<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== DEBUGGING 500 ERROR ===\n\n";

// Test 1: Create user and token
echo "1. Creating auth token...\n";
$user = App\Models\Usuario::first();
if (!$user) {
    echo "❌ No users found\n";
    exit(1);
}

$token = $user->createToken('debug-token')->plainTextToken;
echo "✅ Token created\n\n";

// Test 2: Test controller directly
echo "2. Testing CalibracionController directly...\n";
try {
    $controller = new App\Http\Controllers\Api\CalibracionController();
    
    // Create mock request
    $request = new Illuminate\Http\Request();
    $request->merge([
        'page' => 1,
        'per_page' => 10,
        'search' => ''
    ]);
    
    // Set authenticated user
    auth()->login($user);
    
    echo "Calling controller index method...\n";
    $response = $controller->index($request);
    
    if ($response instanceof Illuminate\Http\JsonResponse) {
        $data = $response->getData(true);
        echo "✅ Controller works: " . $response->getStatusCode() . "\n";
        echo "Response keys: " . implode(', ', array_keys($data)) . "\n";
    } else {
        echo "✅ Controller returned: " . get_class($response) . "\n";
    }
    
} catch (Exception $e) {
    echo "❌ Controller error: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . ":" . $e->getLine() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}

echo "\n3. Testing database connection...\n";
try {
    $count = App\Models\Calibracion::count();
    echo "✅ Database accessible, calibraciones count: {$count}\n";
    
    if ($count > 0) {
        $sample = App\Models\Calibracion::with(['equipo', 'tecnico'])->first();
        echo "✅ Sample record loaded with relationships\n";
        echo "Sample ID: " . $sample->id . "\n";
        echo "Equipo: " . ($sample->equipo ? $sample->equipo->name : 'null') . "\n";
        echo "Tecnico: " . ($sample->tecnico ? $sample->tecnico->nombre : 'null') . "\n";
    }
} catch (Exception $e) {
    echo "❌ Database error: " . $e->getMessage() . "\n";
}

echo "\n4. Testing HTTP endpoint with auth...\n";
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'http://127.0.0.1:8001/api/v1/calibracion?page=1&per_page=10');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Accept: application/json',
    'Authorization: Bearer ' . $token,
    'Content-Type: application/json'
]);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

if ($error) {
    echo "❌ cURL Error: {$error}\n";
} else {
    echo "HTTP Status: {$httpCode}\n";
    if ($httpCode == 500) {
        echo "❌ 500 Error response:\n";
        echo substr($response, 0, 500) . "...\n";
    } elseif ($httpCode == 200) {
        echo "✅ Success response\n";
        $data = json_decode($response, true);
        if ($data) {
            echo "Response structure: " . implode(', ', array_keys($data)) . "\n";
        }
    } else {
        echo "⚠️ Unexpected status: {$httpCode}\n";
        echo "Response: " . substr($response, 0, 200) . "...\n";
    }
}

echo "\n=== DEBUG COMPLETED ===\n";
