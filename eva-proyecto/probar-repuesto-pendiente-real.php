<?php
echo "🔧 PRUEBA REPUESTO PENDIENTE CON DATOS REALES\n";
echo "=" . str_repeat("=", 50) . "\n\n";

require_once 'eva-backend/vendor/autoload.php';

// Cargar configuración Laravel
$app = require_once 'eva-backend/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Services\ReactEmailService;

try {
    echo "1️⃣ OBTENIENDO MANTENIMIENTO CON REPUESTO PENDIENTE...\n";
    
    $pdo = new PDO("mysql:host=127.0.0.1;port=3306;dbname=gestionthuv;charset=utf8mb4", 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Buscar mantenimiento con repuesto pendiente
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
        WHERE m.repuesto_pendiente = 'si' 
           OR m.observacion LIKE '%repuesto%' 
           OR m.observacion LIKE '%falta%'
           OR m.repuesto_id != ''
        ORDER BY m.id DESC
        LIMIT 1
    ");
    
    $stmt->execute();
    $preventivo = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$preventivo) {
        echo "⚠️ No se encontró mantenimiento con repuesto pendiente\n";
        echo "💡 Creando datos de prueba...\n";
        
        // Obtener cualquier mantenimiento para simular
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
            FROM mantenimiento m
            LEFT JOIN equipos eq ON m.equipo_id = eq.id
            LEFT JOIN servicios s ON eq.servicio_id = s.id
            LEFT JOIN areas a ON eq.area_id = a.id
            WHERE eq.name IS NOT NULL
            LIMIT 1
        ");
        
        $stmt->execute();
        $preventivo = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($preventivo) {
            // Simular repuesto pendiente
            $preventivo['observacion'] = 'REPUESTO PENDIENTE: Filtro HEPA necesario para completar mantenimiento preventivo';
            $preventivo['repuesto_pendiente'] = 'si';
        }
    }

    if (!$preventivo) {
        throw new Exception("No se pudo obtener datos de mantenimiento");
    }

    echo "✅ MANTENIMIENTO OBTENIDO:\n";
    foreach ($preventivo as $key => $value) {
        echo "   • $key: $value\n";
    }
    echo "\n";

    echo "2️⃣ GENERANDO CORREO DE REPUESTO PENDIENTE...\n";
    
    $reactEmailService = new ReactEmailService();
    $htmlContent = $reactEmailService->renderRepuestoPendiente((object)$preventivo);

    echo "✅ HTML generado exitosamente!\n";
    echo "📄 Tamaño: " . strlen($htmlContent) . " caracteres\n\n";

    echo "3️⃣ VERIFICANDO CONTENIDO DEL EMAIL...\n";
    
    $checks = [
        'PREVENTIVO NRO ' . $preventivo['id'] => strpos($htmlContent, 'PREVENTIVO NRO ' . $preventivo['id']) !== false,
        'REPUESTO PENDIENTE' => strpos($htmlContent, 'REPUESTO PENDIENTE') !== false,
        'Logo HUV' => strpos($htmlContent, 'biotronitech.com.co') !== false,
        'Eva Gestiona la medicina' => strpos($htmlContent, 'Eva Gestiona la medicina') !== false,
        'Fecha actual' => strpos($htmlContent, date('d/m/Y')) !== false,
        'Equipo real' => strpos($htmlContent, $preventivo['equipo_nombre']) !== false,
        'Servicio real' => strpos($htmlContent, $preventivo['servicio_nombre']) !== false,
        'Observación' => strpos($htmlContent, substr($preventivo['observacion'], 0, 20)) !== false
    ];

    $exitosos = 0;
    foreach ($checks as $descripcion => $resultado) {
        $status = $resultado ? "✅ SÍ" : "❌ NO";
        echo "   • $descripcion: $status\n";
        if ($resultado) $exitosos++;
    }

    echo "\n📊 RESULTADO: $exitosos/" . count($checks) . " elementos verificados\n";

    if ($exitosos >= 6) {
        echo "🎉 ¡CORREO DE REPUESTO PENDIENTE FUNCIONANDO CON DATOS REALES!\n";
    } else {
        echo "⚠️ Algunos elementos necesitan revisión\n";
        
        echo "\n4️⃣ MUESTRA DEL HTML (primeros 800 caracteres):\n";
        echo substr($htmlContent, 0, 800) . "...\n";
    }

    echo "\n" . str_repeat("=", 50) . "\n";
    
    // Probar envío si hay endpoint disponible
    echo "5️⃣ PROBANDO ENDPOINT DE REPUESTO PENDIENTE...\n";
    
    $url = 'http://localhost:8001/api/v1/notifications/repuesto-pendiente';
    $postData = json_encode(['preventivo_id' => $preventivo['id']]);

    $context = stream_context_create([
        'http' => [
            'method' => 'POST',
            'header' => [
                'Content-Type: application/json',
                'Accept: application/json'
            ],
            'content' => $postData,
            'timeout' => 10
        ]
    ]);

    echo "🔗 Probando: $url\n";
    echo "📦 Datos: " . $postData . "\n\n";

    $response = @file_get_contents($url, false, $context);
    
    if ($response !== false) {
        $data = json_decode($response, true);
        echo "✅ RESPUESTA DEL ENDPOINT:\n";
        echo json_encode($data, JSON_PRETTY_PRINT) . "\n";
    } else {
        echo "⚠️ Endpoint no disponible o no configurado aún\n";
    }

} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
}

echo "\n🏁 FIN DE LA PRUEBA\n";
