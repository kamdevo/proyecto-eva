-- Script de inicialización MySQL para Sistema EVA
-- Este script se ejecuta automáticamente al crear el contenedor

-- Configurar zona horaria
SET time_zone = '-05:00';

-- Crear base de datos si no existe
CREATE DATABASE IF NOT EXISTS `gestionthuv` 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

-- Usar la base de datos
USE `gestionthuv`;

-- Crear usuario que Laravel espera con todos los permisos
CREATE USER IF NOT EXISTS 'eva_user'@'%' IDENTIFIED BY 'eva_password_2024';
GRANT ALL PRIVILEGES ON `gestionthuv`.* TO 'eva_user'@'%';

-- Dar permisos completos a root desde cualquier host
GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' IDENTIFIED BY 'eva_root_2024' WITH GRANT OPTION;

-- Crear usuario adicional para aplicación
CREATE USER IF NOT EXISTS 'eva_app'@'%' IDENTIFIED BY 'eva_app_password_2024';
GRANT SELECT, INSERT, UPDATE, DELETE ON `gestionthuv`.* TO 'eva_app'@'%';

-- Crear usuario de solo lectura para reportes
CREATE USER IF NOT EXISTS 'eva_readonly'@'%' IDENTIFIED BY 'eva_readonly_password_2024';
GRANT SELECT ON `gestionthuv`.* TO 'eva_readonly'@'%';

-- Configurar MySQL para optimización
SET GLOBAL innodb_buffer_pool_size = 536870912; -- 512MB
SET GLOBAL innodb_log_file_size = 268435456;    -- 256MB
SET GLOBAL max_connections = 200;
SET GLOBAL wait_timeout = 28800;
SET GLOBAL interactive_timeout = 28800;

-- Configurar variables de sesión (sin NO_AUTO_CREATE_USER que no es compatible con MySQL 8.0)
SET SESSION sql_mode = 'STRICT_TRANS_TABLES,NO_ZERO_DATE,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO';

-- Habilitar logs de consultas lentas
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 2;

-- Aplicar cambios
FLUSH PRIVILEGES;

-- Mensaje de confirmación
SELECT 'Sistema EVA - Base de datos inicializada correctamente' as mensaje;
SELECT VERSION() as version_mysql;
SELECT @@character_set_server as charset_servidor;
SELECT @@collation_server as collation_servidor;
SELECT @@time_zone as zona_horaria;
