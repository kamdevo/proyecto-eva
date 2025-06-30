<?php

namespace App\Events\File;

use App\Events\BaseEvent;
use App\Models\User;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\PrivateChannel;

class FileProcessed extends BaseEvent
{
    /**
     * File information.
     */
    public array $fileInfo;

    /**
     * Processing action.
     */
    public string $action;

    /**
     * Related entity type.
     */
    public ?string $entityType;

    /**
     * Related entity ID.
     */
    public ?int $entityId;

    /**
     * Processing result.
     */
    public array $result;

    /**
     * Create a new event instance.
     */
    public function __construct(
        array $fileInfo,
        string $action,
        array $result = [],
        ?string $entityType = null,
        ?int $entityId = null,
        ?User $user = null,
        array $metadata = []
    ) {
        $this->fileInfo = $fileInfo;
        $this->action = $action;
        $this->result = $result;
        $this->entityType = $entityType;
        $this->entityId = $entityId;
        parent::__construct($user, $metadata);
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        $channels = array_merge(parent::broadcastOn(), [
            new Channel('file.processed'),
            new PrivateChannel('user.files.' . $this->user?->id),
        ]);

        if ($this->entityType && $this->entityId) {
            $channels[] = new PrivateChannel($this->entityType . '.' . $this->entityId . '.files');
        }

        return $channels;
    }

    /**
     * Get event type identifier.
     */
    protected function getEventType(): string
    {
        return 'file.processed';
    }

    /**
     * Get event-specific data.
     */
    protected function getEventData(): array
    {
        return [
            'file' => $this->fileInfo,
            'action' => $this->action,
            'result' => $this->result,
            'entity' => [
                'type' => $this->entityType,
                'id' => $this->entityId,
            ],
            'processing_time' => $this->result['processing_time'] ?? null,
            'file_size_mb' => $this->getFileSizeMB(),
        ];
    }

    /**
     * Get event priority.
     */
    public function getPriority(): string
    {
        // High priority for critical file types or large files
        if ($this->isCriticalFileType() || $this->isLargeFile()) {
            return 'high';
        }

        // High priority for failed processing
        if ($this->action === 'processing_failed') {
            return 'high';
        }

        return 'normal';
    }

    /**
     * Get event category.
     */
    public function getCategory(): string
    {
        return 'file';
    }

    /**
     * Check if event should send notifications.
     */
    public function shouldNotify(): bool
    {
        // Notify for critical files, failures, or large files
        return $this->isCriticalFileType() || 
               $this->action === 'processing_failed' || 
               $this->isLargeFile();
    }

    /**
     * Get notification channels.
     */
    public function getNotificationChannels(): array
    {
        $channels = ['database', 'broadcast'];

        // Add email for failures or critical files
        if ($this->action === 'processing_failed' || $this->isCriticalFileType()) {
            $channels[] = 'mail';
        }

        return $channels;
    }

    /**
     * Get users to notify.
     */
    public function getUsersToNotify(): \Illuminate\Database\Eloquent\Collection
    {
        // For failures, notify administrators
        if ($this->action === 'processing_failed') {
            return User::whereHas('rol', function ($query) {
                $query->whereIn('nombre', ['Administrador', 'Supervisor']);
            })
            ->where('estado', true)
            ->where('active', 'true')
            ->get();
        }

        // For critical files, notify relevant users
        if ($this->isCriticalFileType() && $this->entityType === 'equipment') {
            // Get users from the equipment's service
            $equipment = \App\Models\Equipo::find($this->entityId);
            if ($equipment) {
                return User::where('servicio_id', $equipment->servicio_id)
                          ->where('estado', true)
                          ->where('active', 'true')
                          ->get();
            }
        }

        return collect();
    }

    /**
     * Check if file type is critical.
     */
    public function isCriticalFileType(): bool
    {
        $criticalTypes = ['manual', 'certificate', 'warranty', 'calibration_report', 'safety_document'];
        return in_array($this->fileInfo['type'] ?? '', $criticalTypes);
    }

    /**
     * Check if file is large.
     */
    public function isLargeFile(): bool
    {
        return $this->getFileSizeMB() > 50; // Files larger than 50MB
    }

    /**
     * Get file size in MB.
     */
    public function getFileSizeMB(): float
    {
        return round(($this->fileInfo['size'] ?? 0) / 1024 / 1024, 2);
    }

    /**
     * Get file extension.
     */
    public function getFileExtension(): string
    {
        return pathinfo($this->fileInfo['name'] ?? '', PATHINFO_EXTENSION);
    }

    /**
     * Check if processing was successful.
     */
    public function wasSuccessful(): bool
    {
        return $this->action !== 'processing_failed' && 
               ($this->result['success'] ?? false);
    }

    /**
     * Get processing duration.
     */
    public function getProcessingDuration(): ?float
    {
        return $this->result['processing_time'] ?? null;
    }

    /**
     * Check if file is an image.
     */
    public function isImage(): bool
    {
        $imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
        return in_array(strtolower($this->getFileExtension()), $imageExtensions);
    }

    /**
     * Check if file is a document.
     */
    public function isDocument(): bool
    {
        $documentExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'];
        return in_array(strtolower($this->getFileExtension()), $documentExtensions);
    }

    /**
     * Get file validation results.
     */
    public function getValidationResults(): array
    {
        return $this->result['validation'] ?? [];
    }

    /**
     * Check if file passed validation.
     */
    public function passedValidation(): bool
    {
        $validation = $this->getValidationResults();
        return empty($validation['errors']) && ($validation['passed'] ?? false);
    }

    /**
     * Get virus scan results.
     */
    public function getVirusScanResults(): array
    {
        return $this->result['virus_scan'] ?? [];
    }

    /**
     * Check if file is clean (no viruses).
     */
    public function isClean(): bool
    {
        $virusScan = $this->getVirusScanResults();
        return $virusScan['clean'] ?? true;
    }

    /**
     * Get file metadata extraction results.
     */
    public function getMetadataResults(): array
    {
        return $this->result['metadata'] ?? [];
    }

    /**
     * Get action description.
     */
    public function getActionDescription(): string
    {
        return match ($this->action) {
            'uploaded' => 'Archivo subido',
            'processed' => 'Archivo procesado',
            'validated' => 'Archivo validado',
            'virus_scanned' => 'Archivo escaneado por virus',
            'metadata_extracted' => 'Metadatos extraídos',
            'thumbnail_generated' => 'Miniatura generada',
            'compressed' => 'Archivo comprimido',
            'converted' => 'Archivo convertido',
            'processing_failed' => 'Procesamiento falló',
            'deleted' => 'Archivo eliminado',
            'moved' => 'Archivo movido',
            'copied' => 'Archivo copiado',
            'renamed' => 'Archivo renombrado',
            default => 'Acción de archivo realizada',
        };
    }
}
