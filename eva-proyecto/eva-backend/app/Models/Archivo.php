<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;
use Exception;

/**
 * Modelo Archivo - Gestión Empresarial
 * 
 * Modelo empresarial optimizado para la tabla archivos
 * con funcionalidades avanzadas de seguridad, validación,
 * cacheo, auditoría y manejo de errores.
 * 
 * @package App\Models
 * @author Sistema EVA
 * @version 2.0.0
 * @since 2024-01-01
 */
class Archivo extends Model
{
    use HasFactory;

    // ==========================================
    // CONFIGURACIÓN BÁSICA DEL MODELO
    // ==========================================
    
    protected $table = 'archivos';
    protected $primaryKey = 'id';
    public $timestamps = false;

    /**
     * Campos que pueden ser asignados masivamente
     * Configurados con máxima seguridad empresarial
     */
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

    /**
     * Campos protegidos que no pueden ser asignados masivamente
     */
    protected $guarded = [
        'id'
    ];

    /**
     * Conversión automática de tipos (Type Casting)
     */
    protected $casts = [
        'file_size' => 'integer',
        'equipo_id' => 'integer',
        'usuario_id' => 'integer',
        'publico' => 'integer',
        'activo' => 'integer',
        'descargas' => 'integer'
    ];

    // ==========================================
    // CONSTANTES EMPRESARIALES
    // ==========================================
    
    const CACHE_TTL = 3600; // 1 hora
    const CACHE_PREFIX = 'archivos_';

    // ==========================================
    // RELACIONES ELOQUENT
    // ==========================================
    
    /**
     * Relación con Equipo
     */
    public function equipo(): BelongsTo
    {
        return $this->belongsTo(Equipo::class, 'equipo_id');
    }

    /**
     * Relación con Usuario
     */
    public function usuario(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'usuario_id');
    }

    // ==========================================
    // SCOPES EMPRESARIALES
    // ==========================================
    
    /**
     * Scope para registros activos
     */
    public function scopeActivos(Builder $query): Builder
    {
        return $query->where('status', 1)
                    ->orWhere('activo', 1)
                    ->orWhere('estado', 1);
    }

    /**
     * Scope para búsqueda general
     */
    public function scopeBuscar(Builder $query, string $termino): Builder
    {
        return $query->where(function($q) use ($termino) {
            $q->where('name', 'LIKE', "%{$termino}%")
              ->orWhere('nombre', 'LIKE', "%{$termino}%")
              ->orWhere('descripcion', 'LIKE', "%{$termino}%");
        });
    }

    // ==========================================
    // MÉTODOS DE NEGOCIO EMPRESARIALES
    // ==========================================
    
    /**
     * Obtener estadísticas del modelo
     */
    public function obtenerEstadisticas(): array
    {
        return Cache::remember(
            self::CACHE_PREFIX . "stats_{$this->id}",
            self::CACHE_TTL,
            function () {
                return [
                    'id' => $this->id,
                    'nombre_archivo' => $this->nombre_archivo,
                    'ruta_archivo' => $this->ruta_archivo,
                    'tipo_archivo' => $this->tipo_archivo,
                    'tamaño_bytes' => $this->tamaño_bytes,
                    'tamaño_mb' => round($this->tamaño_bytes / 1024 / 1024, 2),
                    'extension' => $this->extension,
                    'mime_type' => $this->mime_type,
                    'es_publico' => $this->es_publico,
                    'descargas' => $this->descargas,
                    'equipo_id' => $this->equipo_id,
                    'usuario_id' => $this->usuario_id,
                    'created_at' => $this->created_at,
                    'updated_at' => $this->updated_at
                ];
            }
        );
    }

    /**
     * Validar integridad de datos
     */
    public function validarIntegridad(): array
    {
        $errores = [];

        // Validar que el archivo existe físicamente
        if ($this->ruta_archivo && !file_exists(storage_path('app/' . $this->ruta_archivo))) {
            $errores[] = 'El archivo físico no existe en el sistema';
        }

        // Validar tamaño del archivo
        if ($this->tamaño_bytes && $this->tamaño_bytes <= 0) {
            $errores[] = 'El tamaño del archivo debe ser mayor a 0';
        }

        // Validar extensión permitida
        if ($this->extension && !in_array(strtolower($this->extension), self::getExtensionesPermitidas())) {
            $errores[] = 'La extensión del archivo no está permitida';
        }

        // Validar tipo de archivo
        if ($this->tipo_archivo && !in_array($this->tipo_archivo, self::getTiposPermitidos())) {
            $errores[] = 'El tipo de archivo no es válido';
        }

        // Validar relaciones
        if ($this->equipo_id && !$this->equipo) {
            $errores[] = 'El equipo asociado no existe';
        }

        if ($this->usuario_id && !$this->usuario) {
            $errores[] = 'El usuario asociado no existe';
        }

        return $errores;
    }

    /**
     * Limpiar cache relacionado
     */
    public function limpiarCache(): void
    {
        Cache::forget(self::CACHE_PREFIX . "stats_{$this->id}");
        Cache::forget(self::CACHE_PREFIX . "equipo_{$this->equipo_id}");
        Cache::forget(self::CACHE_PREFIX . "usuario_{$this->usuario_id}");
    }

    // ==========================================
    // CONSTANTES EMPRESARIALES
    // ==========================================

    const TIPO_MANUAL = 'manual';
    const TIPO_CERTIFICADO = 'certificado';
    const TIPO_GARANTIA = 'garantia';
    const TIPO_FACTURA = 'factura';
    const TIPO_FOTO = 'foto';
    const TIPO_PLANO = 'plano';
    const TIPO_ESPECIFICACION = 'especificacion';
    const TIPO_REPORTE = 'reporte';
    const TIPO_OTRO = 'otro';

    const MAX_TAMAÑO_MB = 50; // 50 MB máximo
    const MAX_DESCARGAS_DIARIAS = 100;

    /**
     * Obtener tipos de archivo permitidos
     */
    public static function getTiposPermitidos(): array
    {
        return [
            self::TIPO_MANUAL,
            self::TIPO_CERTIFICADO,
            self::TIPO_GARANTIA,
            self::TIPO_FACTURA,
            self::TIPO_FOTO,
            self::TIPO_PLANO,
            self::TIPO_ESPECIFICACION,
            self::TIPO_REPORTE,
            self::TIPO_OTRO
        ];
    }

    /**
     * Obtener extensiones permitidas
     */
    public static function getExtensionesPermitidas(): array
    {
        return [
            'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
            'jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg',
            'txt', 'csv', 'xml', 'json',
            'zip', 'rar', '7z',
            'mp4', 'avi', 'mov', 'wmv'
        ];
    }

    /**
     * Obtener tipos MIME permitidos
     */
    public static function getMimeTypesPermitidos(): array
    {
        return [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/bmp',
            'image/svg+xml',
            'text/plain',
            'text/csv',
            'application/json',
            'application/xml',
            'application/zip',
            'video/mp4'
        ];
    }

    // ==========================================
    // SCOPES EMPRESARIALES ADICIONALES
    // ==========================================

    /**
     * Scope para archivos por tipo
     */
    public function scopePorTipo(Builder $query, string $tipo): Builder
    {
        return $query->where('tipo_archivo', $tipo);
    }

    /**
     * Scope para archivos públicos
     */
    public function scopePublicos(Builder $query): Builder
    {
        return $query->where('es_publico', true);
    }

    /**
     * Scope para archivos privados
     */
    public function scopePrivados(Builder $query): Builder
    {
        return $query->where('es_publico', false);
    }

    /**
     * Scope para archivos por extensión
     */
    public function scopePorExtension(Builder $query, string $extension): Builder
    {
        return $query->where('extension', strtolower($extension));
    }

    /**
     * Scope para archivos grandes (> 10MB)
     */
    public function scopeGrandes(Builder $query): Builder
    {
        return $query->where('tamaño_bytes', '>', 10 * 1024 * 1024);
    }

    /**
     * Scope para archivos recientes (últimos 30 días)
     */
    public function scopeRecientes(Builder $query): Builder
    {
        return $query->where('created_at', '>=', now()->subDays(30));
    }

    // ==========================================
    // MÉTODOS DE NEGOCIO EMPRESARIALES
    // ==========================================

    /**
     * Obtener tamaño formateado
     */
    public function getTamañoFormateado(): string
    {
        $bytes = $this->tamaño_bytes;

        if ($bytes >= 1073741824) {
            return number_format($bytes / 1073741824, 2) . ' GB';
        } elseif ($bytes >= 1048576) {
            return number_format($bytes / 1048576, 2) . ' MB';
        } elseif ($bytes >= 1024) {
            return number_format($bytes / 1024, 2) . ' KB';
        } else {
            return $bytes . ' bytes';
        }
    }

    /**
     * Verificar si es una imagen
     */
    public function esImagen(): bool
    {
        return in_array(strtolower($this->extension), ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg']);
    }

    /**
     * Verificar si es un documento
     */
    public function esDocumento(): bool
    {
        return in_array(strtolower($this->extension), ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt']);
    }

    /**
     * Verificar si es un video
     */
    public function esVideo(): bool
    {
        return in_array(strtolower($this->extension), ['mp4', 'avi', 'mov', 'wmv']);
    }

    /**
     * Incrementar contador de descargas
     */
    public function incrementarDescargas(): bool
    {
        $this->descargas = ($this->descargas ?? 0) + 1;
        return $this->save();
    }

    /**
     * Generar URL de descarga segura
     */
    public function generarUrlDescarga(): string
    {
        return route('archivos.download', [
            'id' => $this->id,
            'token' => encrypt($this->id . '|' . now()->timestamp)
        ]);
    }

    /**
     * Verificar si el archivo puede ser descargado
     */
    public function puedeSerDescargado(): bool
    {
        // Verificar límites de descarga diaria
        $descargasHoy = static::where('id', $this->id)
                             ->whereDate('updated_at', today())
                             ->sum('descargas');

        return $descargasHoy < self::MAX_DESCARGAS_DIARIAS;
    }

    /**
     * Eliminar archivo físico del sistema
     */
    public function eliminarArchivoFisico(): bool
    {
        if ($this->ruta_archivo && file_exists(storage_path('app/' . $this->ruta_archivo))) {
            return unlink(storage_path('app/' . $this->ruta_archivo));
        }
        return true;
    }

    // ==========================================
    // VALIDACIONES EMPRESARIALES
    // ==========================================
    
    /**
     * Reglas de validación empresariales
     */
    public static function validationRules($id = null): array
    {
        return [
            // Agregar reglas de validación específicas
        ];
    }

    /**
     * Mensajes de validación personalizados
     */
    public static function validationMessages(): array
    {
        return [
            // Agregar mensajes personalizados
        ];
    }

    // ==========================================
    // EVENTOS DEL MODELO
    // ==========================================
    
    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($model) {
            Log::info("Creando nuevo registro en archivos", ['data' => $model->toArray()]);
        });
        
        static::updating(function ($model) {
            Log::info("Actualizando registro en archivos", ['id' => $model->id, 'changes' => $model->getDirty()]);
        });
        
        static::deleting(function ($model) {
            Log::info("Eliminando registro en archivos", ['id' => $model->id]);
        });
    }
}
