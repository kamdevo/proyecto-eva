<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\ConexionesVista\ApiController;
use App\ConexionesVista\ResponseFormatter;
use App\Models\Mantenimiento;
use App\Models\Equipo;
use App\Models\Usuario;
use App\Models\Observacion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

/**
 * Controlador para gestión completa de mantenimientos
 * Maneja mantenimientos preventivos, correctivos y calibraciones
 */
class MantenimientoController extends ApiController
{
    /**
     * Obtener lista paginada de mantenimientos con filtros avanzados
     *
     * Este método devuelve una lista completa de mantenimientos con sus relaciones
     * incluyendo equipo, técnico asignado y observaciones. Soporta múltiples filtros:
     * búsqueda por texto, equipo específico, técnico, estado, tipo y rangos de fechas.
     *
     * @param Request $request Solicitud HTTP con parámetros de filtro opcionales
     * @return JsonResponse Lista paginada de mantenimientos con metadatos
     */
    public function index(Request $request)
    {
        try {
            $query = Mantenimiento::with([
                'equipo:id,name,code,servicio_id,area_id',
                'equipo.servicio:id,name',
                'equipo.area:id,name',
                'tecnico:id,nombre,apellido',
                'observaciones'
            ]);

            // Aplicar filtros
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('description', 'like', "%{$search}%")
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

            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            if ($request->has('tipo')) {
                $query->where('tipo', $request->tipo);
            }

            if ($request->has('fecha_desde')) {
                $query->where('fecha_programada', '>=', $request->fecha_desde);
            }

            if ($request->has('fecha_hasta')) {
                $query->where('fecha_programada', '<=', $request->fecha_hasta);
            }

            // Ordenamiento
            $orderBy = $request->get('order_by', 'fecha_programada');
            $orderDirection = $request->get('order_direction', 'desc');
            $query->orderBy($orderBy, $orderDirection);

            // Paginación
            $perPage = $request->get('per_page', 15);
            $mantenimientos = $query->paginate($perPage);

            return ResponseFormatter::success($mantenimientos, 'Lista de mantenimientos obtenida');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener mantenimientos: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Crear un nuevo mantenimiento preventivo o correctivo
     *
     * Este método valida los datos de entrada, crea un nuevo registro de mantenimiento
     * en la base de datos y maneja la subida de archivos adjuntos. Actualiza automáticamente
     * la fecha de próximo mantenimiento en el equipo asociado si es preventivo.
     *
     * @param Request $request Datos del mantenimiento (equipo, descripción, fecha, técnico, etc.)
     * @return JsonResponse Mantenimiento creado con sus relaciones cargadas
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'equipo_id' => 'required|exists:equipos,id',
            'description' => 'required|string|max:500',
            'fecha_programada' => 'required|date|after_or_equal:today',
            'tecnico_id' => 'nullable|exists:usuarios,id',
            'tipo' => 'required|in:preventivo,correctivo,calibracion,verificacion',
            'prioridad' => 'nullable|in:baja,media,alta,critica',
            'observacion' => 'nullable|string',
            'file' => 'nullable|file|mimes:pdf,doc,docx,jpg,png|max:10240'
        ]);

        if ($validator->fails()) {
            return ResponseFormatter::validation($validator->errors());
        }

        try {
            DB::beginTransaction();

            $mantenimientoData = $request->except(['file']);
            $mantenimientoData['status'] = 'programado';
            $mantenimientoData['created_at'] = now();

            // Manejar archivo adjunto
            if ($request->hasFile('file')) {
                $file = $request->file('file');
                $fileName = 'mantenimientos/' . uniqid() . '.' . $file->getClientOriginalExtension();
                $filePath = $file->storeAs('mantenimientos', $fileName, 'public');
                $mantenimientoData['file'] = $filePath;
            }

            $mantenimiento = Mantenimiento::create($mantenimientoData);

            // Actualizar fecha de próximo mantenimiento en el equipo
            $equipo = Equipo::find($request->equipo_id);
            if ($equipo && $request->tipo === 'preventivo') {
                $equipo->update(['fecha_mantenimiento' => $request->fecha_programada]);
            }

            // Cargar relaciones para la respuesta
            $mantenimiento->load([
                'equipo:id,name,code',
                'tecnico:id,nombre,apellido'
            ]);

            DB::commit();

            return ResponseFormatter::success($mantenimiento, 'Mantenimiento creado exitosamente', 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return ResponseFormatter::error('Error al crear mantenimiento: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Mostrar mantenimiento específico
     */
    public function show($id)
    {
        try {
            $mantenimiento = Mantenimiento::with([
                'equipo:id,name,code,servicio_id,area_id,marca,modelo,serial',
                'equipo.servicio:id,name',
                'equipo.area:id,name',
                'tecnico:id,nombre,apellido,telefono,email',
                'observaciones.usuario:id,nombre,apellido'
            ])->findOrFail($id);

            // Agregar URL del archivo si existe
            if ($mantenimiento->file) {
                $mantenimiento->file_url = Storage::disk('public')->url($mantenimiento->file);
            }

            return ResponseFormatter::success($mantenimiento, 'Mantenimiento obtenido exitosamente');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener mantenimiento: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Actualizar mantenimiento
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'equipo_id' => 'required|exists:equipos,id',
            'description' => 'required|string|max:500',
            'fecha_programada' => 'required|date',
            'tecnico_id' => 'nullable|exists:usuarios,id',
            'tipo' => 'required|in:preventivo,correctivo,calibracion,verificacion',
            'prioridad' => 'nullable|in:baja,media,alta,critica',
            'observacion' => 'nullable|string',
            'file' => 'nullable|file|mimes:pdf,doc,docx,jpg,png|max:10240'
        ]);

        if ($validator->fails()) {
            return ResponseFormatter::validation($validator->errors());
        }

        try {
            DB::beginTransaction();

            $mantenimiento = Mantenimiento::findOrFail($id);
            $mantenimientoData = $request->except(['file']);

            // Manejar actualización de archivo
            if ($request->hasFile('file')) {
                // Eliminar archivo anterior si existe
                if ($mantenimiento->file && Storage::disk('public')->exists($mantenimiento->file)) {
                    Storage::disk('public')->delete($mantenimiento->file);
                }

                $file = $request->file('file');
                $fileName = 'mantenimientos/' . uniqid() . '.' . $file->getClientOriginalExtension();
                $filePath = $file->storeAs('mantenimientos', $fileName, 'public');
                $mantenimientoData['file'] = $filePath;
            }

            $mantenimiento->update($mantenimientoData);

            // Cargar relaciones para la respuesta
            $mantenimiento->load([
                'equipo:id,name,code',
                'tecnico:id,nombre,apellido'
            ]);

            if ($mantenimiento->file) {
                $mantenimiento->file_url = Storage::disk('public')->url($mantenimiento->file);
            }

            DB::commit();

            return ResponseFormatter::success($mantenimiento, 'Mantenimiento actualizado exitosamente');

        } catch (\Exception $e) {
            DB::rollBack();
            return ResponseFormatter::error('Error al actualizar mantenimiento: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Eliminar mantenimiento
     */
    public function destroy($id)
    {
        try {
            $mantenimiento = Mantenimiento::findOrFail($id);

            // Solo permitir eliminar si está programado
            if ($mantenimiento->status !== 'programado') {
                return ResponseFormatter::error(
                    'Solo se pueden eliminar mantenimientos programados',
                    400
                );
            }

            // Eliminar archivo si existe
            if ($mantenimiento->file && Storage::disk('public')->exists($mantenimiento->file)) {
                Storage::disk('public')->delete($mantenimiento->file);
            }

            $mantenimiento->delete();

            return ResponseFormatter::success(null, 'Mantenimiento eliminado exitosamente');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al eliminar mantenimiento: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Completar un mantenimiento programado o en proceso
     *
     * Este método marca un mantenimiento como completado, registra las observaciones finales,
     * repuestos utilizados, costos reales y tiempo invertido. Actualiza automáticamente
     * el estado del equipo y calcula la próxima fecha de mantenimiento si es preventivo.
     *
     * @param Request $request Datos de finalización (observaciones, repuestos, costos, etc.)
     * @param int $id Identificador único del mantenimiento a completar
     * @return JsonResponse Mantenimiento completado con información actualizada
     */
    public function completar(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'observaciones' => 'nullable|string',
            'repuestos_utilizados' => 'nullable|string',
            'costo' => 'nullable|numeric|min:0',
            'tiempo_real' => 'nullable|integer|min:1',
            'calificacion' => 'nullable|integer|min:1|max:5',
            'file_reporte' => 'nullable|file|mimes:pdf,doc,docx,jpg,png|max:10240'
        ]);

        if ($validator->fails()) {
            return ResponseFormatter::validation($validator->errors());
        }

        try {
            DB::beginTransaction();

            $mantenimiento = Mantenimiento::findOrFail($id);

            if ($mantenimiento->status === 'completado') {
                return ResponseFormatter::error('El mantenimiento ya está completado', 400);
            }

            $updateData = [
                'status' => 'completado',
                'fecha_fin' => now(),
                'observacion' => $request->observaciones,
                'repuestos_utilizados' => $request->repuestos_utilizados,
                'costo' => $request->costo,
                'tiempo_real' => $request->tiempo_real,
                'calificacion' => $request->calificacion
            ];

            // Manejar archivo de reporte
            if ($request->hasFile('file_reporte')) {
                $file = $request->file('file_reporte');
                $fileName = 'reportes_mantenimiento/' . uniqid() . '.' . $file->getClientOriginalExtension();
                $filePath = $file->storeAs('reportes_mantenimiento', $fileName, 'public');
                $updateData['file_reporte'] = $filePath;
            }

            $mantenimiento->update($updateData);

            // Actualizar último mantenimiento en equipo
            $equipo = $mantenimiento->equipo;
            $equipo->update([
                'fecha_mantenimiento' => now(),
                'estado_mantenimiento' => 'al_dia'
            ]);

            // Calcular próximo mantenimiento si es preventivo
            if ($mantenimiento->tipo === 'preventivo' && $equipo->frecuencia_id) {
                $proximoMantenimiento = $this->calcularProximoMantenimiento($equipo);
                $equipo->update(['proximo_mantenimiento' => $proximoMantenimiento]);
            }

            DB::commit();

            return ResponseFormatter::success($mantenimiento, 'Mantenimiento completado exitosamente');

        } catch (\Exception $e) {
            DB::rollBack();
            return ResponseFormatter::error('Error al completar mantenimiento: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Cancelar mantenimiento
     */
    public function cancelar(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'motivo_cancelacion' => 'required|string|max:500'
        ]);

        if ($validator->fails()) {
            return ResponseFormatter::validation($validator->errors());
        }

        try {
            $mantenimiento = Mantenimiento::findOrFail($id);

            if ($mantenimiento->status === 'completado') {
                return ResponseFormatter::error('No se puede cancelar un mantenimiento completado', 400);
            }

            $mantenimiento->update([
                'status' => 'cancelado',
                'motivo_cancelacion' => $request->motivo_cancelacion,
                'fecha_cancelacion' => now()
            ]);

            return ResponseFormatter::success($mantenimiento, 'Mantenimiento cancelado exitosamente');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al cancelar mantenimiento: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Obtener mantenimientos por equipo
     */
    public function porEquipo($equipoId)
    {
        try {
            $mantenimientos = Mantenimiento::with([
                'tecnico:id,nombre,apellido',
                'observaciones'
            ])
            ->where('equipo_id', $equipoId)
            ->orderBy('fecha_programada', 'desc')
            ->get();

            return ResponseFormatter::success($mantenimientos, 'Mantenimientos del equipo obtenidos');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener mantenimientos: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Obtener mantenimientos vencidos
     */
    public function vencidos()
    {
        try {
            $mantenimientos = Mantenimiento::with([
                'equipo:id,name,code,servicio_id,area_id',
                'equipo.servicio:id,name',
                'equipo.area:id,name',
                'tecnico:id,nombre,apellido'
            ])
            ->where('status', 'programado')
            ->where('fecha_programada', '<', now())
            ->orderBy('fecha_programada', 'asc')
            ->get();

            // Calcular días de retraso
            $mantenimientos->each(function ($mantenimiento) {
                $mantenimiento->dias_retraso = Carbon::parse($mantenimiento->fecha_programada)->diffInDays(now());
            });

            return ResponseFormatter::success($mantenimientos, 'Mantenimientos vencidos obtenidos');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener mantenimientos vencidos: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Obtener mantenimientos programados
     */
    public function programados()
    {
        try {
            $mantenimientos = Mantenimiento::with([
                'equipo:id,name,code,servicio_id,area_id',
                'equipo.servicio:id,name',
                'equipo.area:id,name',
                'tecnico:id,nombre,apellido'
            ])
            ->where('status', 'programado')
            ->where('fecha_programada', '>=', now())
            ->orderBy('fecha_programada', 'asc')
            ->get();

            // Calcular días hasta el mantenimiento
            $mantenimientos->each(function ($mantenimiento) {
                $mantenimiento->dias_hasta = Carbon::parse($mantenimiento->fecha_programada)->diffInDays(now());
            });

            return ResponseFormatter::success($mantenimientos, 'Mantenimientos programados obtenidos');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener mantenimientos programados: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Obtener estadísticas de mantenimientos
     */
    public function estadisticas(Request $request)
    {
        try {
            $year = $request->get('year', date('Y'));

            $stats = [
                'total_programados' => Mantenimiento::whereYear('fecha_programada', $year)->count(),
                'total_completados' => Mantenimiento::where('status', 'completado')
                    ->whereYear('fecha_programada', $year)->count(),
                'total_vencidos' => Mantenimiento::where('status', 'programado')
                    ->where('fecha_programada', '<', now())->count(),
                'total_cancelados' => Mantenimiento::where('status', 'cancelado')
                    ->whereYear('fecha_programada', $year)->count(),
                'por_tipo' => Mantenimiento::whereYear('fecha_programada', $year)
                    ->groupBy('tipo')
                    ->selectRaw('tipo, count(*) as total')
                    ->get(),
                'por_mes' => Mantenimiento::whereYear('fecha_programada', $year)
                    ->groupBy(DB::raw('MONTH(fecha_programada)'))
                    ->selectRaw('MONTH(fecha_programada) as mes, count(*) as total')
                    ->orderBy('mes')
                    ->get(),
                'cumplimiento' => 0
            ];

            // Calcular porcentaje de cumplimiento
            if ($stats['total_programados'] > 0) {
                $stats['cumplimiento'] = round(
                    ($stats['total_completados'] / $stats['total_programados']) * 100,
                    2
                );
            }

            return ResponseFormatter::success($stats, 'Estadísticas de mantenimientos obtenidas');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener estadísticas: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Calcular próximo mantenimiento basado en frecuencia
     */
    private function calcularProximoMantenimiento($equipo)
    {
        $frecuencia = $equipo->frecuenciaMantenimiento;
        if (!$frecuencia) {
            return null;
        }

        $fechaBase = Carbon::now();

        switch (strtolower($frecuencia->name)) {
            case 'mensual':
                return $fechaBase->addMonth();
            case 'bimestral':
                return $fechaBase->addMonths(2);
            case 'trimestral':
                return $fechaBase->addMonths(3);
            case 'semestral':
                return $fechaBase->addMonths(6);
            case 'anual':
                return $fechaBase->addYear();
            default:
                return $fechaBase->addMonths(3); // Default trimestral
        }
    }
}
