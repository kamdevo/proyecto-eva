<?php
// Test script to check industrial equipment data structure
require_once 'vendor/autoload.php';

use Illuminate\Http\Request;

// Simple test to fetch one industrial equipment item and see its structure
$url = 'http://127.0.0.1:8001/api/v1/equipos/industrial-devices-complete?limit=1';

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Accept: application/json',
    'Content-Type: application/json'
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP Code: $httpCode\n";
echo "Raw Response:\n";
echo $response . "\n\n";

if ($response) {
    $data = json_decode($response, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        echo "JSON decode error: " . json_last_error_msg() . "\n";
        exit;
    }
    
    echo "Decoded data structure:\n";
    print_r($data);
    
    if ($data && isset($data['data'])) {
        if (is_array($data['data']) && count($data['data']) > 0) {
            $firstEquipment = $data['data'][0];
            echo "\n\nStructure of first industrial equipment:\n";
            print_r($firstEquipment);
            
            echo "\n\nAvailable keys at root level:\n";
            print_r(array_keys($firstEquipment));
            
            // Check if 'equipo' nested object exists
            if (isset($firstEquipment['equipo'])) {
                echo "\n\nStructure of 'equipo' nested object:\n";
                print_r($firstEquipment['equipo']);
            }
        } else {
            echo "\n\nNo equipment data found - data array is empty\n";
            echo "Data count: " . (is_array($data['data']) ? count($data['data']) : 'not an array') . "\n";
        }
    } else {
        echo "\n\nNo 'data' key found in response\n";
    }
} else {
    echo "Failed to get response\n";
}
?>
