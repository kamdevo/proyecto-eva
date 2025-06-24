<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

/**
 * Modelo para la tabla correctivo_general
 * Gestiona mantenimientos correctivos y reparaciones
 */
class CorrectivoGeneral extends Model
{
    protected $table = 'correctivo_general';
    protected $primaryKey = 'id';
    public $timestamps = true;

    protected $fillable = [
        'equipo_id',
        'descripcion',
        'fecha',
        'tecnico_id',
        'prioridad',
        'estado',
        'tipo_falla',
        'causa_falla',
        'solucion',
        'observaciones',
        'observaciones_finales',
        'costo_estimado',
        'costo_real',
        'tiempo_estimado',
        'tiempo_real',
        'repuestos_utilizados',
        'fecha_completado',
        'archivo',
        'archivo_reporte'
    ];

    protected $casts = [
        'fecha' => 'date',
        'fecha_completado' => 'datetime',
        'costo_estimado' => 'decimal:2',
        'costo_real' => 'decimal:2',
        'tiempo_estimado' => 'integer',
        'tiempo_real' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    // Relaciones
    public function equipo()
    {
        return $this->belongsTo(Equipo::class, 'equipo_id');
    }

    public function tecnico()
    {
        return $this->belongsTo(Usuario::class, 'tecnico_id');
    }

    // Scopes
    public function scopeProgramados($query)
    {
        return $query->where('estado', 'programado');
    }

    public function scopeEnProceso($query)
    {
        return $query->where('estado', 'en_proceso');
    }

    public function scopeCompletados($query)
    {
        return $query->where('estado', 'completado');
    }

    public function scopePorPrioridad($query, $prioridad)
    {
        return $query->where('prioridad', $prioridad);
    }

    // Accessors
    public function getTiempoTranscurridoAttribute()
    {
        if (in_array($this->estado, ['programado', 'en_proceso'])) {
            return Carbon::parse($this->fecha)->diffForHumans();
        }
        return null;
    }

    public function getVariacionCostoAttribute()
    {
        if ($this->costo_estimado && $this->costo_real) {
            return $this->costo_real - $this->costo_estimado;
        }
        return null;
    }

    public function getVariacionTiempoAttribute()
    {
        if ($this->tiempo_estimado && $this->tiempo_real) {
            return $this->tiempo_real - $this->tiempo_estimado;
        }
        return null;
    }

    // Constantes
    const PRIORIDAD_BAJA = 'baja';
    const PRIORIDAD_MEDIA = 'media';
    const PRIORIDAD_ALTA = 'alta';
    const PRIORIDAD_URGENTE = 'urgente';

    const ESTADO_PROGRAMADO = 'programado';
    const ESTADO_EN_PROCESO = 'en_proceso';
    const ESTADO_COMPLETADO = 'completado';
    const ESTADO_CANCELADO = 'cancelado';

    public static function getPrioridades()
    {
        return [
            self::PRIORIDAD_BAJA,
            self::PRIORIDAD_MEDIA,
            self::PRIORIDAD_ALTA,
            self::PRIORIDAD_URGENTE
        ];
    }

    public static function getEstados()
    {
        return [
            self::ESTADO_PROGRAMADO,
            self::ESTADO_EN_PROCESO,
            self::ESTADO_COMPLETADO,
            self::ESTADO_CANCELADO
        ];
    }
}
