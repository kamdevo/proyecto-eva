<?php

namespace App\Listeners;

use App\Events\Ticket\TicketManaged;
use App\Notifications\TicketManagedNotification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;

class TicketListener implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * The number of times the job may be attempted.
     */
    public int $tries = 3;

    /**
     * Handle ticket managed event.
     */
    public function handleTicketManaged(TicketManaged $event): void
    {
        try {
            // Log the ticket action
            $this->logTicketAction($event);

            // Update ticket metrics
            $this->updateTicketMetrics($event);

            // Handle specific actions
            $this->handleSpecificAction($event);

            // Send notifications
            if ($event->shouldNotify()) {
                $this->sendNotifications($event);
            }

            // Handle SLA tracking
            $this->trackSLA($event);

            // Create alerts for urgent tickets
            if ($event->isUrgentTicket()) {
                $this->createUrgentTicketAlert($event);
            }

            // Handle escalation if needed
            if ($event->isOverdueTicket()) {
                $this->handleTicketEscalation($event);
            }

            // Update dashboard metrics
            $this->updateDashboardMetrics($event);

        } catch (\Exception $e) {
            Log::error('Failed to handle ticket managed event', [
                'action' => $event->action,
                'ticket_id' => $event->ticketData['id'] ?? null,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }

    /**
     * Log ticket action.
     */
    protected function logTicketAction(TicketManaged $event): void
    {
        $logData = [
            'action' => $event->action,
            'ticket_id' => $event->ticketData['id'] ?? null,
            'ticket_title' => $event->ticketData['title'] ?? null,
            'status' => $event->getCurrentStatus(),
            'priority' => $event->ticketData['priority'] ?? 'normal',
            'assigned_to' => $event->getCurrentAssignee(),
            'created_by' => $event->ticketData['created_by'] ?? null,
            'changes' => $event->changes,
            'is_urgent' => $event->isUrgentTicket(),
            'is_overdue' => $event->isOverdueTicket(),
            'user_id' => $event->user?->id,
            'timestamp' => $event->timestamp,
        ];

        Log::channel('audit')->info('Ticket management action', $logData);

        // Store in audit trail
        $this->storeInAuditTrail($event, $logData);
    }

    /**
     * Store in audit trail.
     */
    protected function storeInAuditTrail(TicketManaged $event, array $logData): void
    {
        try {
            DB::table('audit_trail')->insert([
                'auditable_type' => 'ticket',
                'auditable_id' => $event->ticketData['id'] ?? 0,
                'event_type' => 'ticket.' . $event->action,
                'user_id' => $event->user?->id,
                'old_values' => json_encode($event->previousData),
                'new_values' => json_encode($event->ticketData),
                'ip_address' => $event->metadata['ip'] ?? null,
                'user_agent' => $event->metadata['user_agent'] ?? null,
                'metadata' => json_encode($logData),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to store ticket action in audit trail', [
                'action' => $event->action,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Update ticket metrics.
     */
    protected function updateTicketMetrics(TicketManaged $event): void
    {
        $today = now()->format('Y-m-d');
        $hour = now()->hour;

        // Update daily ticket action count
        Cache::increment("tickets:actions:daily:{$today}");
        
        // Update action-specific metrics
        Cache::increment("tickets:action:{$event->action}:daily:{$today}");
        
        // Update priority-specific metrics
        $priority = $event->ticketData['priority'] ?? 'normal';
        Cache::increment("tickets:priority:{$priority}:daily:{$today}");

        // Update status-specific metrics
        $status = $event->getCurrentStatus();
        Cache::increment("tickets:status:{$status}:count");

        // Store metrics in database
        $this->storeMetricsInDatabase($event, $today, $hour);
    }

    /**
     * Store metrics in database.
     */
    protected function storeMetricsInDatabase(TicketManaged $event, string $date, int $hour): void
    {
        try {
            // Store ticket action metrics
            DB::table('event_metrics')->updateOrInsert(
                [
                    'metric_type' => 'ticket_actions',
                    'metric_category' => 'daily',
                    'metric_key' => $event->action,
                    'metric_date' => $date,
                    'metric_hour' => null,
                ],
                [
                    'metric_value' => DB::raw('metric_value + 1'),
                    'metadata' => json_encode([
                        'ticket_id' => $event->ticketData['id'] ?? null,
                        'priority' => $event->ticketData['priority'] ?? 'normal',
                        'user_id' => $event->user?->id,
                    ]),
                    'updated_at' => now(),
                ]
            );

            // Store SLA metrics if applicable
            if ($event->getTicketAgeHours() !== null) {
                DB::table('event_metrics')->updateOrInsert(
                    [
                        'metric_type' => 'ticket_sla',
                        'metric_category' => 'daily',
                        'metric_key' => 'average_resolution_time',
                        'metric_date' => $date,
                        'metric_hour' => null,
                    ],
                    [
                        'metric_value' => $event->getTicketAgeHours(),
                        'metadata' => json_encode([
                            'ticket_id' => $event->ticketData['id'] ?? null,
                            'priority' => $event->ticketData['priority'] ?? 'normal',
                        ]),
                        'updated_at' => now(),
                    ]
                );
            }
        } catch (\Exception $e) {
            Log::error('Failed to store ticket metrics', [
                'action' => $event->action,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Handle specific actions.
     */
    protected function handleSpecificAction(TicketManaged $event): void
    {
        match ($event->action) {
            'created' => $this->handleTicketCreated($event),
            'assigned' => $this->handleTicketAssigned($event),
            'reassigned' => $this->handleTicketReassigned($event),
            'status_changed' => $this->handleStatusChanged($event),
            'escalated' => $this->handleTicketEscalated($event),
            'resolved' => $this->handleTicketResolved($event),
            'closed' => $this->handleTicketClosed($event),
            'reopened' => $this->handleTicketReopened($event),
            default => null,
        };
    }

    /**
     * Handle ticket created.
     */
    protected function handleTicketCreated(TicketManaged $event): void
    {
        // Auto-assign if rules exist
        $this->autoAssignTicket($event);

        // Set initial SLA
        $this->setInitialSLA($event);

        Log::info('Ticket created', [
            'ticket_id' => $event->ticketData['id'],
            'priority' => $event->ticketData['priority'] ?? 'normal',
            'created_by' => $event->ticketData['created_by'],
        ]);
    }

    /**
     * Handle ticket assigned.
     */
    protected function handleTicketAssigned(TicketManaged $event): void
    {
        // Update workload metrics
        $this->updateWorkloadMetrics($event);

        Log::info('Ticket assigned', [
            'ticket_id' => $event->ticketData['id'],
            'assigned_to' => $event->getCurrentAssignee(),
        ]);
    }

    /**
     * Handle ticket reassigned.
     */
    protected function handleTicketReassigned(TicketManaged $event): void
    {
        // Update workload metrics for both users
        $this->updateWorkloadMetrics($event);

        Log::info('Ticket reassigned', [
            'ticket_id' => $event->ticketData['id'],
            'previous_assignee' => $event->getPreviousAssignee(),
            'new_assignee' => $event->getCurrentAssignee(),
        ]);
    }

    /**
     * Handle status changed.
     */
    protected function handleStatusChanged(TicketManaged $event): void
    {
        $previousStatus = $event->getPreviousStatus();
        $currentStatus = $event->getCurrentStatus();

        // Update status transition metrics
        Cache::increment("tickets:transition:{$previousStatus}_to_{$currentStatus}:count");

        Log::info('Ticket status changed', [
            'ticket_id' => $event->ticketData['id'],
            'previous_status' => $previousStatus,
            'current_status' => $currentStatus,
        ]);
    }

    /**
     * Handle ticket escalated.
     */
    protected function handleTicketEscalated(TicketManaged $event): void
    {
        // Create escalation alert
        $this->createEscalationAlert($event);

        // Update escalation metrics
        Cache::increment('tickets:escalations:daily:' . now()->format('Y-m-d'));

        Log::warning('Ticket escalated', [
            'ticket_id' => $event->ticketData['id'],
            'escalation_reason' => $event->ticketData['escalation_reason'] ?? 'Not specified',
        ]);
    }

    /**
     * Handle ticket resolved.
     */
    protected function handleTicketResolved(TicketManaged $event): void
    {
        // Calculate resolution time
        $resolutionTime = $event->getTicketAgeHours();
        
        // Update resolution metrics
        if ($resolutionTime) {
            Cache::put("ticket:{$event->ticketData['id']}:resolution_time", $resolutionTime, 86400);
        }

        Log::info('Ticket resolved', [
            'ticket_id' => $event->ticketData['id'],
            'resolution_time_hours' => $resolutionTime,
        ]);
    }

    /**
     * Handle ticket closed.
     */
    protected function handleTicketClosed(TicketManaged $event): void
    {
        // Update closure metrics
        Cache::increment('tickets:closed:daily:' . now()->format('Y-m-d'));

        Log::info('Ticket closed', [
            'ticket_id' => $event->ticketData['id'],
        ]);
    }

    /**
     * Handle ticket reopened.
     */
    protected function handleTicketReopened(TicketManaged $event): void
    {
        // Update reopen metrics
        Cache::increment('tickets:reopened:daily:' . now()->format('Y-m-d'));

        Log::warning('Ticket reopened', [
            'ticket_id' => $event->ticketData['id'],
            'reopen_reason' => $event->ticketData['reopen_reason'] ?? 'Not specified',
        ]);
    }

    /**
     * Send notifications.
     */
    protected function sendNotifications(TicketManaged $event): void
    {
        $usersToNotify = $event->getUsersToNotify();
        
        if ($usersToNotify->isEmpty()) {
            return;
        }

        try {
            Notification::send($usersToNotify, new TicketManagedNotification($event));
            
            Log::info('Ticket notifications sent', [
                'action' => $event->action,
                'ticket_id' => $event->ticketData['id'],
                'recipients_count' => $usersToNotify->count(),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send ticket notifications', [
                'action' => $event->action,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Track SLA.
     */
    protected function trackSLA(TicketManaged $event): void
    {
        $ticketId = $event->ticketData['id'] ?? null;
        $priority = $event->ticketData['priority'] ?? 'normal';
        
        if (!$ticketId) {
            return;
        }

        // Define SLA times based on priority
        $slaHours = match ($priority) {
            'critical' => 2,
            'high' => 8,
            'medium' => 24,
            'low' => 72,
            default => 24,
        };

        $slaDeadline = now()->addHours($slaHours);
        
        Cache::put("ticket:{$ticketId}:sla_deadline", $slaDeadline, 86400 * 7);
    }

    /**
     * Create urgent ticket alert.
     */
    protected function createUrgentTicketAlert(TicketManaged $event): void
    {
        try {
            DB::table('system_alerts')->insert([
                'type' => 'urgent_ticket',
                'title' => 'Ticket Urgente Creado',
                'message' => "Ticket urgente #{$event->ticketData['id']}: {$event->ticketData['title']}",
                'severity' => 'high',
                'status' => 'active',
                'created_by' => $event->user?->id,
                'data' => json_encode([
                    'ticket_id' => $event->ticketData['id'],
                    'priority' => $event->ticketData['priority'],
                    'assigned_to' => $event->getCurrentAssignee(),
                ]),
                'expires_at' => now()->addDays(1),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to create urgent ticket alert', [
                'ticket_id' => $event->ticketData['id'],
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Handle ticket escalation.
     */
    protected function handleTicketEscalation(TicketManaged $event): void
    {
        // Auto-escalate overdue tickets
        if ($event->isOverdueTicket()) {
            $this->autoEscalateTicket($event);
        }
    }

    /**
     * Update dashboard metrics.
     */
    protected function updateDashboardMetrics(TicketManaged $event): void
    {
        // Trigger dashboard update
        event(new \App\Events\Dashboard\DashboardMetricsUpdated(
            $event->getTicketSummary(),
            'ticket_management',
            null,
            null,
            $event->user
        ));
    }

    /**
     * Auto-assign ticket.
     */
    protected function autoAssignTicket(TicketManaged $event): void
    {
        // Implementation for auto-assignment logic
        Log::info('Auto-assignment evaluated for ticket', [
            'ticket_id' => $event->ticketData['id'],
        ]);
    }

    /**
     * Set initial SLA.
     */
    protected function setInitialSLA(TicketManaged $event): void
    {
        $this->trackSLA($event);
    }

    /**
     * Update workload metrics.
     */
    protected function updateWorkloadMetrics(TicketManaged $event): void
    {
        $assigneeId = $event->getCurrentAssignee();
        
        if ($assigneeId) {
            Cache::increment("user:{$assigneeId}:assigned_tickets:count");
        }
    }

    /**
     * Create escalation alert.
     */
    protected function createEscalationAlert(TicketManaged $event): void
    {
        try {
            DB::table('system_alerts')->insert([
                'type' => 'ticket_escalated',
                'title' => 'Ticket Escalado',
                'message' => "Ticket #{$event->ticketData['id']} ha sido escalado",
                'severity' => 'high',
                'status' => 'active',
                'created_by' => $event->user?->id,
                'data' => json_encode([
                    'ticket_id' => $event->ticketData['id'],
                    'escalation_reason' => $event->ticketData['escalation_reason'] ?? null,
                ]),
                'expires_at' => now()->addDays(3),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to create escalation alert', [
                'ticket_id' => $event->ticketData['id'],
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Auto-escalate ticket.
     */
    protected function autoEscalateTicket(TicketManaged $event): void
    {
        // Implementation for auto-escalation logic
        Log::warning('Auto-escalation triggered for overdue ticket', [
            'ticket_id' => $event->ticketData['id'],
            'age_hours' => $event->getTicketAgeHours(),
        ]);
    }

    /**
     * Handle job failure.
     */
    public function failed(TicketManaged $event, \Throwable $exception): void
    {
        Log::error('Ticket listener failed', [
            'action' => $event->action,
            'ticket_id' => $event->ticketData['id'] ?? null,
            'error' => $exception->getMessage(),
            'trace' => $exception->getTraceAsString(),
        ]);
    }
}
