<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Carbon\Carbon;

class CleanOldLogs extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'logs:clean {--days=30 : Number of days to keep logs}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Clean old log files to free up disk space';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $days = $this->option('days');
        $cutoffDate = Carbon::now()->subDays($days);
        
        $logPath = storage_path('logs');
        
        if (!File::exists($logPath)) {
            $this->error('Log directory does not exist: ' . $logPath);
            return 1;
        }

        $this->info("Cleaning logs older than {$days} days (before {$cutoffDate->format('Y-m-d')})...");

        $deletedFiles = 0;
        $totalSize = 0;

        $files = File::files($logPath);

        foreach ($files as $file) {
            $fileDate = Carbon::createFromTimestamp($file->getMTime());
            
            if ($fileDate->lt($cutoffDate)) {
                $fileSize = $file->getSize();
                $fileName = $file->getFilename();
                
                // No eliminar el log actual del día
                if ($fileName === 'laravel.log') {
                    continue;
                }

                try {
                    File::delete($file->getPathname());
                    $deletedFiles++;
                    $totalSize += $fileSize;
                    
                    $this->line("Deleted: {$fileName} (" . $this->formatBytes($fileSize) . ")");
                } catch (\Exception $e) {
                    $this->error("Failed to delete {$fileName}: " . $e->getMessage());
                }
            }
        }

        if ($deletedFiles > 0) {
            $this->info("Successfully deleted {$deletedFiles} log files, freed " . $this->formatBytes($totalSize) . " of disk space.");
        } else {
            $this->info("No old log files found to delete.");
        }

        return 0;
    }

    /**
     * Format bytes to human readable format
     */
    private function formatBytes($bytes, $precision = 2)
    {
        $units = array('B', 'KB', 'MB', 'GB', 'TB');

        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }

        return round($bytes, $precision) . ' ' . $units[$i];
    }
}
