<?php

namespace App\ConexionesVista;

use Illuminate\Http\JsonResponse;

/**
 * Formateador de respuestas para APIs que se conectan con React
 */
class ResponseFormatter
{
    /**
     * Formatear respuesta de éxito
     */
    public static function success($data = null, string $message = 'Operation successful', int $code = 200): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'message' => $message,
            'data' => $data,
            'timestamp' => now()->toISOString()
        ], $code);
    }

    /**
     * Formatear respuesta de error
     */
    public static function error(string $message = 'An error occurred', int $code = 400, $errors = null): JsonResponse
    {
        $response = [
            'status' => 'error',
            'message' => $message,
            'timestamp' => now()->toISOString()
        ];

        if ($errors !== null) {
            $response['errors'] = $errors;
        }

        return response()->json($response, $code);
    }

    /**
     * Formatear respuesta de validación
     */
    public static function validation(array $errors, string $message = 'Validation failed'): JsonResponse
    {
        return response()->json([
            'status' => 'validation_error',
            'message' => $message,
            'errors' => ReactViewHelper::formatValidationErrors($errors),
            'timestamp' => now()->toISOString()
        ], 422);
    }

    /**
     * Formatear respuesta de recurso no encontrado
     */
    public static function notFound(string $message = 'Resource not found'): JsonResponse
    {
        return response()->json([
            'status' => 'not_found',
            'message' => $message,
            'timestamp' => now()->toISOString()
        ], 404);
    }

    /**
     * Formatear respuesta de no autorizado
     */
    public static function unauthorized(string $message = 'Unauthorized'): JsonResponse
    {
        return response()->json([
            'status' => 'unauthorized',
            'message' => $message,
            'timestamp' => now()->toISOString()
        ], 401);
    }
}
