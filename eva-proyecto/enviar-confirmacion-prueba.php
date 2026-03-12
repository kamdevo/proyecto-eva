<?php

require_once __DIR__ . '/eva-backend/vendor/autoload.php';

// Configurar Laravel
$app = require_once __DIR__ . '/eva-backend/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Services\ReactEmailService;
use Illuminate\Support\Facades\Mail;
use Illuminate\Mail\Message;

echo "📧 Enviando email de prueba de CONFIRMACIÓN DE CUENTA\n\n";

// Obtener email de destino de los argumentos o usar uno por defecto
$emailDestino = $argv[1] ?? 'camilomoralesyk@gmail.com';

echo "📮 Destinatario: $emailDestino\n";

$usuario = (object)[
    'nombre' => 'Usuario',
    'apellido' => 'de Prueba',
    'email' => $emailDestino
];

$urlConfirmacion = 'http://localhost:5173/confirmar-cuenta/token-de-prueba-123456';

try {
    $reactEmailService = new ReactEmailService();
    $htmlContent = $reactEmailService->renderConfirmacionCuenta($usuario, $urlConfirmacion);
    
    Mail::send([], [], function (Message $message) use ($htmlContent, $emailDestino) {
        $message->to($emailDestino)
                ->subject("Confirma tu cuenta - Sistema EVA (PRUEBA DISEÑO)")
                ->html($htmlContent);
    });
    
    echo "✅ Éxito: Correo de confirmación enviado correctamente.\n";
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
