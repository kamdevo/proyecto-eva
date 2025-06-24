<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class AdvancedRateLimit
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next, string $maxAttempts = '60', string $decayMinutes = '1'): Response
    {
        $key = $this->resolveRequestSignature($request);
        $maxAttempts = (int) $maxAttempts;
        $decayMinutes = (int) $decayMinutes;

        // Verificar si el usuario ha excedido el límite
        if ($this->tooManyAttempts($key, $maxAttempts)) {
            $this->logSuspiciousActivity($request, $key);
            return $this->buildResponse($key, $maxAttempts, $decayMinutes);
        }

        // Incrementar el contador
        $this->hit($key, $decayMinutes * 60);

        $response = $next($request);

        // Agregar headers de rate limiting
        return $this->addHeaders(
            $response,
            $maxAttempts,
            $this->calculateRemainingAttempts($key, $maxAttempts)
        );
    }

    /**
     * Resolve request signature.
     */
    protected function resolveRequestSignature(Request $request): string
    {
        $userId = $request->user()?->id ?? 'guest';
        $ip = $request->ip();
        $route = $request->route()?->getName() ?? $request->path();
        
        return sha1($userId . '|' . $ip . '|' . $route);
    }

    /**
     * Determine if the given key has been "accessed" too many times.
     */
    protected function tooManyAttempts(string $key, int $maxAttempts): bool
    {
        return Cache::get($key, 0) >= $maxAttempts;
    }

    /**
     * Increment the counter for a given key for a given decay time.
     */
    protected function hit(string $key, int $decaySeconds): int
    {
        return Cache::remember($key, $decaySeconds, function () {
            return 1;
        }) ?: Cache::increment($key);
    }

    /**
     * Calculate the number of remaining attempts.
     */
    protected function calculateRemainingAttempts(string $key, int $maxAttempts): int
    {
        return max(0, $maxAttempts - Cache::get($key, 0));
    }

    /**
     * Create a 'too many attempts' response.
     */
    protected function buildResponse(string $key, int $maxAttempts, int $decayMinutes): Response
    {
        $retryAfter = Cache::get($key . ':timer') ?? $decayMinutes * 60;
        
        return response()->json([
            'error' => 'Too Many Attempts',
            'message' => 'Rate limit exceeded. Try again later.',
            'retry_after' => $retryAfter
        ], 429)->withHeaders([
            'Retry-After' => $retryAfter,
            'X-RateLimit-Limit' => $maxAttempts,
            'X-RateLimit-Remaining' => 0,
        ]);
    }

    /**
     * Add the limit header information to the given response.
     */
    protected function addHeaders(Response $response, int $maxAttempts, int $remainingAttempts): Response
    {
        return $response->withHeaders([
            'X-RateLimit-Limit' => $maxAttempts,
            'X-RateLimit-Remaining' => $remainingAttempts,
        ]);
    }

    /**
     * Log suspicious activity.
     */
    protected function logSuspiciousActivity(Request $request, string $key): void
    {
        Log::channel('security')->warning('Rate limit exceeded', [
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'url' => $request->fullUrl(),
            'user_id' => $request->user()?->id,
            'key' => $key,
            'timestamp' => now()->toISOString(),
        ]);
    }
}
