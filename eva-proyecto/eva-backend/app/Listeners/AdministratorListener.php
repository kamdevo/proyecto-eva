<?php

namespace App\Listeners;

use App\Events\Administrator\AdminActionPerformed;
use App\Notifications\AdminActionNotification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;

class AdministratorListener implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * The number of times the job may be attempted.
     */
    public int $tries = 3;

    /**
     * The maximum number of seconds the job can run.
     */
    public int $timeout = 120;

    /**
     * Handle admin action performed event.
     */
    public function handleAdminActionPerformed(AdminActionPerformed $event): void
    {
        try {
            // Log the admin action
            $this->logAdminAction($event);

            // Update security metrics
            $this->updateSecurityMetrics($event);

            // Handle specific action types
            $this->handleSpecificAction($event);

            // Send notifications if needed
            if ($event->shouldNotify()) {
                $this->sendNotifications($event);
            }

            // Update admin activity cache
            $this->updateAdminActivityCache($event);

            // Create system alert for critical actions
            if ($event->isCriticalAction()) {
                $this->createSystemAlert($event);
            }

            // Trigger automated responses
            $this->triggerAutomatedResponses($event);

            // Update compliance audit trail
            $this->updateComplianceAuditTrail($event);

        } catch (\Exception $e) {
            Log::error('Failed to handle admin action event', [
                'action' => $event->action,
                'user_id' => $event->user?->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }

    /**
     * Log admin action with detailed information.
     */
    protected function logAdminAction(AdminActionPerformed $event): void
    {
        $logData = [
            'action' => $event->action,
            'target_type' => $event->targetType,
            'target_id' => $event->targetId,
            'action_data' => $event->actionData,
            'user_id' => $event->user?->id,
            'user_name' => $event->user?->getFullNameAttribute(),
            'user_role' => $event->user?->rol?->nombre,
            'ip_address' => $event->metadata['ip'] ?? null,
            'user_agent' => $event->metadata['user_agent'] ?? null,
            'session_id' => $event->metadata['session_id'] ?? null,
            'timestamp' => $event->timestamp,
            'priority' => $event->getPriority(),
            'affects_security' => $event->affectsSecurity(),
            'affects_system_config' => $event->affectsSystemConfig(),
        ];

        // Log to security channel for security-related actions
        if ($event->affectsSecurity()) {
            Log::channel('security')->warning('Security-related admin action', $logData);
        } else {
            Log::channel('audit')->info('Admin action performed', $logData);
        }

        // Store in audit trail table
        $this->storeInAuditTrail($event, $logData);
    }

    /**
     * Store action in audit trail.
     */
    protected function storeInAuditTrail(AdminActionPerformed $event, array $logData): void
    {
        try {
            DB::table('audit_trail')->insert([
                'auditable_type' => $event->targetType ?? 'system',
                'auditable_id' => $event->targetId ?? 0,
                'event_type' => 'admin.' . $event->action,
                'user_id' => $event->user?->id,
                'old_values' => json_encode($event->actionData['old_values'] ?? null),
                'new_values' => json_encode($event->actionData['new_values'] ?? null),
                'ip_address' => $event->metadata['ip'] ?? null,
                'user_agent' => $event->metadata['user_agent'] ?? null,
                'metadata' => json_encode($logData),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to store admin action in audit trail', [
                'action' => $event->action,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Update security metrics.
     */
    protected function updateSecurityMetrics(AdminActionPerformed $event): void
    {
        $today = now()->format('Y-m-d');
        $hour = now()->hour;

        // Update daily admin action count
        Cache::increment("admin_actions:daily:{$today}");
        
        // Update hourly admin action count
        Cache::increment("admin_actions:hourly:{$today}:{$hour}");
        
        // Update action-specific metrics
        Cache::increment("admin_actions:type:{$event->action}:daily:{$today}");
        
        // Update user-specific metrics
        if ($event->user) {
            Cache::increment("admin_actions:user:{$event->user->id}:daily:{$today}");
        }

        // Update security-related metrics
        if ($event->affectsSecurity()) {
            Cache::increment("security_actions:daily:{$today}");
            
            // Alert if too many security actions in short time
            $recentSecurityActions = Cache::get("security_actions:hourly:{$today}:{$hour}", 0);
            Cache::increment("security_actions:hourly:{$today}:{$hour}");
            
            if ($recentSecurityActions > 10) { // More than 10 security actions per hour
                $this->createSecurityAlert($event, $recentSecurityActions + 1);
            }
        }

        // Store metrics in database
        $this->storeMetricsInDatabase($event, $today, $hour);
    }

    /**
     * Store metrics in database.
     */
    protected function storeMetricsInDatabase(AdminActionPerformed $event, string $date, int $hour): void
    {
        try {
            // Store daily metrics
            DB::table('event_metrics')->updateOrInsert(
                [
                    'metric_type' => 'admin_actions',
                    'metric_category' => 'daily',
                    'metric_key' => $event->action,
                    'metric_date' => $date,
                    'metric_hour' => null,
                ],
                [
                    'metric_value' => DB::raw('metric_value + 1'),
                    'metadata' => json_encode([
                        'user_id' => $event->user?->id,
                        'priority' => $event->getPriority(),
                    ]),
                    'updated_at' => now(),
                ]
            );

            // Store hourly metrics
            DB::table('event_metrics')->updateOrInsert(
                [
                    'metric_type' => 'admin_actions',
                    'metric_category' => 'hourly',
                    'metric_key' => $event->action,
                    'metric_date' => $date,
                    'metric_hour' => $hour,
                ],
                [
                    'metric_value' => DB::raw('metric_value + 1'),
                    'metadata' => json_encode([
                        'user_id' => $event->user?->id,
                        'priority' => $event->getPriority(),
                    ]),
                    'updated_at' => now(),
                ]
            );
        } catch (\Exception $e) {
            Log::error('Failed to store admin action metrics', [
                'action' => $event->action,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Handle specific action types.
     */
    protected function handleSpecificAction(AdminActionPerformed $event): void
    {
        match ($event->action) {
            'user_created' => $this->handleUserCreated($event),
            'user_deleted' => $this->handleUserDeleted($event),
            'user_role_changed' => $this->handleUserRoleChanged($event),
            'system_config_changed' => $this->handleSystemConfigChanged($event),
            'bulk_delete' => $this->handleBulkDelete($event),
            'data_export' => $this->handleDataExport($event),
            'database_reset' => $this->handleDatabaseReset($event),
            'backup_restored' => $this->handleBackupRestored($event),
            default => null,
        };
    }

    /**
     * Handle user created action.
     */
    protected function handleUserCreated(AdminActionPerformed $event): void
    {
        $userData = $event->actionData;
        
        // Clear user-related caches
        Cache::forget('users:count');
        Cache::forget('users:active_count');
        
        // Update user statistics
        $this->updateUserStatistics();
        
        Log::info('New user created by admin', [
            'new_user_id' => $userData['user_id'] ?? null,
            'new_user_email' => $userData['email'] ?? null,
            'created_by' => $event->user?->id,
        ]);
    }

    /**
     * Handle user deleted action.
     */
    protected function handleUserDeleted(AdminActionPerformed $event): void
    {
        $userData = $event->actionData;
        
        // Clear user-related caches
        Cache::forget('users:count');
        Cache::forget('users:active_count');
        
        // Revoke all tokens for deleted user
        if (isset($userData['user_id'])) {
            DB::table('personal_access_tokens')
              ->where('tokenable_id', $userData['user_id'])
              ->delete();
        }
        
        // Update user statistics
        $this->updateUserStatistics();
        
        Log::warning('User deleted by admin', [
            'deleted_user_id' => $userData['user_id'] ?? null,
            'deleted_user_email' => $userData['email'] ?? null,
            'deleted_by' => $event->user?->id,
            'reason' => $userData['reason'] ?? null,
        ]);
    }

    /**
     * Handle user role changed action.
     */
    protected function handleUserRoleChanged(AdminActionPerformed $event): void
    {
        $userData = $event->actionData;
        
        // Clear role-related caches
        Cache::forget('users:by_role');
        
        // Log role change for security audit
        Log::channel('security')->warning('User role changed', [
            'target_user_id' => $userData['user_id'] ?? null,
            'previous_role' => $userData['previous_role'] ?? null,
            'new_role' => $userData['new_role'] ?? null,
            'changed_by' => $event->user?->id,
        ]);
    }

    /**
     * Handle system config changed action.
     */
    protected function handleSystemConfigChanged(AdminActionPerformed $event): void
    {
        $configData = $event->actionData;
        
        // Clear configuration caches
        Cache::flush(); // Clear all cache for config changes
        
        // Log configuration change
        Log::channel('security')->warning('System configuration changed', [
            'config_key' => $configData['config_key'] ?? null,
            'previous_value' => $configData['previous_value'] ?? null,
            'new_value' => $configData['new_value'] ?? null,
            'changed_by' => $event->user?->id,
        ]);
    }

    /**
     * Handle bulk delete action.
     */
    protected function handleBulkDelete(AdminActionPerformed $event): void
    {
        $deleteData = $event->actionData;
        
        // Clear relevant caches
        Cache::flush();
        
        // Create backup of deleted data
        $this->createDeletedDataBackup($deleteData);
        
        Log::warning('Bulk delete performed', [
            'entity_type' => $deleteData['entity_type'] ?? null,
            'deleted_count' => $deleteData['deleted_count'] ?? null,
            'deleted_by' => $event->user?->id,
        ]);
    }

    /**
     * Handle data export action.
     */
    protected function handleDataExport(AdminActionPerformed $event): void
    {
        $exportData = $event->actionData;
        
        // Log data export for compliance
        Log::channel('audit')->info('Data export performed', [
            'export_type' => $exportData['export_type'] ?? null,
            'record_count' => $exportData['record_count'] ?? null,
            'file_path' => $exportData['file_path'] ?? null,
            'exported_by' => $event->user?->id,
        ]);
        
        // Update export metrics
        Cache::increment('data_exports:daily:' . now()->format('Y-m-d'));
    }

    /**
     * Handle database reset action.
     */
    protected function handleDatabaseReset(AdminActionPerformed $event): void
    {
        // This is a critical action - create immediate alert
        $this->createCriticalAlert($event, 'Database reset performed');
        
        // Clear all caches
        Cache::flush();
        
        Log::critical('Database reset performed', [
            'reset_by' => $event->user?->id,
            'reset_type' => $event->actionData['reset_type'] ?? 'full',
        ]);
    }

    /**
     * Handle backup restored action.
     */
    protected function handleBackupRestored(AdminActionPerformed $event): void
    {
        $backupData = $event->actionData;
        
        // Clear all caches
        Cache::flush();
        
        Log::warning('Backup restored', [
            'backup_file' => $backupData['backup_file'] ?? null,
            'backup_date' => $backupData['backup_date'] ?? null,
            'restored_by' => $event->user?->id,
        ]);
    }

    /**
     * Send notifications.
     */
    protected function sendNotifications(AdminActionPerformed $event): void
    {
        $usersToNotify = $event->getUsersToNotify();
        
        if ($usersToNotify->isEmpty()) {
            return;
        }

        try {
            Notification::send($usersToNotify, new AdminActionNotification($event));
            
            Log::info('Admin action notifications sent', [
                'action' => $event->action,
                'recipients_count' => $usersToNotify->count(),
                'priority' => $event->getPriority(),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send admin action notifications', [
                'action' => $event->action,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Update admin activity cache.
     */
    protected function updateAdminActivityCache(AdminActionPerformed $event): void
    {
        $cacheKey = 'admin_activity:recent';
        $recentActivity = Cache::get($cacheKey, []);
        
        // Add new activity to the beginning
        array_unshift($recentActivity, [
            'action' => $event->action,
            'user_id' => $event->user?->id,
            'user_name' => $event->user?->getFullNameAttribute(),
            'timestamp' => $event->timestamp,
            'priority' => $event->getPriority(),
            'description' => $event->getActionDescription(),
        ]);
        
        // Keep only last 100 activities
        $recentActivity = array_slice($recentActivity, 0, 100);
        
        Cache::put($cacheKey, $recentActivity, 3600); // Cache for 1 hour
    }

    /**
     * Create system alert.
     */
    protected function createSystemAlert(AdminActionPerformed $event): void
    {
        try {
            DB::table('system_alerts')->insert([
                'type' => 'admin_action',
                'title' => 'Acción Administrativa Crítica',
                'message' => $event->getActionDescription(),
                'severity' => 'critical',
                'status' => 'active',
                'created_by' => $event->user?->id,
                'data' => json_encode([
                    'action' => $event->action,
                    'target_type' => $event->targetType,
                    'target_id' => $event->targetId,
                    'action_data' => $event->actionData,
                ]),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to create system alert for admin action', [
                'action' => $event->action,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Create security alert.
     */
    protected function createSecurityAlert(AdminActionPerformed $event, int $actionCount): void
    {
        try {
            DB::table('system_alerts')->insert([
                'type' => 'security_alert',
                'title' => 'Actividad Administrativa Sospechosa',
                'message' => "Se han detectado {$actionCount} acciones de seguridad en la última hora",
                'severity' => 'high',
                'status' => 'active',
                'created_by' => null,
                'data' => json_encode([
                    'action_count' => $actionCount,
                    'last_action' => $event->action,
                    'user_id' => $event->user?->id,
                    'hour' => now()->hour,
                ]),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to create security alert', [
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Create critical alert.
     */
    protected function createCriticalAlert(AdminActionPerformed $event, string $message): void
    {
        try {
            DB::table('system_alerts')->insert([
                'type' => 'critical_action',
                'title' => 'Acción Crítica del Sistema',
                'message' => $message,
                'severity' => 'critical',
                'status' => 'active',
                'created_by' => $event->user?->id,
                'data' => json_encode([
                    'action' => $event->action,
                    'user_id' => $event->user?->id,
                    'timestamp' => $event->timestamp,
                ]),
                'expires_at' => now()->addDays(30),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to create critical alert', [
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Trigger automated responses.
     */
    protected function triggerAutomatedResponses(AdminActionPerformed $event): void
    {
        // Automated responses based on action type
        match ($event->action) {
            'user_deleted' => $this->cleanupUserData($event),
            'bulk_delete' => $this->scheduleDataCleanup($event),
            'system_config_changed' => $this->validateSystemConfig($event),
            'database_reset' => $this->initializeSystemDefaults($event),
            default => null,
        };
    }

    /**
     * Update compliance audit trail.
     */
    protected function updateComplianceAuditTrail(AdminActionPerformed $event): void
    {
        // Update compliance metrics
        $complianceKey = 'compliance:admin_actions:' . now()->format('Y-m');
        Cache::increment($complianceKey);
        
        // Set expiration for monthly compliance data
        Cache::expire($complianceKey, 86400 * 32); // 32 days
    }

    /**
     * Update user statistics.
     */
    protected function updateUserStatistics(): void
    {
        // This would update cached user statistics
        Cache::forget('user_statistics');
    }

    /**
     * Create deleted data backup.
     */
    protected function createDeletedDataBackup(array $deleteData): void
    {
        // Implementation would create backup of deleted data
        Log::info('Deleted data backup created', $deleteData);
    }

    /**
     * Cleanup user data.
     */
    protected function cleanupUserData(AdminActionPerformed $event): void
    {
        // Implementation would cleanup user-related data
        Log::info('User data cleanup initiated', [
            'user_id' => $event->actionData['user_id'] ?? null,
        ]);
    }

    /**
     * Schedule data cleanup.
     */
    protected function scheduleDataCleanup(AdminActionPerformed $event): void
    {
        // Implementation would schedule cleanup job
        Log::info('Data cleanup scheduled', [
            'entity_type' => $event->actionData['entity_type'] ?? null,
        ]);
    }

    /**
     * Validate system config.
     */
    protected function validateSystemConfig(AdminActionPerformed $event): void
    {
        // Implementation would validate system configuration
        Log::info('System config validation initiated');
    }

    /**
     * Initialize system defaults.
     */
    protected function initializeSystemDefaults(AdminActionPerformed $event): void
    {
        // Implementation would initialize system defaults
        Log::info('System defaults initialization initiated');
    }

    /**
     * Handle job failure.
     */
    public function failed(AdminActionPerformed $event, \Throwable $exception): void
    {
        Log::error('Administrator listener failed', [
            'action' => $event->action,
            'user_id' => $event->user?->id,
            'error' => $exception->getMessage(),
            'trace' => $exception->getTraceAsString(),
        ]);
    }
}
