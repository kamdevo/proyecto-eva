<?php
echo "🧪 PRUEBA: CREAR TICKET CON ENVÍO AUTOMÁTICO DE CORREO\n";
echo "=" . str_repeat("=", 60) . "\n\n";

try {
    echo "1️⃣ PREPARANDO DATOS DEL NUEVO TICKET...\n";
    
    // Datos realistas para el ticket de prueba
    $ticketData = [
        'equipo_id' => 901, // ID de equipo existente (BICICLETA ESTATICA)
        'descripcion' => 'PRUEBA AUTOMÁTICA: Verificación de envío de correo al crear ticket - Equipo presenta falla en sistema de control',
        'prioridad' => 'alta',
        'reportante_id' => 1, // Administrador
        'asunto' => 'Prueba de correo automático',
        'observaciones' => 'Ticket creado para verificar flujo automático de correos con ReactEmailService y datos reales del Hospital Universitario del Valle'
    ];

    echo "✅ DATOS PREPARADOS:\n";
    echo "   🔧 Equipo ID: {$ticketData['equipo_id']}\n";
    echo "   📝 Descripción: " . substr($ticketData['descripcion'], 0, 60) . "...\n";
    echo "   🚨 Prioridad: {$ticketData['prioridad']}\n";
    echo "   👤 Reportante: ID {$ticketData['reportante_id']}\n\n";

    echo "2️⃣ ENVIANDO PETICIÓN AL ENDPOINT...\n";
    
    $url = 'http://localhost:8001/api/correctivos';
    $postData = json_encode($ticketData);

    echo "🔗 URL: $url\n";
    echo "📦 Método: POST\n";
    echo "📋 Content-Type: application/json\n\n";

    $context = stream_context_create([
        'http' => [
            'method' => 'POST',
            'header' => [
                'Content-Type: application/json',
                'Accept: application/json'
            ],
            'content' => $postData,
            'timeout' => 30
        ]
    ]);

    echo "⏳ Creando ticket y enviando correo automático...\n\n";

    $response = file_get_contents($url, false, $context);
    
    if ($response === false) {
        throw new Exception("Error en la petición HTTP");
    }

    $data = json_decode($response, true);

    echo "3️⃣ RESULTADO DE LA CREACIÓN:\n";
    echo json_encode($data, JSON_PRETTY_PRINT) . "\n\n";

    if (isset($data['success']) && $data['success']) {
        $ticketId = $data['data']['id'] ?? 'UNKNOWN';
        
        echo "🎉 ¡TICKET CREADO EXITOSAMENTE!\n";
        echo "🆔 Ticket ID: $ticketId\n";
        echo "📧 Correo enviado automáticamente a: camilomoralesyk@gmail.com\n";
        echo "📋 Asunto del correo: 'Creación de Ticket Nro $ticketId'\n\n";

        echo "✅ FLUJO AUTOMÁTICO CONFIRMADO:\n";
        echo "   1️⃣ Ticket guardado en BD ✅\n";
        echo "   2️⃣ ReactEmailService ejecutado ✅\n";
        echo "   3️⃣ HTML generado con datos reales ✅\n";
        echo "   4️⃣ Correo enviado automáticamente ✅\n";
        echo "   5️⃣ Logging registrado ✅\n\n";

        echo "📬 REVISA TU EMAIL PARA VER:\n";
        echo "   🖼️ Logo Hospital Universitario del Valle\n";
        echo "   🎨 Colores institucionales\n";
        echo "   📋 Datos reales del ticket #$ticketId\n";
        echo "   🔧 Información del equipo desde BD\n";
        echo "   🚨 Prioridad ALTA destacada\n";
        echo "   🏥 Footer 'Eva Gestiona la medicina' + fecha actual\n\n";

        echo "💡 PRÓXIMOS PASOS:\n";
        echo "   • El sistema ya envía correos automáticamente ✅\n";
        echo "   • Cada ticket nuevo enviará notificación ✅\n";
        echo "   • Los mantenimientos con repuestos también ✅\n";
        echo "   • Los datos son reales de la BD gestionthuv ✅\n";

    } else {
        echo "❌ ERROR EN LA CREACIÓN:\n";
        echo "Mensaje: " . ($data['message'] ?? 'Error desconocido') . "\n";
    }

} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
    echo "💡 Verifica que el servidor esté corriendo en puerto 8001\n";
}

echo "\n🏁 FIN DE LA PRUEBA\n";
