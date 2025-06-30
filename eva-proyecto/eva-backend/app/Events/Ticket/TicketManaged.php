<?php

namespace App\Events\Ticket;

use App\Events\BaseEvent;
use App\Models\User;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\PrivateChannel;

class TicketManaged extends BaseEvent
{
    /**
     * Ticket data.
     */
    public array $ticketData;

    /**
     * Management action.
     */
    public string $action;

    /**
     * Previous ticket data (for updates).
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
        array $ticketData,
        string $action,
        ?array $previousData = null,
        array $changes = [],
        ?User $user = null,
        array $metadata = []
    ) {
        $this->ticketData = $ticketData;
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
            new Channel('ticket.managed'),
            new PrivateChannel('ticket.' . $this->ticketData['id']),
        ]);

        // Add channels based on ticket assignment
        if (isset($this->ticketData['assigned_to'])) {
            $channels[] = new PrivateChannel('user.tickets.' . $this->ticketData['assigned_to']);
        }

        if (isset($this->ticketData['created_by'])) {
            $channels[] = new PrivateChannel('user.tickets.' . $this->ticketData['created_by']);
        }

        // Add service-specific channel if ticket is related to equipment
        if (isset($this->ticketData['equipment_id'])) {
            $channels[] = new PrivateChannel('equipment.' . $this->ticketData['equipment_id'] . '.tickets');
        }

        return $channels;
    }

    /**
     * Get event type identifier.
     */
    protected function getEventType(): string
    {
        return 'ticket.' . $this->action;
    }

    /**
     * Get event-specific data.
     */
    protected function getEventData(): array
    {
        return [
            'ticket' => $this->ticketData,
            'action' => $this->action,
            'changes' => $this->changes,
            'previous_data' => $this->previousData,
            'action_performed_by' => [
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
        // Critical priority for urgent tickets or escalations
        if ($this->isUrgentTicket() || $this->action === 'escalated') {
            return 'critical';
        }

        // High priority for new tickets, assignments, or status changes
        if (in_array($this->action, ['created', 'assigned', 'status_changed', 'reopened'])) {
            return 'high';
        }

        // High priority for overdue tickets
        if ($this->isOverdueTicket()) {
            return 'high';
        }

        return 'normal';
    }

    /**
     * Get event category.
     */
    public function getCategory(): string
    {
        return 'ticket';
    }

    /**
     * Check if event should send notifications.
     */
    public function shouldNotify(): bool
    {
        // Always notify for ticket management actions
        return true;
    }

    /**
     * Get notification channels.
     */
    public function getNotificationChannels(): array
    {
        $channels = ['database', 'broadcast'];

        // Add email for urgent tickets or critical actions
        if ($this->isUrgentTicket() || in_array($this->action, ['created', 'escalated', 'overdue'])) {
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

        // Always notify the assigned user (if any)
        if (isset($this->ticketData['assigned_to'])) {
            $assignedUser = User::find($this->ticketData['assigned_to']);
            if ($assignedUser) {
                $usersToNotify->push($assignedUser);
            }
        }

        // Always notify the ticket creator (if different from assigned user)
        if (isset($this->ticketData['created_by']) && 
            $this->ticketData['created_by'] !== ($this->ticketData['assigned_to'] ?? null)) {
            $creator = User::find($this->ticketData['created_by']);
            if ($creator) {
                $usersToNotify->push($creator);
            }
        }

        // For urgent tickets or escalations, notify supervisors and administrators
        if ($this->isUrgentTicket() || $this->action === 'escalated') {
            $supervisors = User::whereHas('rol', function ($query) {
                $query->whereIn('nombre', ['Administrador', 'Supervisor']);
            })
            ->where('estado', true)
            ->where('active', 'true')
            ->get();

            $usersToNotify = $usersToNotify->merge($supervisors);
        }

        // For equipment-related tickets, notify users in the same service
        if (isset($this->ticketData['equipment_id'])) {
            $equipment = \App\Models\Equipo::find($this->ticketData['equipment_id']);
            if ($equipment && $equipment->servicio_id) {
                $serviceUsers = User::where('servicio_id', $equipment->servicio_id)
                                  ->where('estado', true)
                                  ->where('active', 'true')
                                  ->get();
                $usersToNotify = $usersToNotify->merge($serviceUsers);
            }
        }

        return $usersToNotify->unique('id');
    }

    /**
     * Check if ticket is urgent.
     */
    public function isUrgentTicket(): bool
    {
        $priority = $this->ticketData['priority'] ?? 'normal';
        return in_array(strtolower($priority), ['urgent', 'critical', 'high']);
    }

    /**
     * Check if ticket is overdue.
     */
    public function isOverdueTicket(): bool
    {
        if (!isset($this->ticketData['due_date'])) {
            return false;
        }

        $dueDate = \Carbon\Carbon::parse($this->ticketData['due_date']);
        return $dueDate->isPast() && !$this->isTicketClosed();
    }

    /**
     * Check if ticket is closed.
     */
    public function isTicketClosed(): bool
    {
        $status = $this->ticketData['status'] ?? 'open';
        return in_array(strtolower($status), ['closed', 'resolved', 'completed']);
    }

    /**
     * Check if ticket status changed.
     */
    public function statusChanged(): bool
    {
        return array_key_exists('status', $this->changes);
    }

    /**
     * Check if ticket was assigned.
     */
    public function wasAssigned(): bool
    {
        return array_key_exists('assigned_to', $this->changes) && 
               $this->changes['assigned_to'] !== null;
    }

    /**
     * Check if ticket was reassigned.
     */
    public function wasReassigned(): bool
    {
        return array_key_exists('assigned_to', $this->changes) && 
               isset($this->previousData['assigned_to']) &&
               $this->previousData['assigned_to'] !== null &&
               $this->changes['assigned_to'] !== $this->previousData['assigned_to'];
    }

    /**
     * Check if ticket priority changed.
     */
    public function priorityChanged(): bool
    {
        return array_key_exists('priority', $this->changes);
    }

    /**
     * Get previous status.
     */
    public function getPreviousStatus(): ?string
    {
        return $this->previousData['status'] ?? null;
    }

    /**
     * Get current status.
     */
    public function getCurrentStatus(): string
    {
        return $this->ticketData['status'] ?? 'open';
    }

    /**
     * Get previous assignee.
     */
    public function getPreviousAssignee(): ?int
    {
        return $this->previousData['assigned_to'] ?? null;
    }

    /**
     * Get current assignee.
     */
    public function getCurrentAssignee(): ?int
    {
        return $this->ticketData['assigned_to'] ?? null;
    }

    /**
     * Get ticket age in hours.
     */
    public function getTicketAgeHours(): ?int
    {
        if (!isset($this->ticketData['created_at'])) {
            return null;
        }

        $createdAt = \Carbon\Carbon::parse($this->ticketData['created_at']);
        return $createdAt->diffInHours(now());
    }

    /**
     * Get time until due date in hours.
     */
    public function getTimeUntilDueHours(): ?int
    {
        if (!isset($this->ticketData['due_date'])) {
            return null;
        }

        $dueDate = \Carbon\Carbon::parse($this->ticketData['due_date']);
        return now()->diffInHours($dueDate, false);
    }

    /**
     * Get ticket category.
     */
    public function getTicketCategory(): ?string
    {
        return $this->ticketData['category'] ?? null;
    }

    /**
     * Get ticket type.
     */
    public function getTicketType(): ?string
    {
        return $this->ticketData['type'] ?? null;
    }

    /**
     * Get related equipment information.
     */
    public function getRelatedEquipment(): ?array
    {
        if (!isset($this->ticketData['equipment_id'])) {
            return null;
        }

        try {
            $equipment = \App\Models\Equipo::find($this->ticketData['equipment_id']);
            if (!$equipment) {
                return null;
            }

            return [
                'id' => $equipment->id,
                'code' => $equipment->code,
                'name' => $equipment->name,
                'service_id' => $equipment->servicio_id,
                'service_name' => $equipment->servicio?->name,
                'area_id' => $equipment->area_id,
                'area_name' => $equipment->area?->name,
            ];
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Get action description.
     */
    public function getActionDescription(): string
    {
        $ticketId = $this->ticketData['id'] ?? 'N/A';
        $title = $this->ticketData['title'] ?? 'Ticket';
        
        return match ($this->action) {
            'created' => "Ticket #{$ticketId} '{$title}' creado",
            'updated' => "Ticket #{$ticketId} '{$title}' actualizado",
            'assigned' => "Ticket #{$ticketId} '{$title}' asignado",
            'reassigned' => "Ticket #{$ticketId} '{$title}' reasignado",
            'status_changed' => "Estado del ticket #{$ticketId} '{$title}' cambiado",
            'priority_changed' => "Prioridad del ticket #{$ticketId} '{$title}' cambiada",
            'escalated' => "Ticket #{$ticketId} '{$title}' escalado",
            'resolved' => "Ticket #{$ticketId} '{$title}' resuelto",
            'closed' => "Ticket #{$ticketId} '{$title}' cerrado",
            'reopened' => "Ticket #{$ticketId} '{$title}' reabierto",
            'commented' => "Comentario agregado al ticket #{$ticketId} '{$title}'",
            'overdue' => "Ticket #{$ticketId} '{$title}' vencido",
            default => "Acción realizada en ticket #{$ticketId} '{$title}'",
        };
    }

    /**
     * Get ticket summary.
     */
    public function getTicketSummary(): array
    {
        return [
            'id' => $this->ticketData['id'] ?? null,
            'title' => $this->ticketData['title'] ?? null,
            'status' => $this->getCurrentStatus(),
            'priority' => $this->ticketData['priority'] ?? 'normal',
            'category' => $this->getTicketCategory(),
            'type' => $this->getTicketType(),
            'assigned_to' => $this->getCurrentAssignee(),
            'created_by' => $this->ticketData['created_by'] ?? null,
            'age_hours' => $this->getTicketAgeHours(),
            'time_until_due_hours' => $this->getTimeUntilDueHours(),
            'is_urgent' => $this->isUrgentTicket(),
            'is_overdue' => $this->isOverdueTicket(),
            'is_closed' => $this->isTicketClosed(),
            'related_equipment' => $this->getRelatedEquipment(),
        ];
    }
}
