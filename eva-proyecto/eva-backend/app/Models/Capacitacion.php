<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

/**
 * Modelo para la tabla capacitaciones
 * Gestiona entrenamientos y formación del personal
 */
class Capacitacion extends Model
{
    protected $table = 'capacitaciones';
    protected $primaryKey = 'id';
    public $timestamps = true;

    protected $fillable = [
        'titulo',
        'descripcion',
        'tipo',
        'modalidad',
        'fecha_inicio',
        'fecha_fin',
        'duracion_horas',
        'instructor_id',
        'lugar',
        'capacidad_maxima',
        'costo',
        'certificacion',
        'estado',
        'material_curso',
        'tema',
        'objetivos',
        'requisitos'
    ];

    protected $casts = [
        'fecha_inicio' => 'datetime',
        'fecha_fin' => 'datetime',
        'duracion_horas' => 'integer',
        'capacidad_maxima' => 'integer',
        'costo' => 'decimal:2',
        'certificacion' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    // Relaciones
    public function instructor()
    {
        return $this->belongsTo(Usuario::class, 'instructor_id');
    }

    public function participantes()
    {
        return $this->belongsToMany(Usuario::class, 'capacitacion_participantes', 'capacitacion_id', 'usuario_id')
                    ->withPivot('fecha_inscripcion', 'asistio', 'calificacion', 'aprobado')
                    ->withTimestamps();
    }

    public function equipos()
    {
        return $this->belongsToMany(Equipo::class, 'capacitacion_equipos', 'capacitacion_id', 'equipo_id');
    }

    public function evaluaciones()
    {
        return $this->hasMany(CapacitacionEvaluacion::class, 'capacitacion_id');
    }

    // Scopes
    public function scopeProgramadas($query)
    {
        return $query->where('estado', 'programada');
    }

    public function scopeEnCurso($query)
    {
        return $query->where('estado', 'en_curso');
    }

    public function scopeCompletadas($query)
    {
        return $query->where('estado', 'completada');
    }

    public function scopePorTipo($query, $tipo)
    {
        return $query->where('tipo', $tipo);
    }

    public function scopePorModalidad($query, $modalidad)
    {
        return $query->where('modalidad', $modalidad);
    }

    // Accessors
    public function getParticipantesInscritos()
    {
        return $this->participantes()->count();
    }

    public function getCuposDisponibles()
    {
        if (!$this->capacidad_maxima) return null;
        return $this->capacidad_maxima - $this->getParticipantesInscritos();
    }

    public function getPorcentajeOcupacion()
    {
        if (!$this->capacidad_maxima) return 0;
        return round(($this->getParticipantesInscritos() / $this->capacidad_maxima) * 100, 2);
    }

    public function getDuracionDias()
    {
        if ($this->fecha_inicio && $this->fecha_fin) {
            return Carbon::parse($this->fecha_inicio)->diffInDays(Carbon::parse($this->fecha_fin)) + 1;
        }
        return 1;
    }

    // Constantes
    const TIPO_INDUCCION = 'induccion';
    const TIPO_ACTUALIZACION = 'actualizacion';
    const TIPO_ESPECIALIZACION = 'especializacion';
    const TIPO_CERTIFICACION = 'certificacion';

    const MODALIDAD_PRESENCIAL = 'presencial';
    const MODALIDAD_VIRTUAL = 'virtual';
    const MODALIDAD_MIXTA = 'mixta';

    const ESTADO_PROGRAMADA = 'programada';
    const ESTADO_EN_CURSO = 'en_curso';
    const ESTADO_COMPLETADA = 'completada';
    const ESTADO_CANCELADA = 'cancelada';

    public static function getTipos()
    {
        return [
            self::TIPO_INDUCCION,
            self::TIPO_ACTUALIZACION,
            self::TIPO_ESPECIALIZACION,
            self::TIPO_CERTIFICACION
        ];
    }

    public static function getModalidades()
    {
        return [
            self::MODALIDAD_PRESENCIAL,
            self::MODALIDAD_VIRTUAL,
            self::MODALIDAD_MIXTA
        ];
    }

    public static function getEstados()
    {
        return [
            self::ESTADO_PROGRAMADA,
            self::ESTADO_EN_CURSO,
            self::ESTADO_COMPLETADA,
            self::ESTADO_CANCELADA
        ];
    }
}
