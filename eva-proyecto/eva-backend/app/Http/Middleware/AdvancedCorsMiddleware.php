<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Config;

/**
 * Middleware CORS Avanzado para Sistema EVA
 * 
 * Características:
 * - Validación dinámica de orígenes
 * - Rate limiting por origen
 * - Logging de solicitudes CORS
 * - Headers de seguridad adicionales
 * - Blacklist de orígenes
 * - Configuración específica por ruta
 */
class AdvancedCorsMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next)
    {
        $origin = $request->header('Origin');
        $method = $request->getMethod();
        $path = $request->getPathInfo();

        // Log de solicitud CORS si está habilitado
        if (Config::get('cors.logging.enabled', false)) {
            $this->logCorsRequest($request, $origin, $method, $path);
        }

        // Verificar si el origen está en la blacklist
        if ($this->isOriginBlacklisted($origin)) {
            $this->logBlockedRequest($request, $origin, 'blacklisted');
            return response('Origin blocked', 403);
        }

        // Verificar rate limiting por origen
        if (!$this->checkRateLimit($origin)) {
            $this->logBlockedRequest($request, $origin, 'rate_limited');
            return response('Rate limit exceeded', 429)
                ->header('Retry-After', 60);
        }

        // Verificar si el origen está permitido
        if (!$this->isOriginAllowed($origin, $path)) {
            $this->logBlockedRequest($request, $origin, 'not_allowed');
            return response('Origin not allowed', 403);
        }

        // Manejar solicitud OPTIONS (preflight)
        if ($method === 'OPTIONS') {
            return $this->handlePreflightRequest($request, $origin, $path);
        }

        // Procesar solicitud normal
        $response = $next($request);

        // Agregar headers CORS a la respuesta
        return $this->addCorsHeaders($response, $origin, $path);
    }

    /**
     * Verificar si el origen está permitido
     */
    protected function isOriginAllowed(?string $origin, string $path): bool
    {
        if (!$origin) {
            return true; // Permitir solicitudes sin origen (same-origin)
        }

        // Verificar configuración de desarrollo
        if (Config::get('cors.development.allow_any_origin', false) && app()->environment('local')) {
            return true;
        }

        // Verificar orígenes específicos
        $allowedOrigins = Config::get('cors.allowed_origins', []);
        if (in_array($origin, $allowedOrigins)) {
            return true;
        }

        // Verificar patrones de orígenes
        $patterns = Config::get('cors.allowed_origins_patterns', []);
        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $origin)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Verificar si el origen está en la blacklist
     */
    protected function isOriginBlacklisted(?string $origin): bool
    {
        if (!$origin) {
            return false;
        }

        $blacklist = Config::get('cors.origin_blacklist', []);
        return in_array($origin, array_filter($blacklist));
    }

    /**
     * Verificar rate limiting por origen
     */
    protected function checkRateLimit(?string $origin): bool
    {
        if (!Config::get('cors.rate_limiting.enabled', true)) {
            return true;
        }

        if (!$origin) {
            return true;
        }

        // Verificar whitelist de rate limiting
        $whitelist = Config::get('cors.rate_limiting.whitelist', []);
        if (in_array($origin, array_filter($whitelist))) {
            return true;
        }

        $maxRequests = Config::get('cors.rate_limiting.max_requests_per_minute', 60);
        $key = "cors_rate_limit:{$origin}";
        
        $currentCount = Cache::get($key, 0);
        
        if ($currentCount >= $maxRequests) {
            return false;
        }

        Cache::put($key, $currentCount + 1, 60); // 1 minuto
        return true;
    }

    /**
     * Manejar solicitud preflight (OPTIONS)
     */
    protected function handlePreflightRequest(Request $request, ?string $origin, string $path): Response
    {
        $response = response('', 204);
        
        // Headers básicos de preflight
        $response->header('Access-Control-Allow-Origin', $origin ?: '*');
        $response->header('Access-Control-Allow-Credentials', 'true');
        
        // Métodos permitidos
        $allowedMethods = $this->getAllowedMethods($path);
        $response->header('Access-Control-Allow-Methods', implode(', ', $allowedMethods));
        
        // Headers permitidos
        $requestedHeaders = $request->header('Access-Control-Request-Headers');
        if ($requestedHeaders) {
            $allowedHeaders = $this->getAllowedHeaders($path);
            $response->header('Access-Control-Allow-Headers', implode(', ', $allowedHeaders));
        }
        
        // Max age
        $maxAge = $this->getMaxAge($path);
        $response->header('Access-Control-Max-Age', $maxAge);

        // Headers de seguridad
        $this->addSecurityHeaders($response);

        return $response;
    }

    /**
     * Agregar headers CORS a la respuesta
     */
    protected function addCorsHeaders($response, ?string $origin, string $path)
    {
        $response->header('Access-Control-Allow-Origin', $origin ?: '*');
        $response->header('Access-Control-Allow-Credentials', 'true');
        
        // Headers expuestos
        $exposedHeaders = Config::get('cors.exposed_headers', []);
        if (!empty($exposedHeaders)) {
            $response->header('Access-Control-Expose-Headers', implode(', ', $exposedHeaders));
        }

        // Headers de seguridad
        $this->addSecurityHeaders($response);

        // Headers de debugging en desarrollo
        if (Config::get('cors.development.debug_headers', false) && app()->environment('local')) {
            $response->header('X-CORS-Debug-Origin', $origin ?: 'none');
            $response->header('X-CORS-Debug-Path', $path);
            $response->header('X-CORS-Debug-Time', now()->toISOString());
        }

        // Headers de performance
        $response->header('X-Response-Time', $this->getResponseTime());
        $response->header('X-Server-Version', config('app.version', '1.0.0'));
        $response->header('X-API-Version', 'v1');

        return $response;
    }

    /**
     * Agregar headers de seguridad
     */
    protected function addSecurityHeaders($response): void
    {
        $securityHeaders = Config::get('cors.security_headers', []);
        
        foreach ($securityHeaders as $header => $value) {
            $response->header($header, $value);
        }

        // Content Security Policy
        $csp = Config::get('cors.content_security_policy');
        if ($csp && is_array($csp)) {
            $cspString = '';
            foreach ($csp as $directive => $value) {
                $cspString .= "{$directive} {$value}; ";
            }
            $response->header('Content-Security-Policy', trim($cspString));
        }
    }

    /**
     * Obtener métodos permitidos para una ruta específica
     */
    protected function getAllowedMethods(string $path): array
    {
        $routeConfig = $this->getRouteSpecificConfig($path);
        
        return $routeConfig['allowed_methods'] ?? 
               Config::get('cors.allowed_methods', ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']);
    }

    /**
     * Obtener headers permitidos para una ruta específica
     */
    protected function getAllowedHeaders(string $path): array
    {
        $routeConfig = $this->getRouteSpecificConfig($path);
        
        return $routeConfig['allowed_headers'] ?? 
               Config::get('cors.allowed_headers', []);
    }

    /**
     * Obtener max age para una ruta específica
     */
    protected function getMaxAge(string $path): int
    {
        $routeConfig = $this->getRouteSpecificConfig($path);
        
        return $routeConfig['max_age'] ?? 
               Config::get('cors.max_age', 86400);
    }

    /**
     * Obtener configuración específica por ruta
     */
    protected function getRouteSpecificConfig(string $path): array
    {
        $routeConfigs = Config::get('cors.route_specific', []);
        
        foreach ($routeConfigs as $pattern => $config) {
            if (fnmatch($pattern, $path)) {
                return $config;
            }
        }
        
        return [];
    }

    /**
     * Obtener tiempo de respuesta
     */
    protected function getResponseTime(): string
    {
        if (defined('LARAVEL_START')) {
            $time = (microtime(true) - LARAVEL_START) * 1000;
            return number_format($time, 2) . 'ms';
        }
        
        return '0ms';
    }

    /**
     * Log de solicitud CORS
     */
    protected function logCorsRequest(Request $request, ?string $origin, string $method, string $path): void
    {
        if (!Config::get('cors.logging.log_successful_requests', false)) {
            return;
        }

        Log::channel(Config::get('cors.logging.log_channel', 'default'))->info('CORS Request', [
            'origin' => $origin,
            'method' => $method,
            'path' => $path,
            'user_agent' => $request->userAgent(),
            'ip' => $request->ip(),
            'timestamp' => now()->toISOString(),
        ]);
    }

    /**
     * Log de solicitud bloqueada
     */
    protected function logBlockedRequest(Request $request, ?string $origin, string $reason): void
    {
        if (!Config::get('cors.logging.log_blocked_requests', true)) {
            return;
        }

        Log::channel(Config::get('cors.logging.log_channel', 'default'))->warning('CORS Request Blocked', [
            'origin' => $origin,
            'reason' => $reason,
            'method' => $request->getMethod(),
            'path' => $request->getPathInfo(),
            'user_agent' => $request->userAgent(),
            'ip' => $request->ip(),
            'timestamp' => now()->toISOString(),
        ]);
    }
}
