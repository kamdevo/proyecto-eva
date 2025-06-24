<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Manual extends Model
{
    protected $table = 'manuales';
    protected $primaryKey = 'id';
    public $timestamps = false;

    protected $fillable = [
        'status',
        'descripcion',
        'fecha',
        'url'
    ];

    protected $casts = [
        'fecha' => 'datetime',
        'status' => 'boolean',
    ];

    // Relaciones
    public function equipos()
    {
        return $this->belongsToMany(Equipo::class, 'equipos_manuales', 'manual_id', 'equipo_id');
    }
}
