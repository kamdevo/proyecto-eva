<?php

namespace App\ConexionesVista;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;

/**
 * Formateador MEJORADO AL 500% de respuestas para APIs que se conectan con React
 * Maneja TODOS los tipos de respuestas posibles para vistas React
 */
class ResponseFormatter
{
    /**
     * Formatear respuesta de éxito con metadatos completos
     */
    public static function success($data = null, string $message = 'Operation successful', int $code = 200, array $metadata = []): JsonResponse
    {
        $response = [
            'success' => true,
            'status' => 'success',
            'message' => $message,
            'data' => $data,
            'timestamp' => now()->toISOString(),
            'metadata' => array_merge(self::getDefaultMetadata(), $metadata)
        ];

        self::logResponse('success', $message, $code);
        return response()->json($response, $code);
    }

    /**
     * Formatear respuesta de error con detalles completos
     */
    public static function error(string $message = 'An error occurred', int $code = 400, $errors = null, array $metadata = []): JsonResponse
    {
        $response = [
            'success' => false,
            'status' => 'error',
            'message' => $message,
            'timestamp' => now()->toISOString(),
            'metadata' => array_merge(self::getDefaultMetadata(), $metadata)
        ];

        if ($errors !== null) {
            $response['errors'] = $errors;
        }

        self::logResponse('error', $message, $code, $errors);
        return response()->json($response, $code);
    }

    /**
     * Formatear respuesta de paginación completa
     */
    public static function paginated($paginator, string $message = 'Data retrieved successfully', array $metadata = []): JsonResponse
    {
        $paginationData = ReactViewHelper::formatPagination($paginator);

        $response = [
            'success' => true,
            'status' => 'success',
            'message' => $message,
            'data' => $paginationData['data'],
            'pagination' => $paginationData['pagination'],
            'meta' => $paginationData['meta'],
            'timestamp' => now()->toISOString(),
            'metadata' => array_merge(self::getDefaultMetadata(), $metadata)
        ];

        return response()->json($response, 200);
    }

    /**
     * Formatear respuesta para operaciones de archivos
     */
    public static function fileOperation($fileData, string $operation = 'upload', string $message = 'File operation completed', array $metadata = []): JsonResponse
    {
        $response = [
            'success' => true,
            'status' => 'success',
            'message' => $message,
            'data' => [
                'file' => ReactViewHelper::formatFileData($fileData),
                'operation' => $operation,
                'operation_time' => now()->toISOString()
            ],
            'timestamp' => now()->toISOString(),
            'metadata' => array_merge(self::getDefaultMetadata(), [
                'operation_type' => 'file_operation',
                'file_operation' => $operation
            ], $metadata)
        ];

        return response()->json($response, 200);
    }

    /**
     * Formatear respuesta para operaciones en lote
     */
    public static function batchOperation(array $results, string $message = 'Batch operation completed', array $metadata = []): JsonResponse
    {
        $batchData = ReactViewHelper::formatBatchResponse($results);

        $response = [
            'success' => $batchData['summary']['failed'] === 0,
            'status' => $batchData['summary']['failed'] === 0 ? 'success' : 'partial_success',
            'message' => $message,
            'data' => $batchData,
            'timestamp' => now()->toISOString(),
            'metadata' => array_merge(self::getDefaultMetadata(), [
                'operation_type' => 'batch_operation',
                'batch_size' => $batchData['summary']['total']
            ], $metadata)
        ];

        return response()->json($response, 200);
    }

    /**
     * Formatear respuesta para vistas React específicas
     */
    public static function reactView($data, string $viewType, string $message = 'View data loaded', array $config = []): JsonResponse
    {
        $formattedData = self::formatDataForViewType($data, $viewType, $config);

        $response = [
            'success' => true,
            'status' => 'success',
            'message' => $message,
            'data' => $formattedData,
            'view_type' => $viewType,
            'timestamp' => now()->toISOString(),
            'metadata' => array_merge(self::getDefaultMetadata(), [
                'view_type' => $viewType,
                'component_config' => $config
            ])
        ];

        return response()->json($response, 200);
    }

    /**
     * Formatear respuesta para operaciones asíncronas
     */
    public static function asyncOperation(string $jobId, string $status = 'queued', $estimatedTime = null, array $metadata = []): JsonResponse
    {
        $response = [
            'success' => true,
            'status' => 'async_started',
            'message' => 'Async operation initiated',
            'data' => [
                'job_id' => $jobId,
                'status' => $status,
                'estimated_completion' => $estimatedTime,
                'polling_url' => route('api.job.status', $jobId),
                'polling_interval' => 2000, // 2 segundos
                'max_polling_time' => 300000 // 5 minutos
            ],
            'timestamp' => now()->toISOString(),
            'metadata' => array_merge(self::getDefaultMetadata(), [
                'operation_type' => 'async_operation',
                'job_id' => $jobId
            ], $metadata)
        ];

        return response()->json($response, 202);
    }

    /**
     * Formatear respuesta para notificaciones
     */
    public static function notification($notification, string $type = 'info', bool $persistent = false, array $metadata = []): JsonResponse
    {
        $notificationData = ReactViewHelper::formatNotification($notification, $type);

        $response = [
            'success' => true,
            'status' => 'notification',
            'message' => 'Notification sent',
            'data' => $notificationData,
            'timestamp' => now()->toISOString(),
            'metadata' => array_merge(self::getDefaultMetadata(), [
                'notification_type' => $type,
                'persistent' => $persistent
            ], $metadata)
        ];

        return response()->json($response, 200);
    }

    /**
     * Formatear respuesta de validación con detalles completos
     */
    public static function validation($errors, string $message = 'Validation failed', array $metadata = []): JsonResponse
    {
        // Convert MessageBag to array if needed
        $errorsArray = is_array($errors) ? $errors : $errors->toArray();

        $response = [
            'success' => false,
            'status' => 'validation_error',
            'message' => $message,
            'errors' => ReactViewHelper::formatValidationErrors($errorsArray),
            'timestamp' => now()->toISOString(),
            'metadata' => array_merge(self::getDefaultMetadata(), $metadata)
        ];

        self::logResponse('validation_error', $message, 422, $errorsArray);
        return response()->json($response, 422);
    }

    /**
     * Formatear respuesta de recurso no encontrado
     */
    public static function notFound(string $message = 'Resource not found', array $metadata = []): JsonResponse
    {
        $response = [
            'success' => false,
            'status' => 'not_found',
            'message' => $message,
            'timestamp' => now()->toISOString(),
            'metadata' => array_merge(self::getDefaultMetadata(), $metadata)
        ];

        self::logResponse('not_found', $message, 404);
        return response()->json($response, 404);
    }

    /**
     * Formatear respuesta de no autorizado
     */
    public static function unauthorized(string $message = 'Unauthorized', array $metadata = []): JsonResponse
    {
        $response = [
            'success' => false,
            'status' => 'unauthorized',
            'message' => $message,
            'timestamp' => now()->toISOString(),
            'metadata' => array_merge(self::getDefaultMetadata(), $metadata)
        ];

        self::logResponse('unauthorized', $message, 401);
        return response()->json($response, 401);
    }

    /**
     * Formatear respuesta de prohibido
     */
    public static function forbidden(string $message = 'Forbidden', array $metadata = []): JsonResponse
    {
        $response = [
            'success' => false,
            'status' => 'forbidden',
            'message' => $message,
            'timestamp' => now()->toISOString(),
            'metadata' => array_merge(self::getDefaultMetadata(), $metadata)
        ];

        self::logResponse('forbidden', $message, 403);
        return response()->json($response, 403);
    }

    /**
     * Formatear respuesta para dashboard
     */
    public static function dashboard($widgets, array $layout = [], string $message = 'Dashboard loaded', array $metadata = []): JsonResponse
    {
        $dashboardData = ReactViewHelper::formatForDashboard($widgets, $layout);

        $response = [
            'success' => true,
            'status' => 'success',
            'message' => $message,
            'data' => $dashboardData,
            'timestamp' => now()->toISOString(),
            'metadata' => array_merge(self::getDefaultMetadata(), [
                'view_type' => 'dashboard',
                'widget_count' => count($widgets)
            ], $metadata)
        ];

        return response()->json($response, 200);
    }

    /**
     * Formatear respuesta para exportación
     */
    public static function export($data, string $format = 'excel', string $message = 'Export ready', array $metadata = []): JsonResponse
    {
        $exportData = ReactViewHelper::formatForExport($data, $format);

        $response = [
            'success' => true,
            'status' => 'success',
            'message' => $message,
            'data' => $exportData,
            'timestamp' => now()->toISOString(),
            'metadata' => array_merge(self::getDefaultMetadata(), [
                'operation_type' => 'export',
                'export_format' => $format
            ], $metadata)
        ];

        return response()->json($response, 200);
    }

    /**
     * Formatear respuesta para búsqueda
     */
    public static function search($results, array $searchParams = [], string $message = 'Search completed', array $metadata = []): JsonResponse
    {
        $searchData = ReactViewHelper::formatSearchResults($results, $searchParams);

        $response = [
            'success' => true,
            'status' => 'success',
            'message' => $message,
            'data' => $searchData,
            'timestamp' => now()->toISOString(),
            'metadata' => array_merge(self::getDefaultMetadata(), [
                'operation_type' => 'search',
                'search_params' => $searchParams
            ], $metadata)
        ];

        return response()->json($response, 200);
    }

    /**
     * Formatear respuesta para estado de trabajo asíncrono
     */
    public static function jobStatus(string $jobId, string $status, $progress = null, $result = null, array $metadata = []): JsonResponse
    {
        $response = [
            'success' => true,
            'status' => 'job_status',
            'message' => "Job status: {$status}",
            'data' => [
                'job_id' => $jobId,
                'status' => $status, // queued, processing, completed, failed
                'progress' => $progress,
                'result' => $result,
                'updated_at' => now()->toISOString()
            ],
            'timestamp' => now()->toISOString(),
            'metadata' => array_merge(self::getDefaultMetadata(), [
                'job_id' => $jobId,
                'job_status' => $status
            ], $metadata)
        ];

        return response()->json($response, 200);
    }

    /**
     * Formatear datos según el tipo de vista React
     */
    private static function formatDataForViewType($data, string $viewType, array $config = [])
    {
        switch ($viewType) {
            case 'table':
                return ReactViewHelper::formatForTable($data, $config['columns'] ?? [], $config['actions'] ?? []);

            case 'form':
                return ReactViewHelper::formatForForm($data, $config['fields'] ?? [], $config['validation'] ?? []);

            case 'modal':
                return ReactViewHelper::formatForModal($data, $config['modal_type'] ?? 'default', $config);

            case 'dropdown':
                return ReactViewHelper::formatForDropdown($data, $config['selected'] ?? null, $config);

            case 'dashboard':
                return ReactViewHelper::formatForDashboard($data, $config['layout'] ?? []);

            default:
                return ReactViewHelper::formatForReact($data);
        }
    }

    /**
     * Obtener metadatos por defecto
     */
    private static function getDefaultMetadata(): array
    {
        return [
            'api_version' => '2.0',
            'server_time' => now()->toISOString(),
            'request_id' => request()->header('X-Request-ID', uniqid()),
            'user_id' => auth()->id(),
            'locale' => app()->getLocale(),
            'timezone' => config('app.timezone'),
            'environment' => app()->environment()
        ];
    }

    /**
     * Log de respuestas
     */
    private static function logResponse(string $type, string $message, int $code, $errors = null): void
    {
        $logData = [
            'type' => $type,
            'message' => $message,
            'code' => $code,
            'user_id' => auth()->id(),
            'ip' => request()->ip(),
            'endpoint' => request()->fullUrl(),
            'method' => request()->method(),
            'timestamp' => now()->toISOString()
        ];

        if ($errors) {
            $logData['errors'] = $errors;
        }

        if ($code >= 400) {
            Log::warning('API Response Warning/Error', $logData);
        } else {
            Log::info('API Response', $logData);
        }
    }

    /**
     * Formatear respuesta de creación exitosa
     */
    public static function created($data, string $message = 'Resource created successfully', array $metadata = []): JsonResponse
    {
        return self::success($data, $message, 201, array_merge(['operation_type' => 'create'], $metadata));
    }

    /**
     * Formatear respuesta de actualización exitosa
     */
    public static function updated($data, string $message = 'Resource updated successfully', array $metadata = []): JsonResponse
    {
        return self::success($data, $message, 200, array_merge(['operation_type' => 'update'], $metadata));
    }

    /**
     * Formatear respuesta de eliminación exitosa
     */
    public static function deleted(string $message = 'Resource deleted successfully', array $metadata = []): JsonResponse
    {
        return self::success(null, $message, 200, array_merge(['operation_type' => 'delete'], $metadata));
    }

    /**
     * Formatear respuesta sin contenido
     */
    public static function noContent(string $message = 'No content', array $metadata = []): JsonResponse
    {
        $response = [
            'success' => true,
            'status' => 'no_content',
            'message' => $message,
            'timestamp' => now()->toISOString(),
            'metadata' => array_merge(self::getDefaultMetadata(), $metadata)
        ];

        return response()->json($response, 204);
    }

    /**
     * Formatear respuesta de conflicto
     */
    public static function conflict(string $message = 'Conflict detected', $errors = null, array $metadata = []): JsonResponse
    {
        return self::error($message, 409, $errors, array_merge(['conflict_type' => 'resource_conflict'], $metadata));
    }

    /**
     * Formatear respuesta de límite de velocidad excedido
     */
    public static function tooManyRequests(string $message = 'Too many requests', int $retryAfter = 60, array $metadata = []): JsonResponse
    {
        $response = [
            'success' => false,
            'status' => 'too_many_requests',
            'message' => $message,
            'retry_after' => $retryAfter,
            'timestamp' => now()->toISOString(),
            'metadata' => array_merge(self::getDefaultMetadata(), $metadata)
        ];

        return response()->json($response, 429)->header('Retry-After', $retryAfter);
    }

    /**
     * Formatear respuesta de error interno del servidor
     */
    public static function serverError(string $message = 'Internal server error', $errors = null, array $metadata = []): JsonResponse
    {
        self::logResponse('server_error', $message, 500, $errors);
        return self::error($message, 500, $errors, array_merge(['error_type' => 'server_error'], $metadata));
    }
}
