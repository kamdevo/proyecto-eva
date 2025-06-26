<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;
use Exception;

/**
 * Modelo AuditoriaLog - Gestión Empresarial
 * 
 * Modelo empresarial optimizado para la gestión de auditoria_logs
 * con funcionalidades avanzadas de seguridad, validación,
 * cacheo, auditoría y manejo de errores empresariales.
 * 
 * @package App\Models
 * @author Sistema EVA
 * @version 2.0.0
 * @since 2024-01-01
 */
class AuditoriaLog extends Model
{
    use HasFactory;

    protected $table = 'auditoria_logs';
    protected $primaryKey = 'id';
    public $timestamps = true;

    protected $fillable = [
        'name', 'nombre', 'descripcion', 'codigo', 'activo', 'estado',
        'tipo', 'valor', 'fecha', 'observaciones', 'usuario_id'
    ];

    protected $guarded = ['id', 'created_at', 'updated_at'];

    protected $casts = [
        'id' => 'integer',
        'activo' => 'boolean',
        'estado' => 'boolean',
        'fecha' => 'date',
        'valor' => 'decimal:2',
        'usuario_id' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    const CACHE_TTL = 3600;
    const CACHE_PREFIX = 'auditoria_logs_';

    // Relaciones
    public function usuario(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'usuario_id');
    }

    // Scopes
    public function scopeActivos(Builder $query): Builder
    {
        return $query->where('activo', true);
    }

    public function scopeBuscar(Builder $query, string $termino): Builder
    {
        return $query->where(function($q) use ($termino) {
            $q->where('name', 'LIKE', "%{$termino}%")
              ->orWhere('nombre', 'LIKE', "%{$termino}%")
              ->orWhere('descripcion', 'LIKE', "%{$termino}%");
        });
    }

    // Métodos empresariales
    public function obtenerEstadisticas(): array
    {
        return Cache::remember(
            self::CACHE_PREFIX . "stats_{$this->id}",
            self::CACHE_TTL,
            function () {
                return [
                    'id' => $this->id,
                    'nombre' => $this->name ?? $this->nombre,
                    'descripcion' => $this->descripcion,
                    'activo' => $this->activo ?? $this->estado,
                    'created_at' => $this->created_at,
                    'updated_at' => $this->updated_at
                ];
            }
        );
    }

    public function validarIntegridad(): array
    {
        $errores = [];
        if (empty($this->name) && empty($this->nombre)) {
            $errores[] = 'El nombre es requerido';
        }
        return $errores;
    }

    public function limpiarCache(): void
    {
        Cache::forget(self::CACHE_PREFIX . "stats_{$this->id}");
        Cache::forget(self::CACHE_PREFIX . "list");
    }

    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($model) {
            Log::info("Creando registro en auditoria_logs", ['data' => $model->toArray()]);
        });
        
        static::updating(function ($model) {
            $model->limpiarCache();
            Log::info("Actualizando registro en auditoria_logs", ['id' => $model->id, 'cambios' => $model->getDirty()]);
        });
        
        static::deleting(function ($model) {
            $model->limpiarCache();
            Log::warning("Eliminando registro en auditoria_logs", ['id' => $model->id]);
        });
    }
}
