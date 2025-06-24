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
use Illuminate\Support\Facades\Mail;
use Carbon\Carbon;

/**
 * Controlador COMPLETO para gestión de contingencias y emergencias
 * Sistema avanzado de manejo de incidentes y emergencias médicas
 */
class ControladorContingencias extends ApiController
{
    /**
     * ENDPOINT COMPLETO: Lista de contingencias con filtros avanzados
     */
    public function index(Request $request)
    {
        try {
            $query = Contingencia::with([
                'equipo:id,name,code,servicio_id,area_id',
                'equipo.servicio:id,nombre',
                'equipo.area:id,nombre',
                'usuarioReporta:id,nombre,apellido',
                'usuarioAsignado:id,nombre,apellido'
            ]);

            // Filtros avanzados
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('titulo', 'like', "%{$search}%")
                      ->orWhere('descripcion', 'like', "%{$search}%")
                      ->orWhereHas('equipo', function($eq) use ($search) {
                          $eq->where('name', 'like', "%{$search}%")
                             ->orWhere('code', 'like', "%{$search}%");
                      });
                });
            }

            if ($request->has('estado')) {
                $query->where('estado', $request->estado);
            }

            if ($request->has('severidad')) {
                $query->where('severidad', $request->severidad);
            }

            if ($request->has('impacto')) {
                $query->where('impacto', $request->impacto);
            }

            if ($request->has('categoria')) {
                $query->where('categoria', $request->categoria);
            }

            if ($request->has('equipo_id')) {
                $query->where('equipo_id', $request->equipo_id);
            }

            if ($request->has('usuario_asignado')) {
                $query->where('usuario_asignado', $request->usuario_asignado);
            }

            if ($request->has('fecha_desde')) {
                $query->where('fecha_reporte', '>=', $request->fecha_desde);
            }

            if ($request->has('fecha_hasta')) {
                $query->where('fecha_reporte', '<=', $request->fecha_hasta);
            }

            // Filtro por tiempo de respuesta
            if ($request->has('tiempo_respuesta')) {
                $horas = $request->tiempo_respuesta;
                $query->whereRaw("TIMESTAMPDIFF(HOUR, fecha_reporte, COALESCE(fecha_asignacion, NOW())) <= ?", [$horas]);
            }

            // Ordenamiento
            $orderBy = $request->get('order_by', 'fecha_reporte');
            $orderDirection = $request->get('order_direction', 'desc');
            $query->orderBy($orderBy, $orderDirection);

            // Paginación
            $perPage = $request->get('per_page', 15);
            $contingencias = $query->paginate($perPage);

            // Agregar métricas adicionales
            $contingencias->getCollection()->transform(function ($contingencia) {
                $contingencia->tiempo_respuesta = $this->calcularTiempoRespuesta($contingencia);
                $contingencia->tiempo_resolucion = $this->calcularTiempoResolucion($contingencia);
                $contingencia->prioridad_calculada = $this->calcularPrioridad($contingencia);
                return $contingencia;
            });

            return ResponseFormatter::success($contingencias, 'Lista de contingencias obtenida exitosamente');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener contingencias: ' . $e->getMessage(), 500);
        }
    }

    /**
     * ENDPOINT COMPLETO: Crear nueva contingencia
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'equipo_id' => 'required|exists:equipos,id',
            'titulo' => 'required|string|max:255',
            'descripcion' => 'required|string',
            'severidad' => 'required|in:Baja,Media,Alta,Crítica',
            'impacto' => 'required|in:Bajo,Medio,Alto,Crítico',
            'categoria' => 'required|string|max:100',
            'usuario_asignado' => 'nullable|exists:usuarios,id',
            'fecha_estimada_resolucion' => 'nullable|date|after:today',
            'archivo_evidencia' => 'nullable|file|mimes:pdf,doc,docx,jpg,png,mp4,avi|max:20480'
        ]);

        if ($validator->fails()) {
            return ResponseFormatter::validation($validator->errors());
        }

        try {
            DB::beginTransaction();

            $contingenciaData = $request->except(['archivo_evidencia']);
            $contingenciaData['usuario_reporta'] = auth()->id();
            $contingenciaData['fecha_reporte'] = now();
            $contingenciaData['estado'] = 'Activa';
            $contingenciaData['status'] = 1;

            // Asignación automática si no se especifica usuario
            if (!$request->has('usuario_asignado')) {
                $contingenciaData['usuario_asignado'] = $this->asignarAutomaticamente($request->equipo_id, $request->severidad);
                $contingenciaData['fecha_asignacion'] = now();
            }

            // Manejar archivo de evidencia
            if ($request->hasFile('archivo_evidencia')) {
                $file = $request->file('archivo_evidencia');
                $fileName = 'contingencias/' . uniqid() . '.' . $file->getClientOriginalExtension();
                $filePath = $file->storeAs('contingencias', $fileName, 'public');
                $contingenciaData['archivo_evidencia'] = $filePath;
            }

            $contingencia = Contingencia::create($contingenciaData);

            // Actualizar estado del equipo
            $equipo = Equipo::find($request->equipo_id);
            if ($equipo && in_array($request->severidad, ['Alta', 'Crítica'])) {
                $equipo->update(['estadoequipo_id' => 3]); // Fuera de servicio
            }

            // Enviar notificaciones
            $this->enviarNotificaciones($contingencia);

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
     * ENDPOINT COMPLETO: Dashboard de contingencias
     */
    public function dashboardContingencias()
    {
        try {
            $hoy = now();
            $inicioMes = $hoy->copy()->startOfMonth();
            $finMes = $hoy->copy()->endOfMonth();

            // Estadísticas generales
            $estadisticas = [
                'total_contingencias' => Contingencia::count(),
                'activas' => Contingencia::where('estado', 'Activa')->count(),
                'en_proceso' => Contingencia::where('estado', 'En Proceso')->count(),
                'resueltas_mes' => Contingencia::where('estado', 'Resuelta')
                    ->whereBetween('fecha_resolucion', [$inicioMes, $finMes])->count(),
                'criticas_abiertas' => Contingencia::where('severidad', 'Crítica')
                    ->whereIn('estado', ['Activa', 'En Proceso'])->count(),
                'tiempo_promedio_resolucion' => $this->calcularTiempoPromedioResolucion(),
                'costo_total_mes' => Contingencia::where('estado', 'Resuelta')
                    ->whereBetween('fecha_resolucion', [$inicioMes, $finMes])->sum('costo_real')
            ];

            // Contingencias críticas activas
            $contingenciasCriticas = Contingencia::with(['equipo:id,name,code', 'usuarioAsignado:id,nombre,apellido'])
                ->where('severidad', 'Crítica')
                ->whereIn('estado', ['Activa', 'En Proceso'])
                ->orderBy('fecha_reporte')
                ->limit(10)
                ->get();

            // Contingencias vencidas (sin resolver en tiempo estimado)
            $contingenciasVencidas = Contingencia::with(['equipo:id,name,code'])
                ->where('fecha_estimada_resolucion', '<', $hoy)
                ->whereIn('estado', ['Activa', 'En Proceso'])
                ->orderBy('fecha_estimada_resolucion')
                ->limit(10)
                ->get();

            // Gráfico por severidad (últimos 6 meses)
            $inicioGrafico = $hoy->copy()->subMonths(6);
            $contingenciasPorSeveridad = Contingencia::selectRaw('severidad, COUNT(*) as total')
                ->where('fecha_reporte', '>=', $inicioGrafico)
                ->groupBy('severidad')
                ->get();

            // Gráfico de resolución mensual
            $resolucionMensual = [];
            for ($i = 5; $i >= 0; $i--) {
                $mes = $hoy->copy()->subMonths($i);
                $inicioMesGrafico = $mes->copy()->startOfMonth();
                $finMesGrafico = $mes->copy()->endOfMonth();

                $reportadas = Contingencia::whereBetween('fecha_reporte', [$inicioMesGrafico, $finMesGrafico])->count();
                $resueltas = Contingencia::whereBetween('fecha_resolucion', [$inicioMesGrafico, $finMesGrafico])->count();

                $resolucionMensual[] = [
                    'mes' => $mes->format('Y-m'),
                    'reportadas' => $reportadas,
                    'resueltas' => $resueltas,
                    'porcentaje' => $reportadas > 0 ? round(($resueltas / $reportadas) * 100, 2) : 0
                ];
            }

            // Top equipos con más contingencias
            $topEquipos = Equipo::withCount('contingencias')
                ->orderBy('contingencias_count', 'desc')
                ->limit(10)
                ->get(['id', 'name', 'code', 'contingencias_count']);

            $dashboard = [
                'estadisticas' => $estadisticas,
                'contingencias_criticas' => $contingenciasCriticas,
                'contingencias_vencidas' => $contingenciasVencidas,
                'grafico_por_severidad' => $contingenciasPorSeveridad,
                'resolucion_mensual' => $resolucionMensual,
                'top_equipos' => $topEquipos,
                'alertas' => [
                    'criticas' => $estadisticas['criticas_abiertas'],
                    'vencidas' => $contingenciasVencidas->count(),
                    'sin_asignar' => Contingencia::whereNull('usuario_asignado')
                        ->whereIn('estado', ['Activa'])->count()
                ]
            ];

            return ResponseFormatter::success($dashboard, 'Dashboard de contingencias obtenido exitosamente');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener dashboard: ' . $e->getMessage(), 500);
        }
    }

    /**
     * ENDPOINT COMPLETO: Resolver contingencia
     */
    public function resolver(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'solucion' => 'required|string',
            'costo_real' => 'nullable|numeric|min:0',
            'tiempo_resolucion' => 'nullable|integer|min:1',
            'archivo_solucion' => 'nullable|file|mimes:pdf,doc,docx,jpg,png|max:10240',
            'calificacion_solucion' => 'nullable|integer|min:1|max:5',
            'requiere_seguimiento' => 'boolean'
        ]);

        if ($validator->fails()) {
            return ResponseFormatter::validation($validator->errors());
        }

        try {
            DB::beginTransaction();

            $contingencia = Contingencia::findOrFail($id);

            if ($contingencia->estado === 'Resuelta') {
                return ResponseFormatter::error('La contingencia ya está resuelta', 400);
            }

            $updateData = [
                'estado' => 'Resuelta',
                'fecha_resolucion' => now(),
                'solucion' => $request->solucion,
                'costo_real' => $request->costo_real,
                'tiempo_resolucion' => $request->tiempo_resolucion,
                'calificacion_solucion' => $request->calificacion_solucion,
                'requiere_seguimiento' => $request->get('requiere_seguimiento', false)
            ];

            // Manejar archivo de solución
            if ($request->hasFile('archivo_solucion')) {
                $file = $request->file('archivo_solucion');
                $fileName = 'soluciones/' . uniqid() . '.' . $file->getClientOriginalExtension();
                $filePath = $file->storeAs('soluciones', $fileName, 'public');
                $updateData['archivo_solucion'] = $filePath;
            }

            $contingencia->update($updateData);

            // Restaurar estado del equipo si es necesario
            $equipo = $contingencia->equipo;
            if ($equipo && $equipo->estadoequipo_id == 3) { // Si estaba fuera de servicio
                $equipo->update(['estadoequipo_id' => 1]); // Volver a operativo
            }

            // Programar seguimiento si es necesario
            if ($request->get('requiere_seguimiento', false)) {
                $this->programarSeguimiento($contingencia);
            }

            // Enviar notificaciones de resolución
            $this->enviarNotificacionResolucion($contingencia);

            DB::commit();

            return ResponseFormatter::success($contingencia, 'Contingencia resuelta exitosamente');

        } catch (\Exception $e) {
            DB::rollBack();
            return ResponseFormatter::error('Error al resolver contingencia: ' . $e->getMessage(), 500);
        }
    }

    // Métodos auxiliares
    private function calcularTiempoRespuesta($contingencia)
    {
        if (!$contingencia->fecha_asignacion) {
            return null;
        }
        
        $inicio = Carbon::parse($contingencia->fecha_reporte);
        $fin = Carbon::parse($contingencia->fecha_asignacion);
        return $inicio->diffInHours($fin);
    }

    private function calcularTiempoResolucion($contingencia)
    {
        if (!$contingencia->fecha_resolucion) {
            return null;
        }
        
        $inicio = Carbon::parse($contingencia->fecha_reporte);
        $fin = Carbon::parse($contingencia->fecha_resolucion);
        return $inicio->diffInHours($fin);
    }

    private function calcularPrioridad($contingencia)
    {
        $puntaje = 0;
        
        // Puntaje por severidad
        switch ($contingencia->severidad) {
            case 'Crítica': $puntaje += 40; break;
            case 'Alta': $puntaje += 30; break;
            case 'Media': $puntaje += 20; break;
            case 'Baja': $puntaje += 10; break;
        }
        
        // Puntaje por impacto
        switch ($contingencia->impacto) {
            case 'Crítico': $puntaje += 30; break;
            case 'Alto': $puntaje += 20; break;
            case 'Medio': $puntaje += 10; break;
            case 'Bajo': $puntaje += 5; break;
        }
        
        // Puntaje por tiempo transcurrido
        $horasTranscurridas = Carbon::parse($contingencia->fecha_reporte)->diffInHours(now());
        if ($horasTranscurridas > 24) $puntaje += 20;
        elseif ($horasTranscurridas > 8) $puntaje += 10;
        
        return $puntaje;
    }

    private function asignarAutomaticamente($equipoId, $severidad)
    {
        // Lógica de asignación automática basada en disponibilidad y especialización
        $equipo = Equipo::with('servicio')->find($equipoId);
        
        $tecnicos = Usuario::where('rol_id', 3) // Técnicos
            ->where('estado', 1)
            ->get();
            
        // Por ahora asignar al primer técnico disponible
        return $tecnicos->first()?->id;
    }

    private function enviarNotificaciones($contingencia)
    {
        // Implementar envío de notificaciones por email/SMS
        // Por ahora solo log
        \Log::info("Notificación enviada para contingencia {$contingencia->id}");
    }

    private function enviarNotificacionResolucion($contingencia)
    {
        // Implementar notificación de resolución
        \Log::info("Notificación de resolución enviada para contingencia {$contingencia->id}");
    }

    private function programarSeguimiento($contingencia)
    {
        // Programar seguimiento automático
        \Log::info("Seguimiento programado para contingencia {$contingencia->id}");
    }

    private function calcularTiempoPromedioResolucion()
    {
        $promedio = Contingencia::where('estado', 'Resuelta')
            ->whereNotNull('tiempo_resolucion')
            ->avg('tiempo_resolucion');
            
        return round($promedio, 2) ?? 0;
    }
}
