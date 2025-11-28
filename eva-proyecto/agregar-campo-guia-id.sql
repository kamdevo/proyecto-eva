-- Migración para agregar campo guia_id a la tabla equipos
-- Ejecutar en MySQL

USE innovaciondesa;

-- Verificar si la columna ya existe
SELECT 
    COLUMN_NAME, 
    DATA_TYPE, 
    IS_NULLABLE, 
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'innovaciondesa' 
  AND TABLE_NAME = 'equipos' 
  AND COLUMN_NAME = 'guia_id';

-- Si no existe, agregarla (ajustar la posición según tu estructura)
ALTER TABLE equipos 
ADD COLUMN IF NOT EXISTS guia_id INT(11) NULL DEFAULT NULL 
COMMENT 'ID de la guía rápida asociada al equipo'
AFTER manual_id;

-- Crear índice para mejorar el rendimiento
ALTER TABLE equipos 
ADD INDEX IF NOT EXISTS idx_guia_id (guia_id);

-- Agregar foreign key opcional (descomentar si lo deseas)
-- ALTER TABLE equipos 
-- ADD CONSTRAINT fk_equipos_guia 
-- FOREIGN KEY (guia_id) REFERENCES guias_rapidas(id) 
-- ON DELETE SET NULL ON UPDATE CASCADE;

-- Verificar que se creó correctamente
SHOW COLUMNS FROM equipos LIKE 'guia_id';

-- Ver estadísticas iniciales
SELECT 
    COUNT(*) as total_equipos,
    COUNT(guia_id) as equipos_con_guia,
    COUNT(*) - COUNT(guia_id) as equipos_sin_guia
FROM equipos;

SELECT '✅ Columna guia_id agregada exitosamente' as resultado;
