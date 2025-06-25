<?php

namespace App\Listeners;

use App\Events\File\FileUploaded;
use App\Events\File\FileProcessed;
use App\Notifications\FileNotification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Notification;

class FileListener implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * The number of times the job may be attempted.
     */
    public int $tries = 3;

    /**
     * Handle file uploaded event.
     */
    public function handleFileUploaded(FileUploaded $event): void
    {
        try {
            // Log the file upload
            $this->logFileAction($event, 'uploaded');

            // Update file metrics
            $this->updateFileMetrics($event);

            // Validate file
            $this->validateFile($event);

            // Scan for viruses if enabled
            if (config('app.virus_scan_enabled', false)) {
                $this->scheduleVirusScan($event);
            }

            // Extract metadata
            $this->extractFileMetadata($event);

            // Send notifications if needed
            if ($event->shouldNotify()) {
                $this->sendNotifications($event);
            }

            // Create file record
            $this->createFileRecord($event);

            // Handle file categorization
            $this->categorizeFile($event);

        } catch (\Exception $e) {
            Log::error('Failed to handle file uploaded event', [
                'file_path' => $event->filePath,
                'user_id' => $event->user?->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }

    /**
     * Handle file processed event.
     */
    public function handleFileProcessed(FileProcessed $event): void
    {
        try {
            // Log the file processing
            $this->logFileAction($event, 'processed');

            // Update processing metrics
            $this->updateProcessingMetrics($event);

            // Handle processing results
            $this->handleProcessingResults($event);

            // Send notifications
            if ($event->shouldNotify()) {
                $this->sendNotifications($event);
            }

            // Update file status
            $this->updateFileStatus($event);

            // Handle post-processing actions
            $this->handlePostProcessing($event);

        } catch (\Exception $e) {
            Log::error('Failed to handle file processed event', [
                'file_path' => $event->filePath,
                'processing_type' => $event->processingType,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }

    /**
     * Log file action.
     */
    protected function logFileAction($event, string $action): void
    {
        $logData = [
            'action' => $action,
            'file_path' => $event->filePath,
            'file_name' => $event->fileName ?? basename($event->filePath),
            'file_size' => $event->fileSize ?? 0,
            'mime_type' => $event->mimeType ?? null,
            'user_id' => $event->user?->id,
            'timestamp' => $event->timestamp,
        ];

        if ($event instanceof FileProcessed) {
            $logData['processing_type'] = $event->processingType;
            $logData['processing_success'] = $event->wasSuccessful();
            $logData['processing_time'] = $event->getProcessingTime();
        }

        Log::channel('audit')->info("File {$action}", $logData);

        // Store in audit trail
        $this->storeInAuditTrail($event, $logData, $action);
    }

    /**
     * Store in audit trail.
     */
    protected function storeInAuditTrail($event, array $logData, string $action): void
    {
        try {
            DB::table('audit_trail')->insert([
                'auditable_type' => 'file',
                'auditable_id' => 0,
                'event_type' => "file.{$action}",
                'user_id' => $event->user?->id,
                'old_values' => null,
                'new_values' => json_encode($event->fileInfo ?? []),
                'ip_address' => $event->metadata['ip'] ?? null,
                'user_agent' => $event->metadata['user_agent'] ?? null,
                'metadata' => json_encode($logData),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to store file action in audit trail', [
                'action' => $action,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Update file metrics.
     */
    protected function updateFileMetrics($event): void
    {
        $today = now()->format('Y-m-d');
        $hour = now()->hour;

        // Update daily upload count
        Cache::increment("files:uploads:daily:{$today}");
        
        // Update hourly upload count
        Cache::increment("files:uploads:hourly:{$today}:{$hour}");
        
        // Update file type metrics
        $extension = pathinfo($event->filePath, PATHINFO_EXTENSION);
        Cache::increment("files:type:{$extension}:daily:{$today}");
        
        // Update user-specific metrics
        if ($event->user) {
            Cache::increment("files:user:{$event->user->id}:daily:{$today}");
        }

        // Update size metrics
        $sizeCategory = $this->getFileSizeCategory($event->fileSize ?? 0);
        Cache::increment("files:size:{$sizeCategory}:daily:{$today}");

        // Store metrics in database
        $this->storeFileMetricsInDatabase($event, $today, $hour);
    }

    /**
     * Update processing metrics.
     */
    protected function updateProcessingMetrics(FileProcessed $event): void
    {
        $today = now()->format('Y-m-d');

        // Update processing count
        Cache::increment("files:processed:daily:{$today}");
        
        // Update processing type metrics
        Cache::increment("files:processing:{$event->processingType}:daily:{$today}");
        
        // Update success/failure metrics
        $status = $event->wasSuccessful() ? 'success' : 'failure';
        Cache::increment("files:processing:{$status}:daily:{$today}");

        // Store processing metrics
        $this->storeProcessingMetricsInDatabase($event, $today);
    }

    /**
     * Store file metrics in database.
     */
    protected function storeFileMetricsInDatabase($event, string $date, int $hour): void
    {
        try {
            DB::table('event_metrics')->updateOrInsert(
                [
                    'metric_type' => 'file_uploads',
                    'metric_category' => 'daily',
                    'metric_key' => 'total',
                    'metric_date' => $date,
                    'metric_hour' => null,
                ],
                [
                    'metric_value' => DB::raw('metric_value + 1'),
                    'metadata' => json_encode([
                        'user_id' => $event->user?->id,
                        'file_size' => $event->fileSize ?? 0,
                        'mime_type' => $event->mimeType,
                    ]),
                    'updated_at' => now(),
                ]
            );

            // Store file size metrics
            DB::table('event_metrics')->updateOrInsert(
                [
                    'metric_type' => 'file_storage',
                    'metric_category' => 'daily',
                    'metric_key' => 'total_size',
                    'metric_date' => $date,
                    'metric_hour' => null,
                ],
                [
                    'metric_value' => DB::raw('metric_value + ' . ($event->fileSize ?? 0)),
                    'metadata' => json_encode([
                        'user_id' => $event->user?->id,
                    ]),
                    'updated_at' => now(),
                ]
            );
        } catch (\Exception $e) {
            Log::error('Failed to store file metrics', [
                'file_path' => $event->filePath,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Store processing metrics in database.
     */
    protected function storeProcessingMetricsInDatabase(FileProcessed $event, string $date): void
    {
        try {
            DB::table('event_metrics')->updateOrInsert(
                [
                    'metric_type' => 'file_processing',
                    'metric_category' => 'daily',
                    'metric_key' => $event->processingType,
                    'metric_date' => $date,
                    'metric_hour' => null,
                ],
                [
                    'metric_value' => DB::raw('metric_value + 1'),
                    'metadata' => json_encode([
                        'success' => $event->wasSuccessful(),
                        'processing_time' => $event->getProcessingTime(),
                        'user_id' => $event->user?->id,
                    ]),
                    'updated_at' => now(),
                ]
            );
        } catch (\Exception $e) {
            Log::error('Failed to store processing metrics', [
                'processing_type' => $event->processingType,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Validate file.
     */
    protected function validateFile(FileUploaded $event): void
    {
        $validationResults = [
            'is_valid' => true,
            'issues' => [],
            'warnings' => [],
        ];

        // Check file size
        $maxSize = config('filesystems.max_file_size', 10485760); // 10MB default
        if (($event->fileSize ?? 0) > $maxSize) {
            $validationResults['is_valid'] = false;
            $validationResults['issues'][] = 'File size exceeds maximum allowed';
        }

        // Check file type
        $allowedTypes = config('filesystems.allowed_types', ['pdf', 'doc', 'docx', 'jpg', 'png']);
        $extension = strtolower(pathinfo($event->filePath, PATHINFO_EXTENSION));
        if (!in_array($extension, $allowedTypes)) {
            $validationResults['warnings'][] = 'File type may not be supported';
        }

        // Store validation results
        Cache::put("file:{$event->filePath}:validation", $validationResults, 3600);

        if (!$validationResults['is_valid']) {
            $this->createFileValidationAlert($event, $validationResults);
        }
    }

    /**
     * Schedule virus scan.
     */
    protected function scheduleVirusScan(FileUploaded $event): void
    {
        try {
            DB::table('scheduled_virus_scans')->insert([
                'file_path' => $event->filePath,
                'file_size' => $event->fileSize ?? 0,
                'uploaded_by' => $event->user?->id,
                'scan_status' => 'pending',
                'created_at' => now(),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to schedule virus scan', [
                'file_path' => $event->filePath,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Extract file metadata.
     */
    protected function extractFileMetadata(FileUploaded $event): void
    {
        try {
            $metadata = [
                'file_name' => $event->fileName ?? basename($event->filePath),
                'file_size' => $event->fileSize ?? 0,
                'mime_type' => $event->mimeType,
                'extension' => pathinfo($event->filePath, PATHINFO_EXTENSION),
                'uploaded_at' => now(),
                'uploaded_by' => $event->user?->id,
            ];

            // Try to extract additional metadata based on file type
            if (Storage::exists($event->filePath)) {
                $metadata['last_modified'] = Storage::lastModified($event->filePath);
                
                // For images, extract dimensions
                if (in_array($metadata['extension'], ['jpg', 'jpeg', 'png', 'gif'])) {
                    $metadata = array_merge($metadata, $this->extractImageMetadata($event->filePath));
                }
            }

            Cache::put("file:{$event->filePath}:metadata", $metadata, 86400);

        } catch (\Exception $e) {
            Log::error('Failed to extract file metadata', [
                'file_path' => $event->filePath,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Extract image metadata.
     */
    protected function extractImageMetadata(string $filePath): array
    {
        try {
            $fullPath = Storage::path($filePath);
            if (file_exists($fullPath)) {
                $imageInfo = getimagesize($fullPath);
                if ($imageInfo) {
                    return [
                        'width' => $imageInfo[0],
                        'height' => $imageInfo[1],
                        'image_type' => $imageInfo[2],
                    ];
                }
            }
        } catch (\Exception $e) {
            Log::warning('Failed to extract image metadata', [
                'file_path' => $filePath,
                'error' => $e->getMessage(),
            ]);
        }

        return [];
    }

    /**
     * Send notifications.
     */
    protected function sendNotifications($event): void
    {
        $usersToNotify = $event->getUsersToNotify();
        
        if ($usersToNotify->isEmpty()) {
            return;
        }

        try {
            Notification::send($usersToNotify, new FileNotification($event));
            
            Log::info('File notifications sent', [
                'file_path' => $event->filePath,
                'recipients_count' => $usersToNotify->count(),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send file notifications', [
                'file_path' => $event->filePath,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Create file record.
     */
    protected function createFileRecord(FileUploaded $event): void
    {
        try {
            $metadata = Cache::get("file:{$event->filePath}:metadata", []);
            
            DB::table('file_records')->insert([
                'file_path' => $event->filePath,
                'file_name' => $event->fileName ?? basename($event->filePath),
                'file_size' => $event->fileSize ?? 0,
                'mime_type' => $event->mimeType,
                'uploaded_by' => $event->user?->id,
                'metadata' => json_encode($metadata),
                'status' => 'uploaded',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to create file record', [
                'file_path' => $event->filePath,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Categorize file.
     */
    protected function categorizeFile(FileUploaded $event): void
    {
        $extension = strtolower(pathinfo($event->filePath, PATHINFO_EXTENSION));
        
        $category = match ($extension) {
            'pdf' => 'document',
            'doc', 'docx' => 'document',
            'xls', 'xlsx' => 'spreadsheet',
            'jpg', 'jpeg', 'png', 'gif' => 'image',
            'mp4', 'avi', 'mov' => 'video',
            'mp3', 'wav' => 'audio',
            default => 'other',
        };

        Cache::put("file:{$event->filePath}:category", $category, 86400);
    }

    /**
     * Handle processing results.
     */
    protected function handleProcessingResults(FileProcessed $event): void
    {
        if ($event->wasSuccessful()) {
            $this->handleSuccessfulProcessing($event);
        } else {
            $this->handleFailedProcessing($event);
        }
    }

    /**
     * Handle successful processing.
     */
    protected function handleSuccessfulProcessing(FileProcessed $event): void
    {
        // Update file status
        $this->updateFileProcessingStatus($event->filePath, 'processed');

        // Store processing results
        if ($event->results) {
            Cache::put("file:{$event->filePath}:processing_results", $event->results, 86400);
        }
    }

    /**
     * Handle failed processing.
     */
    protected function handleFailedProcessing(FileProcessed $event): void
    {
        // Update file status
        $this->updateFileProcessingStatus($event->filePath, 'processing_failed');

        // Create failure alert
        $this->createProcessingFailureAlert($event);
    }

    /**
     * Update file status.
     */
    protected function updateFileStatus(FileProcessed $event): void
    {
        $status = $event->wasSuccessful() ? 'processed' : 'processing_failed';
        $this->updateFileProcessingStatus($event->filePath, $status);
    }

    /**
     * Update file processing status.
     */
    protected function updateFileProcessingStatus(string $filePath, string $status): void
    {
        try {
            DB::table('file_records')
              ->where('file_path', $filePath)
              ->update([
                  'status' => $status,
                  'updated_at' => now(),
              ]);
        } catch (\Exception $e) {
            Log::error('Failed to update file processing status', [
                'file_path' => $filePath,
                'status' => $status,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Handle post-processing actions.
     */
    protected function handlePostProcessing(FileProcessed $event): void
    {
        // Cleanup temporary files if needed
        if ($event->processingType === 'conversion' && $event->wasSuccessful()) {
            $this->scheduleTemporaryFileCleanup($event);
        }

        // Update search index if applicable
        if (in_array($event->processingType, ['text_extraction', 'ocr'])) {
            $this->updateSearchIndex($event);
        }
    }

    /**
     * Get file size category.
     */
    protected function getFileSizeCategory(int $size): string
    {
        return match (true) {
            $size < 1024 => 'tiny',
            $size < 1048576 => 'small',
            $size < 10485760 => 'medium',
            $size < 104857600 => 'large',
            default => 'huge',
        };
    }

    /**
     * Create file validation alert.
     */
    protected function createFileValidationAlert(FileUploaded $event, array $validationResults): void
    {
        try {
            DB::table('system_alerts')->insert([
                'type' => 'file_validation_failed',
                'title' => 'Validación de Archivo Fallida',
                'message' => "Archivo no pasó validación: " . implode(', ', $validationResults['issues']),
                'severity' => 'medium',
                'status' => 'active',
                'created_by' => $event->user?->id,
                'data' => json_encode([
                    'file_path' => $event->filePath,
                    'validation_results' => $validationResults,
                ]),
                'expires_at' => now()->addDays(7),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to create file validation alert', [
                'file_path' => $event->filePath,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Create processing failure alert.
     */
    protected function createProcessingFailureAlert(FileProcessed $event): void
    {
        try {
            DB::table('system_alerts')->insert([
                'type' => 'file_processing_failed',
                'title' => 'Procesamiento de Archivo Fallido',
                'message' => "Falló el procesamiento del archivo: {$event->processingType}",
                'severity' => 'medium',
                'status' => 'active',
                'created_by' => $event->user?->id,
                'data' => json_encode([
                    'file_path' => $event->filePath,
                    'processing_type' => $event->processingType,
                    'error_message' => $event->getErrorMessage(),
                ]),
                'expires_at' => now()->addDays(3),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to create processing failure alert', [
                'file_path' => $event->filePath,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Schedule temporary file cleanup.
     */
    protected function scheduleTemporaryFileCleanup(FileProcessed $event): void
    {
        // Implementation for scheduling cleanup of temporary files
        Log::info('Temporary file cleanup scheduled', [
            'file_path' => $event->filePath,
            'processing_type' => $event->processingType,
        ]);
    }

    /**
     * Update search index.
     */
    protected function updateSearchIndex(FileProcessed $event): void
    {
        // Implementation for updating search index with extracted text
        Log::info('Search index update scheduled', [
            'file_path' => $event->filePath,
            'processing_type' => $event->processingType,
        ]);
    }

    /**
     * Handle job failure.
     */
    public function failed($event, \Throwable $exception): void
    {
        Log::error('File listener failed', [
            'file_path' => $event->filePath ?? 'unknown',
            'error' => $exception->getMessage(),
            'trace' => $exception->getTraceAsString(),
        ]);
    }
}
