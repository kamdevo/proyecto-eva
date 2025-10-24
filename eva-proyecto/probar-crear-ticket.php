<?php

echo "🧪 PROBANDO ENDPOINT DE CREAR TICKETS\n";
echo "====================================\n\n";

// Simular datos de un ticket de prueba
$ticketData = [
    'descripcion' => 'Falla en monitor de signos vitales - PRUEBA',
    'fecha_inicio' => date('Y-m-d H:i:s'),
    'subproceso_id' => 1, // Biomédico
    'nombre_equipo' => 'Monitor de Signos Vitales',
    'codigo_equipo' => 'MSV-001',
    'serie_equipo' => '12345ABC',
    'marca_equipo' => 'Phillips',
    'modelo_equipo' => 'IntelliVue MP70',
    'reportante_id' => 1, // Usuario de prueba
    'reportante_email' => 'usuario@hospital.com',
    'reportante_nombre' => 'Dr. Juan Pérez',
    'sede_id' => 1,
    'servicio_id' => 1,
    'area_id' => 1,
    'prioridad' => 2, // Media
    'observaciones' => 'Ticket creado desde script de prueba'
];

$url = 'http://192.168.2.146:8001/api/v1/crear-ticket';

echo "📡 Probando: $url\n\n";
echo "📋 Datos a enviar:\n";
foreach ($ticketData as $key => $value) {
    echo "   $key: $value\n";
}
echo "\n";

// Configurar contexto para la petición HTTP POST
$context = stream_context_create([
    'http' => [
        'timeout' => 30,
        'method' => 'POST',
        'header' => [
            'Content-Type: application/json',
            'Accept: application/json'
        ],
        'content' => json_encode($ticketData)
    ]
]);

try {
    $response = file_get_contents($url, false, $context);
    
    if ($response === false) {
        echo "❌ ERROR: No se pudo obtener respuesta del servidor\n";
        
        // Verificar headers de respuesta
        if (isset($http_response_header)) {
            echo "\n📋 Headers de respuesta:\n";
            foreach ($http_response_header as $header) {
                echo "   $header\n";
            }
        }
    } else {
        echo "✅ RESPUESTA OBTENIDA:\n";
        echo "Tamaño: " . strlen($response) . " bytes\n\n";
        
        // Intentar decodificar JSON
        $data = json_decode($response, true);
        
        if (json_last_error() === JSON_ERROR_NONE) {
            echo "📊 DATOS JSON VÁLIDOS:\n";
            echo "Success: " . ($data['success'] ? 'true' : 'false') . "\n";
            echo "Message: " . ($data['message'] ?? 'N/A') . "\n";
            
            if (isset($data['data'])) {
                if (isset($data['data']['ticket_id'])) {
                    echo "Ticket ID: " . $data['data']['ticket_id'] . "\n";
                }
                if (isset($data['data']['ticket'])) {
                    $ticket = $data['data']['ticket'];
                    echo "Información del ticket:\n";
                    echo "  - ID: " . $ticket->id . "\n";
                    echo "  - Descripción: " . $ticket->descripcion . "\n";
                    echo "  - Estado ID: " . $ticket->estado_id . "\n";
                    echo "  - Fecha: " . $ticket->fecha_inicio . "\n";
                    echo "  - Origen: " . ($ticket->origen ?? 'N/A') . "\n";
                }
            }
            
            echo "\n🎉 TICKET CREADO EXITOSAMENTE\n";
            
            // Ahora probar el endpoint de correo
            if ($data['success'] && isset($data['data']['ticket_id'])) {
                $ticketId = $data['data']['ticket_id'];
                echo "\n📧 PROBANDO ENVÍO DE CORREO...\n";
                
                $emailData = [
                    'ticket_id' => $ticketId,
                    'email' => $ticketData['reportante_email'],
                    'descripcion' => $ticketData['descripcion'],
                    'equipo_nombre' => $ticketData['nombre_equipo'],
                    'equipo_codigo' => $ticketData['codigo_equipo'],
                    'equipo_serie' => $ticketData['serie_equipo'],
                    'equipo_marca' => $ticketData['marca_equipo'],
                    'equipo_modelo' => $ticketData['modelo_equipo'],
                    'reportante_nombre' => $ticketData['reportante_nombre'],
                    'fecha_inicio' => $ticketData['fecha_inicio'],
                    'prioridad' => $ticketData['prioridad'],
                    'sede_nombre' => 'Principal',
                    'servicio_nombre' => 'UCI',
                    'area_nombre' => 'Cuidados Intensivos'
                ];
                
                $emailUrl = 'http://192.168.2.146:8001/api/v1/notifications/nuevo-ticket';
                
                $emailContext = stream_context_create([
                    'http' => [
                        'timeout' => 30,
                        'method' => 'POST',
                        'header' => [
                            'Content-Type: application/json',
                            'Accept: application/json'
                        ],
                        'content' => json_encode($emailData)
                    ]
                ]);
                
                $emailResponse = file_get_contents($emailUrl, false, $emailContext);
                
                if ($emailResponse !== false) {
                    $emailResult = json_decode($emailResponse, true);
                    if ($emailResult && $emailResult['success']) {
                        echo "✅ CORREO ENVIADO EXITOSAMENTE\n";
                        echo "Destinatario: " . $emailData['email'] . "\n";
                    } else {
                        echo "⚠️ Error enviando correo: " . ($emailResult['message'] ?? 'Error desconocido') . "\n";
                    }
                } else {
                    echo "❌ Error de conexión al enviar correo\n";
                }
            }
            
        } else {
            echo "❌ ERROR: Respuesta no es JSON válido\n";
            echo "JSON Error: " . json_last_error_msg() . "\n\n";
            echo "📄 CONTENIDO DE RESPUESTA:\n";
            echo substr($response, 0, 500) . "\n";
        }
    }

} catch (Exception $e) {
    echo "❌ EXCEPCIÓN: " . $e->getMessage() . "\n";
}

echo "\n" . str_repeat("=", 50) . "\n";
echo "🎯 RESUMEN:\n";
echo "1. ¿Se creó el ticket correctamente?\n";
echo "2. ¿Se envió el correo de notificación?\n";
echo "3. ¿La integración frontend-backend funciona?\n";
echo "\nRealizar prueba desde la interfaz web ahora.\n";
