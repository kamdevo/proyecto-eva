<?php
/**
 * Script para hacer backup completo de la base de datos
 * EJECUTAR ANTES DE CUALQUIER CAMBIO EN PRODUCCIÓN
 */

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

echo "=== BACKUP DE BASE DE DATOS ===\n\n";

$dbName = env('DB_DATABASE');
$dbUser = env('DB_USERNAME');
$dbPass = env('DB_PASSWORD');
$dbHost = env('DB_HOST', 'localhost');
$dbPort = env('DB_PORT', '3306');

$backupDir = __DIR__ . '/storage/backups';
if (!file_exists($backupDir)) {
    mkdir($backupDir, 0755, true);
}

$timestamp = date('Y-m-d_His');
$backupFile = "{$backupDir}/backup_{$dbName}_{$timestamp}.sql";

echo "Base de datos: {$dbName}\n";
echo "Archivo de backup: {$backupFile}\n\n";

// Comando mysqldump
$command = sprintf(
    'mysqldump --user=%s --password=%s --host=%s --port=%s %s > %s',
    escapeshellarg($dbUser),
    escapeshellarg($dbPass),
    escapeshellarg($dbHost),
    escapeshellarg($dbPort),
    escapeshellarg($dbName),
    escapeshellarg($backupFile)
);

echo "Ejecutando backup...\n";
exec($command, $output, $returnVar);

if ($returnVar === 0) {
    $fileSize = filesize($backupFile);
    $fileSizeMB = round($fileSize / 1024 / 1024, 2);
    
    echo "\n✅ Backup completado exitosamente!\n";
    echo "Tamaño del archivo: {$fileSizeMB} MB\n";
    echo "Ubicación: {$backupFile}\n\n";
    
    // Comprimir el backup
    echo "Comprimiendo backup...\n";
    $zipFile = "{$backupFile}.zip";
    $zip = new ZipArchive();
    
    if ($zip->open($zipFile, ZipArchive::CREATE) === TRUE) {
        $zip->addFile($backupFile, basename($backupFile));
        $zip->close();
        
        $zipSize = filesize($zipFile);
        $zipSizeMB = round($zipSize / 1024 / 1024, 2);
        
        echo "✅ Backup comprimido: {$zipSizeMB} MB\n";
        echo "Archivo comprimido: {$zipFile}\n\n";
        
        // Eliminar archivo SQL sin comprimir
        unlink($backupFile);
    }
    
    echo "⚠️  IMPORTANTE: Guarda este backup en un lugar seguro!\n";
} else {
    echo "\n❌ Error al crear el backup\n";
    echo "Código de error: {$returnVar}\n";
}

echo "\n=== FIN ===\n";
