<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Modelo para la tabla materiales
 */
class Material extends Model
{
    // Nombre de la tabla
    protected $table = 'materiales';
    
    // Si la tabla no usa created_at y updated_at, descomentar la siguiente línea
    public $timestamps = false;

    // Campos que se pueden asignar en masa
    protected $fillable = [
        'codigo',
        'nombre',
        'descripcion',
        'cantidad',
        'precio_unitario'
    ];
}
