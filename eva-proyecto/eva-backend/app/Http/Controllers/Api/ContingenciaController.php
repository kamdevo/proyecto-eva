<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\ConexionesVista\ApiController;
use App\ConexionesVista\ResponseFormatter;
use App\Models\Contingencia;
use App\Models\Equipo;
use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

/**
 * Controlador para gestión completa de contingencias
 * Maneja reportes de fallas, incidentes y eventos adversos
 */
class ContingenciaController extends ApiController
{
    /**
     * Obtener lista de contingencias con filtros
     */
    public function index(Request $request)
    {
        try {
            $query = Contingencia::with([
                'equipo:id,name,code,servicio_id,area_id',
                'equipo.servicio:id,name',
                'equipo.area:id,name',
                'usuarioReporta:id,nombre,apellido',
                'usuarioAsignado:id,nombre,apellido'
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

            if ($request->has('estado')) {
                $query->where('estado', $request->estado);
            }

            if ($request->has('severidad')) {
                $query->where('severidad', $request->severidad);
            }

            if ($request->has('tipo')) {
                $query->where('tipo', $request->tipo);
            }

            if ($request->has('usuario_reporta')) {
                $query->where('usuario_reporta', $request->usuario_reporta);
            }

            if ($request->has('fecha_desde')) {
                $query->where('fecha', '>=', $request->fecha_desde);
            }

            if ($request->has('fecha_hasta')) {
                $query->where('fecha', '<=', $request->fecha_hasta);
            }

            // Filtro por contingencias abiertas
            if ($request->has('solo_abiertas') && $request->solo_abiertas) {
                $query->where('estado', '!=', 'Cerrado');
            }

            // Ordenamiento
            $orderBy = $request->get('order_by', 'fecha');
            $orderDirection = $request->get('order_direction', 'desc');
            $query->orderBy($orderBy, $orderDirection);

            // Paginación
            $perPage = $request->get('per_page', 15);
            $contingencias = $query->paginate($perPage);

            // Calcular tiempo transcurrido para contingencias abiertas
            $contingencias->getCollection()->transform(function ($contingencia) {
                if ($contingencia->estado !== 'Cerrado') {
                    $contingencia->tiempo_transcurrido = Carbon::parse($contingencia->fecha)->diffForHumans();
                    $contingencia->horas_transcurridas = Carbon::parse($contingencia->fecha)->diffInHours(now());
                }

                if ($contingencia->archivo) {
                    $contingencia->archivo_url = Storage::disk('public')->url($contingencia->archivo);
                }

                return $contingencia;
            });

            return ResponseFormatter::success($contingencias, 'Contingencias obtenidas exitosamente');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener contingencias: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Crear nueva contingencia
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'equipo_id' => 'required|exists:equipos,id',
            'descripcion' => 'required|string|max:1000',
            'fecha' => 'required|date',
            'severidad' => 'required|in:Baja,Media,Alta,Crítica',
            'tipo' => 'required|in:Falla,Incidente,Evento Adverso,Mantenimiento Urgente',
            'estado' => 'nullable|in:Abierto,En Proceso,Resuelto,Cerrado',
            'usuario_reporta' => 'required|exists:usuarios,id',
            'usuario_asignado' => 'nullable|exists:usuarios,id',
            'observaciones' => 'nullable|string',
            'accion_inmediata' => 'nullable|string',
            'impacto_servicio' => 'nullable|in:Ninguno,Bajo,Medio,Alto,Crítico',
            'archivo' => 'nullable|file|mimes:pdf,doc,docx,jpg,png|max:10240'
        ]);

        if ($validator->fails()) {
            return ResponseFormatter::validation($validator->errors());
        }

        try {
            DB::beginTransaction();

            $contingenciaData = $request->except(['archivo']);
            $contingenciaData['estado'] = $contingenciaData['estado'] ?? 'Abierto';
            $contingenciaData['created_at'] = now();

            // Manejar archivo adjunto
            if ($request->hasFile('archivo')) {
                $file = $request->file('archivo');
                $fileName = 'contingencias/' . uniqid() . '.' . $file->getClientOriginalExtension();
                $filePath = $file->storeAs('contingencias', $fileName, 'public');
                $contingenciaData['archivo'] = $filePath;
            }

            $contingencia = Contingencia::create($contingenciaData);

            // Cargar relaciones para la respuesta
            $contingencia->load([
                'equipo:id,name,code',
                'usuarioReporta:id,nombre,apellido',
                'usuarioAsignado:id,nombre,apellido'
            ]);

            DB::commit();

            return ResponseFormatter::success($contingencia, 'Contingencia creada exitosamente', 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return ResponseFormatter::error('Error al crear contingencia: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Mostrar contingencia específica
     */
    public function show($id)
    {
        try {
            $contingencia = Contingencia::with([
                'equipo:id,name,code,servicio_id,area_id,marca,modelo,serial',
                'equipo.servicio:id,name',
                'equipo.area:id,name',
                'usuarioReporta:id,nombre,apellido,telefono,email',
                'usuarioAsignado:id,nombre,apellido,telefono,email',
                'seguimientos.usuario:id,nombre,apellido'
            ])->findOrFail($id);

            // Agregar URL del archivo si existe
            if ($contingencia->archivo) {
                $contingencia->archivo_url = Storage::disk('public')->url($contingencia->archivo);
            }

            // Calcular tiempo de resolución si está cerrada
            if ($contingencia->estado === 'Cerrado' && $contingencia->fecha_cierre) {
                $contingencia->tiempo_resolucion = Carbon::parse($contingencia->fecha)
                    ->diffForHumans(Carbon::parse($contingencia->fecha_cierre), true);
                $contingencia->horas_resolucion = Carbon::parse($contingencia->fecha)
                    ->diffInHours(Carbon::parse($contingencia->fecha_cierre));
            }

            return ResponseFormatter::success($contingencia, 'Contingencia obtenida exitosamente');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener contingencia: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Actualizar contingencia
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'equipo_id' => 'required|exists:equipos,id',
            'descripcion' => 'required|string|max:1000',
            'fecha' => 'required|date',
            'severidad' => 'required|in:Baja,Media,Alta,Crítica',
            'tipo' => 'required|in:Falla,Incidente,Evento Adverso,Mantenimiento Urgente',
            'estado' => 'required|in:Abierto,En Proceso,Resuelto,Cerrado',
            'usuario_reporta' => 'required|exists:usuarios,id',
            'usuario_asignado' => 'nullable|exists:usuarios,id',
            'observaciones' => 'nullable|string',
            'accion_inmediata' => 'nullable|string',
            'impacto_servicio' => 'nullable|in:Ninguno,Bajo,Medio,Alto,Crítico',
            'archivo' => 'nullable|file|mimes:pdf,doc,docx,jpg,png|max:10240'
        ]);

        if ($validator->fails()) {
            return ResponseFormatter::validation($validator->errors());
        }

        try {
            DB::beginTransaction();

            $contingencia = Contingencia::findOrFail($id);
            $contingenciaData = $request->except(['archivo']);

            // Manejar actualización de archivo
            if ($request->hasFile('archivo')) {
                // Eliminar archivo anterior si existe
                if ($contingencia->archivo && Storage::disk('public')->exists($contingencia->archivo)) {
                    Storage::disk('public')->delete($contingencia->archivo);
                }

                $file = $request->file('archivo');
                $fileName = 'contingencias/' . uniqid() . '.' . $file->getClientOriginalExtension();
                $filePath = $file->storeAs('contingencias', $fileName, 'public');
                $contingenciaData['archivo'] = $filePath;
            }

            // Si se está cerrando la contingencia, agregar fecha de cierre
            if ($request->estado === 'Cerrado' && $contingencia->estado !== 'Cerrado') {
                $contingenciaData['fecha_cierre'] = now();
            }

            $contingencia->update($contingenciaData);

            // Cargar relaciones para la respuesta
            $contingencia->load([
                'equipo:id,name,code',
                'usuarioReporta:id,nombre,apellido',
                'usuarioAsignado:id,nombre,apellido'
            ]);

            if ($contingencia->archivo) {
                $contingencia->archivo_url = Storage::disk('public')->url($contingencia->archivo);
            }

            DB::commit();

            return ResponseFormatter::success($contingencia, 'Contingencia actualizada exitosamente');

        } catch (\Exception $e) {
            DB::rollBack();
            return ResponseFormatter::error('Error al actualizar contingencia: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Eliminar contingencia
     */
    public function destroy($id)
    {
        try {
            $contingencia = Contingencia::findOrFail($id);

            // Solo permitir eliminar si está en estado Abierto
            if ($contingencia->estado !== 'Abierto') {
                return ResponseFormatter::error(
                    'Solo se pueden eliminar contingencias en estado Abierto',
                    400
                );
            }

            // Eliminar archivo si existe
            if ($contingencia->archivo && Storage::disk('public')->exists($contingencia->archivo)) {
                Storage::disk('public')->delete($contingencia->archivo);
            }

            $contingencia->delete();

            return ResponseFormatter::success(null, 'Contingencia eliminada exitosamente');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al eliminar contingencia: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Cerrar contingencia
     */
    public function cerrar(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'solucion' => 'required|string|max:1000',
            'observaciones_cierre' => 'nullable|string',
            'costo_reparacion' => 'nullable|numeric|min:0',
            'tiempo_inactividad' => 'nullable|integer|min:0',
            'archivo_cierre' => 'nullable|file|mimes:pdf,doc,docx,jpg,png|max:10240'
        ]);

        if ($validator->fails()) {
            return ResponseFormatter::validation($validator->errors());
        }

        try {
            DB::beginTransaction();

            $contingencia = Contingencia::findOrFail($id);

            if ($contingencia->estado === 'Cerrado') {
                return ResponseFormatter::error('La contingencia ya está cerrada', 400);
            }

            $updateData = [
                'estado' => 'Cerrado',
                'fecha_cierre' => now(),
                'solucion' => $request->solucion,
                'observaciones_cierre' => $request->observaciones_cierre,
                'costo_reparacion' => $request->costo_reparacion,
                'tiempo_inactividad' => $request->tiempo_inactividad
            ];

            // Manejar archivo de cierre
            if ($request->hasFile('archivo_cierre')) {
                $file = $request->file('archivo_cierre');
                $fileName = 'contingencias_cierre/' . uniqid() . '.' . $file->getClientOriginalExtension();
                $filePath = $file->storeAs('contingencias_cierre', $fileName, 'public');
                $updateData['archivo_cierre'] = $filePath;
            }

            $contingencia->update($updateData);

            DB::commit();

            return ResponseFormatter::success($contingencia, 'Contingencia cerrada exitosamente');

        } catch (\Exception $e) {
            DB::rollBack();
            return ResponseFormatter::error('Error al cerrar contingencia: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Obtener contingencias por equipo
     */
    public function porEquipo($equipoId)
    {
        try {
            $contingencias = Contingencia::with([
                'usuarioReporta:id,nombre,apellido',
                'usuarioAsignado:id,nombre,apellido'
            ])
            ->where('equipo_id', $equipoId)
            ->orderBy('fecha', 'desc')
            ->get();

            return ResponseFormatter::success($contingencias, 'Contingencias del equipo obtenidas');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener contingencias: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Obtener contingencias abiertas
     */
    public function abiertas()
    {
        try {
            $contingencias = Contingencia::with([
                'equipo:id,name,code,servicio_id,area_id',
                'equipo.servicio:id,name',
                'equipo.area:id,name',
                'usuarioReporta:id,nombre,apellido',
                'usuarioAsignado:id,nombre,apellido'
            ])
            ->where('estado', '!=', 'Cerrado')
            ->orderBy('severidad', 'desc')
            ->orderBy('fecha', 'asc')
            ->get();

            // Calcular tiempo transcurrido
            $contingencias->each(function ($contingencia) {
                $contingencia->horas_transcurridas = Carbon::parse($contingencia->fecha)->diffInHours(now());
                $contingencia->tiempo_transcurrido = Carbon::parse($contingencia->fecha)->diffForHumans();
            });

            return ResponseFormatter::success($contingencias, 'Contingencias abiertas obtenidas');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener contingencias abiertas: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Obtener contingencias críticas
     */
    public function criticas()
    {
        try {
            $contingencias = Contingencia::with([
                'equipo:id,name,code,servicio_id,area_id',
                'equipo.servicio:id,name',
                'equipo.area:id,name',
                'usuarioReporta:id,nombre,apellido',
                'usuarioAsignado:id,nombre,apellido'
            ])
            ->whereIn('severidad', ['Alta', 'Crítica'])
            ->where('estado', '!=', 'Cerrado')
            ->orderBy('fecha', 'asc')
            ->get();

            return ResponseFormatter::success($contingencias, 'Contingencias críticas obtenidas');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener contingencias críticas: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Obtener estadísticas de contingencias
     */
    public function estadisticas(Request $request)
    {
        try {
            $year = $request->get('year', date('Y'));

            $stats = [
                'total_reportadas' => Contingencia::whereYear('fecha', $year)->count(),
                'total_cerradas' => Contingencia::where('estado', 'Cerrado')
                    ->whereYear('fecha', $year)->count(),
                'total_abiertas' => Contingencia::where('estado', '!=', 'Cerrado')->count(),
                'por_severidad' => Contingencia::whereYear('fecha', $year)
                    ->groupBy('severidad')
                    ->selectRaw('severidad, count(*) as total')
                    ->get(),
                'por_tipo' => Contingencia::whereYear('fecha', $year)
                    ->groupBy('tipo')
                    ->selectRaw('tipo, count(*) as total')
                    ->get(),
                'por_estado' => Contingencia::whereYear('fecha', $year)
                    ->groupBy('estado')
                    ->selectRaw('estado, count(*) as total')
                    ->get(),
                'por_mes' => Contingencia::whereYear('fecha', $year)
                    ->groupBy(DB::raw('MONTH(fecha)'))
                    ->selectRaw('MONTH(fecha) as mes, count(*) as total')
                    ->orderBy('mes')
                    ->get(),
                'tiempo_promedio_resolucion' => $this->getTiempoPromedioResolucion($year),
                'costo_total_reparaciones' => Contingencia::where('estado', 'Cerrado')
                    ->whereYear('fecha', $year)->sum('costo_reparacion'),
                'equipos_mas_contingencias' => $this->getEquiposMasContingencias($year)
            ];

            return ResponseFormatter::success($stats, 'Estadísticas de contingencias obtenidas');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener estadísticas: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Asignar contingencia a usuario
     */
    public function asignar(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'usuario_asignado' => 'required|exists:usuarios,id',
            'observaciones' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return ResponseFormatter::validation($validator->errors());
        }

        try {
            $contingencia = Contingencia::findOrFail($id);

            $contingencia->update([
                'usuario_asignado' => $request->usuario_asignado,
                'estado' => 'En Proceso',
                'fecha_asignacion' => now()
            ]);

            // Cargar relaciones
            $contingencia->load([
                'usuarioAsignado:id,nombre,apellido'
            ]);

            return ResponseFormatter::success($contingencia, 'Contingencia asignada exitosamente');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al asignar contingencia: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Métodos auxiliares privados
     */
    private function getTiempoPromedioResolucion($year)
    {
        $contingenciasCerradas = Contingencia::where('estado', 'Cerrado')
            ->whereYear('fecha', $year)
            ->whereNotNull('fecha_cierre')
            ->get();

        if ($contingenciasCerradas->isEmpty()) {
            return 0;
        }

        $tiempoTotal = 0;
        foreach ($contingenciasCerradas as $contingencia) {
            $tiempoTotal += Carbon::parse($contingencia->fecha)->diffInHours(Carbon::parse($contingencia->fecha_cierre));
        }

        return round($tiempoTotal / $contingenciasCerradas->count(), 2);
    }

    private function getEquiposMasContingencias($year)
    {
        return Contingencia::join('equipos', 'contingencias.equipo_id', '=', 'equipos.id')
            ->whereYear('contingencias.fecha', $year)
            ->groupBy('equipos.id', 'equipos.name', 'equipos.code')
            ->selectRaw('equipos.id, equipos.name, equipos.code, count(*) as total_contingencias')
            ->orderBy('total_contingencias', 'desc')
            ->limit(10)
            ->get();
    }
}
