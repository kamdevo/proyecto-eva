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
        // Lista de orígenes permitidos para archivos de storage
        $allowedOrigins = [
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

        // Agregar headers CORS para storage
        if (in_array($origin, $allowedOrigins) || app()->environment('local')) {
            $response->headers->set('Access-Control-Allow-Origin', $origin ?: '*');
            $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
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
