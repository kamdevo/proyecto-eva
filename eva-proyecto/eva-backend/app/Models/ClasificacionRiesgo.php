<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Modelo para la tabla criesgo (clasificación de riesgo)
 * Gestiona los niveles de riesgo de los equipos médicos
 */
class ClasificacionRiesgo extends Model
{
    protected $table = 'criesgo';
    protected $primaryKey = 'id';
    public $timestamps = true;

    protected $fillable = [
        'name',
        'description',
        'nivel',
        'color',
        'activo'
    ];

    protected $casts = [
        'activo' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    // Relaciones
    public function equipos()
    {
        return $this->hasMany(Equipo::class, 'criesgo_id');
    }

    // Scopes
    public function scopeActivos($query)
    {
        return $query->where('activo', true);
    }

    public function scopePorNivel($query, $nivel)
    {
        return $query->where('nivel', $nivel);
    }

    // Accessors
    public function getTotalEquiposAttribute()
    {
        return $this->equipos()->where('status', true)->count();
    }

    // Constantes para niveles de riesgo
    const NIVEL_BAJO = 'BAJO';
    const NIVEL_MEDIO = 'MEDIO';
    const NIVEL_MEDIO_ALTO = 'MEDIO ALTO';
    const NIVEL_ALTO = 'ALTO';
    const NIVEL_CRITICO = 'CRÍTICO';

    public static function getNiveles()
    {
        return [
            self::NIVEL_BAJO,
            self::NIVEL_MEDIO,
            self::NIVEL_MEDIO_ALTO,
            self::NIVEL_ALTO,
            self::NIVEL_CRITICO
        ];
    }
}
