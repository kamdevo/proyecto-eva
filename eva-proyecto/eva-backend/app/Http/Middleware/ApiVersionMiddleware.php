<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

/**
 * Middleware de Versionado API
 * 
 * Maneja el versionado de la API empresarial
 * con soporte para múltiples versiones.
 */
class ApiVersionMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next)
    {
        $version = $request->header('X-API-Version', 'v1');
        
        // Validar versiones soportadas
        $versionesSoportadas = ['v1', 'v2'];
        
        if (!in_array($version, $versionesSoportadas)) {
            return response()->json([
                'success' => false,
                'message' => 'Versión de API no soportada',
                'error' => 'Unsupported API Version',
                'versiones_soportadas' => $versionesSoportadas
            ], 400);
        }
        
        // Agregar versión al request
        $request->merge(['api_version' => $version]);
        
        return $next($request);
    }
}
