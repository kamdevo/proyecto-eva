<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\ConexionesVista\ApiController;
use App\ConexionesVista\ResponseFormatter;
use App\Models\Archivo;
use App\Models\Equipo;
use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Controlador para gestión completa de archivos
 * Maneja documentos, imágenes, manuales y archivos adjuntos
 */
class ArchivosController extends ApiController
{
    /**
     * Obtener lista de archivos con filtros
     */
    public function index(Request $request)
    {
        try {
            $query = Archivo::with([
                'equipo:id,name,code',
                'usuario:id,nombre,apellido'
            ]);

            // Aplicar filtros
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%")
                      ->orWhere('file_name', 'like', "%{$search}%");
                });
            }

            if ($request->has('equipo_id')) {
                $query->where('equipo_id', $request->equipo_id);
            }

            if ($request->has('tipo')) {
                $query->where('tipo', $request->tipo);
            }

            if ($request->has('categoria')) {
                $query->where('categoria', $request->categoria);
            }

            if ($request->has('extension')) {
                $query->where('extension', $request->extension);
            }

            if ($request->has('activo')) {
                $query->where('activo', $request->activo);
            }

            // Ordenamiento
            $orderBy = $request->get('order_by', 'created_at');
            $orderDirection = $request->get('order_direction', 'desc');
            $query->orderBy($orderBy, $orderDirection);

            // Paginación
            $perPage = $request->get('per_page', 15);
            $archivos = $query->paginate($perPage);

            // Agregar URLs y información adicional
            $archivos->getCollection()->transform(function ($archivo) {
                if ($archivo->file_path) {
                    $archivo->file_url = Storage::disk('public')->url($archivo->file_path);
                    $archivo->file_exists = Storage::disk('public')->exists($archivo->file_path);
                }
                $archivo->file_size_formatted = $this->formatFileSize($archivo->file_size);
                return $archivo;
            });

            return ResponseFormatter::success($archivos, 'Archivos obtenidos exitosamente');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener archivos: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Subir nuevo archivo
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'file' => 'required|file|max:51200', // 50MB máximo
            'equipo_id' => 'nullable|exists:equipos,id',
            'tipo' => 'required|in:manual,imagen,documento,certificado,reporte,otro',
            'categoria' => 'nullable|string|max:100',
            'publico' => 'nullable|boolean'
        ]);

        if ($validator->fails()) {
            return ResponseFormatter::validation($validator->errors());
        }

        try {
            DB::beginTransaction();

            $file = $request->file('file');

            // Validar tipo de archivo
            $allowedTypes = [
                'manual' => ['pdf', 'doc', 'docx'],
                'imagen' => ['jpg', 'jpeg', 'png', 'gif', 'bmp'],
                'documento' => ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt'],
                'certificado' => ['pdf'],
                'reporte' => ['pdf', 'doc', 'docx', 'xls', 'xlsx'],
                'otro' => ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png', 'gif', 'txt', 'zip', 'rar']
            ];

            $extension = strtolower($file->getClientOriginalExtension());
            $tipo = $request->tipo;

            if (!in_array($extension, $allowedTypes[$tipo])) {
                return ResponseFormatter::error(
                    "Tipo de archivo no permitido para la categoría '{$tipo}'. Extensiones permitidas: " .
                    implode(', ', $allowedTypes[$tipo]),
                    400
                );
            }

            // Generar nombre único para el archivo
            $fileName = Str::uuid() . '.' . $extension;
            $directory = 'archivos/' . $tipo;
            $filePath = $file->storeAs($directory, $fileName, 'public');

            // Crear registro en base de datos
            $archivoData = [
                'name' => $request->name,
                'description' => $request->description,
                'file_name' => $file->getClientOriginalName(),
                'file_path' => $filePath,
                'file_size' => $file->getSize(),
                'extension' => $extension,
                'mime_type' => $file->getMimeType(),
                'tipo' => $tipo,
                'categoria' => $request->categoria,
                'equipo_id' => $request->equipo_id,
                'usuario_id' => auth()->id(),
                'publico' => $request->publico ?? false,
                'activo' => true,
                'created_at' => now()
            ];

            $archivo = Archivo::create($archivoData);

            // Cargar relaciones para la respuesta
            $archivo->load([
                'equipo:id,name,code',
                'usuario:id,nombre,apellido'
            ]);

            $archivo->file_url = Storage::disk('public')->url($archivo->file_path);
            $archivo->file_size_formatted = $this->formatFileSize($archivo->file_size);

            DB::commit();

            return ResponseFormatter::success($archivo, 'Archivo subido exitosamente', 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return ResponseFormatter::error('Error al subir archivo: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Mostrar archivo específico
     */
    public function show($id)
    {
        try {
            $archivo = Archivo::with([
                'equipo:id,name,code,servicio_id,area_id',
                'equipo.servicio:id,name',
                'equipo.area:id,name',
                'usuario:id,nombre,apellido,email'
            ])->findOrFail($id);

            // Agregar información adicional
            if ($archivo->file_path) {
                $archivo->file_url = Storage::disk('public')->url($archivo->file_path);
                $archivo->file_exists = Storage::disk('public')->exists($archivo->file_path);
            }
            $archivo->file_size_formatted = $this->formatFileSize($archivo->file_size);

            return ResponseFormatter::success($archivo, 'Archivo obtenido exitosamente');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener archivo: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Actualizar información del archivo
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'tipo' => 'required|in:manual,imagen,documento,certificado,reporte,otro',
            'categoria' => 'nullable|string|max:100',
            'publico' => 'nullable|boolean',
            'activo' => 'nullable|boolean'
        ]);

        if ($validator->fails()) {
            return ResponseFormatter::validation($validator->errors());
        }

        try {
            $archivo = Archivo::findOrFail($id);
            $archivo->update($request->all());

            // Cargar relaciones para la respuesta
            $archivo->load([
                'equipo:id,name,code',
                'usuario:id,nombre,apellido'
            ]);

            if ($archivo->file_path) {
                $archivo->file_url = Storage::disk('public')->url($archivo->file_path);
            }
            $archivo->file_size_formatted = $this->formatFileSize($archivo->file_size);

            return ResponseFormatter::success($archivo, 'Archivo actualizado exitosamente');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al actualizar archivo: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Eliminar archivo
     */
    public function destroy($id)
    {
        try {
            $archivo = Archivo::findOrFail($id);

            // Eliminar archivo físico del storage
            if ($archivo->file_path && Storage::disk('public')->exists($archivo->file_path)) {
                Storage::disk('public')->delete($archivo->file_path);
            }

            $archivo->delete();

            return ResponseFormatter::success(null, 'Archivo eliminado exitosamente');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al eliminar archivo: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Descargar archivo
     */
    public function download($id)
    {
        try {
            $archivo = Archivo::findOrFail($id);

            if (!$archivo->file_path || !Storage::disk('public')->exists($archivo->file_path)) {
                return ResponseFormatter::notFound('Archivo no encontrado en el servidor');
            }

            $filePath = Storage::disk('public')->path($archivo->file_path);

            // Incrementar contador de descargas
            $archivo->increment('descargas');

            return response()->download($filePath, $archivo->file_name);

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al descargar archivo: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Obtener archivos por equipo
     */
    public function porEquipo($equipoId)
    {
        try {
            $archivos = Archivo::with(['usuario:id,nombre,apellido'])
                ->where('equipo_id', $equipoId)
                ->where('activo', true)
                ->orderBy('created_at', 'desc')
                ->get();

            // Agregar URLs
            $archivos->each(function ($archivo) {
                if ($archivo->file_path) {
                    $archivo->file_url = Storage::disk('public')->url($archivo->file_path);
                }
                $archivo->file_size_formatted = $this->formatFileSize($archivo->file_size);
            });

            return ResponseFormatter::success($archivos, 'Archivos del equipo obtenidos');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener archivos: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Obtener archivos por tipo
     */
    public function porTipo($tipo)
    {
        try {
            $archivos = Archivo::with([
                'equipo:id,name,code',
                'usuario:id,nombre,apellido'
            ])
            ->where('tipo', $tipo)
            ->where('activo', true)
            ->orderBy('created_at', 'desc')
            ->get();

            // Agregar URLs
            $archivos->each(function ($archivo) {
                if ($archivo->file_path) {
                    $archivo->file_url = Storage::disk('public')->url($archivo->file_path);
                }
                $archivo->file_size_formatted = $this->formatFileSize($archivo->file_size);
            });

            return ResponseFormatter::success($archivos, "Archivos de tipo '{$tipo}' obtenidos");

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener archivos: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Obtener estadísticas de archivos
     */
    public function estadisticas()
    {
        try {
            $stats = [
                'total_archivos' => Archivo::where('activo', true)->count(),
                'por_tipo' => Archivo::where('activo', true)
                    ->groupBy('tipo')
                    ->selectRaw('tipo, count(*) as total')
                    ->get(),
                'por_extension' => Archivo::where('activo', true)
                    ->groupBy('extension')
                    ->selectRaw('extension, count(*) as total')
                    ->orderBy('total', 'desc')
                    ->get(),
                'tamaño_total' => $this->formatFileSize(
                    Archivo::where('activo', true)->sum('file_size')
                ),
                'tamaño_total_bytes' => Archivo::where('activo', true)->sum('file_size'),
                'archivos_publicos' => Archivo::where('activo', true)->where('publico', true)->count(),
                'archivos_privados' => Archivo::where('activo', true)->where('publico', false)->count(),
                'total_descargas' => Archivo::where('activo', true)->sum('descargas'),
                'archivos_mas_descargados' => Archivo::where('activo', true)
                    ->orderBy('descargas', 'desc')
                    ->limit(10)
                    ->get(['id', 'name', 'tipo', 'descargas']),
                'archivos_recientes' => Archivo::where('activo', true)
                    ->orderBy('created_at', 'desc')
                    ->limit(5)
                    ->get(['id', 'name', 'tipo', 'created_at'])
            ];

            return ResponseFormatter::success($stats, 'Estadísticas de archivos obtenidas');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener estadísticas: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Subir múltiples archivos
     */
    public function uploadMultiple(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'files' => 'required|array|max:10',
            'files.*' => 'file|max:51200',
            'equipo_id' => 'nullable|exists:equipos,id',
            'tipo' => 'required|in:manual,imagen,documento,certificado,reporte,otro',
            'categoria' => 'nullable|string|max:100',
            'descriptions' => 'nullable|array',
            'descriptions.*' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return ResponseFormatter::validation($validator->errors());
        }

        try {
            DB::beginTransaction();

            $archivosSubidos = [];
            $files = $request->file('files');
            $descriptions = $request->get('descriptions', []);

            foreach ($files as $index => $file) {
                $extension = strtolower($file->getClientOriginalExtension());

                // Generar nombre único
                $fileName = Str::uuid() . '.' . $extension;
                $directory = 'archivos/' . $request->tipo;
                $filePath = $file->storeAs($directory, $fileName, 'public');

                // Crear registro
                $archivoData = [
                    'name' => $file->getClientOriginalName(),
                    'description' => $descriptions[$index] ?? null,
                    'file_name' => $file->getClientOriginalName(),
                    'file_path' => $filePath,
                    'file_size' => $file->getSize(),
                    'extension' => $extension,
                    'mime_type' => $file->getMimeType(),
                    'tipo' => $request->tipo,
                    'categoria' => $request->categoria,
                    'equipo_id' => $request->equipo_id,
                    'usuario_id' => auth()->id(),
                    'publico' => false,
                    'activo' => true,
                    'created_at' => now()
                ];

                $archivo = Archivo::create($archivoData);
                $archivo->file_url = Storage::disk('public')->url($archivo->file_path);
                $archivosSubidos[] = $archivo;
            }

            DB::commit();

            return ResponseFormatter::success($archivosSubidos, 'Archivos subidos exitosamente', 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return ResponseFormatter::error('Error al subir archivos: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Activar/Desactivar archivo
     */
    public function toggleStatus($id)
    {
        try {
            $archivo = Archivo::findOrFail($id);
            $archivo->update(['activo' => !$archivo->activo]);

            $status = $archivo->activo ? 'activado' : 'desactivado';
            return ResponseFormatter::success($archivo, "Archivo {$status} exitosamente");

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al cambiar estado del archivo: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Buscar archivos
     */
    public function buscar(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'query' => 'required|string|min:3'
        ]);

        if ($validator->fails()) {
            return ResponseFormatter::validation($validator->errors());
        }

        try {
            $query = $request->query;

            $archivos = Archivo::with([
                'equipo:id,name,code',
                'usuario:id,nombre,apellido'
            ])
            ->where('activo', true)
            ->where(function($q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                  ->orWhere('description', 'like', "%{$query}%")
                  ->orWhere('file_name', 'like', "%{$query}%")
                  ->orWhere('categoria', 'like', "%{$query}%");
            })
            ->orderBy('created_at', 'desc')
            ->limit(50)
            ->get();

            // Agregar URLs
            $archivos->each(function ($archivo) {
                if ($archivo->file_path) {
                    $archivo->file_url = Storage::disk('public')->url($archivo->file_path);
                }
                $archivo->file_size_formatted = $this->formatFileSize($archivo->file_size);
            });

            return ResponseFormatter::success($archivos, 'Búsqueda completada');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error en la búsqueda: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Formatear tamaño de archivo
     */
    private function formatFileSize($bytes)
    {
        if ($bytes == 0) return '0 B';

        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $factor = floor(log($bytes, 1024));

        return round($bytes / pow(1024, $factor), 2) . ' ' . $units[$factor];
    }

    /**
     * Validar tipo de archivo
     */
    private function validateFileType($file, $tipo)
    {
        $allowedTypes = [
            'manual' => ['pdf', 'doc', 'docx'],
            'imagen' => ['jpg', 'jpeg', 'png', 'gif', 'bmp'],
            'documento' => ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt'],
            'certificado' => ['pdf'],
            'reporte' => ['pdf', 'doc', 'docx', 'xls', 'xlsx'],
            'otro' => ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png', 'gif', 'txt', 'zip', 'rar']
        ];

        $extension = strtolower($file->getClientOriginalExtension());

        return in_array($extension, $allowedTypes[$tipo] ?? []);
    }
}
