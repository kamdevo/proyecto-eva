<?php

namespace App\ConexionesVista;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use Carbon\Carbon;

/**
 * Controlador base MEJORADO AL 500% para APIs que se conectan con React
 * Maneja TODOS los tipos de respuestas y acciones posibles para vistas React
 */
class ApiController extends Controller
{
    /**
     * Metadatos por defecto para respuestas
     */
    protected $defaultMetadata = [
        'api_version' => '2.0',
        'server_time' => null,
        'request_id' => null,
        'user_id' => null,
        'permissions' => [],
        'locale' => 'es'
    ];

    /**
     * Respuesta exitosa estándar con timestamp y metadatos
     */
    protected function successResponse($data = null, $message = 'Success', $code = 200, $metadata = []): JsonResponse
    {
        $response = [
            'success' => true,
            'status' => 'success',
            'message' => $message,
            'data' => $data,
            'timestamp' => now()->toISOString(),
            'metadata' => array_merge($this->getDefaultMetadata(), $metadata)
        ];

        $this->logApiResponse('success', $message, $code);
        return response()->json($response, $code);
    }

    /**
     * Respuesta de error estándar con detalles completos
     */
    protected function errorResponse($message = 'Error', $code = 400, $errors = null, $metadata = []): JsonResponse
    {
        $response = [
            'success' => false,
            'status' => 'error',
            'message' => $message,
            'errors' => $errors,
            'timestamp' => now()->toISOString(),
            'metadata' => array_merge($this->getDefaultMetadata(), $metadata)
        ];

        $this->logApiResponse('error', $message, $code, $errors);
        return response()->json($response, $code);
    }

    /**
     * Respuesta para paginación con metadatos completos
     */
    protected function paginatedResponse($paginator, $message = 'Data retrieved successfully', $metadata = []): JsonResponse
    {
        $response = [
            'success' => true,
            'status' => 'success',
            'message' => $message,
            'data' => $paginator->items(),
            'pagination' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'from' => $paginator->firstItem(),
                'to' => $paginator->lastItem(),
                'has_more_pages' => $paginator->hasMorePages(),
                'path' => $paginator->path(),
                'links' => [
                    'first' => $paginator->url(1),
                    'last' => $paginator->url($paginator->lastPage()),
                    'prev' => $paginator->previousPageUrl(),
                    'next' => $paginator->nextPageUrl()
                ]
            ],
            'timestamp' => now()->toISOString(),
            'metadata' => array_merge($this->getDefaultMetadata(), $metadata)
        ];

        return response()->json($response, 200);
    }

    /**
     * Respuesta específica para componentes React Table
     */
    protected function tableResponse($data, $columns = [], $actions = [], $filters = [], $message = 'Table data loaded'): JsonResponse
    {
        return $this->successResponse([
            'rows' => $data,
            'columns' => $columns,
            'actions' => $actions,
            'filters' => $filters,
            'total_rows' => is_countable($data) ? count($data) : 0
        ], $message, 200, ['component_type' => 'table']);
    }

    /**
     * Respuesta específica para componentes React Modal
     */
    protected function modalResponse($modalData, $formFields = [], $validationRules = [], $message = 'Modal data loaded'): JsonResponse
    {
        return $this->successResponse([
            'modal_data' => $modalData,
            'form_fields' => $formFields,
            'validation_rules' => $validationRules,
            'modal_config' => [
                'closable' => true,
                'backdrop_close' => true,
                'size' => 'medium'
            ]
        ], $message, 200, ['component_type' => 'modal']);
    }

    /**
     * Respuesta específica para componentes React Form
     */
    protected function formResponse($formData, $validationRules = [], $options = [], $message = 'Form data loaded'): JsonResponse
    {
        return $this->successResponse([
            'form_data' => $formData,
            'validation_rules' => $validationRules,
            'form_options' => array_merge([
                'submit_method' => 'POST',
                'reset_on_submit' => false,
                'validate_on_change' => true,
                'show_required_asterisk' => true
            ], $options)
        ], $message, 200, ['component_type' => 'form']);
    }

    /**
     * Respuesta específica para componentes React Dropdown/Select
     */
    protected function dropdownResponse($options, $selected = null, $config = [], $message = 'Dropdown options loaded'): JsonResponse
    {
        return $this->successResponse([
            'options' => $options,
            'selected' => $selected,
            'config' => array_merge([
                'searchable' => true,
                'multiple' => false,
                'clearable' => true,
                'placeholder' => 'Seleccione una opción...'
            ], $config)
        ], $message, 200, ['component_type' => 'dropdown']);
    }

    /**
     * Respuesta específica para operaciones en lote
     */
    protected function batchResponse($results, $summary = [], $message = 'Batch operation completed'): JsonResponse
    {
        $totalItems = count($results);
        $successCount = collect($results)->where('success', true)->count();
        $errorCount = $totalItems - $successCount;

        return $this->successResponse([
            'results' => $results,
            'summary' => array_merge([
                'total_items' => $totalItems,
                'successful' => $successCount,
                'failed' => $errorCount,
                'success_rate' => $totalItems > 0 ? round(($successCount / $totalItems) * 100, 2) : 0
            ], $summary)
        ], $message, 200, ['component_type' => 'batch_operation']);
    }

    /**
     * Respuesta para operaciones de archivos
     */
    protected function fileResponse($fileData, $operation = 'upload', $message = 'File operation completed'): JsonResponse
    {
        return $this->successResponse([
            'file_data' => $fileData,
            'operation' => $operation,
            'file_info' => [
                'upload_limits' => [
                    'max_size' => '10MB',
                    'allowed_types' => ['pdf', 'doc', 'docx', 'jpg', 'png', 'xls', 'xlsx']
                ]
            ]
        ], $message, 200, ['component_type' => 'file_operation']);
    }

    /**
     * Respuesta para notificaciones en tiempo real
     */
    protected function notificationResponse($notification, $type = 'info', $persistent = false): JsonResponse
    {
        return $this->successResponse([
            'notification' => $notification,
            'type' => $type, // info, success, warning, error
            'persistent' => $persistent,
            'timestamp' => now()->toISOString(),
            'auto_dismiss' => !$persistent ? 5000 : null // 5 segundos
        ], 'Notification sent', 200, ['component_type' => 'notification']);
    }

    /**
     * Validar request para React con reglas específicas
     */
    protected function validateForReact(Request $request, array $rules, array $messages = [], array $attributes = []): array
    {
        try {
            $validator = Validator::make($request->all(), $rules, $messages, $attributes);

            if ($validator->fails()) {
                throw new ValidationException($validator);
            }

            return $validator->validated();
        } catch (ValidationException $e) {
            throw $e;
        }
    }

    /**
     * Validación específica para componentes React
     */
    protected function validateReactComponent(Request $request, string $componentType): array
    {
        $rules = $this->getComponentValidationRules($componentType);
        return $this->validateForReact($request, $rules);
    }

    /**
     * Obtener reglas de validación por tipo de componente
     */
    protected function getComponentValidationRules(string $componentType): array
    {
        $rules = [
            'table' => [
                'page' => 'integer|min:1',
                'per_page' => 'integer|min:1|max:100',
                'sort_by' => 'string',
                'sort_direction' => 'in:asc,desc',
                'filters' => 'array'
            ],
            'form' => [
                'form_data' => 'required|array',
                'component_id' => 'required|string'
            ],
            'modal' => [
                'modal_id' => 'required|string',
                'action' => 'required|string'
            ],
            'file_upload' => [
                'file' => 'required|file|max:10240', // 10MB
                'type' => 'required|string',
                'category' => 'string'
            ]
        ];

        return $rules[$componentType] ?? [];
    }

    /**
     * Obtener metadatos por defecto
     */
    protected function getDefaultMetadata(): array
    {
        return array_merge($this->defaultMetadata, [
            'server_time' => now()->toISOString(),
            'request_id' => request()->header('X-Request-ID', uniqid()),
            'user_id' => auth()->id(),
            'permissions' => $this->getUserPermissions(),
            'locale' => app()->getLocale()
        ]);
    }

    /**
     * Obtener permisos del usuario actual
     */
    protected function getUserPermissions(): array
    {
        if (!auth()->check()) {
            return [];
        }

        // Cache de permisos por 5 minutos
        return Cache::remember("user_permissions_" . auth()->id(), 300, function () {
            $user = auth()->user();
            return [
                'can_create' => true, // Implementar lógica real
                'can_edit' => true,
                'can_delete' => true,
                'can_export' => true,
                'role' => $user->rol_id ?? 'user'
            ];
        });
    }

    /**
     * Log de respuestas API
     */
    protected function logApiResponse(string $type, string $message, int $code, $errors = null): void
    {
        $logData = [
            'type' => $type,
            'message' => $message,
            'code' => $code,
            'user_id' => auth()->id(),
            'ip' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'endpoint' => request()->fullUrl(),
            'method' => request()->method()
        ];

        if ($errors) {
            $logData['errors'] = $errors;
        }

        if ($type === 'error' && $code >= 500) {
            Log::error('API Error Response', $logData);
        } else {
            Log::info('API Response', $logData);
        }
    }

    /**
     * Respuesta para operaciones asíncronas
     */
    protected function asyncResponse($jobId, $status = 'queued', $estimatedTime = null): JsonResponse
    {
        return $this->successResponse([
            'job_id' => $jobId,
            'status' => $status,
            'estimated_completion' => $estimatedTime,
            'polling_url' => route('api.job.status', $jobId),
            'polling_interval' => 2000 // 2 segundos
        ], 'Async operation started', 202, ['component_type' => 'async_operation']);
    }

    /**
     * Respuesta para dashboard/widgets
     */
    protected function dashboardResponse($widgets, $layout = [], $message = 'Dashboard data loaded'): JsonResponse
    {
        return $this->successResponse([
            'widgets' => $widgets,
            'layout' => $layout,
            'refresh_interval' => 30000, // 30 segundos
            'last_updated' => now()->toISOString()
        ], $message, 200, ['component_type' => 'dashboard']);
    }
}
