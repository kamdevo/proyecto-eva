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
 * Modelo Equipo - Gestión Empresarial de Equipos Médicos e Industriales
 * 
 * Este modelo maneja la gestión completa de equipos médicos e industriales
 * con funcionalidades empresariales avanzadas, incluyendo:
 * - Gestión de estados y ciclo de vida
 * - Mantenimientos preventivos y correctivos
 * - Calibraciones y certificaciones
 * - Trazabilidad completa y auditoría
 * - Optimización de consultas y cacheo
 * - Validaciones de negocio robustas
 * - Sistema de alertas y notificaciones
 * - Gestión de garantías y contratos
 * - Control de ubicación y movimientos
 * - Análisis de rendimiento y KPIs
 * 
 * @package App\Models
 * @author Sistema EVA
 * @version 2.0.0
 * @since 2024-01-01
 * 
 * @property int $id
 * @property string $code Código único del equipo
 * @property string $name Nombre del equipo
 * @property string $descripcion Descripción detallada
 * @property string $status Estado actual del equipo
 * @property string $marca Marca del fabricante
 * @property string $modelo Modelo específico
 * @property string $serial Número de serie
 * @property string $invima Registro INVIMA
 * @property Carbon $fecha_ad Fecha de adquisición
 * @property Carbon $fecha_instalacion Fecha de instalación
 * @property int $vida_util Vida útil en años
 * @property string $observacion Observaciones generales
 * @property Carbon $created_at
 * @property Carbon $updated_at
 */
class Equipo extends Model
{
    use HasFactory;

    // ==========================================
    // CONFIGURACIÓN BÁSICA DEL MODELO
    // ==========================================
    
    protected $table = 'equipos';
    protected $primaryKey = 'id';
    public $timestamps = true;

    // ==========================================
    // CONFIGURACIÓN DE CAMPOS Y VALIDACIONES
    // ==========================================
    
    /**
     * Campos que pueden ser asignados masivamente
     * Configurados con máxima seguridad empresarial
     */
    protected $fillable = [
        // Información básica del equipo
        'code',
        'name', 
        'descripcion',
        'status',
        'marca',
        'modelo',
        'serial',
        'invima',
        'image',
        'file',
        
        // Fechas importantes
        'fecha_ad',
        'fecha_instalacion',
        'fecha_mantenimiento',
        'fecha_vencimiento_garantia',
        'fecha_acta_recibo',
        'fecha_inicio_operacion',
        'fecha_fabricacion',
        'fecha_recepcion_almacen',
        
        // Configuración técnica
        'vida_util',
        'observacion',
        'estado_mantenimiento',
        'v1', 'v2', 'v3', // Voltajes
        'costo',
        'plan',
        'garantia',
        'manual',
        'plano',
        'accesorios',
        'propiedad',
        'otros',
        'codigo_antiguo',
        'evaluacion_desempenio',
        'periodicidad',
        'localizacion_actual',
        
        // Campos de control
        'verificacion_inventario',
        'activo_comodato',
        'movilidad',
        'calibracion',
        'repuesto_pendiente',
        
        // Relaciones con otras entidades
        'servicio_id',
        'area_id',
        'centro_id',
        'piso_id',
        'zona_id',
        'propietario_id',
        'fuente_id',
        'tecnologia_id', 
        'frecuencia_id',
        'cbiomedica_id',
        'criesgo_id',
        'tadquisicion_id',
        'invima_id',
        'orden_compra_id',
        'baja_id',
        'estadoequipo_id',
        'tipo_id',
        'guia_id',
        'manual_id',
        'necesidad_id',
        'disponibilidad_id',
        'usuario_id'
    ];

    /**
     * Campos protegidos que no pueden ser asignados masivamente
     * Máxima seguridad empresarial
     */
    protected $guarded = [
        'id',
        'created_at',
        'updated_at'
    ];

    /**
     * Campos ocultos en serialización JSON
     * Protección de datos sensibles
     */
    protected $hidden = [
        // Campos sensibles que no deben exponerse en APIs públicas
    ];

    /**
     * Conversión automática de tipos (Type Casting)
     * Optimización y validación automática de datos empresariales
     */
    protected $casts = [
        'id' => 'integer',
        
        // Fechas críticas del equipo
        'fecha_ad' => 'date',
        'fecha_instalacion' => 'date',
        'fecha_mantenimiento' => 'date',
        'fecha_vencimiento_garantia' => 'date',
        'fecha_acta_recibo' => 'date',
        'fecha_inicio_operacion' => 'date',
        'fecha_fabricacion' => 'date',
        'fecha_recepcion_almacen' => 'date',
        
        // Valores numéricos y financieros
        'vida_util' => 'integer',
        'costo' => 'decimal:2',
        'v1' => 'decimal:2',
        'v2' => 'decimal:2', 
        'v3' => 'decimal:2',
        
        // Campos booleanos de control
        'verificacion_inventario' => 'boolean',
        'activo_comodato' => 'boolean',
        'movilidad' => 'boolean',
        'calibracion' => 'boolean',
        'repuesto_pendiente' => 'boolean',
        
        // Relaciones foráneas
        'servicio_id' => 'integer',
        'area_id' => 'integer',
        'centro_id' => 'integer',
        'piso_id' => 'integer',
        'zona_id' => 'integer',
        'propietario_id' => 'integer',
        'estadoequipo_id' => 'integer',
        'tipo_id' => 'integer',
        'fuente_id' => 'integer',
        'tecnologia_id' => 'integer',
        'frecuencia_id' => 'integer',
        'cbiomedica_id' => 'integer',
        'criesgo_id' => 'integer',
        'tadquisicion_id' => 'integer',
        'invima_id' => 'integer',
        'orden_compra_id' => 'integer',
        'baja_id' => 'integer',
        'guia_id' => 'integer',
        'manual_id' => 'integer',
        'necesidad_id' => 'integer',
        'disponibilidad_id' => 'integer',
        'usuario_id' => 'integer',
        
        // Timestamps del sistema
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    // ==========================================
    // CONSTANTES EMPRESARIALES DEL SISTEMA
    // ==========================================
    
    /**
     * Estados posibles del equipo
     * Control empresarial de ciclo de vida
     */
    const STATUS_ACTIVO = 'activo';
    const STATUS_INACTIVO = 'inactivo';
    const STATUS_MANTENIMIENTO = 'mantenimiento';
    const STATUS_BAJA = 'baja';
    const STATUS_REPARACION = 'reparacion';
    const STATUS_CALIBRACION = 'calibracion';
    const STATUS_GARANTIA = 'garantia';
    const STATUS_PRESTAMO = 'prestamo';
    const STATUS_RESERVADO = 'reservado';
    const STATUS_DISPONIBLE = 'disponible';

    /**
     * Tipos de mantenimiento
     */
    const MANTENIMIENTO_PREVENTIVO = 'preventivo';
    const MANTENIMIENTO_CORRECTIVO = 'correctivo';
    const MANTENIMIENTO_PREDICTIVO = 'predictivo';
    const MANTENIMIENTO_EMERGENCIA = 'emergencia';

    /**
     * Niveles de criticidad
     */
    const CRITICIDAD_ALTA = 'alta';
    const CRITICIDAD_MEDIA = 'media';
    const CRITICIDAD_BAJA = 'baja';
    const CRITICIDAD_CRITICA = 'critica';

    /**
     * Estados de calibración
     */
    const CALIBRACION_VIGENTE = 'vigente';
    const CALIBRACION_VENCIDA = 'vencida';
    const CALIBRACION_PROXIMA = 'proxima';
    const CALIBRACION_NO_APLICA = 'no_aplica';

    /**
     * Tipos de propiedad
     */
    const PROPIEDAD_PROPIA = 'propia';
    const PROPIEDAD_COMODATO = 'comodato';
    const PROPIEDAD_ALQUILER = 'alquiler';
    const PROPIEDAD_LEASING = 'leasing';

    /**
     * Configuración de cacheo para optimización
     */
    const CACHE_TTL = 3600; // 1 hora
    const CACHE_PREFIX = 'equipo_';

    // ==========================================
    // VALIDACIONES EMPRESARIALES
    // ==========================================
    
    /**
     * Reglas de validación empresariales
     * Máxima seguridad y control de datos
     */
    public static function validationRules($id = null): array
    {
        return [
            'code' => [
                'required',
                'string',
                'max:50',
                'unique:equipos,code' . ($id ? ",$id" : ''),
                'regex:/^[A-Z0-9\-_]+$/' // Solo mayúsculas, números, guiones
            ],
            'name' => [
                'required',
                'string',
                'max:255',
                'min:3'
            ],
            'descripcion' => [
                'nullable',
                'string',
                'max:1000'
            ],
            'status' => [
                'required',
                'string',
                'in:' . implode(',', self::getValidStatuses())
            ],
            'marca' => [
                'required',
                'string',
                'max:100'
            ],
            'modelo' => [
                'required',
                'string',
                'max:100'
            ],
            'serial' => [
                'required',
                'string',
                'max:100',
                'unique:equipos,serial' . ($id ? ",$id" : '')
            ],
            'fecha_ad' => [
                'required',
                'date',
                'before_or_equal:today'
            ],
            'fecha_instalacion' => [
                'nullable',
                'date',
                'after_or_equal:fecha_ad'
            ],
            'vida_util' => [
                'nullable',
                'integer',
                'min:1',
                'max:50'
            ],
            'costo' => [
                'nullable',
                'numeric',
                'min:0',
                'max:999999999.99'
            ],
            'servicio_id' => [
                'required',
                'integer',
                'exists:servicios,id'
            ],
            'area_id' => [
                'nullable',
                'integer',
                'exists:areas,id'
            ]
        ];
    }

    /**
     * Mensajes de validación personalizados
     */
    public static function validationMessages(): array
    {
        return [
            'code.required' => 'El código del equipo es obligatorio',
            'code.unique' => 'Este código ya está en uso por otro equipo',
            'code.regex' => 'El código solo puede contener letras mayúsculas, números y guiones',
            'name.required' => 'El nombre del equipo es obligatorio',
            'name.min' => 'El nombre debe tener al menos 3 caracteres',
            'serial.required' => 'El número de serie es obligatorio',
            'serial.unique' => 'Este número de serie ya está registrado',
            'fecha_ad.required' => 'La fecha de adquisición es obligatoria',
            'fecha_ad.before_or_equal' => 'La fecha de adquisición no puede ser futura',
            'servicio_id.required' => 'Debe asignar el equipo a un servicio',
            'servicio_id.exists' => 'El servicio seleccionado no existe'
        ];
    }

    // ==========================================
    // RELACIONES ELOQUENT EMPRESARIALES
    // ==========================================

    /**
     * Relación con servicio
     * Un equipo pertenece a un servicio
     */
    public function servicio(): BelongsTo
    {
        return $this->belongsTo(Servicio::class, 'servicio_id')
                    ->withDefault(['name' => 'Sin servicio asignado']);
    }

    /**
     * Relación con área
     * Un equipo pertenece a un área
     */
    public function area(): BelongsTo
    {
        return $this->belongsTo(Area::class, 'area_id')
                    ->withDefault(['name' => 'Sin área asignada']);
    }

    /**
     * Relación con centro
     * Un equipo pertenece a un centro
     */
    public function centro(): BelongsTo
    {
        return $this->belongsTo(Centro::class, 'centro_id')
                    ->withDefault(['name' => 'Sin centro asignado']);
    }

    /**
     * Relación con piso
     * Un equipo está ubicado en un piso
     */
    public function piso(): BelongsTo
    {
        return $this->belongsTo(Piso::class, 'piso_id')
                    ->withDefault(['name' => 'Sin piso asignado']);
    }

    /**
     * Relación con zona
     * Un equipo está ubicado en una zona
     */
    public function zona(): BelongsTo
    {
        return $this->belongsTo(Zona::class, 'zona_id')
                    ->withDefault(['name' => 'Sin zona asignada']);
    }

    /**
     * Relación con propietario
     * Un equipo tiene un propietario
     */
    public function propietario(): BelongsTo
    {
        return $this->belongsTo(Propietario::class, 'propietario_id')
                    ->withDefault(['name' => 'Sin propietario']);
    }

    /**
     * Relación con estado del equipo
     * Un equipo tiene un estado específico
     */
    public function estadoEquipo(): BelongsTo
    {
        return $this->belongsTo(EstadoEquipo::class, 'estadoequipo_id')
                    ->withDefault(['name' => 'Sin estado']);
    }

    /**
     * Relación con tecnología predominante
     * Un equipo tiene una tecnología
     */
    public function tecnologia(): BelongsTo
    {
        return $this->belongsTo(Tecnologia::class, 'tecnologia_id')
                    ->withDefault(['nombre' => 'Sin tecnología']);
    }

    /**
     * Relación con fuente de alimentación
     * Un equipo tiene una fuente de alimentación
     */
    public function fuenteAlimentacion(): BelongsTo
    {
        return $this->belongsTo(FuenteAlimentacion::class, 'fuente_id')
                    ->withDefault(['name' => 'Sin fuente']);
    }

    /**
     * Relación con clasificación biomédica
     * Un equipo tiene una clasificación biomédica
     */
    public function clasificacionBiomedica(): BelongsTo
    {
        return $this->belongsTo(ClasificacionBiomedica::class, 'cbiomedica_id')
                    ->withDefault(['name' => 'Sin clasificación']);
    }

    /**
     * Relación con clasificación de riesgo
     * Un equipo tiene una clasificación de riesgo
     */
    public function clasificacionRiesgo(): BelongsTo
    {
        return $this->belongsTo(ClasificacionRiesgo::class, 'criesgo_id')
                    ->withDefault(['name' => 'Sin clasificación']);
    }

    /**
     * Relación con tipo de adquisición
     * Un equipo tiene un tipo de adquisición
     */
    public function tipoAdquisicion(): BelongsTo
    {
        return $this->belongsTo(TipoAdquisicion::class, 'tadquisicion_id')
                    ->withDefault(['name' => 'Sin tipo']);
    }

    /**
     * Relación con frecuencia de mantenimiento
     * Un equipo tiene una frecuencia de mantenimiento
     */
    public function frecuenciaMantenimiento(): BelongsTo
    {
        return $this->belongsTo(FrecuenciaMantenimiento::class, 'frecuencia_id')
                    ->withDefault(['name' => 'Sin frecuencia']);
    }

    /**
     * Relación con registro INVIMA
     * Un equipo puede tener un registro INVIMA
     */
    public function registroInvima(): BelongsTo
    {
        return $this->belongsTo(Invima::class, 'invima_id');
    }

    /**
     * Relación con orden de compra
     * Un equipo puede estar asociado a una orden de compra
     */
    public function ordenCompra(): BelongsTo
    {
        return $this->belongsTo(OrdenCompra::class, 'orden_compra_id');
    }

    /**
     * Relación con mantenimientos
     * Un equipo tiene muchos mantenimientos
     */
    public function mantenimientos(): HasMany
    {
        return $this->hasMany(Mantenimiento::class, 'equipo_id')
                    ->orderBy('created_at', 'desc');
    }

    /**
     * Relación con calibraciones
     * Un equipo tiene muchas calibraciones
     */
    public function calibraciones(): HasMany
    {
        return $this->hasMany(Calibracion::class, 'equipo_id')
                    ->orderBy('fecha_calibracion', 'desc');
    }

    /**
     * Relación con correctivos
     * Un equipo tiene muchos mantenimientos correctivos
     */
    public function correctivos(): HasMany
    {
        return $this->hasMany(CorrectivoGeneral::class, 'equipo_id')
                    ->orderBy('created_at', 'desc');
    }

    /**
     * Relación con contingencias
     * Un equipo puede tener contingencias
     */
    public function contingencias(): HasMany
    {
        return $this->hasMany(Contingencia::class, 'equipo_id')
                    ->orderBy('created_at', 'desc');
    }

    /**
     * Relación con observaciones
     * Un equipo puede tener observaciones
     */
    public function observaciones(): HasMany
    {
        return $this->hasMany(Observacion::class, 'equipo_id')
                    ->orderBy('created_at', 'desc');
    }

    /**
     * Relación con archivos
     * Un equipo puede tener archivos adjuntos
     */
    public function archivos(): HasMany
    {
        return $this->hasMany(Archivo::class, 'equipo_id')
                    ->orderBy('created_at', 'desc');
    }

    /**
     * Relación con repuestos
     * Un equipo puede tener repuestos asociados
     */
    public function repuestos(): BelongsToMany
    {
        return $this->belongsToMany(Repuesto::class, 'equipo_repuestos', 'equipo_id', 'repuesto_id')
                    ->withPivot(['cantidad_requerida', 'es_critico', 'observaciones'])
                    ->withTimestamps();
    }

    /**
     * Relación con contactos
     * Un equipo puede tener contactos técnicos
     */
    public function contactos(): HasMany
    {
        return $this->hasMany(EquipoContacto::class, 'equipo_id');
    }

    /**
     * Relación con especificaciones técnicas
     * Un equipo puede tener especificaciones técnicas
     */
    public function especificaciones(): HasMany
    {
        return $this->hasMany(EquipoEspecificacion::class, 'equipo_id');
    }

    // ==========================================
    // SCOPES EMPRESARIALES PARA CONSULTAS
    // ==========================================

    /**
     * Scope para equipos activos
     */
    public function scopeActivos(Builder $query): Builder
    {
        return $query->where('status', self::STATUS_ACTIVO);
    }

    /**
     * Scope para equipos inactivos
     */
    public function scopeInactivos(Builder $query): Builder
    {
        return $query->where('status', self::STATUS_INACTIVO);
    }

    /**
     * Scope para equipos en mantenimiento
     */
    public function scopeEnMantenimiento(Builder $query): Builder
    {
        return $query->where('status', self::STATUS_MANTENIMIENTO);
    }

    /**
     * Scope para equipos dados de baja
     */
    public function scopeDadosDeBaja(Builder $query): Builder
    {
        return $query->where('status', self::STATUS_BAJA);
    }

    /**
     * Scope para equipos por servicio
     */
    public function scopePorServicio(Builder $query, int $servicioId): Builder
    {
        return $query->where('servicio_id', $servicioId);
    }

    /**
     * Scope para equipos por área
     */
    public function scopePorArea(Builder $query, int $areaId): Builder
    {
        return $query->where('area_id', $areaId);
    }

    /**
     * Scope para equipos por centro
     */
    public function scopePorCentro(Builder $query, int $centroId): Builder
    {
        return $query->where('centro_id', $centroId);
    }

    /**
     * Scope para equipos con mantenimiento vencido
     */
    public function scopeMantenimientoVencido(Builder $query): Builder
    {
        return $query->where('fecha_mantenimiento', '<', now())
                    ->whereIn('status', [self::STATUS_ACTIVO, self::STATUS_DISPONIBLE]);
    }

    /**
     * Scope para equipos con calibración vencida
     */
    public function scopeCalibracionVencida(Builder $query): Builder
    {
        return $query->whereHas('calibraciones', function($q) {
            $q->where('fecha_programada', '<', now())
              ->where('status', 1);
        });
    }

    /**
     * Scope para equipos con garantía vigente
     */
    public function scopeGarantiaVigente(Builder $query): Builder
    {
        return $query->where('fecha_vencimiento_garantia', '>', now());
    }

    /**
     * Scope para equipos con garantía vencida
     */
    public function scopeGarantiaVencida(Builder $query): Builder
    {
        return $query->where('fecha_vencimiento_garantia', '<', now());
    }

    /**
     * Scope para búsqueda general
     */
    public function scopeBuscar(Builder $query, string $termino): Builder
    {
        return $query->where(function($q) use ($termino) {
            $q->where('code', 'LIKE', "%{$termino}%")
              ->orWhere('name', 'LIKE', "%{$termino}%")
              ->orWhere('marca', 'LIKE', "%{$termino}%")
              ->orWhere('modelo', 'LIKE', "%{$termino}%")
              ->orWhere('serial', 'LIKE', "%{$termino}%")
              ->orWhere('descripcion', 'LIKE', "%{$termino}%");
        });
    }

    /**
     * Scope para equipos críticos
     */
    public function scopeCriticos(Builder $query): Builder
    {
        return $query->whereHas('clasificacionRiesgo', function($q) {
            $q->where('name', 'LIKE', '%alto%')
              ->orWhere('name', 'LIKE', '%crítico%');
        });
    }

    /**
     * Scope para equipos móviles
     */
    public function scopeMoviles(Builder $query): Builder
    {
        return $query->where('movilidad', true);
    }

    /**
     * Scope para equipos en comodato
     */
    public function scopeEnComodato(Builder $query): Builder
    {
        return $query->where('activo_comodato', true);
    }

    /**
     * Scope para equipos que requieren calibración
     */
    public function scopeRequierenCalibracion(Builder $query): Builder
    {
        return $query->where('calibracion', true);
    }

    // ==========================================
    // MÉTODOS EMPRESARIALES DE UTILIDAD
    // ==========================================

    /**
     * Obtener estados válidos del equipo
     */
    public static function getValidStatuses(): array
    {
        return [
            self::STATUS_ACTIVO,
            self::STATUS_INACTIVO,
            self::STATUS_MANTENIMIENTO,
            self::STATUS_BAJA,
            self::STATUS_REPARACION,
            self::STATUS_CALIBRACION,
            self::STATUS_GARANTIA,
            self::STATUS_PRESTAMO,
            self::STATUS_RESERVADO,
            self::STATUS_DISPONIBLE
        ];
    }

    /**
     * Obtener tipos de mantenimiento válidos
     */
    public static function getTiposMantenimiento(): array
    {
        return [
            self::MANTENIMIENTO_PREVENTIVO,
            self::MANTENIMIENTO_CORRECTIVO,
            self::MANTENIMIENTO_PREDICTIVO,
            self::MANTENIMIENTO_EMERGENCIA
        ];
    }

    /**
     * Obtener niveles de criticidad válidos
     */
    public static function getNivelesCriticidad(): array
    {
        return [
            self::CRITICIDAD_BAJA,
            self::CRITICIDAD_MEDIA,
            self::CRITICIDAD_ALTA,
            self::CRITICIDAD_CRITICA
        ];
    }

    // ==========================================
    // ACCESSORS Y MUTATORS EMPRESARIALES
    // ==========================================

    /**
     * Accessor para obtener el nombre completo del equipo
     */
    public function getNombreCompletoAttribute(): string
    {
        return "{$this->code} - {$this->name}";
    }

    /**
     * Accessor para obtener la ubicación completa
     */
    public function getUbicacionCompletaAttribute(): string
    {
        $ubicacion = [];

        if ($this->centro) {
            $ubicacion[] = $this->centro->name;
        }
        if ($this->area) {
            $ubicacion[] = $this->area->name;
        }
        if ($this->piso) {
            $ubicacion[] = "Piso {$this->piso->name}";
        }
        if ($this->zona) {
            $ubicacion[] = $this->zona->name;
        }

        return implode(' - ', $ubicacion) ?: 'Sin ubicación definida';
    }

    /**
     * Accessor para verificar si el equipo está activo
     */
    public function getEsActivoAttribute(): bool
    {
        return $this->status === self::STATUS_ACTIVO;
    }

    /**
     * Accessor para verificar si el mantenimiento está vencido
     */
    public function getMantenimientoVencidoAttribute(): bool
    {
        return $this->fecha_mantenimiento &&
               $this->fecha_mantenimiento->isPast() &&
               in_array($this->status, [self::STATUS_ACTIVO, self::STATUS_DISPONIBLE]);
    }

    /**
     * Accessor para verificar si la garantía está vigente
     */
    public function getGarantiaVigenteAttribute(): bool
    {
        return $this->fecha_vencimiento_garantia &&
               $this->fecha_vencimiento_garantia->isFuture();
    }

    /**
     * Accessor para obtener días hasta próximo mantenimiento
     */
    public function getDiasProximoMantenimientoAttribute(): ?int
    {
        if (!$this->fecha_mantenimiento) {
            return null;
        }

        return now()->diffInDays($this->fecha_mantenimiento, false);
    }

    /**
     * Accessor para obtener la edad del equipo en años
     */
    public function getEdadEquipoAttribute(): ?int
    {
        if (!$this->fecha_ad) {
            return null;
        }

        return $this->fecha_ad->diffInYears(now());
    }

    /**
     * Mutator para el código del equipo (siempre en mayúsculas)
     */
    public function setCodeAttribute($value): void
    {
        $this->attributes['code'] = strtoupper(trim($value));
    }

    /**
     * Mutator para el nombre del equipo (formato título)
     */
    public function setNameAttribute($value): void
    {
        $this->attributes['name'] = ucwords(strtolower(trim($value)));
    }

    /**
     * Mutator para la marca (formato título)
     */
    public function setMarcaAttribute($value): void
    {
        $this->attributes['marca'] = ucwords(strtolower(trim($value)));
    }

    /**
     * Mutator para el modelo (formato título)
     */
    public function setModeloAttribute($value): void
    {
        $this->attributes['modelo'] = ucwords(strtolower(trim($value)));
    }

    /**
     * Mutator para el serial (mayúsculas y sin espacios)
     */
    public function setSerialAttribute($value): void
    {
        $this->attributes['serial'] = strtoupper(str_replace(' ', '', trim($value)));
    }

    // ==========================================
    // MÉTODOS DE NEGOCIO EMPRESARIALES
    // ==========================================

    /**
     * Cambiar estado del equipo con validaciones de negocio
     */
    public function cambiarEstado(string $nuevoEstado, string $motivo = null, int $usuarioId = null): bool
    {
        try {
            // Validar que el nuevo estado sea válido
            if (!in_array($nuevoEstado, self::getValidStatuses())) {
                throw new Exception("Estado '{$nuevoEstado}' no es válido");
            }

            // Validaciones de negocio específicas
            if ($this->status === self::STATUS_BAJA && $nuevoEstado !== self::STATUS_BAJA) {
                throw new Exception("No se puede cambiar el estado de un equipo dado de baja");
            }

            $estadoAnterior = $this->status;

            DB::beginTransaction();

            // Actualizar estado
            $this->status = $nuevoEstado;
            $this->save();

            // Registrar el cambio en auditoría
            $this->registrarCambioEstado($estadoAnterior, $nuevoEstado, $motivo, $usuarioId);

            DB::commit();

            // Limpiar cache
            $this->limpiarCache();

            Log::info("Estado del equipo {$this->code} cambiado de {$estadoAnterior} a {$nuevoEstado}", [
                'equipo_id' => $this->id,
                'usuario_id' => $usuarioId,
                'motivo' => $motivo
            ]);

            return true;

        } catch (Exception $e) {
            DB::rollBack();

            Log::error("Error al cambiar estado del equipo {$this->code}: " . $e->getMessage(), [
                'equipo_id' => $this->id,
                'estado_actual' => $this->status,
                'nuevo_estado' => $nuevoEstado,
                'usuario_id' => $usuarioId
            ]);

            return false;
        }
    }

    /**
     * Programar próximo mantenimiento
     */
    public function programarMantenimiento(Carbon $fechaMantenimiento, string $tipo = self::MANTENIMIENTO_PREVENTIVO): bool
    {
        try {
            // Validaciones
            if ($fechaMantenimiento->isPast()) {
                throw new Exception("La fecha de mantenimiento no puede ser en el pasado");
            }

            if ($this->status === self::STATUS_BAJA) {
                throw new Exception("No se puede programar mantenimiento para equipos dados de baja");
            }

            DB::beginTransaction();

            $this->fecha_mantenimiento = $fechaMantenimiento;
            $this->save();

            // Crear registro de mantenimiento programado
            $this->mantenimientos()->create([
                'tipo' => $tipo,
                'fecha_programada' => $fechaMantenimiento,
                'status' => 'programado',
                'descripcion' => "Mantenimiento {$tipo} programado automáticamente"
            ]);

            DB::commit();

            Log::info("Mantenimiento programado para equipo {$this->code}", [
                'equipo_id' => $this->id,
                'fecha_mantenimiento' => $fechaMantenimiento->toDateString(),
                'tipo' => $tipo
            ]);

            return true;

        } catch (Exception $e) {
            DB::rollBack();

            Log::error("Error al programar mantenimiento para equipo {$this->code}: " . $e->getMessage(), [
                'equipo_id' => $this->id,
                'fecha_mantenimiento' => $fechaMantenimiento->toDateString()
            ]);

            return false;
        }
    }

    /**
     * Validar integridad de datos del equipo
     */
    public function validarIntegridad(): array
    {
        $errores = [];

        // Validar relaciones críticas
        if (!$this->servicio) {
            $errores[] = "El equipo no tiene servicio asignado";
        }

        if (!$this->area) {
            $errores[] = "El equipo no tiene área asignada";
        }

        // Validar fechas lógicas
        if ($this->fecha_instalacion && $this->fecha_ad && $this->fecha_instalacion->lt($this->fecha_ad)) {
            $errores[] = "La fecha de instalación no puede ser anterior a la fecha de adquisición";
        }

        // Validar garantía
        if ($this->fecha_vencimiento_garantia && $this->fecha_ad && $this->fecha_vencimiento_garantia->lt($this->fecha_ad)) {
            $errores[] = "La fecha de vencimiento de garantía no puede ser anterior a la fecha de adquisición";
        }

        // Validar vida útil
        if ($this->vida_util && $this->vida_util <= 0) {
            $errores[] = "La vida útil debe ser mayor a 0";
        }

        return $errores;
    }

    /**
     * Obtener estadísticas del equipo
     */
    public function obtenerEstadisticas(): array
    {
        return Cache::remember(
            self::CACHE_PREFIX . "stats_{$this->id}",
            self::CACHE_TTL,
            function () {
                return [
                    'total_mantenimientos' => $this->mantenimientos()->count(),
                    'mantenimientos_preventivos' => $this->mantenimientos()->where('tipo', self::MANTENIMIENTO_PREVENTIVO)->count(),
                    'mantenimientos_correctivos' => $this->mantenimientos()->where('tipo', self::MANTENIMIENTO_CORRECTIVO)->count(),
                    'total_calibraciones' => $this->calibraciones()->count(),
                    'calibraciones_vigentes' => $this->calibraciones()->where('status', 1)->count(),
                    'total_contingencias' => $this->contingencias()->count(),
                    'contingencias_abiertas' => $this->contingencias()->where('status', 'abierta')->count(),
                    'edad_equipo_anos' => $this->edad_equipo,
                    'dias_proximo_mantenimiento' => $this->dias_proximo_mantenimiento,
                    'garantia_vigente' => $this->garantia_vigente,
                    'ubicacion_completa' => $this->ubicacion_completa,
                    'es_critico' => $this->clasificacionRiesgo && str_contains(strtolower($this->clasificacionRiesgo->name), 'alto'),
                    'requiere_calibracion' => $this->calibracion,
                    'es_movil' => $this->movilidad,
                    'en_comodato' => $this->activo_comodato
                ];
            }
        );
    }

    // ==========================================
    // MÉTODOS PRIVADOS DE SOPORTE
    // ==========================================

    /**
     * Registrar cambio de estado en auditoría
     */
    private function registrarCambioEstado(string $estadoAnterior, string $nuevoEstado, ?string $motivo, ?int $usuarioId): void
    {
        // Aquí se registraría en una tabla de auditoría
        // Por ahora solo log
        Log::info("Cambio de estado registrado", [
            'equipo_id' => $this->id,
            'estado_anterior' => $estadoAnterior,
            'nuevo_estado' => $nuevoEstado,
            'motivo' => $motivo,
            'usuario_id' => $usuarioId,
            'timestamp' => now()
        ]);
    }

    /**
     * Limpiar cache relacionado con el equipo
     */
    private function limpiarCache(): void
    {
        Cache::forget(self::CACHE_PREFIX . "stats_{$this->id}");
        Cache::forget(self::CACHE_PREFIX . "ubicacion_{$this->id}");
        Cache::forget(self::CACHE_PREFIX . "mantenimientos_{$this->id}");
    }

    // ==========================================
    // EVENTOS DEL MODELO
    // ==========================================

    /**
     * Boot del modelo para eventos
     */
    protected static function boot()
    {
        parent::boot();

        // Evento al crear
        static::creating(function ($equipo) {
            // Generar código automático si no se proporciona
            if (empty($equipo->code)) {
                $equipo->code = self::generarCodigoAutomatico();
            }

            // Validar datos antes de crear
            $errores = $equipo->validarIntegridad();
            if (!empty($errores)) {
                Log::warning("Advertencias al crear equipo", $errores);
            }
        });

        // Evento al actualizar
        static::updating(function ($equipo) {
            // Limpiar cache al actualizar
            $equipo->limpiarCache();
        });

        // Evento al eliminar
        static::deleting(function ($equipo) {
            // Limpiar cache al eliminar
            $equipo->limpiarCache();

            Log::info("Equipo eliminado", [
                'equipo_id' => $equipo->id,
                'code' => $equipo->code,
                'name' => $equipo->name
            ]);
        });
    }

    /**
     * Generar código automático para el equipo
     */
    private static function generarCodigoAutomatico(): string
    {
        $prefijo = 'EQ';
        $numero = self::max('id') + 1;
        return $prefijo . str_pad($numero, 6, '0', STR_PAD_LEFT);
    }
}
