-- ========================================================================
-- 📋 RECREACIÓN DE TABLAS PERDIDAS - SISTEMA EVA
-- ========================================================================
-- Basado en el trabajo realizado durante el desarrollo del sistema
-- Incluye todas las tablas creadas y modificadas en nuestras sesiones

-- ========================================================================
-- 🔧 1. TABLA DE PREFERENCIAS DE NOTIFICACIONES
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
-- 📧 2. TABLA DE LOGS DE NOTIFICACIONES
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
-- ✍️ 3. TABLA DE FIRMAS DIGITALES
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
-- 📋 4. TABLA DE CIERRES DE ÓRDENES DE TRABAJO
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
-- 📅 5. TABLA DE PLANES DE MANTENIMIENTO (ACTUALIZADA)
-- ========================================================================
CREATE TABLE IF NOT EXISTS `planes_mantenimientos` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `equipo_id` bigint(20) UNSIGNED NOT NULL,
  `tipo_mantenimiento` enum('preventivo','correctivo','calibracion') NOT NULL DEFAULT 'preventivo',
  `frecuencia` enum('mensual','bimestral','trimestral','semestral','anual') NOT NULL DEFAULT 'mensual',
  `responsable` varchar(255) DEFAULT NULL,
  `descripcion` text DEFAULT NULL,
  `fecha_inicio` date DEFAULT NULL,
  `fecha_fin` date DEFAULT NULL,
  `estado` enum('activo','inactivo','completado') NOT NULL DEFAULT 'activo',
  `cronograma` json DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `planes_mantenimientos_equipo_id_index` (`equipo_id`),
  KEY `planes_mantenimientos_tipo_index` (`tipo_mantenimiento`),
  KEY `planes_mantenimientos_estado_index` (`estado`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================================================
-- 📊 6. TABLA DE JOBS (COLA DE TRABAJOS)
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
-- 🔐 7. TABLA DE TOKENS DE ACCESO PERSONAL
-- ========================================================================
CREATE TABLE IF NOT EXISTS `personal_access_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================================================
-- 🖥️ 8. TABLA DE SESIONES
-- ========================================================================
CREATE TABLE IF NOT EXISTS `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================================================
-- 💾 9. TABLA DE CACHE
-- ========================================================================
CREATE TABLE IF NOT EXISTS `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` int(11) NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================================================
-- 📋 10. TABLA DE GUÍAS RÁPIDAS (SI NO EXISTE)
-- ========================================================================
CREATE TABLE IF NOT EXISTS `guias_rapidas` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `file_path` varchar(500) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_size` bigint(20) DEFAULT NULL,
  `mime_type` varchar(100) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `guias_rapidas_is_active_index` (`is_active`),
  KEY `guias_rapidas_created_by_index` (`created_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================================================
-- 📝 11. TABLA DE OBSERVACIONES DE EQUIPOS (SI NO EXISTE)
-- ========================================================================
CREATE TABLE IF NOT EXISTS `observaciones_equipos` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `equipo_id` bigint(20) UNSIGNED NOT NULL,
  `usuario_id` bigint(20) UNSIGNED NOT NULL,
  `observacion` text NOT NULL,
  `tipo` enum('general','mantenimiento','incidencia','mejora') NOT NULL DEFAULT 'general',
  `prioridad` enum('baja','media','alta','critica') NOT NULL DEFAULT 'media',
  `estado` enum('pendiente','en_proceso','resuelto','cerrado') NOT NULL DEFAULT 'pendiente',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `observaciones_equipos_equipo_id_index` (`equipo_id`),
  KEY `observaciones_equipos_usuario_id_index` (`usuario_id`),
  KEY `observaciones_equipos_estado_index` (`estado`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================================================
-- 📁 12. TABLA DE ARCHIVOS DE EQUIPOS (SI NO EXISTE)
-- ========================================================================
CREATE TABLE IF NOT EXISTS `archivos_equipos` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `equipo_id` bigint(20) UNSIGNED NOT NULL,
  `usuario_id` bigint(20) UNSIGNED NOT NULL,
  `nombre_archivo` varchar(255) NOT NULL,
  `ruta_archivo` varchar(500) NOT NULL,
  `tipo_archivo` varchar(100) DEFAULT NULL,
  `tamaño_archivo` bigint(20) DEFAULT NULL,
  `descripcion` text DEFAULT NULL,
  `categoria` enum('manual','certificado','garantia','imagen','documento','otro') NOT NULL DEFAULT 'documento',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `archivos_equipos_equipo_id_index` (`equipo_id`),
  KEY `archivos_equipos_usuario_id_index` (`usuario_id`),
  KEY `archivos_equipos_categoria_index` (`categoria`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================================================
-- 🔧 13. TABLA DE MANTENIMIENTOS (SI NO EXISTE O INCOMPLETA)
-- ========================================================================
CREATE TABLE IF NOT EXISTS `mantenimientos` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `equipo_id` bigint(20) UNSIGNED NOT NULL,
  `usuario_id` bigint(20) UNSIGNED NOT NULL,
  `plan_mantenimiento_id` bigint(20) UNSIGNED DEFAULT NULL,
  `tipo` enum('preventivo','correctivo','calibracion','emergencia') NOT NULL DEFAULT 'preventivo',
  `descripcion` text NOT NULL,
  `fecha_programada` date DEFAULT NULL,
  `fecha_inicio` datetime DEFAULT NULL,
  `fecha_fin` datetime DEFAULT NULL,
  `estado` enum('programado','en_proceso','completado','cancelado','diferido') NOT NULL DEFAULT 'programado',
  `prioridad` enum('baja','media','alta','critica') NOT NULL DEFAULT 'media',
  `costo` decimal(10,2) DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `repuestos_utilizados` json DEFAULT NULL,
  `tiempo_empleado` varchar(100) DEFAULT NULL,
  `responsable` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `mantenimientos_equipo_id_index` (`equipo_id`),
  KEY `mantenimientos_usuario_id_index` (`usuario_id`),
  KEY `mantenimientos_plan_mantenimiento_id_index` (`plan_mantenimiento_id`),
  KEY `mantenimientos_estado_index` (`estado`),
  KEY `mantenimientos_tipo_index` (`tipo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================================================
-- 📊 14. TABLA DE MÓDULOS (SI NO EXISTE)
-- ========================================================================
CREATE TABLE IF NOT EXISTS `modulos` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `icono` varchar(100) DEFAULT NULL,
  `ruta` varchar(255) DEFAULT NULL,
  `orden` int(11) NOT NULL DEFAULT 0,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `parent_id` bigint(20) UNSIGNED DEFAULT NULL,
  `permisos_requeridos` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `modulos_nombre_unique` (`nombre`),
  KEY `modulos_parent_id_index` (`parent_id`),
  KEY `modulos_activo_index` (`activo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================================================
-- 🔐 15. TABLA DE PERMISOS DE USUARIOS (SI NO EXISTE)
-- ========================================================================
CREATE TABLE IF NOT EXISTS `permisos_usuarios` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `usuario_id` bigint(20) UNSIGNED NOT NULL,
  `modulo_id` bigint(20) UNSIGNED NOT NULL,
  `puede_leer` tinyint(1) NOT NULL DEFAULT 0,
  `puede_crear` tinyint(1) NOT NULL DEFAULT 0,
  `puede_editar` tinyint(1) NOT NULL DEFAULT 0,
  `puede_eliminar` tinyint(1) NOT NULL DEFAULT 0,
  `permisos_especiales` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `permisos_usuarios_usuario_modulo_unique` (`usuario_id`,`modulo_id`),
  KEY `permisos_usuarios_usuario_id_index` (`usuario_id`),
  KEY `permisos_usuarios_modulo_id_index` (`modulo_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================================================
-- 📧 16. DATOS INICIALES PARA GUÍAS RÁPIDAS
-- ========================================================================
INSERT IGNORE INTO `guias_rapidas` (`id`, `name`, `description`, `file_path`, `file_name`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Manual de Usuario EVA', 'Guía completa para el uso del sistema EVA', '/storage/guias/manual_eva.pdf', 'manual_eva.pdf', 1, NOW(), NOW()),
(2, 'Protocolo de Mantenimiento Preventivo', 'Procedimientos estándar para mantenimiento preventivo', '/storage/guias/protocolo_preventivo.pdf', 'protocolo_preventivo.pdf', 1, NOW(), NOW()),
(3, 'Guía de Calibración de Equipos', 'Procedimientos de calibración por tipo de equipo', '/storage/guias/guia_calibracion.pdf', 'guia_calibracion.pdf', 1, NOW(), NOW());

-- ========================================================================
-- 📊 17. DATOS INICIALES PARA MÓDULOS
-- ========================================================================
INSERT IGNORE INTO `modulos` (`id`, `nombre`, `descripcion`, `icono`, `ruta`, `orden`, `activo`) VALUES
(1, 'dashboard', 'Panel Principal', 'home', '/dashboard', 1, 1),
(2, 'equipos', 'Gestión de Equipos', 'desktop', '/equipos', 2, 1),
(3, 'usuarios', 'Gestión de Usuarios', 'users', '/usuarios', 3, 1),
(4, 'tickets propios', 'Mis Tickets', 'ticket', '/mis-tickets', 4, 1),
(5, 'correctivos', 'Correctivos Generales', 'wrench', '/correctivos-generales', 5, 1),
(6, 'preventivos', 'Mantenimientos Preventivos', 'tools', '/preventivos', 6, 1),
(7, 'reportes', 'Reportes y Estadísticas', 'chart-bar', '/reportes', 7, 1),
(8, 'configuracion', 'Configuración del Sistema', 'settings', '/configuracion', 8, 1);

-- ========================================================================
-- ✅ SCRIPT COMPLETADO
-- ========================================================================
-- Este script incluye todas las tablas principales que hemos creado
-- durante el desarrollo del sistema EVA. Ejecutar en orden para
-- recrear la estructura de base de datos perdida.
--
-- NOTA: Algunas tablas pueden ya existir en el backup importado.
-- El uso de "IF NOT EXISTS" evita errores de duplicación.
-- ========================================================================
