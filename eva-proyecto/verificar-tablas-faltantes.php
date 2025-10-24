<?php
/**
 * ========================================================================
 * 🔍 VERIFICADOR DE TABLAS FALTANTES - SISTEMA EVA
 * ========================================================================
 * Script para verificar qué tablas faltan en la base de datos actual
 * comparado con las que deberían existir según nuestro desarrollo
 */

// Configuración de conexión a la base de datos
$host = 'localhost';
$port = '3307';
$dbname = 'gestionthuv'; // Cambiar por el nombre de tu base de datos
$username = 'root'; // Cambiar por tu usuario
$password = '';     // Cambiar por tu contraseña

try {
    $pdo = new PDO("mysql:host=$host;port=$port;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "🔗 Conectado a la base de datos: $dbname\n\n";
    
} catch (PDOException $e) {
    die("❌ Error de conexión: " . $e->getMessage() . "\n");
}

// ========================================================================
// 📋 LISTA DE TABLAS QUE DEBERÍAN EXISTIR
// ========================================================================
$tablasRequeridas = [
    // Tablas principales del sistema
    'usuarios',
    'equipos', 
    'ordenes',
    'servicios',
    'areas',
    'sedes',
    'empresas',
    'tecnicos',
    'estados',
    'subprocesos',
    'roles',
    
    // Tablas creadas durante nuestro desarrollo
    'notification_preferences',
    'notification_logs',
    'digital_signatures',
    'work_order_closures',
    'planes_mantenimientos',
    'jobs',
    'personal_access_tokens',
    'sessions',
    'cache',
    'cache_locks',
    'guias_rapidas',
    'observaciones_equipos',
    'archivos_equipos',
    'mantenimientos',
    'modulos',
    'permisos_usuarios',
    
    // Tablas de sistema Laravel
    'migrations',
    'failed_jobs',
    
    // Tablas adicionales que pueden existir
    'correctivos',
    'preventivos',
    'calibraciones',
    'estados_equipos',
    'tipos_equipos',
    'marcas',
    'modelos',
    'proveedores',
    'centros_costo',
    'zonas'
];

// ========================================================================
// 🔍 VERIFICAR TABLAS EXISTENTES
// ========================================================================
echo "🔍 VERIFICANDO TABLAS EN LA BASE DE DATOS...\n";
echo str_repeat("=", 60) . "\n\n";

$stmt = $pdo->query("SHOW TABLES");
$tablasExistentes = $stmt->fetchAll(PDO::FETCH_COLUMN);

echo "📊 RESUMEN:\n";
echo "- Tablas requeridas: " . count($tablasRequeridas) . "\n";
echo "- Tablas existentes: " . count($tablasExistentes) . "\n\n";

// ========================================================================
// ❌ TABLAS FALTANTES
// ========================================================================
$tablasFaltantes = array_diff($tablasRequeridas, $tablasExistentes);

if (!empty($tablasFaltantes)) {
    echo "❌ TABLAS FALTANTES (" . count($tablasFaltantes) . "):\n";
    echo str_repeat("-", 40) . "\n";
    
    foreach ($tablasFaltantes as $tabla) {
        echo "  • $tabla\n";
    }
    echo "\n";
} else {
    echo "✅ TODAS LAS TABLAS REQUERIDAS ESTÁN PRESENTES\n\n";
}

// ========================================================================
// ➕ TABLAS ADICIONALES
// ========================================================================
$tablasAdicionales = array_diff($tablasExistentes, $tablasRequeridas);

if (!empty($tablasAdicionales)) {
    echo "➕ TABLAS ADICIONALES ENCONTRADAS (" . count($tablasAdicionales) . "):\n";
    echo str_repeat("-", 40) . "\n";
    
    foreach ($tablasAdicionales as $tabla) {
        echo "  • $tabla\n";
    }
    echo "\n";
}

// ========================================================================
// 🔧 VERIFICAR ESTRUCTURA DE TABLAS CRÍTICAS
// ========================================================================
echo "🔧 VERIFICANDO ESTRUCTURA DE TABLAS CRÍTICAS...\n";
echo str_repeat("-", 50) . "\n";

$tablasCriticas = [
    'usuarios' => ['id', 'nombre', 'email', 'rol_id'],
    'equipos' => ['id', 'name', 'code', 'serial'],
    'ordenes' => ['id', 'descripcion', 'estado_id', 'reportante_id'],
    'notification_logs' => ['id', 'email', 'subject', 'status'],
    'digital_signatures' => ['id', 'ticket_id', 'signature_data'],
    'guias_rapidas' => ['id', 'name', 'file_path']
];

foreach ($tablasCriticas as $tabla => $camposRequeridos) {
    if (in_array($tabla, $tablasExistentes)) {
        try {
            $stmt = $pdo->query("DESCRIBE $tabla");
            $campos = $stmt->fetchAll(PDO::FETCH_COLUMN);
            
            $camposFaltantes = array_diff($camposRequeridos, $campos);
            
            if (empty($camposFaltantes)) {
                echo "✅ $tabla - Estructura correcta\n";
            } else {
                echo "⚠️  $tabla - Faltan campos: " . implode(', ', $camposFaltantes) . "\n";
            }
            
        } catch (PDOException $e) {
            echo "❌ $tabla - Error al verificar: " . $e->getMessage() . "\n";
        }
    } else {
        echo "❌ $tabla - TABLA NO EXISTE\n";
    }
}

// ========================================================================
// 📊 ESTADÍSTICAS FINALES
// ========================================================================
echo "\n" . str_repeat("=", 60) . "\n";
echo "📊 ESTADÍSTICAS FINALES:\n";
echo str_repeat("=", 60) . "\n";

$porcentajeCompletitud = round((count($tablasRequeridas) - count($tablasFaltantes)) / count($tablasRequeridas) * 100, 2);

echo "• Completitud de la BD: $porcentajeCompletitud%\n";
echo "• Tablas faltantes: " . count($tablasFaltantes) . "\n";
echo "• Tablas adicionales: " . count($tablasAdicionales) . "\n";

if (count($tablasFaltantes) > 0) {
    echo "\n🔧 ACCIÓN RECOMENDADA:\n";
    echo "Ejecutar el script 'RECREAR-TABLAS-PERDIDAS.sql' para crear las tablas faltantes.\n";
} else {
    echo "\n🎉 ¡BASE DE DATOS COMPLETA!\n";
    echo "Todas las tablas requeridas están presentes.\n";
}

echo "\n" . str_repeat("=", 60) . "\n";
echo "✅ Verificación completada\n";

?>
