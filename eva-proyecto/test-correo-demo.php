<?php

echo "📧 Enviando correos de demostración con datos simulados...\n\n";

// URL base
$baseUrl = 'http://localhost:8001/api/v1/notifications';

// 1. Probar correo de preventivo
echo "🔧 Enviando correo de PREVENTIVO...\n";
$preventivo_data = [
    'email' => 'camilomoralesyk@gmail.com',
    'demo' => true,
    'preventivo' => [
        'id' => 123,
        'fecha_mantenimiento' => '2024-10-02 15:30:00',
        'observacion' => 'Equipo requiere calibración urgente. Se detectó desviación en las mediciones.',
        'servicio_nombre' => 'RADIOLOGÍA',
        'area_nombre' => 'Diagnóstico por Imágenes',
        'equipo_id' => 456,
        'equipo_nombre' => 'Rayos X Portátil',
        'equipo_marca' => 'Siemens',
        'equipo_modelo' => 'MobileDiagnost wDR',
        'equipo_codigo' => 'RX-001-HUV',
        'equipo_serie' => 'SN123456789'
    ]
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $baseUrl . '/demo-repuesto-pendiente');
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($preventivo_data));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Accept: application/json'
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "📊 Código HTTP: $httpCode\n";
echo "📄 Respuesta: $response\n\n";

// 2. Probar correo de ticket
echo "🎫 Enviando correo de TICKET...\n";
$ticket_data = [
    'email' => 'camilomoralesyk@gmail.com',
    'demo' => true,
    'ticket' => [
        'id' => 789,
        'descripcion' => 'Falla en el sistema de refrigeración del equipo de resonancia magnética',
        'fecha_inicio' => '2024-10-02 14:15:00',
        'prioridad' => 3, // Alta
        'servicio_nombre' => 'RADIOLOGÍA',
        'area_nombre' => 'Resonancia Magnética',
        'equipo_id' => 789,
        'equipo_nombre' => 'Resonancia Magnética 1.5T',
        'equipo_marca' => 'General Electric',
        'equipo_modelo' => 'Signa HDxt',
        'equipo_codigo' => 'RM-002-HUV',
        'equipo_serie' => 'GE987654321',
        'reportante_nombre' => 'Dr. Juan Carlos Pérez'
    ]
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $baseUrl . '/demo-nuevo-ticket');
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($ticket_data));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Accept: application/json'
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "📊 Código HTTP: $httpCode\n";
echo "📄 Respuesta: $response\n\n";

echo "✅ Pruebas completadas\n";
echo "\n📝 NOTA: Estos endpoints de demo envían correos con datos simulados realistas\n";
echo "   para que puedas ver exactamente cómo quedan los correos con el diseño del Hospital.\n";

?>
