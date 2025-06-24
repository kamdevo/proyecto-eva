<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Modelo para la tabla fuenteal (Fuentes de Alimentación)
 * Gestiona los tipos de fuentes de alimentación de los equipos
 */
class FuenteAlimentacion extends Model
{
    protected $table = 'fuenteal';
    protected $primaryKey = 'id';
    public $timestamps = false;

    protected $fillable = [
        'name',
        'created_at',
        'status'
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'status' => 'boolean',
    ];

    /**
     * Relación con equipos que usan esta fuente de alimentación
     */
    public function equipos()
    {
        return $this->hasMany(Equipo::class, 'fuente_id');
    }

    /**
     * Scope para obtener solo fuentes activas
     */
    public function scopeActivas($query)
    {
        return $query->where('status', 1);
    }
}
