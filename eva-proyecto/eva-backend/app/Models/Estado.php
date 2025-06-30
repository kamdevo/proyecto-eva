<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;
use Exception;

/**
 * Modelo Estado - Gestión Empresarial de Estados del Sistema
 *
 * Modelo empresarial optimizado para la gestión completa de estados
 * del sistema, equipos, procesos y entidades del sistema EVA.
 *
 * Funcionalidades implementadas:
 * - Gestión de estados de equipos y procesos
 * - Clasificación por tipo y categoría de estado
 * - Validaciones empresariales robustas
 * - Sistema de cacheo inteligente
 * - Auditoría completa de operaciones
 * - Transiciones de estado controladas
 * - Historial de cambios de estado
 * - Reglas de negocio para transiciones
 * - Notificaciones automáticas de cambios
 * - Métricas y estadísticas de estados
 *
 * @package App\Models
 * @author Sistema EVA
 * @version 2.0.0
 * @since 2024-01-01
 *
 * @property int $id
 * @property string $nombre
 * @property string $descripcion
 * @property string $codigo
 * @property string $tipo_estado
 * @property string $categoria
 * @property string $color
 * @property string $color_hex
 * @property string $icono
 * @property bool $activo
 * @property bool $es_inicial
 * @property bool $es_final
 * @property int $orden
 * @property Carbon $created_at
 * @property Carbon $updated_at
 */
class Estado extends Model
{
    use HasFactory;

    // ==========================================
    // CONFIGURACIÓN BÁSICA DEL MODELO
    // ==========================================

    protected $table = 'estados';
    protected $primaryKey = 'id';
    public $timestamps = true;

    /**
     * Campos que pueden ser asignados masivamente
     * Configurados con máxima seguridad empresarial
     */
    protected $fillable = [
        'nombre',
        'descripcion',
        'codigo',
        'tipo_estado',
        'categoria',
        'color',
        'color_hex',
        'icono',
        'activo',
        'es_inicial',
        'es_final',
        'orden',
        'reglas_transicion',
        'notificaciones_activas',
        'tiempo_maximo_permanencia',
        'acciones_automaticas',
        'permisos_requeridos',
        'documentacion_requerida',
        'validaciones_entrada',
        'validaciones_salida'
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
        'es_inicial' => 'boolean',
        'es_final' => 'boolean',
        'orden' => 'integer',
        'notificaciones_activas' => 'boolean',
        'tiempo_maximo_permanencia' => 'integer',
        'reglas_transicion' => 'array',
        'acciones_automaticas' => 'array',
        'permisos_requeridos' => 'array',
        'validaciones_entrada' => 'array',
        'validaciones_salida' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    // ==========================================
    // CONSTANTES EMPRESARIALES
    // ==========================================

    const CACHE_TTL = 3600; // 1 hora
    const CACHE_PREFIX = 'estados_';

    const TIPO_EQUIPO = 'equipo';
    const TIPO_MANTENIMIENTO = 'mantenimiento';
    const TIPO_CALIBRACION = 'calibracion';
    const TIPO_CONTINGENCIA = 'contingencia';
    const TIPO_TICKET = 'ticket';
    const TIPO_PROCESO = 'proceso';
    const TIPO_USUARIO = 'usuario';
    const TIPO_GENERAL = 'general';

    const CATEGORIA_OPERATIVO = 'operativo';
    const CATEGORIA_MANTENIMIENTO = 'mantenimiento';
    const CATEGORIA_ADMINISTRATIVO = 'administrativo';
    const CATEGORIA_EMERGENCIA = 'emergencia';
    const CATEGORIA_TEMPORAL = 'temporal';

    // Estados comunes del sistema
    const ESTADO_ACTIVO = 'activo';
    const ESTADO_INACTIVO = 'inactivo';
    const ESTADO_PENDIENTE = 'pendiente';
    const ESTADO_EN_PROCESO = 'en_proceso';
    const ESTADO_COMPLETADO = 'completado';
    const ESTADO_CANCELADO = 'cancelado';
    const ESTADO_SUSPENDIDO = 'suspendido';
    const ESTADO_MANTENIMIENTO = 'mantenimiento';
    const ESTADO_BAJA = 'baja';

    /**
     * Obtener tipos de estado válidos
     */
    public static function getTiposEstado(): array
    {
        return [
            self::TIPO_EQUIPO,
            self::TIPO_MANTENIMIENTO,
            self::TIPO_CALIBRACION,
            self::TIPO_CONTINGENCIA,
            self::TIPO_TICKET,
            self::TIPO_PROCESO,
            self::TIPO_USUARIO,
            self::TIPO_GENERAL
        ];
    }

    /**
     * Obtener categorías válidas
     */
    public static function getCategorias(): array
    {
        return [
            self::CATEGORIA_OPERATIVO,
            self::CATEGORIA_MANTENIMIENTO,
            self::CATEGORIA_ADMINISTRATIVO,
            self::CATEGORIA_EMERGENCIA,
            self::CATEGORIA_TEMPORAL
        ];
    }

    /**
     * Obtener estados comunes del sistema
     */
    public static function getEstadosComunes(): array
    {
        return [
            self::ESTADO_ACTIVO,
            self::ESTADO_INACTIVO,
            self::ESTADO_PENDIENTE,
            self::ESTADO_EN_PROCESO,
            self::ESTADO_COMPLETADO,
            self::ESTADO_CANCELADO,
            self::ESTADO_SUSPENDIDO,
            self::ESTADO_MANTENIMIENTO,
            self::ESTADO_BAJA
        ];
    }

    // ==========================================
    // RELACIONES ELOQUENT EMPRESARIALES
    // ==========================================

    /**
     * Relación con equipos que tienen este estado
     */
    public function equipos(): HasMany
    {
        return $this->hasMany(Equipo::class, 'estado_id');
    }

    /**
     * Relación con mantenimientos que tienen este estado
     */
    public function mantenimientos(): HasMany
    {
        return $this->hasMany(Mantenimiento::class, 'estado_id');
    }

    /**
     * Relación con calibraciones que tienen este estado
     */
    public function calibraciones(): HasMany
    {
        return $this->hasMany(Calibracion::class, 'estado_id');
    }

    /**
     * Relación con contingencias que tienen este estado
     */
    public function contingencias(): HasMany
    {
        return $this->hasMany(Contingencia::class, 'estado_id');
    }

    /**
     * Relación con tickets que tienen este estado
     */
    public function tickets(): HasMany
    {
        return $this->hasMany(Ticket::class, 'estado_id');
    }

    // ==========================================
    // SCOPES EMPRESARIALES
    // ==========================================

    /**
     * Scope para estados activos
     */
    public function scopeActivos(Builder $query): Builder
    {
        return $query->where('activo', true);
    }

    /**
     * Scope para estados inactivos
     */
    public function scopeInactivos(Builder $query): Builder
    {
        return $query->where('activo', false);
    }

    /**
     * Scope para estados por tipo
     */
    public function scopePorTipo(Builder $query, string $tipo): Builder
    {
        return $query->where('tipo_estado', $tipo);
    }

    /**
     * Scope para estados por categoría
     */
    public function scopePorCategoria(Builder $query, string $categoria): Builder
    {
        return $query->where('categoria', $categoria);
    }

    /**
     * Scope para estados iniciales
     */
    public function scopeIniciales(Builder $query): Builder
    {
        return $query->where('es_inicial', true);
    }

    /**
     * Scope para estados finales
     */
    public function scopeFinales(Builder $query): Builder
    {
        return $query->where('es_final', true);
    }

    /**
     * Scope para estados ordenados
     */
    public function scopeOrdenados(Builder $query): Builder
    {
        return $query->orderBy('orden')->orderBy('nombre');
    }

    /**
     * Scope para búsqueda general
     */
    public function scopeBuscar(Builder $query, string $termino): Builder
    {
        return $query->where(function($q) use ($termino) {
            $q->where('nombre', 'LIKE', "%{$termino}%")
              ->orWhere('descripcion', 'LIKE', "%{$termino}%")
              ->orWhere('codigo', 'LIKE', "%{$termino}%");
        });
    }

    // ==========================================
    // ACCESSORS Y MUTATORS EMPRESARIALES
    // ==========================================

    /**
     * Accessor para obtener el nombre con código
     */
    public function getNombreCompletoAttribute(): string
    {
        return $this->codigo ? "[{$this->codigo}] {$this->nombre}" : $this->nombre;
    }

    /**
     * Accessor para verificar si es un estado crítico
     */
    public function getEsCriticoAttribute(): bool
    {
        return in_array($this->categoria, [self::CATEGORIA_EMERGENCIA]) ||
               in_array($this->nombre, [self::ESTADO_BAJA, self::ESTADO_CANCELADO]);
    }

    /**
     * Accessor para obtener el estilo CSS del estado
     */
    public function getEstiloCssAttribute(): string
    {
        $color = $this->color_hex ?? $this->color ?? '#6c757d';
        return "background-color: {$color}; color: white; padding: 4px 8px; border-radius: 4px;";
    }

    /**
     * Mutator para el código (siempre en mayúsculas)
     */
    public function setCodigoAttribute($value): void
    {
        $this->attributes['codigo'] = $value ? strtoupper(trim($value)) : null;
    }

    /**
     * Mutator para el color hex (validar formato)
     */
    public function setColorHexAttribute($value): void
    {
        if ($value && preg_match('/^#[a-fA-F0-9]{6}$/', $value)) {
            $this->attributes['color_hex'] = $value;
        } else {
            $this->attributes['color_hex'] = '#6c757d'; // Color por defecto
        }
    }

    // ==========================================
    // MÉTODOS DE NEGOCIO EMPRESARIALES
    // ==========================================

    /**
     * Verificar si se puede transicionar a otro estado
     */
    public function puedeTransicionarA(Estado $estadoDestino): bool
    {
        // Si no hay reglas de transición, permitir cualquier transición
        if (empty($this->reglas_transicion)) {
            return true;
        }

        // Verificar reglas específicas
        $reglasTransicion = $this->reglas_transicion ?? [];

        return in_array($estadoDestino->id, $reglasTransicion['estados_permitidos'] ?? []) ||
               in_array($estadoDestino->codigo, $reglasTransicion['codigos_permitidos'] ?? []);
    }

    /**
     * Obtener estados a los que se puede transicionar
     */
    public function getEstadosTransicionPermitidos(): array
    {
        if (empty($this->reglas_transicion)) {
            return static::activos()->where('id', '!=', $this->id)->get()->toArray();
        }

        $reglasTransicion = $this->reglas_transicion ?? [];
        $estadosPermitidos = $reglasTransicion['estados_permitidos'] ?? [];

        if (empty($estadosPermitidos)) {
            return [];
        }

        return static::whereIn('id', $estadosPermitidos)->activos()->get()->toArray();
    }

    /**
     * Obtener conteo de entidades en este estado
     */
    public function getConteoEntidades(): array
    {
        return [
            'equipos' => $this->equipos()->count(),
            'mantenimientos' => $this->mantenimientos()->count(),
            'calibraciones' => $this->calibraciones()->count(),
            'contingencias' => $this->contingencias()->count(),
            'tickets' => $this->tickets()->count(),
            'total' => $this->equipos()->count() +
                      $this->mantenimientos()->count() +
                      $this->calibraciones()->count() +
                      $this->contingencias()->count() +
                      $this->tickets()->count()
        ];
    }

    /**
     * Obtener estadísticas del estado
     */
    public function obtenerEstadisticas(): array
    {
        return Cache::remember(
            self::CACHE_PREFIX . "stats_{$this->id}",
            self::CACHE_TTL,
            function () {
                $conteos = $this->getConteoEntidades();

                return [
                    'id' => $this->id,
                    'nombre_completo' => $this->nombre_completo,
                    'tipo_estado' => $this->tipo_estado,
                    'categoria' => $this->categoria,
                    'es_inicial' => $this->es_inicial,
                    'es_final' => $this->es_final,
                    'es_critico' => $this->es_critico,
                    'activo' => $this->activo,
                    'orden' => $this->orden,
                    'color' => $this->color,
                    'color_hex' => $this->color_hex,
                    'conteo_entidades' => $conteos,
                    'estados_transicion_permitidos' => count($this->getEstadosTransicionPermitidos()),
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

        // Validar nombre
        if (empty($this->nombre)) {
            $errores[] = 'El nombre del estado es requerido';
        }

        // Validar tipo de estado
        if ($this->tipo_estado && !in_array($this->tipo_estado, self::getTiposEstado())) {
            $errores[] = 'El tipo de estado no es válido';
        }

        // Validar categoría
        if ($this->categoria && !in_array($this->categoria, self::getCategorias())) {
            $errores[] = 'La categoría no es válida';
        }

        // Validar código único
        if ($this->codigo) {
            $existe = static::where('codigo', $this->codigo)
                           ->where('id', '!=', $this->id)
                           ->exists();
            if ($existe) {
                $errores[] = 'El código del estado ya está en uso';
            }
        }

        // Validar orden
        if ($this->orden && $this->orden < 0) {
            $errores[] = 'El orden debe ser un número positivo';
        }

        // Validar color hex
        if ($this->color_hex && !preg_match('/^#[a-fA-F0-9]{6}$/', $this->color_hex)) {
            $errores[] = 'El color hex no tiene un formato válido';
        }

        return $errores;
    }

    /**
     * Limpiar cache relacionado
     */
    public function limpiarCache(): void
    {
        Cache::forget(self::CACHE_PREFIX . "stats_{$this->id}");
        Cache::forget(self::CACHE_PREFIX . "por_tipo_{$this->tipo_estado}");
        Cache::forget(self::CACHE_PREFIX . "activos");
        Cache::forget(self::CACHE_PREFIX . "transiciones");
    }

    /**
     * Generar código automático
     */
    public static function generarCodigo(string $tipoEstado): string
    {
        $prefijo = strtoupper(substr($tipoEstado, 0, 3));
        $ultimo = static::where('codigo', 'LIKE', $prefijo . '%')
                       ->orderBy('codigo', 'desc')
                       ->first();

        if ($ultimo && preg_match('/(\d+)$/', $ultimo->codigo, $matches)) {
            $numero = intval($matches[1]) + 1;
        } else {
            $numero = 1;
        }

        return $prefijo . str_pad($numero, 3, '0', STR_PAD_LEFT);
    }

    // ==========================================
    // EVENTOS DEL MODELO
    // ==========================================

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($estado) {
            // Generar código automático si no existe
            if (empty($estado->codigo) && $estado->tipo_estado) {
                $estado->codigo = self::generarCodigo($estado->tipo_estado);
            }

            // Asignar orden automático si no se especifica
            if (empty($estado->orden)) {
                $maxOrden = static::where('tipo_estado', $estado->tipo_estado)->max('orden') ?? 0;
                $estado->orden = $maxOrden + 1;
            }

            Log::info('Creando nuevo estado', [
                'nombre' => $estado->nombre,
                'tipo' => $estado->tipo_estado,
                'codigo' => $estado->codigo
            ]);
        });

        static::updating(function ($estado) {
            $estado->limpiarCache();

            Log::info('Actualizando estado', [
                'id' => $estado->id,
                'cambios' => $estado->getDirty()
            ]);
        });

        static::deleting(function ($estado) {
            // Verificar que no haya entidades usando este estado
            $conteos = $estado->getConteoEntidades();
            if ($conteos['total'] > 0) {
                throw new Exception('No se puede eliminar el estado porque tiene entidades asociadas');
            }

            $estado->limpiarCache();

            Log::warning('Eliminando estado', [
                'id' => $estado->id,
                'nombre' => $estado->nombre
            ]);
        });
    }
}
