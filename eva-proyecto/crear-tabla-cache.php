<?php
/**
 * Script para crear las tablas necesarias para Laravel
 */

$host = 'localhost';
$dbname = 'gestionthuv';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    
    echo "🔗 Conectado a la base de datos\n";
    
    // Crear tabla cache
    echo "📋 Creando tabla 'cache'...\n";
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS `cache` (
            `key` varchar(255) NOT NULL,
            `value` mediumtext NOT NULL,
            `expiration` int(11) NOT NULL,
            PRIMARY KEY (`key`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
    echo "✅ Tabla 'cache' creada\n";
    
    // Crear tabla cache_locks
    echo "📋 Creando tabla 'cache_locks'...\n";
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS `cache_locks` (
            `key` varchar(255) NOT NULL,
            `owner` varchar(255) NOT NULL,
            `expiration` int(11) NOT NULL,
            PRIMARY KEY (`key`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
    echo "✅ Tabla 'cache_locks' creada\n";
    
    // Crear tabla sessions
    echo "📋 Creando tabla 'sessions'...\n";
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS `sessions` (
            `id` varchar(255) NOT NULL,
            `user_id` bigint(20) unsigned DEFAULT NULL,
            `ip_address` varchar(45) DEFAULT NULL,
            `user_agent` text,
            `payload` longtext NOT NULL,
            `last_activity` int(11) NOT NULL,
            PRIMARY KEY (`id`),
            KEY `sessions_user_id_index` (`user_id`),
            KEY `sessions_last_activity_index` (`last_activity`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
    echo "✅ Tabla 'sessions' creada\n";
    
    // Crear tabla personal_access_tokens si no existe
    echo "📋 Verificando tabla 'personal_access_tokens'...\n";
    $stmt = $pdo->query("SHOW TABLES LIKE 'personal_access_tokens'");
    if ($stmt->rowCount() == 0) {
        echo "📋 Creando tabla 'personal_access_tokens'...\n";
        $pdo->exec("
            CREATE TABLE `personal_access_tokens` (
                `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
                `tokenable_type` varchar(255) NOT NULL,
                `tokenable_id` bigint(20) unsigned NOT NULL,
                `name` varchar(255) NOT NULL,
                `token` varchar(64) NOT NULL,
                `abilities` text,
                `last_used_at` timestamp NULL DEFAULT NULL,
                `expires_at` timestamp NULL DEFAULT NULL,
                `created_at` timestamp NULL DEFAULT NULL,
                `updated_at` timestamp NULL DEFAULT NULL,
                PRIMARY KEY (`id`),
                UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
                KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ");
        echo "✅ Tabla 'personal_access_tokens' creada\n";
    } else {
        echo "✅ Tabla 'personal_access_tokens' ya existe\n";
    }
    
    echo "\n🎉 Todas las tablas necesarias han sido creadas\n";
    echo "🔄 Ahora reinicia el servidor Laravel:\n";
    echo "   php artisan serve --host=127.0.0.1 --port=8000\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>
