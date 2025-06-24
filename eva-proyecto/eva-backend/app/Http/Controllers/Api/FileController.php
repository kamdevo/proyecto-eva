<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\ConexionesVista\ApiController;
use App\ConexionesVista\ResponseFormatter;
use App\Models\Equipo;
use App\Models\Manual;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class FileController extends ApiController
{
    /**
     * Subir imagen de equipo
     */
    public function uploadEquipmentImage(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'equipo_id' => 'required|exists:equipos,id',
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:5120|dimensions:max_width=2048,max_height=2048'
        ]);

        if ($validator->fails()) {
            return ResponseFormatter::validation($validator->errors());
        }

        try {
            $equipo = Equipo::findOrFail($request->equipo_id);
            $image = $request->file('image');

            // Validación adicional de MIME type por seguridad
            $allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
            if (!in_array($image->getMimeType(), $allowedMimeTypes)) {
                return ResponseFormatter::error('Tipo de archivo no permitido', 400);
            }

            // Validación de contenido del archivo (magic bytes)
            $fileContent = file_get_contents($image->getPathname());
            $finfo = finfo_open(FILEINFO_MIME_TYPE);
            $detectedMimeType = finfo_buffer($finfo, $fileContent);
            finfo_close($finfo);

            if (!in_array($detectedMimeType, $allowedMimeTypes)) {
                return ResponseFormatter::error('Contenido de archivo no válido', 400);
            }

            // Eliminar imagen anterior si existe
            if ($equipo->image && Storage::disk('public')->exists($equipo->image)) {
                Storage::disk('public')->delete($equipo->image);
            }

            // Generar nombre único y seguro
            $extension = $image->getClientOriginalExtension();
            $fileName = 'equipo_' . $equipo->id . '_' . time() . '_' . Str::random(8) . '.' . $extension;
            $imagePath = $image->storeAs('equipos', $fileName, 'public');

            // Actualizar equipo con la nueva imagen
            $equipo->update(['image' => $imagePath]);

            return ResponseFormatter::success([
                'image_path' => $imagePath,
                'image_url' => Storage::disk('public')->url($imagePath)
            ], 'Imagen subida exitosamente');
        } catch (\Exception $e) {
            // Log del error sin exponer detalles sensibles
            \Log::error('Error al subir imagen de equipo', [
                'equipo_id' => $request->equipo_id,
                'user_id' => auth()->id(),
                'error' => $e->getMessage()
            ]);

            return ResponseFormatter::error('Error al procesar la imagen', 500);
        }
    }

    /**
     * Subir documento/manual
     */
    public function uploadDocument(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'equipo_id' => 'nullable|exists:equipos,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'document' => 'required|file|mimes:pdf,doc,docx,xls,xlsx|max:10240', // 10MB max
            'tipo_documento' => 'required|string|in:Manual de Usuario,Manual de Mantenimiento,Certificado,Garantía,Factura,Otro'
        ]);

        if ($validator->fails()) {
            return ResponseFormatter::validation($validator->errors());
        }

        try {
            $file = $request->file('document');

            // Validación adicional de MIME type por seguridad
            $allowedMimeTypes = [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            ];

            if (!in_array($file->getMimeType(), $allowedMimeTypes)) {
                return ResponseFormatter::error('Tipo de documento no permitido', 400);
            }

            // Generar nombre único y seguro
            $extension = $file->getClientOriginalExtension();
            $fileName = 'doc_' . time() . '_' . Str::random(10) . '.' . $extension;
            $filePath = $file->storeAs('documentos', $fileName, 'public');

            $manual = Manual::create([
                'name' => $request->title,
                'description' => $request->description,
                'file' => $filePath,
                'file_name' => $file->getClientOriginalName(),
                'file_type' => $extension,
                'file_size' => $file->getSize(),
                'equipo_id' => $request->equipo_id,
                'usuario_id' => auth()->id(),
                'tipo' => $request->tipo_documento,
                'status' => true,
                'created_at' => now()
            ]);

            return ResponseFormatter::success($manual, 'Documento subido exitosamente', 201);
        } catch (\Exception $e) {
            // Log del error sin exponer detalles sensibles
            \Log::error('Error al subir documento', [
                'equipo_id' => $request->equipo_id,
                'user_id' => auth()->id(),
                'tipo_documento' => $request->tipo_documento,
                'error' => $e->getMessage()
            ]);

            return ResponseFormatter::error('Error al procesar el documento', 500);
        }
    }

    /**
     * Descargar documento
     */
    public function downloadDocument($id)
    {
        try {
            $manual = Manual::findOrFail($id);

            if (!Storage::disk('public')->exists($manual->file)) {
                return ResponseFormatter::notFound('Archivo no encontrado');
            }

            $filePath = Storage::disk('public')->path($manual->file);

            return response()->download($filePath, $manual->file_name);
        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al descargar archivo: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Eliminar documento
     */
    public function deleteDocument($id)
    {
        try {
            $manual = Manual::findOrFail($id);

            // Eliminar archivo del storage
            if (Storage::disk('public')->exists($manual->file)) {
                Storage::disk('public')->delete($manual->file);
            }

            // Eliminar registro de la base de datos
            $manual->delete();

            return ResponseFormatter::success(null, 'Documento eliminado exitosamente');
        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al eliminar documento: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Listar documentos de un equipo
     */
    public function getEquipmentDocuments($equipoId)
    {
        try {
            $documentos = Manual::where('equipo_id', $equipoId)
                ->where('status', true)
                ->with('usuario:id,nombre,apellido')
                ->orderBy('created_at', 'desc')
                ->get();

            $documentos->each(function ($doc) {
                $doc->file_url = Storage::disk('public')->url($doc->file);
                $doc->file_size_formatted = $this->formatFileSize($doc->file_size);
            });

            return ResponseFormatter::success($documentos, 'Documentos obtenidos exitosamente');
        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener documentos: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Subir múltiples archivos
     */
    public function uploadMultipleFiles(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'equipo_id' => 'nullable|exists:equipos,id',
            'files' => 'required|array|max:10',
            'files.*' => 'file|mimes:pdf,doc,docx,xls,xlsx,jpg,png|max:10240',
            'descriptions' => 'nullable|array',
            'descriptions.*' => 'nullable|string|max:255'
        ]);

        if ($validator->fails()) {
            return ResponseFormatter::validation($validator->errors());
        }

        try {
            $uploadedFiles = [];
            $files = $request->file('files');
            $descriptions = $request->input('descriptions', []);

            foreach ($files as $index => $file) {
                $fileName = Str::uuid() . '.' . $file->getClientOriginalExtension();
                $filePath = $file->storeAs('documentos', $fileName, 'public');

                $manual = Manual::create([
                    'name' => $file->getClientOriginalName(),
                    'description' => $descriptions[$index] ?? null,
                    'file' => $filePath,
                    'file_name' => $file->getClientOriginalName(),
                    'file_type' => $file->getClientOriginalExtension(),
                    'file_size' => $file->getSize(),
                    'equipo_id' => $request->equipo_id,
                    'usuario_id' => auth()->id(),
                    'status' => true,
                    'created_at' => now()
                ]);

                $uploadedFiles[] = $manual;
            }

            return ResponseFormatter::success($uploadedFiles, count($uploadedFiles) . ' archivos subidos exitosamente', 201);
        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al subir archivos: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Obtener información de archivo
     */
    public function getFileInfo($id)
    {
        try {
            $manual = Manual::with(['equipo:id,name,code', 'usuario:id,nombre,apellido'])
                ->findOrFail($id);

            $manual->file_url = Storage::disk('public')->url($manual->file);
            $manual->file_size_formatted = $this->formatFileSize($manual->file_size);
            $manual->file_exists = Storage::disk('public')->exists($manual->file);

            return ResponseFormatter::success($manual, 'Información del archivo obtenida');
        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener información: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Formatear tamaño de archivo
     */
    private function formatFileSize($bytes)
    {
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
     * Validar tipo de archivo
     */
    public function validateFileType(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'file' => 'required|file'
        ]);

        if ($validator->fails()) {
            return ResponseFormatter::validation($validator->errors());
        }

        try {
            $file = $request->file('file');
            $allowedTypes = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'png', 'gif'];
            $fileExtension = $file->getClientOriginalExtension();

            $isValid = in_array(strtolower($fileExtension), $allowedTypes);
            $fileSize = $file->getSize();
            $maxSize = 10 * 1024 * 1024; // 10MB

            return ResponseFormatter::success([
                'is_valid' => $isValid && $fileSize <= $maxSize,
                'file_name' => $file->getClientOriginalName(),
                'file_size' => $this->formatFileSize($fileSize),
                'file_type' => $fileExtension,
                'is_size_valid' => $fileSize <= $maxSize,
                'is_type_valid' => $isValid
            ], 'Validación de archivo completada');
        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al validar archivo: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Buscar archivos por criterios
     */
    public function searchFiles(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'query' => 'required|string|min:3',
            'tipo' => 'nullable|string',
            'equipo_id' => 'nullable|exists:equipos,id'
        ]);

        if ($validator->fails()) {
            return ResponseFormatter::validation($validator->errors());
        }

        try {
            $query = Manual::with(['equipo:id,name,code', 'usuario:id,nombre,apellido'])
                ->where('status', true);

            // Búsqueda por texto
            $searchTerm = $request->query;
            $query->where(function ($q) use ($searchTerm) {
                $q->where('name', 'like', "%{$searchTerm}%")
                    ->orWhere('description', 'like', "%{$searchTerm}%")
                    ->orWhere('file_name', 'like', "%{$searchTerm}%");
            });

            // Filtros adicionales
            if ($request->has('tipo')) {
                $query->where('tipo', $request->tipo);
            }

            if ($request->has('equipo_id')) {
                $query->where('equipo_id', $request->equipo_id);
            }

            $archivos = $query->orderBy('created_at', 'desc')
                ->limit(50)
                ->get();

            // Agregar URLs
            $archivos->each(function ($archivo) {
                $archivo->file_url = Storage::disk('public')->url($archivo->file);
                $archivo->file_size_formatted = $this->formatFileSize($archivo->file_size);
            });

            return ResponseFormatter::success($archivos, 'Búsqueda completada');
        } catch (\Exception $e) {
            return ResponseFormatter::error('Error en la búsqueda: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Obtener estadísticas de archivos
     */
    public function getFileStatistics()
    {
        try {
            $stats = [
                'total_archivos' => Manual::where('status', true)->count(),
                'tamaño_total' => $this->formatFileSize(Manual::where('status', true)->sum('file_size')),
                'por_tipo' => Manual::where('status', true)
                    ->groupBy('tipo')
                    ->selectRaw('tipo, count(*) as total, sum(file_size) as tamaño')
                    ->get()
                    ->map(function ($item) {
                        $item->tamaño_formateado = $this->formatFileSize($item->tamaño);
                        return $item;
                    }),
                'por_extension' => Manual::where('status', true)
                    ->groupBy('file_type')
                    ->selectRaw('file_type, count(*) as total')
                    ->orderBy('total', 'desc')
                    ->get(),
                'archivos_recientes' => Manual::where('status', true)
                    ->orderBy('created_at', 'desc')
                    ->limit(5)
                    ->get(['id', 'name', 'tipo', 'created_at']),
                'equipos_con_mas_archivos' => Manual::join('equipos', 'manuales.equipo_id', '=', 'equipos.id')
                    ->where('manuales.status', true)
                    ->groupBy('equipos.id', 'equipos.name')
                    ->selectRaw('equipos.name as equipo, count(*) as total_archivos')
                    ->orderBy('total_archivos', 'desc')
                    ->limit(10)
                    ->get()
            ];

            return ResponseFormatter::success($stats, 'Estadísticas obtenidas');
        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener estadísticas: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Limpiar archivos huérfanos
     */
    public function cleanOrphanFiles()
    {
        try {
            $archivosHuerfanos = Manual::whereDoesntHave('equipo')->get();
            $eliminados = 0;

            foreach ($archivosHuerfanos as $archivo) {
                if (Storage::disk('public')->exists($archivo->file)) {
                    Storage::disk('public')->delete($archivo->file);
                }
                $archivo->delete();
                $eliminados++;
            }

            return ResponseFormatter::success([
                'archivos_eliminados' => $eliminados
            ], 'Limpieza completada');
        } catch (\Exception $e) {
            return ResponseFormatter::error('Error en la limpieza: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Comprimir archivos para descarga
     */
    public function compressFiles(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'file_ids' => 'required|array',
            'file_ids.*' => 'exists:manuales,id'
        ]);

        if ($validator->fails()) {
            return ResponseFormatter::validation($validator->errors());
        }

        try {
            $archivos = Manual::whereIn('id', $request->file_ids)->get();

            if ($archivos->isEmpty()) {
                return ResponseFormatter::error('No se encontraron archivos', 404);
            }

            $zip = new \ZipArchive();
            $zipFileName = 'archivos_' . date('Y-m-d_H-i-s') . '.zip';
            $zipPath = storage_path('app/temp/' . $zipFileName);

            // Crear directorio temporal si no existe
            if (!file_exists(dirname($zipPath))) {
                mkdir(dirname($zipPath), 0755, true);
            }

            if ($zip->open($zipPath, \ZipArchive::CREATE) === TRUE) {
                foreach ($archivos as $archivo) {
                    $filePath = Storage::disk('public')->path($archivo->file);
                    if (file_exists($filePath)) {
                        $zip->addFile($filePath, $archivo->file_name);
                    }
                }
                $zip->close();

                return response()->download($zipPath, $zipFileName)->deleteFileAfterSend(true);
            } else {
                return ResponseFormatter::error('Error al crear archivo ZIP', 500);
            }
        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al comprimir archivos: ' . $e->getMessage(), 500);
        }
    }
}
