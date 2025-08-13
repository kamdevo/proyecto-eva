<?php
/**
 * Script para crear las tablas faltantes para el sistema de equipos médicos
 */

$host = 'localhost';
$dbname = 'gestionthuv';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    
    echo "🔗 Conectado a la base de datos\n";
    echo "📋 Creando tablas faltantes...\n\n";
    
    // 1. Tabla registros_invima
    echo "1️⃣ Creando tabla 'registros_invima'...\n";
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS `registros_invima` (
            `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            `numero_registro` varchar(255) DEFAULT NULL,
            `nombre_comercial` varchar(255) DEFAULT NULL,
            `fabricante` varchar(255) DEFAULT NULL,
            `importador` varchar(255) DEFAULT NULL,
            `created_at` timestamp NULL DEFAULT NULL,
            `updated_at` timestamp NULL DEFAULT NULL,
            PRIMARY KEY (`id`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
    echo "✅ Tabla 'registros_invima' creada\n";
    
    // 2. Tabla marcas
    echo "2️⃣ Creando tabla 'marcas'...\n";
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS `marcas` (
            `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            `name` varchar(255) NOT NULL,
            `description` text DEFAULT NULL,
            `created_at` timestamp NULL DEFAULT NULL,
            `updated_at` timestamp NULL DEFAULT NULL,
            PRIMARY KEY (`id`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
    echo "✅ Tabla 'marcas' creada\n";
    
    // 3. Tabla modelos
    echo "3️⃣ Creando tabla 'modelos'...\n";
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS `modelos` (
            `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            `name` varchar(255) NOT NULL,
            `marca_id` bigint(20) unsigned DEFAULT NULL,
            `description` text DEFAULT NULL,
            `created_at` timestamp NULL DEFAULT NULL,
            `updated_at` timestamp NULL DEFAULT NULL,
            PRIMARY KEY (`id`),
            KEY `modelos_marca_id_foreign` (`marca_id`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
    echo "✅ Tabla 'modelos' creada\n";
    
    // 4. Tabla ubicaciones
    echo "4️⃣ Creando tabla 'ubicaciones'...\n";
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS `ubicaciones` (
            `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            `name` varchar(255) NOT NULL,
            `description` text DEFAULT NULL,
            `area_id` bigint(20) unsigned DEFAULT NULL,
            `created_at` timestamp NULL DEFAULT NULL,
            `updated_at` timestamp NULL DEFAULT NULL,
            PRIMARY KEY (`id`),
            KEY `ubicaciones_area_id_foreign` (`area_id`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
    echo "✅ Tabla 'ubicaciones' creada\n";
    
    // 5. Tabla criesgos
    echo "5️⃣ Creando tabla 'criesgos'...\n";
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS `criesgos` (
            `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
            `name` varchar(255) NOT NULL,
            `nivel` varchar(50) DEFAULT NULL,
            `description` text DEFAULT NULL,
            `created_at` timestamp NULL DEFAULT NULL,
            `updated_at` timestamp NULL DEFAULT NULL,
            PRIMARY KEY (`id`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ");
    echo "✅ Tabla 'criesgos' creada\n";
    
    // 6. Tabla estadoequipos (si no existe)
    echo "6️⃣ Verificando tabla 'estadoequipos'...\n";
    $stmt = $pdo->query("SHOW TABLES LIKE 'estadoequipos'");
    if ($stmt->rowCount() == 0) {
        $pdo->exec("
            CREATE TABLE `estadoequipos` (
                `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
                `name` varchar(255) NOT NULL,
                `description` text DEFAULT NULL,
                `color` varchar(7) DEFAULT NULL,
                `created_at` timestamp NULL DEFAULT NULL,
                `updated_at` timestamp NULL DEFAULT NULL,
                PRIMARY KEY (`id`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ");
        echo "✅ Tabla 'estadoequipos' creada\n";
    } else {
        echo "✅ Tabla 'estadoequipos' ya existe\n";
    }
    
    // 7. Tabla sedes (si no existe)
    echo "7️⃣ Verificando tabla 'sedes'...\n";
    $stmt = $pdo->query("SHOW TABLES LIKE 'sedes'");
    if ($stmt->rowCount() == 0) {
        $pdo->exec("
            CREATE TABLE `sedes` (
                `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
                `name` varchar(255) NOT NULL,
                `address` text DEFAULT NULL,
                `phone` varchar(20) DEFAULT NULL,
                `email` varchar(255) DEFAULT NULL,
                `created_at` timestamp NULL DEFAULT NULL,
                `updated_at` timestamp NULL DEFAULT NULL,
                PRIMARY KEY (`id`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ");
        echo "✅ Tabla 'sedes' creada\n";
    } else {
        echo "✅ Tabla 'sedes' ya existe\n";
    }
    
    echo "\n" . str_repeat("-", 40) . "\n";
    echo "📊 INSERTANDO DATOS BÁSICOS:\n\n";
    
    // Insertar datos básicos en las tablas
    
    // Marcas básicas
    $pdo->exec("
        INSERT IGNORE INTO `marcas` (`id`, `name`, `description`) VALUES 
        (1, 'Philips', 'Equipos médicos Philips'),
        (2, 'GE Healthcare', 'General Electric Healthcare'),
        (3, 'Siemens', 'Siemens Healthineers'),
        (4, 'Medtronic', 'Dispositivos médicos Medtronic'),
        (5, 'Genérico', 'Marca genérica')
    ");
    echo "✅ Marcas básicas insertadas\n";
    
    // Estados de equipos básicos
    $pdo->exec("
        INSERT IGNORE INTO `estadoequipos` (`id`, `name`, `description`, `color`) VALUES 
        (1, 'Operativo', 'Equipo en funcionamiento normal', '#28a745'),
        (2, 'Mantenimiento', 'Equipo en mantenimiento', '#ffc107'),
        (3, 'Fuera de servicio', 'Equipo no operativo', '#dc3545'),
        (4, 'En reparación', 'Equipo siendo reparado', '#fd7e14')
    ");
    echo "✅ Estados de equipos insertados\n";
    
    // Clasificación de riesgos básica
    $pdo->exec("
        INSERT IGNORE INTO `criesgos` (`id`, `name`, `nivel`, `description`) VALUES 
        (1, 'Clase I', 'Bajo', 'Riesgo bajo'),
        (2, 'Clase IIa', 'Medio', 'Riesgo medio'),
        (3, 'Clase IIb', 'Medio-Alto', 'Riesgo medio-alto'),
        (4, 'Clase III', 'Alto', 'Riesgo alto')
    ");
    echo "✅ Clasificación de riesgos insertada\n";
    
    // Sedes básicas
    $pdo->exec("
        INSERT IGNORE INTO `sedes` (`id`, `name`, `address`) VALUES 
        (1, 'Sede Principal', 'Dirección principal del hospital'),
        (2, 'Sede Norte', 'Sede norte del hospital'),
        (3, 'Sede Sur', 'Sede sur del hospital')
    ");
    echo "✅ Sedes básicas insertadas\n";
    
    echo "\n🎉 TODAS LAS TABLAS CREADAS EXITOSAMENTE\n";
    echo "🔄 Ahora el endpoint de equipos debería funcionar\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>
