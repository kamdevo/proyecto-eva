<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Contingencia extends Model
{
    protected $table = 'contingencias';
    protected $primaryKey = 'id';
    public $timestamps = true;

    protected $fillable = [
        'descripcion',
        'fecha',
        'fecha_cierre',
        'archivo',
        'usuario_reporta',
        'equipo_id',
        'estado',
        'origen_contingencia',
        'severidad',
        'acciones_tomadas'
    ];

    protected $casts = [
        'fecha' => 'date',
        'fecha_cierre' => 'date',
    ];

    // Relaciones
    public function usuarioReporta()
    {
        return $this->belongsTo(Usuario::class, 'usuario_reporta');
    }

    public function equipo()
    {
        return $this->belongsTo(Equipo::class, 'equipo_id');
    }

    // Scopes
    public function scopeActivas($query)
    {
        return $query->where('estado', '!=', 'Cerrado');
    }

    public function scopeCerradas($query)
    {
        return $query->where('estado', 'Cerrado');
    }
}
