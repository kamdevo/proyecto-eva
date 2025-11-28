-- Script de verificación rápida para guia_id
-- Ejecutar en MySQL Workbench o phpMyAdmin

-- 1. Ver estructura de la columna guia_id
SHOW COLUMNS FROM equipos LIKE 'guia_id';

-- 2. Contar equipos totales
SELECT 'Total equipos' as descripcion, COUNT(*) as cantidad FROM equipos;

-- 3. Contar equipos con y sin guia_id
SELECT 
    'Con guia_id' as descripcion,
    COUNT(*) as cantidad 
FROM equipos 
WHERE guia_id IS NOT NULL AND guia_id > 0

UNION ALL

SELECT 
    'Sin guia_id' as descripcion,
    COUNT(*) as cantidad 
FROM equipos 
WHERE guia_id IS NULL OR guia_id = 0;

-- 4. Ver distribución de equipos por guía
SELECT 
    gr.id,
    gr.name as nombre_guia,
    COUNT(e.id) as nro_equipos
FROM guias_rapidas gr
LEFT JOIN equipos e ON e.guia_id = gr.id
GROUP BY gr.id, gr.name
ORDER BY nro_equipos DESC;

-- 5. Ver algunos ejemplos de equipos con guia_id
SELECT 
    e.id,
    e.name as equipo,
    e.code as codigo,
    e.guia_id,
    gr.name as guia_nombre
FROM equipos e
LEFT JOIN guias_rapidas gr ON gr.id = e.guia_id
WHERE e.guia_id IS NOT NULL AND e.guia_id > 0
LIMIT 10;

-- Si la columna guia_id NO existe, ejecutar esto:
-- ALTER TABLE equipos ADD COLUMN guia_id INT NULL AFTER manual_id;
-- ALTER TABLE equipos ADD INDEX idx_guia_id (guia_id);

-- Para ver todas las guías
SELECT * FROM guias_rapidas ORDER BY name;
