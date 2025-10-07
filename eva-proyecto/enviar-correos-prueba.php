<?php

require_once __DIR__ . '/eva-backend/vendor/autoload.php';

// Configurar Laravel
$app = require_once __DIR__ . '/eva-backend/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Mail\RepuestoPendienteEmail;
use App\Mail\NuevoTicketEmail;
use Illuminate\Support\Facades\Mail;

echo "📧 Script para enviar correos de prueba del Sistema EVA\n\n";

// Email de destino para las pruebas
$emailDestino = 'camilomoralesyk@gmail.com';

echo "📮 Enviando correos de prueba a: $emailDestino\n\n";

// Datos de prueba para preventivo
$preventivo = (object) [
    'id' => 123,
    'fecha_mantenimiento' => '2024-10-03 15:30:00',
    'observacion' => 'Equipo requiere calibración urgente. Se detectó desviación en las mediciones que supera los parámetros establecidos.',
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
$ticket = (object) [
    'id' => 789,
    'descripcion' => 'Falla en el sistema de refrigeración del equipo de resonancia magnética. El equipo presenta sobrecalentamiento y ruidos anómalos.',
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

// Función para enviar y mostrar resultado
function enviarCorreo($mailable, $descripcion, $destinatario) {
    echo "🔄 Enviando: $descripcion\n";
    
    try {
        Mail::to($destinatario)->send($mailable);
        echo "✅ Éxito: Correo enviado correctamente\n";
        echo "📬 Destinatario: $destinatario\n";
        echo "📝 Asunto: " . $mailable->subject . "\n";
        return true;
    } catch (Exception $e) {
        echo "❌ Error: " . $e->getMessage() . "\n";
        return false;
    }
}

echo "🚀 Iniciando envío de correos de prueba...\n\n";

$enviados = 0;
$total = 3;

// 1. Enviar correo de repuesto pendiente
echo "1️⃣ ";
$repuestoEmail = new RepuestoPendienteEmail($preventivo, null);
if (enviarCorreo($repuestoEmail, "Email de Repuesto Pendiente", $emailDestino)) {
    $enviados++;
}
echo "\n" . str_repeat('-', 60) . "\n\n";

// 2. Enviar correo de nuevo ticket
echo "2️⃣ ";
$ticketEmail = new NuevoTicketEmail($ticket, null);
if (enviarCorreo($ticketEmail, "Email de Nuevo Ticket", $emailDestino)) {
    $enviados++;
}
echo "\n" . str_repeat('-', 60) . "\n\n";

// 3. Enviar correo de prueba usando el endpoint
echo "3️⃣ ";
echo "🔄 Enviando: Email de Prueba (vía endpoint)\n";

try {
    // Simular llamada al endpoint de test
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, 'http://localhost:8001/api/v1/notifications/test-email');
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
        'email' => $emailDestino,
        'nombre' => 'Usuario de Prueba'
    ]));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Accept: application/json'
    ]);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode === 200) {
        echo "✅ Éxito: Correo de prueba enviado vía endpoint\n";
        echo "📬 Destinatario: $emailDestino\n";
        echo "📝 Respuesta: $response\n";
        $enviados++;
    } else {
        echo "⚠️ Advertencia: Endpoint no disponible (código: $httpCode)\n";
        echo "💡 Asegúrate de que el servidor Laravel esté ejecutándose en localhost:8001\n";
    }
} catch (Exception $e) {
    echo "❌ Error en endpoint: " . $e->getMessage() . "\n";
}

echo "\n" . str_repeat('=', 60) . "\n\n";

// Resumen final
echo "📊 RESUMEN DE ENVÍO:\n";
echo "✅ Enviados exitosamente: $enviados/$total\n";
echo "❌ Fallaron: " . ($total - $enviados) . "/$total\n\n";

if ($enviados > 0) {
    echo "🎉 ¡Correos enviados! Revisa tu bandeja de entrada:\n";
    echo "📧 Email: $emailDestino\n\n";
    
    echo "📋 INSTRUCCIONES:\n";
    echo "1. Revisa tu bandeja de entrada (puede tardar unos minutos)\n";
    echo "2. Si no aparecen, revisa la carpeta de SPAM/Correo no deseado\n";
    echo "3. Los correos tendrán el diseño institucional del Hospital Universitario del Valle\n";
    echo "4. Cada correo mostrará información específica del preventivo/ticket\n\n";
    
    echo "🎨 CARACTERÍSTICAS VISUALES:\n";
    echo "• Header azul (#70bbd9) con título del correo\n";
    echo "• Subtítulo 'Eva Gestiona la tecnología'\n";
    echo "• Información organizada en secciones\n";
    echo "• Footer rojo (#ee4c50) con copyright del hospital\n";
    echo "• Enlaces a redes sociales del hospital\n\n";
} else {
    echo "⚠️ No se pudieron enviar correos. Verifica:\n";
    echo "1. Configuración SMTP en .env del backend\n";
    echo "2. Credenciales de correo válidas\n";
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

echo "✨ Script completado.\n";

?>
