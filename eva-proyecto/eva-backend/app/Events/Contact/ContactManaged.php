<?php

namespace App\Events\Contact;

use App\Events\BaseEvent;
use App\Models\User;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\PrivateChannel;

class ContactManaged extends BaseEvent
{
    /**
     * Contact data.
     */
    public array $contactData;

    /**
     * Management action.
     */
    public string $action;

    /**
     * Previous contact data (for updates).
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
        array $contactData,
        string $action,
        ?array $previousData = null,
        array $changes = [],
        ?User $user = null,
        array $metadata = []
    ) {
        $this->contactData = $contactData;
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
            new Channel('contact.managed'),
            new Channel('contacts.updates'),
        ]);

        if (isset($this->contactData['id'])) {
            $channels[] = new PrivateChannel('contact.' . $this->contactData['id']);
        }

        // Add provider-specific channel if contact is for a provider
        if (isset($this->contactData['provider_id'])) {
            $channels[] = new PrivateChannel('provider.' . $this->contactData['provider_id'] . '.contacts');
        }

        return $channels;
    }

    /**
     * Get event type identifier.
     */
    protected function getEventType(): string
    {
        return 'contact.' . $this->action;
    }

    /**
     * Get event-specific data.
     */
    protected function getEventData(): array
    {
        return [
            'contact' => $this->contactData,
            'action' => $this->action,
            'changes' => $this->changes,
            'previous_data' => $this->previousData,
            'contact_type' => $this->getContactType(),
            'provider_info' => $this->getProviderInfo(),
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
        // High priority for primary contacts or critical providers
        if ($this->isPrimaryContact() || $this->isCriticalProvider()) {
            return 'high';
        }

        // High priority for emergency contacts
        if ($this->isEmergencyContact()) {
            return 'high';
        }

        return 'normal';
    }

    /**
     * Get event category.
     */
    public function getCategory(): string
    {
        return 'contact';
    }

    /**
     * Check if event should send notifications.
     */
    public function shouldNotify(): bool
    {
        // Notify for primary contacts, critical providers, or significant changes
        return $this->isPrimaryContact() || 
               $this->isCriticalProvider() || 
               $this->isEmergencyContact() ||
               in_array($this->action, ['created', 'deleted']) ||
               ($this->action === 'updated' && $this->hasSignificantChanges());
    }

    /**
     * Get notification channels.
     */
    public function getNotificationChannels(): array
    {
        $channels = ['database', 'broadcast'];

        // Add email for critical contacts or important changes
        if ($this->isPrimaryContact() || $this->isCriticalProvider() || $this->isEmergencyContact()) {
            $channels[] = 'mail';
        }

        return $channels;
    }

    /**
     * Get users to notify.
     */
    public function getUsersToNotify(): \Illuminate\Database\Eloquent\Collection
    {
        // Notify administrators and supervisors
        $administrators = User::whereHas('rol', function ($query) {
            $query->whereIn('nombre', ['Administrador', 'Supervisor']);
        })
        ->where('estado', true)
        ->where('active', 'true')
        ->get();

        // For provider contacts, also notify procurement/maintenance staff
        if (isset($this->contactData['provider_id'])) {
            $procurementStaff = User::whereHas('rol', function ($query) {
                $query->whereIn('nombre', ['Encargado de Compras', 'Técnico', 'Encargado de Mantenimiento']);
            })
            ->where('estado', true)
            ->where('active', 'true')
            ->get();

            return $administrators->merge($procurementStaff)->unique('id');
        }

        return $administrators;
    }

    /**
     * Check if contact is primary.
     */
    public function isPrimaryContact(): bool
    {
        return ($this->contactData['is_primary'] ?? false) ||
               ($this->contactData['type'] ?? '') === 'primary';
    }

    /**
     * Check if contact is for critical provider.
     */
    public function isCriticalProvider(): bool
    {
        if (!isset($this->contactData['provider_id'])) {
            return false;
        }

        // Check if provider is marked as critical
        try {
            $provider = \App\Models\ProveedorMantenimiento::find($this->contactData['provider_id']);
            return $provider && ($provider->is_critical ?? false);
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Check if contact is emergency contact.
     */
    public function isEmergencyContact(): bool
    {
        return ($this->contactData['is_emergency'] ?? false) ||
               ($this->contactData['type'] ?? '') === 'emergency';
    }

    /**
     * Check if changes are significant.
     */
    protected function hasSignificantChanges(): bool
    {
        $significantFields = ['name', 'email', 'phone', 'is_primary', 'is_emergency', 'position'];
        
        foreach ($significantFields as $field) {
            if (array_key_exists($field, $this->changes)) {
                return true;
            }
        }
        
        return false;
    }

    /**
     * Get contact type.
     */
    public function getContactType(): string
    {
        if ($this->isPrimaryContact()) {
            return 'primary';
        }
        
        if ($this->isEmergencyContact()) {
            return 'emergency';
        }
        
        return $this->contactData['type'] ?? 'general';
    }

    /**
     * Get provider information.
     */
    public function getProviderInfo(): ?array
    {
        if (!isset($this->contactData['provider_id'])) {
            return null;
        }

        try {
            $provider = \App\Models\ProveedorMantenimiento::find($this->contactData['provider_id']);
            if (!$provider) {
                return null;
            }

            return [
                'id' => $provider->id,
                'name' => $provider->name,
                'type' => $provider->type ?? null,
                'is_critical' => $provider->is_critical ?? false,
                'services_provided' => $this->getProviderServices($provider),
            ];
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Get provider services.
     */
    protected function getProviderServices($provider): array
    {
        // This would get the services provided by the provider
        // Implementation depends on your provider-services relationship
        return [];
    }

    /**
     * Get contact availability.
     */
    public function getContactAvailability(): array
    {
        return [
            'business_hours' => $this->contactData['business_hours'] ?? null,
            'emergency_hours' => $this->contactData['emergency_hours'] ?? null,
            'timezone' => $this->contactData['timezone'] ?? null,
            'preferred_contact_method' => $this->contactData['preferred_contact_method'] ?? 'email',
            'response_time_sla' => $this->contactData['response_time_sla'] ?? null,
        ];
    }

    /**
     * Get contact methods.
     */
    public function getContactMethods(): array
    {
        $methods = [];

        if (!empty($this->contactData['email'])) {
            $methods['email'] = $this->contactData['email'];
        }

        if (!empty($this->contactData['phone'])) {
            $methods['phone'] = $this->contactData['phone'];
        }

        if (!empty($this->contactData['mobile'])) {
            $methods['mobile'] = $this->contactData['mobile'];
        }

        if (!empty($this->contactData['fax'])) {
            $methods['fax'] = $this->contactData['fax'];
        }

        if (!empty($this->contactData['address'])) {
            $methods['address'] = $this->contactData['address'];
        }

        return $methods;
    }

    /**
     * Validate contact information.
     */
    public function validateContactInfo(): array
    {
        $validation = [
            'is_valid' => true,
            'issues' => [],
            'warnings' => [],
        ];

        // Check email format
        if (!empty($this->contactData['email']) && !filter_var($this->contactData['email'], FILTER_VALIDATE_EMAIL)) {
            $validation['is_valid'] = false;
            $validation['issues'][] = 'Invalid email format';
        }

        // Check phone format (basic validation)
        if (!empty($this->contactData['phone']) && !preg_match('/^[\+]?[0-9\s\-\(\)]+$/', $this->contactData['phone'])) {
            $validation['warnings'][] = 'Phone number format may be invalid';
        }

        // Check if primary contact has essential information
        if ($this->isPrimaryContact()) {
            if (empty($this->contactData['email']) && empty($this->contactData['phone'])) {
                $validation['is_valid'] = false;
                $validation['issues'][] = 'Primary contact must have email or phone';
            }
        }

        // Check if emergency contact has phone
        if ($this->isEmergencyContact() && empty($this->contactData['phone'])) {
            $validation['warnings'][] = 'Emergency contact should have phone number';
        }

        return $validation;
    }

    /**
     * Get contact importance level.
     */
    public function getImportanceLevel(): string
    {
        if ($this->isPrimaryContact() && $this->isCriticalProvider()) {
            return 'critical';
        }
        
        if ($this->isPrimaryContact() || $this->isEmergencyContact() || $this->isCriticalProvider()) {
            return 'high';
        }
        
        return 'normal';
    }

    /**
     * Get action description.
     */
    public function getActionDescription(): string
    {
        $contactName = $this->contactData['name'] ?? 'Contacto';
        $contactId = $this->contactData['id'] ?? 'N/A';
        $providerInfo = $this->getProviderInfo();
        $providerName = $providerInfo['name'] ?? 'Proveedor';
        
        $description = match ($this->action) {
            'created' => "Contacto '{$contactName}' (#{$contactId}) creado",
            'updated' => "Contacto '{$contactName}' (#{$contactId}) actualizado",
            'deleted' => "Contacto '{$contactName}' (#{$contactId}) eliminado",
            'activated' => "Contacto '{$contactName}' (#{$contactId}) activado",
            'deactivated' => "Contacto '{$contactName}' (#{$contactId}) desactivado",
            default => "Acción realizada en contacto '{$contactName}' (#{$contactId})",
        };

        if ($providerInfo) {
            $description .= " para proveedor '{$providerName}'";
        }

        return $description;
    }

    /**
     * Get contact summary.
     */
    public function getContactSummary(): array
    {
        return [
            'id' => $this->contactData['id'] ?? null,
            'name' => $this->contactData['name'] ?? null,
            'position' => $this->contactData['position'] ?? null,
            'email' => $this->contactData['email'] ?? null,
            'phone' => $this->contactData['phone'] ?? null,
            'type' => $this->getContactType(),
            'importance_level' => $this->getImportanceLevel(),
            'is_primary' => $this->isPrimaryContact(),
            'is_emergency' => $this->isEmergencyContact(),
            'provider_info' => $this->getProviderInfo(),
            'contact_methods' => $this->getContactMethods(),
            'availability' => $this->getContactAvailability(),
            'validation' => $this->validateContactInfo(),
        ];
    }

    /**
     * Get communication preferences.
     */
    public function getCommunicationPreferences(): array
    {
        return [
            'preferred_method' => $this->contactData['preferred_contact_method'] ?? 'email',
            'language' => $this->contactData['language'] ?? 'es',
            'best_time_to_contact' => $this->contactData['best_time_to_contact'] ?? null,
            'do_not_contact_times' => $this->contactData['do_not_contact_times'] ?? null,
            'communication_notes' => $this->contactData['communication_notes'] ?? null,
        ];
    }

    /**
     * Check if contact information is complete.
     */
    public function isContactInfoComplete(): bool
    {
        $requiredFields = ['name'];
        
        if ($this->isPrimaryContact()) {
            $requiredFields[] = 'email';
        }
        
        if ($this->isEmergencyContact()) {
            $requiredFields[] = 'phone';
        }

        foreach ($requiredFields as $field) {
            if (empty($this->contactData[$field])) {
                return false;
            }
        }

        return true;
    }

    /**
     * Get contact history summary.
     */
    public function getContactHistorySummary(): array
    {
        return [
            'last_contacted' => $this->contactData['last_contacted'] ?? null,
            'contact_frequency' => $this->contactData['contact_frequency'] ?? null,
            'response_rate' => $this->contactData['response_rate'] ?? null,
            'average_response_time' => $this->contactData['average_response_time'] ?? null,
            'total_interactions' => $this->contactData['total_interactions'] ?? 0,
        ];
    }
}
