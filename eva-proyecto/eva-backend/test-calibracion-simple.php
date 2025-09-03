<?php

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== TESTING CALIBRACION ENDPOINT ===\n\n";

// Test 1: Check if user exists
echo "1. Checking for users...\n";
$user = App\Models\Usuario::first();
if (!$user) {
    echo "❌ No users found in database\n";
    exit(1);
}
echo "✅ User found: {$user->nombre} {$user->apellido}\n\n";

// Test 2: Create auth token
echo "2. Creating auth token...\n";
try {
    $token = $user->createToken('test-calibracion')->plainTextToken;
    echo "✅ Token created successfully\n\n";
} catch (Exception $e) {
    echo "❌ Error creating token: " . $e->getMessage() . "\n";
    exit(1);
}

// Test 3: Test endpoint without auth
echo "3. Testing endpoint without authentication...\n";
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'http://127.0.0.1:8001/api/v1/calibracion');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Accept: application/json']);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "Status Code: {$httpCode}\n";
if ($httpCode == 401) {
    echo "✅ Correctly returns 401 (Unauthorized) without token\n\n";
} else {
    echo "❌ Expected 401, got {$httpCode}\n";
    echo "Response: " . substr($response, 0, 200) . "...\n\n";
}

// Test 4: Test endpoint with auth
echo "4. Testing endpoint with authentication...\n";
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'http://127.0.0.1:8001/api/v1/calibracion');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Accept: application/json',
    'Authorization: Bearer ' . $token
]);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

echo "Status Code: {$httpCode}\n";
if ($error) {
    echo "❌ cURL Error: {$error}\n";
} else if ($httpCode == 200) {
    echo "✅ Successfully authenticated and got response\n";
    $data = json_decode($response, true);
    if ($data && is_array($data)) {
        echo "✅ Valid JSON response received\n";
        echo "Response keys: " . implode(', ', array_keys($data)) . "\n";
        if (isset($data['success'])) {
            echo "Success: " . ($data['success'] ? 'true' : 'false') . "\n";
        }
        if (isset($data['message'])) {
            echo "Message: " . $data['message'] . "\n";
        }
    } else {
        echo "❌ Invalid JSON response\n";
        echo "Raw response: " . substr($response, 0, 200) . "...\n";
    }
} else {
    echo "❌ Expected 200, got {$httpCode}\n";
    echo "Response: " . substr($response, 0, 200) . "...\n";
}

echo "\n";

// Test 5: Check calibraciones table
echo "5. Checking calibraciones table...\n";
try {
    $count = App\Models\Calibracion::count();
    echo "✅ Calibraciones table accessible, records: {$count}\n";
    
    if ($count > 0) {
        $sample = App\Models\Calibracion::first();
        echo "✅ Sample record found with ID: {$sample->id}\n";
    } else {
        echo "ℹ️ No calibracion records in database\n";
    }
} catch (Exception $e) {
    echo "❌ Error accessing calibraciones table: " . $e->getMessage() . "\n";
}

echo "\n=== TEST COMPLETED ===\n";
