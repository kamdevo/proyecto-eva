<?php

namespace App\Listeners;

use App\Events\Export\DataExported;
use App\Notifications\DataExportedNotification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;

class ExportListener implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * The number of times the job may be attempted.
     */
    public int $tries = 3;

    /**
     * Handle data exported event.
     */
    public function handleDataExported(DataExported $event): void
    {
        try {
            // Log the export action
            $this->logExportAction($event);

            // Update export metrics
            $this->updateExportMetrics($event);

            // Handle compliance tracking
            $this->trackComplianceExport($event);

            // Send notifications if needed
            if ($event->shouldNotify()) {
                $this->sendNotifications($event);
            }

            // Create system alert for sensitive data exports
            if ($event->containsSensitiveData()) {
                $this->createSensitiveDataAlert($event);
            }

            // Update export statistics
            $this->updateExportStatistics($event);

            // Handle file cleanup if needed
            $this->scheduleFileCleanup($event);

        } catch (\Exception $e) {
            Log::error('Failed to handle data exported event', [
                'export_type' => $event->exportType,
                'user_id' => $event->user?->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }

    /**
     * Log export action.
     */
    protected function logExportAction(DataExported $event): void
    {
        $logData = [
            'export_type' => $event->exportType,
            'format' => $event->format,
            'record_count' => $event->getRecordCount(),
            'file_size_mb' => $event->getFileSizeMB(),
            'processing_time' => $event->getProcessingTime(),
            'success' => $event->wasSuccessful(),
            'filters' => $event->filters,
            'user_id' => $event->user?->id,
            'user_name' => $event->user?->getFullNameAttribute(),
            'timestamp' => $event->timestamp,
            'contains_sensitive_data' => $event->containsSensitiveData(),
            'is_large_export' => $event->isLargeExport(),
        ];

        // Log to audit channel for compliance
        Log::channel('audit')->info('Data export performed', $logData);

        // Store in audit trail
        $this->storeInAuditTrail($event, $logData);
    }

    /**
     * Store in audit trail.
     */
    protected function storeInAuditTrail(DataExported $event, array $logData): void
    {
        try {
            DB::table('audit_trail')->insert([
                'auditable_type' => 'data_export',
                'auditable_id' => 0,
                'event_type' => 'data.exported',
                'user_id' => $event->user?->id,
                'old_values' => null,
                'new_values' => json_encode($event->results),
                'ip_address' => $event->metadata['ip'] ?? null,
                'user_agent' => $event->metadata['user_agent'] ?? null,
                'metadata' => json_encode($logData),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to store export action in audit trail', [
                'export_type' => $event->exportType,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Update export metrics.
     */
    protected function updateExportMetrics(DataExported $event): void
    {
        $today = now()->format('Y-m-d');
        $hour = now()->hour;

        // Update daily export count
        Cache::increment("exports:daily:{$today}");
        
        // Update hourly export count
        Cache::increment("exports:hourly:{$today}:{$hour}");
        
        // Update export type metrics
        Cache::increment("exports:type:{$event->exportType}:daily:{$today}");
        
        // Update user-specific metrics
        if ($event->user) {
            Cache::increment("exports:user:{$event->user->id}:daily:{$today}");
        }

        // Update sensitive data export metrics
        if ($event->containsSensitiveData()) {
            Cache::increment("exports:sensitive:daily:{$today}");
        }

        // Store metrics in database
        $this->storeMetricsInDatabase($event, $today, $hour);
    }

    /**
     * Store metrics in database.
     */
    protected function storeMetricsInDatabase(DataExported $event, string $date, int $hour): void
    {
        try {
            // Store daily metrics
            DB::table('event_metrics')->updateOrInsert(
                [
                    'metric_type' => 'data_exports',
                    'metric_category' => 'daily',
                    'metric_key' => $event->exportType,
                    'metric_date' => $date,
                    'metric_hour' => null,
                ],
                [
                    'metric_value' => DB::raw('metric_value + 1'),
                    'metadata' => json_encode([
                        'user_id' => $event->user?->id,
                        'record_count' => $event->getRecordCount(),
                        'file_size_mb' => $event->getFileSizeMB(),
                        'contains_sensitive_data' => $event->containsSensitiveData(),
                    ]),
                    'updated_at' => now(),
                ]
            );

            // Store record count metrics
            DB::table('event_metrics')->updateOrInsert(
                [
                    'metric_type' => 'export_records',
                    'metric_category' => 'daily',
                    'metric_key' => $event->exportType,
                    'metric_date' => $date,
                    'metric_hour' => null,
                ],
                [
                    'metric_value' => DB::raw('metric_value + ' . $event->getRecordCount()),
                    'metadata' => json_encode([
                        'user_id' => $event->user?->id,
                        'format' => $event->format,
                    ]),
                    'updated_at' => now(),
                ]
            );
        } catch (\Exception $e) {
            Log::error('Failed to store export metrics', [
                'export_type' => $event->exportType,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Track compliance export.
     */
    protected function trackComplianceExport(DataExported $event): void
    {
        $complianceInfo = $event->getComplianceInfo();
        
        try {
            DB::table('compliance_exports')->insert([
                'export_type' => $event->exportType,
                'exported_by' => $event->user?->id,
                'record_count' => $event->getRecordCount(),
                'contains_pii' => $complianceInfo['contains_pii'],
                'data_access_level' => $complianceInfo['access_level'],
                'retention_period_days' => $complianceInfo['retention_period'],
                'export_reason' => $event->metadata['export_reason'] ?? null,
                'file_path' => $event->fileInfo['path'] ?? null,
                'file_hash' => $event->fileInfo['hash'] ?? null,
                'exported_at' => now(),
                'expires_at' => now()->addDays($complianceInfo['retention_period']),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to track compliance export', [
                'export_type' => $event->exportType,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Send notifications.
     */
    protected function sendNotifications(DataExported $event): void
    {
        $usersToNotify = $event->getUsersToNotify();
        
        if ($usersToNotify->isEmpty()) {
            return;
        }

        try {
            Notification::send($usersToNotify, new DataExportedNotification($event));
            
            Log::info('Export notifications sent', [
                'export_type' => $event->exportType,
                'recipients_count' => $usersToNotify->count(),
                'contains_sensitive_data' => $event->containsSensitiveData(),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send export notifications', [
                'export_type' => $event->exportType,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Create sensitive data alert.
     */
    protected function createSensitiveDataAlert(DataExported $event): void
    {
        try {
            DB::table('system_alerts')->insert([
                'type' => 'sensitive_data_export',
                'title' => 'Exportación de Datos Sensibles',
                'message' => "Se han exportado datos sensibles: {$event->exportType}",
                'severity' => 'high',
                'status' => 'active',
                'created_by' => $event->user?->id,
                'data' => json_encode([
                    'export_type' => $event->exportType,
                    'record_count' => $event->getRecordCount(),
                    'file_size_mb' => $event->getFileSizeMB(),
                    'compliance_info' => $event->getComplianceInfo(),
                ]),
                'expires_at' => now()->addDays(30),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to create sensitive data alert', [
                'export_type' => $event->exportType,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Update export statistics.
     */
    protected function updateExportStatistics(DataExported $event): void
    {
        // Update global export statistics
        $totalExports = Cache::get('exports:total_count', 0) + 1;
        Cache::put('exports:total_count', $totalExports, 3600);

        // Update export type statistics
        $typeKey = "exports:type:{$event->exportType}:count";
        Cache::increment($typeKey);

        // Update format statistics
        $formatKey = "exports:format:{$event->format}:count";
        Cache::increment($formatKey);
    }

    /**
     * Schedule file cleanup.
     */
    protected function scheduleFileCleanup(DataExported $event): void
    {
        if (!isset($event->fileInfo['path'])) {
            return;
        }

        $retentionDays = $event->getComplianceInfo()['retention_period'];
        $cleanupDate = now()->addDays($retentionDays);

        try {
            DB::table('scheduled_file_cleanups')->insert([
                'file_path' => $event->fileInfo['path'],
                'export_type' => $event->exportType,
                'created_by' => $event->user?->id,
                'cleanup_date' => $cleanupDate,
                'created_at' => now(),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to schedule file cleanup', [
                'file_path' => $event->fileInfo['path'],
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Handle job failure.
     */
    public function failed(DataExported $event, \Throwable $exception): void
    {
        Log::error('Export listener failed', [
            'export_type' => $event->exportType,
            'user_id' => $event->user?->id,
            'error' => $exception->getMessage(),
            'trace' => $exception->getTraceAsString(),
        ]);
    }
}
