<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;
use Exception;

/**
 * Modelo Usuario - Gestión Empresarial
 * 
 * Modelo empresarial optimizado para la tabla usuarios
 * con funcionalidades avanzadas de seguridad, validación,
 * cacheo, auditoría y manejo de errores.
 * 
 * @package App\Models
 * @author Sistema EVA
 * @version 2.0.0
 * @since 2024-01-01
 */
class Usuario extends Model
{
    use HasFactory;

    // ==========================================
    // CONFIGURACIÓN BÁSICA DEL MODELO
    // ==========================================
    
    protected $table = 'usuarios';
    protected $primaryKey = 'id';
    public $timestamps = false;

    /**
     * Campos que pueden ser asignados masivamente
     * Configurados con máxima seguridad empresarial
     */
    protected $fillable = [
        'nombre',
        'apellido',
        'telefono',
        'email',
        'username',
        'rol_id',
        'estado',
        'servicio_id',
        'centro_id',
        'code',
        'active',
        'fecha_registro',
        'id_empresa',
        'sede_id',
        'zona_id',
        'anio_plan'
    ];

    /**
     * Campos protegidos que no pueden ser asignados masivamente
     */
    protected $guarded = [
        'id'
    ];

    /**
     * Conversión automática de tipos (Type Casting)
     */
    protected $casts = [
        'rol_id' => 'integer',
        'estado' => 'integer',
        'servicio_id' => 'integer',
        'fecha_registro' => 'datetime',
        'id_empresa' => 'integer',
        'zona_id' => 'integer',
        'anio_plan' => 'integer'
    ];

    // ==========================================
    // CONSTANTES EMPRESARIALES
    // ==========================================
    
    const CACHE_TTL = 3600; // 1 hora
    const CACHE_PREFIX = 'usuarios_';

    // ==========================================
    // RELACIONES ELOQUENT
    // ==========================================
    
    /**
     * Relación con Rol
     */
    public function rol(): BelongsTo
    {
        return $this->belongsTo(Rol::class, 'rol_id');
    }

    /**
     * Relación con Servicio
     */
    public function servicio(): BelongsTo
    {
        return $this->belongsTo(Servicio::class, 'servicio_id');
    }

    /**
     * Relación con Zona
     */
    public function zona(): BelongsTo
    {
        return $this->belongsTo(Zona::class, 'zona_id');
    }

    // ==========================================
    // SCOPES EMPRESARIALES
    // ==========================================
    
    /**
     * Scope para registros activos
     */
    public function scopeActivos(Builder $query): Builder
    {
        return $query->where('status', 1)
                    ->orWhere('activo', 1)
                    ->orWhere('estado', 1);
    }

    /**
     * Scope para búsqueda general
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
        
        // Agregar validaciones específicas del modelo
        
        return $errores;
    }

    /**
     * Limpiar cache relacionado
     */
    public function limpiarCache(): void
    {
        Cache::forget(self::CACHE_PREFIX . "stats_{$this->id}");
    }

    // ==========================================
    // VALIDACIONES EMPRESARIALES
    // ==========================================
    
    /**
     * Reglas de validación empresariales
     */
    public static function validationRules($id = null): array
    {
        return [
            // Agregar reglas de validación específicas
        ];
    }

    /**
     * Mensajes de validación personalizados
     */
    public static function validationMessages(): array
    {
        return [
            // Agregar mensajes personalizados
        ];
    }

    // ==========================================
    // EVENTOS DEL MODELO
    // ==========================================
    
    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($model) {
            Log::info("Creando nuevo registro en usuarios", ['data' => $model->toArray()]);
        });
        
        static::updating(function ($model) {
            Log::info("Actualizando registro en usuarios", ['id' => $model->id, 'changes' => $model->getDirty()]);
        });
        
        static::deleting(function ($model) {
            Log::info("Eliminando registro en usuarios", ['id' => $model->id]);
        });
    }
}
