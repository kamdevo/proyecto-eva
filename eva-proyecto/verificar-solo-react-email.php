<?php

require_once __DIR__ . '/eva-backend/vendor/autoload.php';

// Configurar Laravel
$app = require_once __DIR__ . '/eva-backend/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Services\ReactEmailService;
use Illuminate\Support\Facades\Mail;
use Illuminate\Mail\Message;

echo "🔍 VERIFICACIÓN: SOLO CORREOS REACT EMAIL (SIN BLADE)\n\n";

echo "✅ VERIFICACIONES REALIZADAS:\n\n";

// 1. Verificar que las clases Mailable fueron eliminadas
echo "1️⃣ Verificando eliminación de clases Mailable...\n";
$mailableFiles = [
    __DIR__ . '/eva-backend/app/Mail/NuevoTicketEmail.php',
    __DIR__ . '/eva-backend/app/Mail/RepuestoPendienteEmail.php'
];

$mailablesEliminados = 0;
foreach ($mailableFiles as $file) {
    if (!file_exists($file)) {
        echo "   ✅ " . basename($file) . " - ELIMINADO\n";
        $mailablesEliminados++;
    } else {
        echo "   ❌ " . basename($file) . " - AÚN EXISTE\n";
    }
}

// 2. Verificar que las plantillas Blade fueron eliminadas
echo "\n2️⃣ Verificando eliminación de plantillas Blade...\n";
$bladeDir = __DIR__ . '/eva-backend/resources/views/emails';
if (!is_dir($bladeDir)) {
    echo "   ✅ Directorio /resources/views/emails - ELIMINADO\n";
    $bladesEliminados = true;
} else {
    echo "   ❌ Directorio /resources/views/emails - AÚN EXISTE\n";
    $bladesEliminados = false;
}

// 3. Verificar que ReactEmailService existe y funciona
echo "\n3️⃣ Verificando ReactEmailService...\n";
try {
    $reactEmailService = new ReactEmailService();
    echo "   ✅ ReactEmailService - CARGADO CORRECTAMENTE\n";
    
    // Probar renderizado de nuevo ticket
    $testTicket = (object)[
        'id' => 999,
        'descripcion' => 'Test de verificación',
        'fecha_inicio' => '2024-10-03 14:15:00',
        'prioridad' => 3,
        'servicio_nombre' => 'PRUEBA',
        'area_nombre' => 'Test',
        'equipo_id' => 1,
        'equipo_nombre' => 'Equipo Test',
        'equipo_marca' => 'Test',
        'equipo_modelo' => 'Test',
        'equipo_codigo' => 'TEST-001',
        'equipo_serie' => 'TEST123',
        'reportante_nombre' => 'Usuario Test'
    ];
    
    $htmlNuevoTicket = $reactEmailService->renderNuevoTicket($testTicket);
    if (strlen($htmlNuevoTicket) > 1000) {
        echo "   ✅ renderNuevoTicket() - FUNCIONANDO (" . number_format(strlen($htmlNuevoTicket)) . " caracteres)\n";
        $nuevoTicketOK = true;
    } else {
        echo "   ❌ renderNuevoTicket() - ERROR (HTML muy pequeño)\n";
        $nuevoTicketOK = false;
    }
    
    // Probar renderizado de repuesto pendiente
    $testPreventivo = (object)[
        'id' => 888,
        'fecha_mantenimiento' => '2024-10-03 14:15:00',
        'observacion' => 'Test repuesto pendiente',
        'servicio_nombre' => 'PRUEBA',
        'area_nombre' => 'Test',
        'equipo_id' => 1,
        'equipo_nombre' => 'Equipo Test',
        'equipo_marca' => 'Test',
        'equipo_modelo' => 'Test',
        'equipo_codigo' => 'TEST-001',
        'equipo_serie' => 'TEST123'
    ];
    
    $htmlRepuesto = $reactEmailService->renderRepuestoPendiente($testPreventivo);
    if (strlen($htmlRepuesto) > 1000) {
        echo "   ✅ renderRepuestoPendiente() - FUNCIONANDO (" . number_format(strlen($htmlRepuesto)) . " caracteres)\n";
        $repuestoOK = true;
    } else {
        echo "   ❌ renderRepuestoPendiente() - ERROR (HTML muy pequeño)\n";
        $repuestoOK = false;
    }
    
} catch (\Exception $e) {
    echo "   ❌ ReactEmailService - ERROR: " . $e->getMessage() . "\n";
    $nuevoTicketOK = false;
    $repuestoOK = false;
}

// 4. Verificar que los controladores usan ReactEmailService directamente
echo "\n4️⃣ Verificando controladores...\n";

$correctivoController = file_get_contents(__DIR__ . '/eva-backend/app/Http/Controllers/Api/CorrectivoController.php');
if (strpos($correctivoController, 'ReactEmailService') !== false && 
    strpos($correctivoController, 'renderNuevoTicket') !== false &&
    strpos($correctivoController, 'NuevoTicketEmail') === false) {
    echo "   ✅ CorrectivoController - USA REACT EMAIL DIRECTAMENTE\n";
    $correctivoOK = true;
} else {
    echo "   ❌ CorrectivoController - NO USA REACT EMAIL O TIENE REFERENCIAS A BLADE\n";
    $correctivoOK = false;
}

$mantenimientoController = file_get_contents(__DIR__ . '/eva-backend/app/Http/Controllers/Api/MantenimientoController.php');
if (strpos($mantenimientoController, 'ReactEmailService') !== false && 
    strpos($mantenimientoController, 'renderRepuestoPendiente') !== false &&
    strpos($mantenimientoController, 'RepuestoPendienteEmail') === false) {
    echo "   ✅ MantenimientoController - USA REACT EMAIL DIRECTAMENTE\n";
    $mantenimientoOK = true;
} else {
    echo "   ❌ MantenimientoController - NO USA REACT EMAIL O TIENE REFERENCIAS A BLADE\n";
    $mantenimientoOK = false;
}

// 5. Verificar que los templates React Email tienen el logo
echo "\n5️⃣ Verificando templates React Email...\n";

$nuevoTicketTemplate = file_get_contents(__DIR__ . '/emails/emails/nuevo-ticket.jsx');
if (strpos($nuevoTicketTemplate, 'logo_huv.jpg') !== false) {
    echo "   ✅ nuevo-ticket.jsx - CONTIENE LOGO HUV\n";
    $logoNuevoOK = true;
} else {
    echo "   ❌ nuevo-ticket.jsx - NO CONTIENE LOGO HUV\n";
    $logoNuevoOK = false;
}

$repuestoTemplate = file_get_contents(__DIR__ . '/emails/emails/repuesto-pendiente.jsx');
if (strpos($repuestoTemplate, 'logo_huv.jpg') !== false) {
    echo "   ✅ repuesto-pendiente.jsx - CONTIENE LOGO HUV\n";
    $logoRepuestoOK = true;
} else {
    echo "   ❌ repuesto-pendiente.jsx - NO CONTIENE LOGO HUV\n";
    $logoRepuestoOK = false;
}

// Verificar que el logo existe
$logoPath = __DIR__ . '/emails/logo_huv.jpg';
if (file_exists($logoPath)) {
    echo "   ✅ logo_huv.jpg - ARCHIVO EXISTE\n";
    $logoExisteOK = true;
} else {
    echo "   ❌ logo_huv.jpg - ARCHIVO NO EXISTE\n";
    $logoExisteOK = false;
}

echo "\n" . str_repeat('=', 70) . "\n\n";

// Resumen final
echo "📊 RESUMEN DE VERIFICACIÓN:\n\n";

$verificaciones = [
    'Clases Mailable eliminadas' => $mailablesEliminados === 2,
    'Plantillas Blade eliminadas' => $bladesEliminados,
    'ReactEmailService funcionando' => $nuevoTicketOK && $repuestoOK,
    'Controladores usando React Email' => $correctivoOK && $mantenimientoOK,
    'Templates con logo HUV' => $logoNuevoOK && $logoRepuestoOK && $logoExisteOK
];

$totalVerificaciones = count($verificaciones);
$verificacionesExitosas = 0;

foreach ($verificaciones as $nombre => $estado) {
    if ($estado) {
        echo "✅ $nombre\n";
        $verificacionesExitosas++;
    } else {
        echo "❌ $nombre\n";
    }
}

echo "\n📈 RESULTADO: $verificacionesExitosas/$totalVerificaciones verificaciones exitosas\n\n";

if ($verificacionesExitosas === $totalVerificaciones) {
    echo "🎉 ¡PERFECTO! EL SISTEMA USA EXCLUSIVAMENTE REACT EMAIL\n\n";
    echo "✅ CONFIRMADO:\n";
    echo "• NO hay clases Mailable (eliminadas)\n";
    echo "• NO hay plantillas Blade (eliminadas)\n";
    echo "• Los controladores usan ReactEmailService directamente\n";
    echo "• Los templates React Email contienen el logo HUV\n";
    echo "• ReactEmailService renderiza correctamente\n\n";
    echo "🚀 Los correos enviados son 100% React Email con datos reales\n";
} else {
    echo "⚠️ ATENCIÓN: Hay verificaciones que fallaron\n";
    echo "🔧 Revisa los elementos marcados con ❌ arriba\n\n";
}

echo "📧 PRÓXIMO PASO: Ejecutar 'php probar-flujo-correos-completo.php' para enviar correos de prueba\n";

?>
