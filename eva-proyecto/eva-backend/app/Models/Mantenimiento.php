<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

/**
 * Modelo para la tabla mantenimiento
 * Gestiona mantenimientos preventivos, correctivos y calibraciones
 */
class Mantenimiento extends Model
{
    protected $table = 'mantenimiento';
    protected $primaryKey = 'id';
    public $timestamps = true;

    protected $fillable = [
        'equipo_id',
        'description',
        'fecha_programada',
        'fecha_inicio',
        'fecha_fin',
        'tecnico_id',
        'tipo',
        'status',
        'prioridad',
        'observacion',
        'observaciones',
        'repuestos_utilizados',
        'costo',
        'tiempo_estimado',
        'tiempo_real',
        'calificacion',
        'file',
        'file_reporte',
        'motivo_cancelacion',
        'fecha_cancelacion'
    ];

    protected $casts = [
        'fecha_programada' => 'date',
        'fecha_inicio' => 'date',
        'fecha_fin' => 'datetime',
        'fecha_cancelacion' => 'datetime',
        'costo' => 'decimal:2',
        'tiempo_estimado' => 'integer',
        'tiempo_real' => 'integer',
        'calificacion' => 'integer',
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

    public function observaciones()
    {
        return $this->hasMany(Observacion::class, 'preventivo_id');
    }

    // Scopes
    public function scopeProgramados($query)
    {
        return $query->where('status', 'programado');
    }

    public function scopeCompletados($query)
    {
        return $query->where('status', 'completado');
    }

    public function scopeVencidos($query)
    {
        return $query->where('status', 'programado')
                    ->where('fecha_programada', '<', now());
    }

    public function scopePorTipo($query, $tipo)
    {
        return $query->where('tipo', $tipo);
    }

    // Accessors
    public function getDiasVencidoAttribute()
    {
        if ($this->status === 'programado' && $this->fecha_programada < now()) {
            return Carbon::parse($this->fecha_programada)->diffInDays(now());
        }
        return 0;
    }

    public function getTiempoResolucionAttribute()
    {
        if ($this->fecha_inicio && $this->fecha_fin) {
            return Carbon::parse($this->fecha_inicio)->diffInHours(Carbon::parse($this->fecha_fin));
        }
        return null;
    }

    // Mutators
    public function setFechaProgramadaAttribute($value)
    {
        $this->attributes['fecha_programada'] = Carbon::parse($value)->format('Y-m-d');
    }
}
