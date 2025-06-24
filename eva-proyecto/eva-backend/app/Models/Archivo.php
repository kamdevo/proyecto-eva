<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Modelo para la tabla archivos
 * Gestiona documentos, imágenes y archivos adjuntos
 */
class Archivo extends Model
{
    protected $table = 'archivos';
    protected $primaryKey = 'id';
    public $timestamps = true;

    protected $fillable = [
        'name',
        'description',
        'file_name',
        'file_path',
        'file_size',
        'extension',
        'mime_type',
        'tipo',
        'categoria',
        'equipo_id',
        'usuario_id',
        'publico',
        'activo',
        'descargas'
    ];

    protected $casts = [
        'publico' => 'boolean',
        'activo' => 'boolean',
        'file_size' => 'integer',
        'descargas' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    // Relaciones
    public function equipo()
    {
        return $this->belongsTo(Equipo::class, 'equipo_id');
    }

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'usuario_id');
    }

    // Scopes
    public function scopeActivos($query)
    {
        return $query->where('activo', true);
    }

    public function scopePublicos($query)
    {
        return $query->where('publico', true);
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
    public function getFileSizeFormattedAttribute()
    {
        $bytes = $this->file_size;
        if ($bytes == 0) return '0 B';

        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $factor = floor(log($bytes, 1024));

        return round($bytes / pow(1024, $factor), 2) . ' ' . $units[$factor];
    }

    public function getFileUrlAttribute()
    {
        if ($this->file_path) {
            return asset('storage/' . $this->file_path);
        }
        return null;
    }

    // Constantes para tipos de archivo
    const TIPO_MANUAL = 'manual';
    const TIPO_IMAGEN = 'imagen';
    const TIPO_DOCUMENTO = 'documento';
    const TIPO_CERTIFICADO = 'certificado';
    const TIPO_REPORTE = 'reporte';
    const TIPO_OTRO = 'otro';

    public static function getTipos()
    {
        return [
            self::TIPO_MANUAL,
            self::TIPO_IMAGEN,
            self::TIPO_DOCUMENTO,
            self::TIPO_CERTIFICADO,
            self::TIPO_REPORTE,
            self::TIPO_OTRO
        ];
    }
}
