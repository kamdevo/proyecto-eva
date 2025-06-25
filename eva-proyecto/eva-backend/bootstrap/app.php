<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Middleware global
        $middleware->append([
            \App\Http\Middleware\SecurityHeaders::class,
            \App\Http\Middleware\AuditMiddleware::class,
        ]);

        // Middleware de API
        $middleware->api(append: [
            \App\Http\Middleware\AdvancedRateLimit::class . ':120,1',
        ]);

        // Middleware CORS para API
        $middleware->api(prepend: [
            \Illuminate\Http\Middleware\HandleCors::class,
        ]);

        // Middleware con alias
        $middleware->alias([
            'audit' => \App\Http\Middleware\AuditMiddleware::class,
            'security.headers' => \App\Http\Middleware\SecurityHeaders::class,
            'advanced.throttle' => \App\Http\Middleware\AdvancedRateLimit::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Configuración de manejo de excepciones para API
        $exceptions->render(function (\Illuminate\Auth\AuthenticationException $e, $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'success' => false,
                    'message' => 'No autenticado',
                    'error' => 'Token de autenticación requerido'
                ], 401);
            }
        });

        $exceptions->render(function (\Exception $e, $request) {
            if ($request->is('api/*')) {
                \Log::error('API Exception', [
                    'message' => $e->getMessage(),
                    'url' => $request->fullUrl(),
                    'user_id' => auth()->id(),
                ]);

                if (app()->environment('production')) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Error interno del servidor'
                    ], 500);
                }
            }
        });
    })->create();
