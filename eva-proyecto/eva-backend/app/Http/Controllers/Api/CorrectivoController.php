<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\ConexionesVista\ApiController;
use App\ConexionesVista\ResponseFormatter;
use App\Models\CorrectivoGeneral;
use App\Models\Equipo;
use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

/**
 * Controlador para gestión completa de mantenimientos correctivos
 * Maneja reparaciones, correctivos generales y mantenimientos no programados
 */
class CorrectivoController extends ApiController
{
    /**
     * Obtener lista de correctivos con filtros
     */
    public function index(Request $request)
    {
        try {
            $query = CorrectivoGeneral::with([
                'equipo:id,name,code,servicio_id,area_id',
                'equipo.servicio:id,name',
                'equipo.area:id,name',
                'tecnico:id,nombre,apellido'
            ]);

            // Aplicar filtros
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('descripcion', 'like', "%{$search}%")
                      ->orWhere('observaciones', 'like', "%{$search}%")
                      ->orWhereHas('equipo', function($eq) use ($search) {
                          $eq->where('name', 'like', "%{$search}%")
                             ->orWhere('code', 'like', "%{$search}%");
                      });
                });
            }

            if ($request->has('equipo_id')) {
                $query->where('equipo_id', $request->equipo_id);
            }

            if ($request->has('tecnico_id')) {
                $query->where('tecnico_id', $request->tecnico_id);
            }

            if ($request->has('estado')) {
                $query->where('estado', $request->estado);
            }

            if ($request->has('prioridad')) {
                $query->where('prioridad', $request->prioridad);
            }

            if ($request->has('fecha_desde')) {
                $query->where('fecha', '>=', $request->fecha_desde);
            }

            if ($request->has('fecha_hasta')) {
                $query->where('fecha', '<=', $request->fecha_hasta);
            }

            // Ordenamiento
            $orderBy = $request->get('order_by', 'fecha');
            $orderDirection = $request->get('order_direction', 'desc');
            $query->orderBy($orderBy, $orderDirection);

            // Paginación
            $perPage = $request->get('per_page', 15);
            $correctivos = $query->paginate($perPage);

            return ResponseFormatter::success($correctivos, 'Correctivos obtenidos exitosamente');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener correctivos: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Crear nuevo correctivo
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'equipo_id' => 'required|exists:equipos,id',
            'descripcion' => 'required|string|max:1000',
            'fecha' => 'required|date',
            'tecnico_id' => 'nullable|exists:usuarios,id',
            'prioridad' => 'required|in:baja,media,alta,urgente',
            'estado' => 'nullable|in:programado,en_proceso,completado,cancelado',
            'tipo_falla' => 'nullable|string|max:255',
            'causa_falla' => 'nullable|string',
            'observaciones' => 'nullable|string',
            'costo_estimado' => 'nullable|numeric|min:0',
            'tiempo_estimado' => 'nullable|integer|min:1',
            'archivo' => 'nullable|file|mimes:pdf,doc,docx,jpg,png|max:10240'
        ]);

        if ($validator->fails()) {
            return ResponseFormatter::validation($validator->errors());
        }

        try {
            DB::beginTransaction();

            $correctivoData = $request->except(['archivo']);
            $correctivoData['estado'] = $correctivoData['estado'] ?? 'programado';
            $correctivoData['created_at'] = now();

            // Manejar archivo adjunto
            if ($request->hasFile('archivo')) {
                $file = $request->file('archivo');
                $fileName = 'correctivos/' . uniqid() . '.' . $file->getClientOriginalExtension();
                $filePath = $file->storeAs('correctivos', $fileName, 'public');
                $correctivoData['archivo'] = $filePath;
            }

            $correctivo = CorrectivoGeneral::create($correctivoData);

            // Cargar relaciones para la respuesta
            $correctivo->load([
                'equipo:id,name,code',
                'tecnico:id,nombre,apellido'
            ]);

            DB::commit();

            return ResponseFormatter::success($correctivo, 'Correctivo creado exitosamente', 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return ResponseFormatter::error('Error al crear correctivo: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Mostrar correctivo específico
     */
    public function show($id)
    {
        try {
            $correctivo = CorrectivoGeneral::with([
                'equipo:id,name,code,servicio_id,area_id,marca,modelo,serial',
                'equipo.servicio:id,name',
                'equipo.area:id,name',
                'tecnico:id,nombre,apellido,telefono,email'
            ])->findOrFail($id);

            // Agregar URL del archivo si existe
            if ($correctivo->archivo) {
                $correctivo->archivo_url = Storage::disk('public')->url($correctivo->archivo);
            }

            return ResponseFormatter::success($correctivo, 'Correctivo obtenido exitosamente');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener correctivo: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Actualizar correctivo
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'equipo_id' => 'required|exists:equipos,id',
            'descripcion' => 'required|string|max:1000',
            'fecha' => 'required|date',
            'tecnico_id' => 'nullable|exists:usuarios,id',
            'prioridad' => 'required|in:baja,media,alta,urgente',
            'estado' => 'required|in:programado,en_proceso,completado,cancelado',
            'tipo_falla' => 'nullable|string|max:255',
            'causa_falla' => 'nullable|string',
            'observaciones' => 'nullable|string',
            'costo_estimado' => 'nullable|numeric|min:0',
            'tiempo_estimado' => 'nullable|integer|min:1',
            'archivo' => 'nullable|file|mimes:pdf,doc,docx,jpg,png|max:10240'
        ]);

        if ($validator->fails()) {
            return ResponseFormatter::validation($validator->errors());
        }

        try {
            DB::beginTransaction();

            $correctivo = CorrectivoGeneral::findOrFail($id);
            $correctivoData = $request->except(['archivo']);

            // Manejar actualización de archivo
            if ($request->hasFile('archivo')) {
                // Eliminar archivo anterior si existe
                if ($correctivo->archivo && Storage::disk('public')->exists($correctivo->archivo)) {
                    Storage::disk('public')->delete($correctivo->archivo);
                }

                $file = $request->file('archivo');
                $fileName = 'correctivos/' . uniqid() . '.' . $file->getClientOriginalExtension();
                $filePath = $file->storeAs('correctivos', $fileName, 'public');
                $correctivoData['archivo'] = $filePath;
            }

            $correctivo->update($correctivoData);

            // Cargar relaciones para la respuesta
            $correctivo->load([
                'equipo:id,name,code',
                'tecnico:id,nombre,apellido'
            ]);

            if ($correctivo->archivo) {
                $correctivo->archivo_url = Storage::disk('public')->url($correctivo->archivo);
            }

            DB::commit();

            return ResponseFormatter::success($correctivo, 'Correctivo actualizado exitosamente');

        } catch (\Exception $e) {
            DB::rollBack();
            return ResponseFormatter::error('Error al actualizar correctivo: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Eliminar correctivo
     */
    public function destroy($id)
    {
        try {
            $correctivo = CorrectivoGeneral::findOrFail($id);

            // Solo permitir eliminar si está programado
            if ($correctivo->estado !== 'programado') {
                return ResponseFormatter::error(
                    'Solo se pueden eliminar correctivos programados',
                    400
                );
            }

            // Eliminar archivo si existe
            if ($correctivo->archivo && Storage::disk('public')->exists($correctivo->archivo)) {
                Storage::disk('public')->delete($correctivo->archivo);
            }

            $correctivo->delete();

            return ResponseFormatter::success(null, 'Correctivo eliminado exitosamente');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al eliminar correctivo: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Completar correctivo
     */
    public function completar(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'solucion' => 'required|string|max:1000',
            'repuestos_utilizados' => 'nullable|string',
            'costo_real' => 'nullable|numeric|min:0',
            'tiempo_real' => 'nullable|integer|min:1',
            'observaciones_finales' => 'nullable|string',
            'archivo_reporte' => 'nullable|file|mimes:pdf,doc,docx,jpg,png|max:10240'
        ]);

        if ($validator->fails()) {
            return ResponseFormatter::validation($validator->errors());
        }

        try {
            DB::beginTransaction();

            $correctivo = CorrectivoGeneral::findOrFail($id);

            if ($correctivo->estado === 'completado') {
                return ResponseFormatter::error('El correctivo ya está completado', 400);
            }

            $updateData = [
                'estado' => 'completado',
                'fecha_completado' => now(),
                'solucion' => $request->solucion,
                'repuestos_utilizados' => $request->repuestos_utilizados,
                'costo_real' => $request->costo_real,
                'tiempo_real' => $request->tiempo_real,
                'observaciones_finales' => $request->observaciones_finales
            ];

            // Manejar archivo de reporte
            if ($request->hasFile('archivo_reporte')) {
                $file = $request->file('archivo_reporte');
                $fileName = 'reportes_correctivos/' . uniqid() . '.' . $file->getClientOriginalExtension();
                $filePath = $file->storeAs('reportes_correctivos', $fileName, 'public');
                $updateData['archivo_reporte'] = $filePath;
            }

            $correctivo->update($updateData);

            DB::commit();

            return ResponseFormatter::success($correctivo, 'Correctivo completado exitosamente');

        } catch (\Exception $e) {
            DB::rollBack();
            return ResponseFormatter::error('Error al completar correctivo: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Obtener correctivos por equipo
     */
    public function porEquipo($equipoId)
    {
        try {
            $correctivos = CorrectivoGeneral::with([
                'tecnico:id,nombre,apellido'
            ])
            ->where('equipo_id', $equipoId)
            ->orderBy('fecha', 'desc')
            ->get();

            return ResponseFormatter::success($correctivos, 'Correctivos del equipo obtenidos');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener correctivos: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Obtener correctivos pendientes
     */
    public function pendientes()
    {
        try {
            $correctivos = CorrectivoGeneral::with([
                'equipo:id,name,code,servicio_id,area_id',
                'equipo.servicio:id,name',
                'equipo.area:id,name',
                'tecnico:id,nombre,apellido'
            ])
            ->whereIn('estado', ['programado', 'en_proceso'])
            ->orderBy('prioridad', 'desc')
            ->orderBy('fecha', 'asc')
            ->get();

            return ResponseFormatter::success($correctivos, 'Correctivos pendientes obtenidos');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener correctivos pendientes: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Obtener estadísticas de correctivos
     */
    public function estadisticas(Request $request)
    {
        try {
            $year = $request->get('year', date('Y'));

            $stats = [
                'total_correctivos' => CorrectivoGeneral::whereYear('fecha', $year)->count(),
                'total_completados' => CorrectivoGeneral::where('estado', 'completado')
                    ->whereYear('fecha', $year)->count(),
                'total_pendientes' => CorrectivoGeneral::whereIn('estado', ['programado', 'en_proceso'])->count(),
                'por_prioridad' => CorrectivoGeneral::whereYear('fecha', $year)
                    ->groupBy('prioridad')
                    ->selectRaw('prioridad, count(*) as total')
                    ->get(),
                'por_estado' => CorrectivoGeneral::whereYear('fecha', $year)
                    ->groupBy('estado')
                    ->selectRaw('estado, count(*) as total')
                    ->get(),
                'por_mes' => CorrectivoGeneral::whereYear('fecha', $year)
                    ->groupBy(DB::raw('MONTH(fecha)'))
                    ->selectRaw('MONTH(fecha) as mes, count(*) as total')
                    ->orderBy('mes')
                    ->get(),
                'costo_total' => CorrectivoGeneral::where('estado', 'completado')
                    ->whereYear('fecha', $year)->sum('costo_real'),
                'tiempo_promedio' => CorrectivoGeneral::where('estado', 'completado')
                    ->whereYear('fecha', $year)->avg('tiempo_real')
            ];

            return ResponseFormatter::success($stats, 'Estadísticas de correctivos obtenidas');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener estadísticas: ' . $e->getMessage(), 500);
        }
    }
}
