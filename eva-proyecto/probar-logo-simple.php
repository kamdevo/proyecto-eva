<?php

require_once __DIR__ . '/eva-backend/vendor/autoload.php';

// Configurar Laravel
$app = require_once __DIR__ . '/eva-backend/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Services\ReactEmailService;
use Illuminate\Support\Facades\Mail;
use Illuminate\Mail\Message;

echo "🖼️ PRUEBA SIMPLE DE LOGO EN CORREOS REACT EMAIL\n\n";

$emailDestino = 'camilomoralesyk@gmail.com';

echo "📧 Probando correo con logo desde backend (puerto 8001) a: $emailDestino\n\n";

try {
    $reactEmailService = new ReactEmailService();
    
    // Datos de prueba
    $ticketData = [
        'id' => 999,
        'descripcion' => 'Prueba logo simple - Equipo de ultrasonido con pantalla defectuosa',
        'fecha_inicio' => '2024-10-03 16:35:00',
        'prioridad' => 2, // MEDIA
        'servicio_nombre' => 'CARDIOLOGÍA',
        'area_nombre' => 'Ecocardiografía',
        'equipo_id' => 123,
        'equipo_nombre' => 'Ultrasonido Cardíaco',
        'equipo_marca' => 'Philips',
        'equipo_modelo' => 'EPIQ CVx',
        'equipo_codigo' => 'US-001-HUV',
        'equipo_serie' => 'PH123456789',
        'reportante_nombre' => 'Dr. María González - Cardiología'
    ];
    
    // Renderizar email
    $htmlContent = $reactEmailService->renderNuevoTicket((object)$ticketData);
    
    // Verificar que contiene la URL del logo
    $tieneLogoURL = strpos($htmlContent, 'http://localhost:8001/logo_huv.jpg') !== false;
    
    echo "🔍 Verificando HTML generado:\n";
    echo "📏 Tamaño: " . number_format(strlen($htmlContent)) . " caracteres\n";
    echo "🖼️  Logo URL: " . ($tieneLogoURL ? 'Detectado ✅' : 'No detectado ❌') . "\n\n";
    
    if ($tieneLogoURL) {
        // Enviar correo
        Mail::send([], [], function (Message $message) use ($htmlContent, $emailDestino) {
            $message->to($emailDestino)
                    ->subject("Prueba Logo Simple - Hospital Universitario del Valle")
                    ->html($htmlContent);
        });
        
        echo "✅ ¡Correo enviado exitosamente!\n";
        echo "📬 Destinatario: $emailDestino\n";
        echo "📝 Asunto: Prueba Logo Simple - Hospital Universitario del Valle\n";
        echo "🖼️  Logo: http://localhost:8001/logo_huv.jpg\n\n";
        
        // Guardar HTML para inspección
        file_put_contents(__DIR__ . '/test_logo_simple.html', $htmlContent);
        echo "💾 HTML guardado en: test_logo_simple.html\n\n";
        
        echo "🎉 ÉXITO: El logo debería aparecer si:\n";
        echo "• El servidor Laravel está corriendo en puerto 8001\n";
        echo "• El archivo logo_huv.jpg existe en eva-backend/public/\n";
        echo "• El cliente de correo puede acceder a localhost:8001\n\n";
        
    } else {
        echo "❌ ERROR: Logo URL no encontrada en el HTML\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}

echo "📋 NOTA: Para producción, cambia localhost:8001 por la URL real del servidor\n";

?>
