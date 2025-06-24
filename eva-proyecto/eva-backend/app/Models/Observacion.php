<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Observacion extends Model
{
    protected $table = 'observaciones';
    protected $primaryKey = 'id';
    public $timestamps = false;

    protected $fillable = [
        'description',
        'created_at',
        'equipo_id',
        'file',
        'usuario_id',
        'repuesto_id',
        'repuesto_pendiente',
        'preventivo_id',
        'fecha_nota'
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'fecha_nota' => 'date',
    ];

    // Relaciones
    public function equipo()
    {
        return $this->belongsTo(Equipo::class, 'equipo_id');
    }

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'usuario_id');
    }

    public function mantenimientoPreventivo()
    {
        return $this->belongsTo(Mantenimiento::class, 'preventivo_id');
    }

    public function archivos()
    {
        return $this->hasMany(ObservacionArchivo::class, 'observacion_id');
    }
}
