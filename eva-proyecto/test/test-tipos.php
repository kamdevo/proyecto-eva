<?php

$url = 'http://127.0.0.1:8001/api/v1/tipocompra';

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 5);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "Testing TipoCompra endpoint:\n";
echo "URL: $url\n";
echo "HTTP Code: $httpCode\n";
echo "Response: $response\n";
