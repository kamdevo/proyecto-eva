<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\ConexionesVista\ApiController;
use App\ConexionesVista\ResponseFormatter;
use App\Models\Equipo;
use App\Models\Mantenimiento;
use App\Models\Calibracion;
use App\Models\Contingencia;
use App\Models\Ticket;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

/**
 * Controlador para sistema de filtros avanzados
 * Maneja filtros complejos para todas las entidades del sistema EVA
 */
class FiltrosController extends ApiController
{
    /**
     * Filtros avanzados para equipos
     * Permite filtrar por múltiples criterios simultáneamente
     */
    public function filtrosEquipos(Request $request)
    {
        try {
            $query = Equipo::with(['servicio', 'area']);

            // Filtros básicos
            if ($request->filled('nombre')) {
                $query->where('name', 'like', '%' . $request->nombre . '%');
            }

            if ($request->filled('codigo')) {
                $query->where('code', 'like', '%' . $request->codigo . '%');
            }

            if ($request->filled('marca')) {
                $query->where('marca', 'like', '%' . $request->marca . '%');
            }

            if ($request->filled('modelo')) {
                $query->where('modelo', 'like', '%' . $request->modelo . '%');
            }

            if ($request->filled('serial')) {
                $query->where('serial', 'like', '%' . $request->serial . '%');
            }

            // Filtros por relaciones
            if ($request->filled('servicio_id')) {
                $query->where('servicio_id', $request->servicio_id);
            }

            if ($request->filled('area_id')) {
                $query->where('area_id', $request->area_id);
            }

            if ($request->filled('servicios')) {
                $query->whereIn('servicio_id', $request->servicios);
            }

            if ($request->filled('areas')) {
                $query->whereIn('area_id', $request->areas);
            }

            // Filtros por clasificación
            if ($request->filled('riesgo')) {
                $query->where('riesgo', $request->riesgo);
            }

            if ($request->filled('riesgos')) {
                $query->whereIn('riesgo', $request->riesgos);
            }

            if ($request->filled('tecnologia')) {
                $query->where('tecnologia', $request->tecnologia);
            }

            // Filtros por estado
            if ($request->filled('status')) {
                $query->where('status', $request->status === 'activo');
            }

            // Filtros por fechas
            if ($request->filled('fecha_desde')) {
                $query->where('created_at', '>=', $request->fecha_desde);
            }

            if ($request->filled('fecha_hasta')) {
                $query->where('created_at', '<=', $request->fecha_hasta);
            }

            // Filtros por mantenimiento
            if ($request->filled('mantenimiento_vencido')) {
                $query->where('proximo_mantenimiento', '<', now());
            }

            if ($request->filled('sin_mantenimiento')) {
                $query->whereNull('ultimo_mantenimiento');
            }

            if ($request->filled('dias_sin_mantenimiento')) {
                $dias = $request->dias_sin_mantenimiento;
                $query->where(function($q) use ($dias) {
                    $q->whereNull('ultimo_mantenimiento')
                      ->orWhere('ultimo_mantenimiento', '<', now()->subDays($dias));
                });
            }

            // Filtros por calibración
            if ($request->filled('calibracion_vencida')) {
                $query->where('proxima_calibracion', '<', now());
            }

            if ($request->filled('sin_calibracion')) {
                $query->whereNull('ultima_calibracion');
            }

            // Filtros por rango de valores
            if ($request->filled('costo_min')) {
                $query->where('costo', '>=', $request->costo_min);
            }

            if ($request->filled('costo_max')) {
                $query->where('costo', '<=', $request->costo_max);
            }

            // Ordenamiento
            $orderBy = $request->get('order_by', 'name');
            $orderDirection = $request->get('order_direction', 'asc');
            $query->orderBy($orderBy, $orderDirection);

            // Paginación
            $perPage = $request->get('per_page', 15);
            $equipos = $query->paginate($perPage);

            return ResponseFormatter::success($equipos, 'Filtros aplicados exitosamente');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al aplicar filtros: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Filtros avanzados para mantenimientos
     */
    public function filtrosMantenimientos(Request $request)
    {
        try {
            $query = Mantenimiento::with(['equipo', 'tecnico']);

            // Filtros por equipo
            if ($request->filled('equipo_id')) {
                $query->where('equipo_id', $request->equipo_id);
            }

            if ($request->filled('equipos')) {
                $query->whereIn('equipo_id', $request->equipos);
            }

            // Filtros por técnico
            if ($request->filled('tecnico_id')) {
                $query->where('tecnico_id', $request->tecnico_id);
            }

            if ($request->filled('tecnicos')) {
                $query->whereIn('tecnico_id', $request->tecnicos);
            }

            // Filtros por estado
            if ($request->filled('status')) {
                $query->where('status', $request->status);
            }

            if ($request->filled('estados')) {
                $query->whereIn('status', $request->estados);
            }

            // Filtros por tipo
            if ($request->filled('tipo')) {
                $query->where('tipo', $request->tipo);
            }

            // Filtros por prioridad
            if ($request->filled('prioridad')) {
                $query->where('prioridad', $request->prioridad);
            }

            if ($request->filled('prioridades')) {
                $query->whereIn('prioridad', $request->prioridades);
            }

            // Filtros por fechas
            if ($request->filled('fecha_desde')) {
                $query->where('fecha_programada', '>=', $request->fecha_desde);
            }

            if ($request->filled('fecha_hasta')) {
                $query->where('fecha_programada', '<=', $request->fecha_hasta);
            }

            // Filtros especiales
            if ($request->filled('vencidos')) {
                $query->where('status', 'programado')
                      ->where('fecha_programada', '<', now());
            }

            if ($request->filled('proximos_dias')) {
                $dias = $request->proximos_dias;
                $query->where('status', 'programado')
                      ->whereBetween('fecha_programada', [now(), now()->addDays($dias)]);
            }

            // Filtros por costo
            if ($request->filled('costo_min')) {
                $query->where('costo', '>=', $request->costo_min);
            }

            if ($request->filled('costo_max')) {
                $query->where('costo', '<=', $request->costo_max);
            }

            // Filtros por tiempo
            if ($request->filled('tiempo_min')) {
                $query->where('tiempo_real', '>=', $request->tiempo_min);
            }

            if ($request->filled('tiempo_max')) {
                $query->where('tiempo_real', '<=', $request->tiempo_max);
            }

            // Ordenamiento
            $orderBy = $request->get('order_by', 'fecha_programada');
            $orderDirection = $request->get('order_direction', 'desc');
            $query->orderBy($orderBy, $orderDirection);

            // Paginación
            $perPage = $request->get('per_page', 15);
            $mantenimientos = $query->paginate($perPage);

            return ResponseFormatter::success($mantenimientos, 'Filtros aplicados exitosamente');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al aplicar filtros: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Obtener opciones para filtros dinámicos
     */
    public function opcionesFiltros()
    {
        try {
            $opciones = [
                'servicios' => DB::table('servicios')
                    ->where('status', true)
                    ->select('id', 'name')
                    ->orderBy('name')
                    ->get(),
                
                'areas' => DB::table('areas')
                    ->where('status', true)
                    ->select('id', 'name')
                    ->orderBy('name')
                    ->get(),
                
                'riesgos' => ['BAJO', 'MEDIO', 'MEDIO ALTO', 'ALTO', 'CRÍTICO'],
                
                'tecnologias' => DB::table('equipos')
                    ->whereNotNull('tecnologia')
                    ->distinct()
                    ->pluck('tecnologia')
                    ->sort()
                    ->values(),
                
                'marcas' => DB::table('equipos')
                    ->whereNotNull('marca')
                    ->distinct()
                    ->pluck('marca')
                    ->sort()
                    ->values(),
                
                'estados_mantenimiento' => ['programado', 'en_proceso', 'completado', 'cancelado'],
                
                'prioridades' => ['baja', 'media', 'alta', 'urgente'],
                
                'tipos_mantenimiento' => ['preventivo', 'correctivo', 'predictivo'],
                
                'tecnicos' => DB::table('usuarios')
                    ->where('activo', true)
                    ->where('rol', 'tecnico')
                    ->select('id', 'nombre', 'apellido')
                    ->orderBy('nombre')
                    ->get()
            ];

            return ResponseFormatter::success($opciones, 'Opciones de filtros obtenidas');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener opciones: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Búsqueda global en múltiples entidades
     */
    public function busquedaGlobal(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'query' => 'required|string|min:3'
        ]);

        if ($validator->fails()) {
            return ResponseFormatter::validation($validator->errors());
        }

        try {
            $query = $request->query;
            $resultados = [];

            // Buscar en equipos
            $equipos = Equipo::where('name', 'like', "%{$query}%")
                ->orWhere('code', 'like', "%{$query}%")
                ->orWhere('marca', 'like', "%{$query}%")
                ->orWhere('modelo', 'like', "%{$query}%")
                ->limit(10)
                ->get(['id', 'name', 'code', 'marca', 'modelo']);

            $resultados['equipos'] = $equipos;

            // Buscar en mantenimientos
            $mantenimientos = Mantenimiento::where('description', 'like', "%{$query}%")
                ->orWhere('observaciones', 'like', "%{$query}%")
                ->with('equipo:id,name,code')
                ->limit(10)
                ->get(['id', 'description', 'equipo_id', 'fecha_programada', 'status']);

            $resultados['mantenimientos'] = $mantenimientos;

            // Buscar en tickets
            $tickets = Ticket::where('titulo', 'like', "%{$query}%")
                ->orWhere('descripcion', 'like', "%{$query}%")
                ->orWhere('numero_ticket', 'like', "%{$query}%")
                ->limit(10)
                ->get(['id', 'numero_ticket', 'titulo', 'estado', 'prioridad']);

            $resultados['tickets'] = $tickets;

            return ResponseFormatter::success($resultados, 'Búsqueda global completada');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error en búsqueda global: ' . $e->getMessage(), 500);
        }
    }
}
