<?php

namespace App\Traits;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

trait Auditable
{
    /**
     * Boot the auditable trait for a model.
     */
    public static function bootAuditable(): void
    {
        static::created(function ($model) {
            $model->auditEvent('created', null, $model->getAttributes());
        });

        static::updated(function ($model) {
            $model->auditEvent('updated', $model->getOriginal(), $model->getChanges());
        });

        static::deleted(function ($model) {
            $model->auditEvent('deleted', $model->getAttributes(), null);
        });
    }

    /**
     * Log audit event.
     */
    protected function auditEvent(string $event, ?array $oldValues, ?array $newValues): void
    {
        $user = Auth::user();
        
        $auditData = [
            'event' => $event,
            'model' => static::class,
            'model_id' => $this->getKey(),
            'user_id' => $user?->id,
            'user_email' => $user?->email ?? 'system',
            'ip_address' => request()?->ip(),
            'user_agent' => request()?->userAgent(),
            'timestamp' => now()->toISOString(),
        ];

        if ($oldValues) {
            $auditData['old_values'] = $this->sanitizeAuditData($oldValues);
        }

        if ($newValues) {
            $auditData['new_values'] = $this->sanitizeAuditData($newValues);
        }

        // Log changes
        if ($event === 'updated' && $newValues) {
            $auditData['changed_fields'] = array_keys($newValues);
        }

        Log::channel('audit')->info("Model {$event}", $auditData);
    }

    /**
     * Sanitize audit data to remove sensitive information.
     */
    protected function sanitizeAuditData(array $data): array
    {
        $sensitiveFields = [
            'password',
            'password_hash',
            'remember_token',
            'api_token',
            'secret',
            'private_key',
        ];

        foreach ($sensitiveFields as $field) {
            if (isset($data[$field])) {
                $data[$field] = '[REDACTED]';
            }
        }

        return $data;
    }

    /**
     * Get audit trail for this model.
     */
    public function getAuditTrail(): array
    {
        // This would typically query an audit table
        // For now, return empty array
        return [];
    }
}
