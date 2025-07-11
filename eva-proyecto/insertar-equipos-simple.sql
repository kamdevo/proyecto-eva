INSERT INTO equipos (
    name, code, serial, marca, modelo, descripcion,
    servicio_id, area_id, estadoequipo_id, cbiomedica_id, criesgo_id, propietario_id,
    fuente_id, tecnologia_id, frecuencia_id, tadquisicion_id, invima_id, baja_id, orden_compra_id,
    tipo_id, status, fecha_ad, vida_util, costo, garantia, v1, v2, v3, plan,
    necesidad_id, guia_id, manual_id, disponibilidad_id
) VALUES 
(
    'Monitor de Signos Vitales Philips', 'MSV-001', 'PHL-MSV-2024-001', 'Philips', 'IntelliVue MX40',
    'Monitor portátil de signos vitales con capacidad de monitoreo continuo',
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, NOW(), 10, 15000.00, 24, 110, 220, 0, 1, 1, 1, 1, 1
),
(
    'Ventilador Mecánico Hamilton', 'VM-002', 'HAM-VM-2024-002', 'Hamilton Medical', 'HAMILTON-C3',
    'Ventilador mecánico para soporte respiratorio en cuidados intensivos',
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, NOW(), 15, 45000.00, 36, 110, 220, 0, 1, 1, 1, 1, 1
);
