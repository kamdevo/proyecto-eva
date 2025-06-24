<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class GuiaRapida extends Model
{
    use SoftDeletes;

    protected $table = 'guias_rapidas';
    protected $primaryKey = 'id';
    public $timestamps = true;

    protected $fillable = [
        'titulo',
        'descripcion',
        'contenido',
        'categoria',
        'tipo',
        'equipo_id',
        'autor_id',
        'tags',
        'archivo_path',
        'archivo_nombre',
        'archivo_tamaño',
        'prioridad',
        'tiempo_estimado',
        'visualizaciones',
        'descargas',
        'activo'
    ];

    protected $casts = [
        'activo' => 'boolean',
        'prioridad' => 'integer',
        'tiempo_estimado' => 'integer',
        'visualizaciones' => 'integer',
        'descargas' => 'integer',
        'archivo_tamaño' => 'integer'
    ];

    protected $dates = [
        'created_at',
        'updated_at',
        'deleted_at'
    ];

    // Relaciones
    public function equipo()
    {
        return $this->belongsTo(Equipo::class, 'equipo_id');
    }

    public function autor()
    {
        return $this->belongsTo(Usuario::class, 'autor_id');
    }

    // Scopes
    public function scopeActivas($query)
    {
        return $query->where('activo', true);
    }

    public function scopePorCategoria($query, $categoria)
    {
        return $query->where('categoria', $categoria);
    }

    public function scopePorTipo($query, $tipo)
    {
        return $query->where('tipo', $tipo);
    }

    public function scopePorEquipo($query, $equipoId)
    {
        return $query->where('equipo_id', $equipoId);
    }

    // Accessors
    public function getArchivoUrlAttribute()
    {
        if ($this->archivo_path) {
            return asset('storage/' . $this->archivo_path);
        }
        return null;
    }

    public function getTiempoEstimadoFormateadoAttribute()
    {
        if ($this->tiempo_estimado) {
            $horas = floor($this->tiempo_estimado / 60);
            $minutos = $this->tiempo_estimado % 60;
            
            if ($horas > 0) {
                return $horas . 'h ' . $minutos . 'm';
            }
            return $minutos . 'm';
        }
        return null;
    }

    public function getTagsArrayAttribute()
    {
        if ($this->tags) {
            return explode(',', $this->tags);
        }
        return [];
    }
}
