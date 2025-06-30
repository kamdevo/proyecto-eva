<?php

namespace App\Http\Controllers;

use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Illuminate\Validation\ValidationException;

abstract class BaseController extends Controller
{
    use AuthorizesRequests, ValidatesRequests;

    /**
     * Default pagination size.
     */
    protected int $defaultPerPage = 15;

    /**
     * Maximum pagination size.
     */
    protected int $maxPerPage = 100;

    /**
     * Cache TTL in seconds.
     */
    protected int $cacheTtl = 3600;

    /**
     * Return success response.
     */
    protected function successResponse($data = null, string $message = 'Success', int $code = 200): JsonResponse
    {
        $response = [
            'success' => true,
            'message' => $message,
            'timestamp' => now()->toISOString(),
        ];

        if ($data !== null) {
            $response['data'] = $data;
        }

        return response()->json($response, $code);
    }

    /**
     * Return error response.
     */
    protected function errorResponse(string $message = 'Error', int $code = 400, $errors = null): JsonResponse
    {
        $response = [
            'success' => false,
            'message' => $message,
            'timestamp' => now()->toISOString(),
        ];

        if ($errors !== null) {
            $response['errors'] = $errors;
        }

        // Log error for debugging
        Log::channel('audit')->error('API Error Response', [
            'message' => $message,
            'code' => $code,
            'errors' => $errors,
            'url' => request()->fullUrl(),
            'user_id' => auth()->id(),
        ]);

        return response()->json($response, $code);
    }

    /**
     * Return validation error response.
     */
    protected function validationErrorResponse(ValidationException $exception): JsonResponse
    {
        return $this->errorResponse(
            'Validation failed',
            422,
            $exception->errors()
        );
    }

    /**
     * Return paginated response.
     */
    protected function paginatedResponse($paginator, string $message = 'Data retrieved successfully'): JsonResponse
    {
        return $this->successResponse([
            'items' => $paginator->items(),
            'pagination' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'from' => $paginator->firstItem(),
                'to' => $paginator->lastItem(),
                'has_more_pages' => $paginator->hasMorePages(),
            ],
        ], $message);
    }

    /**
     * Get pagination parameters from request.
     */
    protected function getPaginationParams(Request $request): array
    {
        $perPage = min(
            (int) $request->get('per_page', $this->defaultPerPage),
            $this->maxPerPage
        );

        $page = max(1, (int) $request->get('page', 1));

        return compact('perPage', 'page');
    }

    /**
     * Get search parameters from request.
     */
    protected function getSearchParams(Request $request): array
    {
        return [
            'search' => $request->get('search'),
            'sort_by' => $request->get('sort_by', 'id'),
            'sort_direction' => $request->get('sort_direction', 'desc'),
            'filters' => $request->get('filters', []),
        ];
    }

    /**
     * Apply search and filters to query.
     */
    protected function applySearchAndFilters($query, array $searchParams, array $searchableFields = [])
    {
        // Apply search
        if (!empty($searchParams['search']) && !empty($searchableFields)) {
            $search = $searchParams['search'];
            $query->where(function ($q) use ($search, $searchableFields) {
                foreach ($searchableFields as $field) {
                    $q->orWhere($field, 'LIKE', "%{$search}%");
                }
            });
        }

        // Apply filters
        if (!empty($searchParams['filters'])) {
            foreach ($searchParams['filters'] as $field => $value) {
                if ($value !== null && $value !== '') {
                    if (is_array($value)) {
                        $query->whereIn($field, $value);
                    } else {
                        $query->where($field, $value);
                    }
                }
            }
        }

        // Apply sorting
        $sortBy = $searchParams['sort_by'] ?? 'id';
        $sortDirection = in_array($searchParams['sort_direction'] ?? 'desc', ['asc', 'desc']) 
            ? $searchParams['sort_direction'] 
            : 'desc';

        $query->orderBy($sortBy, $sortDirection);

        return $query;
    }

    /**
     * Cache response data.
     */
    protected function cacheResponse(string $key, callable $callback, int $ttl = null)
    {
        $ttl = $ttl ?? $this->cacheTtl;
        
        return Cache::remember($key, $ttl, $callback);
    }

    /**
     * Clear cache by pattern.
     */
    protected function clearCache(string $pattern): void
    {
        // For Redis, you could use pattern-based deletion
        // For now, we'll clear specific keys
        Cache::flush();
    }

    /**
     * Log controller action.
     */
    protected function logAction(string $action, array $data = []): void
    {
        Log::channel('audit')->info("Controller Action: {$action}", array_merge([
            'controller' => static::class,
            'user_id' => auth()->id(),
            'ip' => request()->ip(),
            'timestamp' => now()->toISOString(),
        ], $data));
    }

    /**
     * Validate request data.
     */
    protected function validateRequest(Request $request, array $rules, array $messages = []): array
    {
        try {
            return $request->validate($rules, $messages);
        } catch (ValidationException $e) {
            throw $e;
        }
    }

    /**
     * Check if user can perform action.
     */
    protected function checkPermission(string $permission): bool
    {
        $user = auth()->user();
        
        if (!$user) {
            return false;
        }

        // Implement your permission logic here
        // For now, return true for authenticated users
        return true;
    }

    /**
     * Handle exceptions consistently.
     */
    protected function handleException(\Exception $e, string $defaultMessage = 'An error occurred'): JsonResponse
    {
        Log::error('Controller Exception', [
            'exception' => $e->getMessage(),
            'file' => $e->getFile(),
            'line' => $e->getLine(),
            'trace' => $e->getTraceAsString(),
            'controller' => static::class,
            'user_id' => auth()->id(),
        ]);

        if ($e instanceof ValidationException) {
            return $this->validationErrorResponse($e);
        }

        $message = app()->environment('production') ? $defaultMessage : $e->getMessage();
        
        return $this->errorResponse($message, 500);
    }
}
