<?php

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== TESTING CALIBRACION ENDPOINT ===\n";

// Test 1: Check if user exists
echo "\n1. Checking for users...\n";
$user = App\Models\Usuario::first();
if (!$user) {
    echo "❌ No users found in database\n";
    exit(1);
}
echo "✅ User found: {$user->nombre} {$user->apellido}\n";

// Test 2: Create auth token
echo "\n2. Creating auth token...\n";
try {
    $token = $user->createToken('test-calibracion')->plainTextToken;
    echo "✅ Token created: {$token}\n";
} catch (Exception $e) {
    echo "❌ Error creating token: " . $e->getMessage() . "\n";
    exit(1);
}

// Test 3: Test endpoint without auth
echo "\n3. Testing endpoint without authentication...\n";
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
    echo "✅ Correctly returns 401 (Unauthorized) without token\n";
} else {
    echo "❌ Expected 401, got {$httpCode}\n";
    echo "Response: {$response}\n";
}

// Test 4: Test endpoint with auth
echo "\n4. Testing endpoint with authentication...\n";
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
    if ($data) {
        echo "Response structure:\n";
        echo "- Success: " . ($data['success'] ?? 'N/A') . "\n";
        echo "- Message: " . ($data['message'] ?? 'N/A') . "\n";
        echo "- Data type: " . gettype($data['data'] ?? null) . "\n";
        if (isset($data['data']['data'])) {
            echo "- Records count: " . count($data['data']['data']) . "\n";
        }
    }
} else {
    echo "❌ Expected 200, got {$httpCode}\n";
    echo "Response: {$response}\n";
}

// Test 5: Check calibraciones table
echo "\n5. Checking calibraciones table...\n";
try {
    $count = App\Models\Calibracion::count();
    echo "✅ Calibraciones table accessible, records: {$count}\n";
    
    if ($count > 0) {
        $sample = App\Models\Calibracion::first();
        echo "Sample record ID: {$sample->id}\n";
    }
} catch (Exception $e) {
    echo "❌ Error accessing calibraciones table: " . $e->getMessage() . "\n";
}

echo "\n=== TEST COMPLETED ===\n";
