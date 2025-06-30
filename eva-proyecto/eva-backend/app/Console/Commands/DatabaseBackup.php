<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use ZipArchive;

class DatabaseBackup extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'backup:database {--compress : Compress the backup file} {--include-uploads : Include uploaded files}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create a backup of the database and optionally uploaded files';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🔄 Iniciando backup de la base de datos...');
        
        $timestamp = now()->format('Y-m-d_H-i-s');
        $backupName = "eva_backup_{$timestamp}";
        
        try {
            // Crear directorio de backup si no existe
            $backupPath = storage_path('app/backups');
            if (!is_dir($backupPath)) {
                mkdir($backupPath, 0755, true);
            }

            // Backup de la base de datos
            $sqlFile = $this->createDatabaseBackup($backupPath, $backupName);
            $this->info("✅ Backup de base de datos creado: {$sqlFile}");

            $filesToCompress = [$sqlFile];

            // Incluir archivos subidos si se solicita
            if ($this->option('include-uploads')) {
                $uploadsBackup = $this->backupUploads($backupPath, $backupName);
                if ($uploadsBackup) {
                    $filesToCompress[] = $uploadsBackup;
                    $this->info("✅ Backup de archivos subidos creado: {$uploadsBackup}");
                }
            }

            // Comprimir si se solicita
            if ($this->option('compress')) {
                $compressedFile = $this->compressBackup($backupPath, $backupName, $filesToCompress);
                
                // Eliminar archivos individuales después de comprimir
                foreach ($filesToCompress as $file) {
                    if (file_exists($file)) {
                        unlink($file);
                    }
                }
                
                $this->info("✅ Backup comprimido creado: {$compressedFile}");
                $finalFile = $compressedFile;
            } else {
                $finalFile = $sqlFile;
            }

            // Limpiar backups antiguos
            $this->cleanOldBackups($backupPath);

            // Mostrar información del backup
            $fileSize = $this->formatBytes(filesize($finalFile));
            $this->info("📦 Backup completado exitosamente");
            $this->info("📁 Archivo: " . basename($finalFile));
            $this->info("📏 Tamaño: {$fileSize}");
            $this->info("📅 Fecha: " . now()->format('Y-m-d H:i:s'));

            return 0;

        } catch (\Exception $e) {
            $this->error("❌ Error durante el backup: " . $e->getMessage());
            \Log::error('Database backup failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return 1;
        }
    }

    /**
     * Crear backup de la base de datos
     */
    private function createDatabaseBackup(string $backupPath, string $backupName): string
    {
        $connection = config('database.default');
        $config = config("database.connections.{$connection}");
        
        $sqlFile = "{$backupPath}/{$backupName}.sql";

        if ($config['driver'] === 'sqlite') {
            return $this->backupSqlite($config, $sqlFile);
        } elseif ($config['driver'] === 'mysql') {
            return $this->backupMysql($config, $sqlFile);
        } else {
            throw new \Exception("Driver de base de datos no soportado: " . $config['driver']);
        }
    }

    /**
     * Backup de SQLite
     */
    private function backupSqlite(array $config, string $sqlFile): string
    {
        $dbPath = $config['database'];
        
        if (!file_exists($dbPath)) {
            throw new \Exception("Archivo de base de datos SQLite no encontrado: {$dbPath}");
        }

        // Para SQLite, simplemente copiamos el archivo
        if (!copy($dbPath, $sqlFile)) {
            throw new \Exception("No se pudo copiar el archivo de base de datos SQLite");
        }

        return $sqlFile;
    }

    /**
     * Backup de MySQL
     */
    private function backupMysql(array $config, string $sqlFile): string
    {
        $host = $config['host'];
        $port = $config['port'];
        $database = $config['database'];
        $username = $config['username'];
        $password = $config['password'];

        // Construir comando mysqldump
        $command = sprintf(
            'mysqldump --host=%s --port=%s --user=%s --password=%s --single-transaction --routines --triggers %s > %s',
            escapeshellarg($host),
            escapeshellarg($port),
            escapeshellarg($username),
            escapeshellarg($password),
            escapeshellarg($database),
            escapeshellarg($sqlFile)
        );

        // Ejecutar comando
        $output = [];
        $returnCode = 0;
        exec($command, $output, $returnCode);

        if ($returnCode !== 0) {
            throw new \Exception("Error ejecutando mysqldump. Código de retorno: {$returnCode}");
        }

        if (!file_exists($sqlFile) || filesize($sqlFile) === 0) {
            throw new \Exception("El archivo de backup está vacío o no se creó correctamente");
        }

        return $sqlFile;
    }

    /**
     * Backup de archivos subidos
     */
    private function backupUploads(string $backupPath, string $backupName): ?string
    {
        $uploadsPath = storage_path('app/public');
        
        if (!is_dir($uploadsPath)) {
            $this->warn("⚠️ Directorio de uploads no encontrado: {$uploadsPath}");
            return null;
        }

        $uploadsBackup = "{$backupPath}/{$backupName}_uploads.tar.gz";

        // Crear archivo tar.gz de los uploads
        $command = sprintf(
            'tar -czf %s -C %s .',
            escapeshellarg($uploadsBackup),
            escapeshellarg($uploadsPath)
        );

        $output = [];
        $returnCode = 0;
        exec($command, $output, $returnCode);

        if ($returnCode !== 0) {
            $this->warn("⚠️ Error creando backup de uploads. Código de retorno: {$returnCode}");
            return null;
        }

        return $uploadsBackup;
    }

    /**
     * Comprimir backup
     */
    private function compressBackup(string $backupPath, string $backupName, array $files): string
    {
        $zipFile = "{$backupPath}/{$backupName}.zip";
        
        $zip = new ZipArchive();
        $result = $zip->open($zipFile, ZipArchive::CREATE | ZipArchive::OVERWRITE);
        
        if ($result !== TRUE) {
            throw new \Exception("No se pudo crear el archivo ZIP. Código de error: {$result}");
        }

        foreach ($files as $file) {
            if (file_exists($file)) {
                $zip->addFile($file, basename($file));
            }
        }

        // Agregar información del backup
        $backupInfo = [
            'created_at' => now()->toISOString(),
            'laravel_version' => app()->version(),
            'php_version' => PHP_VERSION,
            'database_driver' => config('database.default'),
            'files_included' => array_map('basename', $files),
            'eva_version' => '1.0.0' // Versión del sistema EVA
        ];

        $zip->addFromString('backup_info.json', json_encode($backupInfo, JSON_PRETTY_PRINT));
        $zip->close();

        return $zipFile;
    }

    /**
     * Limpiar backups antiguos
     */
    private function cleanOldBackups(string $backupPath): void
    {
        $retentionDays = config('monitoring.backup.retention_days', 30);
        $cutoffDate = now()->subDays($retentionDays);

        $files = glob("{$backupPath}/eva_backup_*");
        $deletedCount = 0;

        foreach ($files as $file) {
            $fileTime = filemtime($file);
            if ($fileTime && Carbon::createFromTimestamp($fileTime)->lt($cutoffDate)) {
                if (unlink($file)) {
                    $deletedCount++;
                }
            }
        }

        if ($deletedCount > 0) {
            $this->info("🗑️ Eliminados {$deletedCount} backups antiguos");
        }
    }

    /**
     * Formatear bytes a formato legible
     */
    private function formatBytes(int $bytes, int $precision = 2): string
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];

        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }

        return round($bytes, $precision) . ' ' . $units[$i];
    }
}
