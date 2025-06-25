<?php

namespace App\Events;

use App\Models\User;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Auth;

abstract class BaseEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * User who triggered the event.
     */
    public ?User $user;

    /**
     * Event timestamp.
     */
    public string $timestamp;

    /**
     * Event metadata.
     */
    public array $metadata;

    /**
     * Create a new event instance.
     */
    public function __construct(?User $user = null, array $metadata = [])
    {
        $this->user = $user ?? Auth::user();
        $this->timestamp = now()->toISOString();
        $this->metadata = array_merge([
            'ip' => request()?->ip(),
            'user_agent' => request()?->userAgent(),
            'session_id' => session()->getId(),
        ], $metadata);
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('user.' . ($this->user?->id ?? 'guest')),
            new PrivateChannel('system.events'),
        ];
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'event_type' => $this->getEventType(),
            'user' => $this->user ? [
                'id' => $this->user->id,
                'name' => $this->user->getFullNameAttribute(),
                'email' => $this->user->email,
            ] : null,
            'timestamp' => $this->timestamp,
            'metadata' => $this->metadata,
            'data' => $this->getEventData(),
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'eva.' . $this->getEventType();
    }

    /**
     * Get event type identifier.
     */
    abstract protected function getEventType(): string;

    /**
     * Get event-specific data.
     */
    abstract protected function getEventData(): array;

    /**
     * Get event priority.
     */
    public function getPriority(): string
    {
        return 'normal';
    }

    /**
     * Get event category.
     */
    public function getCategory(): string
    {
        return 'general';
    }

    /**
     * Check if event should be logged.
     */
    public function shouldLog(): bool
    {
        return true;
    }

    /**
     * Check if event should send notifications.
     */
    public function shouldNotify(): bool
    {
        return false;
    }

    /**
     * Get notification channels.
     */
    public function getNotificationChannels(): array
    {
        return ['database'];
    }

    /**
     * Get users to notify.
     */
    public function getUsersToNotify(): \Illuminate\Database\Eloquent\Collection
    {
        return collect();
    }
}
