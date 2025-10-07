<?php
echo "📧 ENVIANDO CORREO DE NUEVO TICKET\n";
echo "=" . str_repeat("=", 50) . "\n\n";

require_once 'eva-backend/vendor/autoload.php';

// Cargar configuración Laravel
$app = require_once 'eva-backend/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Services\ReactEmailService;
use Illuminate\Support\Facades\Mail;

try {
    echo "1️⃣ OBTENIENDO TICKET REAL 13464...\n";
    
    $pdo = new PDO("mysql:host=127.0.0.1;port=3306;dbname=gestionthuv;charset=utf8mb4", 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Obtener ticket 13464 completo
    $stmt = $pdo->prepare("
        SELECT 
            o.id,
            o.descripcion,
            o.fecha_inicio,
            o.prioridad,
            eq.name as equipo_nombre,
            eq.code as equipo_codigo,
            eq.marca as equipo_marca,
            eq.modelo as equipo_modelo,
            eq.serial as equipo_serie,
            s.name as servicio_nombre,
            a.name as area_nombre,
            u.nombre as reportante_nombre
        FROM ordenes o
        LEFT JOIN equipos eq ON o.equipo_id = eq.id
        LEFT JOIN servicios s ON eq.servicio_id = s.id
        LEFT JOIN areas a ON eq.area_id = a.id
        LEFT JOIN usuarios u ON o.reportante_id = u.id
        WHERE o.id = 13464
    ");
    
    $stmt->execute();
    $ticket = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$ticket) {
        throw new Exception("Ticket 13464 no encontrado");
    }

    echo "✅ TICKET ENCONTRADO:\n";
    echo "   • ID: {$ticket['id']}\n";
    echo "   • Equipo: {$ticket['equipo_nombre']}\n";
    echo "   • Prioridad: {$ticket['prioridad']}\n";
    echo "   • Servicio: {$ticket['servicio_nombre']}\n";
    echo "   • Descripción: " . substr($ticket['descripcion'], 0, 60) . "...\n\n";

    echo "2️⃣ GENERANDO HTML CON REACTEMAILSERVICE...\n";
    
    $reactEmailService = new ReactEmailService();
    $htmlContent = $reactEmailService->renderNuevoTicket((object)$ticket);

    echo "✅ HTML generado: " . strlen($htmlContent) . " caracteres\n\n";

    echo "3️⃣ ENVIANDO CORREO...\n";
    
    // Email de destino
    $emailDestino = 'camilomoralesyk@gmail.com';
    $asunto = "Creación de Ticket Nro {$ticket['id']}";

    echo "📧 Destinatario: $emailDestino\n";
    echo "📋 Asunto: $asunto\n";
    echo "🏥 Equipo: {$ticket['equipo_nombre']}\n\n";

    // Enviar usando Laravel Mail
    Mail::send([], [], function ($message) use ($htmlContent, $emailDestino, $asunto) {
        $message->to($emailDestino)
                ->subject($asunto)
                ->html($htmlContent);
    });

    echo "✅ ¡CORREO ENVIADO EXITOSAMENTE!\n";
    echo "📬 Revisa tu bandeja de entrada en: $emailDestino\n\n";

    echo "📋 DETALLES DEL CORREO ENVIADO:\n";
    echo "   🆔 Ticket ID: {$ticket['id']}\n";
    echo "   📅 Fecha: {$ticket['fecha_inicio']}\n";
    echo "   🔧 Equipo: {$ticket['equipo_nombre']}\n";
    echo "   🏭 Marca/Modelo: {$ticket['equipo_marca']} {$ticket['equipo_modelo']}\n";
    echo "   📍 Ubicación: {$ticket['servicio_nombre']}\n";
    echo "   ⚠️ Prioridad: {$ticket['prioridad']} (ALTA)\n";
    echo "   👤 Reportante: {$ticket['reportante_nombre']}\n\n";

    echo "🎨 CARACTERÍSTICAS DEL DISEÑO:\n";
    echo "   🖼️ Logo Hospital Universitario del Valle incluido\n";
    echo "   🎨 Colores institucionales (#70bbd9, #5aa9c9, #ee4c50)\n";
    echo "   🏥 Footer: 'Eva Gestiona la medicina' + fecha actual\n";
    echo "   📱 Responsive design compatible con todos los clientes\n";
    echo "   🚨 Badge de prioridad ALTA en color rojo\n\n";

    echo "💡 TIENES DOS CORREOS PARA COMPARAR:\n";
    echo "   📧 Correo 1: Repuesto Pendiente (Preventivo #17220)\n";
    echo "   📧 Correo 2: Nuevo Ticket (Ticket #13464)\n";

} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
    echo "💡 Verifica que el servidor SMTP esté configurado correctamente\n";
}

echo "\n🏁 FIN DEL ENVÍO\n";
