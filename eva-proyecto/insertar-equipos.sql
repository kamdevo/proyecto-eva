-- Script SQL directo para insertar equipos de prueba

-- Insertar equipos médicos de prueba directamente
INSERT INTO equipos (
    name, 
    code, 
    serial, 
    marca, 
    modelo, 
    descripcion,
    servicio_id,
    area_id,
    estadoequipo_id,
    cbiomedica_id,
    criesgo_id,
    propietario_id,
    tipo_id,
    status,
    fecha_ad,
    fecha_instalacion,
    vida_util,
    costo,
    garantia,
    created_at
) VALUES 
(
    'Monitor de Signos Vitales Philips',
    'MSV-001', 
    'PHL-MSV-2024-001',
    'Philips',
    'IntelliVue MX40',
    'Monitor portátil de signos vitales con capacidad de monitoreo continuo',
    1, -- servicio_id (usar el primer servicio disponible)
    1, -- area_id (usar la primera área disponible)
    1, -- estadoequipo_id (usar el primer estado disponible)
    1, -- cbiomedica_id (usar la primera clasificación disponible)
    1, -- criesgo_id (usar el primer riesgo disponible)
    1, -- propietario_id (usar el primer propietario disponible)
    1, -- tipo_id (equipo médico)
    1, -- status (activo)
    NOW(),
    DATE_SUB(NOW(), INTERVAL 30 DAY),
    10,
    15000.00,
    24,
    NOW()
),
(
    'Ventilador Mecánico Hamilton',
    'VM-002',
    'HAM-VM-2024-002', 
    'Hamilton Medical',
    'HAMILTON-C3',
    'Ventilador mecánico para soporte respiratorio en cuidados intensivos',
    1, -- servicio_id
    1, -- area_id
    1, -- estadoequipo_id
    1, -- cbiomedica_id
    1, -- criesgo_id
    1, -- propietario_id
    1, -- tipo_id (equipo médico)
    1, -- status (activo)
    NOW(),
    DATE_SUB(NOW(), INTERVAL 15 DAY),
    15,
    45000.00,
    36,
    NOW()
);
