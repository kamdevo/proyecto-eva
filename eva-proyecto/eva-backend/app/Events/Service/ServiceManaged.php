<?php

namespace App\Events\Service;

use App\Events\BaseEvent;
use App\Models\Servicio;
use App\Models\User;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\PrivateChannel;

class ServiceManaged extends BaseEvent
{
    /**
     * Service instance.
     */
    public ?Servicio $service;

    /**
     * Management action.
     */
    public string $action;

    /**
     * Service data (for deleted services).
     */
    public ?array $serviceData;

    /**
     * Changes made (for updates).
     */
    public array $changes;

    /**
     * Create a new event instance.
     */
    public function __construct(
        string $action,
        ?Servicio $service = null,
        ?array $serviceData = null,
        array $changes = [],
        ?User $user = null,
        array $metadata = []
    ) {
        $this->action = $action;
        $this->service = $service;
        $this->serviceData = $serviceData;
        $this->changes = $changes;
        parent::__construct($user, $metadata);
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        $channels = array_merge(parent::broadcastOn(), [
            new Channel('service.managed'),
            new Channel('services.updates'),
        ]);

        if ($this->service) {
            $channels[] = new PrivateChannel('service.' . $this->service->id);
        }

        return $channels;
    }

    /**
     * Get event type identifier.
     */
    protected function getEventType(): string
    {
        return 'service.' . $this->action;
    }

    /**
     * Get event-specific data.
     */
    protected function getEventData(): array
    {
        $data = [
            'action' => $this->action,
            'changes' => $this->changes,
        ];

        if ($this->service) {
            $data['service'] = [
                'id' => $this->service->id,
                'name' => $this->service->name,
                'description' => $this->service->description,
                'code' => $this->service->code ?? null,
                'active' => $this->service->active ?? true,
                'equipment_count' => $this->getEquipmentCount(),
                'area_count' => $this->getAreaCount(),
                'user_count' => $this->getUserCount(),
                'statistics' => $this->getServiceStatistics(),
            ];
        } elseif ($this->serviceData) {
            $data['service'] = $this->serviceData;
        }

        return $data;
    }

    /**
     * Get event priority.
     */
    public function getPriority(): string
    {
        // Critical priority for deletion of services with many resources
        if ($this->action === 'deleted' && $this->hasHighResourceCount()) {
            return 'critical';
        }

        // High priority for status changes or services with critical equipment
        if ($this->action === 'updated' && $this->hasSignificantChanges()) {
            return 'high';
        }

        if ($this->hasCriticalEquipment()) {
            return 'high';
        }

        return 'normal';
    }

    /**
     * Get event category.
     */
    public function getCategory(): string
    {
        return 'service';
    }

    /**
     * Check if event should send notifications.
     */
    public function shouldNotify(): bool
    {
        // Notify for creation, deletion, or significant changes
        return in_array($this->action, ['created', 'deleted']) ||
               ($this->action === 'updated' && $this->hasSignificantChanges());
    }

    /**
     * Get notification channels.
     */
    public function getNotificationChannels(): array
    {
        $channels = ['database', 'broadcast'];

        // Add email for deletion or critical changes
        if ($this->action === 'deleted' || $this->hasHighResourceCount()) {
            $channels[] = 'mail';
        }

        return $channels;
    }

    /**
     * Get users to notify.
     */
    public function getUsersToNotify(): \Illuminate\Database\Eloquent\Collection
    {
        $serviceId = $this->service?->id ?? $this->serviceData['id'] ?? null;

        // Always notify administrators
        $administrators = User::whereHas('rol', function ($query) {
            $query->where('nombre', 'Administrador');
        })
        ->where('estado', true)
        ->where('active', 'true')
        ->get();

        if (!$serviceId) {
            return $administrators;
        }

        // Notify users in the service and supervisors
        $serviceUsers = User::where(function ($query) use ($serviceId) {
            $query->where('servicio_id', $serviceId)
                  ->orWhereHas('rol', function ($q) {
                      $q->where('nombre', 'Supervisor');
                  });
        })
        ->where('estado', true)
        ->where('active', 'true')
        ->get();

        return $administrators->merge($serviceUsers)->unique('id');
    }

    /**
     * Get equipment count in this service.
     */
    protected function getEquipmentCount(): int
    {
        if (!$this->service) {
            return 0;
        }

        return $this->service->equipos()->count();
    }

    /**
     * Get area count in this service.
     */
    protected function getAreaCount(): int
    {
        if (!$this->service) {
            return 0;
        }

        return $this->service->areas()->count();
    }

    /**
     * Get user count in this service.
     */
    protected function getUserCount(): int
    {
        if (!$this->service) {
            return 0;
        }

        return $this->service->usuarios()->count();
    }

    /**
     * Check if service has high resource count.
     */
    protected function hasHighResourceCount(): bool
    {
        return $this->getEquipmentCount() > 50 || 
               $this->getAreaCount() > 10 || 
               $this->getUserCount() > 20;
    }

    /**
     * Check if changes are significant.
     */
    protected function hasSignificantChanges(): bool
    {
        $significantFields = ['name', 'active', 'code'];
        
        foreach ($significantFields as $field) {
            if (array_key_exists($field, $this->changes)) {
                return true;
            }
        }
        
        return false;
    }

    /**
     * Check if service has critical equipment.
     */
    protected function hasCriticalEquipment(): bool
    {
        if (!$this->service) {
            return false;
        }

        return $this->service->equipos()
                           ->where('criesgo_id', 1) // Assuming 1 is high risk
                           ->exists();
    }

    /**
     * Check if service status changed.
     */
    public function statusChanged(): bool
    {
        return array_key_exists('active', $this->changes);
    }

    /**
     * Check if service name changed.
     */
    public function nameChanged(): bool
    {
        return array_key_exists('name', $this->changes);
    }

    /**
     * Get service statistics.
     */
    public function getServiceStatistics(): array
    {
        if (!$this->service) {
            return [];
        }

        return [
            'total_equipment' => $this->service->equipos()->count(),
            'active_equipment' => $this->service->equipos()->where('status', 1)->count(),
            'critical_equipment' => $this->service->equipos()->where('criesgo_id', 1)->count(),
            'pending_maintenance' => $this->service->equipos()
                                                 ->where('estado_mantenimiento', 1)
                                                 ->count(),
            'total_areas' => $this->service->areas()->count(),
            'active_areas' => $this->service->areas()->where('active', true)->count(),
            'total_users' => $this->service->usuarios()->count(),
            'active_users' => $this->service->usuarios()->where('estado', true)->count(),
            'contingencies_count' => $this->getContingenciesCount(),
            'overdue_maintenance_count' => $this->getOverdueMaintenanceCount(),
        ];
    }

    /**
     * Get contingencies count for this service.
     */
    protected function getContingenciesCount(): int
    {
        if (!$this->service) {
            return 0;
        }

        return \DB::table('contingencias')
                 ->join('equipos', 'contingencias.equipo_id', '=', 'equipos.id')
                 ->where('equipos.servicio_id', $this->service->id)
                 ->where('contingencias.estado', 'Activa')
                 ->count();
    }

    /**
     * Get overdue maintenance count for this service.
     */
    protected function getOverdueMaintenanceCount(): int
    {
        if (!$this->service) {
            return 0;
        }

        return \DB::table('mantenimientos')
                 ->join('equipos', 'mantenimientos.equipo_id', '=', 'equipos.id')
                 ->where('equipos.servicio_id', $this->service->id)
                 ->where('mantenimientos.status', 0)
                 ->where('mantenimientos.fecha_programada', '<', now())
                 ->count();
    }

    /**
     * Get affected equipment IDs.
     */
    public function getAffectedEquipmentIds(): array
    {
        if (!$this->service) {
            return [];
        }

        return $this->service->equipos()->pluck('id')->toArray();
    }

    /**
     * Get affected area IDs.
     */
    public function getAffectedAreaIds(): array
    {
        if (!$this->service) {
            return [];
        }

        return $this->service->areas()->pluck('id')->toArray();
    }

    /**
     * Get affected user IDs.
     */
    public function getAffectedUserIds(): array
    {
        if (!$this->service) {
            return [];
        }

        return $this->service->usuarios()->pluck('id')->toArray();
    }

    /**
     * Check if service is critical (has critical equipment or many resources).
     */
    public function isCriticalService(): bool
    {
        return $this->hasCriticalEquipment() || $this->hasHighResourceCount();
    }

    /**
     * Get service performance metrics.
     */
    public function getPerformanceMetrics(): array
    {
        if (!$this->service) {
            return [];
        }

        $statistics = $this->getServiceStatistics();
        
        return [
            'equipment_availability' => $statistics['active_equipment'] > 0 
                ? round(($statistics['active_equipment'] / $statistics['total_equipment']) * 100, 2)
                : 0,
            'maintenance_compliance' => $statistics['total_equipment'] > 0
                ? round((($statistics['total_equipment'] - $statistics['overdue_maintenance_count']) / $statistics['total_equipment']) * 100, 2)
                : 100,
            'critical_equipment_ratio' => $statistics['total_equipment'] > 0
                ? round(($statistics['critical_equipment'] / $statistics['total_equipment']) * 100, 2)
                : 0,
            'user_utilization' => $statistics['total_users'] > 0
                ? round(($statistics['active_users'] / $statistics['total_users']) * 100, 2)
                : 0,
            'area_utilization' => $statistics['total_areas'] > 0
                ? round(($statistics['active_areas'] / $statistics['total_areas']) * 100, 2)
                : 0,
        ];
    }

    /**
     * Get action description.
     */
    public function getActionDescription(): string
    {
        $serviceName = $this->service?->name ?? $this->serviceData['name'] ?? 'Servicio';
        
        return match ($this->action) {
            'created' => "Servicio '{$serviceName}' creado",
            'updated' => "Servicio '{$serviceName}' actualizado",
            'deleted' => "Servicio '{$serviceName}' eliminado",
            'activated' => "Servicio '{$serviceName}' activado",
            'deactivated' => "Servicio '{$serviceName}' desactivado",
            default => "Acción realizada en servicio '{$serviceName}'",
        };
    }

    /**
     * Get service impact assessment.
     */
    public function getImpactAssessment(): array
    {
        $statistics = $this->getServiceStatistics();
        
        return [
            'impact_level' => $this->calculateImpactLevel($statistics),
            'affected_resources' => [
                'equipment' => $statistics['total_equipment'] ?? 0,
                'areas' => $statistics['total_areas'] ?? 0,
                'users' => $statistics['total_users'] ?? 0,
            ],
            'critical_factors' => [
                'has_critical_equipment' => $this->hasCriticalEquipment(),
                'has_active_contingencies' => ($statistics['contingencies_count'] ?? 0) > 0,
                'has_overdue_maintenance' => ($statistics['overdue_maintenance_count'] ?? 0) > 0,
                'high_resource_count' => $this->hasHighResourceCount(),
            ],
            'recommendations' => $this->getRecommendations($statistics),
        ];
    }

    /**
     * Calculate impact level.
     */
    protected function calculateImpactLevel(array $statistics): string
    {
        $score = 0;
        
        // Equipment impact
        if (($statistics['total_equipment'] ?? 0) > 100) $score += 3;
        elseif (($statistics['total_equipment'] ?? 0) > 50) $score += 2;
        elseif (($statistics['total_equipment'] ?? 0) > 10) $score += 1;
        
        // Critical equipment impact
        if (($statistics['critical_equipment'] ?? 0) > 10) $score += 3;
        elseif (($statistics['critical_equipment'] ?? 0) > 5) $score += 2;
        elseif (($statistics['critical_equipment'] ?? 0) > 0) $score += 1;
        
        // User impact
        if (($statistics['total_users'] ?? 0) > 50) $score += 2;
        elseif (($statistics['total_users'] ?? 0) > 20) $score += 1;
        
        // Active issues impact
        if (($statistics['contingencies_count'] ?? 0) > 0) $score += 2;
        if (($statistics['overdue_maintenance_count'] ?? 0) > 5) $score += 2;
        
        return match (true) {
            $score >= 8 => 'critical',
            $score >= 5 => 'high',
            $score >= 2 => 'medium',
            default => 'low',
        };
    }

    /**
     * Get recommendations based on service state.
     */
    protected function getRecommendations(array $statistics): array
    {
        $recommendations = [];
        
        if (($statistics['overdue_maintenance_count'] ?? 0) > 0) {
            $recommendations[] = 'Revisar mantenimientos vencidos';
        }
        
        if (($statistics['contingencies_count'] ?? 0) > 0) {
            $recommendations[] = 'Resolver contingencias activas';
        }
        
        if (($statistics['critical_equipment'] ?? 0) > 0) {
            $recommendations[] = 'Monitorear equipos críticos';
        }
        
        $availability = $this->getPerformanceMetrics()['equipment_availability'] ?? 100;
        if ($availability < 90) {
            $recommendations[] = 'Mejorar disponibilidad de equipos';
        }
        
        return $recommendations;
    }
}
