<?php

namespace App\Events\Spare;

use App\Events\BaseEvent;
use App\Models\User;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\PrivateChannel;

class SparePartManaged extends BaseEvent
{
    /**
     * Spare part data.
     */
    public array $sparePartData;

    /**
     * Management action.
     */
    public string $action;

    /**
     * Previous spare part data (for updates).
     */
    public ?array $previousData;

    /**
     * Changes made (for updates).
     */
    public array $changes;

    /**
     * Create a new event instance.
     */
    public function __construct(
        array $sparePartData,
        string $action,
        ?array $previousData = null,
        array $changes = [],
        ?User $user = null,
        array $metadata = []
    ) {
        $this->sparePartData = $sparePartData;
        $this->action = $action;
        $this->previousData = $previousData;
        $this->changes = $changes;
        parent::__construct($user, $metadata);
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        $channels = array_merge(parent::broadcastOn(), [
            new Channel('spare.managed'),
            new Channel('inventory.updates'),
        ]);

        if (isset($this->sparePartData['id'])) {
            $channels[] = new PrivateChannel('spare.' . $this->sparePartData['id']);
        }

        // Add equipment-specific channel if spare is for specific equipment
        if (isset($this->sparePartData['equipment_id'])) {
            $channels[] = new PrivateChannel('equipment.' . $this->sparePartData['equipment_id'] . '.spares');
        }

        return $channels;
    }

    /**
     * Get event type identifier.
     */
    protected function getEventType(): string
    {
        return 'spare.' . $this->action;
    }

    /**
     * Get event-specific data.
     */
    protected function getEventData(): array
    {
        return [
            'spare_part' => $this->sparePartData,
            'action' => $this->action,
            'changes' => $this->changes,
            'previous_data' => $this->previousData,
            'inventory_impact' => $this->getInventoryImpact(),
            'cost_impact' => $this->getCostImpact(),
            'managed_by' => [
                'id' => $this->user?->id,
                'name' => $this->user?->getFullNameAttribute(),
                'role' => $this->user?->rol?->nombre,
            ],
        ];
    }

    /**
     * Get event priority.
     */
    public function getPriority(): string
    {
        // Critical priority for critical spare parts or low stock
        if ($this->isCriticalSparePart() || $this->isLowStock()) {
            return 'critical';
        }

        // High priority for stock changes, expensive parts, or urgent requests
        if ($this->isStockChange() || $this->isExpensivePart() || $this->isUrgentRequest()) {
            return 'high';
        }

        return 'normal';
    }

    /**
     * Get event category.
     */
    public function getCategory(): string
    {
        return 'spare_part';
    }

    /**
     * Check if event should send notifications.
     */
    public function shouldNotify(): bool
    {
        // Notify for critical parts, low stock, or significant changes
        return $this->isCriticalSparePart() || 
               $this->isLowStock() || 
               $this->isStockChange() ||
               in_array($this->action, ['created', 'deleted', 'requested', 'approved', 'rejected']);
    }

    /**
     * Get notification channels.
     */
    public function getNotificationChannels(): array
    {
        $channels = ['database', 'broadcast'];

        // Add email for critical parts or urgent situations
        if ($this->isCriticalSparePart() || $this->isLowStock() || $this->isUrgentRequest()) {
            $channels[] = 'mail';
        }

        return $channels;
    }

    /**
     * Get users to notify.
     */
    public function getUsersToNotify(): \Illuminate\Database\Eloquent\Collection
    {
        $usersToNotify = collect();

        // Always notify inventory managers and administrators
        $inventoryManagers = User::whereHas('rol', function ($query) {
            $query->whereIn('nombre', ['Administrador', 'Supervisor', 'Encargado de Inventario']);
        })
        ->where('estado', true)
        ->where('active', 'true')
        ->get();

        $usersToNotify = $usersToNotify->merge($inventoryManagers);

        // For equipment-specific spares, notify users in the same service
        if (isset($this->sparePartData['equipment_id'])) {
            $equipment = \App\Models\Equipo::find($this->sparePartData['equipment_id']);
            if ($equipment && $equipment->servicio_id) {
                $serviceUsers = User::where('servicio_id', $equipment->servicio_id)
                                  ->where('estado', true)
                                  ->where('active', 'true')
                                  ->get();
                $usersToNotify = $usersToNotify->merge($serviceUsers);
            }
        }

        // For requests, notify the requester
        if (in_array($this->action, ['approved', 'rejected']) && isset($this->sparePartData['requested_by'])) {
            $requester = User::find($this->sparePartData['requested_by']);
            if ($requester) {
                $usersToNotify->push($requester);
            }
        }

        return $usersToNotify->unique('id');
    }

    /**
     * Check if spare part is critical.
     */
    public function isCriticalSparePart(): bool
    {
        // Check if it's for critical equipment
        if (isset($this->sparePartData['equipment_id'])) {
            $equipment = \App\Models\Equipo::find($this->sparePartData['equipment_id']);
            if ($equipment && $equipment->criesgo_id === 1) {
                return true;
            }
        }

        // Check if it's marked as critical
        return ($this->sparePartData['is_critical'] ?? false) ||
               ($this->sparePartData['priority'] ?? 'normal') === 'critical';
    }

    /**
     * Check if stock is low.
     */
    public function isLowStock(): bool
    {
        $currentStock = $this->sparePartData['current_stock'] ?? 0;
        $minStock = $this->sparePartData['min_stock'] ?? 0;
        
        return $currentStock <= $minStock && $minStock > 0;
    }

    /**
     * Check if this is a stock change.
     */
    public function isStockChange(): bool
    {
        return array_key_exists('current_stock', $this->changes) ||
               in_array($this->action, ['stock_added', 'stock_removed', 'stock_adjusted']);
    }

    /**
     * Check if part is expensive.
     */
    public function isExpensivePart(): bool
    {
        $cost = $this->sparePartData['unit_cost'] ?? 0;
        return $cost > 1000; // Configurable threshold
    }

    /**
     * Check if this is an urgent request.
     */
    public function isUrgentRequest(): bool
    {
        return ($this->sparePartData['urgency'] ?? 'normal') === 'urgent' ||
               ($this->sparePartData['priority'] ?? 'normal') === 'urgent';
    }

    /**
     * Get inventory impact.
     */
    protected function getInventoryImpact(): array
    {
        $impact = [
            'stock_change' => 0,
            'value_change' => 0,
            'availability_status' => 'available',
        ];

        if ($this->isStockChange() && isset($this->changes['current_stock'])) {
            $previousStock = $this->previousData['current_stock'] ?? 0;
            $currentStock = $this->sparePartData['current_stock'] ?? 0;
            $unitCost = $this->sparePartData['unit_cost'] ?? 0;

            $impact['stock_change'] = $currentStock - $previousStock;
            $impact['value_change'] = $impact['stock_change'] * $unitCost;
        }

        // Determine availability status
        $currentStock = $this->sparePartData['current_stock'] ?? 0;
        $minStock = $this->sparePartData['min_stock'] ?? 0;

        if ($currentStock <= 0) {
            $impact['availability_status'] = 'out_of_stock';
        } elseif ($currentStock <= $minStock) {
            $impact['availability_status'] = 'low_stock';
        } else {
            $impact['availability_status'] = 'available';
        }

        return $impact;
    }

    /**
     * Get cost impact.
     */
    protected function getCostImpact(): array
    {
        $unitCost = $this->sparePartData['unit_cost'] ?? 0;
        $currentStock = $this->sparePartData['current_stock'] ?? 0;
        $totalValue = $unitCost * $currentStock;

        return [
            'unit_cost' => $unitCost,
            'total_inventory_value' => $totalValue,
            'cost_category' => $this->getCostCategory($unitCost),
            'budget_impact' => $this->getBudgetImpact(),
        ];
    }

    /**
     * Get cost category.
     */
    protected function getCostCategory(float $unitCost): string
    {
        return match (true) {
            $unitCost >= 5000 => 'very_high',
            $unitCost >= 1000 => 'high',
            $unitCost >= 500 => 'medium',
            $unitCost >= 100 => 'low',
            default => 'very_low',
        };
    }

    /**
     * Get budget impact.
     */
    protected function getBudgetImpact(): array
    {
        $impact = ['level' => 'minimal', 'amount' => 0];

        if ($this->action === 'requested' && isset($this->sparePartData['quantity_requested'])) {
            $quantity = $this->sparePartData['quantity_requested'];
            $unitCost = $this->sparePartData['unit_cost'] ?? 0;
            $totalCost = $quantity * $unitCost;

            $impact['amount'] = $totalCost;
            $impact['level'] = match (true) {
                $totalCost >= 10000 => 'critical',
                $totalCost >= 5000 => 'high',
                $totalCost >= 1000 => 'medium',
                default => 'low',
            };
        }

        return $impact;
    }

    /**
     * Get spare part category.
     */
    public function getSparePartCategory(): ?string
    {
        return $this->sparePartData['category'] ?? null;
    }

    /**
     * Get related equipment information.
     */
    public function getRelatedEquipment(): ?array
    {
        if (!isset($this->sparePartData['equipment_id'])) {
            return null;
        }

        try {
            $equipment = \App\Models\Equipo::find($this->sparePartData['equipment_id']);
            if (!$equipment) {
                return null;
            }

            return [
                'id' => $equipment->id,
                'code' => $equipment->code,
                'name' => $equipment->name,
                'service_id' => $equipment->servicio_id,
                'service_name' => $equipment->servicio?->name,
                'risk_level' => $equipment->criesgo_id,
            ];
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Get stock status.
     */
    public function getStockStatus(): array
    {
        $currentStock = $this->sparePartData['current_stock'] ?? 0;
        $minStock = $this->sparePartData['min_stock'] ?? 0;
        $maxStock = $this->sparePartData['max_stock'] ?? null;

        return [
            'current' => $currentStock,
            'minimum' => $minStock,
            'maximum' => $maxStock,
            'status' => $this->getInventoryImpact()['availability_status'],
            'days_until_reorder' => $this->calculateDaysUntilReorder(),
            'reorder_needed' => $this->isReorderNeeded(),
        ];
    }

    /**
     * Calculate days until reorder needed.
     */
    protected function calculateDaysUntilReorder(): ?int
    {
        $currentStock = $this->sparePartData['current_stock'] ?? 0;
        $minStock = $this->sparePartData['min_stock'] ?? 0;
        $avgUsagePerDay = $this->sparePartData['avg_usage_per_day'] ?? 0;

        if ($avgUsagePerDay <= 0 || $currentStock <= $minStock) {
            return null;
        }

        return (int) floor(($currentStock - $minStock) / $avgUsagePerDay);
    }

    /**
     * Check if reorder is needed.
     */
    protected function isReorderNeeded(): bool
    {
        return $this->isLowStock() || $this->calculateDaysUntilReorder() <= 7;
    }

    /**
     * Get action description.
     */
    public function getActionDescription(): string
    {
        $partName = $this->sparePartData['name'] ?? $this->sparePartData['part_number'] ?? 'Repuesto';
        $partId = $this->sparePartData['id'] ?? 'N/A';
        
        return match ($this->action) {
            'created' => "Repuesto '{$partName}' (#{$partId}) agregado al inventario",
            'updated' => "Repuesto '{$partName}' (#{$partId}) actualizado",
            'deleted' => "Repuesto '{$partName}' (#{$partId}) eliminado del inventario",
            'stock_added' => "Stock agregado al repuesto '{$partName}' (#{$partId})",
            'stock_removed' => "Stock removido del repuesto '{$partName}' (#{$partId})",
            'stock_adjusted' => "Stock ajustado para repuesto '{$partName}' (#{$partId})",
            'requested' => "Solicitud de repuesto '{$partName}' (#{$partId}) creada",
            'approved' => "Solicitud de repuesto '{$partName}' (#{$partId}) aprobada",
            'rejected' => "Solicitud de repuesto '{$partName}' (#{$partId}) rechazada",
            'issued' => "Repuesto '{$partName}' (#{$partId}) entregado",
            'returned' => "Repuesto '{$partName}' (#{$partId}) devuelto",
            'reserved' => "Repuesto '{$partName}' (#{$partId}) reservado",
            'unreserved' => "Reserva del repuesto '{$partName}' (#{$partId}) liberada",
            default => "Acción realizada en repuesto '{$partName}' (#{$partId})",
        };
    }

    /**
     * Get spare part summary.
     */
    public function getSparePartSummary(): array
    {
        return [
            'id' => $this->sparePartData['id'] ?? null,
            'name' => $this->sparePartData['name'] ?? null,
            'part_number' => $this->sparePartData['part_number'] ?? null,
            'category' => $this->getSparePartCategory(),
            'current_stock' => $this->sparePartData['current_stock'] ?? 0,
            'min_stock' => $this->sparePartData['min_stock'] ?? 0,
            'unit_cost' => $this->sparePartData['unit_cost'] ?? 0,
            'total_value' => $this->getCostImpact()['total_inventory_value'],
            'is_critical' => $this->isCriticalSparePart(),
            'is_low_stock' => $this->isLowStock(),
            'availability_status' => $this->getInventoryImpact()['availability_status'],
            'related_equipment' => $this->getRelatedEquipment(),
            'reorder_needed' => $this->isReorderNeeded(),
        ];
    }
}
