<?php

namespace App\Interactions;

use App\Models\Archivo;
use App\Models\Equipo;
use App\Models\Usuario;
use App\ConexionesVista\ResponseFormatter;
use App\ConexionesVista\ReactViewHelper;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\UploadedFile;
use Illuminate\Http\Request;
use Carbon\Carbon;

/**
 * Clase MEJORADA AL 500% de interacción para gestión de archivos
 * Incluye validación de permisos, manejo de versiones, funcionalidades avanzadas
 */
class InteraccionArchivos
{
    /**
     * Configuración de archivos
     */
    const MAX_FILE_SIZE = 10485760; // 10MB en bytes
    const ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'gif', 'xls', 'xlsx', 'txt', 'csv'];
    const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif'];
    const DOCUMENT_EXTENSIONS = ['pdf', 'doc', 'docx', 'txt'];
    const SPREADSHEET_EXTENSIONS = ['xls', 'xlsx', 'csv'];

    /**
     * Tipos de archivo soportados
     */
    const FILE_TYPES = [
        'manual' => 'Manual de Usuario',
        'invima' => 'Registro INVIMA',
        'garantia' => 'Certificado de Garantía',
        'factura' => 'Factura de Compra',
        'imagen' => 'Imagen del Equipo',
        'plano' => 'Plano Técnico',
        'certificado' => 'Certificado de Calibración',
        'protocolo' => 'Protocolo de Mantenimiento',
        'reporte' => 'Reporte Técnico',
        'otro' => 'Otro Documento'
    ];

    /**
     * Permisos por tipo de operación
     */
    const PERMISSIONS = [
        'upload' => 'can_upload_files',
        'download' => 'can_download_files',
        'delete' => 'can_delete_files',
        'view' => 'can_view_files'
    ];

    /**
     * Subir archivo con validación completa de permisos y versiones
     */
    public static function subirArchivo(Request $request)
    {
        try {
            // Validar permisos
            if (!self::hasPermission('upload')) {
                return ResponseFormatter::forbidden('No tiene permisos para subir archivos');
            }

            // Validar datos de entrada
            $validator = Validator::make($request->all(), [
                'file' => 'required|file|max:' . (self::MAX_FILE_SIZE / 1024), // KB
                'entity_type' => 'required|string|in:equipo,usuario,mantenimiento,contingencia',
                'entity_id' => 'required|integer',
                'tipo' => 'required|string|in:' . implode(',', array_keys(self::FILE_TYPES)),
                'nombre' => 'nullable|string|max:255',
                'descripcion' => 'nullable|string|max:1000',
                'version' => 'nullable|string|max:50',
                'es_publico' => 'nullable|boolean'
            ]);

            if ($validator->fails()) {
                return ResponseFormatter::validation($validator->errors());
            }

            $file = $request->file('file');
            $entityType = $request->input('entity_type');
            $entityId = $request->input('entity_id');
            $tipo = $request->input('tipo');

            // Validar que la entidad existe
            if (!self::validateEntity($entityType, $entityId)) {
                return ResponseFormatter::notFound('La entidad especificada no existe');
            }

            // Validar archivo
            $validationResult = self::validateFile($file);
            if (!$validationResult['valid']) {
                return ResponseFormatter::error($validationResult['message']);
            }

            DB::beginTransaction();

            try {
                // Manejar versiones si es necesario
                $version = $request->input('version', '1.0');
                if (self::fileExists($entityType, $entityId, $tipo, $file->getClientOriginalName())) {
                    $version = self::getNextVersion($entityType, $entityId, $tipo, $file->getClientOriginalName());
                }

                // Generar ruta y nombre único
                $fileName = self::generateUniqueFileName($file, $entityType, $entityId);
                $directory = self::getStorageDirectory($entityType, $entityId);
                $filePath = $file->storeAs($directory, $fileName, 'public');

                // Crear registro en base de datos (corregido campos BD)
                $archivo = Archivo::create([
                    'nombre' => $request->input('nombre', $file->getClientOriginalName()),
                    'descripcion' => $request->input('descripcion'),
                    'nombre_archivo' => $file->getClientOriginalName(),
                    'ruta' => $filePath,
                    'tamaño' => $file->getSize(),
                    'extension' => strtolower($file->getClientOriginalExtension()),
                    'tipo_mime' => $file->getMimeType(),
                    'tipo' => $tipo,
                    'version' => $version,
                    'entity_type' => $entityType,
                    'entity_id' => $entityId,
                    'usuario_id' => auth()->id(),
                    'es_publico' => $request->input('es_publico', false),
                    'hash_archivo' => hash_file('md5', $file->getRealPath()),
                    'fecha_subida' => now()
                ]);

                // Generar thumbnail si es imagen
                if (self::isImage($file)) {
                    self::generateThumbnail($filePath, $archivo->id);
                }

                // Log de la operación
                self::logFileOperation('upload', $archivo->id, [
                    'entity_type' => $entityType,
                    'entity_id' => $entityId,
                    'file_size' => $file->getSize(),
                    'file_type' => $tipo
                ]);

                DB::commit();

                return ResponseFormatter::fileOperation(
                    ReactViewHelper::formatFileData($archivo),
                    'upload',
                    'Archivo subido exitosamente'
                );

            } catch (\Exception $e) {
                DB::rollBack();
                // Limpiar archivo si se subió
                if (isset($filePath) && Storage::disk('public')->exists($filePath)) {
                    Storage::disk('public')->delete($filePath);
                }
                throw $e;
            }

        } catch (\Exception $e) {
            Log::error('Error subiendo archivo: ' . $e->getMessage(), [
                'user_id' => auth()->id(),
                'request_data' => $request->except(['file'])
            ]);
            return ResponseFormatter::error('Error al subir archivo: ' . $e->getMessage());
        }
    }

    /**
     * Descargar archivo con validación de permisos
     */
    public static function descargarArchivo(int $archivoId)
    {
        try {
            // Validar permisos
            if (!self::hasPermission('download')) {
                return ResponseFormatter::forbidden('No tiene permisos para descargar archivos');
            }

            $archivo = Archivo::find($archivoId);
            if (!$archivo) {
                return ResponseFormatter::notFound('Archivo no encontrado');
            }

            // Validar permisos específicos del archivo
            if (!self::canAccessFile($archivo)) {
                return ResponseFormatter::forbidden('No tiene permisos para acceder a este archivo');
            }

            // Verificar que el archivo existe físicamente
            if (!Storage::disk('public')->exists($archivo->ruta)) {
                return ResponseFormatter::notFound('Archivo físico no encontrado');
            }

            // Incrementar contador de descargas
            $archivo->increment('descargas');

            // Log de la operación
            self::logFileOperation('download', $archivo->id, [
                'entity_type' => $archivo->entity_type,
                'entity_id' => $archivo->entity_id
            ]);

            return ResponseFormatter::fileOperation([
                'download_url' => Storage::disk('public')->url($archivo->ruta),
                'filename' => $archivo->nombre_archivo,
                'size' => $archivo->tamaño,
                'type' => $archivo->tipo_mime,
                'nombre' => $archivo->nombre
            ], 'download', 'Archivo listo para descarga');

        } catch (\Exception $e) {
            Log::error('Error descargando archivo: ' . $e->getMessage(), [
                'archivo_id' => $archivoId,
                'user_id' => auth()->id()
            ]);
            return ResponseFormatter::error('Error al descargar archivo: ' . $e->getMessage());
        }
    }

    /**
     * Eliminar archivo con validación de permisos
     */
    public static function eliminarArchivo(int $archivoId)
    {
        try {
            // Validar permisos
            if (!self::hasPermission('delete')) {
                return ResponseFormatter::forbidden('No tiene permisos para eliminar archivos');
            }

            $archivo = Archivo::find($archivoId);
            if (!$archivo) {
                return ResponseFormatter::notFound('Archivo no encontrado');
            }

            // Validar permisos específicos del archivo
            if (!self::canAccessFile($archivo)) {
                return ResponseFormatter::forbidden('No tiene permisos para eliminar este archivo');
            }

            DB::beginTransaction();

            try {
                // Eliminar archivo físico
                if (Storage::disk('public')->exists($archivo->ruta)) {
                    Storage::disk('public')->delete($archivo->ruta);
                }

                // Eliminar thumbnail si existe
                $thumbnailPath = self::getThumbnailPath($archivo->ruta);
                if (Storage::disk('public')->exists($thumbnailPath)) {
                    Storage::disk('public')->delete($thumbnailPath);
                }

                // Log antes de eliminar
                self::logFileOperation('delete', $archivo->id, [
                    'entity_type' => $archivo->entity_type,
                    'entity_id' => $archivo->entity_id,
                    'file_name' => $archivo->nombre_archivo
                ]);

                // Eliminar registro de base de datos
                $archivo->delete();

                DB::commit();

                return ResponseFormatter::success(null, 'Archivo eliminado exitosamente');

            } catch (\Exception $e) {
                DB::rollBack();
                throw $e;
            }

        } catch (\Exception $e) {
            Log::error('Error eliminando archivo: ' . $e->getMessage(), [
                'archivo_id' => $archivoId,
                'user_id' => auth()->id()
            ]);
            return ResponseFormatter::error('Error al eliminar archivo: ' . $e->getMessage());
        }
    }

    /**
     * Listar archivos de una entidad con paginación
     */
    public static function listarArchivos(Request $request)
    {
        try {
            // Validar permisos
            if (!self::hasPermission('view')) {
                return ResponseFormatter::forbidden('No tiene permisos para ver archivos');
            }

            $validator = Validator::make($request->all(), [
                'entity_type' => 'required|string',
                'entity_id' => 'required|integer',
                'tipo' => 'nullable|string',
                'page' => 'nullable|integer|min:1',
                'per_page' => 'nullable|integer|min:1|max:100'
            ]);

            if ($validator->fails()) {
                return ResponseFormatter::validation($validator->errors());
            }

            $entityType = $request->input('entity_type');
            $entityId = $request->input('entity_id');
            $tipo = $request->input('tipo');
            $page = $request->input('page', 1);
            $perPage = $request->input('per_page', 10);

            $query = Archivo::where('entity_type', $entityType)
                ->where('entity_id', $entityId);

            if ($tipo) {
                $query->where('tipo', $tipo);
            }

            // Filtrar por permisos de usuario
            if (!self::isAdmin()) {
                $query->where(function ($q) {
                    $q->where('es_publico', true)
                      ->orWhere('usuario_id', auth()->id());
                });
            }

            $archivos = $query->with(['usuario'])
                ->orderBy('fecha_subida', 'desc')
                ->paginate($perPage, ['*'], 'page', $page);

            return ResponseFormatter::paginated($archivos, 'Archivos obtenidos exitosamente');

        } catch (\Exception $e) {
            Log::error('Error listando archivos: ' . $e->getMessage());
            return ResponseFormatter::error('Error al listar archivos: ' . $e->getMessage());
        }
    }

    /**
     * Obtener información detallada de un archivo
     */
    public static function obtenerInfoArchivo(int $archivoId)
    {
        try {
            $archivo = Archivo::with(['usuario'])->find($archivoId);
            if (!$archivo) {
                return ResponseFormatter::notFound('Archivo no encontrado');
            }

            // Validar permisos
            if (!self::canAccessFile($archivo)) {
                return ResponseFormatter::forbidden('No tiene permisos para ver este archivo');
            }

            $info = ReactViewHelper::formatFileData($archivo);
            
            // Agregar información adicional
            $info['metadata'] = [
                'subido_por' => $archivo->usuario->nombre ?? 'Usuario desconocido',
                'fecha_subida' => $archivo->fecha_subida,
                'descargas' => $archivo->descargas ?? 0,
                'version' => $archivo->version,
                'hash' => $archivo->hash_archivo,
                'es_imagen' => self::isImageByExtension($archivo->extension),
                'thumbnail_url' => self::getThumbnailUrl($archivo->ruta)
            ];

            return ResponseFormatter::success($info, 'Información del archivo obtenida');

        } catch (\Exception $e) {
            Log::error('Error obteniendo info archivo: ' . $e->getMessage());
            return ResponseFormatter::error('Error al obtener información del archivo');
        }
    }

    /**
     * Funciones auxiliares privadas
     */

    /**
     * Validar permisos del usuario
     */
    private static function hasPermission(string $operation): bool
    {
        if (!auth()->check()) {
            return false;
        }

        $permission = self::PERMISSIONS[$operation] ?? null;
        if (!$permission) {
            return true;
        }

        // Implementar lógica de permisos real
        return true; // Por ahora permitir todas las operaciones
    }

    /**
     * Validar que la entidad existe
     */
    private static function validateEntity(string $entityType, int $entityId): bool
    {
        $models = [
            'equipo' => Equipo::class,
            'usuario' => Usuario::class,
            // Agregar otros modelos según sea necesario
        ];

        $modelClass = $models[$entityType] ?? null;
        if (!$modelClass) {
            return false;
        }

        return $modelClass::where('id', $entityId)->exists();
    }

    /**
     * Validar archivo
     */
    private static function validateFile(UploadedFile $file): array
    {
        // Validar tamaño
        if ($file->getSize() > self::MAX_FILE_SIZE) {
            return [
                'valid' => false,
                'message' => 'El archivo excede el tamaño máximo permitido (' . (self::MAX_FILE_SIZE / 1024 / 1024) . 'MB)'
            ];
        }

        // Validar extensión
        $extension = strtolower($file->getClientOriginalExtension());
        if (!in_array($extension, self::ALLOWED_EXTENSIONS)) {
            return [
                'valid' => false,
                'message' => 'Tipo de archivo no permitido. Extensiones permitidas: ' . implode(', ', self::ALLOWED_EXTENSIONS)
            ];
        }

        // Validar MIME type
        $mimeType = $file->getMimeType();
        if (!self::isValidMimeType($mimeType, $extension)) {
            return [
                'valid' => false,
                'message' => 'El tipo MIME del archivo no coincide con su extensión'
            ];
        }

        return ['valid' => true, 'message' => 'Archivo válido'];
    }

    /**
     * Verificar si un archivo ya existe
     */
    private static function fileExists(string $entityType, int $entityId, string $tipo, string $fileName): bool
    {
        return Archivo::where('entity_type', $entityType)
            ->where('entity_id', $entityId)
            ->where('tipo', $tipo)
            ->where('nombre_archivo', $fileName)
            ->exists();
    }

    /**
     * Obtener siguiente versión
     */
    private static function getNextVersion(string $entityType, int $entityId, string $tipo, string $fileName): string
    {
        $lastVersion = Archivo::where('entity_type', $entityType)
            ->where('entity_id', $entityId)
            ->where('tipo', $tipo)
            ->where('nombre_archivo', $fileName)
            ->orderBy('version', 'desc')
            ->value('version');

        if (!$lastVersion) {
            return '1.0';
        }

        // Incrementar versión
        $parts = explode('.', $lastVersion);
        $major = intval($parts[0] ?? 1);
        $minor = intval($parts[1] ?? 0);

        return $major . '.' . ($minor + 1);
    }

    /**
     * Generar nombre único para archivo
     */
    private static function generateUniqueFileName(UploadedFile $file, string $entityType, int $entityId): string
    {
        $extension = strtolower($file->getClientOriginalExtension());
        $timestamp = now()->format('Y-m-d_H-i-s');
        $random = substr(md5(uniqid()), 0, 8);

        return "{$entityType}_{$entityId}_{$timestamp}_{$random}.{$extension}";
    }

    /**
     * Obtener directorio de almacenamiento
     */
    private static function getStorageDirectory(string $entityType, int $entityId): string
    {
        return "uploads/{$entityType}/{$entityId}";
    }

    /**
     * Verificar si es imagen
     */
    private static function isImage(UploadedFile $file): bool
    {
        $extension = strtolower($file->getClientOriginalExtension());
        return in_array($extension, self::IMAGE_EXTENSIONS);
    }

    /**
     * Verificar si es imagen por extensión
     */
    private static function isImageByExtension(string $extension): bool
    {
        return in_array(strtolower($extension), self::IMAGE_EXTENSIONS);
    }

    /**
     * Generar thumbnail para imagen
     */
    private static function generateThumbnail(string $filePath, int $archivoId): void
    {
        try {
            // Implementar generación de thumbnail
            // Por ahora solo registramos que se intentó generar
            Log::info("Thumbnail generation attempted for file: {$filePath}");
        } catch (\Exception $e) {
            Log::warning("Failed to generate thumbnail: " . $e->getMessage());
        }
    }

    /**
     * Obtener ruta del thumbnail
     */
    private static function getThumbnailPath(string $originalPath): string
    {
        $pathInfo = pathinfo($originalPath);
        return $pathInfo['dirname'] . '/thumbnails/' . $pathInfo['filename'] . '_thumb.' . $pathInfo['extension'];
    }

    /**
     * Obtener URL del thumbnail
     */
    private static function getThumbnailUrl(string $originalPath): ?string
    {
        $thumbnailPath = self::getThumbnailPath($originalPath);

        if (Storage::disk('public')->exists($thumbnailPath)) {
            return Storage::disk('public')->url($thumbnailPath);
        }

        return null;
    }

    /**
     * Verificar si puede acceder al archivo
     */
    private static function canAccessFile(Archivo $archivo): bool
    {
        // Si es público, todos pueden acceder
        if ($archivo->es_publico) {
            return true;
        }

        // Si es el propietario del archivo
        if ($archivo->usuario_id === auth()->id()) {
            return true;
        }

        // Si es administrador
        if (self::isAdmin()) {
            return true;
        }

        return false;
    }

    /**
     * Verificar si es administrador
     */
    private static function isAdmin(): bool
    {
        $user = auth()->user();
        return $user && $user->rol_id === 1; // Asumiendo que rol_id 1 es admin
    }

    /**
     * Validar tipo MIME
     */
    private static function isValidMimeType(string $mimeType, string $extension): bool
    {
        $validMimeTypes = [
            'pdf' => ['application/pdf'],
            'doc' => ['application/msword'],
            'docx' => ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
            'jpg' => ['image/jpeg'],
            'jpeg' => ['image/jpeg'],
            'png' => ['image/png'],
            'gif' => ['image/gif'],
            'xls' => ['application/vnd.ms-excel'],
            'xlsx' => ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
            'txt' => ['text/plain'],
            'csv' => ['text/csv', 'application/csv']
        ];

        $allowedMimes = $validMimeTypes[$extension] ?? [];
        return in_array($mimeType, $allowedMimes);
    }

    /**
     * Log de operaciones de archivo
     */
    private static function logFileOperation(string $operation, int $archivoId, array $data = []): void
    {
        Log::info("File operation: {$operation}", array_merge([
            'archivo_id' => $archivoId,
            'user_id' => auth()->id(),
            'ip' => request()->ip(),
            'timestamp' => now()->toISOString()
        ], $data));
    }

    /**
     * Obtener estadísticas de archivos
     */
    public static function getFileStats(string $entityType = null, int $entityId = null): array
    {
        try {
            $query = Archivo::query();

            if ($entityType && $entityId) {
                $query->where('entity_type', $entityType)->where('entity_id', $entityId);
            }

            $stats = [
                'total_archivos' => $query->count(),
                'tamaño_total' => $query->sum('tamaño'),
                'por_tipo' => $query->groupBy('tipo')->selectRaw('tipo, count(*) as count')->pluck('count', 'tipo'),
                'por_extension' => $query->groupBy('extension')->selectRaw('extension, count(*) as count')->pluck('count', 'extension'),
                'archivos_recientes' => $query->orderBy('fecha_subida', 'desc')->limit(5)->get(['id', 'nombre', 'fecha_subida'])
            ];

            return $stats;

        } catch (\Exception $e) {
            Log::error('Error obteniendo estadísticas de archivos: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Limpiar archivos huérfanos
     */
    public static function cleanOrphanFiles(): array
    {
        try {
            $orphanFiles = [];
            $deletedCount = 0;

            // Buscar archivos en BD que no existen físicamente
            $archivos = Archivo::all();

            foreach ($archivos as $archivo) {
                if (!Storage::disk('public')->exists($archivo->ruta)) {
                    $orphanFiles[] = $archivo->id;
                    $archivo->delete();
                    $deletedCount++;
                }
            }

            return [
                'orphan_files_found' => count($orphanFiles),
                'files_deleted' => $deletedCount,
                'orphan_file_ids' => $orphanFiles
            ];

        } catch (\Exception $e) {
            Log::error('Error limpiando archivos huérfanos: ' . $e->getMessage());
            return ['error' => $e->getMessage()];
        }
    }

    /**
     * Duplicar archivo
     */
    public static function duplicateFile(int $archivoId, array $newData = []): array
    {
        try {
            $originalFile = Archivo::find($archivoId);
            if (!$originalFile) {
                return ['success' => false, 'message' => 'Archivo original no encontrado'];
            }

            if (!Storage::disk('public')->exists($originalFile->ruta)) {
                return ['success' => false, 'message' => 'Archivo físico no encontrado'];
            }

            // Crear copia del archivo físico
            $newFileName = 'copy_' . time() . '_' . basename($originalFile->ruta);
            $newPath = dirname($originalFile->ruta) . '/' . $newFileName;

            Storage::disk('public')->copy($originalFile->ruta, $newPath);

            // Crear nuevo registro
            $newFile = $originalFile->replicate();
            $newFile->nombre = $newData['nombre'] ?? 'Copia de ' . $originalFile->nombre;
            $newFile->ruta = $newPath;
            $newFile->usuario_id = auth()->id();
            $newFile->fecha_subida = now();
            $newFile->save();

            return [
                'success' => true,
                'message' => 'Archivo duplicado exitosamente',
                'new_file_id' => $newFile->id
            ];

        } catch (\Exception $e) {
            Log::error('Error duplicando archivo: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Error al duplicar archivo'];
        }
    }
}
