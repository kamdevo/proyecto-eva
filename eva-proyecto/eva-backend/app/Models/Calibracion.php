<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Calibracion extends Model
{
    protected $table = 'calibracion';
    protected $primaryKey = 'id';
    public $timestamps = true;

    protected $fillable = [
        'equipo_id',
        'fecha_calibracion',
        'fecha_vencimiento',
        'resultado',
        'observaciones',
        'certificado',
        'tecnico_id',
        'empresa_calibradora',
        'costo',
        'estado'
    ];

    protected $casts = [
        'fecha_calibracion' => 'date',
        'fecha_vencimiento' => 'date',
        'costo' => 'decimal:2',
        'equipo_id' => 'integer',
        'tecnico_id' => 'integer'
    ];

    // Relaciones
    public function equipo(): BelongsTo
    {
        return $this->belongsTo(Equipo::class, 'equipo_id');
    }

    public function tecnico(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'tecnico_id');
    }

    // Scopes
    public function scopeVigentes($query)
    {
        return $query->where('fecha_vencimiento', '>', now());
    }

    public function scopeVencidas($query)
    {
        return $query->where('fecha_vencimiento', '<=', now());
    }

    public function scopeByEquipo($query, $equipoId)
    {
        return $query->where('equipo_id', $equipoId);
    }
}
