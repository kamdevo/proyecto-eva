<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class StorageCorsMiddleware
{
    /**
     * Handle an incoming request for storage files with CORS headers.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Usar los orígenes de config/cors.php como fuente única de verdad
        $allowedOrigins = config('cors.allowed_origins', []);

        $origin = $request->headers->get('Origin');

        // Manejar preflight OPTIONS request
        if ($request->getMethod() === 'OPTIONS') {
            $response = response('', 200);
        } else {
            $response = $next($request);
        }

        // Agregar headers CORS para storage solo si el origen está permitido
        $isAllowed = in_array('*', $allowedOrigins) || in_array($origin, $allowedOrigins);
        if ($origin && $isAllowed) {
            $response->headers->set('Access-Control-Allow-Origin', $origin);
            $response->headers->set('Access-Control-Allow-Methods', 'GET, OPTIONS');
            $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
            $response->headers->set('Access-Control-Allow-Credentials', 'true');
            $response->headers->set('Access-Control-Max-Age', '86400');
        }

        // Headers adicionales para archivos
        if ($request->is('storage/*')) {
            $response->headers->set('Cross-Origin-Resource-Policy', 'cross-origin');
            $response->headers->set('Cross-Origin-Embedder-Policy', 'unsafe-none');
        }

        return $response;
    }
}
