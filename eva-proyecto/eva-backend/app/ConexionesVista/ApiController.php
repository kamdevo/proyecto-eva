<?php

namespace App\ConexionesVista;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Controlador base para APIs que se conectan con React
 */
class ApiController extends Controller
{
    /**
     * Respuesta exitosa estándar
     */
    protected function successResponse($data = null, $message = 'Success', $code = 200): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $data
        ], $code);
    }

    /**
     * Respuesta de error estándar
     */
    protected function errorResponse($message = 'Error', $code = 400, $errors = null): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $message,
            'errors' => $errors
        ], $code);
    }

    /**
     * Validar request para React
     */
    protected function validateForReact(Request $request, array $rules): array
    {
        return $request->validate($rules);
    }
}
