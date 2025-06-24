<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PlanMantenimiento extends Model
{
    use SoftDeletes;

    protected $table = 'planes_mantenimiento';
    protected $primaryKey = 'id';
    public $timestamps = true;

    protected $fillable = [
        'nombre',
        'descripcion',
        'tipo',
        'frecuencia',
        'equipo_id',
        'responsable_id',
        'creado_por',
        'duracion_estimada',
        'costo_estimado',
        'fecha_inicio',
        'fecha_fin',
        'instrucciones',
        'materiales',
        'herramientas',
        'estado',
        'activo'
    ];

    protected $casts = [
        'activo' => 'boolean',
        'duracion_estimada' => 'integer',
        'costo_estimado' => 'decimal:2',
        'fecha_inicio' => 'date',
        'fecha_fin' => 'date'
    ];

    protected $dates = [
        'fecha_inicio',
        'fecha_fin',
        'created_at',
        'updated_at',
        'deleted_at'
    ];

    // Relaciones
    public function equipo()
    {
        return $this->belongsTo(Equipo::class, 'equipo_id');
    }

    public function responsable()
    {
        return $this->belongsTo(Usuario::class, 'responsable_id');
    }

    public function creador()
    {
        return $this->belongsTo(Usuario::class, 'creado_por');
    }

    public function mantenimientos()
    {
        return $this->hasMany(Mantenimiento::class, 'plan_id');
    }

    // Scopes
    public function scopeActivos($query)
    {
        return $query->where('activo', true);
    }

    public function scopePorTipo($query, $tipo)
    {
        return $query->where('tipo', $tipo);
    }

    public function scopePorFrecuencia($query, $frecuencia)
    {
        return $query->where('frecuencia', $frecuencia);
    }

    public function scopePorEquipo($query, $equipoId)
    {
        return $query->where('equipo_id', $equipoId);
    }

    // Accessors
    public function getDuracionFormateadaAttribute()
    {
        if ($this->duracion_estimada) {
            $horas = floor($this->duracion_estimada / 60);
            $minutos = $this->duracion_estimada % 60;
            
            if ($horas > 0) {
                return $horas . 'h ' . $minutos . 'm';
            }
            return $minutos . 'm';
        }
        return null;
    }

    public function getCostoFormateadoAttribute()
    {
        if ($this->costo_estimado) {
            return '$' . number_format($this->costo_estimado, 2);
        }
        return null;
    }

    public function getProximaFechaAttribute()
    {
        // Calcular próxima fecha según frecuencia
        $fechaBase = $this->fecha_inicio;
        $hoy = now();

        switch ($this->frecuencia) {
            case 'diario':
                return $fechaBase->addDay();
            case 'semanal':
                return $fechaBase->addWeek();
            case 'mensual':
                return $fechaBase->addMonth();
            case 'bimestral':
                return $fechaBase->addMonths(2);
            case 'trimestral':
                return $fechaBase->addMonths(3);
            case 'semestral':
                return $fechaBase->addMonths(6);
            case 'anual':
                return $fechaBase->addYear();
            default:
                return $fechaBase;
        }
    }
}
