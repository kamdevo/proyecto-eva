<?php

namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\Authenticate as Middleware;
use Illuminate\Http\Request;

/**
 * Middleware de Autenticación Empresarial
 * 
 * Middleware personalizado para manejar autenticación
 * con redirección apropiada para APIs y web.
 */
class Authenticate extends Middleware
{
    /**
     * Get the path the user should be redirected to when they are not authenticated.
     */
    protected function redirectTo(Request $request): ?string
    {
        // Para rutas API, no redirigir sino retornar null
        // Esto causará que se retorne un error 401 JSON
        if ($request->expectsJson() || $request->is('api/*')) {
            return null;
        }
        
        // Para rutas web, redirigir al login
        return route('login');
    }
    
    /**
     * Handle an unauthenticated user.
     */
    protected function unauthenticated($request, array $guards)
    {
        if ($request->expectsJson() || $request->is('api/*')) {
            abort(response()->json([
                'success' => false,
                'message' => 'No autenticado. Token requerido.',
                'error' => 'Unauthorized'
            ], 401));
        }
        
        parent::unauthenticated($request, $guards);
    }
}
