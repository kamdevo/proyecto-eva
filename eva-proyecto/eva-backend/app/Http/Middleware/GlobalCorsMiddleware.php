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
        // Lista de orígenes permitidos desde el .env o valores por defecto para desarrollo
        $corsAllowedOrigins = env('CORS_ALLOWED_ORIGINS', '');
        $allowedOrigins = !empty($corsAllowedOrigins) 
            ? explode(',', $corsAllowedOrigins) 
            : [
                'http://localhost:5173',
                'http://localhost:5174',
                'http://localhost:5175',
                'http://localhost:3000',
                'http://localhost:4173',
                'http://127.0.0.1:5173',
                'http://127.0.0.1:5174',
                'http://127.0.0.1:5175',
                'http://127.0.0.1:3000',
                'http://127.0.0.1:4173',
            ];

        $origin = $request->headers->get('Origin');

        // Manejar preflight OPTIONS request
        if ($request->getMethod() === 'OPTIONS') {
            $response = response('', 200);
        } else {
            $response = $next($request);
        }

        // Aplicar CORS headers si el origen está permitido o estamos en desarrollo
        if (in_array($origin, $allowedOrigins) || app()->environment('local')) {
            $response->headers->set('Access-Control-Allow-Origin', $origin ?: '*');
            $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, HEAD');
            $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, X-CSRF-TOKEN');
            $response->headers->set('Access-Control-Allow-Credentials', 'true');
            $response->headers->set('Access-Control-Max-Age', '86400');
            $response->headers->set('Access-Control-Expose-Headers', 'Content-Disposition, Content-Length, Content-Range');
        }

        // Headers específicos para archivos de storage
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
