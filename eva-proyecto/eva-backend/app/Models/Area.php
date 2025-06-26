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
 * Modelo Area - Gestión Empresarial
 * 
 * Modelo empresarial optimizado para la tabla areas
 * con funcionalidades avanzadas de seguridad, validación,
 * cacheo, auditoría y manejo de errores.
 * 
 * @package App\Models
 * @author Sistema EVA
 * @version 2.0.0
 * @since 2024-01-01
 */
class Area extends Model
{
    use HasFactory;

    // ==========================================
    // CONFIGURACIÓN BÁSICA DEL MODELO
    // ==========================================
    
    protected $table = 'areas';
    protected $primaryKey = 'id';
    public $timestamps = false;

    /**
     * Campos que pueden ser asignados masivamente
     * Configurados con máxima seguridad empresarial
     */
    protected $fillable = [
        'name',
        'servicio_id',
        'centro_id',
        'piso_id',
        'status',
        'responsable_id',
        'telefono',
        'email',
        'ubicacion'
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
        'servicio_id' => 'integer',
        'centro_id' => 'integer',
        'piso_id' => 'integer',
        'status' => 'integer',
        'responsable_id' => 'integer'
    ];

    // ==========================================
    // CONSTANTES EMPRESARIALES
    // ==========================================
    
    const CACHE_TTL = 3600; // 1 hora
    const CACHE_PREFIX = 'areas_';

    // ==========================================
    // RELACIONES ELOQUENT
    // ==========================================
    
    /**
     * Relación con Servicio
     */
    public function servicio(): BelongsTo
    {
        return $this->belongsTo(Servicio::class, 'servicio_id');
    }

    /**
     * Relación con Centro
     */
    public function centro(): BelongsTo
    {
        return $this->belongsTo(Centro::class, 'centro_id');
    }

    /**
     * Relación con Piso
     */
    public function piso(): BelongsTo
    {
        return $this->belongsTo(Piso::class, 'piso_id');
    }

    /**
     * Relación con Responsable
     */
    public function responsable(): BelongsTo
    {
        return $this->belongsTo(Responsable::class, 'responsable_id');
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
                    'name' => $this->name,
                    'descripcion' => $this->descripcion,
                    'codigo' => $this->codigo,
                    'activo' => $this->activo,
                    'centro_id' => $this->centro_id,
                    'responsable' => $this->responsable,
                    'telefono' => $this->telefono,
                    'email' => $this->email,
                    'capacidad_equipos' => $this->capacidad_equipos,
                    'total_equipos' => $this->equipos()->count(),
                    'equipos_activos' => $this->equipos()->where('status', 'activo')->count(),
                    'equipos_mantenimiento' => $this->equipos()->where('status', 'mantenimiento')->count(),
                    'porcentaje_ocupacion' => $this->calcularPorcentajeOcupacion(),
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

        // Validar nombre único por centro
        if ($this->name && $this->centro_id) {
            $existe = static::where('name', $this->name)
                           ->where('centro_id', $this->centro_id)
                           ->where('id', '!=', $this->id)
                           ->exists();
            if ($existe) {
                $errores[] = 'Ya existe un área con este nombre en el centro';
            }
        }

        // Validar código único
        if ($this->codigo) {
            $existe = static::where('codigo', $this->codigo)
                           ->where('id', '!=', $this->id)
                           ->exists();
            if ($existe) {
                $errores[] = 'El código del área ya está en uso';
            }
        }

        // Validar centro asociado
        if ($this->centro_id && !$this->centro) {
            $errores[] = 'El centro asociado no existe';
        }

        // Validar capacidad de equipos
        if ($this->capacidad_equipos && $this->capacidad_equipos <= 0) {
            $errores[] = 'La capacidad de equipos debe ser mayor a 0';
        }

        // Validar email
        if ($this->email && !filter_var($this->email, FILTER_VALIDATE_EMAIL)) {
            $errores[] = 'El formato del email no es válido';
        }

        // Validar teléfono
        if ($this->telefono && !preg_match('/^[\d\s\-\+\(\)]+$/', $this->telefono)) {
            $errores[] = 'El formato del teléfono no es válido';
        }

        return $errores;
    }

    /**
     * Limpiar cache relacionado
     */
    public function limpiarCache(): void
    {
        Cache::forget(self::CACHE_PREFIX . "stats_{$this->id}");
        Cache::forget(self::CACHE_PREFIX . "centro_{$this->centro_id}");
        Cache::forget(self::CACHE_PREFIX . "equipos_{$this->id}");
    }

    // ==========================================
    // CONSTANTES EMPRESARIALES
    // ==========================================

    const TIPO_CLINICA = 'clinica';
    const TIPO_QUIROFANO = 'quirofano';
    const TIPO_LABORATORIO = 'laboratorio';
    const TIPO_RADIOLOGIA = 'radiologia';
    const TIPO_FARMACIA = 'farmacia';
    const TIPO_URGENCIAS = 'urgencias';
    const TIPO_HOSPITALIZACION = 'hospitalizacion';
    const TIPO_ADMINISTRATIVA = 'administrativa';
    const TIPO_MANTENIMIENTO = 'mantenimiento';
    const TIPO_ALMACEN = 'almacen';

    const NIVEL_RIESGO_BAJO = 'bajo';
    const NIVEL_RIESGO_MEDIO = 'medio';
    const NIVEL_RIESGO_ALTO = 'alto';
    const NIVEL_RIESGO_CRITICO = 'critico';

    /**
     * Obtener tipos de área válidos
     */
    public static function getTiposValidos(): array
    {
        return [
            self::TIPO_CLINICA,
            self::TIPO_QUIROFANO,
            self::TIPO_LABORATORIO,
            self::TIPO_RADIOLOGIA,
            self::TIPO_FARMACIA,
            self::TIPO_URGENCIAS,
            self::TIPO_HOSPITALIZACION,
            self::TIPO_ADMINISTRATIVA,
            self::TIPO_MANTENIMIENTO,
            self::TIPO_ALMACEN
        ];
    }

    /**
     * Obtener niveles de riesgo válidos
     */
    public static function getNivelesRiesgoValidos(): array
    {
        return [
            self::NIVEL_RIESGO_BAJO,
            self::NIVEL_RIESGO_MEDIO,
            self::NIVEL_RIESGO_ALTO,
            self::NIVEL_RIESGO_CRITICO
        ];
    }

    // ==========================================
    // SCOPES EMPRESARIALES ADICIONALES
    // ==========================================

    /**
     * Scope para áreas por tipo
     */
    public function scopePorTipo(Builder $query, string $tipo): Builder
    {
        return $query->where('tipo', $tipo);
    }

    /**
     * Scope para áreas críticas
     */
    public function scopeCriticas(Builder $query): Builder
    {
        return $query->whereIn('nivel_riesgo', [self::NIVEL_RIESGO_ALTO, self::NIVEL_RIESGO_CRITICO]);
    }

    /**
     * Scope para áreas con capacidad disponible
     */
    public function scopeConCapacidadDisponible(Builder $query): Builder
    {
        return $query->whereRaw('capacidad_equipos > (SELECT COUNT(*) FROM equipos WHERE area_id = areas.id)');
    }

    /**
     * Scope para áreas sobrecargadas
     */
    public function scopeSobrecargadas(Builder $query): Builder
    {
        return $query->whereRaw('capacidad_equipos < (SELECT COUNT(*) FROM equipos WHERE area_id = areas.id)');
    }

    /**
     * Scope para áreas por centro
     */
    public function scopePorCentro(Builder $query, int $centroId): Builder
    {
        return $query->where('centro_id', $centroId);
    }

    // ==========================================
    // MÉTODOS DE NEGOCIO EMPRESARIALES
    // ==========================================

    /**
     * Calcular porcentaje de ocupación
     */
    public function calcularPorcentajeOcupacion(): float
    {
        if (!$this->capacidad_equipos || $this->capacidad_equipos <= 0) {
            return 0;
        }

        $totalEquipos = $this->equipos()->count();
        return round(($totalEquipos / $this->capacidad_equipos) * 100, 2);
    }

    /**
     * Verificar si el área está sobrecargada
     */
    public function estaSobrecargada(): bool
    {
        return $this->calcularPorcentajeOcupacion() > 100;
    }

    /**
     * Obtener capacidad disponible
     */
    public function getCapacidadDisponible(): int
    {
        $totalEquipos = $this->equipos()->count();
        return max(0, ($this->capacidad_equipos ?? 0) - $totalEquipos);
    }

    /**
     * Verificar si puede recibir más equipos
     */
    public function puedeRecibirEquipos(int $cantidad = 1): bool
    {
        return $this->getCapacidadDisponible() >= $cantidad;
    }

    /**
     * Obtener equipos por estado
     */
    public function getEquiposPorEstado(): array
    {
        return $this->equipos()
                   ->select('status', DB::raw('count(*) as total'))
                   ->groupBy('status')
                   ->pluck('total', 'status')
                   ->toArray();
    }

    /**
     * Generar código automático
     */
    public static function generarCodigo(int $centroId): string
    {
        $centro = \App\Models\Centro::find($centroId);
        $prefijo = $centro ? strtoupper(substr($centro->name, 0, 3)) : 'ARE';

        $ultimo = static::where('centro_id', $centroId)
                       ->where('codigo', 'LIKE', $prefijo . '%')
                       ->orderBy('codigo', 'desc')
                       ->first();

        if ($ultimo && preg_match('/(\d+)$/', $ultimo->codigo, $matches)) {
            $numero = intval($matches[1]) + 1;
        } else {
            $numero = 1;
        }

        return $prefijo . str_pad($numero, 3, '0', STR_PAD_LEFT);
    }

    /**
     * Obtener reporte de utilización
     */
    public function getReporteUtilizacion(): array
    {
        $equipos = $this->equipos()->with(['mantenimientos', 'calibraciones'])->get();

        return [
            'total_equipos' => $equipos->count(),
            'equipos_activos' => $equipos->where('status', 'activo')->count(),
            'equipos_mantenimiento' => $equipos->where('status', 'mantenimiento')->count(),
            'equipos_baja' => $equipos->where('status', 'baja')->count(),
            'porcentaje_ocupacion' => $this->calcularPorcentajeOcupacion(),
            'capacidad_disponible' => $this->getCapacidadDisponible(),
            'esta_sobrecargada' => $this->estaSobrecargada(),
            'mantenimientos_pendientes' => $equipos->filter(function($equipo) {
                return $equipo->fecha_mantenimiento && $equipo->fecha_mantenimiento->isPast();
            })->count(),
            'calibraciones_vencidas' => $equipos->filter(function($equipo) {
                return $equipo->calibraciones->where('fecha_programada', '<', now())->count() > 0;
            })->count()
        ];
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
            Log::info("Creando nuevo registro en areas", ['data' => $model->toArray()]);
        });
        
        static::updating(function ($model) {
            Log::info("Actualizando registro en areas", ['id' => $model->id, 'changes' => $model->getDirty()]);
        });
        
        static::deleting(function ($model) {
            Log::info("Eliminando registro en areas", ['id' => $model->id]);
        });
    }
}
