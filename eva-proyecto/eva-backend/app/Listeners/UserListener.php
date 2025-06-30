<?php

namespace App\Listeners;

use App\Events\User\UserLoggedIn;
use App\Notifications\UserNotification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;

class UserListener implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * The number of times the job may be attempted.
     */
    public int $tries = 3;

    /**
     * Handle user logged in event.
     */
    public function handleUserLoggedIn(UserLoggedIn $event): void
    {
        try {
            // Log the login action
            $this->logUserLogin($event);

            // Update login metrics
            $this->updateLoginMetrics($event);

            // Track user session
            $this->trackUserSession($event);

            // Update user last login
            $this->updateUserLastLogin($event);

            // Check for security alerts
            $this->checkSecurityAlerts($event);

            // Update user activity status
            $this->updateUserActivityStatus($event);

            // Handle first-time login
            if ($event->isFirstTimeLogin()) {
                $this->handleFirstTimeLogin($event);
            }

            // Check for suspicious activity
            $this->checkSuspiciousActivity($event);

        } catch (\Exception $e) {
            Log::error('Failed to handle user logged in event', [
                'user_id' => $event->user?->id,
                'ip_address' => $event->ipAddress,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }

    /**
     * Log user login.
     */
    protected function logUserLogin(UserLoggedIn $event): void
    {
        $logData = [
            'user_id' => $event->user?->id,
            'username' => $event->user?->username,
            'email' => $event->user?->email,
            'ip_address' => $event->ipAddress,
            'user_agent' => $event->userAgent,
            'login_method' => $event->loginMethod,
            'is_first_time' => $event->isFirstTimeLogin(),
            'timestamp' => $event->timestamp,
        ];

        Log::channel('audit')->info('User logged in', $logData);

        // Store in audit trail
        $this->storeInAuditTrail($event, $logData);
    }

    /**
     * Store in audit trail.
     */
    protected function storeInAuditTrail(UserLoggedIn $event, array $logData): void
    {
        try {
            DB::table('audit_trail')->insert([
                'auditable_type' => 'App\Models\User',
                'auditable_id' => $event->user?->id ?? 0,
                'event_type' => 'user.logged_in',
                'user_id' => $event->user?->id,
                'old_values' => null,
                'new_values' => json_encode([
                    'login_time' => now(),
                    'ip_address' => $event->ipAddress,
                ]),
                'ip_address' => $event->ipAddress,
                'user_agent' => $event->userAgent,
                'metadata' => json_encode($logData),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to store user login in audit trail', [
                'user_id' => $event->user?->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Update login metrics.
     */
    protected function updateLoginMetrics(UserLoggedIn $event): void
    {
        $today = now()->format('Y-m-d');
        $hour = now()->hour;

        // Update daily login count
        Cache::increment("logins:daily:{$today}");
        
        // Update hourly login count
        Cache::increment("logins:hourly:{$today}:{$hour}");
        
        // Update user-specific login count
        if ($event->user) {
            Cache::increment("logins:user:{$event->user->id}:daily:{$today}");
        }

        // Update login method metrics
        Cache::increment("logins:method:{$event->loginMethod}:daily:{$today}");

        // Store metrics in database
        $this->storeLoginMetricsInDatabase($event, $today, $hour);
    }

    /**
     * Store login metrics in database.
     */
    protected function storeLoginMetricsInDatabase(UserLoggedIn $event, string $date, int $hour): void
    {
        try {
            DB::table('event_metrics')->updateOrInsert(
                [
                    'metric_type' => 'user_logins',
                    'metric_category' => 'daily',
                    'metric_key' => 'total',
                    'metric_date' => $date,
                    'metric_hour' => null,
                ],
                [
                    'metric_value' => DB::raw('metric_value + 1'),
                    'metadata' => json_encode([
                        'user_id' => $event->user?->id,
                        'login_method' => $event->loginMethod,
                        'ip_address' => $event->ipAddress,
                    ]),
                    'updated_at' => now(),
                ]
            );

            // Store hourly metrics
            DB::table('event_metrics')->updateOrInsert(
                [
                    'metric_type' => 'user_logins',
                    'metric_category' => 'hourly',
                    'metric_key' => 'total',
                    'metric_date' => $date,
                    'metric_hour' => $hour,
                ],
                [
                    'metric_value' => DB::raw('metric_value + 1'),
                    'metadata' => json_encode([
                        'user_id' => $event->user?->id,
                    ]),
                    'updated_at' => now(),
                ]
            );
        } catch (\Exception $e) {
            Log::error('Failed to store login metrics', [
                'user_id' => $event->user?->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Track user session.
     */
    protected function trackUserSession(UserLoggedIn $event): void
    {
        if (!$event->user) {
            return;
        }

        try {
            // Store session information
            DB::table('user_sessions')->insert([
                'user_id' => $event->user->id,
                'session_id' => session()->getId(),
                'ip_address' => $event->ipAddress,
                'user_agent' => $event->userAgent,
                'login_method' => $event->loginMethod,
                'started_at' => now(),
                'last_activity' => now(),
                'is_active' => true,
            ]);

            // Update user's active session count
            Cache::increment("user:{$event->user->id}:active_sessions");

        } catch (\Exception $e) {
            Log::error('Failed to track user session', [
                'user_id' => $event->user->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Update user last login.
     */
    protected function updateUserLastLogin(UserLoggedIn $event): void
    {
        if (!$event->user) {
            return;
        }

        try {
            DB::table('usuarios')
              ->where('id', $event->user->id)
              ->update([
                  'ultimo_acceso' => now(),
                  'ip_ultimo_acceso' => $event->ipAddress,
                  'updated_at' => now(),
              ]);

            // Clear user cache
            Cache::forget("user:{$event->user->id}");

        } catch (\Exception $e) {
            Log::error('Failed to update user last login', [
                'user_id' => $event->user->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Check security alerts.
     */
    protected function checkSecurityAlerts(UserLoggedIn $event): void
    {
        if (!$event->user) {
            return;
        }

        // Check for multiple failed login attempts
        $this->checkFailedLoginAttempts($event);

        // Check for unusual login times
        $this->checkUnusualLoginTimes($event);

        // Check for new device/location
        $this->checkNewDeviceOrLocation($event);
    }

    /**
     * Check failed login attempts.
     */
    protected function checkFailedLoginAttempts(UserLoggedIn $event): void
    {
        try {
            $failedAttempts = Cache::get("failed_logins:user:{$event->user->id}", 0);
            
            if ($failedAttempts >= 3) {
                $this->createSecurityAlert($event, 'multiple_failed_attempts', [
                    'failed_attempts' => $failedAttempts,
                ]);
            }

            // Clear failed attempts on successful login
            Cache::forget("failed_logins:user:{$event->user->id}");

        } catch (\Exception $e) {
            Log::error('Failed to check failed login attempts', [
                'user_id' => $event->user->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Check unusual login times.
     */
    protected function checkUnusualLoginTimes(UserLoggedIn $event): void
    {
        $currentHour = now()->hour;
        
        // Consider logins between 11 PM and 5 AM as unusual
        if ($currentHour >= 23 || $currentHour <= 5) {
            $this->createSecurityAlert($event, 'unusual_login_time', [
                'login_hour' => $currentHour,
            ]);
        }
    }

    /**
     * Check new device or location.
     */
    protected function checkNewDeviceOrLocation(UserLoggedIn $event): void
    {
        if (!$event->user) {
            return;
        }

        try {
            // Check if this IP has been used before
            $knownIp = DB::table('user_sessions')
                        ->where('user_id', $event->user->id)
                        ->where('ip_address', $event->ipAddress)
                        ->exists();

            if (!$knownIp) {
                $this->createSecurityAlert($event, 'new_ip_address', [
                    'new_ip' => $event->ipAddress,
                ]);
            }

            // Check if this user agent has been used before
            $knownUserAgent = DB::table('user_sessions')
                               ->where('user_id', $event->user->id)
                               ->where('user_agent', $event->userAgent)
                               ->exists();

            if (!$knownUserAgent) {
                $this->createSecurityAlert($event, 'new_device', [
                    'new_user_agent' => $event->userAgent,
                ]);
            }

        } catch (\Exception $e) {
            Log::error('Failed to check new device or location', [
                'user_id' => $event->user->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Update user activity status.
     */
    protected function updateUserActivityStatus(UserLoggedIn $event): void
    {
        if (!$event->user) {
            return;
        }

        // Mark user as active
        Cache::put("user:{$event->user->id}:active", true, 3600);
        Cache::put("user:{$event->user->id}:last_activity", now(), 86400);
    }

    /**
     * Handle first-time login.
     */
    protected function handleFirstTimeLogin(UserLoggedIn $event): void
    {
        if (!$event->user) {
            return;
        }

        // Create welcome notification
        $this->createWelcomeNotification($event);

        // Log first-time login
        Log::info('First-time user login', [
            'user_id' => $event->user->id,
            'username' => $event->user->username,
        ]);

        // Update first login metrics
        Cache::increment('logins:first_time:daily:' . now()->format('Y-m-d'));
    }

    /**
     * Check suspicious activity.
     */
    protected function checkSuspiciousActivity(UserLoggedIn $event): void
    {
        if (!$event->user) {
            return;
        }

        // Check for rapid successive logins
        $recentLogins = Cache::get("user:{$event->user->id}:recent_logins", []);
        $recentLogins[] = now()->timestamp;
        
        // Keep only logins from last 5 minutes
        $recentLogins = array_filter($recentLogins, function($timestamp) {
            return $timestamp > (now()->timestamp - 300);
        });

        Cache::put("user:{$event->user->id}:recent_logins", $recentLogins, 300);

        // If more than 5 logins in 5 minutes, flag as suspicious
        if (count($recentLogins) > 5) {
            $this->createSecurityAlert($event, 'rapid_successive_logins', [
                'login_count' => count($recentLogins),
                'time_window' => '5 minutes',
            ]);
        }
    }

    /**
     * Create security alert.
     */
    protected function createSecurityAlert(UserLoggedIn $event, string $alertType, array $data = []): void
    {
        try {
            $alertMessages = [
                'multiple_failed_attempts' => 'Múltiples intentos fallidos de login detectados',
                'unusual_login_time' => 'Login en horario inusual detectado',
                'new_ip_address' => 'Login desde nueva dirección IP',
                'new_device' => 'Login desde nuevo dispositivo',
                'rapid_successive_logins' => 'Múltiples logins rápidos detectados',
            ];

            DB::table('system_alerts')->insert([
                'type' => 'security_alert',
                'title' => 'Alerta de Seguridad',
                'message' => $alertMessages[$alertType] ?? 'Actividad sospechosa detectada',
                'severity' => 'medium',
                'status' => 'active',
                'user_id' => $event->user?->id,
                'created_by' => $event->user?->id,
                'data' => json_encode(array_merge([
                    'alert_type' => $alertType,
                    'user_id' => $event->user?->id,
                    'ip_address' => $event->ipAddress,
                    'user_agent' => $event->userAgent,
                ], $data)),
                'expires_at' => now()->addDays(7),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to create security alert', [
                'alert_type' => $alertType,
                'user_id' => $event->user?->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Create welcome notification.
     */
    protected function createWelcomeNotification(UserLoggedIn $event): void
    {
        try {
            Notification::send($event->user, new UserNotification([
                'type' => 'welcome',
                'title' => '¡Bienvenido al Sistema EVA!',
                'message' => 'Gracias por unirte a nuestro sistema de gestión de equipos médicos.',
                'data' => [
                    'first_login' => true,
                    'login_time' => now(),
                ],
            ]));
        } catch (\Exception $e) {
            Log::error('Failed to create welcome notification', [
                'user_id' => $event->user?->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Handle job failure.
     */
    public function failed(UserLoggedIn $event, \Throwable $exception): void
    {
        Log::error('User listener failed', [
            'user_id' => $event->user?->id,
            'ip_address' => $event->ipAddress,
            'error' => $exception->getMessage(),
            'trace' => $exception->getTraceAsString(),
        ]);
    }
}
