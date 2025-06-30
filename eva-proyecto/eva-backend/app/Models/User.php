<?php

namespace App\Models;

use App\Traits\Auditable;
use App\Traits\Cacheable;
use App\Traits\ValidatesData;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Facades\Hash;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, Auditable, Cacheable, ValidatesData;

    /**
     * The table associated with the model.
     */
    protected $table = 'usuarios';

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'nombre',
        'apellido',
        'telefono',
        'email',
        'username',
        'rol_id',
        'estado',
        'servicio_id',
        'centro_id',
        'code',
        'active',
        'id_empresa',
        'sede_id',
        'zona_id',
        'anio_plan'];

    /**
     * The attributes that should be hidden for serialization.
     */
    protected $hidden = [
        'remember_token'
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'estado' => 'boolean',
        'fecha_registro' => 'datetime',
        'rol_id' => 'integer',
        'servicio_id' => 'integer',
        'id_empresa' => 'integer',
        'zona_id' => 'integer',
        'anio_plan' => 'integer'
    ];

    /**
     * Validation rules.
     */
    protected $rules = [
        'nombre' => 'required|string|max:100',
        'apellido' => 'required|string|max:100',
        'email' => 'required|email|unique:usuarios,email',
        'username' => 'required|string|max:45|unique:usuarios,username',
        'password' => 'required|string|min:8',
        'telefono' => 'nullable|string|max:20',
        'rol_id' => 'required|integer|exists:roles,id',
        'servicio_id' => 'nullable|integer|exists:servicios,id',
        'centro_id' => 'nullable|string|max:100',
        'estado' => 'boolean',
        'id_empresa' => 'nullable|integer|exists:empresas,id',
        'sede_id' => 'nullable|string|max:10',
        'zona_id' => 'nullable|integer|exists:zonas,id',
        'anio_plan' => 'nullable|integer|min:2020|max:2030'];

    /**
     * Custom validation messages.
     */
    protected $messages = [
        'email.unique' => 'Este email ya está registrado en el sistema.',
        'username.unique' => 'Este nombre de usuario ya está en uso.',
        'password.min' => 'La contraseña debe tener al menos 8 caracteres.',
        'rol_id.exists' => 'El rol seleccionado no es válido.',
        'servicio_id.exists' => 'El servicio seleccionado no es válido.'];

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($user) {
            if (empty($user->password)) {
                $user->password = Hash::make('password123'); // Default password
            }
            
            if (empty($user->fecha_registro)) {
                $user->fecha_registro = now();
            }
        });
    }

    /**
     * Get the role that owns the user.
     */
    public function rol(): BelongsTo
    {
        return $this->belongsTo(Rol::class, 'rol_id');
    }

    /**
     * Get the service that owns the user.
     */
    public function servicio(): BelongsTo
    {
        return $this->belongsTo(Servicio::class, 'servicio_id');
    }

    /**
     * Get the company that owns the user.
     */
    public function empresa(): BelongsTo
    {
        return $this->belongsTo(Empresa::class, 'id_empresa');
    }

    /**
     * Get the zone that owns the user.
     */
    public function zona(): BelongsTo
    {
        return $this->belongsTo(Zona::class, 'zona_id');
    }

    /**
     * Get the zones for the user.
     */
    public function zonas(): BelongsToMany
    {
        return $this->belongsToMany(Zona::class, 'usuarios_zonas', 'usuario_id', 'zona_id')
                    ->withPivot('activo')
                    ->withTimestamps();
    }

    /**
     * Get the equipment managed by the user.
     */
    public function equipos(): HasMany
    {
        return $this->hasMany(Equipo::class, 'usuario_id');
    }

    /**
     * Get the maintenances performed by the user.
     */
    public function mantenimientos(): HasMany
    {
        return $this->hasMany(Mantenimiento::class, 'usuario_id');
    }

    /**
     * Get the contingencies reported by the user.
     */
    public function contingencias(): HasMany
    {
        return $this->hasMany(Contingencia::class, 'usuario_id');
    }

    /**
     * Get user's full name.
     */
    public function getFullNameAttribute(): string
    {
        return trim($this->nombre . ' ' . $this->apellido);
    }

    /**
     * Check if user is active.
     */
    public function isActive(): bool
    {
        return $this->estado && $this->active === 'true';
    }

    /**
     * Check if user has role.
     */
    public function hasRole(string $roleName): bool
    {
        return $this->rol && $this->rol->nombre === $roleName;
    }

    /**
     * Check if user can access service.
     */
    public function canAccessService(int $servicioId): bool
    {
        return $this->servicio_id === $servicioId || $this->hasRole('Administrador');
    }

    /**
     * Scope for active users.
     */
    public function scopeActive($query)
    {
        return $query->where('estado', true)->where('active', 'true');
    }

    /**
     * Scope for users by role.
     */
    public function scopeByRole($query, string $roleName)
    {
        return $query->whereHas('rol', function ($q) use ($roleName) {
            $q->where('nombre', $roleName);
        });
    }

    /**
     * Scope for users by service.
     */
    public function scopeByService($query, int $servicioId)
    {
        return $query->where('servicio_id', $servicioId);
    }

    /**
     * Clear related cache when user is updated.
     */
    protected function clearRelatedCache(): void
    {
        // Clear service-related cache
        if ($this->servicio_id) {
            cache()->forget("servicio:{$this->servicio_id}:usuarios");
        }
        
        // Clear role-related cache
        if ($this->rol_id) {
            cache()->forget("rol:{$this->rol_id}:usuarios");
        }
    }
}
