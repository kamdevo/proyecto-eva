<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

/**
 * Comando para limpiar logs antiguos de notificaciones
 * Mantiene el sistema optimizado eliminando registros antiguos
 */
class NotificationCleanup extends Command
{
    /**
     * Nombre y firma del comando
     */
    protected $signature = 'notifications:cleanup 
                            {--days=90 : Días de retención de logs}
                            {--dry-run : Simular limpieza sin eliminar registros}
                            {--force : Forzar limpieza sin confirmación}';

    /**
     * Descripción del comando
     */
    protected $description = 'Limpiar logs antiguos de notificaciones y optimizar base de datos';

    /**
     * Ejecutar el comando
     */
    public function handle()
    {
        $this->info('🧹 Iniciando limpieza de logs de notificaciones...');
        
        $days = (int) $this->option('days');
        $dryRun = $this->option('dry-run');
        $force = $this->option('force');
        
        if ($dryRun) {
            $this->warn('⚠️ MODO SIMULACIÓN - No se eliminarán registros reales');
        }

        $cutoffDate = Carbon::now()->subDays($days);
        $this->info("📅 Eliminando registros anteriores a: " . $cutoffDate->format('Y-m-d H:i:s'));

        // Verificar registros a eliminar
        $stats = $this->getCleanupStats($cutoffDate);
        $this->displayStats($stats);

        // Confirmar limpieza si no es forzada
        if (!$force && !$dryRun) {
            if (!$this->confirm('¿Continuar con la limpieza?')) {
                $this->info('❌ Limpieza cancelada por el usuario');
                return 1;
            }
        }

        // Ejecutar limpieza
        $results = $this->performCleanup($cutoffDate, $dryRun);
        $this->displayResults($results);

        // Optimizar tablas después de la limpieza
        if (!$dryRun && $results['total_deleted'] > 0) {
            $this->optimizeTables();
        }

        $this->info('✅ Limpieza completada exitosamente');
        return 0;
    }

    /**
     * Obtener estadísticas de limpieza
     */
    private function getCleanupStats(Carbon $cutoffDate): array
    {
        $stats = [
            'notification_logs' => DB::table('notification_logs')
                ->where('created_at', '<', $cutoffDate)
                ->count(),
                
            'old_notifications' => DB::table('notifications')
                ->where('created_at', '<', $cutoffDate)
                ->whereNotNull('read_at')
                ->count(),
                
            'failed_jobs' => DB::table('failed_jobs')
                ->where('failed_at', '<', $cutoffDate)
                ->count(),
                
            'total_notification_logs' => DB::table('notification_logs')->count(),
            'total_notifications' => DB::table('notifications')->count(),
            'total_failed_jobs' => DB::table('failed_jobs')->count(),
        ];

        $stats['total_to_delete'] = $stats['notification_logs'] + 
                                   $stats['old_notifications'] + 
                                   $stats['failed_jobs'];

        return $stats;
    }

    /**
     * Mostrar estadísticas
     */
    private function displayStats(array $stats): void
    {
        $this->info("\n📊 ESTADÍSTICAS DE LIMPIEZA");
        $this->info("=" . str_repeat("=", 40));
        
        $this->table(
            ['Tabla', 'A Eliminar', 'Total Actual', 'Porcentaje'],
            [
                [
                    'notification_logs',
                    number_format($stats['notification_logs']),
                    number_format($stats['total_notification_logs']),
                    $stats['total_notification_logs'] > 0 ? 
                        round(($stats['notification_logs'] / $stats['total_notification_logs']) * 100, 2) . '%' : '0%'
                ],
                [
                    'notifications (leídas)',
                    number_format($stats['old_notifications']),
                    number_format($stats['total_notifications']),
                    $stats['total_notifications'] > 0 ? 
                        round(($stats['old_notifications'] / $stats['total_notifications']) * 100, 2) . '%' : '0%'
                ],
                [
                    'failed_jobs',
                    number_format($stats['failed_jobs']),
                    number_format($stats['total_failed_jobs']),
                    $stats['total_failed_jobs'] > 0 ? 
                        round(($stats['failed_jobs'] / $stats['total_failed_jobs']) * 100, 2) . '%' : '0%'
                ],
                [
                    'TOTAL',
                    number_format($stats['total_to_delete']),
                    '-',
                    '-'
                ]
            ]
        );
    }

    /**
     * Ejecutar limpieza
     */
    private function performCleanup(Carbon $cutoffDate, bool $dryRun): array
    {
        $results = [
            'notification_logs_deleted' => 0,
            'notifications_deleted' => 0,
            'failed_jobs_deleted' => 0,
            'total_deleted' => 0
        ];

        if ($dryRun) {
            $this->info("\n🔍 SIMULACIÓN DE LIMPIEZA");
            $this->info("=" . str_repeat("=", 40));
            $this->line("✓ Se eliminarían logs de notificaciones antiguos");
            $this->line("✓ Se eliminarían notificaciones leídas antiguas");
            $this->line("✓ Se eliminarían trabajos fallidos antiguos");
            return $results;
        }

        $this->info("\n🗑️ EJECUTANDO LIMPIEZA");
        $this->info("=" . str_repeat("=", 40));

        // Limpiar logs de notificaciones
        $this->line("🧹 Limpiando logs de notificaciones...");
        $results['notification_logs_deleted'] = DB::table('notification_logs')
            ->where('created_at', '<', $cutoffDate)
            ->delete();
        $this->info("   ✓ Eliminados: " . number_format($results['notification_logs_deleted']));

        // Limpiar notificaciones leídas antiguas
        $this->line("🧹 Limpiando notificaciones leídas antiguas...");
        $results['notifications_deleted'] = DB::table('notifications')
            ->where('created_at', '<', $cutoffDate)
            ->whereNotNull('read_at')
            ->delete();
        $this->info("   ✓ Eliminadas: " . number_format($results['notifications_deleted']));

        // Limpiar trabajos fallidos antiguos
        $this->line("🧹 Limpiando trabajos fallidos antiguos...");
        $results['failed_jobs_deleted'] = DB::table('failed_jobs')
            ->where('failed_at', '<', $cutoffDate)
            ->delete();
        $this->info("   ✓ Eliminados: " . number_format($results['failed_jobs_deleted']));

        $results['total_deleted'] = $results['notification_logs_deleted'] + 
                                   $results['notifications_deleted'] + 
                                   $results['failed_jobs_deleted'];

        return $results;
    }

    /**
     * Mostrar resultados
     */
    private function displayResults(array $results): void
    {
        $this->info("\n📈 RESULTADOS DE LIMPIEZA");
        $this->info("=" . str_repeat("=", 40));
        
        $this->table(
            ['Tabla', 'Registros Eliminados'],
            [
                ['notification_logs', number_format($results['notification_logs_deleted'])],
                ['notifications', number_format($results['notifications_deleted'])],
                ['failed_jobs', number_format($results['failed_jobs_deleted'])],
                ['TOTAL', number_format($results['total_deleted'])]
            ]
        );

        if ($results['total_deleted'] > 0) {
            $this->info("💾 Espacio liberado estimado: " . $this->estimateSpaceSaved($results['total_deleted']));
        }
    }

    /**
     * Optimizar tablas después de la limpieza
     */
    private function optimizeTables(): void
    {
        $this->info("\n⚡ Optimizando tablas...");
        
        $tables = ['notification_logs', 'notifications', 'failed_jobs'];
        
        foreach ($tables as $table) {
            try {
                $this->line("   🔧 Optimizando tabla: {$table}");
                DB::statement("OPTIMIZE TABLE {$table}");
                $this->info("   ✓ {$table} optimizada");
            } catch (\Exception $e) {
                $this->warn("   ⚠️ Error optimizando {$table}: " . $e->getMessage());
            }
        }
    }

    /**
     * Estimar espacio ahorrado
     */
    private function estimateSpaceSaved(int $recordsDeleted): string
    {
        // Estimación aproximada: 1KB por registro promedio
        $bytesEstimated = $recordsDeleted * 1024;
        
        if ($bytesEstimated < 1024 * 1024) {
            return round($bytesEstimated / 1024, 2) . ' KB';
        } elseif ($bytesEstimated < 1024 * 1024 * 1024) {
            return round($bytesEstimated / (1024 * 1024), 2) . ' MB';
        } else {
            return round($bytesEstimated / (1024 * 1024 * 1024), 2) . ' GB';
        }
    }
}
