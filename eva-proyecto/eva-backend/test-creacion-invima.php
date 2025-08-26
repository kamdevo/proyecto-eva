<?php

echo "=== PRUEBA DE CREACIÓN DE REGISTRO INVIMA ===\n\n";

// Datos de prueba para crear un registro INVIMA
$url = 'http://127.0.0.1:8001/api/v1/registros-invima';

// Crear un archivo PDF temporal para la prueba
$archivoTest = 'test_invima_' . time() . '.pdf';
$contenidoPdf = "%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>\nendobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \ntrailer\n<< /Size 4 /Root 1 0 R >>\nstartxref\n185\n%%EOF";
file_put_contents($archivoTest, $contenidoPdf);

echo "1. DATOS DE PRUEBA:\n";
$datos = [
    'numero_registro' => 'INVIMA-TEST-' . time(),
    'titulo' => 'Registro INVIMA de Prueba',
    'marcas' => 'MARCA TEST',
    'descripcion_detallada' => 'Descripción detallada del equipo de prueba',
    'estado' => 'vigente'
];

foreach ($datos as $campo => $valor) {
    echo "- $campo: $valor\n";
}

echo "\n2. ENVIANDO PETICIÓN POST:\n";

// Preparar cURL con archivo
$curl = curl_init();

curl_setopt_array($curl, [
    CURLOPT_URL => $url,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => [
        'numero_registro' => $datos['numero_registro'],
        'titulo' => $datos['titulo'],
        'marcas' => $datos['marcas'],
        'descripcion_detallada' => $datos['descripcion_detallada'],
        'estado' => $datos['estado'],
        'archivo_pdf' => new CURLFile($archivoTest, 'application/pdf', $archivoTest)
    ],
    CURLOPT_HTTPHEADER => [
        'Accept: application/json',
    ],
    CURLOPT_TIMEOUT => 30
]);

$response = curl_exec($curl);
$httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
$error = curl_error($curl);

curl_close($curl);

echo "HTTP Code: $httpCode\n";

if ($error) {
    echo "❌ Error cURL: $error\n";
} else {
    echo "✅ Respuesta recibida\n";
    echo "Respuesta:\n";
    $responseData = json_decode($response, true);
    if ($responseData) {
        print_r($responseData);
        
        if ($responseData['success'] ?? false) {
            echo "\n3. VERIFICANDO ARCHIVO GUARDADO:\n";
            
            $archivoGuardado = $responseData['data']['file'] ?? '';
            if ($archivoGuardado) {
                echo "Archivo registrado en BD: $archivoGuardado\n";
                
                // Verificar si se guardó en la ubicación correcta
                $rutaCompleta = 'C:\Users\Soporte\Desktop\EVA\proyecto-eva\eva-proyecto\eva-backend\storage\app\public\\' . str_replace('/', '\\', $archivoGuardado);
                
                if (file_exists($rutaCompleta)) {
                    echo "✅ Archivo físico encontrado en: $rutaCompleta\n";
                    $tamano = filesize($rutaCompleta);
                    echo "   Tamaño: " . number_format($tamano) . " bytes\n";
                } else {
                    echo "❌ Archivo físico NO encontrado en: $rutaCompleta\n";
                }
                
                // Verificar si se guardó en /invimas/
                $rutaInvimas = 'C:\Users\Soporte\Desktop\EVA\proyecto-eva\eva-proyecto\eva-backend\storage\app\public\invimas\\' . basename($archivoGuardado);
                
                if (file_exists($rutaInvimas)) {
                    echo "✅ Archivo también está en /invimas/: $rutaInvimas\n";
                } else {
                    echo "❌ Archivo NO está en /invimas/\n";
                }
            }
        }
    } else {
        echo "Respuesta no JSON:\n";
        echo $response . "\n";
    }
}

// Limpiar archivo temporal
unlink($archivoTest);

echo "\n=== FIN DE LA PRUEBA ===\n";
