<?php

namespace App\Events\User;

use App\Events\BaseEvent;
use App\Models\User;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\PrivateChannel;

class UserLoggedIn extends BaseEvent
{
    /**
     * Login details.
     */
    public array $loginDetails;

    /**
     * Create a new event instance.
     */
    public function __construct(User $user, array $loginDetails = [], array $metadata = [])
    {
        $this->loginDetails = $loginDetails;
        parent::__construct($user, $metadata);
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        return array_merge(parent::broadcastOn(), [
            new Channel('user.activity'),
            new PrivateChannel('service.' . $this->user?->servicio_id),
        ]);
    }

    /**
     * Get event type identifier.
     */
    protected function getEventType(): string
    {
        return 'user.logged_in';
    }

    /**
     * Get event-specific data.
     */
    protected function getEventData(): array
    {
        return [
            'user' => [
                'id' => $this->user->id,
                'username' => $this->user->username,
                'email' => $this->user->email,
                'name' => $this->user->getFullNameAttribute(),
                'role' => $this->user->rol?->nombre,
                'service_id' => $this->user->servicio_id,
                'service_name' => $this->user->servicio?->name,
                'last_login_at' => $this->user->last_login_at?->toISOString(),
            ],
            'login_details' => $this->loginDetails,
            'session_info' => [
                'ip' => $this->metadata['ip'] ?? null,
                'user_agent' => $this->metadata['user_agent'] ?? null,
                'session_id' => $this->metadata['session_id'] ?? null,
            ],
        ];
    }

    /**
     * Get event priority.
     */
    public function getPriority(): string
    {
        // High priority for suspicious logins
        if ($this->isSuspiciousLogin()) {
            return 'high';
        }
        
        return 'low';
    }

    /**
     * Get event category.
     */
    public function getCategory(): string
    {
        return 'authentication';
    }

    /**
     * Check if event should send notifications.
     */
    public function shouldNotify(): bool
    {
        return $this->isSuspiciousLogin() || $this->isAdminLogin();
    }

    /**
     * Get notification channels.
     */
    public function getNotificationChannels(): array
    {
        $channels = ['database'];
        
        // Add email for suspicious logins
        if ($this->isSuspiciousLogin()) {
            $channels[] = 'mail';
        }
        
        return $channels;
    }

    /**
     * Get users to notify.
     */
    public function getUsersToNotify(): \Illuminate\Database\Eloquent\Collection
    {
        // Only notify administrators for suspicious logins
        if ($this->isSuspiciousLogin()) {
            return User::whereHas('rol', function ($query) {
                $query->where('nombre', 'Administrador');
            })
            ->where('estado', true)
            ->where('active', 'true')
            ->get();
        }
        
        return collect();
    }

    /**
     * Check if login is suspicious.
     */
    public function isSuspiciousLogin(): bool
    {
        // Check for suspicious patterns
        $ip = $this->metadata['ip'] ?? null;
        $userAgent = $this->metadata['user_agent'] ?? null;
        
        // Check if IP is from different country/region than usual
        // Check if user agent is unusual
        // Check if login time is unusual
        
        // For now, simple checks
        if ($ip && $this->isUnusualIP($ip)) {
            return true;
        }
        
        if ($this->isUnusualTime()) {
            return true;
        }
        
        return false;
    }

    /**
     * Check if IP is unusual for this user.
     */
    protected function isUnusualIP(string $ip): bool
    {
        // Check against user's usual IPs (would need to store this data)
        // For now, return false
        return false;
    }

    /**
     * Check if login time is unusual.
     */
    protected function isUnusualTime(): bool
    {
        // Check if login is outside normal business hours
        $hour = now()->hour;
        return $hour < 6 || $hour > 22;
    }

    /**
     * Check if user is admin.
     */
    public function isAdminLogin(): bool
    {
        return $this->user->hasRole('Administrador');
    }

    /**
     * Get login location info.
     */
    public function getLocationInfo(): array
    {
        $ip = $this->metadata['ip'] ?? null;
        
        if (!$ip) {
            return [];
        }
        
        // In a real implementation, you'd use a GeoIP service
        return [
            'ip' => $ip,
            'country' => 'Unknown',
            'city' => 'Unknown',
            'timezone' => 'Unknown',
        ];
    }

    /**
     * Get device info.
     */
    public function getDeviceInfo(): array
    {
        $userAgent = $this->metadata['user_agent'] ?? null;
        
        if (!$userAgent) {
            return [];
        }
        
        // Parse user agent to extract device info
        return [
            'user_agent' => $userAgent,
            'browser' => $this->extractBrowser($userAgent),
            'os' => $this->extractOS($userAgent),
            'device_type' => $this->extractDeviceType($userAgent),
        ];
    }

    /**
     * Extract browser from user agent.
     */
    protected function extractBrowser(string $userAgent): string
    {
        if (str_contains($userAgent, 'Chrome')) return 'Chrome';
        if (str_contains($userAgent, 'Firefox')) return 'Firefox';
        if (str_contains($userAgent, 'Safari')) return 'Safari';
        if (str_contains($userAgent, 'Edge')) return 'Edge';
        
        return 'Unknown';
    }

    /**
     * Extract OS from user agent.
     */
    protected function extractOS(string $userAgent): string
    {
        if (str_contains($userAgent, 'Windows')) return 'Windows';
        if (str_contains($userAgent, 'Mac')) return 'macOS';
        if (str_contains($userAgent, 'Linux')) return 'Linux';
        if (str_contains($userAgent, 'Android')) return 'Android';
        if (str_contains($userAgent, 'iOS')) return 'iOS';
        
        return 'Unknown';
    }

    /**
     * Extract device type from user agent.
     */
    protected function extractDeviceType(string $userAgent): string
    {
        if (str_contains($userAgent, 'Mobile')) return 'Mobile';
        if (str_contains($userAgent, 'Tablet')) return 'Tablet';
        
        return 'Desktop';
    }
}
