<?php

require_once __DIR__ . '/eva-backend/vendor/autoload.php';

// Configurar Laravel
$app = require_once __DIR__ . '/eva-backend/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Services\ReactEmailService;
use Illuminate\Support\Facades\Mail;
use Illuminate\Mail\Message;

echo "📧 Script para enviar correos con React Email - Sistema EVA\n\n";

// Email de destino para las pruebas
$emailDestino = 'camilomoralesyk@gmail.com';

echo "📮 Enviando correos React Email a: $emailDestino\n\n";

// Datos de prueba para preventivo
$preventivo = [
    'id' => 123,
    'fecha_mantenimiento' => '2024-10-03 15:30:00',
    'observacion' => 'Equipo requiere calibración urgente. Se detectó desviación en las mediciones que supera los parámetros establecidos por el fabricante.',
    'servicio_nombre' => 'RADIOLOGÍA',
    'area_nombre' => 'Diagnóstico por Imágenes',
    'equipo_id' => 456,
    'equipo_nombre' => 'Rayos X Portátil',
    'equipo_marca' => 'Siemens',
    'equipo_modelo' => 'MobileDiagnost wDR',
    'equipo_codigo' => 'RX-001-HUV',
    'equipo_serie' => 'SN123456789'
];

// Datos de prueba para ticket
$ticket = [
    'id' => 789,
    'descripcion' => 'Falla en el sistema de refrigeración del equipo de resonancia magnética. El equipo presenta sobrecalentamiento y ruidos anómalos durante el funcionamiento.',
    'fecha_inicio' => '2024-10-03 14:15:00',
    'prioridad' => 3,
    'servicio_nombre' => 'RADIOLOGÍA',
    'area_nombre' => 'Resonancia Magnética',
    'equipo_id' => 789,
    'equipo_nombre' => 'Resonancia Magnética 1.5T',
    'equipo_marca' => 'General Electric',
    'equipo_modelo' => 'Signa HDxt',
    'equipo_codigo' => 'RM-002-HUV',
    'equipo_serie' => 'GE987654321',
    'reportante_nombre' => 'Dr. Juan Carlos Pérez'
];

// Datos de prueba para test email
$testData = [
    'email' => $emailDestino,
    'fecha' => date('d/m/Y H:i:s')
];

// Función para enviar correo usando React Email
function enviarCorreoReactEmail($template, $data, $descripcion, $destinatario, $asunto) {
    echo "🔄 Enviando: $descripcion\n";
    
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
        
        // Enviar correo con HTML renderizado
        Mail::send([], [], function (Message $message) use ($htmlContent, $destinatario, $asunto) {
            $message->to($destinatario)
                    ->subject($asunto)
                    ->html($htmlContent);
        });
        
        echo "✅ Éxito: Correo React Email enviado correctamente\n";
        echo "📬 Destinatario: $destinatario\n";
        echo "📝 Asunto: $asunto\n";
        echo "🎨 Tecnología: React Email + JSX\n";
        return true;
        
    } catch (Exception $e) {
        echo "❌ Error: " . $e->getMessage() . "\n";
        return false;
    }
}

echo "🚀 Iniciando envío de correos React Email...\n\n";

$enviados = 0;
$total = 3;

// 1. Enviar correo de repuesto pendiente
echo "1️⃣ ";
if (enviarCorreoReactEmail(
    'repuesto-pendiente', 
    $preventivo, 
    "Email de Repuesto Pendiente (React Email)", 
    $emailDestino,
    "Notificación de repuesto pendiente. ID preventivo: " . $preventivo['id']
)) {
    $enviados++;
}
echo "\n" . str_repeat('-', 60) . "\n\n";

// 2. Enviar correo de nuevo ticket
echo "2️⃣ ";
if (enviarCorreoReactEmail(
    'nuevo-ticket', 
    $ticket, 
    "Email de Nuevo Ticket (React Email)", 
    $emailDestino,
    "Creación de Ticket Nro " . $ticket['id']
)) {
    $enviados++;
}
echo "\n" . str_repeat('-', 60) . "\n\n";

// 3. Enviar correo de prueba
echo "3️⃣ ";
if (enviarCorreoReactEmail(
    'test-email', 
    $testData, 
    "Email de Prueba (React Email)", 
    $emailDestino,
    "Prueba Sistema EVA - Hospital Universitario del Valle"
)) {
    $enviados++;
}

echo "\n" . str_repeat('=', 60) . "\n\n";

// Resumen final
echo "📊 RESUMEN DE ENVÍO REACT EMAIL:\n";
echo "✅ Enviados exitosamente: $enviados/$total\n";
echo "❌ Fallaron: " . ($total - $enviados) . "/$total\n\n";

if ($enviados > 0) {
    echo "🎉 ¡Correos React Email enviados! Revisa tu bandeja de entrada:\n";
    echo "📧 Email: $emailDestino\n\n";
    
    echo "📋 CARACTERÍSTICAS DE LOS CORREOS:\n";
    echo "• ✅ Renderizados con React Email + JSX\n";
    echo "• ✅ HTML optimizado para clientes de correo\n";
    echo "• ✅ Diseño institucional del Hospital Universitario del Valle\n";
    echo "• ✅ Logo institucional incluido\n";
    echo "• ✅ Responsive y compatible con Gmail, Outlook, Apple Mail\n\n";
    
    echo "🎨 DIFERENCIAS VS BLADE:\n";
    echo "• 🔧 Mejor compatibilidad con clientes de correo\n";
    echo "• 🎨 Diseño más profesional y moderno\n";
    echo "• 📱 Mejor responsive design\n";
    echo "• 🖼️ Soporte nativo para imágenes y assets\n";
    echo "• ⚡ Renderizado optimizado\n\n";
} else {
    echo "⚠️ No se pudieron enviar correos. Verifica:\n";
    echo "1. Configuración SMTP en .env del backend\n";
    echo "2. Dependencias React Email instaladas\n";
    echo "3. Conexión a internet\n";
    echo "4. Servidor Laravel ejecutándose\n\n";
}

echo "🔧 CONFIGURACIÓN REQUERIDA (.env):\n";
echo "MAIL_MAILER=smtp\n";
echo "MAIL_HOST=smtp.gmail.com\n";
echo "MAIL_PORT=587\n";
echo "MAIL_USERNAME=evagestionalamedicina@gmail.com\n";
echo "MAIL_PASSWORD=\"tu_password_de_aplicacion\"\n";
echo "MAIL_ENCRYPTION=tls\n";
echo "MAIL_FROM_ADDRESS=evagestionalamedicina@gmail.com\n";
echo "MAIL_FROM_NAME=\"EVA - Sistema de Gestión\"\n\n";

echo "✨ Script React Email completado.\n";

?>
