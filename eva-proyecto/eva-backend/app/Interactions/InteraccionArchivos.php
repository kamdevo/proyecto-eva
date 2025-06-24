<?php

namespace App\Interactions;

use App\Models\Archivo;
use App\Models\Equipo;
use App\ConexionesVista\ResponseFormatter;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\UploadedFile;

/**
 * Clase de interacción para gestión de archivos
 * Maneja operaciones específicas de archivos, documentos e imágenes
 */
class InteraccionArchivos
{
    /**
     * Subir archivo y asociarlo a un equipo
     */
    public static function subirArchivoEquipo($equipoId, UploadedFile $file, $datos = [])
    {
        try {
            DB::beginTransaction();

            $equipo = Equipo::findOrFail($equipoId);
            
            // Validar tipo de archivo
            $extension = strtolower($file->getClientOriginalExtension());
            $tiposPermitidos = ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'gif', 'xls', 'xlsx'];
            
            if (!in_array($extension, $tiposPermitidos)) {
                return ResponseFormatter::error('Tipo de archivo no permitido', 400);
            }

            // Generar nombre único
            $fileName = uniqid() . '.' . $extension;
            $directory = 'equipos/' . $equipoId . '/archivos';
            $filePath = $file->storeAs($directory, $fileName, 'public');

            // Crear registro en base de datos
            $archivo = Archivo::create([
                'name' => $datos['name'] ?? $file->getClientOriginalName(),
                'description' => $datos['description'] ?? null,
                'file_name' => $file->getClientOriginalName(),
                'file_path' => $filePath,
                'file_size' => $file->getSize(),
                'extension' => $extension,
                'mime_type' => $file->getMimeType(),
                'tipo' => $datos['tipo'] ?? 'documento',
                'categoria' => $datos['categoria'] ?? 'general',
                'equipo_id' => $equipoId,
                'usuario_id' => auth()->id(),
                'publico' => $datos['publico'] ?? false,
                'activo' => true,
                'descargas' => 0
            ]);

            DB::commit();

            return ResponseFormatter::success([
                'archivo' => $archivo,
                'url' => Storage::disk('public')->url($filePath)
            ], 'Archivo subido exitosamente');

        } catch (\Exception $e) {
            DB::rollBack();
            return ResponseFormatter::error('Error al subir archivo: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Obtener archivos de un equipo por tipo
     */
    public static function obtenerArchivosEquipo($equipoId, $tipo = null)
    {
        try {
            $query = Archivo::where('equipo_id', $equipoId)
                           ->where('activo', true);

            if ($tipo) {
                $query->where('tipo', $tipo);
            }

            $archivos = $query->orderBy('created_at', 'desc')->get();

            // Agregar URLs
            $archivos->each(function ($archivo) {
                $archivo->file_url = Storage::disk('public')->url($archivo->file_path);
                $archivo->file_size_formatted = self::formatFileSize($archivo->file_size);
            });

            return ResponseFormatter::success($archivos, 'Archivos obtenidos exitosamente');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener archivos: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Eliminar archivo y su registro
     */
    public static function eliminarArchivo($archivoId)
    {
        try {
            $archivo = Archivo::findOrFail($archivoId);

            // Eliminar archivo físico
            if ($archivo->file_path && Storage::disk('public')->exists($archivo->file_path)) {
                Storage::disk('public')->delete($archivo->file_path);
            }

            // Eliminar registro
            $archivo->delete();

            return ResponseFormatter::success(null, 'Archivo eliminado exitosamente');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al eliminar archivo: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Generar reporte de archivos por equipo
     */
    public static function generarReporteArchivos($equipoId)
    {
        try {
            $equipo = Equipo::with(['servicio', 'area'])->findOrFail($equipoId);
            $archivos = Archivo::where('equipo_id', $equipoId)
                              ->where('activo', true)
                              ->orderBy('tipo')
                              ->orderBy('created_at', 'desc')
                              ->get();

            $reporte = [
                'equipo' => [
                    'id' => $equipo->id,
                    'name' => $equipo->name,
                    'code' => $equipo->code,
                    'servicio' => $equipo->servicio->name ?? 'N/A',
                    'area' => $equipo->area->name ?? 'N/A'
                ],
                'resumen' => [
                    'total_archivos' => $archivos->count(),
                    'por_tipo' => $archivos->groupBy('tipo')->map->count(),
                    'tamaño_total' => self::formatFileSize($archivos->sum('file_size')),
                    'ultimo_archivo' => $archivos->first()?->created_at
                ],
                'archivos' => $archivos->map(function ($archivo) {
                    return [
                        'id' => $archivo->id,
                        'name' => $archivo->name,
                        'tipo' => $archivo->tipo,
                        'categoria' => $archivo->categoria,
                        'tamaño' => self::formatFileSize($archivo->file_size),
                        'fecha_subida' => $archivo->created_at,
                        'descargas' => $archivo->descargas,
                        'publico' => $archivo->publico
                    ];
                })
            ];

            return ResponseFormatter::success($reporte, 'Reporte de archivos generado');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al generar reporte: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Buscar archivos por criterios
     */
    public static function buscarArchivos($criterios)
    {
        try {
            $query = Archivo::with(['equipo:id,name,code', 'usuario:id,nombre,apellido'])
                           ->where('activo', true);

            if (!empty($criterios['nombre'])) {
                $query->where('name', 'like', '%' . $criterios['nombre'] . '%');
            }

            if (!empty($criterios['tipo'])) {
                $query->where('tipo', $criterios['tipo']);
            }

            if (!empty($criterios['categoria'])) {
                $query->where('categoria', $criterios['categoria']);
            }

            if (!empty($criterios['equipo_id'])) {
                $query->where('equipo_id', $criterios['equipo_id']);
            }

            if (!empty($criterios['fecha_desde'])) {
                $query->where('created_at', '>=', $criterios['fecha_desde']);
            }

            if (!empty($criterios['fecha_hasta'])) {
                $query->where('created_at', '<=', $criterios['fecha_hasta']);
            }

            $archivos = $query->orderBy('created_at', 'desc')
                             ->limit(100)
                             ->get();

            // Agregar URLs
            $archivos->each(function ($archivo) {
                $archivo->file_url = Storage::disk('public')->url($archivo->file_path);
                $archivo->file_size_formatted = self::formatFileSize($archivo->file_size);
            });

            return ResponseFormatter::success($archivos, 'Búsqueda completada');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error en la búsqueda: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Obtener estadísticas de archivos
     */
    public static function obtenerEstadisticasArchivos()
    {
        try {
            $stats = [
                'total_archivos' => Archivo::where('activo', true)->count(),
                'tamaño_total' => self::formatFileSize(Archivo::where('activo', true)->sum('file_size')),
                'por_tipo' => Archivo::where('activo', true)
                    ->groupBy('tipo')
                    ->selectRaw('tipo, count(*) as total, sum(file_size) as tamaño')
                    ->get()
                    ->map(function ($item) {
                        $item->tamaño_formateado = self::formatFileSize($item->tamaño);
                        return $item;
                    }),
                'archivos_mas_descargados' => Archivo::where('activo', true)
                    ->orderBy('descargas', 'desc')
                    ->limit(10)
                    ->get(['id', 'name', 'tipo', 'descargas']),
                'archivos_recientes' => Archivo::where('activo', true)
                    ->orderBy('created_at', 'desc')
                    ->limit(5)
                    ->get(['id', 'name', 'tipo', 'created_at']),
                'equipos_con_mas_archivos' => DB::table('archivos')
                    ->join('equipos', 'archivos.equipo_id', '=', 'equipos.id')
                    ->where('archivos.activo', true)
                    ->groupBy('equipos.id', 'equipos.name')
                    ->selectRaw('equipos.id, equipos.name, count(*) as total_archivos')
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
    public static function limpiarArchivosHuerfanos()
    {
        try {
            $archivosHuerfanos = Archivo::whereDoesntHave('equipo')->get();
            $eliminados = 0;

            foreach ($archivosHuerfanos as $archivo) {
                if ($archivo->file_path && Storage::disk('public')->exists($archivo->file_path)) {
                    Storage::disk('public')->delete($archivo->file_path);
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
     * Formatear tamaño de archivo
     */
    private static function formatFileSize($bytes)
    {
        if ($bytes == 0) return '0 B';

        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $factor = floor(log($bytes, 1024));
        
        return round($bytes / pow(1024, $factor), 2) . ' ' . $units[$factor];
    }
}
