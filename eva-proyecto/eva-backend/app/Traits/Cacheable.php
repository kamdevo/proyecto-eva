<?php

namespace App\Traits;

use Illuminate\Support\Facades\Cache;

trait Cacheable
{
    /**
     * Boot the cacheable trait for a model.
     */
    public static function bootCacheable(): void
    {
        static::saved(function ($model) {
            $model->clearModelCache();
        });

        static::deleted(function ($model) {
            $model->clearModelCache();
        });
    }

    /**
     * Get cache key for this model.
     */
    public function getCacheKey(string $suffix = ''): string
    {
        $key = strtolower(class_basename($this)) . ':' . $this->getKey();
        
        if ($suffix) {
            $key .= ':' . $suffix;
        }

        return $key;
    }

    /**
     * Get cache key for model collection.
     */
    public static function getCollectionCacheKey(string $suffix = ''): string
    {
        $key = strtolower(class_basename(static::class)) . ':collection';
        
        if ($suffix) {
            $key .= ':' . $suffix;
        }

        return $key;
    }

    /**
     * Cache this model.
     */
    public function cacheModel(int $ttl = 3600): self
    {
        Cache::put($this->getCacheKey(), $this, $ttl);
        return $this;
    }

    /**
     * Get cached model.
     */
    public static function getCached($id, int $ttl = 3600)
    {
        $key = strtolower(class_basename(static::class)) . ':' . $id;
        
        return Cache::remember($key, $ttl, function () use ($id) {
            return static::find($id);
        });
    }

    /**
     * Cache collection.
     */
    public static function cacheCollection(string $key, $collection, int $ttl = 3600)
    {
        $cacheKey = static::getCollectionCacheKey($key);
        Cache::put($cacheKey, $collection, $ttl);
        return $collection;
    }

    /**
     * Get cached collection.
     */
    public static function getCachedCollection(string $key, callable $callback, int $ttl = 3600)
    {
        $cacheKey = static::getCollectionCacheKey($key);
        
        return Cache::remember($cacheKey, $ttl, $callback);
    }

    /**
     * Clear model cache.
     */
    public function clearModelCache(): void
    {
        Cache::forget($this->getCacheKey());
        $this->clearRelatedCache();
    }

    /**
     * Clear all cache for this model type.
     */
    public static function clearAllCache(): void
    {
        $pattern = strtolower(class_basename(static::class)) . ':*';
        
        // This would need Redis for pattern-based deletion
        // For now, we'll clear specific known keys
        Cache::flush();
    }

    /**
     * Clear related cache (override in models as needed).
     */
    protected function clearRelatedCache(): void
    {
        // Override in specific models to clear related cache
    }

    /**
     * Remember query result.
     */
    public function scopeRemember($query, string $key, int $ttl = 3600)
    {
        $cacheKey = static::getCollectionCacheKey($key);
        
        return Cache::remember($cacheKey, $ttl, function () use ($query) {
            return $query->get();
        });
    }
}
