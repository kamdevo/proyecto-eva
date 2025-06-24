<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Servicio extends Model
{
    protected $table = 'servicios';
    protected $primaryKey = 'id';
    public $timestamps = true;

    protected $fillable = [
        'nombre',
        'codigo',
        'descripcion',
        'tipo',
        'activo'
    ];

    protected $casts = [
        'activo' => 'boolean',
    ];

    // Relaciones
    public function areas()
    {
        return $this->hasMany(Area::class, 'servicio_id');
    }

    public function equipos()
    {
        return $this->hasMany(Equipo::class, 'servicio_id');
    }
}
