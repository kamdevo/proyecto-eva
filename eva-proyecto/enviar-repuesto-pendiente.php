<?php
echo "📧 ENVIANDO CORREO DE REPUESTO PENDIENTE\n";
echo "=" . str_repeat("=", 50) . "\n\n";

require_once 'eva-backend/vendor/autoload.php';

// Cargar configuración Laravel
$app = require_once 'eva-backend/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Services\ReactEmailService;
use Illuminate\Support\Facades\Mail;

try {
    echo "1️⃣ OBTENIENDO DATOS REALES DE MANTENIMIENTO...\n";
    
    $pdo = new PDO("mysql:host=127.0.0.1;port=3306;dbname=gestionthuv;charset=utf8mb4", 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Obtener mantenimiento con repuesto pendiente (el mismo de la prueba)
    $stmt = $pdo->prepare("
        SELECT 
            m.id,
            m.fecha_mantenimiento,
            m.observacion,
            m.repuesto_pendiente,
            m.repuesto_id,
            eq.name as equipo_nombre,
            eq.code as equipo_codigo,
            eq.marca as equipo_marca,
            eq.modelo as equipo_modelo,
            eq.serial as equipo_serie,
            s.name as servicio_nombre,
            a.name as area_nombre
        FROM mantenimiento m
        LEFT JOIN equipos eq ON m.equipo_id = eq.id
        LEFT JOIN servicios s ON eq.servicio_id = s.id
        LEFT JOIN areas a ON eq.area_id = a.id
        WHERE m.observacion LIKE '%repuesto%' 
           OR m.observacion LIKE '%falta%'
           OR m.observacion LIKE '%pendiente%'
        ORDER BY m.id DESC
        LIMIT 1
    ");
    
    $stmt->execute();
    $preventivo = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$preventivo) {
        throw new Exception("No se encontró mantenimiento con repuesto pendiente");
    }

    echo "✅ PREVENTIVO ENCONTRADO:\n";
    echo "   • ID: {$preventivo['id']}\n";
    echo "   • Equipo: {$preventivo['equipo_nombre']}\n";
    echo "   • Servicio: {$preventivo['servicio_nombre']}\n";
    echo "   • Observación: " . substr($preventivo['observacion'], 0, 60) . "...\n\n";

    echo "2️⃣ GENERANDO HTML CON REACTEMAILSERVICE...\n";
    
    $reactEmailService = new ReactEmailService();
    $htmlContent = $reactEmailService->renderRepuestoPendiente((object)$preventivo);

    echo "✅ HTML generado: " . strlen($htmlContent) . " caracteres\n\n";

    echo "3️⃣ ENVIANDO CORREO...\n";
    
    // Email de destino
    $emailDestino = 'camilomoralesyk@gmail.com';
    $asunto = "Notificación de repuesto pendiente - Preventivo #{$preventivo['id']}";

    echo "📧 Destinatario: $emailDestino\n";
    echo "📋 Asunto: $asunto\n";
    echo "🏥 Equipo: {$preventivo['equipo_nombre']}\n\n";

    // Enviar usando Laravel Mail
    Mail::send([], [], function ($message) use ($htmlContent, $emailDestino, $asunto) {
        $message->to($emailDestino)
                ->subject($asunto)
                ->html($htmlContent);
    });

    echo "✅ ¡CORREO ENVIADO EXITOSAMENTE!\n";
    echo "📬 Revisa tu bandeja de entrada en: $emailDestino\n\n";

    echo "📋 DETALLES DEL CORREO ENVIADO:\n";
    echo "   🆔 Preventivo ID: {$preventivo['id']}\n";
    echo "   📅 Fecha mantenimiento: {$preventivo['fecha_mantenimiento']}\n";
    echo "   🔧 Equipo: {$preventivo['equipo_nombre']}\n";
    echo "   🏭 Marca/Modelo: {$preventivo['equipo_marca']} {$preventivo['equipo_modelo']}\n";
    echo "   📍 Ubicación: {$preventivo['servicio_nombre']}\n";
    echo "   ⚠️ Repuesto: " . substr($preventivo['observacion'], 0, 100) . "\n\n";

    echo "🎨 CARACTERÍSTICAS DEL DISEÑO:\n";
    echo "   🖼️ Logo Hospital Universitario del Valle incluido\n";
    echo "   🎨 Colores institucionales (#70bbd9, #5aa9c9, #ee4c50)\n";
    echo "   🏥 Footer: 'Eva Gestiona la medicina' + fecha actual\n";
    echo "   📱 Responsive design compatible con todos los clientes\n";
    echo "   ⚠️ Alerta destacada de REPUESTO PENDIENTE\n\n";

    echo "💡 TIP: Si no ves el correo, revisa la carpeta de SPAM/Promociones\n";

} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
    echo "💡 Verifica que el servidor SMTP esté configurado correctamente\n";
}

echo "\n🏁 FIN DEL ENVÍO\n";
