<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Modelo para la tabla tecnologiap (Tecnologías Predominantes)
 * Gestiona los tipos de tecnología de los equipos
 */
class Tecnologia extends Model
{
    protected $table = 'tecnologiap';
    protected $primaryKey = 'id';
    public $timestamps = false;

    protected $fillable = [
        'name',
        'status',
        'created_at'
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'status' => 'boolean',
    ];

    /**
     * Relación con equipos que usan esta tecnología
     */
    public function equipos()
    {
        return $this->hasMany(Equipo::class, 'tecnologia_id');
    }

    /**
     * Scope para obtener solo tecnologías activas
     */
    public function scopeActivas($query)
    {
        return $query->where('status', 1);
    }
}
