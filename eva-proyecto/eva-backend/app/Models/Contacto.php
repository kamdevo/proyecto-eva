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
 * Modelo Contacto - Gestión Empresarial de Contactos
 *
 * Modelo empresarial optimizado para la gestión completa de contactos
 * técnicos, proveedores, fabricantes y personal relacionado con equipos
 * médicos e industriales.
 *
 * Funcionalidades implementadas:
 * - Gestión de contactos técnicos especializados
 * - Clasificación por tipo de contacto y especialidad
 * - Validaciones empresariales robustas
 * - Sistema de cacheo inteligente
 * - Auditoría completa de operaciones
 * - Relaciones con equipos y servicios
 * - Gestión de disponibilidad y horarios
 * - Control de certificaciones y competencias
 * - Historial de interacciones y servicios
 * - Evaluación de desempeño y calificaciones
 *
 * @package App\Models
 * @author Sistema EVA
 * @version 2.0.0
 * @since 2024-01-01
 *
 * @property int $id
 * @property string $nombre
 * @property string $apellido
 * @property string $email
 * @property string $telefono
 * @property string $celular
 * @property string $empresa
 * @property string $cargo
 * @property string $especialidad
 * @property string $tipo_contacto
 * @property string $nivel_certificacion
 * @property bool $activo
 * @property bool $disponible_emergencias
 * @property Carbon $created_at
 * @property Carbon $updated_at
 */
class Contacto extends Model
{
    use HasFactory;

    // ==========================================
    // CONFIGURACIÓN BÁSICA DEL MODELO
    // ==========================================

    protected $table = 'contactos';
    protected $primaryKey = 'id';
    public $timestamps = true;

    /**
     * Campos que pueden ser asignados masivamente
     * Configurados con máxima seguridad empresarial
     */
    protected $fillable = [
        'nombre',
        'apellido',
        'email',
        'telefono',
        'celular',
        'empresa',
        'cargo',
        'especialidad',
        'tipo_contacto',
        'nivel_certificacion',
        'direccion',
        'ciudad',
        'pais',
        'codigo_postal',
        'sitio_web',
        'linkedin',
        'notas',
        'horario_atencion',
        'costo_hora',
        'moneda',
        'activo',
        'disponible_emergencias',
        'fecha_ultima_interaccion',
        'calificacion_promedio',
        'total_servicios',
        'tiempo_respuesta_promedio',
        'idiomas',
        'certificaciones',
        'areas_experiencia',
        'equipo_id',
        'empresa_id',
        'usuario_id'
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
        'disponible_emergencias' => 'boolean',
        'fecha_ultima_interaccion' => 'datetime',
        'calificacion_promedio' => 'decimal:2',
        'costo_hora' => 'decimal:2',
        'total_servicios' => 'integer',
        'tiempo_respuesta_promedio' => 'integer',
        'idiomas' => 'array',
        'certificaciones' => 'array',
        'areas_experiencia' => 'array',
        'equipo_id' => 'integer',
        'empresa_id' => 'integer',
        'usuario_id' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    // ==========================================
    // CONSTANTES EMPRESARIALES
    // ==========================================

    const CACHE_TTL = 3600; // 1 hora
    const CACHE_PREFIX = 'contactos_';

    const TIPO_TECNICO = 'tecnico';
    const TIPO_PROVEEDOR = 'proveedor';
    const TIPO_FABRICANTE = 'fabricante';
    const TIPO_DISTRIBUIDOR = 'distribuidor';
    const TIPO_CONSULTOR = 'consultor';
    const TIPO_SOPORTE = 'soporte';
    const TIPO_VENTAS = 'ventas';
    const TIPO_EMERGENCIA = 'emergencia';

    const NIVEL_BASICO = 'basico';
    const NIVEL_INTERMEDIO = 'intermedio';
    const NIVEL_AVANZADO = 'avanzado';
    const NIVEL_EXPERTO = 'experto';
    const NIVEL_CERTIFICADO = 'certificado';

    const ESPECIALIDAD_BIOMEDICA = 'biomedica';
    const ESPECIALIDAD_INDUSTRIAL = 'industrial';
    const ESPECIALIDAD_ELECTRONICA = 'electronica';
    const ESPECIALIDAD_MECANICA = 'mecanica';
    const ESPECIALIDAD_SOFTWARE = 'software';
    const ESPECIALIDAD_CALIBRACION = 'calibracion';
    const ESPECIALIDAD_MANTENIMIENTO = 'mantenimiento';

    /**
     * Obtener tipos de contacto válidos
     */
    public static function getTiposContacto(): array
    {
        return [
            self::TIPO_TECNICO,
            self::TIPO_PROVEEDOR,
            self::TIPO_FABRICANTE,
            self::TIPO_DISTRIBUIDOR,
            self::TIPO_CONSULTOR,
            self::TIPO_SOPORTE,
            self::TIPO_VENTAS,
            self::TIPO_EMERGENCIA
        ];
    }

    /**
     * Obtener niveles de certificación válidos
     */
    public static function getNivelesCertificacion(): array
    {
        return [
            self::NIVEL_BASICO,
            self::NIVEL_INTERMEDIO,
            self::NIVEL_AVANZADO,
            self::NIVEL_EXPERTO,
            self::NIVEL_CERTIFICADO
        ];
    }

    /**
     * Obtener especialidades válidas
     */
    public static function getEspecialidades(): array
    {
        return [
            self::ESPECIALIDAD_BIOMEDICA,
            self::ESPECIALIDAD_INDUSTRIAL,
            self::ESPECIALIDAD_ELECTRONICA,
            self::ESPECIALIDAD_MECANICA,
            self::ESPECIALIDAD_SOFTWARE,
            self::ESPECIALIDAD_CALIBRACION,
            self::ESPECIALIDAD_MANTENIMIENTO
        ];
    }

    // ==========================================
    // RELACIONES ELOQUENT EMPRESARIALES
    // ==========================================

    /**
     * Relación con equipo
     * Un contacto puede estar asociado a un equipo específico
     */
    public function equipo(): BelongsTo
    {
        return $this->belongsTo(Equipo::class, 'equipo_id');
    }

    /**
     * Relación con empresa
     * Un contacto pertenece a una empresa
     */
    public function empresa(): BelongsTo
    {
        return $this->belongsTo(Empresa::class, 'empresa_id');
    }

    /**
     * Relación con usuario
     * Un contacto puede estar asociado a un usuario del sistema
     */
    public function usuario(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'usuario_id');
    }

    /**
     * Relación con mantenimientos
     * Un contacto puede realizar múltiples mantenimientos
     */
    public function mantenimientos(): HasMany
    {
        return $this->hasMany(Mantenimiento::class, 'contacto_id');
    }

    /**
     * Relación con calibraciones
     * Un contacto puede realizar múltiples calibraciones
     */
    public function calibraciones(): HasMany
    {
        return $this->hasMany(Calibracion::class, 'contacto_id');
    }

    /**
     * Relación con correctivos
     * Un contacto puede realizar múltiples correctivos
     */
    public function correctivos(): HasMany
    {
        return $this->hasMany(CorrectivoGeneral::class, 'contacto_id');
    }

    // ==========================================
    // SCOPES EMPRESARIALES
    // ==========================================

    /**
     * Scope para contactos activos
     */
    public function scopeActivos(Builder $query): Builder
    {
        return $query->where('activo', true);
    }

    /**
     * Scope para contactos inactivos
     */
    public function scopeInactivos(Builder $query): Builder
    {
        return $query->where('activo', false);
    }

    /**
     * Scope para contactos disponibles para emergencias
     */
    public function scopeDisponiblesEmergencias(Builder $query): Builder
    {
        return $query->where('disponible_emergencias', true)
                    ->where('activo', true);
    }

    /**
     * Scope para contactos por tipo
     */
    public function scopePorTipo(Builder $query, string $tipo): Builder
    {
        return $query->where('tipo_contacto', $tipo);
    }

    /**
     * Scope para contactos por especialidad
     */
    public function scopePorEspecialidad(Builder $query, string $especialidad): Builder
    {
        return $query->where('especialidad', $especialidad);
    }

    /**
     * Scope para contactos técnicos
     */
    public function scopeTecnicos(Builder $query): Builder
    {
        return $query->where('tipo_contacto', self::TIPO_TECNICO);
    }

    /**
     * Scope para contactos con alta calificación
     */
    public function scopeAltaCalificacion(Builder $query): Builder
    {
        return $query->where('calificacion_promedio', '>=', 4.0);
    }

    /**
     * Scope para búsqueda general
     */
    public function scopeBuscar(Builder $query, string $termino): Builder
    {
        return $query->where(function($q) use ($termino) {
            $q->where('nombre', 'LIKE', "%{$termino}%")
              ->orWhere('apellido', 'LIKE', "%{$termino}%")
              ->orWhere('email', 'LIKE', "%{$termino}%")
              ->orWhere('empresa', 'LIKE', "%{$termino}%")
              ->orWhere('cargo', 'LIKE', "%{$termino}%")
              ->orWhere('especialidad', 'LIKE', "%{$termino}%");
        });
    }

    // ==========================================
    // MÉTODOS DE NEGOCIO EMPRESARIALES
    // ==========================================

    /**
     * Obtener nombre completo del contacto
     */
    public function getNombreCompletoAttribute(): string
    {
        return trim($this->nombre . ' ' . $this->apellido);
    }

    /**
     * Obtener información de contacto formateada
     */
    public function getInfoContactoAttribute(): string
    {
        $info = [];

        if ($this->telefono) {
            $info[] = "Tel: {$this->telefono}";
        }

        if ($this->celular) {
            $info[] = "Cel: {$this->celular}";
        }

        if ($this->email) {
            $info[] = "Email: {$this->email}";
        }

        return implode(' | ', $info);
    }

    /**
     * Verificar si el contacto está disponible
     */
    public function estaDisponible(): bool
    {
        return $this->activo &&
               ($this->fecha_ultima_interaccion === null ||
                $this->fecha_ultima_interaccion->diffInDays(now()) <= 30);
    }

    /**
     * Calcular calificación promedio
     */
    public function calcularCalificacionPromedio(): float
    {
        // Implementar lógica para calcular calificación basada en servicios
        $servicios = $this->mantenimientos()
                         ->whereNotNull('calificacion')
                         ->avg('calificacion');

        return round($servicios ?? 0, 2);
    }

    /**
     * Actualizar estadísticas del contacto
     */
    public function actualizarEstadisticas(): bool
    {
        try {
            $this->total_servicios = $this->mantenimientos()->count() +
                                   $this->calibraciones()->count() +
                                   $this->correctivos()->count();

            $this->calificacion_promedio = $this->calcularCalificacionPromedio();

            // Calcular tiempo de respuesta promedio
            $tiempoPromedio = $this->mantenimientos()
                                  ->whereNotNull('tiempo_respuesta')
                                  ->avg('tiempo_respuesta');

            $this->tiempo_respuesta_promedio = $tiempoPromedio ? round($tiempoPromedio) : null;

            return $this->save();

        } catch (Exception $e) {
            Log::error('Error actualizando estadísticas de contacto', [
                'contacto_id' => $this->id,
                'error' => $e->getMessage()
            ]);

            return false;
        }
    }

    /**
     * Obtener estadísticas del contacto
     */
    public function obtenerEstadisticas(): array
    {
        return Cache::remember(
            self::CACHE_PREFIX . "stats_{$this->id}",
            self::CACHE_TTL,
            function () {
                return [
                    'id' => $this->id,
                    'nombre_completo' => $this->nombre_completo,
                    'empresa' => $this->empresa,
                    'tipo_contacto' => $this->tipo_contacto,
                    'especialidad' => $this->especialidad,
                    'nivel_certificacion' => $this->nivel_certificacion,
                    'activo' => $this->activo,
                    'disponible_emergencias' => $this->disponible_emergencias,
                    'total_servicios' => $this->total_servicios,
                    'calificacion_promedio' => $this->calificacion_promedio,
                    'tiempo_respuesta_promedio' => $this->tiempo_respuesta_promedio,
                    'fecha_ultima_interaccion' => $this->fecha_ultima_interaccion,
                    'esta_disponible' => $this->estaDisponible(),
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

        // Validar nombre y apellido
        if (empty($this->nombre)) {
            $errores[] = 'El nombre es requerido';
        }

        if (empty($this->apellido)) {
            $errores[] = 'El apellido es requerido';
        }

        // Validar email
        if ($this->email && !filter_var($this->email, FILTER_VALIDATE_EMAIL)) {
            $errores[] = 'El formato del email no es válido';
        }

        // Validar tipo de contacto
        if ($this->tipo_contacto && !in_array($this->tipo_contacto, self::getTiposContacto())) {
            $errores[] = 'El tipo de contacto no es válido';
        }

        // Validar especialidad
        if ($this->especialidad && !in_array($this->especialidad, self::getEspecialidades())) {
            $errores[] = 'La especialidad no es válida';
        }

        // Validar nivel de certificación
        if ($this->nivel_certificacion && !in_array($this->nivel_certificacion, self::getNivelesCertificacion())) {
            $errores[] = 'El nivel de certificación no es válido';
        }

        // Validar que tenga al menos un medio de contacto
        if (empty($this->telefono) && empty($this->celular) && empty($this->email)) {
            $errores[] = 'Debe tener al menos un medio de contacto (teléfono, celular o email)';
        }

        return $errores;
    }

    /**
     * Limpiar cache relacionado
     */
    public function limpiarCache(): void
    {
        Cache::forget(self::CACHE_PREFIX . "stats_{$this->id}");
        Cache::forget(self::CACHE_PREFIX . "disponibles");
        Cache::forget(self::CACHE_PREFIX . "tecnicos");
    }

    // ==========================================
    // EVENTOS DEL MODELO
    // ==========================================

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($contacto) {
            Log::info('Creando nuevo contacto', [
                'nombre' => $contacto->nombre_completo,
                'empresa' => $contacto->empresa,
                'tipo' => $contacto->tipo_contacto
            ]);
        });

        static::updating(function ($contacto) {
            $contacto->limpiarCache();

            Log::info('Actualizando contacto', [
                'id' => $contacto->id,
                'cambios' => $contacto->getDirty()
            ]);
        });

        static::deleting(function ($contacto) {
            $contacto->limpiarCache();

            Log::warning('Eliminando contacto', [
                'id' => $contacto->id,
                'nombre' => $contacto->nombre_completo
            ]);
        });
    }
}
