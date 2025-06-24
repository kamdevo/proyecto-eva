<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Usuario extends Authenticatable
{
    use HasApiTokens, Notifiable;

    protected $table = 'usuarios';
    protected $primaryKey = 'id';
    public $timestamps = true;

    protected $fillable = [
        'nombre',
        'apellido',
        'telefono',
        'email',
        'username',
        'password',
        'rol_id',
        'estado',
        'servicio_id',
        'centro_id',
        'code',
        'active',
        'fecha_registro',
        'id_empresa',
        'sede_id',
        'zona_id',
        'anio_plan'
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'fecha_registro' => 'datetime',
        'estado' => 'boolean',
        'anio_plan' => 'integer',
    ];

    // Relaciones basadas en estructura real de BD

    /**
     * Relación con el rol del usuario
     */
    public function rol()
    {
        return $this->belongsTo(Rol::class, 'rol_id');
    }

    /**
     * Relación con el servicio del usuario
     */
    public function servicio()
    {
        return $this->belongsTo(Servicio::class, 'servicio_id');
    }

    /**
     * Relación con el centro del usuario
     */
    public function centro()
    {
        return $this->belongsTo(Centro::class, 'centro_id');
    }

    /**
     * Relación con la sede del usuario
     */
    public function sede()
    {
        return $this->belongsTo(Sede::class, 'sede_id');
    }

    /**
     * Relación con la zona del usuario
     */
    public function zona()
    {
        return $this->belongsTo(Zona::class, 'zona_id');
    }

    /**
     * Relación con zonas asignadas al usuario
     */
    public function zonasUsuario()
    {
        return $this->hasMany(UsuarioZona::class, 'usuario_id');
    }

    /**
     * Relación con equipos responsables
     */
    public function equiposAsignados()
    {
        return $this->hasMany(Equipo::class, 'usuario_responsable');
    }

    /**
     * Relación con mantenimientos asignados como técnico
     */
    public function mantenimientosAsignados()
    {
        return $this->hasMany(Mantenimiento::class, 'tecnico_id');
    }

    /**
     * Relación con contingencias reportadas
     */
    public function contingenciasReportadas()
    {
        return $this->hasMany(Contingencia::class, 'usuario_id');
    }

    /**
     * Relación con observaciones creadas
     */
    public function observaciones()
    {
        return $this->hasMany(Observacion::class, 'usuario_id');
    }

    /**
     * Scope para obtener solo usuarios activos
     */
    public function scopeActivos($query)
    {
        return $query->where('estado', 1);
    }

    /**
     * Scope para obtener usuarios por rol
     */
    public function scopePorRol($query, $rolId)
    {
        return $query->where('rol_id', $rolId);
    }

    /**
     * Obtener nombre completo del usuario
     */
    public function getNombreCompletoAttribute()
    {
        return $this->nombre . ' ' . $this->apellido;
    }
}
