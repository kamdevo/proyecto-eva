<?php

namespace App\Helpers;

/**
 * ResponseFormatter Helper - Formato Estándar de Respuestas API
 * 
 * Helper empresarial para estandarizar respuestas JSON de la API
 * con formatos consistentes y manejo de errores robusto.
 * 
 * @package App\Helpers
 * @author Sistema EVA
 * @version 2.0.0
 */
class ResponseFormatter
{
    /**
     * Respuesta exitosa estándar
     * 
     * @param mixed $data Datos a retornar
     * @param string $message Mensaje descriptivo
     * @param int $code Código HTTP (por defecto 200)
     * @return \Illuminate\Http\JsonResponse
     */
    public static function success($data = null, $message = 'Operación exitosa', $code = 200)
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $data,
            'timestamp' => now()->toISOString(),
            'status_code' => $code
        ], $code)->header('Access-Control-Allow-Origin', '*')
               ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
               ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    }

    /**
     * Respuesta de error estándar
     * 
     * @param mixed $errors Errores o detalles del error
     * @param string $message Mensaje descriptivo del error
     * @param int $code Código HTTP de error (por defecto 500)
     * @return \Illuminate\Http\JsonResponse
     */
    public static function error($errors = null, $message = 'Error en la operación', $code = 500)
    {
        return response()->json([
            'success' => false,
            'message' => $message,
            'errors' => $errors,
            'timestamp' => now()->toISOString(),
            'status_code' => $code
        ], $code)->header('Access-Control-Allow-Origin', '*')
               ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
               ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    }

    /**
     * Respuesta de validación con errores específicos
     * 
     * @param array $errors Errores de validación
     * @param string $message Mensaje personalizado
     * @return \Illuminate\Http\JsonResponse
     */
    public static function validation($errors, $message = 'Errores de validación')
    {
        return self::error($errors, $message, 422);
    }

    /**
     * Respuesta de no autorizado
     * 
     * @param string $message Mensaje personalizado
     * @return \Illuminate\Http\JsonResponse
     */
    public static function unauthorized($message = 'No autorizado')
    {
        return self::error(null, $message, 401);
    }

    /**
     * Respuesta de prohibido
     * 
     * @param string $message Mensaje personalizado
     * @return \Illuminate\Http\JsonResponse
     */
    public static function forbidden($message = 'Acceso prohibido')
    {
        return self::error(null, $message, 403);
    }

    /**
     * Respuesta de no encontrado
     * 
     * @param string $message Mensaje personalizado
     * @return \Illuminate\Http\JsonResponse
     */
    public static function notFound($message = 'Recurso no encontrado')
    {
        return self::error(null, $message, 404);
    }

    /**
     * Respuesta paginada con metadatos
     * 
     * @param mixed $data Datos paginados
     * @param string $message Mensaje descriptivo
     * @return \Illuminate\Http\JsonResponse
     */
    public static function paginated($data, $message = 'Datos obtenidos exitosamente')
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $data->items(),
            'pagination' => [
                'current_page' => $data->currentPage(),
                'last_page' => $data->lastPage(),
                'per_page' => $data->perPage(),
                'total' => $data->total(),
                'from' => $data->firstItem(),
                'to' => $data->lastItem(),
                'has_more_pages' => $data->hasMorePages(),
                'next_page_url' => $data->nextPageUrl(),
                'prev_page_url' => $data->previousPageUrl()
            ],
            'timestamp' => now()->toISOString(),
            'status_code' => 200
        ], 200)->header('Access-Control-Allow-Origin', '*')
               ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
               ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    }

    /**
     * Respuesta de creación exitosa
     * 
     * @param mixed $data Datos del recurso creado
     * @param string $message Mensaje personalizado
     * @return \Illuminate\Http\JsonResponse
     */
    public static function created($data, $message = 'Recurso creado exitosamente')
    {
        return self::success($data, $message, 201);
    }

    /**
     * Respuesta de eliminación exitosa
     * 
     * @param string $message Mensaje personalizado
     * @return \Illuminate\Http\JsonResponse
     */
    public static function deleted($message = 'Recurso eliminado exitosamente')
    {
        return self::success(null, $message, 200);
    }

    /**
     * Respuesta con metadatos adicionales
     * 
     * @param mixed $data Datos principales
     * @param array $meta Metadatos adicionales
     * @param string $message Mensaje descriptivo
     * @param int $code Código HTTP
     * @return \Illuminate\Http\JsonResponse
     */
    public static function withMeta($data, $meta = [], $message = 'Operación exitosa', $code = 200)
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $data,
            'meta' => $meta,
            'timestamp' => now()->toISOString(),
            'status_code' => $code
        ], $code)->header('Access-Control-Allow-Origin', '*')
               ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
               ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    }

    /**
     * Respuesta de descarga/exportación
     * 
     * @param string $fileName Nombre del archivo
     * @param string $url URL de descarga
     * @param array $metadata Metadatos del archivo
     * @return \Illuminate\Http\JsonResponse
     */
    public static function download($fileName, $url, $metadata = [])
    {
        return self::success([
            'file_name' => $fileName,
            'download_url' => $url,
            'metadata' => $metadata
        ], 'Archivo preparado para descarga');
    }
}
