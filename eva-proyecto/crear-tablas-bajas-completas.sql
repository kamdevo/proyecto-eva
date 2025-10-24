-- ========================================================================
-- 🔧 CREAR TABLAS COMPLETAS PARA SISTEMA DE BAJAS DE EQUIPOS
-- ========================================================================
-- Tablas: bajas, equipos_bajas y tablas relacionadas
-- Base de datos: gestionthuv (Puerto 3307)
-- ========================================================================

USE `gestionthuv`;

-- ========================================================================
-- 📋 1. TABLA PRINCIPAL DE BAJAS
-- ========================================================================
CREATE TABLE IF NOT EXISTS `bajas` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `fecha_baja` date NOT NULL,
  `descripcion` text NOT NULL,
  `archivo` varchar(500) DEFAULT NULL,
  `usuario_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `bajas_usuario_id_index` (`usuario_id`),
  KEY `bajas_fecha_baja_index` (`fecha_baja`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================================================
-- 🔗 2. TABLA DE RELACIÓN EQUIPOS-BAJAS
-- ========================================================================
CREATE TABLE IF NOT EXISTS `equipos_bajas` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `baja_id` bigint(20) UNSIGNED NOT NULL,
  `equipo_id` bigint(20) UNSIGNED NOT NULL,
  `usuario_id` bigint(20) UNSIGNED DEFAULT NULL,
  `fecha_asociacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `equipos_bajas_unique` (`baja_id`, `equipo_id`),
  KEY `equipos_bajas_baja_id_index` (`baja_id`),
  KEY `equipos_bajas_equipo_id_index` (`equipo_id`),
  KEY `equipos_bajas_usuario_id_index` (`usuario_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================================================
-- 📧 3. TABLA DE LOGS DE NOTIFICACIONES (SI NO EXISTE)
-- ========================================================================
CREATE TABLE IF NOT EXISTS `notification_logs` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `subject` varchar(255) NOT NULL,
  `type` varchar(100) NOT NULL,
  `status` enum('pending','sent','failed') NOT NULL DEFAULT 'pending',
  `data` json DEFAULT NULL,
  `error_message` text DEFAULT NULL,
  `sent_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `notification_logs_user_id_index` (`user_id`),
  KEY `notification_logs_status_index` (`status`),
  KEY `notification_logs_type_index` (`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================================================
-- ✍️ 4. TABLA DE FIRMAS DIGITALES (SI NO EXISTE)
-- ========================================================================
CREATE TABLE IF NOT EXISTS `digital_signatures` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `ticket_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `signature_data` longtext NOT NULL,
  `signer_name` varchar(255) NOT NULL,
  `signature_type` enum('draw','type') NOT NULL DEFAULT 'draw',
  `metadata` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `digital_signatures_ticket_id_index` (`ticket_id`),
  KEY `digital_signatures_user_id_index` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================================================
-- 📋 5. TABLA DE CIERRES DE ÓRDENES DE TRABAJO (SI NO EXISTE)
-- ========================================================================
CREATE TABLE IF NOT EXISTS `work_order_closures` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `ticket_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `trabajo_realizado` text NOT NULL,
  `tiempo_empleado` varchar(100) DEFAULT NULL,
  `responsable` varchar(255) DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `signature_id` bigint(20) UNSIGNED DEFAULT NULL,
  `pdf_path` varchar(500) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `work_order_closures_ticket_id_index` (`ticket_id`),
  KEY `work_order_closures_user_id_index` (`user_id`),
  KEY `work_order_closures_signature_id_index` (`signature_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================================================
-- 📊 6. TABLA DE JOBS (SI NO EXISTE)
-- ========================================================================
CREATE TABLE IF NOT EXISTS `jobs` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) UNSIGNED NOT NULL,
  `reserved_at` int(10) UNSIGNED DEFAULT NULL,
  `available_at` int(10) UNSIGNED NOT NULL,
  `created_at` int(10) UNSIGNED NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================================================
-- 📋 7. TABLA DE PREFERENCIAS DE NOTIFICACIONES (SI NO EXISTE)
-- ========================================================================
CREATE TABLE IF NOT EXISTS `notification_preferences` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `email_notifications` tinyint(1) NOT NULL DEFAULT 1,
  `sms_notifications` tinyint(1) NOT NULL DEFAULT 0,
  `push_notifications` tinyint(1) NOT NULL DEFAULT 1,
  `notification_types` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `notification_preferences_user_id_index` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================================================
-- 🔧 8. INSERTAR DATOS DE PRUEBA PARA BAJAS (OPCIONAL)
-- ========================================================================
INSERT IGNORE INTO `bajas` (`id`, `fecha_baja`, `descripcion`, `archivo`, `usuario_id`, `created_at`, `updated_at`) VALUES
(1, '2024-01-15', 'Baja por obsolescencia - Motivo: Fin de vida útil', NULL, 1, NOW(), NOW()),
(2, '2024-02-20', 'Baja por daño irreparable - Motivo: Daño irreparable', NULL, 1, NOW(), NOW()),
(3, '2024-03-10', 'Baja por reemplazo tecnológico - Motivo: Reemplazo por tecnología nueva', NULL, 1, NOW(), NOW());

-- ========================================================================
-- ✅ VERIFICACIÓN FINAL
-- ========================================================================
SELECT 'bajas' as tabla, COUNT(*) as registros FROM bajas
UNION ALL
SELECT 'equipos_bajas' as tabla, COUNT(*) as registros FROM equipos_bajas
UNION ALL
SELECT 'notification_logs' as tabla, COUNT(*) as registros FROM notification_logs
UNION ALL
SELECT 'digital_signatures' as tabla, COUNT(*) as registros FROM digital_signatures
UNION ALL
SELECT 'work_order_closures' as tabla, COUNT(*) as registros FROM work_order_closures
UNION ALL
SELECT 'jobs' as tabla, COUNT(*) as registros FROM jobs
UNION ALL
SELECT 'notification_preferences' as tabla, COUNT(*) as registros FROM notification_preferences;

-- ========================================================================
-- 📝 INFORMACIÓN ADICIONAL
-- ========================================================================
-- Estas tablas son críticas para:
-- 
-- 1. bajas:
--    - Registro principal de bajas de equipos
--    - Información de fecha, descripción y documentos
--    - CRUD completo desde frontend
--
-- 2. equipos_bajas:
--    - Relación muchos a muchos entre equipos y bajas
--    - Permite asociar múltiples equipos a una baja
--    - Trazabilidad de asociaciones
--
-- 3. notification_logs:
--    - Sistema de correos automáticos
--    - Registro de envíos exitosos/fallidos
--    - Endpoints: /api/v1/notifications/*
--
-- 4. digital_signatures:
--    - Modal de firma digital
--    - Órdenes de trabajo firmadas
--    - Componente: digital-signature-modal.jsx
--
-- 5. work_order_closures:
--    - PDF con firmas embebidas
--    - Cierre de tickets con documentación
--
-- 6. jobs:
--    - Cola de trabajos para envío asíncrono de correos
--    - Procesamiento en background
--
-- 7. notification_preferences:
--    - Configuración de notificaciones por usuario
--    - Preferencias de correo/SMS/push
-- ========================================================================

SELECT '✅ TODAS LAS TABLAS DE BAJAS CREADAS EXITOSAMENTE' as resultado;
