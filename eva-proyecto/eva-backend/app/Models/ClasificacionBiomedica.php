<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ClasificacionBiomedica extends Model
{
    protected $table = 'cbiomedica';
    protected $primaryKey = 'id';
    public $timestamps = false;

    protected $fillable = [
        'nombre',
        'descripcion',
        'codigo',
        'activo'
    ];

    protected $casts = [
        'activo' => 'boolean'
    ];

    // Relaciones
    public function equipos()
    {
        return $this->hasMany(Equipo::class, 'clasificacion_biomedica_id');
    }

    // Scopes
    public function scopeActivos($query)
    {
        return $query->where('activo', true);
    }
}
