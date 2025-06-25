<?php

namespace App\Events\File;

use App\Events\BaseEvent;
use App\Models\User;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\PrivateChannel;

class FileUploaded extends BaseEvent
{
    /**
     * File information.
     */
    public array $fileInfo;

    /**
     * Related entity type.
     */
    public string $entityType;

    /**
     * Related entity ID.
     */
    public int $entityId;

    /**
     * Create a new event instance.
     */
    public function __construct(array $fileInfo, string $entityType, int $entityId, ?User $user = null, array $metadata = [])
    {
        $this->fileInfo = $fileInfo;
        $this->entityType = $entityType;
        $this->entityId = $entityId;
        parent::__construct($user, $metadata);
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        return array_merge(parent::broadcastOn(), [
            new Channel('file.uploaded'),
            new PrivateChannel($this->entityType . '.' . $this->entityId),
        ]);
    }

    /**
     * Get event type identifier.
     */
    protected function getEventType(): string
    {
        return 'file.uploaded';
    }

    /**
     * Get event-specific data.
     */
    protected function getEventData(): array
    {
        return [
            'file' => $this->fileInfo,
            'entity' => [
                'type' => $this->entityType,
                'id' => $this->entityId,
            ],
        ];
    }

    /**
     * Get event priority.
     */
    public function getPriority(): string
    {
        // High priority for critical documents
        $criticalTypes = ['manual', 'certificate', 'warranty'];
        
        if (in_array($this->fileInfo['type'] ?? '', $criticalTypes)) {
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
        // Notify for critical file types
        return $this->getPriority() === 'high';
    }

    /**
     * Get notification channels.
     */
    public function getNotificationChannels(): array
    {
        return ['database', 'broadcast'];
    }

    /**
     * Get users to notify.
     */
    public function getUsersToNotify(): \Illuminate\Database\Eloquent\Collection
    {
        // Notify administrators and supervisors for critical files
        if ($this->getPriority() === 'high') {
            return User::whereHas('rol', function ($query) {
                $query->whereIn('nombre', ['Administrador', 'Supervisor']);
            })
            ->where('estado', true)
            ->where('active', 'true')
            ->get();
        }
        
        return collect();
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
}
