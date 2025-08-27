<?php

// Simple test
$url = 'http://127.0.0.1:8001/api/v1/ordencompra?per_page=5';

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 5);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

echo "URL: $url\n";
echo "HTTP Code: $httpCode\n";

if ($error) {
    echo "Error: $error\n";
} else {
    echo "Response: $response\n";
}
