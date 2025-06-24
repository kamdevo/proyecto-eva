<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\ConexionesVista\ApiController;
use App\ConexionesVista\ResponseFormatter;
use App\Models\Capacitacion;
use App\Models\Equipo;
use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

/**
 * Controlador para gestión completa de capacitaciones
 * Maneja entrenamientos, cursos y formación del personal
 */
class CapacitacionController extends ApiController
{
    /**
     * Obtener lista de capacitaciones con filtros
     */
    public function index(Request $request)
    {
        try {
            $query = Capacitacion::with([
                'instructor:id,nombre,apellido',
                'participantes',
                'equipos'
            ]);

            // Aplicar filtros
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('titulo', 'like', "%{$search}%")
                      ->orWhere('descripcion', 'like', "%{$search}%")
                      ->orWhere('tema', 'like', "%{$search}%");
                });
            }

            if ($request->has('estado')) {
                $query->where('estado', $request->estado);
            }

            if ($request->has('tipo')) {
                $query->where('tipo', $request->tipo);
            }

            if ($request->has('modalidad')) {
                $query->where('modalidad', $request->modalidad);
            }

            if ($request->has('instructor_id')) {
                $query->where('instructor_id', $request->instructor_id);
            }

            if ($request->has('fecha_desde')) {
                $query->where('fecha_inicio', '>=', $request->fecha_desde);
            }

            if ($request->has('fecha_hasta')) {
                $query->where('fecha_fin', '<=', $request->fecha_hasta);
            }

            // Ordenamiento
            $orderBy = $request->get('order_by', 'fecha_inicio');
            $orderDirection = $request->get('order_direction', 'desc');
            $query->orderBy($orderBy, $orderDirection);

            // Paginación
            $perPage = $request->get('per_page', 15);
            $capacitaciones = $query->paginate($perPage);

            return ResponseFormatter::success($capacitaciones, 'Capacitaciones obtenidas exitosamente');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener capacitaciones: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Crear nueva capacitación
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'titulo' => 'required|string|max:255',
            'descripcion' => 'required|string',
            'tipo' => 'required|in:induccion,actualizacion,especializacion,certificacion',
            'modalidad' => 'required|in:presencial,virtual,mixta',
            'fecha_inicio' => 'required|date',
            'fecha_fin' => 'required|date|after_or_equal:fecha_inicio',
            'duracion_horas' => 'required|integer|min:1',
            'instructor_id' => 'required|exists:usuarios,id',
            'lugar' => 'nullable|string|max:255',
            'capacidad_maxima' => 'nullable|integer|min:1',
            'costo' => 'nullable|numeric|min:0',
            'certificacion' => 'nullable|boolean',
            'material_curso' => 'nullable|file|mimes:pdf,doc,docx,zip|max:51200'
        ]);

        if ($validator->fails()) {
            return ResponseFormatter::validation($validator->errors());
        }

        try {
            DB::beginTransaction();

            $capacitacionData = $request->except(['material_curso']);
            $capacitacionData['estado'] = 'programada';
            $capacitacionData['created_at'] = now();

            // Manejar material del curso
            if ($request->hasFile('material_curso')) {
                $file = $request->file('material_curso');
                $fileName = 'capacitaciones/' . uniqid() . '.' . $file->getClientOriginalExtension();
                $filePath = $file->storeAs('capacitaciones', $fileName, 'public');
                $capacitacionData['material_curso'] = $filePath;
            }

            $capacitacion = Capacitacion::create($capacitacionData);

            // Cargar relaciones para la respuesta
            $capacitacion->load([
                'instructor:id,nombre,apellido'
            ]);

            DB::commit();

            return ResponseFormatter::success($capacitacion, 'Capacitación creada exitosamente', 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return ResponseFormatter::error('Error al crear capacitación: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Mostrar capacitación específica
     */
    public function show($id)
    {
        try {
            $capacitacion = Capacitacion::with([
                'instructor:id,nombre,apellido,telefono,email',
                'participantes:id,nombre,apellido,email',
                'equipos:id,name,code',
                'evaluaciones'
            ])->findOrFail($id);

            // Agregar URL del material si existe
            if ($capacitacion->material_curso) {
                $capacitacion->material_url = Storage::disk('public')->url($capacitacion->material_curso);
            }

            // Calcular estadísticas
            $capacitacion->estadisticas = [
                'total_participantes' => $capacitacion->participantes->count(),
                'participantes_aprobados' => $capacitacion->evaluaciones->where('aprobado', true)->count(),
                'promedio_calificacion' => $capacitacion->evaluaciones->avg('calificacion'),
                'porcentaje_aprobacion' => $capacitacion->participantes->count() > 0 
                    ? round(($capacitacion->evaluaciones->where('aprobado', true)->count() / $capacitacion->participantes->count()) * 100, 2)
                    : 0
            ];

            return ResponseFormatter::success($capacitacion, 'Capacitación obtenida exitosamente');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener capacitación: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Actualizar capacitación
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'titulo' => 'required|string|max:255',
            'descripcion' => 'required|string',
            'tipo' => 'required|in:induccion,actualizacion,especializacion,certificacion',
            'modalidad' => 'required|in:presencial,virtual,mixta',
            'fecha_inicio' => 'required|date',
            'fecha_fin' => 'required|date|after_or_equal:fecha_inicio',
            'duracion_horas' => 'required|integer|min:1',
            'instructor_id' => 'required|exists:usuarios,id',
            'lugar' => 'nullable|string|max:255',
            'capacidad_maxima' => 'nullable|integer|min:1',
            'costo' => 'nullable|numeric|min:0',
            'certificacion' => 'nullable|boolean',
            'estado' => 'required|in:programada,en_curso,completada,cancelada',
            'material_curso' => 'nullable|file|mimes:pdf,doc,docx,zip|max:51200'
        ]);

        if ($validator->fails()) {
            return ResponseFormatter::validation($validator->errors());
        }

        try {
            DB::beginTransaction();

            $capacitacion = Capacitacion::findOrFail($id);
            $capacitacionData = $request->except(['material_curso']);

            // Manejar actualización de material
            if ($request->hasFile('material_curso')) {
                // Eliminar material anterior si existe
                if ($capacitacion->material_curso && Storage::disk('public')->exists($capacitacion->material_curso)) {
                    Storage::disk('public')->delete($capacitacion->material_curso);
                }

                $file = $request->file('material_curso');
                $fileName = 'capacitaciones/' . uniqid() . '.' . $file->getClientOriginalExtension();
                $filePath = $file->storeAs('capacitaciones', $fileName, 'public');
                $capacitacionData['material_curso'] = $filePath;
            }

            $capacitacion->update($capacitacionData);

            // Cargar relaciones para la respuesta
            $capacitacion->load([
                'instructor:id,nombre,apellido'
            ]);

            if ($capacitacion->material_curso) {
                $capacitacion->material_url = Storage::disk('public')->url($capacitacion->material_curso);
            }

            DB::commit();

            return ResponseFormatter::success($capacitacion, 'Capacitación actualizada exitosamente');

        } catch (\Exception $e) {
            DB::rollBack();
            return ResponseFormatter::error('Error al actualizar capacitación: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Eliminar capacitación
     */
    public function destroy($id)
    {
        try {
            $capacitacion = Capacitacion::findOrFail($id);

            // Solo permitir eliminar si está programada
            if ($capacitacion->estado !== 'programada') {
                return ResponseFormatter::error(
                    'Solo se pueden eliminar capacitaciones programadas', 
                    400
                );
            }

            // Eliminar material si existe
            if ($capacitacion->material_curso && Storage::disk('public')->exists($capacitacion->material_curso)) {
                Storage::disk('public')->delete($capacitacion->material_curso);
            }

            $capacitacion->delete();

            return ResponseFormatter::success(null, 'Capacitación eliminada exitosamente');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al eliminar capacitación: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Inscribir participante
     */
    public function inscribir(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'usuario_id' => 'required|exists:usuarios,id'
        ]);

        if ($validator->fails()) {
            return ResponseFormatter::validation($validator->errors());
        }

        try {
            $capacitacion = Capacitacion::findOrFail($id);

            // Verificar capacidad
            if ($capacitacion->capacidad_maxima && 
                $capacitacion->participantes->count() >= $capacitacion->capacidad_maxima) {
                return ResponseFormatter::error('La capacitación ha alcanzado su capacidad máxima', 400);
            }

            // Verificar si ya está inscrito
            if ($capacitacion->participantes->contains($request->usuario_id)) {
                return ResponseFormatter::error('El usuario ya está inscrito en esta capacitación', 400);
            }

            $capacitacion->participantes()->attach($request->usuario_id, [
                'fecha_inscripcion' => now()
            ]);

            return ResponseFormatter::success(null, 'Participante inscrito exitosamente');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al inscribir participante: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Completar capacitación
     */
    public function completar(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'evaluaciones' => 'required|array',
            'evaluaciones.*.usuario_id' => 'required|exists:usuarios,id',
            'evaluaciones.*.calificacion' => 'required|numeric|min:0|max:100',
            'evaluaciones.*.asistio' => 'required|boolean',
            'observaciones_finales' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return ResponseFormatter::validation($validator->errors());
        }

        try {
            DB::beginTransaction();

            $capacitacion = Capacitacion::findOrFail($id);

            if ($capacitacion->estado === 'completada') {
                return ResponseFormatter::error('La capacitación ya está completada', 400);
            }

            // Actualizar estado de la capacitación
            $capacitacion->update([
                'estado' => 'completada',
                'observaciones_finales' => $request->observaciones_finales
            ]);

            // Registrar evaluaciones
            foreach ($request->evaluaciones as $evaluacion) {
                $capacitacion->evaluaciones()->create([
                    'usuario_id' => $evaluacion['usuario_id'],
                    'calificacion' => $evaluacion['calificacion'],
                    'asistio' => $evaluacion['asistio'],
                    'aprobado' => $evaluacion['calificacion'] >= 70 && $evaluacion['asistio'],
                    'observaciones' => $evaluacion['observaciones'] ?? null
                ]);

                // Actualizar pivot de participantes
                $capacitacion->participantes()->updateExistingPivot($evaluacion['usuario_id'], [
                    'asistio' => $evaluacion['asistio'],
                    'calificacion' => $evaluacion['calificacion'],
                    'aprobado' => $evaluacion['calificacion'] >= 70 && $evaluacion['asistio']
                ]);
            }

            DB::commit();

            return ResponseFormatter::success($capacitacion, 'Capacitación completada exitosamente');

        } catch (\Exception $e) {
            DB::rollBack();
            return ResponseFormatter::error('Error al completar capacitación: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Obtener capacitaciones programadas
     */
    public function programadas()
    {
        try {
            $capacitaciones = Capacitacion::with([
                'instructor:id,nombre,apellido'
            ])
            ->where('estado', 'programada')
            ->where('fecha_inicio', '>=', now())
            ->orderBy('fecha_inicio', 'asc')
            ->get();

            return ResponseFormatter::success($capacitaciones, 'Capacitaciones programadas obtenidas');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener capacitaciones: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Obtener estadísticas de capacitaciones
     */
    public function estadisticas(Request $request)
    {
        try {
            $year = $request->get('year', date('Y'));

            $stats = [
                'total_capacitaciones' => Capacitacion::whereYear('fecha_inicio', $year)->count(),
                'capacitaciones_completadas' => Capacitacion::where('estado', 'completada')
                    ->whereYear('fecha_inicio', $year)->count(),
                'capacitaciones_programadas' => Capacitacion::where('estado', 'programada')
                    ->where('fecha_inicio', '>=', now())->count(),
                'total_participantes' => DB::table('capacitacion_participantes')
                    ->join('capacitaciones', 'capacitacion_participantes.capacitacion_id', '=', 'capacitaciones.id')
                    ->whereYear('capacitaciones.fecha_inicio', $year)
                    ->count(),
                'participantes_aprobados' => DB::table('capacitacion_participantes')
                    ->join('capacitaciones', 'capacitacion_participantes.capacitacion_id', '=', 'capacitaciones.id')
                    ->whereYear('capacitaciones.fecha_inicio', $year)
                    ->where('capacitacion_participantes.aprobado', true)
                    ->count(),
                'por_tipo' => Capacitacion::whereYear('fecha_inicio', $year)
                    ->groupBy('tipo')
                    ->selectRaw('tipo, count(*) as total')
                    ->get(),
                'por_modalidad' => Capacitacion::whereYear('fecha_inicio', $year)
                    ->groupBy('modalidad')
                    ->selectRaw('modalidad, count(*) as total')
                    ->get(),
                'por_mes' => Capacitacion::whereYear('fecha_inicio', $year)
                    ->groupBy(DB::raw('MONTH(fecha_inicio)'))
                    ->selectRaw('MONTH(fecha_inicio) as mes, count(*) as total')
                    ->orderBy('mes')
                    ->get(),
                'costo_total' => Capacitacion::whereYear('fecha_inicio', $year)->sum('costo'),
                'horas_totales' => Capacitacion::whereYear('fecha_inicio', $year)->sum('duracion_horas'),
                'promedio_calificacion' => DB::table('capacitacion_evaluaciones')
                    ->join('capacitaciones', 'capacitacion_evaluaciones.capacitacion_id', '=', 'capacitaciones.id')
                    ->whereYear('capacitaciones.fecha_inicio', $year)
                    ->avg('capacitacion_evaluaciones.calificacion')
            ];

            return ResponseFormatter::success($stats, 'Estadísticas de capacitaciones obtenidas');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener estadísticas: ' . $e->getMessage(), 500);
        }
    }
}
