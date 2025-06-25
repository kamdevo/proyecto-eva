<?php

namespace App\Services;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

abstract class BaseService
{
    /**
     * Model instance.
     */
    protected Model $model;

    /**
     * Cache TTL in seconds.
     */
    protected int $cacheTtl = 3600;

    /**
     * Cache prefix for this service.
     */
    protected string $cachePrefix;

    /**
     * Constructor.
     */
    public function __construct()
    {
        $this->model = $this->getModel();
        $this->cachePrefix = strtolower(class_basename($this->model));
    }

    /**
     * Get model instance.
     */
    abstract protected function getModel(): Model;

    /**
     * Get all records with caching.
     */
    public function getAll(array $relations = [], bool $useCache = true): \Illuminate\Database\Eloquent\Collection
    {
        $cacheKey = $this->getCacheKey('all', $relations);

        if (!$useCache) {
            return $this->model->with($relations)->get();
        }

        return Cache::remember($cacheKey, $this->cacheTtl, function () use ($relations) {
            return $this->model->with($relations)->get();
        });
    }

    /**
     * Get paginated records.
     */
    public function getPaginated(int $perPage = 15, array $relations = [], array $filters = [])
    {
        $query = $this->model->with($relations);

        // Apply filters
        foreach ($filters as $field => $value) {
            if ($value !== null && $value !== '') {
                if (is_array($value)) {
                    $query->whereIn($field, $value);
                } else {
                    $query->where($field, $value);
                }
            }
        }

        return $query->paginate($perPage);
    }

    /**
     * Find record by ID with caching.
     */
    public function findById(int $id, array $relations = [], bool $useCache = true): ?Model
    {
        $cacheKey = $this->getCacheKey("find_{$id}", $relations);

        if (!$useCache) {
            return $this->model->with($relations)->find($id);
        }

        return Cache::remember($cacheKey, $this->cacheTtl, function () use ($id, $relations) {
            return $this->model->with($relations)->find($id);
        });
    }

    /**
     * Create new record.
     */
    public function create(array $data): Model
    {
        try {
            DB::beginTransaction();

            $record = $this->model->create($data);

            $this->clearCache();

            DB::commit();

            Log::info("Record created", [
                'model' => get_class($this->model),
                'id' => $record->id,
                'user_id' => auth()->id(),
            ]);

            return $record;

        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error("Failed to create record", [
                'model' => get_class($this->model),
                'data' => $data,
                'error' => $e->getMessage(),
                'user_id' => auth()->id(),
            ]);

            throw $e;
        }
    }

    /**
     * Update record.
     */
    public function update(int $id, array $data): Model
    {
        try {
            DB::beginTransaction();

            $record = $this->model->findOrFail($id);
            $oldData = $record->toArray();
            
            $record->update($data);

            $this->clearCache();

            DB::commit();

            Log::info("Record updated", [
                'model' => get_class($this->model),
                'id' => $id,
                'changes' => array_diff_assoc($data, $oldData),
                'user_id' => auth()->id(),
            ]);

            return $record->fresh();

        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error("Failed to update record", [
                'model' => get_class($this->model),
                'id' => $id,
                'data' => $data,
                'error' => $e->getMessage(),
                'user_id' => auth()->id(),
            ]);

            throw $e;
        }
    }

    /**
     * Delete record.
     */
    public function delete(int $id): bool
    {
        try {
            DB::beginTransaction();

            $record = $this->model->findOrFail($id);
            $deleted = $record->delete();

            $this->clearCache();

            DB::commit();

            Log::info("Record deleted", [
                'model' => get_class($this->model),
                'id' => $id,
                'user_id' => auth()->id(),
            ]);

            return $deleted;

        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error("Failed to delete record", [
                'model' => get_class($this->model),
                'id' => $id,
                'error' => $e->getMessage(),
                'user_id' => auth()->id(),
            ]);

            throw $e;
        }
    }

    /**
     * Search records.
     */
    public function search(string $query, array $fields = [], int $perPage = 15)
    {
        $searchQuery = $this->model->query();

        if (!empty($fields)) {
            $searchQuery->where(function ($q) use ($query, $fields) {
                foreach ($fields as $field) {
                    $q->orWhere($field, 'LIKE', "%{$query}%");
                }
            });
        }

        return $searchQuery->paginate($perPage);
    }

    /**
     * Get records count.
     */
    public function count(array $filters = []): int
    {
        $cacheKey = $this->getCacheKey('count', $filters);

        return Cache::remember($cacheKey, $this->cacheTtl, function () use ($filters) {
            $query = $this->model->query();

            foreach ($filters as $field => $value) {
                if ($value !== null && $value !== '') {
                    $query->where($field, $value);
                }
            }

            return $query->count();
        });
    }

    /**
     * Check if record exists.
     */
    public function exists(int $id): bool
    {
        $cacheKey = $this->getCacheKey("exists_{$id}");

        return Cache::remember($cacheKey, $this->cacheTtl, function () use ($id) {
            return $this->model->where('id', $id)->exists();
        });
    }

    /**
     * Get cache key.
     */
    protected function getCacheKey(string $operation, array $params = []): string
    {
        $key = "{$this->cachePrefix}:{$operation}";
        
        if (!empty($params)) {
            $key .= ':' . md5(serialize($params));
        }

        return $key;
    }

    /**
     * Clear all cache for this service.
     */
    protected function clearCache(): void
    {
        // In a real Redis implementation, you could use pattern-based deletion
        // For now, we'll clear the entire cache
        Cache::flush();
    }

    /**
     * Get fresh data (bypass cache).
     */
    public function fresh(): static
    {
        $this->clearCache();
        return $this;
    }

    /**
     * Bulk create records.
     */
    public function bulkCreate(array $records): bool
    {
        try {
            DB::beginTransaction();

            $this->model->insert($records);

            $this->clearCache();

            DB::commit();

            Log::info("Bulk records created", [
                'model' => get_class($this->model),
                'count' => count($records),
                'user_id' => auth()->id(),
            ]);

            return true;

        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error("Failed to bulk create records", [
                'model' => get_class($this->model),
                'count' => count($records),
                'error' => $e->getMessage(),
                'user_id' => auth()->id(),
            ]);

            throw $e;
        }
    }

    /**
     * Bulk update records.
     */
    public function bulkUpdate(array $updates): bool
    {
        try {
            DB::beginTransaction();

            foreach ($updates as $id => $data) {
                $this->model->where('id', $id)->update($data);
            }

            $this->clearCache();

            DB::commit();

            Log::info("Bulk records updated", [
                'model' => get_class($this->model),
                'count' => count($updates),
                'user_id' => auth()->id(),
            ]);

            return true;

        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error("Failed to bulk update records", [
                'model' => get_class($this->model),
                'count' => count($updates),
                'error' => $e->getMessage(),
                'user_id' => auth()->id(),
            ]);

            throw $e;
        }
    }
}
