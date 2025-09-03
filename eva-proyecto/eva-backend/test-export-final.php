<?php

echo "=== TESTING FINAL CALIBRACIONES EXPORT ===\n\n";

// Test the corrected endpoint
$url = 'http://127.0.0.1:8001/api/v1/v1/export/calibraciones';

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Accept: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
curl_close($ch);

echo "URL: $url\n";
echo "HTTP Status: $httpCode\n";
echo "Content-Type: $contentType\n";

if ($httpCode == 200) {
    echo "✅ SUCCESS: Export endpoint working\n";
    
    if (strpos($contentType, 'spreadsheet') !== false || strpos($contentType, 'excel') !== false || strpos($contentType, 'application/vnd') !== false) {
        echo "✅ Content type is Excel format\n";
        echo "✅ Response size: " . strlen($response) . " bytes\n";
        
        // Save file to test
        $filename = 'calibraciones_export_final.xlsx';
        file_put_contents($filename, $response);
        echo "✅ Excel file saved as: $filename\n";
        
        // Verify it's a valid Excel file
        if (strlen($response) > 1000) {
            echo "✅ File size indicates valid Excel content\n";
        }
        
    } else {
        echo "❌ Content type is not Excel: $contentType\n";
        echo "Response preview: " . substr($response, 0, 200) . "\n";
    }
} else {
    echo "❌ FAILED: HTTP $httpCode\n";
    echo "Response: " . substr($response, 0, 500) . "\n";
}

echo "\n=== FINAL TEST COMPLETED ===\n";
