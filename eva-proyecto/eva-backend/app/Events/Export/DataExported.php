<?php

namespace App\Events\Export;

use App\Events\BaseEvent;
use App\Models\User;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\PrivateChannel;

class DataExported extends BaseEvent
{
    /**
     * Export type.
     */
    public string $exportType;

    /**
     * Export format.
     */
    public string $format;

    /**
     * Export filters applied.
     */
    public array $filters;

    /**
     * Export results.
     */
    public array $results;

    /**
     * File information.
     */
    public ?array $fileInfo;

    /**
     * Create a new event instance.
     */
    public function __construct(
        string $exportType,
        string $format,
        array $filters = [],
        array $results = [],
        ?array $fileInfo = null,
        ?User $user = null,
        array $metadata = []
    ) {
        $this->exportType = $exportType;
        $this->format = $format;
        $this->filters = $filters;
        $this->results = $results;
        $this->fileInfo = $fileInfo;
        parent::__construct($user, $metadata);
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        return array_merge(parent::broadcastOn(), [
            new Channel('export.completed'),
            new PrivateChannel('user.exports.' . $this->user?->id),
        ]);
    }

    /**
     * Get event type identifier.
     */
    protected function getEventType(): string
    {
        return 'data.exported';
    }

    /**
     * Get event-specific data.
     */
    protected function getEventData(): array
    {
        return [
            'export_type' => $this->exportType,
            'format' => $this->format,
            'filters' => $this->filters,
            'results' => [
                'record_count' => $this->results['record_count'] ?? 0,
                'file_size_mb' => $this->getFileSizeMB(),
                'processing_time_seconds' => $this->results['processing_time'] ?? null,
                'success' => $this->results['success'] ?? false,
                'error_message' => $this->results['error_message'] ?? null,
            ],
            'file_info' => $this->fileInfo,
            'exported_by' => [
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
        // High priority for large exports or sensitive data
        if ($this->isLargeExport() || $this->containsSensitiveData()) {
            return 'high';
        }

        // High priority for failed exports
        if (!($this->results['success'] ?? false)) {
            return 'high';
        }

        return 'normal';
    }

    /**
     * Get event category.
     */
    public function getCategory(): string
    {
        return 'export';
    }

    /**
     * Check if event should send notifications.
     */
    public function shouldNotify(): bool
    {
        // Notify for large exports, sensitive data, or failures
        return $this->isLargeExport() || 
               $this->containsSensitiveData() || 
               !($this->results['success'] ?? false);
    }

    /**
     * Get notification channels.
     */
    public function getNotificationChannels(): array
    {
        $channels = ['database', 'broadcast'];

        // Add email for sensitive data or failures
        if ($this->containsSensitiveData() || !($this->results['success'] ?? false)) {
            $channels[] = 'mail';
        }

        return $channels;
    }

    /**
     * Get users to notify.
     */
    public function getUsersToNotify(): \Illuminate\Database\Eloquent\Collection
    {
        // For sensitive data exports, notify administrators
        if ($this->containsSensitiveData()) {
            return User::whereHas('rol', function ($query) {
                $query->whereIn('nombre', ['Administrador', 'Supervisor']);
            })
            ->where('estado', true)
            ->where('active', 'true')
            ->get();
        }

        // For failures, notify the user who performed the export
        if (!($this->results['success'] ?? false) && $this->user) {
            return collect([$this->user]);
        }

        return collect();
    }

    /**
     * Check if export is large.
     */
    public function isLargeExport(): bool
    {
        $recordCount = $this->results['record_count'] ?? 0;
        $fileSizeMB = $this->getFileSizeMB();
        
        return $recordCount > 10000 || $fileSizeMB > 50;
    }

    /**
     * Check if export contains sensitive data.
     */
    public function containsSensitiveData(): bool
    {
        $sensitiveTypes = [
            'users',
            'user_data',
            'personal_information',
            'financial_data',
            'medical_data',
            'audit_logs',
            'security_logs',
        ];

        return in_array($this->exportType, $sensitiveTypes);
    }

    /**
     * Get file size in MB.
     */
    public function getFileSizeMB(): float
    {
        if (!$this->fileInfo || !isset($this->fileInfo['size'])) {
            return 0;
        }

        return round($this->fileInfo['size'] / 1024 / 1024, 2);
    }

    /**
     * Check if export was successful.
     */
    public function wasSuccessful(): bool
    {
        return $this->results['success'] ?? false;
    }

    /**
     * Get processing time in seconds.
     */
    public function getProcessingTime(): ?float
    {
        return $this->results['processing_time'] ?? null;
    }

    /**
     * Get error message if export failed.
     */
    public function getErrorMessage(): ?string
    {
        return $this->results['error_message'] ?? null;
    }

    /**
     * Get record count.
     */
    public function getRecordCount(): int
    {
        return $this->results['record_count'] ?? 0;
    }

    /**
     * Get export description.
     */
    public function getExportDescription(): string
    {
        $recordCount = $this->getRecordCount();
        $format = strtoupper($this->format);
        
        return "Exportación de {$recordCount} registros de {$this->exportType} en formato {$format}";
    }

    /**
     * Get applied filters description.
     */
    public function getFiltersDescription(): string
    {
        if (empty($this->filters)) {
            return 'Sin filtros aplicados';
        }

        $descriptions = [];
        
        foreach ($this->filters as $key => $value) {
            if (is_array($value)) {
                $descriptions[] = "{$key}: " . implode(', ', $value);
            } else {
                $descriptions[] = "{$key}: {$value}";
            }
        }

        return implode('; ', $descriptions);
    }

    /**
     * Check if export has date range filter.
     */
    public function hasDateRangeFilter(): bool
    {
        return isset($this->filters['fecha_desde']) || 
               isset($this->filters['fecha_hasta']) ||
               isset($this->filters['date_from']) ||
               isset($this->filters['date_to']);
    }

    /**
     * Get date range filter.
     */
    public function getDateRangeFilter(): ?array
    {
        if (!$this->hasDateRangeFilter()) {
            return null;
        }

        return [
            'from' => $this->filters['fecha_desde'] ?? $this->filters['date_from'] ?? null,
            'to' => $this->filters['fecha_hasta'] ?? $this->filters['date_to'] ?? null,
        ];
    }

    /**
     * Check if export has service filter.
     */
    public function hasServiceFilter(): bool
    {
        return isset($this->filters['servicio_id']) || isset($this->filters['service_id']);
    }

    /**
     * Get service filter.
     */
    public function getServiceFilter(): ?int
    {
        return $this->filters['servicio_id'] ?? $this->filters['service_id'] ?? null;
    }

    /**
     * Get export statistics.
     */
    public function getExportStatistics(): array
    {
        return [
            'type' => $this->exportType,
            'format' => $this->format,
            'record_count' => $this->getRecordCount(),
            'file_size_mb' => $this->getFileSizeMB(),
            'processing_time' => $this->getProcessingTime(),
            'success' => $this->wasSuccessful(),
            'has_filters' => !empty($this->filters),
            'filter_count' => count($this->filters),
            'is_large' => $this->isLargeExport(),
            'is_sensitive' => $this->containsSensitiveData(),
        ];
    }

    /**
     * Get compliance information.
     */
    public function getComplianceInfo(): array
    {
        return [
            'exported_by' => $this->user?->id,
            'export_timestamp' => $this->timestamp,
            'data_type' => $this->exportType,
            'record_count' => $this->getRecordCount(),
            'contains_pii' => $this->containsPersonallyIdentifiableInfo(),
            'retention_period' => $this->getDataRetentionPeriod(),
            'access_level' => $this->getDataAccessLevel(),
        ];
    }

    /**
     * Check if export contains personally identifiable information.
     */
    protected function containsPersonallyIdentifiableInfo(): bool
    {
        $piiTypes = [
            'users',
            'user_data',
            'personal_information',
            'contact_information',
            'medical_data',
        ];

        return in_array($this->exportType, $piiTypes);
    }

    /**
     * Get data retention period in days.
     */
    protected function getDataRetentionPeriod(): int
    {
        return match ($this->exportType) {
            'audit_logs', 'security_logs' => 2555, // 7 years
            'financial_data' => 1825, // 5 years
            'medical_data' => 3650, // 10 years
            'users', 'user_data' => 1095, // 3 years
            default => 365, // 1 year
        };
    }

    /**
     * Get data access level.
     */
    protected function getDataAccessLevel(): string
    {
        if ($this->containsSensitiveData()) {
            return 'restricted';
        }

        if ($this->containsPersonallyIdentifiableInfo()) {
            return 'confidential';
        }

        return 'internal';
    }
}
