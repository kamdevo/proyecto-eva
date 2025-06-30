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
 * Modelo CorrectivoGeneral - Gestión Empresarial
 * 
 * Modelo empresarial optimizado para la tabla correctivos_generales
 * con funcionalidades avanzadas de seguridad, validación,
 * cacheo, auditoría y manejo de errores.
 * 
 * @package App\Models
 * @author Sistema EVA
 * @version 2.0.0
 * @since 2024-01-01
 */
class CorrectivoGeneral extends Model
{
    use HasFactory;

    // ==========================================
    // CONFIGURACIÓN BÁSICA DEL MODELO
    // ==========================================
    
    protected $table = 'correctivos_generales';
    protected $primaryKey = 'id';
    public $timestamps = true;

    /**
     * Campos que pueden ser asignados masivamente
     * Configurados con máxima seguridad empresarial
     */
    protected $fillable = [
        'status',
        'equipo_id',
        'file',
        'file_orden',
        'orden',
        'fecha_inicio',
        'code_orden',
        'diagnostico',
        'code_diagnostico',
        'fecha_diagnostico',
        'description',
        'code',
        'fecha_mantenimiento',
        'repuesto_pendiente',
        'repuesto_id',
        'cierre_id',
        'tipo_falla_id'
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
        'created_at' => 'datetime',
        'status' => 'integer',
        'equipo_id' => 'integer',
        'cierre_id' => 'integer',
        'tipo_falla_id' => 'integer'
    ];

    // ==========================================
    // CONSTANTES EMPRESARIALES
    // ==========================================
    
    const CACHE_TTL = 3600; // 1 hora
    const CACHE_PREFIX = 'correctivos_generales_';

    // ==========================================
    // RELACIONES ELOQUENT
    // ==========================================
    
    /**
     * Relación con Equipo
     */
    public function equipo(): BelongsTo
    {
        return $this->belongsTo(Equipo::class, 'equipo_id');
    }

    /**
     * Relación con Cierre
     */
    public function cierre(): BelongsTo
    {
        return $this->belongsTo(Cierre::class, 'cierre_id');
    }

    /**
     * Relación con TipoFalla
     */
    public function tipoFalla(): BelongsTo
    {
        return $this->belongsTo(TipoFalla::class, 'tipo_falla_id');
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
                    'equipo_id' => $this->equipo_id,
                    'tipo_correctivo' => $this->tipo_correctivo,
                    'prioridad' => $this->prioridad,
                    'estado' => $this->estado,
                    'fecha_inicio' => $this->fecha_inicio,
                    'fecha_fin' => $this->fecha_fin,
                    'costo_total' => $this->costo_total,
                    'tiempo_resolucion_horas' => $this->tiempo_resolucion_horas,
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

        // Validar que existe el equipo asociado
        if ($this->equipo_id && !$this->equipo) {
            $errores[] = 'El equipo asociado no existe';
        }

        // Validar fechas lógicas
        if ($this->fecha_inicio && $this->fecha_fin) {
            if ($this->fecha_fin < $this->fecha_inicio) {
                $errores[] = 'La fecha de fin no puede ser anterior a la fecha de inicio';
            }
        }

        // Validar estado
        if (!in_array($this->estado, self::getEstadosValidos())) {
            $errores[] = 'Estado del correctivo no válido';
        }

        // Validar prioridad
        if (!in_array($this->prioridad, self::getPrioridadesValidas())) {
            $errores[] = 'Prioridad del correctivo no válida';
        }

        // Validar costo
        if ($this->costo_total && $this->costo_total < 0) {
            $errores[] = 'El costo total no puede ser negativo';
        }

        return $errores;
    }

    /**
     * Limpiar cache relacionado
     */
    public function limpiarCache(): void
    {
        Cache::forget(self::CACHE_PREFIX . "stats_{$this->id}");
        Cache::forget(self::CACHE_PREFIX . "equipo_{$this->equipo_id}");
    }

    // ==========================================
    // CONSTANTES EMPRESARIALES
    // ==========================================

    const ESTADO_PENDIENTE = 'pendiente';
    const ESTADO_EN_PROCESO = 'en_proceso';
    const ESTADO_COMPLETADO = 'completado';
    const ESTADO_CANCELADO = 'cancelado';
    const ESTADO_PAUSADO = 'pausado';

    const PRIORIDAD_BAJA = 'baja';
    const PRIORIDAD_MEDIA = 'media';
    const PRIORIDAD_ALTA = 'alta';
    const PRIORIDAD_CRITICA = 'critica';
    const PRIORIDAD_EMERGENCIA = 'emergencia';

    const TIPO_PREVENTIVO = 'preventivo';
    const TIPO_CORRECTIVO = 'correctivo';
    const TIPO_PREDICTIVO = 'predictivo';
    const TIPO_EMERGENCIA = 'emergencia';

    /**
     * Obtener estados válidos
     */
    public static function getEstadosValidos(): array
    {
        return [
            self::ESTADO_PENDIENTE,
            self::ESTADO_EN_PROCESO,
            self::ESTADO_COMPLETADO,
            self::ESTADO_CANCELADO,
            self::ESTADO_PAUSADO
        ];
    }

    /**
     * Obtener prioridades válidas
     */
    public static function getPrioridadesValidas(): array
    {
        return [
            self::PRIORIDAD_BAJA,
            self::PRIORIDAD_MEDIA,
            self::PRIORIDAD_ALTA,
            self::PRIORIDAD_CRITICA,
            self::PRIORIDAD_EMERGENCIA
        ];
    }

    /**
     * Obtener tipos válidos
     */
    public static function getTiposValidos(): array
    {
        return [
            self::TIPO_PREVENTIVO,
            self::TIPO_CORRECTIVO,
            self::TIPO_PREDICTIVO,
            self::TIPO_EMERGENCIA
        ];
    }

    // ==========================================
    // SCOPES EMPRESARIALES ADICIONALES
    // ==========================================

    /**
     * Scope para correctivos por prioridad
     */
    public function scopePorPrioridad(Builder $query, string $prioridad): Builder
    {
        return $query->where('prioridad', $prioridad);
    }

    /**
     * Scope para correctivos críticos
     */
    public function scopeCriticos(Builder $query): Builder
    {
        return $query->whereIn('prioridad', [self::PRIORIDAD_CRITICA, self::PRIORIDAD_EMERGENCIA]);
    }

    /**
     * Scope para correctivos completados
     */
    public function scopeCompletados(Builder $query): Builder
    {
        return $query->where('estado', self::ESTADO_COMPLETADO);
    }

    /**
     * Scope para correctivos pendientes
     */
    public function scopePendientes(Builder $query): Builder
    {
        return $query->where('estado', self::ESTADO_PENDIENTE);
    }

    /**
     * Scope para correctivos en proceso
     */
    public function scopeEnProceso(Builder $query): Builder
    {
        return $query->where('estado', self::ESTADO_EN_PROCESO);
    }

    /**
     * Scope para correctivos vencidos
     */
    public function scopeVencidos(Builder $query): Builder
    {
        return $query->where('fecha_fin', '<', now())
                    ->whereNotIn('estado', [self::ESTADO_COMPLETADO, self::ESTADO_CANCELADO]);
    }

    // ==========================================
    // MÉTODOS DE NEGOCIO EMPRESARIALES
    // ==========================================

    /**
     * Calcular tiempo de resolución en horas
     */
    public function calcularTiempoResolucion(): ?int
    {
        if ($this->fecha_inicio && $this->fecha_fin) {
            return $this->fecha_inicio->diffInHours($this->fecha_fin);
        }
        return null;
    }

    /**
     * Verificar si el correctivo está vencido
     */
    public function estaVencido(): bool
    {
        return $this->fecha_fin &&
               $this->fecha_fin->isPast() &&
               !in_array($this->estado, [self::ESTADO_COMPLETADO, self::ESTADO_CANCELADO]);
    }

    /**
     * Obtener días restantes para completar
     */
    public function diasRestantes(): ?int
    {
        if ($this->fecha_fin && !$this->estaVencido()) {
            return now()->diffInDays($this->fecha_fin, false);
        }
        return null;
    }

    /**
     * Cambiar estado del correctivo
     */
    public function cambiarEstado(string $nuevoEstado, string $observacion = null): bool
    {
        if (!in_array($nuevoEstado, self::getEstadosValidos())) {
            return false;
        }

        $estadoAnterior = $this->estado;
        $this->estado = $nuevoEstado;

        if ($nuevoEstado === self::ESTADO_COMPLETADO && !$this->fecha_fin) {
            $this->fecha_fin = now();
        }

        if ($observacion) {
            $this->observaciones = $this->observaciones . "\n" . now()->format('Y-m-d H:i:s') . ": " . $observacion;
        }

        $resultado = $this->save();

        if ($resultado) {
            Log::info("Estado de correctivo cambiado", [
                'correctivo_id' => $this->id,
                'estado_anterior' => $estadoAnterior,
                'nuevo_estado' => $nuevoEstado,
                'observacion' => $observacion
            ]);
        }

        return $resultado;
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
            Log::info("Creando nuevo registro en correctivos_generales", ['data' => $model->toArray()]);
        });
        
        static::updating(function ($model) {
            Log::info("Actualizando registro en correctivos_generales", ['id' => $model->id, 'changes' => $model->getDirty()]);
        });
        
        static::deleting(function ($model) {
            Log::info("Eliminando registro en correctivos_generales", ['id' => $model->id]);
        });
    }
}
