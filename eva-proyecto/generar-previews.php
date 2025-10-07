<?php

echo "🎨 Generando previews HTML de los correos EVA...\n\n";

// Función para generar HTML con el diseño real del hospital
function generarHTMLCorreo($tipo, $datos) {
    $fecha = date('d/m/Y H:i:s');
    
    switch ($tipo) {
        case 'repuesto-pendiente':
            return generarRepuestoPendienteHTML($datos);
        case 'nuevo-ticket':
            return generarNuevoTicketHTML($datos);
        case 'test-email':
            return generarTestEmailHTML($datos);
        default:
            return '';
    }
}

function generarRepuestoPendienteHTML($preventivo) {
    return '<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Notificación de Repuesto Pendiente - Preventivo #' . $preventivo['id'] . '</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background-color: #70bbd9; padding: 30px 20px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: bold; }
        .subtitle { background-color: #5aa9c9; padding: 15px 20px; text-align: center; }
        .subtitle p { color: #ffffff; font-size: 16px; font-style: italic; margin: 0; }
        .content { padding: 30px 20px; background-color: #ffffff; }
        .section-title { color: #333333; font-size: 16px; font-weight: bold; margin: 20px 0 10px 0; padding-bottom: 5px; border-bottom: 2px solid #70bbd9; }
        .info-row { padding: 8px 0; }
        .info-label { color: #333333; font-weight: bold; display: inline-block; width: 180px; }
        .info-value { color: #666666; }
        .observation-box { background-color: #fff9e6; border-left: 4px solid #ffc107; padding: 15px; margin: 15px 0; }
        .repuesto-box { background-color: #ffebee; border-left: 4px solid #ee4c50; padding: 15px; margin: 15px 0; }
        .equipment-info { padding: 5px 0; line-height: 1.6; color: #666666; }
        .footer { background-color: #ee4c50; padding: 20px; text-align: center; color: #ffffff; }
        .footer p { margin: 5px 0; font-size: 12px; }
        .social-links { margin-top: 15px; }
        .social-links a { color: #ffffff; text-decoration: none; margin: 0 10px; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>PREVENTIVO NRO ' . $preventivo['id'] . '</h1>
        </div>
        <div class="subtitle">
            <p>Eva Gestiona la tecnología</p>
        </div>
        <div class="content">
            <div class="info-row">
                <span class="info-label">Código de preventivo:</span>
                <span class="info-value">' . $preventivo['id'] . '</span>
            </div>
            <div class="info-row">
                <span class="info-label">Fecha de ejecución:</span>
                <span class="info-value">' . $preventivo['fecha_mantenimiento'] . '</span>
            </div>
            
            ' . ($preventivo['observacion'] ? '
            <div class="observation-box">
                <h3 class="section-title" style="border: none; margin: 0 0 10px 0;">Observación:</h3>
                <p style="margin: 0; color: #666;">' . $preventivo['observacion'] . '</p>
            </div>
            ' : '') . '
            
            <h3 class="section-title">Ubicación de referencia:</h3>
            <p class="info-value">' . $preventivo['servicio_nombre'] . '</p>
            ' . ($preventivo['area_nombre'] ? '
            <div class="info-row">
                <span class="info-label">Área:</span>
                <span class="info-value">' . $preventivo['area_nombre'] . '</span>
            </div>
            ' : '') . '
            
            <h3 class="section-title">Información del equipo:</h3>
            <p class="equipment-info">• <strong>Id del equipo en el sistema:</strong> ' . $preventivo['equipo_id'] . '</p>
            <p class="equipment-info">• <strong>Nombre del equipo:</strong> ' . $preventivo['equipo_nombre'] . '</p>
            <p class="equipment-info">• <strong>Marca del equipo:</strong> ' . $preventivo['equipo_marca'] . '</p>
            <p class="equipment-info">• <strong>Modelo del equipo:</strong> ' . $preventivo['equipo_modelo'] . '</p>
            <p class="equipment-info">• <strong>Activo fijo del equipo:</strong> ' . $preventivo['equipo_codigo'] . '</p>
            <p class="equipment-info">• <strong>Serie del equipo:</strong> ' . $preventivo['equipo_serie'] . '</p>
            
            <div class="repuesto-box">
                <h3 style="border: none; margin: 0 0 10px 0; color: #333333; font-size: 16px; font-weight: bold;">Repuesto faltante:</h3>
                <p style="margin: 0; color: #333; font-weight: bold;">' . $preventivo['observacion'] . '</p>
            </div>
        </div>
        <div class="footer">
            <p><strong>Electromedicina, 2019 - Hospital Universitario del valle</strong></p>
            <div class="social-links">
                <a href="https://twitter.com/HUValleCali">Twitter</a>
                <a href="https://www.facebook.com/HUValleCali">Facebook</a>
            </div>
        </div>
    </div>
</body>
</html>';
}

function generarNuevoTicketHTML($ticket) {
    $prioridad = $ticket['prioridad'];
    $prioridadTexto = $prioridad == 3 ? 'ALTA' : ($prioridad == 2 ? 'MEDIA' : 'BAJA');
    $prioridadColor = $prioridad == 3 ? '#ee4c50' : ($prioridad == 2 ? '#ffc107' : '#4caf50');
    $prioridadBg = $prioridad == 3 ? '#ffebee' : ($prioridad == 2 ? '#fff9e6' : '#e8f5e9');
    
    return '<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Creación de Ticket Nro ' . $ticket['id'] . '</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background-color: #70bbd9; padding: 30px 20px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: bold; }
        .subtitle { background-color: #5aa9c9; padding: 15px 20px; text-align: center; }
        .subtitle p { color: #ffffff; font-size: 16px; font-style: italic; margin: 0; }
        .content { padding: 30px 20px; background-color: #ffffff; }
        .section-title { color: #333333; font-size: 16px; font-weight: bold; margin: 20px 0 10px 0; padding-bottom: 5px; border-bottom: 2px solid #70bbd9; }
        .info-row { padding: 8px 0; }
        .info-label { color: #333333; font-weight: bold; display: inline-block; width: 180px; }
        .info-value { color: #666666; }
        .description-box { background-color: #f8f9fa; border-left: 4px solid #70bbd9; padding: 15px; margin: 15px 0; }
        .equipment-info { padding: 5px 0; line-height: 1.6; color: #666666; }
        .priority-box { display: inline-block; padding: 5px 15px; border-radius: 4px; font-weight: bold; margin: 10px 0; background-color: ' . $prioridadBg . '; color: ' . $prioridadColor . '; }
        .footer { background-color: #ee4c50; padding: 20px; text-align: center; color: #ffffff; }
        .footer p { margin: 5px 0; font-size: 12px; }
        .social-links { margin-top: 15px; }
        .social-links a { color: #ffffff; text-decoration: none; margin: 0 10px; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>TICKET NRO ' . $ticket['id'] . '</h1>
        </div>
        <div class="subtitle">
            <p>Eva Gestiona la tecnología</p>
        </div>
        <div class="content">
            <div class="info-row">
                <span class="info-label">Asunto:</span>
                <span class="info-value">' . $ticket['descripcion'] . '</span>
            </div>
            
            <div class="description-box">
                <h3 style="border: none; margin: 0 0 10px 0; color: #333333; font-size: 16px; font-weight: bold;">Descripción:</h3>
                <p style="margin: 0; color: #666;">' . $ticket['descripcion'] . '</p>
                <div style="margin-top: 10px;">
                    <span class="info-label">Fecha de registro:</span>
                    <span class="info-value">' . $ticket['fecha_inicio'] . '</span>
                </div>
            </div>
            
            <h3 class="section-title">Ubicación de referencia:</h3>
            <p class="info-value">' . $ticket['servicio_nombre'] . '</p>
            ' . ($ticket['area_nombre'] ? '
            <div class="info-row">
                <span class="info-label">Área:</span>
                <span class="info-value">' . $ticket['area_nombre'] . '</span>
            </div>
            ' : '') . '
            
            <h3 class="section-title">Información del equipo:</h3>
            <p class="equipment-info">• <strong>Id del equipo en el sistema:</strong> ' . $ticket['equipo_id'] . '</p>
            <p class="equipment-info">• <strong>Nombre del equipo:</strong> ' . $ticket['equipo_nombre'] . '</p>
            <p class="equipment-info">• <strong>Marca del equipo:</strong> ' . $ticket['equipo_marca'] . '</p>
            <p class="equipment-info">• <strong>Modelo del equipo:</strong> ' . $ticket['equipo_modelo'] . '</p>
            <p class="equipment-info">• <strong>Activo fijo del equipo:</strong> ' . $ticket['equipo_codigo'] . '</p>
            <p class="equipment-info">• <strong>Serie del equipo:</strong> ' . $ticket['equipo_serie'] . '</p>
            <p class="equipment-info">• <strong>Prioridad:</strong> <span class="priority-box">' . $prioridadTexto . '</span></p>
            
            <h3 class="section-title">Información del Solicitante:</h3>
            <p class="equipment-info">• <strong>Nombre:</strong> ' . $ticket['reportante_nombre'] . '</p>
        </div>
        <div class="footer">
            <p><strong>Electromedicina, 2019 - Hospital Universitario del valle</strong></p>
            <div class="social-links">
                <a href="https://twitter.com/HUValleCali">Twitter</a>
                <a href="https://www.facebook.com/HUValleCali">Facebook</a>
            </div>
        </div>
    </div>
</body>
</html>';
}

function generarTestEmailHTML($datos) {
    return '<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Prueba Sistema EVA - Hospital Universitario del Valle</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background-color: #70bbd9; padding: 30px 20px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: bold; }
        .subtitle { background-color: #5aa9c9; padding: 15px 20px; text-align: center; }
        .subtitle p { color: #ffffff; font-size: 16px; font-style: italic; margin: 0; }
        .content { padding: 30px 20px; background-color: #ffffff; }
        .success-box { background-color: #e8f5e9; border-left: 4px solid #4caf50; padding: 20px; margin: 20px 0; border-radius: 4px; }
        .info-section { margin: 20px 0; padding: 15px; background-color: #f8f9fa; border-radius: 4px; }
        .info-row { padding: 5px 0; color: #666666; }
        .center-text { text-align: center; margin-top: 30px; color: #666; }
        .footer { background-color: #ee4c50; padding: 20px; text-align: center; color: #ffffff; }
        .footer p { margin: 5px 0; font-size: 12px; }
        .social-links { margin-top: 15px; }
        .social-links a { color: #ffffff; text-decoration: none; margin: 0 10px; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧪 PRUEBA DE CORREO</h1>
        </div>
        <div class="subtitle">
            <p>Eva Gestiona la tecnología</p>
        </div>
        <div class="content">
            <div class="success-box">
                <h3 style="color: #2e7d32; margin: 0 0 10px 0; font-size: 18px;">✅ ¡Configuración Exitosa!</h3>
                <p style="color: #388e3c; margin: 0; line-height: 1.6;">
                    Si recibes este mensaje, la configuración de correo del Sistema EVA está funcionando correctamente.
                </p>
            </div>
            
            <div class="info-section">
                <h4 style="color: #333333; margin: 0 0 10px 0; font-size: 16px;">📋 Información del Sistema:</h4>
                <p class="info-row">• <strong>Sistema:</strong> EVA - Gestión Hospitalaria</p>
                <p class="info-row">• <strong>Servidor:</strong> Hospital Universitario del Valle</p>
                <p class="info-row">• <strong>Fecha:</strong> ' . date('d/m/Y H:i:s') . '</p>
                <p class="info-row">• <strong>Destinatario:</strong> ' . $datos['email'] . '</p>
            </div>
            
            <div class="info-section">
                <h4 style="color: #333333; margin: 0 0 10px 0; font-size: 16px;">🎨 Características del Diseño:</h4>
                <p class="info-row">• <strong>Header:</strong> Azul institucional (#70bbd9)</p>
                <p class="info-row">• <strong>Footer:</strong> Rojo institucional (#ee4c50)</p>
                <p class="info-row">• <strong>Tipografía:</strong> Arial, sans-serif</p>
                <p class="info-row">• <strong>Responsive:</strong> Compatible con todos los dispositivos</p>
                <p class="info-row">• <strong>Tecnología:</strong> React Email + JSX</p>
            </div>
            
            <p class="center-text">
                <strong>El sistema de notificaciones está listo para usar.</strong>
            </p>
        </div>
        <div class="footer">
            <p><strong>Electromedicina, 2019 - Hospital Universitario del valle</strong></p>
            <div class="social-links">
                <a href="https://twitter.com/HUValleCali">Twitter</a>
                <a href="https://www.facebook.com/HUValleCali">Facebook</a>
            </div>
        </div>
    </div>
</body>
</html>';
}

// Datos de prueba
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

$testData = [
    'email' => 'camilomoralesyk@gmail.com',
    'fecha' => date('d/m/Y H:i:s')
];

// Generar archivos HTML
$correos = [
    ['repuesto-pendiente', $preventivo, 'Email de Repuesto Pendiente'],
    ['nuevo-ticket', $ticket, 'Email de Nuevo Ticket'],
    ['test-email', $testData, 'Email de Prueba']
];

echo "🚀 Generando previews HTML...\n\n";

foreach ($correos as $correo) {
    $tipo = $correo[0];
    $datos = $correo[1];
    $descripcion = $correo[2];
    
    echo "📧 Generando: $descripcion\n";
    
    $html = generarHTMLCorreo($tipo, $datos);
    $archivo = __DIR__ . "/preview_$tipo.html";
    
    if (file_put_contents($archivo, $html)) {
        echo "✅ Éxito: Archivo generado\n";
        echo "📁 Ubicación: $archivo\n";
        echo "🌐 Para ver: Abre el archivo en tu navegador\n";
    } else {
        echo "❌ Error: No se pudo generar el archivo\n";
    }
    
    echo "\n" . str_repeat('-', 50) . "\n\n";
}

echo "🎉 ¡Previews generados exitosamente!\n\n";
echo "📋 ARCHIVOS GENERADOS:\n";
echo "• preview_repuesto-pendiente.html - Email de preventivo\n";
echo "• preview_nuevo-ticket.html - Email de ticket\n";
echo "• preview_test-email.html - Email de prueba\n\n";

echo "🌐 INSTRUCCIONES:\n";
echo "1. Abre cualquiera de los archivos HTML en tu navegador\n";
echo "2. Verás exactamente cómo se ve el correo con el diseño del hospital\n";
echo "3. Los colores y estilos son idénticos a los que se enviarán por correo\n";
echo "4. Puedes usar estos archivos para mostrar el diseño a otros\n\n";

echo "✨ Previews listos para visualizar.\n";

?>
