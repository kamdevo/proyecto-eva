<?php
echo "🔍 VERIFICACIÓN HTML DEL CORREO\n";
echo "=" . str_repeat("=", 50) . "\n\n";

require_once 'eva-backend/vendor/autoload.php';

// Cargar configuración Laravel
$app = require_once 'eva-backend/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Services\ReactEmailService;

try {
    // Datos de prueba realistas
    $ticketData = [
        'ticket' => [
            'id' => 13464,
            'descripcion' => 'PRUEBA COMPLETA: SearchableSelect funcionando - Equipo requiere revisión técnica especializada',
            'fecha_inicio' => '2025-10-06 16:47:41',
            'prioridad' => 3, // ALTA
            'servicio_nombre' => 'RADIOTERAPIA',
            'area_nombre' => null,
            'equipo_id' => 13464,
            'equipo_nombre' => 'ACELERADOR LINEAL',
            'equipo_marca' => 'VARIAN MEDICAL SYSTEMS',
            'equipo_modelo' => 'CLINAC IX',
            'equipo_codigo' => 'SIN CODIGO',
            'equipo_serie' => '927H290927',
            'reportante_nombre' => 'Administrador'
        ]
    ];

    echo "1️⃣ GENERANDO HTML CON REACTEMAILSERVICE...\n";
    $reactEmailService = new ReactEmailService();
    $htmlContent = $reactEmailService->renderNuevoTicket((object)$ticketData);

    echo "✅ HTML generado exitosamente!\n";
    echo "📄 Tamaño: " . strlen($htmlContent) . " caracteres\n\n";

    echo "2️⃣ VERIFICANDO ELEMENTOS SOLICITADOS...\n\n";

    // Verificar logo institucional
    $tieneLogoHUV = strpos($htmlContent, 'https://biotronitech.com.co/wp-content/uploads/2021/03/logo-HUV.jpg') !== false;
    echo "🖼️ Logo HUV incluido: " . ($tieneLogoHUV ? "✅ SÍ" : "❌ NO") . "\n";

    // Verificar colores institucionales
    $tieneAzulHeader = strpos($htmlContent, '#70bbd9') !== false;
    $tieneAzulSubtitulo = strpos($htmlContent, '#5aa9c9') !== false;
    $tieneRojoFooter = strpos($htmlContent, '#ee4c50') !== false;
    
    echo "🎨 Colores institucionales:\n";
    echo "   • Header azul (#70bbd9): " . ($tieneAzulHeader ? "✅ SÍ" : "❌ NO") . "\n";
    echo "   • Subtítulo azul (#5aa9c9): " . ($tieneAzulSubtitulo ? "✅ SÍ" : "❌ NO") . "\n";
    echo "   • Footer rojo (#ee4c50): " . ($tieneRojoFooter ? "✅ SÍ" : "❌ NO") . "\n";

    // Verificar footer actualizado
    $tieneEvaGestionaMedicina = strpos($htmlContent, 'Eva Gestiona la medicina') !== false;
    $tieneAñoActual = strpos($htmlContent, date('Y')) !== false;
    $tieneFechaHora = strpos($htmlContent, date('d/m/Y')) !== false;
    
    echo "🏥 Footer actualizado:\n";
    echo "   • 'Eva Gestiona la medicina': " . ($tieneEvaGestionaMedicina ? "✅ SÍ" : "❌ NO") . "\n";
    echo "   • Año actual (" . date('Y') . "): " . ($tieneAñoActual ? "✅ SÍ" : "❌ NO") . "\n";
    echo "   • Fecha actual: " . ($tieneFechaHora ? "✅ SÍ" : "❌ NO") . "\n";

    // Verificar datos reales del ticket
    $tieneTicketId = strpos($htmlContent, '13464') !== false;
    $tieneDescripcion = strpos($htmlContent, 'PRUEBA COMPLETA') !== false;
    $tieneEquipoNombre = strpos($htmlContent, 'ACELERADOR LINEAL') !== false;
    $tienePrioridadAlta = strpos($htmlContent, 'ALTA') !== false;
    
    echo "📋 Datos reales del ticket:\n";
    echo "   • ID 13464: " . ($tieneTicketId ? "✅ SÍ" : "❌ NO") . "\n";
    echo "   • Descripción real: " . ($tieneDescripcion ? "✅ SÍ" : "❌ NO") . "\n";
    echo "   • Equipo 'ACELERADOR LINEAL': " . ($tieneEquipoNombre ? "✅ SÍ" : "❌ NO") . "\n";
    echo "   • Prioridad ALTA: " . ($tienePrioridadAlta ? "✅ SÍ" : "❌ NO") . "\n";

    echo "\n3️⃣ ESTRUCTURA HTML:\n";
    $tieneDoctype = strpos($htmlContent, '<!DOCTYPE html>') !== false;
    $tieneMetaCharset = strpos($htmlContent, 'charset="utf-8"') !== false;
    $tieneResponsive = strpos($htmlContent, 'max-width: 600px') !== false;
    
    echo "📄 HTML válido: " . ($tieneDoctype ? "✅ SÍ" : "❌ NO") . "\n";
    echo "🔤 UTF-8 charset: " . ($tieneMetaCharset ? "✅ SÍ" : "❌ NO") . "\n";
    echo "📱 Responsive design: " . ($tieneResponsive ? "✅ SÍ" : "❌ NO") . "\n";

    echo "\n4️⃣ MUESTRA DEL FOOTER GENERADO:\n";
    // Extraer sección del footer para mostrar
    $posicionFooter = strpos($htmlContent, 'Eva Gestiona la medicina');
    if ($posicionFooter !== false) {
        $inicioFooter = max(0, $posicionFooter - 100);
        $finFooter = min(strlen($htmlContent), $posicionFooter + 200);
        $muestraFooter = substr($htmlContent, $inicioFooter, $finFooter - $inicioFooter);
        echo $muestraFooter . "\n";
    }

    echo "\n🎯 RESUMEN FINAL:\n";
    $totalVerificar = 11;
    $exitosos = 0;
    $exitosos += $tieneLogoHUV ? 1 : 0;
    $exitosos += $tieneAzulHeader ? 1 : 0;
    $exitosos += $tieneAzulSubtitulo ? 1 : 0;
    $exitosos += $tieneRojoFooter ? 1 : 0;
    $exitosos += $tieneEvaGestionaMedicina ? 1 : 0;
    $exitosos += $tieneAñoActual ? 1 : 0;
    $exitosos += $tieneFechaHora ? 1 : 0;
    $exitosos += $tieneTicketId ? 1 : 0;
    $exitosos += $tieneDescripcion ? 1 : 0;
    $exitosos += $tieneEquipoNombre ? 1 : 0;
    $exitosos += $tienePrioridadAlta ? 1 : 0;

    echo "✅ Elementos verificados: $exitosos/$totalVerificar\n";
    echo "📈 Porcentaje completado: " . round(($exitosos/$totalVerificar)*100) . "%\n\n";

    if ($exitosos == $totalVerificar) {
        echo "🎉 ¡CORREO HTML PERFECTO!\n";
        echo "🏥 Incluye logo, colores y footer del Hospital\n";
        echo "📧 Listo para envío en producción\n";
    } else {
        echo "⚠️ Algunos elementos necesitan revisión\n";
    }

} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
}

echo "\n🏁 FIN DE LA VERIFICACIÓN\n";
