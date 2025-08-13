<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CorsStorage
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        // Aplicar headers CORS para archivos de storage
        $response = $next($request);
        
        // Agregar headers CORS
        $response->headers->set('Access-Control-Allow-Origin', '*');
        $response->headers->set('Access-Control-Allow-Methods', 'GET, OPTIONS');
        $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, Accept, Origin, X-Requested-With');
        $response->headers->set('Access-Control-Max-Age', '3600');
        
        // Manejar preflight requests
        if ($request->getMethod() === 'OPTIONS') {
            $response->setStatusCode(200);
        }
        
        return $response;
    }
}
