<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\ConexionesVista\ApiController;
use App\ConexionesVista\ResponseFormatter;
use App\Models\Calibracion;
use App\Models\Equipo;
use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

/**
 * Controlador para gestión completa de calibraciones
 * Maneja calibraciones internas, externas y verificaciones
 */
class CalibracionController extends ApiController
{
    /**
     * Obtener lista de calibraciones con filtros
     */
        /**
     * @OA\GET(
     *     path="/api/calibraciones",
     *     tags={"Calibraciones"},
     *     summary="Listar calibraciones",
     *     security={{"sanctum": {}}},
     *     @OA\Response(response=200, description="Operación exitosa"),
     *     @OA\Response(response=401, description="No autorizado"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     */
        /**
     * @OA\GET(
     *     path="/api/calibraciones",
     *     tags={"Calibraciones"},
     *     summary="Listar calibraciones",
     *     security={{"sanctum": {}}},
     *     @OA\Response(response=200, description="Operación exitosa"),
     *     @OA\Response(response=401, description="No autorizado"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     */
    public function index(Request $request)
    {
        try {
            $query = Calibracion::with([
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

            if ($request->has('tipo')) {
                $query->where('tipo', $request->tipo);
            }

            if ($request->has('fecha_desde')) {
                $query->where('fecha', '>=', $request->fecha_desde);
            }

            if ($request->has('fecha_hasta')) {
                $query->where('fecha', '<=', $request->fecha_hasta);
            }

            // Filtro por calibraciones vencidas
            if ($request->has('vencidas') && $request->vencidas) {
                $query->where('fecha_vencimiento', '<', now());
            }

            // Ordenamiento
            $orderBy = $request->get('order_by', 'fecha');
            $orderDirection = $request->get('order_direction', 'desc');
            $query->orderBy($orderBy, $orderDirection);

            // Paginación
            $perPage = $request->get('per_page', 15);
            $calibraciones = $query->paginate($perPage);

            return ResponseFormatter::success($calibraciones, 'Lista de calibraciones obtenida');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener calibraciones: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Crear nueva calibración
     */
        /**
     * @OA\POST(
     *     path="/api/calibraciones",
     *     tags={"Calibraciones"},
     *     summary="Crear nueva calibración",
     *     security={{"sanctum": {}}},
     *     @OA\Response(response=200, description="Operación exitosa"),
     *     @OA\Response(response=401, description="No autorizado"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     */
        /**
     * @OA\POST(
     *     path="/api/calibraciones",
     *     tags={"Calibraciones"},
     *     summary="Crear nueva calibración",
     *     security={{"sanctum": {}}},
     *     @OA\Response(response=200, description="Operación exitosa"),
     *     @OA\Response(response=401, description="No autorizado"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'equipo_id' => 'required|exists:equipos,id',
            'descripcion' => 'required|string|max:500',
            'fecha' => 'required|date',
            'fecha_vencimiento' => 'required|date|after:fecha',
            'tecnico_id' => 'nullable|exists:usuarios,id',
            'tipo' => 'required|in:interna,externa,verificacion,ajuste',
            'estado' => 'nullable|in:programada,en_proceso,completada,vencida,no_aplica',
            'patron_referencia' => 'nullable|string|max:255',
            'metodo' => 'nullable|string|max:255',
            'incertidumbre' => 'nullable|string|max:100',
            'resultado' => 'nullable|in:conforme,no_conforme,condicional',
            'observaciones' => 'nullable|string',
            'costo' => 'nullable|numeric|min:0',
            'certificado' => 'nullable|file|mimes:pdf|max:10240'
        ]);

        if ($validator->fails()) {
            return ResponseFormatter::validation($validator->errors());
        }

        try {
            DB::beginTransaction();

            $calibracionData = $request->except(['certificado']);
            $calibracionData['estado'] = $calibracionData['estado'] ?? 'programada';
            $calibracionData['created_at'] = now();

            // Manejar archivo de certificado
            if ($request->hasFile('certificado')) {
                $file = $request->file('certificado');
                $fileName = 'certificados_calibracion/' . uniqid() . '.' . $file->getClientOriginalExtension();
                $filePath = $file->storeAs('certificados_calibracion', $fileName, 'public');
                $calibracionData['certificado'] = $filePath;
            }

            $calibracion = Calibracion::create($calibracionData);

            // Actualizar estado de calibración en el equipo
            $equipo = Equipo::find($request->equipo_id);
            if ($equipo) {
                $equipo->update([
                    'fecha_ultima_calibracion' => $request->fecha,
                    'fecha_vencimiento_calibracion' => $request->fecha_vencimiento
                ]);
            }

            // Cargar relaciones para la respuesta
            $calibracion->load([
                'equipo:id,name,code',
                'tecnico:id,nombre,apellido'
            ]);

            DB::commit();

            return ResponseFormatter::success($calibracion, 'Calibración creada exitosamente', 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return ResponseFormatter::error('Error al crear calibración: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Mostrar calibración específica
     */
        /**
     * @OA\GET(
     *     path="/api/calibraciones/{id}",
     *     tags={"Calibraciones"},
     *     summary="Obtener calibración específica",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(response=200, description="Operación exitosa"),
     *     @OA\Response(response=401, description="No autorizado"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     */
        /**
     * @OA\GET(
     *     path="/api/calibraciones/{id}",
     *     tags={"Calibraciones"},
     *     summary="Obtener calibración específica",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(response=200, description="Operación exitosa"),
     *     @OA\Response(response=401, description="No autorizado"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     */
    public function show($id)
    {
        try {
            $calibracion = Calibracion::with([
                'equipo:id,name,code,servicio_id,area_id,marca,modelo,serial',
                'equipo.servicio:id,name',
                'equipo.area:id,name',
                'tecnico:id,nombre,apellido,telefono,email'
            ])->findOrFail($id);

            // Agregar URL del certificado si existe
            if ($calibracion->certificado) {
                $calibracion->certificado_url = Storage::disk('public')->url($calibracion->certificado);
            }

            return ResponseFormatter::success($calibracion, 'Calibración obtenida exitosamente');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener calibración: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Actualizar calibración
     */
        /**
     * @OA\PUT(
     *     path="/api/calibraciones/{id}",
     *     tags={"Calibraciones"},
     *     summary="Actualizar calibración",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(response=200, description="Operación exitosa"),
     *     @OA\Response(response=401, description="No autorizado"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     */
        /**
     * @OA\PUT(
     *     path="/api/calibraciones/{id}",
     *     tags={"Calibraciones"},
     *     summary="Actualizar calibración",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(response=200, description="Operación exitosa"),
     *     @OA\Response(response=401, description="No autorizado"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'equipo_id' => 'required|exists:equipos,id',
            'descripcion' => 'required|string|max:500',
            'fecha' => 'required|date',
            'fecha_vencimiento' => 'required|date|after:fecha',
            'tecnico_id' => 'nullable|exists:usuarios,id',
            'tipo' => 'required|in:interna,externa,verificacion,ajuste',
            'estado' => 'nullable|in:programada,en_proceso,completada,vencida,no_aplica',
            'patron_referencia' => 'nullable|string|max:255',
            'metodo' => 'nullable|string|max:255',
            'incertidumbre' => 'nullable|string|max:100',
            'resultado' => 'nullable|in:conforme,no_conforme,condicional',
            'observaciones' => 'nullable|string',
            'costo' => 'nullable|numeric|min:0',
            'certificado' => 'nullable|file|mimes:pdf|max:10240'
        ]);

        if ($validator->fails()) {
            return ResponseFormatter::validation($validator->errors());
        }

        try {
            DB::beginTransaction();

            $calibracion = Calibracion::findOrFail($id);
            $calibracionData = $request->except(['certificado']);

            // Manejar actualización de certificado
            if ($request->hasFile('certificado')) {
                // Eliminar certificado anterior si existe
                if ($calibracion->certificado && Storage::disk('public')->exists($calibracion->certificado)) {
                    Storage::disk('public')->delete($calibracion->certificado);
                }

                $file = $request->file('certificado');
                $fileName = 'certificados_calibracion/' . uniqid() . '.' . $file->getClientOriginalExtension();
                $filePath = $file->storeAs('certificados_calibracion', $fileName, 'public');
                $calibracionData['certificado'] = $filePath;
            }

            $calibracion->update($calibracionData);

            // Cargar relaciones para la respuesta
            $calibracion->load([
                'equipo:id,name,code',
                'tecnico:id,nombre,apellido'
            ]);

            if ($calibracion->certificado) {
                $calibracion->certificado_url = Storage::disk('public')->url($calibracion->certificado);
            }

            DB::commit();

            return ResponseFormatter::success($calibracion, 'Calibración actualizada exitosamente');

        } catch (\Exception $e) {
            DB::rollBack();
            return ResponseFormatter::error('Error al actualizar calibración: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Eliminar calibración
     */
        /**
     * @OA\DELETE(
     *     path="/api/calibraciones/{id}",
     *     tags={"Calibraciones"},
     *     summary="Eliminar calibración",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(response=200, description="Operación exitosa"),
     *     @OA\Response(response=401, description="No autorizado"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     */
        /**
     * @OA\DELETE(
     *     path="/api/calibraciones/{id}",
     *     tags={"Calibraciones"},
     *     summary="Eliminar calibración",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(response=200, description="Operación exitosa"),
     *     @OA\Response(response=401, description="No autorizado"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     */
    public function destroy($id)
    {
        try {
            $calibracion = Calibracion::findOrFail($id);

            // Solo permitir eliminar si no está completada
            if ($calibracion->estado === 'completada') {
                return ResponseFormatter::error(
                    'No se puede eliminar una calibración completada',
                    400
                );
            }

            // Eliminar certificado si existe
            if ($calibracion->certificado && Storage::disk('public')->exists($calibracion->certificado)) {
                Storage::disk('public')->delete($calibracion->certificado);
            }

            $calibracion->delete();

            return ResponseFormatter::success(null, 'Calibración eliminada exitosamente');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al eliminar calibración: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Completar calibración
     */
    public function completar(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'resultado' => 'required|in:conforme,no_conforme,condicional',
            'incertidumbre' => 'nullable|string|max:100',
            'observaciones' => 'nullable|string',
            'costo' => 'nullable|numeric|min:0',
            'certificado' => 'nullable|file|mimes:pdf|max:10240'
        ]);

        if ($validator->fails()) {
            return ResponseFormatter::validation($validator->errors());
        }

        try {
            DB::beginTransaction();

            $calibracion = Calibracion::findOrFail($id);

            if ($calibracion->estado === 'completada') {
                return ResponseFormatter::error('La calibración ya está completada', 400);
            }

            $updateData = [
                'estado' => 'completada',
                'fecha_completada' => now(),
                'resultado' => $request->resultado,
                'incertidumbre' => $request->incertidumbre,
                'observaciones' => $request->observaciones,
                'costo' => $request->costo
            ];

            // Manejar certificado
            if ($request->hasFile('certificado')) {
                $file = $request->file('certificado');
                $fileName = 'certificados_calibracion/' . uniqid() . '.' . $file->getClientOriginalExtension();
                $filePath = $file->storeAs('certificados_calibracion', $fileName, 'public');
                $updateData['certificado'] = $filePath;
            }

            $calibracion->update($updateData);

            // Actualizar estado en equipo
            $equipo = $calibracion->equipo;
            $equipo->update([
                'fecha_ultima_calibracion' => now(),
                'estado_calibracion' => $request->resultado
            ]);

            DB::commit();

            return ResponseFormatter::success($calibracion, 'Calibración completada exitosamente');

        } catch (\Exception $e) {
            DB::rollBack();
            return ResponseFormatter::error('Error al completar calibración: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Obtener calibraciones por equipo
     */
    public function porEquipo($equipoId)
    {
        try {
            $calibraciones = Calibracion::with([
                'tecnico:id,nombre,apellido'
            ])
            ->where('equipo_id', $equipoId)
            ->orderBy('fecha', 'desc')
            ->get();

            return ResponseFormatter::success($calibraciones, 'Calibraciones del equipo obtenidas');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener calibraciones: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Obtener calibraciones vencidas
     */
    public function vencidas()
    {
        try {
            $calibraciones = Calibracion::with([
                'equipo:id,name,code,servicio_id,area_id',
                'equipo.servicio:id,name',
                'equipo.area:id,name',
                'tecnico:id,nombre,apellido'
            ])
            ->where('fecha_vencimiento', '<', now())
            ->where('estado', '!=', 'completada')
            ->orderBy('fecha_vencimiento', 'asc')
            ->get();

            // Calcular días de vencimiento
            $calibraciones->each(function ($calibracion) {
                $calibracion->dias_vencida = Carbon::parse($calibracion->fecha_vencimiento)->diffInDays(now());
            });

            return ResponseFormatter::success($calibraciones, 'Calibraciones vencidas obtenidas');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener calibraciones vencidas: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Obtener calibraciones programadas
     */
    public function programadas()
    {
        try {
            $calibraciones = Calibracion::with([
                'equipo:id,name,code,servicio_id,area_id',
                'equipo.servicio:id,name',
                'equipo.area:id,name',
                'tecnico:id,nombre,apellido'
            ])
            ->where('estado', 'programada')
            ->where('fecha', '>=', now())
            ->orderBy('fecha', 'asc')
            ->get();

            // Calcular días hasta la calibración
            $calibraciones->each(function ($calibracion) {
                $calibracion->dias_hasta = Carbon::parse($calibracion->fecha)->diffInDays(now());
            });

            return ResponseFormatter::success($calibraciones, 'Calibraciones programadas obtenidas');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener calibraciones programadas: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Obtener estadísticas de calibraciones
     */
    public function estadisticas(Request $request)
    {
        try {
            $year = $request->get('year', date('Y'));

            $stats = [
                'total_programadas' => Calibracion::whereYear('fecha', $year)->count(),
                'total_completadas' => Calibracion::where('estado', 'completada')
                    ->whereYear('fecha', $year)->count(),
                'total_vencidas' => Calibracion::where('fecha_vencimiento', '<', now())
                    ->where('estado', '!=', 'completada')->count(),
                'por_tipo' => Calibracion::whereYear('fecha', $year)
                    ->groupBy('tipo')
                    ->selectRaw('tipo, count(*) as total')
                    ->get(),
                'por_resultado' => Calibracion::where('estado', 'completada')
                    ->whereYear('fecha', $year)
                    ->groupBy('resultado')
                    ->selectRaw('resultado, count(*) as total')
                    ->get(),
                'por_mes' => Calibracion::whereYear('fecha', $year)
                    ->groupBy(DB::raw('MONTH(fecha)'))
                    ->selectRaw('MONTH(fecha) as mes, count(*) as total')
                    ->orderBy('mes')
                    ->get(),
                'cumplimiento' => 0,
                'costo_total' => Calibracion::where('estado', 'completada')
                    ->whereYear('fecha', $year)->sum('costo')
            ];

            // Calcular porcentaje de cumplimiento
            if ($stats['total_programadas'] > 0) {
                $stats['cumplimiento'] = round(
                    ($stats['total_completadas'] / $stats['total_programadas']) * 100,
                    2
                );
            }

            return ResponseFormatter::success($stats, 'Estadísticas de calibraciones obtenidas');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener estadísticas: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Obtener equipos que requieren calibración
     */
    public function equiposRequierenCalibracion()
    {
        try {
            $equipos = Equipo::with([
                'servicio:id,name',
                'area:id,name',
                'calibraciones' => function($query) {
                    $query->orderBy('fecha', 'desc')->limit(1);
                }
            ])
            ->where('calibracion', true)
            ->where('status', true)
            ->whereDoesntHave('calibraciones', function($query) {
                $query->where('fecha_vencimiento', '>', now())
                      ->where('estado', 'completada');
            })
            ->get();

            return ResponseFormatter::success($equipos, 'Equipos que requieren calibración obtenidos');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener equipos: ' . $e->getMessage(), 500);
        }
    }
}
