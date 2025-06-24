<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class AuditMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $startTime = microtime(true);
        
        // Procesar la request
        $response = $next($request);
        
        $endTime = microtime(true);
        $duration = round(($endTime - $startTime) * 1000, 2); // en milisegundos

        // Solo auditar ciertas rutas importantes
        if ($this->shouldAudit($request)) {
            $this->logAuditEvent($request, $response, $duration);
        }

        return $response;
    }

    /**
     * Determinar si se debe auditar esta request
     */
    private function shouldAudit(Request $request): bool
    {
        $auditableRoutes = [
            'POST',
            'PUT',
            'PATCH',
            'DELETE'
        ];

        $sensitiveEndpoints = [
            '/api/login',
            '/api/register',
            '/api/equipos',
            '/api/mantenimientos',
            '/api/contingencias',
            '/api/usuarios',
            '/api/archivos'
        ];

        // Auditar métodos de modificación
        if (in_array($request->method(), $auditableRoutes)) {
            return true;
        }

        // Auditar endpoints sensibles
        foreach ($sensitiveEndpoints as $endpoint) {
            if (str_starts_with($request->path(), trim($endpoint, '/'))) {
                return true;
            }
        }

        return false;
    }

    /**
     * Registrar evento de auditoría
     */
    private function logAuditEvent(Request $request, Response $response, float $duration): void
    {
        $user = Auth::user();
        
        $auditData = [
            'timestamp' => now()->toISOString(),
            'user_id' => $user ? $user->id : null,
            'user_email' => $user ? $user->email : null,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'method' => $request->method(),
            'url' => $request->fullUrl(),
            'route' => $request->route() ? $request->route()->getName() : null,
            'status_code' => $response->getStatusCode(),
            'duration_ms' => $duration,
            'request_size' => strlen($request->getContent()),
            'response_size' => strlen($response->getContent()),
        ];

        // Agregar datos específicos según el tipo de operación
        if ($request->isMethod('POST') || $request->isMethod('PUT') || $request->isMethod('PATCH')) {
            $auditData['request_data'] = $this->sanitizeRequestData($request->all());
        }

        // Agregar información de errores si es necesario
        if ($response->getStatusCode() >= 400) {
            $auditData['error'] = true;
            $auditData['error_type'] = $this->getErrorType($response->getStatusCode());
        }

        // Log según el nivel de severidad
        if ($response->getStatusCode() >= 500) {
            Log::error('API Error', $auditData);
        } elseif ($response->getStatusCode() >= 400) {
            Log::warning('API Warning', $auditData);
        } else {
            Log::info('API Access', $auditData);
        }

        // Para operaciones críticas, también guardar en base de datos
        if ($this->isCriticalOperation($request)) {
            $this->saveCriticalAudit($auditData);
        }
    }

    /**
     * Sanitizar datos de request para logging
     */
    private function sanitizeRequestData(array $data): array
    {
        $sensitiveFields = [
            'password',
            'password_confirmation',
            'current_password',
            'new_password',
            'token',
            'api_key',
            'secret'
        ];

        foreach ($sensitiveFields as $field) {
            if (isset($data[$field])) {
                $data[$field] = '[REDACTED]';
            }
        }

        return $data;
    }

    /**
     * Obtener tipo de error
     */
    private function getErrorType(int $statusCode): string
    {
        return match (true) {
            $statusCode >= 500 => 'server_error',
            $statusCode >= 400 && $statusCode < 500 => 'client_error',
            default => 'unknown'
        };
    }

    /**
     * Determinar si es una operación crítica
     */
    private function isCriticalOperation(Request $request): bool
    {
        $criticalRoutes = [
            '/api/login',
            '/api/register',
            '/api/usuarios',
            '/api/equipos',
        ];

        $criticalMethods = ['POST', 'PUT', 'DELETE'];

        if (!in_array($request->method(), $criticalMethods)) {
            return false;
        }

        foreach ($criticalRoutes as $route) {
            if (str_starts_with($request->path(), trim($route, '/'))) {
                return true;
            }
        }

        return false;
    }

    /**
     * Guardar auditoría crítica en base de datos
     */
    private function saveCriticalAudit(array $auditData): void
    {
        try {
            // Aquí se podría guardar en una tabla de auditoría
            // Por ahora solo log adicional
            Log::channel('audit')->critical('Critical Operation', $auditData);
        } catch (\Exception $e) {
            // No fallar si no se puede guardar la auditoría
            Log::error('Failed to save critical audit', [
                'error' => $e->getMessage(),
                'audit_data' => $auditData
            ]);
        }
    }
}
