<?php

try {
    $conn = new PDO("mysql:host=localhost;dbname=gestionthuv;charset=utf8mb4", 'root', '');
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "=== CÁLCULO DE COBERTURA DE GUÍAS RÁPIDAS ===\n\n";
    
    // 1. Cumplen criterios (sin guía)
    $query1 = "
        SELECT COUNT(*) as total
        FROM equipos
        WHERE tipo_id = 1
        AND estadoequipo_id NOT IN (5,6,9,10,14,16)
        AND criesgo_id IN (2,3,4)
        AND name NOT IN (
            'APLICADOR DE ULTRASONIDO','APLICADOR DEL LASER','BANDA DE ESFUERZO',
            'CICLOERGÓMETRO CUERPO COMPLETO','CICLOERGÓMETRO MIEMBROS INFERIORES',
            'CICLOERGÓMETRO MIEMBROS SUPERIORES','EMS','EQUIPO DE BRAQUITERAPIA',
            'Esterilizador Peroxido de Hidrogeno','ESTUFA BK','FLUJOMETRO','FLUJÓMETRO',
            'Grabador de video','GRUA','HIDROCOLLATOR COLD PACK',
            'HIDROCOLLATOR HOT PACK HEATER','HIDROCOLLATOR MASTER UNIT','HORNO DE SECADO',
            'Humidificador','MICROPIPETA','MICROPIPETA FIJA','MONITOR DE TORRE DE LAPAROSCOPIA',
            'MONITOR(Pantalla)','MOTOR QUIRURGICO ODONTOLOGICO - NSK','NEFROSCOPIO',
            'NEGATOSCOPIO','PANTALLA LCD','PANTALLA PLANA 19','PIPETA','PIPETA MULTICANAL',
            'PIPETEADOR DILUTOR','PRO TENS','PROYECTOR','PULSIOXIMETRO DE DEDO',
            'SILLÓN GINECOLÓGICO','SUCCIONADOR DE LECHE','TALLIMETRO','TANQUE DE HIDROMASAJE',
            'TANQUE DE HIDROMASAJE MI','TANQUE DE HIDROMASAJE MS','TANQUE REMOLINO','TENS',
            'Tensiometro de pared','TERMOHIGROMETRO','TERMOHIGRÓMETRO','TERMÒHIGROMETRO',
            'TERMOHIGROMETRO CON BULBO EXTENDIDO','TERMOHIGROMETRO DIGITAL',
            'TERMOHIGROMETRO DIGITAL SIN SONDA','TERMOMETRO','TERMÒMETRO','TERMOMETRO DIGITAL',
            'TRANSMITTER','VACUOMETRO','VAPORIZADOR','VORTEX','VORTEX (AGITADOR DE MAZZINI)'
        )
    ";
    
    $stmt = $conn->query($query1);
    $cumplenCriterios = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
    
    echo "1️⃣  Cumplen criterios: $cumplenCriterios\n";
    echo "    (Biomédicos + filtros de inclusión/exclusión)\n\n";
    
    // 2. Cumplen criterios CON guía
    $query2 = "
        SELECT COUNT(*) as total
        FROM equipos
        WHERE tipo_id = 1
        AND guia_id != 0
        AND estadoequipo_id NOT IN (5,6,9,10,14,16)
        AND criesgo_id IN (2,3,4)
        AND name NOT IN (
            'APLICADOR DE ULTRASONIDO','APLICADOR DEL LASER','BANDA DE ESFUERZO',
            'CICLOERGÓMETRO CUERPO COMPLETO','CICLOERGÓMETRO MIEMBROS INFERIORES',
            'CICLOERGÓMETRO MIEMBROS SUPERIORES','EMS','EQUIPO DE BRAQUITERAPIA',
            'Esterilizador Peroxido de Hidrogeno','ESTUFA BK','FLUJOMETRO','FLUJÓMETRO',
            'Grabador de video','GRUA','HIDROCOLLATOR COLD PACK',
            'HIDROCOLLATOR HOT PACK HEATER','HIDROCOLLATOR MASTER UNIT','HORNO DE SECADO',
            'Humidificador','MICROPIPETA','MICROPIPETA FIJA','MONITOR DE TORRE DE LAPAROSCOPIA',
            'MONITOR(Pantalla)','MOTOR QUIRURGICO ODONTOLOGICO - NSK','NEFROSCOPIO',
            'NEGATOSCOPIO','PANTALLA LCD','PANTALLA PLANA 19','PIPETA','PIPETA MULTICANAL',
            'PIPETEADOR DILUTOR','PRO TENS','PROYECTOR','PULSIOXIMETRO DE DEDO',
            'SILLÓN GINECOLÓGICO','SUCCIONADOR DE LECHE','TALLIMETRO','TANQUE DE HIDROMASAJE',
            'TANQUE DE HIDROMASAJE MI','TANQUE DE HIDROMASAJE MS','TANQUE REMOLINO','TENS',
            'Tensiometro de pared','TERMOHIGROMETRO','TERMOHIGRÓMETRO','TERMÒHIGROMETRO',
            'TERMOHIGROMETRO CON BULBO EXTENDIDO','TERMOHIGROMETRO DIGITAL',
            'TERMOHIGROMETRO DIGITAL SIN SONDA','TERMOMETRO','TERMÒMETRO','TERMOMETRO DIGITAL',
            'TRANSMITTER','VACUOMETRO','VAPORIZADOR','VORTEX','VORTEX (AGITADOR DE MAZZINI)'
        )
    ";
    
    $stmt = $conn->query($query2);
    $cumplenConGuia = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
    
    echo "2️⃣  Cumplen criterios con guía: $cumplenConGuia\n";
    echo "    (Los mismos criterios + guia_id != 0)\n\n";
    
    // 3. Cobertura
    $cobertura = $cumplenCriterios > 0 ? round(($cumplenConGuia / $cumplenCriterios) * 100, 2) : 0;
    
    echo "3️⃣  Cobertura de Guías Rápidas: {$cobertura}%\n";
    echo "    Fórmula: ($cumplenConGuia / $cumplenCriterios) × 100\n\n";
    
    echo "========================================\n";
    echo "✅ RESULTADO FINAL:\n";
    echo "   Cumplen criterios: $cumplenCriterios\n";
    echo "   Cumplen criterios con guía: $cumplenConGuia\n";
    echo "   Cobertura: {$cobertura}%\n";
    echo "========================================\n";
    
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
