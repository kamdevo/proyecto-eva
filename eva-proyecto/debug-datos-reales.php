<?php
echo "🔍 DEBUG - DATOS REALES EN CORREOS\n";
echo "=" . str_repeat("=", 50) . "\n\n";

require_once 'eva-backend/vendor/autoload.php';

// Cargar configuración Laravel
$app = require_once 'eva-backend/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Services\ReactEmailService;

try {
    echo "1️⃣ OBTENIENDO DATOS REALES DE LA BD...\n";
    
    // Conectar directamente a BD
    $pdo = new PDO("mysql:host=127.0.0.1;port=3306;dbname=gestionthuv;charset=utf8mb4", 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Obtener ticket 13464 con JOIN como lo hace el endpoint
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
    $ticketReal = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$ticketReal) {
        throw new Exception("Ticket 13464 no encontrado");
    }

    echo "✅ TICKET REAL OBTENIDO:\n";
    foreach ($ticketReal as $key => $value) {
        echo "   • $key: $value\n";
    }
    echo "\n";

    echo "2️⃣ CREANDO OBJETO TICKET COMO LO HACE EL ENDPOINT...\n";
    
    // Convertir a objeto como lo hace Laravel DB
    $ticketObject = (object)$ticketReal;
    
    echo "✅ Objeto creado con " . count((array)$ticketObject) . " propiedades\n\n";

    echo "3️⃣ LLAMANDO REACTEMAILSERVICE CON DATOS REALES...\n";
    
    $reactEmailService = new ReactEmailService();
    $htmlContent = $reactEmailService->renderNuevoTicket($ticketObject);

    echo "✅ HTML generado exitosamente!\n";
    echo "📄 Tamaño: " . strlen($htmlContent) . " caracteres\n\n";

    echo "4️⃣ VERIFICANDO DATOS REALES EN EL HTML...\n";
    
    // Verificar datos específicos
    $checks = [
        'ID 13464' => strpos($htmlContent, '13464') !== false,
        'Descripción PRUEBA COMPLETA' => strpos($htmlContent, 'PRUEBA COMPLETA') !== false,
        'Equipo ACELERADOR LINEAL' => strpos($htmlContent, 'ACELERADOR LINEAL') !== false,
        'Marca VARIAN' => strpos($htmlContent, 'VARIAN') !== false,
        'Modelo CLINAC IX' => strpos($htmlContent, 'CLINAC IX') !== false,
        'Servicio RADIOTERAPIA' => strpos($htmlContent, 'RADIOTERAPIA') !== false,
        'Reportante Administrador' => strpos($htmlContent, 'Administrador') !== false,
        'Prioridad ALTA' => strpos($htmlContent, 'ALTA') !== false
    ];

    $exitosos = 0;
    foreach ($checks as $descripcion => $resultado) {
        $status = $resultado ? "✅ SÍ" : "❌ NO";
        echo "   • $descripcion: $status\n";
        if ($resultado) $exitosos++;
    }

    echo "\n📊 RESULTADO: $exitosos/" . count($checks) . " datos reales encontrados\n";

    if ($exitosos === count($checks)) {
        echo "🎉 ¡TODOS LOS DATOS REALES ESTÁN EN EL HTML!\n";
    } else {
        echo "⚠️ FALTAN ALGUNOS DATOS REALES\n";
        
        echo "\n5️⃣ MUESTRA DEL HTML GENERADO (primeros 1000 caracteres):\n";
        echo substr($htmlContent, 0, 1000) . "...\n";
    }

    echo "\n" . str_repeat("=", 50) . "\n";

    // AHORA PROBAR REPUESTO PENDIENTE
    echo "🔧 PROBANDO REPUESTO PENDIENTE...\n\n";

    // Obtener un mantenimiento real
    $stmt = $pdo->prepare("
        SELECT 
            m.id,
            m.fecha_mantenimiento,
            m.observacion,
            eq.name as equipo_nombre,
            eq.code as equipo_codigo,
            eq.marca as equipo_marca,
            eq.modelo as equipo_modelo,
            eq.serial as equipo_serie,
            s.name as servicio_nombre,
            a.name as area_nombre
        FROM mantenimientos m
        LEFT JOIN equipos eq ON m.equipo_id = eq.id
        LEFT JOIN servicios s ON eq.servicio_id = s.id
        LEFT JOIN areas a ON eq.area_id = a.id
        WHERE m.observacion LIKE '%repuesto%' OR m.observacion LIKE '%falta%'
        LIMIT 1
    ");
    
    $stmt->execute();
    $preventivo = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($preventivo) {
        echo "✅ PREVENTIVO CON REPUESTO ENCONTRADO:\n";
        foreach ($preventivo as $key => $value) {
            echo "   • $key: $value\n";
        }
        
        $htmlRepuesto = $reactEmailService->renderRepuestoPendiente((object)$preventivo);
        echo "\n✅ HTML de repuesto generado: " . strlen($htmlRepuesto) . " caracteres\n";
        
        $tieneRepuestoPendiente = strpos($htmlRepuesto, 'REPUESTO PENDIENTE') !== false;
        $tieneObservacion = strpos($htmlRepuesto, $preventivo['observacion'] ?? '') !== false;
        
        echo "   • Contiene 'REPUESTO PENDIENTE': " . ($tieneRepuestoPendiente ? "✅ SÍ" : "❌ NO") . "\n";
        echo "   • Contiene observación real: " . ($tieneObservacion ? "✅ SÍ" : "❌ NO") . "\n";
    } else {
        echo "⚠️ No se encontró preventivo con repuesto pendiente\n";
    }

} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
}

echo "\n🏁 FIN DEL DEBUG\n";
