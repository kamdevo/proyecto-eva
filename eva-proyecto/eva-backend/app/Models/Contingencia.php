<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Contingencia Model - Matches actual database structure
 * Table: contingencias
 * Columns: id, fecha, observacion, file, created_at, equipo_id, usuario_id, estado_id, fecha_cierre
 */
class Contingencia extends Model
{
    protected $table = 'contingencias';
    protected $primaryKey = 'id';
    public $timestamps = true;

    protected $fillable = [
        'fecha',
        'observacion',
        'file',
        'equipo_id',
        'usuario_id',
        'estado_id',
        'fecha_cierre'
    ];

    protected $casts = [
        'fecha' => 'date',
        'fecha_cierre' => 'date',
        'created_at' => 'datetime',
        'equipo_id' => 'integer',
        'usuario_id' => 'integer',
        'estado_id' => 'integer'
    ];

    // Relationships
    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'usuario_id');
    }

    public function equipo()
    {
        return $this->belongsTo(Equipo::class, 'equipo_id');
    }

    public function estado()
    {
        return $this->belongsTo(EstadoContingencia::class, 'estado_id');
    }

    // Scopes
    public function scopeActivas($query)
    {
        return $query->where('estado_id', '!=', 2); // Assuming 2 is closed status
    }

    public function scopeCerradas($query)
    {
        return $query->where('estado_id', 2); // Assuming 2 is closed status
    }

    public function scopeByEquipo($query, $equipoId)
    {
        return $query->where('equipo_id', $equipoId);
    }

    public function scopeByUsuario($query, $usuarioId)
    {
        return $query->where('usuario_id', $usuarioId);
    }
}
