<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Archivo extends Model
{
    protected $table = 'archivos';
    protected $primaryKey = 'id';
    public $timestamps = false; // La tabla usa created_at personalizado

    protected $fillable = [
        'name'
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    // Relaciones
    public function equipos()
    {
        return $this->belongsToMany(Equipo::class, 'equipo_archivo', 'archivo_id', 'equipo_id');
    }
}
