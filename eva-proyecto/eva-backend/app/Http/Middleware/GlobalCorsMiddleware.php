<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class GlobalCorsMiddleware
{
    /**
     * Handle an incoming request with comprehensive CORS support.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Manejar preflight OPTIONS request
        if ($request->getMethod() === 'OPTIONS') {
            // HandleCors (Laravel built-in) se encarga de CORS.
            // Este middleware solo maneja OPTIONS como fallback.
            return response('', 200);
        }

        $response = $next($request);

        // Headers específicos para archivos de storage (no CORS genérico)
        if ($request->is('storage/*')) {
            $response->headers->set('Cross-Origin-Resource-Policy', 'cross-origin');
            $response->headers->set('Cross-Origin-Embedder-Policy', 'unsafe-none');
            
            // Headers adicionales para PDFs
            if ($request->is('storage/equipos/registros_sanitarios/*')) {
                $response->headers->set('Content-Type', 'application/pdf');
                $response->headers->set('X-Content-Type-Options', 'nosniff');
            }
        }

        return $response;
    }
}
