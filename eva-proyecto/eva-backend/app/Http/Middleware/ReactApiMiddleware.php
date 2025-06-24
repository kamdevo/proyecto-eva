<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

/**
 * Middleware específico para requests de React
 * Maneja configuraciones especiales para la integración React-Laravel
 */
class ReactApiMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Verificar que el request viene de React
        $this->validateReactRequest($request);

        // Agregar headers específicos para React
        $this->addReactHeaders($request);

        // Log del request si está habilitado
        $this->logRequest($request);

        $response = $next($request);

        // Procesar respuesta para React
        $response = $this->processReactResponse($response);

        // Log de la respuesta si está habilitado
        $this->logResponse($response);

        return $response;
    }

    /**
     * Validar que el request viene de React
     */
    private function validateReactRequest(Request $request): void
    {
        // Verificar User-Agent si es necesario
        $userAgent = $request->header('User-Agent', '');
        
        // Verificar origen permitido
        $origin = $request->header('Origin');
        $allowedOrigins = config('react.cors.allowed_origins', []);
        
        if ($origin && !in_array($origin, $allowedOrigins) && !$this->isLocalhost($origin)) {
            // Log de origen no permitido
            Log::warning('Request from unauthorized origin', [
                'origin' => $origin,
                'ip' => $request->ip(),
                'user_agent' => $userAgent
            ]);
        }
    }

    /**
     * Agregar headers específicos para React
     */
    private function addReactHeaders(Request $request): void
    {
        // Agregar información del servidor
        $request->headers->set('X-API-Version', '2.0');
        $request->headers->set('X-Server-Time', now()->toISOString());
        $request->headers->set('X-Request-ID', uniqid());
        
        // Agregar información de configuración
        $request->headers->set('X-Max-Upload-Size', config('react.file_uploads.max_size'));
        $request->headers->set('X-Timezone', config('react.api_responses.timezone'));
    }

    /**
     * Procesar respuesta para React
     */
    private function processReactResponse(Response $response): Response
    {
        // Solo procesar respuestas JSON
        if (!$this->isJsonResponse($response)) {
            return $response;
        }

        $content = json_decode($response->getContent(), true);
        
        if (json_last_error() === JSON_ERROR_NONE && is_array($content)) {
            // Agregar metadatos si está habilitado
            if (config('react.api_responses.include_metadata', true)) {
                $content = $this->addMetadata($content);
            }

            // Formatear fechas según configuración
            $content = $this->formatDates($content);

            // Actualizar contenido de la respuesta
            $response->setContent(json_encode($content));
        }

        // Agregar headers de respuesta para React
        $response->headers->set('X-Response-Time', microtime(true) - LARAVEL_START);
        $response->headers->set('X-Memory-Usage', memory_get_peak_usage(true));
        
        return $response;
    }

    /**
     * Verificar si es una respuesta JSON
     */
    private function isJsonResponse(Response $response): bool
    {
        $contentType = $response->headers->get('Content-Type', '');
        return str_contains($contentType, 'application/json');
    }

    /**
     * Agregar metadatos a la respuesta
     */
    private function addMetadata(array $content): array
    {
        if (!isset($content['metadata'])) {
            $content['metadata'] = [];
        }

        $content['metadata'] = array_merge($content['metadata'], [
            'api_version' => '2.0',
            'server_time' => now()->toISOString(),
            'request_id' => request()->header('X-Request-ID'),
            'user_id' => auth()->id(),
            'locale' => app()->getLocale(),
            'timezone' => config('react.api_responses.timezone'),
            'environment' => app()->environment(),
        ]);

        return $content;
    }

    /**
     * Formatear fechas en la respuesta
     */
    private function formatDates(array $content): array
    {
        $dateFormat = config('react.api_responses.date_format', 'Y-m-d H:i:s');
        
        return $this->recursiveFormatDates($content, $dateFormat);
    }

    /**
     * Formatear fechas recursivamente
     */
    private function recursiveFormatDates(array $data, string $format): array
    {
        foreach ($data as $key => $value) {
            if (is_array($value)) {
                $data[$key] = $this->recursiveFormatDates($value, $format);
            } elseif (is_string($value) && $this->isDateString($value)) {
                try {
                    $date = new \DateTime($value);
                    $data[$key] = $date->format($format);
                } catch (\Exception $e) {
                    // Mantener valor original si no se puede parsear
                }
            }
        }

        return $data;
    }

    /**
     * Verificar si una cadena es una fecha
     */
    private function isDateString(string $value): bool
    {
        // Patrones comunes de fecha
        $patterns = [
            '/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/', // ISO 8601
            '/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/', // MySQL datetime
            '/^\d{4}-\d{2}-\d{2}$/', // Date only
        ];

        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $value)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Verificar si es localhost
     */
    private function isLocalhost(string $origin): bool
    {
        $localhostPatterns = [
            'http://localhost',
            'http://127.0.0.1',
            'https://localhost',
            'https://127.0.0.1',
        ];

        foreach ($localhostPatterns as $pattern) {
            if (str_starts_with($origin, $pattern)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Log del request
     */
    private function logRequest(Request $request): void
    {
        if (config('react.logging.log_requests', false)) {
            Log::info('React API Request', [
                'method' => $request->method(),
                'url' => $request->fullUrl(),
                'ip' => $request->ip(),
                'user_agent' => $request->header('User-Agent'),
                'user_id' => auth()->id(),
                'timestamp' => now()->toISOString(),
            ]);
        }
    }

    /**
     * Log de la respuesta
     */
    private function logResponse(Response $response): void
    {
        if (config('react.logging.log_responses', false)) {
            Log::info('React API Response', [
                'status_code' => $response->getStatusCode(),
                'content_length' => strlen($response->getContent()),
                'response_time' => microtime(true) - LARAVEL_START,
                'memory_usage' => memory_get_peak_usage(true),
                'timestamp' => now()->toISOString(),
            ]);
        }
    }
}
