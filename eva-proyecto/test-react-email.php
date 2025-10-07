<?php

echo "🧪 Probando React Email con datos de demostración...\n\n";

// Datos de prueba para preventivo
$preventivo_data = [
    'preventivo' => [
        'id' => 123,
        'fecha_mantenimiento' => '2024-10-03 15:30:00',
        'observacion' => 'Equipo requiere calibración urgente. Se detectó desviación en las mediciones.',
        'servicio_nombre' => 'RADIOLOGÍA',
        'area_nombre' => 'Diagnóstico por Imágenes',
        'equipo_id' => 456,
        'equipo_nombre' => 'Rayos X Portátil',
        'equipo_marca' => 'Siemens',
        'equipo_modelo' => 'MobileDiagnost wDR',
        'equipo_codigo' => 'RX-001-HUV',
        'equipo_serie' => 'SN123456789'
    ]
];

// Datos de prueba para ticket
$ticket_data = [
    'ticket' => [
        'id' => 789,
        'descripcion' => 'Falla en el sistema de refrigeración del equipo de resonancia magnética',
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
    ]
];

// Datos de prueba para test email
$test_data = [
    'email' => 'camilomoralesyk@gmail.com',
    'fecha' => date('d/m/Y H:i:s')
];

// Función para probar React Email
function testReactEmail($template, $data, $description) {
    echo "📧 Probando: $description\n";
    
    // Crear archivo temporal con datos
    $tempFile = tempnam(sys_get_temp_dir(), 'email_test_');
    file_put_contents($tempFile, json_encode($data));
    
    // Comando para renderizar usando React Email desde el directorio independiente
    $emailsPath = __DIR__ . '/emails';
    $command = "cd \"$emailsPath\" && node render.mjs $template";
    
    echo "🔄 Ejecutando: $command\n";
    
    // Ejecutar comando
    $output = shell_exec($command . ' 2>&1');
    $exitCode = 0;
    
    // Limpiar archivo temporal
    unlink($tempFile);
    
    if ($output && strpos($output, '<!DOCTYPE html') !== false) {
        echo "✅ Éxito: HTML generado correctamente\n";
        echo "📏 Tamaño: " . strlen($output) . " caracteres\n";
        
        // Guardar HTML para inspección
        $outputFile = __DIR__ . "/test_output_{$template}.html";
        file_put_contents($outputFile, $output);
        echo "💾 Guardado en: $outputFile\n";
        
        return true;
    } else {
        echo "❌ Error: No se pudo generar HTML\n";
        echo "📄 Output: $output\n";
        return false;
    }
}

// Probar cada template
echo "🚀 Iniciando pruebas de React Email...\n\n";

$tests = [
    ['test-email', $test_data, 'Email de prueba'],
    ['repuesto-pendiente', $preventivo_data, 'Email de repuesto pendiente'],
    ['nuevo-ticket', $ticket_data, 'Email de nuevo ticket']
];

$passed = 0;
$total = count($tests);

foreach ($tests as $test) {
    if (testReactEmail($test[0], $test[1], $test[2])) {
        $passed++;
    }
    echo "\n" . str_repeat('-', 50) . "\n\n";
}

echo "📊 Resultados finales:\n";
echo "✅ Pasaron: $passed/$total\n";
echo "❌ Fallaron: " . ($total - $passed) . "/$total\n\n";

if ($passed === $total) {
    echo "🎉 ¡Todas las pruebas pasaron! React Email está funcionando correctamente.\n";
} else {
    echo "⚠️ Algunas pruebas fallaron. Revisa la configuración de React Email.\n";
}

echo "\n📝 NOTA: Los archivos HTML generados están guardados como test_output_*.html\n";
echo "   Puedes abrirlos en un navegador para ver cómo se ven los correos.\n";

?>
