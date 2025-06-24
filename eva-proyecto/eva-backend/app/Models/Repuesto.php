<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Modelo para la tabla repuestos
 * Gestiona inventario y control de repuestos
 */
class Repuesto extends Model
{
    protected $table = 'repuestos';
    protected $primaryKey = 'id';
    public $timestamps = true;

    protected $fillable = [
        'nombre',
        'codigo',
        'descripcion',
        'numero_parte',
        'categoria',
        'equipo_id',
        'proveedor_id',
        'stock_actual',
        'stock_minimo',
        'stock_maximo',
        'precio_unitario',
        'unidad_medida',
        'ubicacion',
        'critico',
        'estado',
        'imagen',
        'observaciones'
    ];

    protected $casts = [
        'stock_actual' => 'integer',
        'stock_minimo' => 'integer',
        'stock_maximo' => 'integer',
        'precio_unitario' => 'decimal:2',
        'critico' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    // Relaciones
    public function equipo()
    {
        return $this->belongsTo(Equipo::class, 'equipo_id');
    }

    public function proveedor()
    {
        return $this->belongsTo(Proveedor::class, 'proveedor_id');
    }

    public function movimientos()
    {
        return $this->hasMany(RepuestoMovimiento::class, 'repuesto_id');
    }

    public function solicitudes()
    {
        return $this->hasMany(RepuestoSolicitud::class, 'repuesto_id');
    }

    // Scopes
    public function scopeActivos($query)
    {
        return $query->where('estado', 'activo');
    }

    public function scopeCriticos($query)
    {
        return $query->where('critico', true);
    }

    public function scopeBajoStock($query)
    {
        return $query->whereRaw('stock_actual <= stock_minimo');
    }

    public function scopePorCategoria($query, $categoria)
    {
        return $query->where('categoria', $categoria);
    }

    public function scopePorEquipo($query, $equipoId)
    {
        return $query->where('equipo_id', $equipoId);
    }

    // Accessors
    public function getNecesitaReposicionAttribute()
    {
        return $this->stock_actual <= $this->stock_minimo;
    }

    public function getValorTotalStockAttribute()
    {
        return $this->stock_actual * $this->precio_unitario;
    }

    public function getPorcentajeStockAttribute()
    {
        if ($this->stock_maximo <= 0) return 0;
        return round(($this->stock_actual / $this->stock_maximo) * 100, 2);
    }

    public function getEstadoStockAttribute()
    {
        if ($this->stock_actual <= 0) return 'agotado';
        if ($this->stock_actual <= $this->stock_minimo) return 'bajo';
        if ($this->stock_maximo && $this->stock_actual >= $this->stock_maximo) return 'alto';
        return 'normal';
    }

    public function getImagenUrlAttribute()
    {
        if ($this->imagen) {
            return asset('storage/' . $this->imagen);
        }
        return null;
    }

    // Métodos de negocio
    public function registrarEntrada($cantidad, $motivo, $documento = null, $observaciones = null)
    {
        $this->increment('stock_actual', $cantidad);
        
        return $this->movimientos()->create([
            'tipo' => 'entrada',
            'cantidad' => $cantidad,
            'stock_anterior' => $this->stock_actual - $cantidad,
            'stock_nuevo' => $this->stock_actual,
            'motivo' => $motivo,
            'documento' => $documento,
            'observaciones' => $observaciones,
            'usuario_id' => auth()->id(),
            'fecha' => now()
        ]);
    }

    public function registrarSalida($cantidad, $motivo, $equipoDestino = null, $documento = null, $observaciones = null)
    {
        if ($this->stock_actual < $cantidad) {
            throw new \Exception('Stock insuficiente');
        }

        $this->decrement('stock_actual', $cantidad);
        
        return $this->movimientos()->create([
            'tipo' => 'salida',
            'cantidad' => $cantidad,
            'stock_anterior' => $this->stock_actual + $cantidad,
            'stock_nuevo' => $this->stock_actual,
            'motivo' => $motivo,
            'equipo_destino' => $equipoDestino,
            'documento' => $documento,
            'observaciones' => $observaciones,
            'usuario_id' => auth()->id(),
            'fecha' => now()
        ]);
    }

    // Constantes
    const ESTADO_ACTIVO = 'activo';
    const ESTADO_INACTIVO = 'inactivo';
    const ESTADO_DESCONTINUADO = 'descontinuado';

    const CATEGORIA_ELECTRONICO = 'electronico';
    const CATEGORIA_MECANICO = 'mecanico';
    const CATEGORIA_CONSUMIBLE = 'consumible';
    const CATEGORIA_ACCESORIO = 'accesorio';
    const CATEGORIA_OTRO = 'otro';

    public static function getEstados()
    {
        return [
            self::ESTADO_ACTIVO,
            self::ESTADO_INACTIVO,
            self::ESTADO_DESCONTINUADO
        ];
    }

    public static function getCategorias()
    {
        return [
            self::CATEGORIA_ELECTRONICO,
            self::CATEGORIA_MECANICO,
            self::CATEGORIA_CONSUMIBLE,
            self::CATEGORIA_ACCESORIO,
            self::CATEGORIA_OTRO
        ];
    }
}
