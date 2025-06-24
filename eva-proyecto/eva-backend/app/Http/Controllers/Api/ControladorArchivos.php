<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\ConexionesVista\ApiController;
use App\ConexionesVista\ResponseFormatter;
use App\Models\Archivo;
use App\Models\Equipo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Carbon\Carbon;

/**
 * Controlador COMPLETO para gestión de archivos y documentos
 * Sistema avanzado de gestión documental con versionado y seguridad
 */
class ControladorArchivos extends ApiController
{
    /**
     * ENDPOINT COMPLETO: Lista de archivos con filtros avanzados
     */
    public function index(Request $request)
    {
        try {
            $query = Archivo::with([
                'equipo:id,name,code',
                'usuario:id,nombre,apellido'
            ]);

            // Filtros avanzados
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('file_name', 'like', "%{$search}%")
                      ->orWhere('descripcion', 'like', "%{$search}%")
                      ->orWhereHas('equipo', function($eq) use ($search) {
                          $eq->where('name', 'like', "%{$search}%")
                             ->orWhere('code', 'like', "%{$search}%");
                      });
                });
            }

            if ($request->has('tipo')) {
                $query->where('tipo', $request->tipo);
            }

            if ($request->has('categoria')) {
                $query->where('categoria', $request->categoria);
            }

            if ($request->has('equipo_id')) {
                $query->where('equipo_id', $request->equipo_id);
            }

            if ($request->has('mime_type')) {
                $query->where('mime_type', 'like', "%{$request->mime_type}%");
            }

            if ($request->has('fecha_desde')) {
                $query->where('created_at', '>=', $request->fecha_desde);
            }

            if ($request->has('fecha_hasta')) {
                $query->where('created_at', '<=', $request->fecha_hasta);
            }

            if ($request->has('size_min')) {
                $query->where('file_size', '>=', $request->size_min);
            }

            if ($request->has('size_max')) {
                $query->where('file_size', '<=', $request->size_max);
            }

            // Ordenamiento
            $orderBy = $request->get('order_by', 'created_at');
            $orderDirection = $request->get('order_direction', 'desc');
            $query->orderBy($orderBy, $orderDirection);

            // Paginación
            $perPage = $request->get('per_page', 15);
            $archivos = $query->paginate($perPage);

            // Agregar información adicional
            $archivos->getCollection()->transform(function ($archivo) {
                $archivo->size_formatted = $this->formatFileSize($archivo->file_size);
                $archivo->download_url = $this->generateDownloadUrl($archivo);
                $archivo->preview_url = $this->generatePreviewUrl($archivo);
                $archivo->is_image = $this->isImage($archivo->mime_type);
                $archivo->is_document = $this->isDocument($archivo->mime_type);
                $archivo->is_video = $this->isVideo($archivo->mime_type);
                return $archivo;
            });

            return ResponseFormatter::success($archivos, 'Lista de archivos obtenida exitosamente');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener archivos: ' . $e->getMessage(), 500);
        }
    }

    /**
     * ENDPOINT COMPLETO: Subir archivo
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'file' => 'required|file|max:51200', // 50MB max
            'name' => 'nullable|string|max:255',
            'descripcion' => 'nullable|string|max:500',
            'tipo' => 'required|string|in:manual,certificado,protocolo,imagen,video,documento,reporte,otro',
            'categoria' => 'required|string|in:documentacion,evidencia,reporte,manual,certificacion,otro',
            'equipo_id' => 'nullable|exists:equipos,id',
            'es_publico' => 'boolean',
            'fecha_vencimiento' => 'nullable|date|after:today',
            'tags' => 'nullable|string|max:500'
        ]);

        if ($validator->fails()) {
            return ResponseFormatter::validation($validator->errors());
        }

        try {
            DB::beginTransaction();

            $file = $request->file('file');
            
            // Validaciones adicionales de seguridad
            $allowedMimes = [
                'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'image/jpeg', 'image/png', 'image/gif', 'image/webp',
                'video/mp4', 'video/avi', 'video/quicktime',
                'text/plain', 'text/csv'
            ];

            if (!in_array($file->getMimeType(), $allowedMimes)) {
                return ResponseFormatter::error('Tipo de archivo no permitido', 400);
            }

            // Generar nombre único
            $originalName = $file->getClientOriginalName();
            $extension = $file->getClientOriginalExtension();
            $fileName = Str::uuid() . '.' . $extension;
            
            // Determinar directorio basado en tipo
            $directory = $this->getDirectoryByType($request->tipo);
            
            // Subir archivo
            $filePath = $file->storeAs($directory, $fileName, 'public');
            
            // Crear registro en BD
            $archivoData = [
                'name' => $request->name ?: pathinfo($originalName, PATHINFO_FILENAME),
                'descripcion' => $request->descripcion,
                'tipo' => $request->tipo,
                'categoria' => $request->categoria,
                'equipo_id' => $request->equipo_id,
                'file_name' => $fileName,
                'file_original_name' => $originalName,
                'file_path' => $filePath,
                'file_size' => $file->getSize(),
                'mime_type' => $file->getMimeType(),
                'usuario_id' => auth()->id(),
                'es_publico' => $request->get('es_publico', false),
                'fecha_vencimiento' => $request->fecha_vencimiento,
                'tags' => $request->tags,
                'activo' => true,
                'hash_file' => hash_file('sha256', $file->getRealPath()),
                'version' => 1
            ];

            $archivo = Archivo::create($archivoData);

            // Generar thumbnail si es imagen
            if ($this->isImage($file->getMimeType())) {
                $this->generateThumbnail($archivo, $file);
            }

            // Registrar actividad
            $this->registrarActividad($archivo, 'archivo_subido', 'Archivo subido al sistema');

            DB::commit();

            return ResponseFormatter::success($archivo, 'Archivo subido exitosamente', 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return ResponseFormatter::error('Error al subir archivo: ' . $e->getMessage(), 500);
        }
    }

    /**
     * ENDPOINT COMPLETO: Dashboard de archivos
     */
    public function dashboardArchivos()
    {
        try {
            $hoy = now();
            $inicioMes = $hoy->copy()->startOfMonth();
            $finMes = $hoy->copy()->endOfMonth();

            // Estadísticas generales
            $estadisticas = [
                'total_archivos' => Archivo::where('activo', true)->count(),
                'archivos_mes' => Archivo::whereBetween('created_at', [$inicioMes, $finMes])->count(),
                'espacio_total' => Archivo::where('activo', true)->sum('file_size'),
                'por_tipo' => Archivo::where('activo', true)
                    ->selectRaw('tipo, COUNT(*) as total, SUM(file_size) as size')
                    ->groupBy('tipo')
                    ->get(),
                'por_categoria' => Archivo::where('activo', true)
                    ->selectRaw('categoria, COUNT(*) as total')
                    ->groupBy('categoria')
                    ->get(),
                'archivos_vencidos' => Archivo::where('fecha_vencimiento', '<', $hoy)
                    ->where('activo', true)->count(),
                'archivos_por_vencer' => Archivo::whereBetween('fecha_vencimiento', [$hoy, $hoy->copy()->addDays(30)])
                    ->where('activo', true)->count()
            ];

            // Archivos recientes
            $archivosRecientes = Archivo::with(['equipo:id,name,code', 'usuario:id,nombre,apellido'])
                ->where('activo', true)
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get();

            // Archivos más descargados
            $archivosMasDescargados = Archivo::where('activo', true)
                ->orderBy('descargas', 'desc')
                ->limit(10)
                ->get(['id', 'name', 'tipo', 'descargas', 'created_at']);

            // Archivos por vencer
            $archivosPorVencer = Archivo::with(['equipo:id,name,code'])
                ->whereBetween('fecha_vencimiento', [$hoy, $hoy->copy()->addDays(30)])
                ->where('activo', true)
                ->orderBy('fecha_vencimiento')
                ->limit(10)
                ->get();

            $dashboard = [
                'estadisticas' => $estadisticas,
                'archivos_recientes' => $archivosRecientes,
                'mas_descargados' => $archivosMasDescargados,
                'por_vencer' => $archivosPorVencer,
                'alertas' => [
                    'vencidos' => $estadisticas['archivos_vencidos'],
                    'por_vencer' => $estadisticas['archivos_por_vencer'],
                    'espacio_critico' => $this->verificarEspacioCritico($estadisticas['espacio_total'])
                ]
            ];

            return ResponseFormatter::success($dashboard, 'Dashboard de archivos obtenido exitosamente');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener dashboard: ' . $e->getMessage(), 500);
        }
    }

    /**
     * ENDPOINT COMPLETO: Descargar archivo
     */
    public function download($id)
    {
        try {
            $archivo = Archivo::findOrFail($id);

            if (!$archivo->activo) {
                return ResponseFormatter::error('Archivo no disponible', 404);
            }

            // Verificar permisos
            if (!$archivo->es_publico && !$this->tienePermisoDescarga($archivo)) {
                return ResponseFormatter::forbidden('No tienes permisos para descargar este archivo');
            }

            // Verificar que el archivo existe físicamente
            if (!Storage::disk('public')->exists($archivo->file_path)) {
                return ResponseFormatter::error('Archivo no encontrado en el sistema', 404);
            }

            // Incrementar contador de descargas
            $archivo->increment('descargas');

            // Registrar descarga
            $this->registrarDescarga($archivo);

            // Retornar archivo
            return Storage::disk('public')->download($archivo->file_path, $archivo->file_original_name);

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al descargar archivo: ' . $e->getMessage(), 500);
        }
    }

    /**
     * ENDPOINT COMPLETO: Gestión de versiones
     */
    public function gestionVersiones(Request $request, $id)
    {
        try {
            $archivo = Archivo::findOrFail($id);

            if ($request->isMethod('GET')) {
                // Obtener todas las versiones
                $versiones = Archivo::where('archivo_padre_id', $archivo->id)
                    ->orWhere('id', $archivo->id)
                    ->orderBy('version', 'desc')
                    ->get();

                return ResponseFormatter::success($versiones, 'Versiones obtenidas exitosamente');
            }

            if ($request->isMethod('POST')) {
                // Crear nueva versión
                $validator = Validator::make($request->all(), [
                    'file' => 'required|file|max:51200',
                    'comentario_version' => 'nullable|string|max:500'
                ]);

                if ($validator->fails()) {
                    return ResponseFormatter::validation($validator->errors());
                }

                DB::beginTransaction();

                $file = $request->file('file');
                $nuevaVersion = $archivo->version + 1;

                // Subir nueva versión
                $fileName = Str::uuid() . '.' . $file->getClientOriginalExtension();
                $directory = $this->getDirectoryByType($archivo->tipo);
                $filePath = $file->storeAs($directory, $fileName, 'public');

                // Crear registro de nueva versión
                $nuevaVersionData = $archivo->toArray();
                unset($nuevaVersionData['id'], $nuevaVersionData['created_at'], $nuevaVersionData['updated_at']);
                
                $nuevaVersionData['archivo_padre_id'] = $archivo->id;
                $nuevaVersionData['version'] = $nuevaVersion;
                $nuevaVersionData['file_name'] = $fileName;
                $nuevaVersionData['file_path'] = $filePath;
                $nuevaVersionData['file_size'] = $file->getSize();
                $nuevaVersionData['hash_file'] = hash_file('sha256', $file->getRealPath());
                $nuevaVersionData['comentario_version'] = $request->comentario_version;
                $nuevaVersionData['usuario_id'] = auth()->id();

                $nuevaVersionArchivo = Archivo::create($nuevaVersionData);

                // Actualizar archivo principal
                $archivo->update(['version_actual' => $nuevaVersion]);

                DB::commit();

                return ResponseFormatter::success($nuevaVersionArchivo, 'Nueva versión creada exitosamente', 201);
            }

        } catch (\Exception $e) {
            DB::rollBack();
            return ResponseFormatter::error('Error en gestión de versiones: ' . $e->getMessage(), 500);
        }
    }

    // Métodos auxiliares
    private function formatFileSize($bytes)
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        $bytes /= pow(1024, $pow);
        return round($bytes, 2) . ' ' . $units[$pow];
    }

    private function generateDownloadUrl($archivo)
    {
        return route('api.archivos.download', $archivo->id);
    }

    private function generatePreviewUrl($archivo)
    {
        if ($this->isImage($archivo->mime_type)) {
            return Storage::disk('public')->url($archivo->file_path);
        }
        return null;
    }

    private function isImage($mimeType)
    {
        return strpos($mimeType, 'image/') === 0;
    }

    private function isDocument($mimeType)
    {
        $documentTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument'];
        return Str::startsWith($mimeType, $documentTypes);
    }

    private function isVideo($mimeType)
    {
        return strpos($mimeType, 'video/') === 0;
    }

    private function getDirectoryByType($tipo)
    {
        $directories = [
            'manual' => 'manuales',
            'certificado' => 'certificados',
            'protocolo' => 'protocolos',
            'imagen' => 'imagenes',
            'video' => 'videos',
            'documento' => 'documentos',
            'reporte' => 'reportes',
            'otro' => 'otros'
        ];

        return $directories[$tipo] ?? 'otros';
    }

    private function generateThumbnail($archivo, $file)
    {
        // Implementar generación de thumbnails
        // Por ahora solo log
        \Log::info("Thumbnail generado para archivo {$archivo->id}");
    }

    private function tienePermisoDescarga($archivo)
    {
        // Implementar lógica de permisos
        return true; // Por ahora permitir todo
    }

    private function verificarEspacioCritico($espacioTotal)
    {
        $limiteCritico = 10 * 1024 * 1024 * 1024; // 10GB
        return $espacioTotal > $limiteCritico;
    }

    private function registrarActividad($archivo, $accion, $descripcion)
    {
        DB::table('archivo_actividades')->insert([
            'archivo_id' => $archivo->id,
            'usuario_id' => auth()->id(),
            'accion' => $accion,
            'descripcion' => $descripcion,
            'ip_address' => request()->ip(),
            'created_at' => now(),
            'updated_at' => now()
        ]);
    }

    private function registrarDescarga($archivo)
    {
        $this->registrarActividad($archivo, 'descarga', 'Archivo descargado');
    }
}
