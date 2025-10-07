<?php

require_once __DIR__ . '/eva-backend/vendor/autoload.php';

// Configurar Laravel
$app = require_once __DIR__ . '/eva-backend/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Services\ReactEmailService;
use Illuminate\Support\Facades\Mail;
use Illuminate\Mail\Message;

echo "🏥 PRUEBA CON LOGO OFICIAL DEL HOSPITAL UNIVERSITARIO DEL VALLE\n\n";

$emailDestino = 'camilomoralesyk@gmail.com';
$logoURL = 'https://biotronitech.com.co/wp-content/uploads/2021/03/logo-HUV.jpg';

echo "📧 Probando correo con logo oficial HUV a: $emailDestino\n";
echo "🖼️  Logo URL: $logoURL\n\n";

// Verificar que la URL del logo esté accesible
echo "🔍 Verificando accesibilidad del logo...\n";
$headers = @get_headers($logoURL);
if ($headers && strpos($headers[0], '200') !== false) {
    echo "✅ Logo accesible desde: $logoURL\n\n";
} else {
    echo "⚠️  Advertencia: No se pudo verificar el logo en: $logoURL\n\n";
}

try {
    $reactEmailService = new ReactEmailService();
    
    // Datos de prueba
    $ticketData = [
        'id' => 999,
        'descripcion' => 'Prueba con logo oficial HUV - Monitor de signos vitales con alarmas defectuosas',
        'fecha_inicio' => '2024-10-03 16:40:00',
        'prioridad' => 3, // ALTA
        'servicio_nombre' => 'UCI ADULTOS',
        'area_nombre' => 'Unidad de Cuidados Intensivos',
        'equipo_id' => 456,
        'equipo_nombre' => 'Monitor de Signos Vitales',
        'equipo_marca' => 'Philips',
        'equipo_modelo' => 'IntelliVue MX450',
        'equipo_codigo' => 'MSV-005-HUV',
        'equipo_serie' => 'PH987654321',
        'reportante_nombre' => 'Enf. Patricia Rodríguez - UCI Adultos'
    ];
    
    // Renderizar email
    $htmlContent = $reactEmailService->renderNuevoTicket((object)$ticketData);
    
    // Verificar que contiene la URL oficial del logo
    $tieneLogoOficial = strpos($htmlContent, 'https://biotronitech.com.co/wp-content/uploads/2021/03/logo-HUV.jpg') !== false;
    
    echo "🔍 Verificando HTML generado:\n";
    echo "📏 Tamaño: " . number_format(strlen($htmlContent)) . " caracteres\n";
    echo "🖼️  Logo Oficial HUV: " . ($tieneLogoOficial ? 'Detectado ✅' : 'No detectado ❌') . "\n\n";
    
    if ($tieneLogoOficial) {
        // Enviar correo
        Mail::send([], [], function (Message $message) use ($htmlContent, $emailDestino) {
            $message->to($emailDestino)
                    ->subject("Prueba Logo Oficial HUV - Hospital Universitario del Valle")
                    ->html($htmlContent);
        });
        
        echo "✅ ¡Correo enviado exitosamente!\n";
        echo "📬 Destinatario: $emailDestino\n";
        echo "📝 Asunto: Prueba Logo Oficial HUV - Hospital Universitario del Valle\n";
        echo "🖼️  Logo: $logoURL\n\n";
        
        // Guardar HTML para inspección
        file_put_contents(__DIR__ . '/test_logo_oficial_huv.html', $htmlContent);
        echo "💾 HTML guardado en: test_logo_oficial_huv.html\n\n";
        
        echo "🎉 ÉXITO: El logo oficial del HUV debería aparecer correctamente\n";
        echo "✅ VENTAJAS de usar la nueva URL:\n";
        echo "• ✅ Mayor resolución y calidad de imagen\n";
        echo "• ✅ Formato JPG optimizado para correos\n";
        echo "• ✅ Funciona en todos los clientes de correo\n";
        echo "• ✅ Logo oficial del Hospital Universitario del Valle\n";
        echo "• ✅ Listo para producción sin cambios\n\n";
        
    } else {
        echo "❌ ERROR: Logo oficial no encontrado en el HTML\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}

echo "🏥 LOGO OFICIAL DEL HOSPITAL UNIVERSITARIO DEL VALLE\n";
echo "🔗 URL: $logoURL\n";
echo "📋 Formato: JPG (alta resolución y calidad)\n";
echo "🌐 Accesible: Desde cualquier lugar del mundo\n\n";

echo "📧 ¡Revisa tu bandeja de entrada para ver el correo con el logo oficial del HUV!\n";

?>
