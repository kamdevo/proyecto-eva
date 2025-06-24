<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UsuarioZona extends Model
{
    protected $table = 'usuarios_zonas';
    protected $primaryKey = 'id';
    public $timestamps = true;

    protected $fillable = [
        'usuario_id',
        'zona_id',
        'nombre_zona',
        'correo_electronico',
        'activo'
    ];

    protected $casts = [
        'activo' => 'boolean',
    ];

    // Relaciones
    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'usuario_id');
    }

    public function zona()
    {
        return $this->belongsTo(Zona::class, 'zona_id');
    }
}
