<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

/**
 * Modelo para la tabla tickets
 * Gestiona tickets de soporte y mesa de ayuda
 */
class Ticket extends Model
{
    protected $table = 'tickets';
    protected $primaryKey = 'id';
    public $timestamps = true;

    protected $fillable = [
        'numero_ticket',
        'titulo',
        'descripcion',
        'categoria',
        'prioridad',
        'estado',
        'equipo_id',
        'usuario_creador',
        'usuario_asignado',
        'fecha_creacion',
        'fecha_limite',
        'fecha_asignacion',
        'fecha_cierre',
        'solucion',
        'comentarios_cierre',
        'satisfaccion',
        'archivo_adjunto'
    ];

    protected $casts = [
        'fecha_creacion' => 'datetime',
        'fecha_limite' => 'date',
        'fecha_asignacion' => 'datetime',
        'fecha_cierre' => 'datetime',
        'satisfaccion' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    // Relaciones
    public function equipo()
    {
        return $this->belongsTo(Equipo::class, 'equipo_id');
    }

    public function usuarioCreador()
    {
        return $this->belongsTo(Usuario::class, 'usuario_creador');
    }

    public function usuarioAsignado()
    {
        return $this->belongsTo(Usuario::class, 'usuario_asignado');
    }

    public function comentarios()
    {
        return $this->hasMany(TicketComentario::class, 'ticket_id');
    }

    // Scopes
    public function scopeAbiertos($query)
    {
        return $query->whereIn('estado', ['abierto', 'en_proceso', 'pendiente']);
    }

    public function scopeCerrados($query)
    {
        return $query->where('estado', 'cerrado');
    }

    public function scopePorCategoria($query, $categoria)
    {
        return $query->where('categoria', $categoria);
    }

    public function scopePorPrioridad($query, $prioridad)
    {
        return $query->where('prioridad', $prioridad);
    }

    public function scopeVencidos($query)
    {
        return $query->where('fecha_limite', '<', now())
                    ->whereIn('estado', ['abierto', 'en_proceso', 'pendiente']);
    }

    // Accessors
    public function getTiempoTranscurridoAttribute()
    {
        if (in_array($this->estado, ['abierto', 'en_proceso', 'pendiente'])) {
            return Carbon::parse($this->fecha_creacion)->diffForHumans();
        }
        return null;
    }

    public function getHorasTranscurridasAttribute()
    {
        if (in_array($this->estado, ['abierto', 'en_proceso', 'pendiente'])) {
            return Carbon::parse($this->fecha_creacion)->diffInHours(now());
        }
        return null;
    }

    public function getTiempoResolucionAttribute()
    {
        if ($this->estado === 'cerrado' && $this->fecha_cierre) {
            return Carbon::parse($this->fecha_creacion)->diffInHours(Carbon::parse($this->fecha_cierre));
        }
        return null;
    }

    public function getEsVencidoAttribute()
    {
        return $this->fecha_limite &&
               $this->fecha_limite < now() &&
               in_array($this->estado, ['abierto', 'en_proceso', 'pendiente']);
    }

    // Constantes
    const CATEGORIA_SOPORTE_TECNICO = 'soporte_tecnico';
    const CATEGORIA_MANTENIMIENTO = 'mantenimiento';
    const CATEGORIA_CALIBRACION = 'calibracion';
    const CATEGORIA_CAPACITACION = 'capacitacion';
    const CATEGORIA_OTRO = 'otro';

    const PRIORIDAD_BAJA = 'baja';
    const PRIORIDAD_MEDIA = 'media';
    const PRIORIDAD_ALTA = 'alta';
    const PRIORIDAD_URGENTE = 'urgente';

    const ESTADO_ABIERTO = 'abierto';
    const ESTADO_EN_PROCESO = 'en_proceso';
    const ESTADO_PENDIENTE = 'pendiente';
    const ESTADO_RESUELTO = 'resuelto';
    const ESTADO_CERRADO = 'cerrado';

    public static function getCategorias()
    {
        return [
            self::CATEGORIA_SOPORTE_TECNICO,
            self::CATEGORIA_MANTENIMIENTO,
            self::CATEGORIA_CALIBRACION,
            self::CATEGORIA_CAPACITACION,
            self::CATEGORIA_OTRO
        ];
    }

    public static function getPrioridades()
    {
        return [
            self::PRIORIDAD_BAJA,
            self::PRIORIDAD_MEDIA,
            self::PRIORIDAD_ALTA,
            self::PRIORIDAD_URGENTE
        ];
    }

    public static function getEstados()
    {
        return [
            self::ESTADO_ABIERTO,
            self::ESTADO_EN_PROCESO,
            self::ESTADO_PENDIENTE,
            self::ESTADO_RESUELTO,
            self::ESTADO_CERRADO
        ];
    }
}
