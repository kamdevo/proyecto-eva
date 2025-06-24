<?php

namespace App\ConexionesVista;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use Carbon\Carbon;

/**
 * Helper MEJORADO AL 500% para manejar datos entre Laravel y React
 * Maneja TODOS los tipos de componentes y transformaciones posibles
 */
class ReactViewHelper
{
    /**
     * Formatear datos para React con manejo completo de relaciones
     */
    public static function formatForReact($data, array $options = []): array
    {
        $defaultOptions = [
            'include_relations' => true,
            'format_dates' => true,
            'include_urls' => true,
            'transform_keys' => true,
            'include_metadata' => false
        ];

        $options = array_merge($defaultOptions, $options);

        if ($data instanceof Model) {
            return self::formatModel($data, $options);
        }

        if ($data instanceof Collection) {
            return self::formatCollection($data, $options);
        }

        if (is_object($data) && method_exists($data, 'toArray')) {
            return self::transformArray($data->toArray(), $options);
        }

        if (is_array($data)) {
            return self::transformArray($data, $options);
        }

        return ['data' => $data];
    }

    /**
     * Formatear modelo individual con relaciones
     */
    private static function formatModel(Model $model, array $options): array
    {
        $data = $model->toArray();

        if ($options['include_relations']) {
            $data = self::includeModelRelations($model, $data);
        }

        if ($options['format_dates']) {
            $data = self::formatDates($data);
        }

        if ($options['include_urls']) {
            $data = self::includeUrls($model, $data);
        }

        if ($options['transform_keys']) {
            $data = self::transformKeys($data);
        }

        if ($options['include_metadata']) {
            $data['_metadata'] = self::getModelMetadata($model);
        }

        return $data;
    }

    /**
     * Formatear colección con optimizaciones
     */
    private static function formatCollection(Collection $collection, array $options): array
    {
        return $collection->map(function ($item) use ($options) {
            if ($item instanceof Model) {
                return self::formatModel($item, $options);
            }
            return $item;
        })->toArray();
    }

    /**
     * Incluir relaciones del modelo
     */
    private static function includeModelRelations(Model $model, array $data): array
    {
        $relations = $model->getRelations();

        foreach ($relations as $relationName => $relationData) {
            if ($relationData instanceof Model) {
                $data[$relationName] = self::formatModel($relationData, ['include_relations' => false]);
            } elseif ($relationData instanceof Collection) {
                $data[$relationName] = self::formatCollection($relationData, ['include_relations' => false]);
            }
        }

        return $data;
    }

    /**
     * Formatear fechas para React
     */
    private static function formatDates(array $data): array
    {
        $dateFields = ['created_at', 'updated_at', 'deleted_at', 'fecha_registro', 'fecha_programada', 'fecha_fin'];

        foreach ($dateFields as $field) {
            if (isset($data[$field]) && $data[$field]) {
                try {
                    $carbon = Carbon::parse($data[$field]);
                    $data[$field] = [
                        'raw' => $data[$field],
                        'formatted' => $carbon->format('d/m/Y H:i'),
                        'iso' => $carbon->toISOString(),
                        'human' => $carbon->diffForHumans(),
                        'timestamp' => $carbon->timestamp
                    ];
                } catch (\Exception $e) {
                    // Mantener valor original si no se puede parsear
                }
            }
        }

        return $data;
    }

    /**
     * Incluir URLs relevantes
     */
    private static function includeUrls(Model $model, array $data): array
    {
        $modelName = strtolower(class_basename($model));
        $data['_urls'] = [
            'show' => route("api.{$modelName}.show", $model->id),
            'edit' => route("api.{$modelName}.update", $model->id),
            'delete' => route("api.{$modelName}.destroy", $model->id)
        ];

        // URLs específicas para archivos
        if (isset($data['file_path'])) {
            $data['_urls']['download'] = Storage::disk('public')->url($data['file_path']);
        }

        if (isset($data['image'])) {
            $data['_urls']['image'] = Storage::disk('public')->url($data['image']);
        }

        return $data;
    }

    /**
     * Transformar claves para React (camelCase)
     */
    private static function transformKeys(array $data): array
    {
        $transformed = [];

        foreach ($data as $key => $value) {
            $newKey = Str::camel($key);

            if (is_array($value)) {
                $transformed[$newKey] = self::transformKeys($value);
            } else {
                $transformed[$newKey] = $value;
            }
        }

        return $transformed;
    }

    /**
     * Obtener metadatos del modelo
     */
    private static function getModelMetadata(Model $model): array
    {
        return [
            'model_type' => class_basename($model),
            'table_name' => $model->getTable(),
            'primary_key' => $model->getKeyName(),
            'timestamps' => $model->timestamps,
            'fillable' => $model->getFillable(),
            'hidden' => $model->getHidden(),
            'casts' => $model->getCasts()
        ];
    }

    /**
     * Transformar array genérico
     */
    private static function transformArray(array $data, array $options): array
    {
        if ($options['format_dates']) {
            $data = self::formatDates($data);
        }

        if ($options['transform_keys']) {
            $data = self::transformKeys($data);
        }

        return $data;
    }

    /**
     * Preparar datos de paginación para React con metadatos completos
     */
    public static function formatPagination($paginator, array $options = []): array
    {
        $data = [
            'data' => self::formatForReact($paginator->items(), $options),
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
            'meta' => [
                'total_pages' => $paginator->lastPage(),
                'showing' => "Mostrando {$paginator->firstItem()}-{$paginator->lastItem()} de {$paginator->total()} resultados",
                'empty' => $paginator->total() === 0
            ]
        ];

        return $data;
    }

    /**
     * Formatear datos para React Table con columnas y acciones
     */
    public static function formatForTable($data, array $columns = [], array $actions = []): array
    {
        $formattedData = self::formatForReact($data);

        return [
            'rows' => $formattedData,
            'columns' => self::formatTableColumns($columns),
            'actions' => self::formatTableActions($actions),
            'config' => [
                'sortable' => true,
                'filterable' => true,
                'selectable' => true,
                'exportable' => true,
                'pagination' => true
            ]
        ];
    }

    /**
     * Formatear columnas para React Table
     */
    public static function formatTableColumns(array $columns): array
    {
        return collect($columns)->map(function ($column) {
            return [
                'key' => $column['key'] ?? '',
                'title' => $column['title'] ?? '',
                'sortable' => $column['sortable'] ?? true,
                'filterable' => $column['filterable'] ?? true,
                'width' => $column['width'] ?? 'auto',
                'align' => $column['align'] ?? 'left',
                'type' => $column['type'] ?? 'text', // text, number, date, boolean, image
                'format' => $column['format'] ?? null
            ];
        })->toArray();
    }

    /**
     * Formatear acciones para React Table
     */
    public static function formatTableActions(array $actions): array
    {
        return collect($actions)->map(function ($action) {
            return [
                'key' => $action['key'] ?? '',
                'label' => $action['label'] ?? '',
                'icon' => $action['icon'] ?? '',
                'color' => $action['color'] ?? 'primary',
                'type' => $action['type'] ?? 'button', // button, link, dropdown
                'permission' => $action['permission'] ?? null,
                'confirm' => $action['confirm'] ?? false,
                'confirm_message' => $action['confirm_message'] ?? '¿Está seguro?'
            ];
        })->toArray();
    }

    /**
     * Formatear datos para React Form
     */
    public static function formatForForm($data, array $fields = [], array $validationRules = []): array
    {
        return [
            'form_data' => self::formatForReact($data),
            'fields' => self::formatFormFields($fields),
            'validation_rules' => $validationRules,
            'config' => [
                'method' => 'POST',
                'enctype' => 'application/json',
                'reset_on_submit' => false,
                'validate_on_change' => true,
                'show_required' => true
            ]
        ];
    }

    /**
     * Formatear campos para React Form
     */
    public static function formatFormFields(array $fields): array
    {
        return collect($fields)->map(function ($field) {
            return [
                'name' => $field['name'] ?? '',
                'label' => $field['label'] ?? '',
                'type' => $field['type'] ?? 'text',
                'required' => $field['required'] ?? false,
                'placeholder' => $field['placeholder'] ?? '',
                'options' => $field['options'] ?? [],
                'validation' => $field['validation'] ?? [],
                'help_text' => $field['help_text'] ?? '',
                'disabled' => $field['disabled'] ?? false,
                'readonly' => $field['readonly'] ?? false,
                'default_value' => $field['default_value'] ?? null
            ];
        })->toArray();
    }

    /**
     * Formatear datos para React Modal
     */
    public static function formatForModal($data, string $modalType = 'default', array $config = []): array
    {
        $defaultConfig = [
            'size' => 'medium', // small, medium, large, xl
            'closable' => true,
            'backdrop_close' => true,
            'keyboard_close' => true,
            'centered' => true,
            'scrollable' => true
        ];

        return [
            'modal_data' => self::formatForReact($data),
            'modal_type' => $modalType,
            'config' => array_merge($defaultConfig, $config),
            'actions' => self::getModalActions($modalType)
        ];
    }

    /**
     * Obtener acciones por tipo de modal
     */
    private static function getModalActions(string $modalType): array
    {
        $actions = [
            'default' => [
                ['key' => 'close', 'label' => 'Cerrar', 'type' => 'secondary'],
                ['key' => 'save', 'label' => 'Guardar', 'type' => 'primary']
            ],
            'confirm' => [
                ['key' => 'cancel', 'label' => 'Cancelar', 'type' => 'secondary'],
                ['key' => 'confirm', 'label' => 'Confirmar', 'type' => 'danger']
            ],
            'info' => [
                ['key' => 'close', 'label' => 'Cerrar', 'type' => 'primary']
            ]
        ];

        return $actions[$modalType] ?? $actions['default'];
    }

    /**
     * Formatear datos para React Dropdown/Select
     */
    public static function formatForDropdown($options, $selected = null, array $config = []): array
    {
        $defaultConfig = [
            'searchable' => true,
            'multiple' => false,
            'clearable' => true,
            'placeholder' => 'Seleccione una opción...',
            'no_options_message' => 'No hay opciones disponibles',
            'loading_message' => 'Cargando...'
        ];

        $formattedOptions = collect($options)->map(function ($option) {
            if (is_array($option)) {
                return [
                    'value' => $option['value'] ?? $option['id'] ?? '',
                    'label' => $option['label'] ?? $option['name'] ?? $option['nombre'] ?? '',
                    'disabled' => $option['disabled'] ?? false,
                    'group' => $option['group'] ?? null
                ];
            }

            if (is_object($option)) {
                return [
                    'value' => $option->id ?? '',
                    'label' => $option->name ?? $option->nombre ?? $option->label ?? '',
                    'disabled' => $option->disabled ?? false,
                    'group' => $option->group ?? null
                ];
            }

            return [
                'value' => $option,
                'label' => $option,
                'disabled' => false
            ];
        })->toArray();

        return [
            'options' => $formattedOptions,
            'selected' => $selected,
            'config' => array_merge($defaultConfig, $config)
        ];
    }

    /**
     * Formatear errores de validación para React con detalles completos
     */
    public static function formatValidationErrors($errors): array
    {
        $formatted = [];

        if (is_object($errors) && method_exists($errors, 'toArray')) {
            $errors = $errors->toArray();
        }

        foreach ($errors as $field => $messages) {
            $formatted[$field] = [
                'message' => is_array($messages) ? $messages[0] : $messages,
                'all_messages' => is_array($messages) ? $messages : [$messages],
                'field' => $field,
                'type' => 'validation_error'
            ];
        }

        return $formatted;
    }

    /**
     * Formatear datos para archivos/imágenes
     */
    public static function formatFileData($file, string $type = 'file'): array
    {
        if (is_string($file)) {
            // Es una ruta de archivo
            return [
                'url' => Storage::disk('public')->url($file),
                'path' => $file,
                'type' => $type,
                'exists' => Storage::disk('public')->exists($file)
            ];
        }

        if (is_object($file) && isset($file->file_path)) {
            // Es un modelo de archivo
            return [
                'id' => $file->id ?? null,
                'name' => $file->name ?? $file->file_name ?? '',
                'url' => Storage::disk('public')->url($file->file_path),
                'path' => $file->file_path,
                'size' => $file->file_size ?? 0,
                'size_formatted' => self::formatFileSize($file->file_size ?? 0),
                'type' => $file->mime_type ?? $type,
                'extension' => $file->extension ?? '',
                'uploaded_at' => $file->created_at ?? null
            ];
        }

        return [];
    }

    /**
     * Formatear tamaño de archivo
     */
    public static function formatFileSize(int $bytes): string
    {
        if ($bytes == 0) return '0 B';

        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $factor = floor(log($bytes, 1024));

        return round($bytes / pow(1024, $factor), 2) . ' ' . $units[$factor];
    }

    /**
     * Generar configuración inicial para React con cache
     */
    public static function getReactConfig(): array
    {
        return Cache::remember('react_config', 3600, function () {
            return [
                'api_url' => config('app.url') . '/api',
                'app_name' => config('app.name'),
                'app_version' => config('app.version', '1.0.0'),
                'csrf_token' => csrf_token(),
                'locale' => app()->getLocale(),
                'timezone' => config('app.timezone'),
                'date_format' => 'd/m/Y',
                'datetime_format' => 'd/m/Y H:i',
                'currency' => 'COP',
                'pagination' => [
                    'default_per_page' => 10,
                    'max_per_page' => 100,
                    'page_sizes' => [10, 25, 50, 100]
                ],
                'file_upload' => [
                    'max_size' => '10MB',
                    'allowed_types' => ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'gif', 'xls', 'xlsx'],
                    'image_types' => ['jpg', 'jpeg', 'png', 'gif']
                ],
                'ui' => [
                    'theme' => 'light',
                    'primary_color' => '#007bff',
                    'success_color' => '#28a745',
                    'warning_color' => '#ffc107',
                    'danger_color' => '#dc3545'
                ]
            ];
        });
    }

    /**
     * Formatear datos para dashboard/widgets
     */
    public static function formatForDashboard($widgets, array $layout = []): array
    {
        $formattedWidgets = collect($widgets)->map(function ($widget) {
            return [
                'id' => $widget['id'] ?? uniqid(),
                'type' => $widget['type'] ?? 'default',
                'title' => $widget['title'] ?? '',
                'data' => self::formatForReact($widget['data'] ?? []),
                'config' => array_merge([
                    'refreshable' => true,
                    'refresh_interval' => 30000,
                    'collapsible' => true,
                    'removable' => false
                ], $widget['config'] ?? []),
                'size' => $widget['size'] ?? 'medium',
                'position' => $widget['position'] ?? ['x' => 0, 'y' => 0]
            ];
        })->toArray();

        return [
            'widgets' => $formattedWidgets,
            'layout' => $layout,
            'config' => [
                'editable' => true,
                'auto_refresh' => true,
                'refresh_interval' => 30000
            ]
        ];
    }

    /**
     * Formatear datos para notificaciones
     */
    public static function formatNotification($notification, string $type = 'info'): array
    {
        return [
            'id' => $notification['id'] ?? uniqid(),
            'type' => $type, // success, info, warning, error
            'title' => $notification['title'] ?? '',
            'message' => $notification['message'] ?? '',
            'timestamp' => now()->toISOString(),
            'read' => $notification['read'] ?? false,
            'persistent' => $notification['persistent'] ?? false,
            'actions' => $notification['actions'] ?? [],
            'auto_dismiss' => $notification['auto_dismiss'] ?? ($type !== 'error' ? 5000 : null),
            'icon' => $notification['icon'] ?? self::getNotificationIcon($type)
        ];
    }

    /**
     * Obtener icono por tipo de notificación
     */
    private static function getNotificationIcon(string $type): string
    {
        $icons = [
            'success' => 'check-circle',
            'info' => 'info-circle',
            'warning' => 'exclamation-triangle',
            'error' => 'times-circle'
        ];

        return $icons[$type] ?? 'info-circle';
    }

    /**
     * Formatear datos para filtros avanzados
     */
    public static function formatFilters(array $filters): array
    {
        return collect($filters)->map(function ($filter) {
            return [
                'key' => $filter['key'] ?? '',
                'label' => $filter['label'] ?? '',
                'type' => $filter['type'] ?? 'text', // text, select, date, range, boolean
                'options' => $filter['options'] ?? [],
                'default_value' => $filter['default_value'] ?? null,
                'placeholder' => $filter['placeholder'] ?? '',
                'multiple' => $filter['multiple'] ?? false,
                'required' => $filter['required'] ?? false
            ];
        })->toArray();
    }

    /**
     * Formatear datos para exportación
     */
    public static function formatForExport($data, string $format = 'excel'): array
    {
        return [
            'data' => self::formatForReact($data),
            'format' => $format,
            'config' => [
                'filename' => 'export_' . date('Y-m-d_H-i-s'),
                'include_headers' => true,
                'date_format' => 'd/m/Y',
                'available_formats' => ['excel', 'csv', 'pdf']
            ]
        ];
    }

    /**
     * Formatear respuesta para operaciones en lote
     */
    public static function formatBatchResponse(array $results): array
    {
        $total = count($results);
        $successful = collect($results)->where('success', true)->count();
        $failed = $total - $successful;

        return [
            'results' => $results,
            'summary' => [
                'total' => $total,
                'successful' => $successful,
                'failed' => $failed,
                'success_rate' => $total > 0 ? round(($successful / $total) * 100, 2) : 0
            ],
            'details' => [
                'successful_items' => collect($results)->where('success', true)->pluck('id')->toArray(),
                'failed_items' => collect($results)->where('success', false)->toArray()
            ]
        ];
    }

    /**
     * Formatear datos para búsqueda avanzada
     */
    public static function formatSearchResults($results, array $searchParams = []): array
    {
        return [
            'results' => self::formatForReact($results),
            'search_params' => $searchParams,
            'meta' => [
                'total_results' => is_countable($results) ? count($results) : 0,
                'search_time' => microtime(true) - (request()->server('REQUEST_TIME_FLOAT') ?? 0),
                'has_results' => !empty($results)
            ]
        ];
    }
}
