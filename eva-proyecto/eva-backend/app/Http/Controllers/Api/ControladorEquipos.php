<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\ConexionesVista\ApiController;
use App\ConexionesVista\ResponseFormatter;
use App\Models\Equipo;
use App\Models\Servicio;
use App\Models\Area;
use App\Models\Propietario;
use App\Models\FuenteAlimentacion;
use App\Models\Tecnologia;
use App\Models\FrecuenciaMantenimiento;
use App\Models\ClasificacionBiomedica;
use App\Models\ClasificacionRiesgo;
use App\Models\TipoAdquisicion;
use App\Models\EstadoEquipo;
use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

/**
 * Controlador para gestión completa de equipos
 * Maneja todas las operaciones CRUD y funcionalidades específicas de equipos
 */
class ControladorEquipos extends ApiController
{
    /**
     * Obtener lista paginada de equipos médicos e industriales
     *
     * Este método devuelve una lista completa de equipos con sus relaciones
     * incluyendo servicio, área, clasificación de riesgo y tecnología.
     * Soporta filtros por búsqueda, servicio, área, estado y rangos de fechas/costos.
     *
     * @param Request $request Solicitud HTTP con parámetros de filtro opcionales
     * @return JsonResponse Lista paginada de equipos con metadatos de paginación
     */
    public function index(Request $request)
    {
        try {
            $query = Equipo::with([
                'servicio:id,nombre',
                'area:id,nombre',
                'propietario:id,nombre',
                'fuenteAlimentacion:id,nombre',
                'tecnologia:id,nombre',
                'frecuenciaMantenimiento:id,nombre',
                'clasificacionBiomedica:id,nombre',
                'clasificacionRiesgo:id,nombre',
                'estadoEquipo:id,nombre'
            ]);

            // Aplicar filtros
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('code', 'like', "%{$search}%")
                      ->orWhere('marca', 'like', "%{$search}%")
                      ->orWhere('modelo', 'like', "%{$search}%")
                      ->orWhere('serial', 'like', "%{$search}%");
                });
            }

            if ($request->has('servicio_id')) {
                $query->where('servicio_id', $request->servicio_id);
            }

            if ($request->has('area_id')) {
                $query->where('area_id', $request->area_id);
            }

            if ($request->has('estado_id')) {
                $query->where('estadoequipo_id', $request->estado_id);
            }

            if ($request->has('riesgo_id')) {
                $query->where('criesgo_id', $request->riesgo_id);
            }

            if ($request->has('propietario_id')) {
                $query->where('propietario_id', $request->propietario_id);
            }

            // Filtros por fechas
            if ($request->has('fecha_desde')) {
                $query->where('created_at', '>=', $request->fecha_desde);
            }

            if ($request->has('fecha_hasta')) {
                $query->where('created_at', '<=', $request->fecha_hasta);
            }

            // Filtros por costo
            if ($request->has('costo_min')) {
                $query->where('costo', '>=', $request->costo_min);
            }

            if ($request->has('costo_max')) {
                $query->where('costo', '<=', $request->costo_max);
            }

            // Ordenamiento
            $orderBy = $request->get('order_by', 'created_at');
            $orderDirection = $request->get('order_direction', 'desc');
            $query->orderBy($orderBy, $orderDirection);

            // Paginación
            $perPage = $request->get('per_page', 15);
            $equipos = $query->paginate($perPage);

            // Agregar URL de imagen a cada equipo
            $equipos->getCollection()->transform(function ($equipo) {
                if ($equipo->image) {
                    $equipo->image_url = Storage::disk('public')->url($equipo->image);
                }
                return $equipo;
            });

            return ResponseFormatter::success($equipos, 'Lista de equipos obtenida exitosamente');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener equipos: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Crear un nuevo equipo médico o industrial en el sistema
     *
     * Este método valida los datos de entrada, crea un nuevo registro de equipo
     * en la base de datos y maneja la subida de imagen opcional.
     * Incluye validación de código único y relaciones con otras entidades.
     *
     * @param Request $request Datos del equipo a crear (nombre, código, servicio, etc.)
     * @return JsonResponse Equipo creado con sus relaciones cargadas
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'code' => 'required|string|unique:equipos,code|max:100',
            'servicio_id' => 'required|exists:servicios,id',
            'area_id' => 'required|exists:areas,id',
            'marca' => 'nullable|string|max:100',
            'modelo' => 'nullable|string|max:100',
            'serial' => 'nullable|string|max:100',
            'descripcion' => 'nullable|string',
            'costo' => 'nullable|numeric|min:0',
            'fecha_fabricacion' => 'nullable|date',
            'fecha_instalacion' => 'nullable|date',
            'vida_util' => 'nullable|integer|min:1',
            'propietario_id' => 'nullable|exists:propietarios,id',
            'fuente_id' => 'nullable|exists:fuenteal,id',
            'tecnologia_id' => 'nullable|exists:tecnologiap,id',
            'frecuencia_id' => 'nullable|exists:frecuenciam,id',
            'cbiomedica_id' => 'nullable|exists:cbiomedica,id',
            'criesgo_id' => 'nullable|exists:criesgo,id',
            'tadquisicion_id' => 'nullable|exists:tadquisicion,id',
            'estadoequipo_id' => 'nullable|exists:estadoequipos,id',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120'
        ]);

        if ($validator->fails()) {
            return ResponseFormatter::validation($validator->errors());
        }

        try {
            DB::beginTransaction();

            $equipoData = $request->except(['image']);
            $equipoData['status'] = true;
            $equipoData['created_at'] = now();

            // Manejar subida de imagen
            if ($request->hasFile('image')) {
                $image = $request->file('image');
                $imageName = 'equipos/' . uniqid() . '.' . $image->getClientOriginalExtension();
                $imagePath = $image->storeAs('equipos', $imageName, 'public');
                $equipoData['image'] = $imagePath;
            }

            $equipo = Equipo::create($equipoData);

            // Cargar relaciones para la respuesta
            $equipo->load([
                'servicio:id,nombre',
                'area:id,nombre',
                'propietario:id,nombre',
                'fuenteAlimentacion:id,nombre',
                'tecnologia:id,nombre',
                'frecuenciaMantenimiento:id,nombre',
                'clasificacionBiomedica:id,nombre',
                'clasificacionRiesgo:id,nombre',
                'estadoEquipo:id,nombre'
            ]);

            if ($equipo->image) {
                $equipo->image_url = Storage::disk('public')->url($equipo->image);
            }

            DB::commit();

            return ResponseFormatter::success($equipo, 'Equipo creado exitosamente', 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return ResponseFormatter::error('Error al crear equipo: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Obtener información detallada de un equipo específico
     *
     * Este método devuelve toda la información de un equipo incluyendo
     * sus relaciones, historial de mantenimientos, contingencias activas,
     * calibraciones recientes, observaciones y archivos asociados.
     *
     * @param int $id Identificador único del equipo
     * @return JsonResponse Información completa del equipo con todas sus relaciones
     */
    public function show($id)
    {
        try {
            $equipo = Equipo::with([
                'servicio:id,nombre',
                'area:id,nombre',
                'propietario:id,nombre',
                'fuenteAlimentacion:id,nombre',
                'tecnologia:id,nombre',
                'frecuenciaMantenimiento:id,nombre',
                'clasificacionBiomedica:id,nombre',
                'clasificacionRiesgo:id,nombre',
                'estadoEquipo:id,nombre',
                'mantenimientos' => function($query) {
                    $query->orderBy('fecha', 'desc')->limit(10);
                },
                'contingencias' => function($query) {
                    $query->where('estado', '!=', 'Cerrado')->orderBy('fecha', 'desc');
                },
                'calibraciones' => function($query) {
                    $query->orderBy('fecha', 'desc')->limit(5);
                },
                'observaciones' => function($query) {
                    $query->orderBy('created_at', 'desc')->limit(10);
                },
                'archivos'
            ])->findOrFail($id);

            if ($equipo->image) {
                $equipo->image_url = Storage::disk('public')->url($equipo->image);
            }

            return ResponseFormatter::success($equipo, 'Equipo obtenido exitosamente');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener equipo: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Actualizar equipo
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:100|unique:equipos,code,' . $id,
            'servicio_id' => 'required|exists:servicios,id',
            'area_id' => 'required|exists:areas,id',
            'marca' => 'nullable|string|max:100',
            'modelo' => 'nullable|string|max:100',
            'serial' => 'nullable|string|max:100',
            'descripcion' => 'nullable|string',
            'costo' => 'nullable|numeric|min:0',
            'fecha_fabricacion' => 'nullable|date',
            'fecha_instalacion' => 'nullable|date',
            'vida_util' => 'nullable|integer|min:1',
            'propietario_id' => 'nullable|exists:propietarios,id',
            'fuente_id' => 'nullable|exists:fuenteal,id',
            'tecnologia_id' => 'nullable|exists:tecnologiap,id',
            'frecuencia_id' => 'nullable|exists:frecuenciam,id',
            'cbiomedica_id' => 'nullable|exists:cbiomedica,id',
            'criesgo_id' => 'nullable|exists:criesgo,id',
            'tadquisicion_id' => 'nullable|exists:tadquisicion,id',
            'estadoequipo_id' => 'nullable|exists:estadoequipos,id',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120'
        ]);

        if ($validator->fails()) {
            return ResponseFormatter::validation($validator->errors());
        }

        try {
            DB::beginTransaction();

            $equipo = Equipo::findOrFail($id);
            $equipoData = $request->except(['image']);

            // Manejar actualización de imagen
            if ($request->hasFile('image')) {
                // Eliminar imagen anterior si existe
                if ($equipo->image && Storage::disk('public')->exists($equipo->image)) {
                    Storage::disk('public')->delete($equipo->image);
                }

                $image = $request->file('image');
                $imageName = 'equipos/' . uniqid() . '.' . $image->getClientOriginalExtension();
                $imagePath = $image->storeAs('equipos', $imageName, 'public');
                $equipoData['image'] = $imagePath;
            }

            $equipo->update($equipoData);

            // Cargar relaciones para la respuesta
            $equipo->load([
                'servicio:id,nombre',
                'area:id,nombre',
                'propietario:id,nombre',
                'fuenteAlimentacion:id,nombre',
                'tecnologia:id,nombre',
                'frecuenciaMantenimiento:id,nombre',
                'clasificacionBiomedica:id,nombre',
                'clasificacionRiesgo:id,nombre',
                'estadoEquipo:id,nombre'
            ]);

            if ($equipo->image) {
                $equipo->image_url = Storage::disk('public')->url($equipo->image);
            }

            DB::commit();

            return ResponseFormatter::success($equipo, 'Equipo actualizado exitosamente');

        } catch (\Exception $e) {
            DB::rollBack();
            return ResponseFormatter::error('Error al actualizar equipo: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Eliminar equipo (soft delete)
     */
    public function destroy($id)
    {
        try {
            $equipo = Equipo::findOrFail($id);

            // Verificar si el equipo tiene mantenimientos activos
            $mantenimientosActivos = $equipo->mantenimientos()
                ->whereIn('status', ['programado', 'en_proceso'])
                ->count();

            if ($mantenimientosActivos > 0) {
                return ResponseFormatter::error(
                    'No se puede eliminar el equipo porque tiene mantenimientos activos',
                    400
                );
            }

            // Marcar como inactivo en lugar de eliminar
            $equipo->update(['status' => false]);

            return ResponseFormatter::success(null, 'Equipo eliminado exitosamente');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al eliminar equipo: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Dar de baja un equipo
     */
    public function darDeBaja(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'motivo' => 'required|string|max:500',
            'fecha_baja' => 'nullable|date',
            'observaciones' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return ResponseFormatter::validation($validator->errors());
        }

        try {
            DB::beginTransaction();

            $equipo = Equipo::findOrFail($id);

            // Crear registro en tabla de bajas
            DB::table('equipos_bajas')->insert([
                'equipo_id' => $id,
                'motivo' => $request->motivo,
                'fecha_baja' => $request->fecha_baja ?: now(),
                'observaciones' => $request->observaciones,
                'usuario_id' => auth()->id(),
                'created_at' => now()
            ]);

            // Actualizar estado del equipo
            $equipo->update([
                'baja_id' => DB::getPdo()->lastInsertId(),
                'status' => false
            ]);

            // Cancelar mantenimientos programados
            $equipo->mantenimientos()
                ->where('status', 'programado')
                ->update(['status' => 'cancelado']);

            DB::commit();

            return ResponseFormatter::success($equipo, 'Equipo dado de baja exitosamente');

        } catch (\Exception $e) {
            DB::rollBack();
            return ResponseFormatter::error('Error al dar de baja equipo: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Duplicar equipo
     */
    public function duplicar($id)
    {
        try {
            $equipoOriginal = Equipo::findOrFail($id);

            $equipoDuplicado = $equipoOriginal->replicate();
            $equipoDuplicado->code = $equipoOriginal->code . '-COPY-' . time();
            $equipoDuplicado->name = $equipoOriginal->name . ' (Copia)';
            $equipoDuplicado->created_at = now();
            $equipoDuplicado->save();

            // Cargar relaciones
            $equipoDuplicado->load([
                'servicio:id,nombre',
                'area:id,nombre',
                'propietario:id,nombre'
            ]);

            return ResponseFormatter::success($equipoDuplicado, 'Equipo duplicado exitosamente');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al duplicar equipo: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Obtener equipos por servicio
     */
    public function porServicio($servicioId)
    {
        try {
            $equipos = Equipo::with(['area:id,nombre', 'estadoEquipo:id,nombre'])
                ->where('servicio_id', $servicioId)
                ->where('status', true)
                ->orderBy('name')
                ->get();

            return ResponseFormatter::success($equipos, 'Equipos del servicio obtenidos');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener equipos: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Obtener equipos por área
     */
    public function porArea($areaId)
    {
        try {
            $equipos = Equipo::with(['servicio:id,nombre', 'estadoEquipo:id,nombre'])
                ->where('area_id', $areaId)
                ->where('status', true)
                ->orderBy('name')
                ->get();

            return ResponseFormatter::success($equipos, 'Equipos del área obtenidos');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener equipos: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Obtener equipos críticos (alto riesgo con mantenimiento vencido)
     */
    public function equiposCriticos()
    {
        try {
            $equipos = Equipo::with([
                'servicio:id,nombre',
                'area:id,nombre',
                'clasificacionRiesgo:id,nombre',
                'contingencias' => function($query) {
                    $query->where('estado', '!=', 'Cerrado');
                }
            ])
            ->whereHas('clasificacionRiesgo', function($query) {
                $query->whereIn('name', ['ALTO', 'MEDIO ALTO']);
            })
            ->where(function($query) {
                $query->where('fecha_mantenimiento', '<', now()->subDays(30))
                      ->orWhereHas('contingencias', function($q) {
                          $q->where('estado', '!=', 'Cerrado')
                            ->where('severidad', 'Alta');
                      });
            })
            ->where('status', true)
            ->orderBy('created_at', 'desc')
            ->get();

            return ResponseFormatter::success($equipos, 'Equipos críticos obtenidos');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener equipos críticos: ' . $e->getMessage(), 500);
        }
    }

    /**
     * ENDPOINT COMPLETO: Gestión avanzada de equipos
     */
    public function gestionAvanzada(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'accion' => 'required|string|in:activar,desactivar,mantenimiento,baja,transferir',
                'equipos' => 'required|array|min:1',
                'equipos.*' => 'required|integer|exists:equipos,id',
                'motivo' => 'nullable|string|max:500',
                'area_destino' => 'nullable|integer|exists:areas,id',
                'fecha_programada' => 'nullable|date|after:today'
            ]);

            if ($validator->fails()) {
                return ResponseFormatter::validation($validator->errors());
            }

            $accion = $request->get('accion');
            $equiposIds = $request->get('equipos');
            $motivo = $request->get('motivo');
            $resultados = [];

            DB::beginTransaction();

            foreach ($equiposIds as $equipoId) {
                $equipo = Equipo::find($equipoId);

                if (!$equipo) {
                    $resultados[] = ['id' => $equipoId, 'status' => 'error', 'mensaje' => 'Equipo no encontrado'];
                    continue;
                }

                switch ($accion) {
                    case 'activar':
                        $equipo->update(['status' => true, 'estadoequipo_id' => 1]);
                        $this->registrarAccion($equipo, 'activacion', $motivo);
                        break;

                    case 'desactivar':
                        $equipo->update(['status' => false, 'estadoequipo_id' => 3]);
                        $this->registrarAccion($equipo, 'desactivacion', $motivo);
                        break;

                    case 'mantenimiento':
                        $equipo->update(['estadoequipo_id' => 2]);
                        $this->programarMantenimiento($equipo, $request->get('fecha_programada'));
                        $this->registrarAccion($equipo, 'mantenimiento_programado', $motivo);
                        break;

                    case 'baja':
                        $equipo->update(['status' => false, 'estadoequipo_id' => 4]);
                        $this->registrarAccion($equipo, 'baja', $motivo);
                        break;

                    case 'transferir':
                        if ($request->has('area_destino')) {
                            $areaAnterior = $equipo->area_id;
                            $equipo->update(['area_id' => $request->get('area_destino')]);
                            $this->registrarTransferencia($equipo, $areaAnterior, $request->get('area_destino'), $motivo);
                        }
                        break;
                }

                $resultados[] = ['id' => $equipoId, 'status' => 'success', 'mensaje' => 'Acción ejecutada correctamente'];
            }

            DB::commit();

            return ResponseFormatter::success($resultados, "Acción '{$accion}' ejecutada en " . count($equiposIds) . " equipos");

        } catch (\Exception $e) {
            DB::rollBack();
            return ResponseFormatter::error('Error en gestión avanzada: ' . $e->getMessage(), 500);
        }
    }

    /**
     * ENDPOINT COMPLETO: Historial completo del equipo
     */
    public function historial($id)
    {
        try {
            $equipo = Equipo::with([
                'mantenimientos' => function($query) {
                    $query->orderBy('fecha_programada', 'desc')->limit(10);
                },
                'contingencias' => function($query) {
                    $query->orderBy('fecha_reporte', 'desc')->limit(10);
                },
                'archivos' => function($query) {
                    $query->orderBy('created_at', 'desc');
                }
            ])->find($id);

            if (!$equipo) {
                return ResponseFormatter::notFound('Equipo no encontrado');
            }

            // Obtener historial de acciones
            $acciones = DB::table('observaciones')
                ->where('equipo_id', $id)
                ->orderBy('created_at', 'desc')
                ->limit(50)
                ->get();

            $historial = [
                'equipo' => $equipo,
                'mantenimientos' => $equipo->mantenimientos,
                'contingencias' => $equipo->contingencias,
                'archivos' => $equipo->archivos,
                'acciones' => $acciones,
                'estadisticas' => [
                    'total_mantenimientos' => $equipo->mantenimientos()->count(),
                    'total_contingencias' => $equipo->contingencias()->count(),
                    'ultimo_mantenimiento' => $equipo->mantenimientos()->latest('fecha_programada')->first()?->fecha_programada,
                    'tiempo_operacion' => $this->calcularTiempoOperacion($equipo),
                    'costo_mantenimientos' => $equipo->mantenimientos()->sum('costo')
                ]
            ];

            return ResponseFormatter::success($historial, 'Historial del equipo obtenido exitosamente');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener historial: ' . $e->getMessage(), 500);
        }
    }

    /**
     * ENDPOINT COMPLETO: Programar mantenimiento masivo
     */
    public function programarMantenimientoMasivo(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'equipos' => 'required|array|min:1',
                'equipos.*' => 'required|integer|exists:equipos,id',
                'tipo' => 'required|string|in:preventivo,correctivo,calibracion',
                'fecha_programada' => 'required|date|after:today',
                'descripcion' => 'required|string|max:500',
                'tecnico_id' => 'nullable|integer|exists:usuarios,id',
                'prioridad' => 'required|string|in:baja,media,alta,urgente'
            ]);

            if ($validator->fails()) {
                return ResponseFormatter::validation($validator->errors());
            }

            $equiposIds = $request->get('equipos');
            $mantenimientos = [];

            DB::beginTransaction();

            foreach ($equiposIds as $equipoId) {
                $mantenimiento = Mantenimiento::create([
                    'equipo_id' => $equipoId,
                    'tipo' => $request->get('tipo'),
                    'descripcion' => $request->get('descripcion'),
                    'fecha_programada' => $request->get('fecha_programada'),
                    'estado' => 'programado',
                    'tecnico_id' => $request->get('tecnico_id'),
                    'prioridad' => $request->get('prioridad'),
                    'status' => 1,
                    'created_at' => now(),
                    'updated_at' => now()
                ]);

                $mantenimientos[] = $mantenimiento;

                // Actualizar estado del equipo
                Equipo::where('id', $equipoId)->update(['estadoequipo_id' => 2]);
            }

            DB::commit();

            return ResponseFormatter::success($mantenimientos, 'Mantenimientos programados exitosamente para ' . count($equiposIds) . ' equipos');

        } catch (\Exception $e) {
            DB::rollBack();
            return ResponseFormatter::error('Error al programar mantenimientos: ' . $e->getMessage(), 500);
        }
    }

    // Métodos auxiliares
    private function registrarAccion($equipo, $accion, $motivo)
    {
        DB::table('observaciones')->insert([
            'equipo_id' => $equipo->id,
            'usuario_id' => auth()->id(),
            'observacion' => "Acción: {$accion}. Motivo: {$motivo}",
            'tipo' => $accion,
            'fecha' => now(),
            'created_at' => now(),
            'updated_at' => now()
        ]);
    }

    private function programarMantenimiento($equipo, $fecha)
    {
        if ($fecha) {
            Mantenimiento::create([
                'equipo_id' => $equipo->id,
                'tipo' => 'preventivo',
                'descripcion' => 'Mantenimiento programado automáticamente',
                'fecha_programada' => $fecha,
                'estado' => 'programado',
                'status' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ]);
        }
    }

    private function registrarTransferencia($equipo, $areaAnterior, $areaNueva, $motivo)
    {
        DB::table('observaciones')->insert([
            'equipo_id' => $equipo->id,
            'usuario_id' => auth()->id(),
            'observacion' => "Transferencia de área {$areaAnterior} a área {$areaNueva}. Motivo: {$motivo}",
            'tipo' => 'transferencia',
            'fecha' => now(),
            'created_at' => now(),
            'updated_at' => now()
        ]);
    }

    private function calcularTiempoOperacion($equipo)
    {
        $fechaInstalacion = Carbon::parse($equipo->fecha_instalacion);
        return $fechaInstalacion->diffInDays(now()) . ' días';
    }
}