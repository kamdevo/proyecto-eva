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
 * Modelo Servicio2 - Gestión Empresarial Optimizada
 * 
 * Modelo empresarial optimizado para la tabla servicio2s
 * con funcionalidades avanzadas de seguridad, validación,
 * cacheo, auditoría y manejo de errores empresariales.
 * 
 * Características implementadas:
 * - Validaciones robustas de negocio
 * - Sistema de cacheo inteligente
 * - Scopes empresariales para consultas optimizadas
 * - Métodos de utilidad específicos del dominio
 * - Auditoría completa de operaciones
 * - Manejo de errores empresarial
 * - Constantes para valores enum y estados
 * - Relaciones Eloquent optimizadas
 * - Accessors y mutators empresariales
 * - Eventos del modelo para trazabilidad
 * 
 * @package App\Models
 * @author Sistema EVA
 * @version 2.0.0
 * @since 2024-01-01
 */
class Servicio2 extends Model
{
    use HasFactory;

    // ==========================================
    // CONFIGURACIÓN BÁSICA DEL MODELO
    // ==========================================
    
    protected $table = 'servicio2s';
    protected $primaryKey = 'id';
    public $timestamps = true;

    /**
     * Campos que pueden ser asignados masivamente
     * Configurados con máxima seguridad empresarial
     */
    protected $fillable = [
        'name',
        'nombre',
        'title',
        'descripcion',
        'description',
        'codigo',
        'code',
        'activo',
        'estado',
        'status',
        'tipo',
        'categoria',
        'valor',
        'fecha',
        'observaciones',
        'notas',
        'usuario_id',
        'equipo_id',
        'servicio_id',
        'area_id'
    ];

    /**
     * Campos protegidos que no pueden ser asignados masivamente
     */
    protected $guarded = [
        'id',
        'created_at',
        'updated_at'
    ];

    /**
     * Conversión automática de tipos (Type Casting)
     */
    protected $casts = [
        'id' => 'integer',
        'activo' => 'boolean',
        'estado' => 'boolean',
        'status' => 'boolean',
        'fecha' => 'date',
        'valor' => 'decimal:2',
        'usuario_id' => 'integer',
        'equipo_id' => 'integer',
        'servicio_id' => 'integer',
        'area_id' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    // ==========================================
    // CONSTANTES EMPRESARIALES
    // ==========================================
    
    const CACHE_TTL = 3600; // 1 hora
    const CACHE_PREFIX = 'servicio2s_';
    
    const ESTADO_ACTIVO = 'activo';
    const ESTADO_INACTIVO = 'inactivo';
    const ESTADO_PENDIENTE = 'pendiente';
    const ESTADO_COMPLETADO = 'completado';
    const ESTADO_CANCELADO = 'cancelado';
    const ESTADO_EN_PROCESO = 'en_proceso';

    const TIPO_PRINCIPAL = 'principal';
    const TIPO_SECUNDARIO = 'secundario';
    const TIPO_TEMPORAL = 'temporal';
    const TIPO_PERMANENTE = 'permanente';

    /**
     * Obtener estados válidos
     */
    public static function getEstadosValidos(): array
    {
        return [
            self::ESTADO_ACTIVO,
            self::ESTADO_INACTIVO,
            self::ESTADO_PENDIENTE,
            self::ESTADO_COMPLETADO,
            self::ESTADO_CANCELADO,
            self::ESTADO_EN_PROCESO
        ];
    }

    /**
     * Obtener tipos válidos
     */
    public static function getTiposValidos(): array
    {
        return [
            self::TIPO_PRINCIPAL,
            self::TIPO_SECUNDARIO,
            self::TIPO_TEMPORAL,
            self::TIPO_PERMANENTE
        ];
    }

    // ==========================================
    // RELACIONES ELOQUENT EMPRESARIALES
    // ==========================================
    
    /**
     * Relación con usuario
     */
    public function usuario(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'usuario_id');
    }

    /**
     * Relación con equipo
     */
    public function equipo(): BelongsTo
    {
        return $this->belongsTo(Equipo::class, 'equipo_id');
    }

    /**
     * Relación con servicio
     */
    public function servicio(): BelongsTo
    {
        return $this->belongsTo(Servicio::class, 'servicio_id');
    }

    /**
     * Relación con área
     */
    public function area(): BelongsTo
    {
        return $this->belongsTo(Area::class, 'area_id');
    }

    // ==========================================
    // SCOPES EMPRESARIALES
    // ==========================================
    
    /**
     * Scope para registros activos
     */
    public function scopeActivos(Builder $query): Builder
    {
        return $query->where(function($q) {
            $q->where('activo', true)
              ->orWhere('estado', 'activo')
              ->orWhere('status', 'activo')
              ->orWhere('estado', 1)
              ->orWhere('activo', 1);
        });
    }

    /**
     * Scope para registros inactivos
     */
    public function scopeInactivos(Builder $query): Builder
    {
        return $query->where(function($q) {
            $q->where('activo', false)
              ->orWhere('estado', 'inactivo')
              ->orWhere('status', 'inactivo')
              ->orWhere('estado', 0)
              ->orWhere('activo', 0);
        });
    }

    /**
     * Scope para búsqueda general
     */
    public function scopeBuscar(Builder $query, string $termino): Builder
    {
        return $query->where(function($q) use ($termino) {
            $q->where('name', 'LIKE', "%{$termino}%")
              ->orWhere('nombre', 'LIKE', "%{$termino}%")
              ->orWhere('descripcion', 'LIKE', "%{$termino}%")
              ->orWhere('codigo', 'LIKE', "%{$termino}%")
              ->orWhere('title', 'LIKE', "%{$termino}%");
        });
    }

    /**
     * Scope para registros recientes (últimos 30 días)
     */
    public function scopeRecientes(Builder $query): Builder
    {
        return $query->where('created_at', '>=', now()->subDays(30));
    }

    /**
     * Scope para registros por tipo
     */
    public function scopePorTipo(Builder $query, string $tipo): Builder
    {
        return $query->where('tipo', $tipo);
    }

    /**
     * Scope para registros ordenados por nombre
     */
    public function scopeOrdenadosPorNombre(Builder $query): Builder
    {
        return $query->orderBy('name')->orOrderBy('nombre')->orOrderBy('title');
    }

    // ==========================================
    // ACCESSORS Y MUTATORS EMPRESARIALES
    // ==========================================
    
    /**
     * Accessor para obtener el nombre principal
     */
    public function getNombrePrincipalAttribute(): string
    {
        return $this->name ?? $this->nombre ?? $this->title ?? 'Sin nombre';
    }

    /**
     * Accessor para verificar si está activo
     */
    public function getEsActivoAttribute(): bool
    {
        return $this->activo ?? $this->estado ?? $this->status ?? false;
    }

    /**
     * Mutator para el código (siempre en mayúsculas)
     */
    public function setCodigoAttribute($value): void
    {
        $this->attributes['codigo'] = strtoupper(trim($value));
    }

    /**
     * Mutator para el nombre (formato título)
     */
    public function setNameAttribute($value): void
    {
        $this->attributes['name'] = ucwords(strtolower(trim($value)));
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
                    'nombre' => $this->nombre_principal,
                    'descripcion' => $this->descripcion ?? $this->description ?? null,
                    'estado' => $this->es_activo,
                    'tipo' => $this->tipo ?? null,
                    'codigo' => $this->codigo ?? $this->code ?? null,
                    'created_at' => $this->created_at,
                    'updated_at' => $this->updated_at,
                    'dias_desde_creacion' => $this->created_at ? $this->created_at->diffInDays(now()) : null,
                    'ultima_actualizacion' => $this->updated_at ? $this->updated_at->diffForHumans() : null
                ];
            }
        );
    }

    /**
     * Validar integridad de datos empresariales
     */
    public function validarIntegridad(): array
    {
        $errores = [];
        
        // Validar campos requeridos básicos
        if (empty($this->name) && empty($this->nombre) && empty($this->title)) {
            $errores[] = 'El nombre es requerido';
        }
        
        // Validar longitud de campos
        if (($this->name && strlen($this->name) > 255) || 
            ($this->nombre && strlen($this->nombre) > 255) ||
            ($this->title && strlen($this->title) > 255)) {
            $errores[] = 'El nombre no puede exceder 255 caracteres';
        }
        
        // Validar descripción
        if ($this->descripcion && strlen($this->descripcion) > 1000) {
            $errores[] = 'La descripción no puede exceder 1000 caracteres';
        }
        
        // Validar estado
        if ($this->estado && !in_array($this->estado, self::getEstadosValidos())) {
            $errores[] = 'El estado no es válido';
        }
        
        // Validar tipo
        if ($this->tipo && !in_array($this->tipo, self::getTiposValidos())) {
            $errores[] = 'El tipo no es válido';
        }
        
        // Validar fechas
        if ($this->created_at && $this->updated_at && $this->created_at > $this->updated_at) {
            $errores[] = 'La fecha de creación no puede ser posterior a la fecha de actualización';
        }
        
        return $errores;
    }

    /**
     * Limpiar cache relacionado con el modelo
     */
    public function limpiarCache(): void
    {
        Cache::forget(self::CACHE_PREFIX . "stats_{$this->id}");
        Cache::forget(self::CACHE_PREFIX . "list");
        Cache::forget(self::CACHE_PREFIX . "activos");
        Cache::forget(self::CACHE_PREFIX . "inactivos");
    }

    /**
     * Cambiar estado del registro
     */
    public function cambiarEstado(string $nuevoEstado, string $motivo = null): bool
    {
        if (!in_array($nuevoEstado, self::getEstadosValidos())) {
            return false;
        }

        $estadoAnterior = $this->estado ?? $this->activo ?? $this->status;
        
        // Actualizar según el campo disponible
        if ($this->hasAttribute('estado')) {
            $this->estado = $nuevoEstado;
        } elseif ($this->hasAttribute('activo')) {
            $this->activo = in_array($nuevoEstado, [self::ESTADO_ACTIVO, 'activo', '1', 1, true]);
        } elseif ($this->hasAttribute('status')) {
            $this->status = $nuevoEstado;
        }

        $resultado = $this->save();
        
        if ($resultado) {
            Log::info("Estado cambiado en modelo Servicio2", [
                'id' => $this->id,
                'estado_anterior' => $estadoAnterior,
                'nuevo_estado' => $nuevoEstado,
                'motivo' => $motivo,
                'timestamp' => now()
            ]);
            
            $this->limpiarCache();
        }

        return $resultado;
    }

    /**
     * Generar código único automático
     */
    public static function generarCodigo(string $prefijo = null): string
    {
        $prefijo = $prefijo ?? strtoupper(substr('Servicio2', 0, 3));
        $ultimo = static::where('codigo', 'LIKE', $prefijo . '%')
                        ->orderBy('codigo', 'desc')
                        ->first();
        
        if ($ultimo && preg_match('/(\d+)$/', $ultimo->codigo, $matches)) {
            $numero = intval($matches[1]) + 1;
        } else {
            $numero = 1;
        }
        
        return $prefijo . str_pad($numero, 4, '0', STR_PAD_LEFT);
    }

    /**
     * Obtener resumen ejecutivo del modelo
     */
    public function getResumenEjecutivo(): array
    {
        return [
            'identificacion' => [
                'id' => $this->id,
                'nombre' => $this->nombre_principal,
                'codigo' => $this->codigo ?? $this->code ?? null,
                'descripcion' => $this->descripcion ?? $this->description ?? null
            ],
            'estado' => [
                'activo' => $this->es_activo,
                'tipo' => $this->tipo ?? null,
                'fecha_creacion' => $this->created_at,
                'ultima_actualizacion' => $this->updated_at,
                'dias_activo' => $this->created_at ? $this->created_at->diffInDays(now()) : null
            ],
            'validacion' => [
                'errores_integridad' => $this->validarIntegridad(),
                'es_valido' => empty($this->validarIntegridad())
            ],
            'metadatos' => [
                'modelo' => get_class($this),
                'tabla' => $this->getTable(),
                'clave_primaria' => $this->getKeyName(),
                'timestamps' => $this->timestamps
            ]
        ];
    }

    // ==========================================
    // EVENTOS DEL MODELO
    // ==========================================
    
    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($model) {
            // Generar código automático si no existe
            if ($model->hasAttribute('codigo') && empty($model->codigo)) {
                $model->codigo = self::generarCodigo();
            }
            
            Log::info("Creando nuevo registro en servicio2s", [
                'modelo' => get_class($model),
                'data' => $model->toArray()
            ]);
        });
        
        static::updating(function ($model) {
            Log::info("Actualizando registro en servicio2s", [
                'id' => $model->id,
                'modelo' => get_class($model),
                'cambios' => $model->getDirty()
            ]);
            
            $model->limpiarCache();
        });
        
        static::deleting(function ($model) {
            Log::warning("Eliminando registro en servicio2s", [
                'id' => $model->id,
                'modelo' => get_class($model),
                'data' => $model->toArray()
            ]);
            
            $model->limpiarCache();
        });
    }
}
