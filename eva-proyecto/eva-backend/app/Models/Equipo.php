<?php

namespace App\Models;

use App\Traits\Auditable;
use App\Traits\Cacheable;
use App\Traits\ValidatesData;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Equipo extends Model
{
    use HasFactory, Auditable, Cacheable, ValidatesData, SoftDeletes;
    protected $table = 'equipos';
    protected $primaryKey = 'id';
    public $timestamps = true;

    protected $fillable = [
        'image',
        'code',
        'name',
        'descripcion',
        'status',
        'marca',
        'modelo',
        'serial',
        'invima',
        'fecha_ad',
        'servicio_id',
        'fuente_id',
        'tecnologia_id',
        'frecuencia_id',
        'cbiomedica_id',
        'criesgo_id',
        'tadquisicion_id',
        'invima_id',
        'orden_compra_id',
        'baja_id',
        'file',
        'fecha_instalacion',
        'vida_util',
        'observacion',
        'fecha',
        'v1',
        'v2',
        'v3',
        'fecha_mantenimiento',
        'estado_mantenimiento',
        'costo',
        'plan',
        'garantia',
        'estadoequipo_id',
        'archivo_invima',
        'manual',
        'plano',
        'necesidad_id',
        'fecha_vencimiento_garantia',
        'fecha_acta_recibo',
        'fecha_inicio_operacion',
        'fecha_fabricacion',
        'accesorios',
        'verificacion_inventario',
        'propiedad',
        'propietario_id',
        'otros',
        'fecha_recepcion_almacen',
        'activo_comodato',
        'movilidad',
        'codigo_antiguo',
        'evaluacion_desempenio',
        'periodicidad',
        'calibracion',
        'repuesto_pendiente',
        'area_id',
        'tipo_id',
        'guia_id',
        'manual_id',
        'localizacion_actual',
        'disponibilidad_id'
    ];

    protected $casts = [
        'fecha_ad' => 'date',
        'fecha_instalacion' => 'date',
        'fecha_vencimiento_garantia' => 'date',
        'fecha_acta_recibo' => 'date',
        'fecha_inicio_operacion' => 'date',
        'fecha_fabricacion' => 'date',
        'fecha_recepcion_almacen' => 'date',
        'status' => 'boolean',
        'verificacion_inventario' => 'boolean',
        'repuesto_pendiente' => 'boolean',
        'created_at' => 'datetime',
        'fecha_cambio' => 'datetime',
    ];

    // Relaciones
    public function servicio()
    {
        return $this->belongsTo(Servicio::class, 'servicio_id');
    }

    public function area()
    {
        return $this->belongsTo(Area::class, 'area_id');
    }

    public function propietario()
    {
        return $this->belongsTo(Propietario::class, 'propietario_id');
    }

    public function fuenteAlimentacion()
    {
        return $this->belongsTo(FuenteAlimentacion::class, 'fuente_id');
    }

    public function tecnologia()
    {
        return $this->belongsTo(Tecnologia::class, 'tecnologia_id');
    }

    public function frecuenciaMantenimiento()
    {
        return $this->belongsTo(FrecuenciaMantenimiento::class, 'frecuencia_id');
    }

    public function clasificacionBiomedica()
    {
        return $this->belongsTo(ClasificacionBiomedica::class, 'cbiomedica_id');
    }

    public function clasificacionRiesgo()
    {
        return $this->belongsTo(ClasificacionRiesgo::class, 'criesgo_id');
    }

    public function tipoAdquisicion()
    {
        return $this->belongsTo(TipoAdquisicion::class, 'tadquisicion_id');
    }

    public function estadoEquipo()
    {
        return $this->belongsTo(EstadoEquipo::class, 'estadoequipo_id');
    }

    public function tipo()
    {
        return $this->belongsTo(Tipo::class, 'tipo_id');
    }

    // Nota: Disponibilidad no existe en la estructura real de BD
    // public function disponibilidad()
    // {
    //     return $this->belongsTo(Disponibilidad::class, 'disponibilidad_id');
    // }

    /**
     * Scope para cargar relaciones optimizadas
     */
    public function scopeWithOptimizedRelations($query)
    {
        return $query->with([
            'servicio:id,nombre',
            'area:id,nombre',
            'propietario:id,nombre',
            'fuenteAlimentacion:id,nombre',
            'tecnologia:id,nombre',
            'frecuenciaMantenimiento:id,nombre',
            'clasificacionBiomedica:id,nombre',
            'clasificacionRiesgo:id,nombre',
            'estadoEquipo:id,nombre',
            'tipo:id,nombre'
        ]);
    }

    /**
     * Scope para equipos activos con relaciones
     */
    public function scopeActiveWithRelations($query)
    {
        return $query->where('status', true)->withOptimizedRelations();
    }

    /**
     * Scope para búsqueda optimizada
     */
    public function scopeSearch($query, $search)
    {
        return $query->where(function($q) use ($search) {
            $q->where('name', 'like', "%{$search}%")
              ->orWhere('code', 'like', "%{$search}%")
              ->orWhere('marca', 'like', "%{$search}%")
              ->orWhere('modelo', 'like', "%{$search}%")
              ->orWhere('serial', 'like', "%{$search}%");
        });
    }

    /**
     * Obtener equipos con mantenimientos pendientes (optimizado)
     */
    public function scopeWithPendingMaintenance($query)
    {
        return $query->whereHas('mantenimientos', function($q) {
            $q->where('status', 'programado')
              ->where('fecha_programada', '<=', now()->addDays(30));
        });
    }

    /**
     * Obtener equipos críticos (optimizado)
     */
    public function scopeCritical($query)
    {
        return $query->where('criesgo_id', 1); // Asumiendo que 1 = Alto riesgo
    }

    public function mantenimientos()
    {
        return $this->hasMany(Mantenimiento::class, 'equipo_id');
    }

    public function contingencias()
    {
        return $this->hasMany(Contingencia::class, 'equipo_id');
    }

    public function manuales()
    {
        return $this->hasMany(EquipoManual::class, 'equipo_id');
    }

    public function archivos()
    {
        return $this->hasMany(EquipoArchivo::class, 'equipo_id');
    }

    public function contactos()
    {
        return $this->hasMany(EquipoContacto::class, 'equipo_id');
    }

    public function especificaciones()
    {
        return $this->hasMany(EquipoEspecificacion::class, 'equipo_id');
    }

    public function repuestos()
    {
        return $this->hasMany(EquipoRepuesto::class, 'equipo_id');
    }

    public function calibraciones()
    {
        return $this->hasMany(Calibracion::class, 'equipo_id');
    }

    public function correctivos()
    {
        return $this->hasMany(CorrectivoGeneral::class, 'equipo_id');
    }

    public function observaciones()
    {
        return $this->hasMany(Observacion::class, 'equipo_id');
    }

    public function guiasRapidas()
    {
        return $this->hasMany(GuiaRapida::class, 'equipo_id');
    }

    public function planesMantenimiento()
    {
        return $this->hasMany(PlanMantenimiento::class, 'equipo_id');
    }

    public function capacitaciones()
    {
        return $this->belongsToMany(Capacitacion::class, 'capacitacion_equipo', 'equipo_id', 'capacitacion_id');
    }

    // Scopes útiles
    public function scopeActivos($query)
    {
        return $query->where('status', 1);
    }

    public function scopeInactivos($query)
    {
        return $query->where('status', 0);
    }

    public function scopePorServicio($query, $servicioId)
    {
        return $query->where('servicio_id', $servicioId);
    }

    public function scopePorArea($query, $areaId)
    {
        return $query->where('area_id', $areaId);
    }

    public function scopePorPropietario($query, $propietarioId)
    {
        return $query->where('propietario_id', $propietarioId);
    }

    // Accessors
    public function getEstadoTextoAttribute()
    {
        return $this->status ? 'Activo' : 'Inactivo';
    }

    public function getCostoFormateadoAttribute()
    {
        return $this->costo ? '$' . number_format($this->costo, 2) : null;
    }

    public function getVidaUtilRestanteAttribute()
    {
        if ($this->vida_util && $this->fecha_instalacion) {
            $fechaInstalacion = \Carbon\Carbon::parse($this->fecha_instalacion);
            $fechaVencimiento = $fechaInstalacion->addYears($this->vida_util);
            $hoy = \Carbon\Carbon::now();

            if ($fechaVencimiento->isFuture()) {
                return $hoy->diffInYears($fechaVencimiento);
            }
            return 0;
        }
        return null;
    }

    /**
     * Generate unique equipment code.
     */
    public static function generateCode(): string
    {
        do {
            $code = 'EQ-' . strtoupper(uniqid());
        } while (static::where('code', $code)->exists());

        return $code;
    }

    /**
     * Check if equipment is active.
     */
    public function isActive(): bool
    {
        return $this->status === 1;
    }

    /**
     * Check if equipment needs maintenance.
     */
    public function needsMaintenance(): bool
    {
        return $this->estado_mantenimiento === 1;
    }

    /**
     * Scope for equipment needing maintenance.
     */
    public function scopeNeedsMaintenance($query)
    {
        return $query->where('estado_mantenimiento', 1);
    }

    /**
     * Scope for equipment by risk.
     */
    public function scopeByRisk($query, $riskId)
    {
        return $query->where('criesgo_id', $riskId);
    }

    /**
     * Scope for equipment by technology.
     */
    public function scopeByTechnology($query, $technologyId)
    {
        return $query->where('tecnologia_id', $technologyId);
    }

    /**
     * Scope for equipment by status.
     */
    public function scopeByStatus($query, $statusId)
    {
        return $query->where('estadoequipo_id', $statusId);
    }

    /**
     * Scope for equipment by type.
     */
    public function scopeByType($query, $typeId)
    {
        return $query->where('tipo_id', $typeId);
    }

    /**
     * Clear related cache when equipment is updated.
     */
    protected function clearRelatedCache(): void
    {
        // Clear service-related cache
        if ($this->servicio_id) {
            cache()->forget("servicio:{$this->servicio_id}:equipos");
        }

        // Clear area-related cache
        if ($this->area_id) {
            cache()->forget("area:{$this->area_id}:equipos");
        }

        // Clear maintenance cache
        cache()->forget("equipos:mantenimiento");
    }
}
