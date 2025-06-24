<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Area Model - Matches actual database structure
 * Table: areas
 * Columns: id, name, servicio_id, centro_id, piso_id
 */
class Area extends Model
{
    protected $table = 'areas';
    protected $primaryKey = 'id';
    public $timestamps = false; // No timestamps in actual table

    protected $fillable = [
        'name',
        'servicio_id',
        'centro_id',
        'piso_id'
    ];

    protected $casts = [
        'id' => 'integer',
        'servicio_id' => 'integer',
        'centro_id' => 'integer',
        'piso_id' => 'integer'
    ];

    // Relationships
    public function servicio()
    {
        return $this->belongsTo(Servicio::class, 'servicio_id');
    }

    public function centro()
    {
        return $this->belongsTo(Centro::class, 'centro_id');
    }

    public function piso()
    {
        return $this->belongsTo(Piso::class, 'piso_id');
    }

    public function equipos()
    {
        return $this->hasMany(Equipo::class, 'area_id');
    }

    // Scopes
    public function scopeByServicio($query, $servicioId)
    {
        return $query->where('servicio_id', $servicioId);
    }

    public function scopeByCentro($query, $centroId)
    {
        return $query->where('centro_id', $centroId);
    }
}
