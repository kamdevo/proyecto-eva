<?php

namespace App\ConexionesVista;

/**
 * Helper para manejar datos entre Laravel y React
 */
class ReactViewHelper
{
    /**
     * Formatear datos para React
     */
    public static function formatForReact($data): array
    {
        if (is_object($data) && method_exists($data, 'toArray')) {
            return $data->toArray();
        }

        if (is_array($data)) {
            return $data;
        }

        return ['data' => $data];
    }

    /**
     * Preparar datos de paginación para React
     */
    public static function formatPagination($paginator): array
    {
        return [
            'data' => $paginator->items(),
            'pagination' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'from' => $paginator->firstItem(),
                'to' => $paginator->lastItem(),
            ]
        ];
    }

    /**
     * Formatear errores de validación para React
     */
    public static function formatValidationErrors($errors): array
    {
        $formatted = [];
        foreach ($errors as $field => $messages) {
            $formatted[$field] = is_array($messages) ? $messages[0] : $messages;
        }
        return $formatted;
    }

    /**
     * Generar configuración inicial para React
     */
    public static function getReactConfig(): array
    {
        return [
            'api_url' => config('app.url') . '/api',
            'app_name' => config('app.name'),
            'csrf_token' => csrf_token(),
            'locale' => app()->getLocale(),
        ];
    }
}
