-- =====================================================
-- SCRIPT DE VERIFICACIÓN DE BASE DE DATOS
-- Sistema de Equipos Biomédicos - Hospital Universitario del Valle
-- =====================================================

-- Verificar existencia de tablas principales
SELECT 'VERIFICANDO EXISTENCIA DE TABLAS' as verificacion;

SELECT 
    TABLE_NAME as tabla,
    TABLE_ROWS as filas,
    CASE 
        WHEN TABLE_NAME IN ('equipos', 'servicios', 'areas', 'propietarios', 'fuentes_alimentacion', 
                           'tecnologias', 'frecuencias_mantenimiento', 'clasificaciones_biomedicas',
                           'clasificaciones_riesgo', 'tipos_adquisicion', 'estados_equipo', 
                           'disponibilidad', 'sedes') 
        THEN '✅ REQUERIDA'
        ELSE '⚠️ ADICIONAL'
    END as estado
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME IN ('equipos', 'servicios', 'areas', 'propietarios', 'fuentes_alimentacion', 
                       'tecnologias', 'frecuencias_mantenimiento', 'clasificaciones_biomedicas',
                       'clasificaciones_riesgo', 'tipos_adquisicion', 'estados_equipo', 
                       'disponibilidad', 'sedes')
ORDER BY TABLE_NAME;

-- Verificar estructura de tabla equipos
SELECT 'VERIFICANDO ESTRUCTURA DE TABLA EQUIPOS' as verificacion;

SELECT 
    COLUMN_NAME as campo,
    DATA_TYPE as tipo,
    IS_NULLABLE as nulo,
    COLUMN_DEFAULT as valor_defecto,
    CASE 
        WHEN COLUMN_KEY = 'PRI' THEN '🔑 PRIMARY'
        WHEN COLUMN_KEY = 'UNI' THEN '🔒 UNIQUE'
        WHEN COLUMN_KEY = 'MUL' THEN '🔗 FOREIGN'
        ELSE ''
    END as clave
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'equipos'
ORDER BY ORDINAL_POSITION;

-- Verificar campos obligatorios en equipos
SELECT 'VERIFICANDO CAMPOS OBLIGATORIOS' as verificacion;

SELECT 
    'name' as campo,
    COUNT(*) as total_registros,
    COUNT(name) as registros_con_valor,
    COUNT(*) - COUNT(name) as registros_nulos,
    CASE WHEN COUNT(*) - COUNT(name) = 0 THEN '✅ OK' ELSE '❌ FALTAN DATOS' END as estado
FROM equipos
UNION ALL
SELECT 
    'serial' as campo,
    COUNT(*) as total_registros,
    COUNT(serial) as registros_con_valor,
    COUNT(*) - COUNT(serial) as registros_nulos,
    CASE WHEN COUNT(*) - COUNT(serial) = 0 THEN '✅ OK' ELSE '❌ FALTAN DATOS' END as estado
FROM equipos
UNION ALL
SELECT 
    'code' as campo,
    COUNT(*) as total_registros,
    COUNT(code) as registros_con_valor,
    COUNT(*) - COUNT(code) as registros_nulos,
    CASE WHEN COUNT(*) - COUNT(code) = 0 THEN '✅ OK' ELSE '❌ FALTAN DATOS' END as estado
FROM equipos;

-- Verificar unicidad de campos clave
SELECT 'VERIFICANDO UNICIDAD DE CAMPOS CLAVE' as verificacion;

SELECT 
    'code' as campo,
    COUNT(*) as total,
    COUNT(DISTINCT code) as unicos,
    COUNT(*) - COUNT(DISTINCT code) as duplicados,
    CASE WHEN COUNT(*) = COUNT(DISTINCT code) THEN '✅ ÚNICO' ELSE '❌ DUPLICADOS' END as estado
FROM equipos WHERE code IS NOT NULL AND code != ''
UNION ALL
SELECT 
    'serial' as campo,
    COUNT(*) as total,
    COUNT(DISTINCT serial) as unicos,
    COUNT(*) - COUNT(DISTINCT serial) as duplicados,
    CASE WHEN COUNT(*) = COUNT(DISTINCT serial) THEN '✅ ÚNICO' ELSE '❌ DUPLICADOS' END as estado
FROM equipos WHERE serial IS NOT NULL AND serial != ''
UNION ALL
SELECT 
    'codigo_antiguo' as campo,
    COUNT(*) as total,
    COUNT(DISTINCT codigo_antiguo) as unicos,
    COUNT(*) - COUNT(DISTINCT codigo_antiguo) as duplicados,
    CASE WHEN COUNT(*) = COUNT(DISTINCT codigo_antiguo) THEN '✅ ÚNICO' ELSE '❌ DUPLICADOS' END as estado
FROM equipos WHERE codigo_antiguo IS NOT NULL AND codigo_antiguo != '';

-- Verificar relaciones entre tablas
SELECT 'VERIFICANDO RELACIONES ENTRE TABLAS' as verificacion;

SELECT 
    'equipos -> servicios' as relacion,
    COUNT(e.id) as equipos_total,
    COUNT(s.id) as con_servicio_valido,
    COUNT(e.id) - COUNT(s.id) as sin_servicio,
    CASE WHEN COUNT(e.id) = COUNT(s.id) THEN '✅ OK' ELSE '❌ RELACIONES ROTAS' END as estado
FROM equipos e
LEFT JOIN servicios s ON e.servicio_id = s.id
UNION ALL
SELECT 
    'equipos -> areas' as relacion,
    COUNT(e.id) as equipos_total,
    COUNT(a.id) as con_area_valida,
    COUNT(e.id) - COUNT(a.id) as sin_area,
    CASE WHEN COUNT(e.id) = COUNT(a.id) THEN '✅ OK' ELSE '❌ RELACIONES ROTAS' END as estado
FROM equipos e
LEFT JOIN areas a ON e.area_id = a.id
UNION ALL
SELECT 
    'equipos -> propietarios' as relacion,
    COUNT(e.id) as equipos_total,
    COUNT(p.id) as con_propietario_valido,
    COUNT(e.id) - COUNT(p.id) as sin_propietario,
    CASE WHEN COUNT(e.id) = COUNT(p.id) THEN '✅ OK' ELSE '❌ RELACIONES ROTAS' END as estado
FROM equipos e
LEFT JOIN propietarios p ON e.propietario_id = p.id;

-- Verificar datos en tablas de catálogos
SELECT 'VERIFICANDO DATOS EN CATÁLOGOS' as verificacion;

SELECT 'servicios' as catalogo, COUNT(*) as registros, 
       CASE WHEN COUNT(*) > 0 THEN '✅ CON DATOS' ELSE '❌ VACÍO' END as estado FROM servicios
UNION ALL
SELECT 'areas' as catalogo, COUNT(*) as registros,
       CASE WHEN COUNT(*) > 0 THEN '✅ CON DATOS' ELSE '❌ VACÍO' END as estado FROM areas
UNION ALL
SELECT 'propietarios' as catalogo, COUNT(*) as registros,
       CASE WHEN COUNT(*) > 0 THEN '✅ CON DATOS' ELSE '❌ VACÍO' END as estado FROM propietarios
UNION ALL
SELECT 'fuentes_alimentacion' as catalogo, COUNT(*) as registros,
       CASE WHEN COUNT(*) > 0 THEN '✅ CON DATOS' ELSE '❌ VACÍO' END as estado FROM fuentes_alimentacion
UNION ALL
SELECT 'tecnologias' as catalogo, COUNT(*) as registros,
       CASE WHEN COUNT(*) > 0 THEN '✅ CON DATOS' ELSE '❌ VACÍO' END as estado FROM tecnologias
UNION ALL
SELECT 'frecuencias_mantenimiento' as catalogo, COUNT(*) as registros,
       CASE WHEN COUNT(*) > 0 THEN '✅ CON DATOS' ELSE '❌ VACÍO' END as estado FROM frecuencias_mantenimiento
UNION ALL
SELECT 'clasificaciones_biomedicas' as catalogo, COUNT(*) as registros,
       CASE WHEN COUNT(*) > 0 THEN '✅ CON DATOS' ELSE '❌ VACÍO' END as estado FROM clasificaciones_biomedicas
UNION ALL
SELECT 'clasificaciones_riesgo' as catalogo, COUNT(*) as registros,
       CASE WHEN COUNT(*) > 0 THEN '✅ CON DATOS' ELSE '❌ VACÍO' END as estado FROM clasificaciones_riesgo
UNION ALL
SELECT 'tipos_adquisicion' as catalogo, COUNT(*) as registros,
       CASE WHEN COUNT(*) > 0 THEN '✅ CON DATOS' ELSE '❌ VACÍO' END as estado FROM tipos_adquisicion
UNION ALL
SELECT 'estados_equipo' as catalogo, COUNT(*) as registros,
       CASE WHEN COUNT(*) > 0 THEN '✅ CON DATOS' ELSE '❌ VACÍO' END as estado FROM estados_equipo
UNION ALL
SELECT 'disponibilidad' as catalogo, COUNT(*) as registros,
       CASE WHEN COUNT(*) > 0 THEN '✅ CON DATOS' ELSE '❌ VACÍO' END as estado FROM disponibilidad;

-- Verificar archivos subidos
SELECT 'VERIFICANDO ARCHIVOS SUBIDOS' as verificacion;

SELECT 
    COUNT(*) as total_equipos,
    COUNT(image) as con_imagen,
    COUNT(archivo_hoja_vida) as con_archivo_excel,
    ROUND((COUNT(image) / COUNT(*)) * 100, 2) as porcentaje_imagenes,
    ROUND((COUNT(archivo_hoja_vida) / COUNT(*)) * 100, 2) as porcentaje_archivos
FROM equipos;

-- Verificar fechas lógicas
SELECT 'VERIFICANDO COHERENCIA DE FECHAS' as verificacion;

SELECT 
    COUNT(*) as total_equipos,
    COUNT(CASE WHEN fecha_fabricacion <= fecha_adquisicion THEN 1 END) as fechas_coherentes_fab_adq,
    COUNT(CASE WHEN fecha_adquisicion <= fecha_instalacion THEN 1 END) as fechas_coherentes_adq_inst,
    COUNT(CASE WHEN fecha_instalacion <= fecha_inicio_operacion THEN 1 END) as fechas_coherentes_inst_op,
    CASE 
        WHEN COUNT(*) = COUNT(CASE WHEN fecha_fabricacion <= fecha_adquisicion THEN 1 END) 
             AND COUNT(*) = COUNT(CASE WHEN fecha_adquisicion <= fecha_instalacion THEN 1 END)
             AND COUNT(*) = COUNT(CASE WHEN fecha_instalacion <= fecha_inicio_operacion THEN 1 END)
        THEN '✅ FECHAS COHERENTES'
        ELSE '❌ FECHAS INCOHERENTES'
    END as estado
FROM equipos 
WHERE fecha_fabricacion IS NOT NULL 
    AND fecha_adquisicion IS NOT NULL 
    AND fecha_instalacion IS NOT NULL 
    AND fecha_inicio_operacion IS NOT NULL;

-- Verificar campos booleanos
SELECT 'VERIFICANDO CAMPOS BOOLEANOS' as verificacion;

SELECT 
    'calibracion' as campo,
    COUNT(*) as total,
    COUNT(CASE WHEN calibracion = 1 THEN 1 END) as verdadero,
    COUNT(CASE WHEN calibracion = 0 THEN 1 END) as falso,
    COUNT(CASE WHEN calibracion IS NULL THEN 1 END) as nulo
FROM equipos
UNION ALL
SELECT 
    'manual_operacion' as campo,
    COUNT(*) as total,
    COUNT(CASE WHEN manual_operacion = 1 THEN 1 END) as verdadero,
    COUNT(CASE WHEN manual_operacion = 0 THEN 1 END) as falso,
    COUNT(CASE WHEN manual_operacion IS NULL THEN 1 END) as nulo
FROM equipos
UNION ALL
SELECT 
    'status' as campo,
    COUNT(*) as total,
    COUNT(CASE WHEN status = 1 THEN 1 END) as activo,
    COUNT(CASE WHEN status = 0 THEN 1 END) as inactivo,
    COUNT(CASE WHEN status IS NULL THEN 1 END) as nulo
FROM equipos;

-- Resumen final
SELECT 'RESUMEN FINAL DE VERIFICACIÓN' as verificacion;

SELECT 
    (SELECT COUNT(*) FROM equipos) as total_equipos,
    (SELECT COUNT(*) FROM servicios) as total_servicios,
    (SELECT COUNT(*) FROM areas) as total_areas,
    (SELECT COUNT(*) FROM propietarios) as total_propietarios,
    CASE 
        WHEN (SELECT COUNT(*) FROM equipos) > 0 
             AND (SELECT COUNT(*) FROM servicios) > 0 
             AND (SELECT COUNT(*) FROM areas) > 0 
             AND (SELECT COUNT(*) FROM propietarios) > 0
        THEN '✅ BASE DE DATOS OPERATIVA'
        ELSE '❌ BASE DE DATOS INCOMPLETA'
    END as estado_general;

-- Mostrar últimos equipos registrados
SELECT 'ÚLTIMOS EQUIPOS REGISTRADOS' as verificacion;

SELECT 
    id,
    name,
    code,
    serial,
    marca,
    modelo,
    created_at,
    CASE WHEN status = 1 THEN '✅ ACTIVO' ELSE '❌ INACTIVO' END as estado
FROM equipos 
ORDER BY created_at DESC 
LIMIT 5;
