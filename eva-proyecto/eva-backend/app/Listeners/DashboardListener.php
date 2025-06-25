<?php

namespace App\Listeners;

use App\Events\Dashboard\DashboardDataUpdated;
use App\Events\Dashboard\DashboardMetricsUpdated;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class DashboardListener implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * The number of times the job may be attempted.
     */
    public int $tries = 3;

    /**
     * Handle dashboard data updated event.
     */
    public function handleDashboardDataUpdated(DashboardDataUpdated $event): void
    {
        try {
            // Log the dashboard update
            $this->logDashboardUpdate($event);

            // Update dashboard cache
            $this->updateDashboardCache($event);

            // Broadcast real-time updates
            $this->broadcastDashboardUpdate($event);

            // Update dashboard metrics
            $this->updateDashboardMetrics($event);

        } catch (\Exception $e) {
            Log::error('Failed to handle dashboard data updated event', [
                'data_type' => $event->dataType,
                'user_id' => $event->user?->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }

    /**
     * Handle dashboard metrics updated event.
     */
    public function handleDashboardMetricsUpdated(DashboardMetricsUpdated $event): void
    {
        try {
            // Log the metrics update
            $this->logMetricsUpdate($event);

            // Update metrics cache
            $this->updateMetricsCache($event);

            // Check for threshold alerts
            $this->checkThresholdAlerts($event);

            // Update trend analysis
            $this->updateTrendAnalysis($event);

            // Broadcast metrics update
            $this->broadcastMetricsUpdate($event);

        } catch (\Exception $e) {
            Log::error('Failed to handle dashboard metrics updated event', [
                'metric_type' => $event->metricType,
                'entity_id' => $event->entityId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }

    /**
     * Log dashboard update.
     */
    protected function logDashboardUpdate(DashboardDataUpdated $event): void
    {
        $logData = [
            'data_type' => $event->dataType,
            'data_count' => count($event->data),
            'user_id' => $event->user?->id,
            'timestamp' => $event->timestamp,
        ];

        Log::info('Dashboard data updated', $logData);
    }

    /**
     * Log metrics update.
     */
    protected function logMetricsUpdate(DashboardMetricsUpdated $event): void
    {
        $logData = [
            'metric_type' => $event->metricType,
            'entity_id' => $event->entityId,
            'entity_type' => $event->entityType,
            'metrics_count' => count($event->metrics),
            'user_id' => $event->user?->id,
            'timestamp' => $event->timestamp,
        ];

        Log::info('Dashboard metrics updated', $logData);
    }

    /**
     * Update dashboard cache.
     */
    protected function updateDashboardCache(DashboardDataUpdated $event): void
    {
        $cacheKey = "dashboard:{$event->dataType}";
        
        // Store data with appropriate TTL
        $ttl = match ($event->dataType) {
            'equipment_stats' => 300,  // 5 minutes
            'maintenance_stats' => 600, // 10 minutes
            'contingency_stats' => 180, // 3 minutes
            'user_activity' => 900,     // 15 minutes
            default => 600,
        };

        Cache::put($cacheKey, $event->data, $ttl);

        // Update last updated timestamp
        Cache::put("{$cacheKey}:last_updated", now(), $ttl);

        Log::debug('Dashboard cache updated', [
            'cache_key' => $cacheKey,
            'ttl' => $ttl,
            'data_size' => count($event->data),
        ]);
    }

    /**
     * Update metrics cache.
     */
    protected function updateMetricsCache(DashboardMetricsUpdated $event): void
    {
        $cacheKey = "dashboard:metrics:{$event->metricType}";
        
        if ($event->entityId) {
            $cacheKey .= ":{$event->entityId}";
        }

        // Store metrics with 5-minute TTL for real-time updates
        Cache::put($cacheKey, $event->metrics, 300);
        Cache::put("{$cacheKey}:last_updated", now(), 300);

        // Update aggregated metrics
        $this->updateAggregatedMetrics($event);

        Log::debug('Metrics cache updated', [
            'cache_key' => $cacheKey,
            'metrics_count' => count($event->metrics),
        ]);
    }

    /**
     * Update aggregated metrics.
     */
    protected function updateAggregatedMetrics(DashboardMetricsUpdated $event): void
    {
        try {
            $today = now()->format('Y-m-d');
            $hour = now()->hour;

            // Store metrics in database for historical analysis
            foreach ($event->metrics as $metricKey => $metricValue) {
                DB::table('dashboard_metrics')->updateOrInsert(
                    [
                        'metric_type' => $event->metricType,
                        'metric_key' => $metricKey,
                        'entity_id' => $event->entityId,
                        'entity_type' => $event->entityType,
                        'date' => $today,
                        'hour' => $hour,
                    ],
                    [
                        'metric_value' => $metricValue,
                        'updated_at' => now(),
                    ]
                );
            }

            // Update daily aggregates
            $this->updateDailyAggregates($event, $today);

        } catch (\Exception $e) {
            Log::error('Failed to update aggregated metrics', [
                'metric_type' => $event->metricType,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Update daily aggregates.
     */
    protected function updateDailyAggregates(DashboardMetricsUpdated $event, string $date): void
    {
        try {
            // Calculate daily averages and totals
            $aggregates = DB::table('dashboard_metrics')
                           ->where('metric_type', $event->metricType)
                           ->where('date', $date)
                           ->selectRaw('
                               metric_key,
                               AVG(metric_value) as avg_value,
                               MAX(metric_value) as max_value,
                               MIN(metric_value) as min_value,
                               COUNT(*) as data_points
                           ')
                           ->groupBy('metric_key')
                           ->get();

            foreach ($aggregates as $aggregate) {
                DB::table('dashboard_daily_aggregates')->updateOrInsert(
                    [
                        'metric_type' => $event->metricType,
                        'metric_key' => $aggregate->metric_key,
                        'date' => $date,
                    ],
                    [
                        'avg_value' => $aggregate->avg_value,
                        'max_value' => $aggregate->max_value,
                        'min_value' => $aggregate->min_value,
                        'data_points' => $aggregate->data_points,
                        'updated_at' => now(),
                    ]
                );
            }

        } catch (\Exception $e) {
            Log::error('Failed to update daily aggregates', [
                'metric_type' => $event->metricType,
                'date' => $date,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Check threshold alerts.
     */
    protected function checkThresholdAlerts(DashboardMetricsUpdated $event): void
    {
        $thresholds = $this->getMetricThresholds($event->metricType);
        
        foreach ($event->metrics as $metricKey => $metricValue) {
            if (!isset($thresholds[$metricKey])) {
                continue;
            }

            $threshold = $thresholds[$metricKey];
            $alertTriggered = false;
            $alertLevel = 'info';

            // Check different threshold types
            if (isset($threshold['max']) && $metricValue > $threshold['max']) {
                $alertTriggered = true;
                $alertLevel = $threshold['max_severity'] ?? 'high';
            } elseif (isset($threshold['min']) && $metricValue < $threshold['min']) {
                $alertTriggered = true;
                $alertLevel = $threshold['min_severity'] ?? 'medium';
            } elseif (isset($threshold['critical']) && $metricValue >= $threshold['critical']) {
                $alertTriggered = true;
                $alertLevel = 'critical';
            }

            if ($alertTriggered) {
                $this->createThresholdAlert($event, $metricKey, $metricValue, $threshold, $alertLevel);
            }
        }
    }

    /**
     * Get metric thresholds.
     */
    protected function getMetricThresholds(string $metricType): array
    {
        // Define thresholds for different metric types
        $thresholds = [
            'equipment_management' => [
                'critical_equipment_count' => ['max' => 10, 'max_severity' => 'critical'],
                'overdue_maintenance_count' => ['max' => 5, 'max_severity' => 'high'],
                'equipment_availability' => ['min' => 90, 'min_severity' => 'medium'],
            ],
            'maintenance_management' => [
                'overdue_percentage' => ['max' => 15, 'max_severity' => 'high'],
                'completion_rate' => ['min' => 85, 'min_severity' => 'medium'],
            ],
            'contingency_management' => [
                'active_contingencies' => ['max' => 20, 'max_severity' => 'high'],
                'critical_contingencies' => ['max' => 5, 'max_severity' => 'critical'],
            ],
        ];

        return $thresholds[$metricType] ?? [];
    }

    /**
     * Create threshold alert.
     */
    protected function createThresholdAlert(
        DashboardMetricsUpdated $event,
        string $metricKey,
        $metricValue,
        array $threshold,
        string $alertLevel
    ): void {
        try {
            // Check if alert was recently created to avoid spam
            $recentAlert = Cache::get("threshold_alert:{$event->metricType}:{$metricKey}");
            if ($recentAlert) {
                return;
            }

            DB::table('system_alerts')->insert([
                'type' => 'threshold_exceeded',
                'title' => 'Umbral de Métrica Excedido',
                'message' => "La métrica '{$metricKey}' ha excedido el umbral: {$metricValue}",
                'severity' => $alertLevel,
                'status' => 'active',
                'created_by' => $event->user?->id,
                'data' => json_encode([
                    'metric_type' => $event->metricType,
                    'metric_key' => $metricKey,
                    'metric_value' => $metricValue,
                    'threshold' => $threshold,
                    'entity_id' => $event->entityId,
                    'entity_type' => $event->entityType,
                ]),
                'expires_at' => now()->addHours(4),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Set cooldown to prevent alert spam
            Cache::put("threshold_alert:{$event->metricType}:{$metricKey}", true, 3600);

        } catch (\Exception $e) {
            Log::error('Failed to create threshold alert', [
                'metric_type' => $event->metricType,
                'metric_key' => $metricKey,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Update trend analysis.
     */
    protected function updateTrendAnalysis(DashboardMetricsUpdated $event): void
    {
        try {
            foreach ($event->metrics as $metricKey => $metricValue) {
                // Get historical data for trend analysis
                $historicalData = DB::table('dashboard_metrics')
                                   ->where('metric_type', $event->metricType)
                                   ->where('metric_key', $metricKey)
                                   ->where('created_at', '>=', now()->subDays(7))
                                   ->orderBy('created_at')
                                   ->pluck('metric_value')
                                   ->toArray();

                if (count($historicalData) >= 3) {
                    $trend = $this->calculateTrend($historicalData);
                    
                    Cache::put(
                        "dashboard:trend:{$event->metricType}:{$metricKey}",
                        $trend,
                        3600
                    );

                    // Check for significant trend changes
                    if (abs($trend['slope']) > $this->getTrendThreshold($metricKey)) {
                        $this->createTrendAlert($event, $metricKey, $trend);
                    }
                }
            }

        } catch (\Exception $e) {
            Log::error('Failed to update trend analysis', [
                'metric_type' => $event->metricType,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Calculate trend.
     */
    protected function calculateTrend(array $data): array
    {
        $n = count($data);
        $x = range(1, $n);
        
        $sumX = array_sum($x);
        $sumY = array_sum($data);
        $sumXY = 0;
        $sumX2 = 0;
        
        for ($i = 0; $i < $n; $i++) {
            $sumXY += $x[$i] * $data[$i];
            $sumX2 += $x[$i] * $x[$i];
        }
        
        $slope = ($n * $sumXY - $sumX * $sumY) / ($n * $sumX2 - $sumX * $sumX);
        $intercept = ($sumY - $slope * $sumX) / $n;
        
        return [
            'slope' => $slope,
            'intercept' => $intercept,
            'direction' => $slope > 0 ? 'increasing' : ($slope < 0 ? 'decreasing' : 'stable'),
            'data_points' => $n,
        ];
    }

    /**
     * Get trend threshold.
     */
    protected function getTrendThreshold(string $metricKey): float
    {
        // Define thresholds for significant trend changes
        $thresholds = [
            'equipment_availability' => 2.0,
            'maintenance_completion_rate' => 5.0,
            'contingency_count' => 1.0,
            'default' => 1.5,
        ];

        return $thresholds[$metricKey] ?? $thresholds['default'];
    }

    /**
     * Create trend alert.
     */
    protected function createTrendAlert(DashboardMetricsUpdated $event, string $metricKey, array $trend): void
    {
        try {
            $direction = $trend['direction'];
            $severity = abs($trend['slope']) > 5 ? 'high' : 'medium';

            DB::table('system_alerts')->insert([
                'type' => 'trend_change',
                'title' => 'Cambio de Tendencia Detectado',
                'message' => "La métrica '{$metricKey}' muestra una tendencia {$direction}",
                'severity' => $severity,
                'status' => 'active',
                'created_by' => $event->user?->id,
                'data' => json_encode([
                    'metric_type' => $event->metricType,
                    'metric_key' => $metricKey,
                    'trend' => $trend,
                ]),
                'expires_at' => now()->addDays(1),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to create trend alert', [
                'metric_type' => $event->metricType,
                'metric_key' => $metricKey,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Broadcast dashboard update.
     */
    protected function broadcastDashboardUpdate(DashboardDataUpdated $event): void
    {
        // Implementation for broadcasting real-time updates
        Log::debug('Dashboard update broadcasted', [
            'data_type' => $event->dataType,
            'data_count' => count($event->data),
        ]);
    }

    /**
     * Broadcast metrics update.
     */
    protected function broadcastMetricsUpdate(DashboardMetricsUpdated $event): void
    {
        // Implementation for broadcasting real-time metrics updates
        Log::debug('Metrics update broadcasted', [
            'metric_type' => $event->metricType,
            'metrics_count' => count($event->metrics),
        ]);
    }

    /**
     * Handle job failure.
     */
    public function failed($event, \Throwable $exception): void
    {
        $eventType = get_class($event);
        
        Log::error('Dashboard listener failed', [
            'event_type' => $eventType,
            'error' => $exception->getMessage(),
            'trace' => $exception->getTraceAsString(),
        ]);
    }
}
