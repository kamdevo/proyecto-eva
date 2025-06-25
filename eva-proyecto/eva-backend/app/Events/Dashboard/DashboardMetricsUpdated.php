<?php

namespace App\Events\Dashboard;

use App\Events\BaseEvent;
use App\Models\User;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\PrivateChannel;

class DashboardMetricsUpdated extends BaseEvent
{
    /**
     * Metrics data.
     */
    public array $metrics;

    /**
     * Metric type.
     */
    public string $metricType;

    /**
     * Service ID (if metrics are service-specific).
     */
    public ?int $serviceId;

    /**
     * Previous metrics (for comparison).
     */
    public ?array $previousMetrics;

    /**
     * Create a new event instance.
     */
    public function __construct(
        array $metrics,
        string $metricType,
        ?int $serviceId = null,
        ?array $previousMetrics = null,
        ?User $user = null,
        array $metadata = []
    ) {
        $this->metrics = $metrics;
        $this->metricType = $metricType;
        $this->serviceId = $serviceId;
        $this->previousMetrics = $previousMetrics;
        parent::__construct($user, $metadata);
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        $channels = array_merge(parent::broadcastOn(), [
            new Channel('dashboard.metrics'),
            new Channel('dashboard.' . $this->metricType),
        ]);

        if ($this->serviceId) {
            $channels[] = new PrivateChannel('service.' . $this->serviceId . '.dashboard');
        }

        return $channels;
    }

    /**
     * Get event type identifier.
     */
    protected function getEventType(): string
    {
        return 'dashboard.metrics.updated';
    }

    /**
     * Get event-specific data.
     */
    protected function getEventData(): array
    {
        return [
            'metric_type' => $this->metricType,
            'service_id' => $this->serviceId,
            'metrics' => $this->metrics,
            'previous_metrics' => $this->previousMetrics,
            'changes' => $this->getMetricChanges(),
            'alerts' => $this->getMetricAlerts(),
            'trends' => $this->getMetricTrends(),
            'updated_at' => now()->toISOString(),
        ];
    }

    /**
     * Get event priority.
     */
    public function getPriority(): string
    {
        // Critical priority for alert conditions
        if ($this->hasAlertConditions()) {
            return 'critical';
        }

        // High priority for significant changes
        if ($this->hasSignificantChanges()) {
            return 'high';
        }

        return 'low'; // Dashboard updates are usually low priority
    }

    /**
     * Get event category.
     */
    public function getCategory(): string
    {
        return 'dashboard';
    }

    /**
     * Check if event should send notifications.
     */
    public function shouldNotify(): bool
    {
        // Only notify for alert conditions
        return $this->hasAlertConditions();
    }

    /**
     * Get notification channels.
     */
    public function getNotificationChannels(): array
    {
        $channels = ['database', 'broadcast'];

        // Add email for critical alerts
        if ($this->getPriority() === 'critical') {
            $channels[] = 'mail';
        }

        return $channels;
    }

    /**
     * Get users to notify.
     */
    public function getUsersToNotify(): \Illuminate\Database\Eloquent\Collection
    {
        // Only notify for alert conditions
        if (!$this->hasAlertConditions()) {
            return collect();
        }

        $query = User::where('estado', true)->where('active', 'true');

        if ($this->serviceId) {
            // Notify users in the specific service and administrators
            $query->where(function ($q) {
                $q->where('servicio_id', $this->serviceId)
                  ->orWhereHas('rol', function ($roleQuery) {
                      $roleQuery->whereIn('nombre', ['Administrador', 'Supervisor']);
                  });
            });
        } else {
            // Notify administrators and supervisors for global metrics
            $query->whereHas('rol', function ($roleQuery) {
                $roleQuery->whereIn('nombre', ['Administrador', 'Supervisor']);
            });
        }

        return $query->get();
    }

    /**
     * Get metric changes.
     */
    protected function getMetricChanges(): array
    {
        if (!$this->previousMetrics) {
            return [];
        }

        $changes = [];
        
        foreach ($this->metrics as $key => $value) {
            $previousValue = $this->previousMetrics[$key] ?? null;
            
            if ($previousValue !== null && $previousValue !== $value) {
                $changes[$key] = [
                    'previous' => $previousValue,
                    'current' => $value,
                    'change' => is_numeric($value) && is_numeric($previousValue) 
                              ? $value - $previousValue 
                              : null,
                    'percentage_change' => is_numeric($value) && is_numeric($previousValue) && $previousValue != 0
                                         ? round((($value - $previousValue) / $previousValue) * 100, 2)
                                         : null,
                ];
            }
        }

        return $changes;
    }

    /**
     * Get metric alerts.
     */
    protected function getMetricAlerts(): array
    {
        $alerts = [];

        // Define alert thresholds based on metric type
        $thresholds = $this->getAlertThresholds();

        foreach ($this->metrics as $key => $value) {
            if (isset($thresholds[$key]) && is_numeric($value)) {
                $threshold = $thresholds[$key];
                
                if (isset($threshold['critical']) && $value >= $threshold['critical']) {
                    $alerts[] = [
                        'metric' => $key,
                        'level' => 'critical',
                        'value' => $value,
                        'threshold' => $threshold['critical'],
                        'message' => $this->getAlertMessage($key, 'critical', $value),
                    ];
                } elseif (isset($threshold['warning']) && $value >= $threshold['warning']) {
                    $alerts[] = [
                        'metric' => $key,
                        'level' => 'warning',
                        'value' => $value,
                        'threshold' => $threshold['warning'],
                        'message' => $this->getAlertMessage($key, 'warning', $value),
                    ];
                }
            }
        }

        return $alerts;
    }

    /**
     * Get metric trends.
     */
    protected function getMetricTrends(): array
    {
        $trends = [];
        $changes = $this->getMetricChanges();

        foreach ($changes as $key => $change) {
            if ($change['percentage_change'] !== null) {
                $trends[$key] = [
                    'direction' => $change['change'] > 0 ? 'up' : ($change['change'] < 0 ? 'down' : 'stable'),
                    'percentage' => abs($change['percentage_change']),
                    'significance' => $this->getTrendSignificance($change['percentage_change']),
                ];
            }
        }

        return $trends;
    }

    /**
     * Get alert thresholds for different metrics.
     */
    protected function getAlertThresholds(): array
    {
        return match ($this->metricType) {
            'equipment' => [
                'critical_equipment_count' => ['warning' => 5, 'critical' => 10],
                'equipment_failure_rate' => ['warning' => 10, 'critical' => 20],
                'overdue_maintenance_count' => ['warning' => 5, 'critical' => 15],
            ],
            'maintenance' => [
                'overdue_count' => ['warning' => 5, 'critical' => 15],
                'completion_rate' => ['warning' => 80, 'critical' => 70], // Lower is worse
                'average_delay_hours' => ['warning' => 24, 'critical' => 72],
            ],
            'contingency' => [
                'active_contingencies' => ['warning' => 3, 'critical' => 8],
                'critical_contingencies' => ['warning' => 1, 'critical' => 3],
                'resolution_time_hours' => ['warning' => 48, 'critical' => 120],
            ],
            'system' => [
                'response_time_ms' => ['warning' => 1000, 'critical' => 3000],
                'error_rate_percentage' => ['warning' => 1, 'critical' => 5],
                'disk_usage_percentage' => ['warning' => 80, 'critical' => 95],
                'memory_usage_percentage' => ['warning' => 85, 'critical' => 95],
            ],
            default => [],
        };
    }

    /**
     * Get alert message.
     */
    protected function getAlertMessage(string $metric, string $level, $value): string
    {
        $metricNames = [
            'critical_equipment_count' => 'equipos críticos',
            'overdue_maintenance_count' => 'mantenimientos vencidos',
            'active_contingencies' => 'contingencias activas',
            'response_time_ms' => 'tiempo de respuesta',
            'error_rate_percentage' => 'tasa de errores',
        ];

        $metricName = $metricNames[$metric] ?? $metric;
        $levelText = $level === 'critical' ? 'crítico' : 'advertencia';

        return "Nivel {$levelText} alcanzado para {$metricName}: {$value}";
    }

    /**
     * Get trend significance.
     */
    protected function getTrendSignificance(float $percentageChange): string
    {
        $abs = abs($percentageChange);
        
        if ($abs >= 50) return 'very_high';
        if ($abs >= 25) return 'high';
        if ($abs >= 10) return 'moderate';
        if ($abs >= 5) return 'low';
        
        return 'minimal';
    }

    /**
     * Check if metrics have alert conditions.
     */
    protected function hasAlertConditions(): bool
    {
        return !empty($this->getMetricAlerts());
    }

    /**
     * Check if metrics have significant changes.
     */
    protected function hasSignificantChanges(): bool
    {
        $changes = $this->getMetricChanges();
        
        foreach ($changes as $change) {
            if ($change['percentage_change'] !== null && abs($change['percentage_change']) >= 20) {
                return true;
            }
        }
        
        return false;
    }

    /**
     * Get critical alerts count.
     */
    public function getCriticalAlertsCount(): int
    {
        $alerts = $this->getMetricAlerts();
        return count(array_filter($alerts, fn($alert) => $alert['level'] === 'critical'));
    }

    /**
     * Get warning alerts count.
     */
    public function getWarningAlertsCount(): int
    {
        $alerts = $this->getMetricAlerts();
        return count(array_filter($alerts, fn($alert) => $alert['level'] === 'warning'));
    }

    /**
     * Get metric summary.
     */
    public function getMetricSummary(): array
    {
        return [
            'type' => $this->metricType,
            'service_id' => $this->serviceId,
            'total_metrics' => count($this->metrics),
            'changed_metrics' => count($this->getMetricChanges()),
            'critical_alerts' => $this->getCriticalAlertsCount(),
            'warning_alerts' => $this->getWarningAlertsCount(),
            'has_trends' => !empty($this->getMetricTrends()),
        ];
    }
}
