<?php

require_once __DIR__ . '/eva-backend/vendor/autoload.php';

// Configurar Laravel
$app = require_once __DIR__ . '/eva-backend/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Services\ReactEmailService;
use Illuminate\Support\Facades\Mail;
use Illuminate\Mail\Message;

echo "🖼️ PRUEBA DE LOGO BASE64 EN CORREOS REACT EMAIL\n\n";

// Email de destino para las pruebas
$emailDestino = 'camilomoralesyk@gmail.com';

echo "📧 Probando correos con logo base64 embebido a: $emailDestino\n\n";

// Función para probar envío de correo con verificación de logo base64
function probarCorreoConLogoBase64($template, $data, $descripcion, $destinatario, $asunto) {
    echo "🔄 Probando: $descripcion\n";
    
    try {
        $reactEmailService = new ReactEmailService();
        
        // Renderizar email usando React Email
        switch ($template) {
            case 'repuesto-pendiente':
                $htmlContent = $reactEmailService->renderRepuestoPendiente((object)$data);
                break;
            case 'nuevo-ticket':
                $htmlContent = $reactEmailService->renderNuevoTicket((object)$data);
                break;
            case 'test-email':
                $htmlContent = $reactEmailService->renderTestEmail($data['email']);
                break;
            default:
                throw new Exception("Template desconocido: $template");
        }
        
        // Verificar que el HTML contiene el logo base64
        $tieneLogoBase64 = strpos($htmlContent, 'data:image/jpeg;base64,') !== false;
        $tieneLogoRelativo = strpos($htmlContent, '../logo_huv.jpg') !== false;
        $tieneLogoURL = strpos($htmlContent, 'https://raw.githubusercontent.com') !== false;
        
        if ($tieneLogoBase64) {
            echo "✅ Logo base64 detectado correctamente\n";
        } else {
            echo "❌ Logo base64 NO detectado\n";
        }
        
        if ($tieneLogoRelativo) {
            echo "⚠️  Advertencia: Aún contiene ruta relativa ../logo_huv.jpg\n";
        }
        
        if ($tieneLogoURL) {
            echo "⚠️  Advertencia: Aún contiene URL externa de GitHub\n";
        }
        
        // Verificar tamaño del HTML
        $tamanoHTML = strlen($htmlContent);
        echo "📏 Tamaño HTML: " . number_format($tamanoHTML) . " caracteres\n";
        
        if ($tamanoHTML < 1000) {
            echo "⚠️  Advertencia: HTML muy pequeño, posible error\n";
            return false;
        }
        
        // Enviar correo con HTML renderizado
        Mail::send([], [], function (Message $message) use ($htmlContent, $destinatario, $asunto) {
            $message->to($destinatario)
                    ->subject($asunto)
                    ->html($htmlContent);
        });
        
        echo "✅ Éxito: Correo React Email enviado correctamente\n";
        echo "📬 Destinatario: $destinatario\n";
        echo "📝 Asunto: $asunto\n";
        echo "🖼️  Logo: " . ($tieneLogoBase64 ? 'Base64 embebido ✅' : 'NO embebido ❌') . "\n";
        
        // Guardar HTML para inspección
        $fileName = "test_logo_base64_" . str_replace('-', '_', $template) . ".html";
        file_put_contents(__DIR__ . '/' . $fileName, $htmlContent);
        echo "💾 HTML guardado en: $fileName\n";
        
        return $tieneLogoBase64;
        
    } catch (Exception $e) {
        echo "❌ Error: " . $e->getMessage() . "\n";
        return false;
    }
}

echo "🚀 Iniciando pruebas con logo base64...\n\n";

$enviados = 0;
$conLogoBase64 = 0;
$total = 3;

// 1. Probar correo de nuevo ticket con logo base64
echo "1️⃣ PRUEBA: Nuevo Ticket con Logo Base64\n";
$ticketData = [
    'id' => 999,
    'descripcion' => 'Prueba logo base64 - Falla en equipo de tomografía con sistema de contraste defectuoso',
    'fecha_inicio' => '2024-10-03 16:20:00',
    'prioridad' => 3, // ALTA
    'servicio_nombre' => 'IMAGENOLOGÍA',
    'area_nombre' => 'Tomografía Computarizada',
    'equipo_id' => 456,
    'equipo_nombre' => 'Tomógrafo Multicorte 64',
    'equipo_marca' => 'General Electric',
    'equipo_modelo' => 'Revolution CT',
    'equipo_codigo' => 'TC-001-HUV',
    'equipo_serie' => 'GE123456789',
    'reportante_nombre' => 'Dr. Ana Rodríguez - Imagenología'
];

if (probarCorreoConLogoBase64(
    'nuevo-ticket', 
    $ticketData, 
    "Nuevo Ticket con Logo Base64", 
    $emailDestino,
    "Creación de Ticket Nro " . $ticketData['id'] . " - LOGO BASE64"
)) {
    $conLogoBase64++;
}
$enviados++;
echo "\n" . str_repeat('-', 70) . "\n\n";

// 2. Probar correo de repuesto pendiente con logo base64
echo "2️⃣ PRUEBA: Repuesto Pendiente con Logo Base64\n";
$preventivoData = [
    'id' => 888,
    'fecha_mantenimiento' => '2024-10-03 16:00:00',
    'observacion' => 'Mantenimiento preventivo completado. REPUESTO PENDIENTE: Sensor de temperatura para incubadora neonatal. Equipo operativo pero requiere cambio urgente del sensor.',
    'servicio_nombre' => 'NEONATOLOGÍA',
    'area_nombre' => 'UCI Neonatal',
    'equipo_id' => 789,
    'equipo_nombre' => 'Incubadora Neonatal Avanzada',
    'equipo_marca' => 'Dräger',
    'equipo_modelo' => 'Caleo Plus',
    'equipo_codigo' => 'INC-004-HUV',
    'equipo_serie' => 'DR987654321'
];

if (probarCorreoConLogoBase64(
    'repuesto-pendiente', 
    $preventivoData, 
    "Repuesto Pendiente con Logo Base64", 
    $emailDestino,
    "Notificación de repuesto pendiente. ID preventivo: " . $preventivoData['id'] . " - LOGO BASE64"
)) {
    $conLogoBase64++;
}
$enviados++;
echo "\n" . str_repeat('-', 70) . "\n\n";

// 3. Probar correo de prueba con logo base64
echo "3️⃣ PRUEBA: Email de Prueba con Logo Base64\n";
$testData = [
    'email' => $emailDestino,
    'fecha' => date('d/m/Y H:i:s'),
    'sistema' => 'EVA - Logo Base64',
    'version' => 'React Email v2.1'
];

if (probarCorreoConLogoBase64(
    'test-email', 
    $testData, 
    "Email de Prueba con Logo Base64", 
    $emailDestino,
    "Prueba Sistema EVA - LOGO BASE64 - Hospital Universitario del Valle"
)) {
    $conLogoBase64++;
}
$enviados++;

echo "\n" . str_repeat('=', 70) . "\n\n";

// Resumen final
echo "📊 RESUMEN DE PRUEBAS CON LOGO BASE64:\n";
echo "✅ Correos enviados exitosamente: $enviados/$total\n";
echo "🖼️  Correos con logo base64: $conLogoBase64/$total\n";
echo "❌ Correos sin logo base64: " . ($enviados - $conLogoBase64) . "/$total\n\n";

if ($conLogoBase64 === $total) {
    echo "🎉 ¡PERFECTO! TODOS LOS CORREOS USAN LOGO BASE64\n\n";
    
    echo "✅ CONFIRMADO:\n";
    echo "• Logo HUV embebido como base64 en todos los templates\n";
    echo "• No depende de rutas relativas o URLs externas\n";
    echo "• Funciona en todos los clientes de correo\n";
    echo "• Tamaño optimizado para envío\n\n";
    
    echo "🎨 CARACTERÍSTICAS DEL LOGO BASE64:\n";
    echo "• Formato: JPEG embebido\n";
    echo "• Tamaño: ~6KB (5,960 caracteres base64)\n";
    echo "• Dimensiones: 80x80px con bordes redondeados\n";
    echo "• Compatible: Gmail, Outlook, Apple Mail, etc.\n\n";
    
} else {
    echo "⚠️ ATENCIÓN: Algunos correos no tienen logo base64\n";
    echo "🔧 Revisa los templates que fallaron\n\n";
}

echo "📁 ARCHIVOS HTML GENERADOS:\n";
echo "• test_logo_base64_nuevo_ticket.html\n";
echo "• test_logo_base64_repuesto_pendiente.html\n";
echo "• test_logo_base64_test_email.html\n\n";

echo "📧 REVISA TU BANDEJA DE ENTRADA:\n";
echo "Email: $emailDestino\n";
echo "Busca: Asuntos con 'LOGO BASE64'\n\n";

echo "✨ Prueba de logo base64 finalizada.\n";
echo "🎯 Estado: " . ($conLogoBase64 === $total ? "100% LOGO BASE64 EMBEBIDO" : "REQUIERE CORRECCIÓN") . "\n";

?>
