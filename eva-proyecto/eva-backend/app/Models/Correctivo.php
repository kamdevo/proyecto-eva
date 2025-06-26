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
 * Modelo Correctivo - Gestión Empresarial
 * 
 * Modelo empresarial optimizado para la gestión de correctivos
 * con funcionalidades avanzadas de seguridad, validación,
 * cacheo, auditoría y manejo de errores empresariales.
 * 
 * @package App\Models
 * @author Sistema EVA
 * @version 2.0.0
 * @since 2024-01-01
 */
class Correctivo extends Model
{
    use HasFactory;

    // ==========================================
    // CONFIGURACIÓN BÁSICA DEL MODELO
    // ==========================================
    
    protected $table = 'correctivos';
    protected $primaryKey = 'id';
    public $timestamps = true;

    /**
     * Campos que pueden ser asignados masivamente
     */
    protected $fillable = [
        'name',
        'nombre',
        'descripcion',
        'codigo',
        'activo',
        'estado',
        'tipo',
        'valor',
        'fecha',
        'observaciones',
        'usuario_id'
    ];

    /**
     * Campos protegidos
     */
    protected $guarded = [
        'id',
        'created_at',
        'updated_at'
    ];

    /**
     * Conversión automática de tipos
     */
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

    // ==========================================
    // CONSTANTES EMPRESARIALES
    // ==========================================
    
    const CACHE_TTL = 3600;
    const CACHE_PREFIX = 'correctivos_';
    
    const ESTADO_ACTIVO = 'activo';
    const ESTADO_INACTIVO = 'inactivo';

    // ==========================================
    // RELACIONES ELOQUENT
    // ==========================================
    
    /**
     * Relación con usuario
     */
    public function usuario(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'usuario_id');
    }

    // ==========================================
    // SCOPES EMPRESARIALES
    // ==========================================
    
    /**
     * Scope para registros activos
     */
    public function scopeActivos(Builder $query): Builder
    {
        return $query->where('activo', true);
    }

    /**
     * Scope para búsqueda
     */
    public function scopeBuscar(Builder $query, string $termino): Builder
    {
        return $query->where(function($q) use ($termino) {
            $q->where('name', 'LIKE', "%{$termino}%")
              ->orWhere('nombre', 'LIKE', "%{$termino}%")
              ->orWhere('descripcion', 'LIKE', "%{$termino}%");
        });
    }

    // ==========================================
    // MÉTODOS DE NEGOCIO EMPRESARIALES
    // ==========================================
    
    /**
     * Obtener estadísticas del modelo
     */
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

    /**
     * Validar integridad de datos
     */
    public function validarIntegridad(): array
    {
        $errores = [];
        
        if (empty($this->name) && empty($this->nombre)) {
            $errores[] = 'El nombre es requerido';
        }
        
        return $errores;
    }

    /**
     * Limpiar cache relacionado
     */
    public function limpiarCache(): void
    {
        Cache::forget(self::CACHE_PREFIX . "stats_{$this->id}");
        Cache::forget(self::CACHE_PREFIX . "list");
    }

    // ==========================================
    // EVENTOS DEL MODELO
    // ==========================================
    
    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($model) {
            Log::info("Creando nuevo registro en correctivos", [
                'modelo' => get_class($model),
                'data' => $model->toArray()
            ]);
        });
        
        static::updating(function ($model) {
            $model->limpiarCache();
            
            Log::info("Actualizando registro en correctivos", [
                'id' => $model->id,
                'cambios' => $model->getDirty()
            ]);
        });
        
        static::deleting(function ($model) {
            $model->limpiarCache();
            
            Log::warning("Eliminando registro en correctivos", [
                'id' => $model->id,
                'data' => $model->toArray()
            ]);
        });
    }
}
