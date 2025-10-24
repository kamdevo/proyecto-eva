-- Crear tablas de notificaciones
CREATE TABLE IF NOT EXISTS notification_preferences (
    id bigint unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id bigint unsigned NOT NULL,
    maintenance_reminders tinyint(1) DEFAULT 1,
    calibration_reminders tinyint(1) DEFAULT 1,
    contingency_alerts tinyint(1) DEFAULT 1,
    equipment_status_changes tinyint(1) DEFAULT 1,
    export_notifications tinyint(1) DEFAULT 1,
    reminder_frequency enum('daily','weekly','monthly') DEFAULT 'daily',
    email_format enum('html','text') DEFAULT 'html',
    send_time time DEFAULT '08:00:00',
    created_at timestamp NULL DEFAULT NULL,
    updated_at timestamp NULL DEFAULT NULL,
    UNIQUE KEY notification_preferences_user_id_unique (user_id)
);

CREATE TABLE IF NOT EXISTS notification_logs (
    id bigint unsigned NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id bigint unsigned DEFAULT NULL,
    type varchar(100) NOT NULL,
    title varchar(255) NOT NULL,
    message text NOT NULL,
    data json DEFAULT NULL,
    read_at timestamp NULL DEFAULT NULL,
    email_sent tinyint(1) DEFAULT 0,
    email_sent_at timestamp NULL DEFAULT NULL,
    created_at timestamp NULL DEFAULT NULL,
    updated_at timestamp NULL DEFAULT NULL,
    INDEX notification_logs_user_id_index (user_id),
    INDEX notification_logs_type_index (type),
    INDEX notification_logs_read_at_index (read_at)
);
