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
use App\Http\Requests\StoreEquipmentRequest;
use App\Http\Requests\UpdateEquipmentRequest;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

/**
 * @OA\Tag(
 *     name="Equipos",
 *     description="Gestión completa de equipos médicos e industriales"
 * )
 *
 * Controlador para gestión completa de equipos médicos e industriales
 * Basado en la estructura real de la base de datos gestionthuv
 */
class EquipmentController extends ApiController
{
    /**
     * @OA\Get(
     *     path="/api/equipos",
     *     tags={"Equipos"},
     *     summary="Listar equipos con filtros avanzados",
     *     description="Obtiene lista paginada de equipos con filtros opcionales por servicio, área, estado, etc.",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(
     *         name="page",
     *         in="query",
     *         description="Número de página",
     *         @OA\Schema(type="integer", example=1)
     *     ),
     *     @OA\Parameter(
     *         name="per_page",
     *         in="query",
     *         description="Elementos por página",
     *         @OA\Schema(type="integer", example=15)
     *     ),
     *     @OA\Parameter(
     *         name="servicio_id",
     *         in="query",
     *         description="Filtrar por servicio",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Parameter(
     *         name="area_id",
     *         in="query",
     *         description="Filtrar por área",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Parameter(
     *         name="estado",
     *         in="query",
     *         description="Filtrar por estado",
     *         @OA\Schema(type="string", enum={"Operativo", "Fuera de Servicio", "En Mantenimiento"})
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Lista de equipos obtenida exitosamente",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="string", example="success"),
     *             @OA\Property(property="message", type="string", example="Equipos obtenidos exitosamente"),
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 @OA\Property(property="current_page", type="integer", example=1),
     *                 @OA\Property(property="total", type="integer", example=150),
     *                 @OA\Property(property="per_page", type="integer", example=15),
     *                 @OA\Property(
     *                     property="data",
     *                     type="array",
     *                     @OA\Items(
     *                         @OA\Property(property="id", type="integer", example=1),
     *                         @OA\Property(property="nombre", type="string", example="Monitor de Signos Vitales"),
     *                         @OA\Property(property="codigo", type="string", example="EQ-001"),
     *                         @OA\Property(property="marca", type="string", example="Philips"),
     *                         @OA\Property(property="modelo", type="string", example="IntelliVue MX40"),
     *                         @OA\Property(property="serie", type="string", example="ABC123456"),
     *                         @OA\Property(property="estado", type="string", example="Operativo")
     *                     )
     *                 )
     *             )
     *         )
     *     ),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     *
     * Obtener lista de equipos con filtros avanzados y paginación
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
                'estadoEquipo:id,nombre',
                'tipo:id,nombre'
            ]);

            // Aplicar filtros de búsqueda
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('code', 'like', "%{$search}%")
                        ->orWhere('marca', 'like', "%{$search}%")
                        ->orWhere('modelo', 'like', "%{$search}%")
                        ->orWhere('serial', 'like', "%{$search}%")
                        ->orWhere('descripcion', 'like', "%{$search}%");
                });
            }

            // Filtros específicos
            if ($request->has('servicio_id')) {
                $query->where('servicio_id', $request->servicio_id);
            }

            if ($request->has('area_id')) {
                $query->where('area_id', $request->area_id);
            }

            if ($request->has('propietario_id')) {
                $query->where('propietario_id', $request->propietario_id);
            }

            if ($request->has('estadoequipo_id')) {
                $query->where('estadoequipo_id', $request->estadoequipo_id);
            }

            if ($request->has('criesgo_id')) {
                $query->where('criesgo_id', $request->criesgo_id);
            }

            if ($request->has('fuente_id')) {
                $query->where('fuente_id', $request->fuente_id);
            }

            if ($request->has('tecnologia_id')) {
                $query->where('tecnologia_id', $request->tecnologia_id);
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

            // Filtro por estado activo
            if ($request->has('solo_activos') && $request->solo_activos) {
                $query->where('status', true);
            }

            // Filtro por marca
            if ($request->has('marca')) {
                $query->where('marca', $request->marca);
            }

            // Filtro por modelo
            if ($request->has('modelo')) {
                $query->where('modelo', $request->modelo);
            }

            // Filtro por año de fabricación
            if ($request->has('año_fabricacion')) {
                $query->whereYear('fecha_fabricacion', $request->año_fabricacion);
            }

            // Filtro por calibración requerida
            if ($request->has('requiere_calibracion')) {
                $query->where('calibracion', $request->requiere_calibracion);
            }

            // Filtro por repuesto pendiente
            if ($request->has('repuesto_pendiente')) {
                $query->where('repuesto_pendiente', $request->repuesto_pendiente);
            }

            // Ordenamiento
            $orderBy = $request->get('order_by', 'created_at');
            $orderDirection = $request->get('order_direction', 'desc');
            $query->orderBy($orderBy, $orderDirection);

            // Paginación con límite de seguridad
            $perPage = min($request->get('per_page', 15), 100); // Máximo 100 por página
            $equipos = $query->paginate($perPage);

            // Agregar URL de imagen y metadatos adicionales
            $equipos->getCollection()->transform(function ($equipo) {
                if ($equipo->image) {
                    $equipo->image_url = Storage::disk('public')->url($equipo->image);
                }

                // Agregar información adicional útil
                $equipo->mantenimientos_pendientes = $equipo->mantenimientos()
                    ->where('status', 'programado')
                    ->where('fecha_programada', '<=', now()->addDays(30))
                    ->count();

                $equipo->contingencias_activas = $equipo->contingencias()
                    ->where('estado_id', '!=', 3) // 3 = Cerrado
                    ->count();

                return $equipo;
            });

            return ResponseFormatter::success($equipos, 'Equipos obtenidos exitosamente');
        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener equipos: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Crear nuevo equipo con validaciones completas
     */
    public function store(StoreEquipmentRequest $request)
    {
        // Las validaciones ya están manejadas por el FormRequest

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
                'estadoEquipo:id,nombre',
                'tipo:id,nombre'
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
     * Mostrar equipo específico con todas sus relaciones
     */
    public function show(string $id)
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
                'tipo:id,nombre',
                'mantenimientos' => function ($query) {
                    $query->with('tecnico:id,nombre,apellido')
                        ->orderBy('fecha_programada', 'desc')
                        ->limit(10);
                },
                'contingencias' => function ($query) {
                    $query->with('usuarioReporta:id,nombre,apellido')
                        ->where('estado', '!=', 'Cerrado')
                        ->orderBy('fecha', 'desc');
                },
                'calibraciones' => function ($query) {
                    $query->orderBy('fecha', 'desc')->limit(5);
                },
                'observaciones' => function ($query) {
                    $query->with('usuario:id,nombre,apellido')
                        ->orderBy('created_at', 'desc')
                        ->limit(10);
                },
                'archivos',
                'contactos',
                'especificaciones',
                'repuestos'
            ])->findOrFail($id);

            // Agregar URL de imagen si existe
            if ($equipo->image) {
                $equipo->image_url = Storage::disk('public')->url($equipo->image);
            }

            // Calcular estadísticas del equipo
            $equipo->estadisticas = [
                'total_mantenimientos' => $equipo->mantenimientos->count(),
                'mantenimientos_completados' => $equipo->mantenimientos->where('status', 'completado')->count(),
                'contingencias_activas' => $equipo->contingencias->count(),
                'ultima_calibracion' => $equipo->calibraciones->first()?->fecha,
                'dias_desde_ultimo_mantenimiento' => $equipo->fecha_mantenimiento
                    ? Carbon::parse($equipo->fecha_mantenimiento)->diffInDays(now())
                    : null,
                'valor_depreciado' => $this->calcularDepreciacion($equipo)
            ];

            return ResponseFormatter::success($equipo, 'Equipo obtenido exitosamente');
        } catch (\Exception $e) {
            return ResponseFormatter::notFound('Equipo no encontrado');
        }
    }

    /**
     * Actualizar equipo con validaciones completas
     */
    public function update(Request $request, string $id)
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
            'fecha_inicio_operacion' => 'nullable|date',
            'fecha_acta_recibo' => 'nullable|date',
            'fecha_vencimiento_garantia' => 'nullable|date',
            'vida_util' => 'nullable|integer|min:1',
            'propietario_id' => 'nullable|exists:propietarios,id',
            'fuente_id' => 'nullable|exists:fuenteal,id',
            'tecnologia_id' => 'nullable|exists:tecnologiap,id',
            'frecuencia_id' => 'nullable|exists:frecuenciam,id',
            'cbiomedica_id' => 'nullable|exists:cbiomedica,id',
            'criesgo_id' => 'nullable|exists:criesgo,id',
            'tadquisicion_id' => 'nullable|exists:tadquisicion,id',
            'estadoequipo_id' => 'nullable|exists:estadoequipos,id',
            'tipo_id' => 'nullable|exists:tipos,id',
            'invima' => 'nullable|string|max:100',
            'garantia' => 'nullable|string|max:255',
            'accesorios' => 'nullable|string',
            'localizacion_actual' => 'nullable|string|max:255',
            'verificacion_inventario' => 'nullable|boolean',
            'calibracion' => 'nullable|boolean',
            'repuesto_pendiente' => 'nullable|boolean',
            'movilidad' => 'nullable|string|max:100',
            'propiedad' => 'nullable|string|max:100',
            'evaluacion_desempenio' => 'nullable|string|max:100',
            'periodicidad' => 'nullable|string|max:100',
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
                'servicio:id,name',
                'area:id,name',
                'propietario:id,name',
                'fuenteAlimentacion:id,name',
                'tecnologia:id,name',
                'frecuenciaMantenimiento:id,name',
                'clasificacionBiomedica:id,name',
                'clasificacionRiesgo:id,name',
                'estadoEquipo:id,name',
                'tipo:id,name'
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
     * Eliminar equipo (soft delete con validaciones)
     */
    public function destroy(string $id)
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

            // Verificar si tiene contingencias activas
            $contingenciasActivas = $equipo->contingencias()
                ->where('estado', '!=', 'Cerrado')
                ->count();

            if ($contingenciasActivas > 0) {
                return ResponseFormatter::error(
                    'No se puede eliminar el equipo porque tiene contingencias activas',
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
     * Dar de baja un equipo con motivo
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
            $bajaId = DB::table('equipos_bajas')->insertGetId([
                'equipo_id' => $id,
                'motivo' => $request->motivo,
                'fecha_baja' => $request->fecha_baja ?: now(),
                'observaciones' => $request->observaciones,
                'usuario_id' => auth()->id(),
                'created_at' => now()
            ]);

            // Actualizar estado del equipo
            $equipo->update([
                'baja_id' => $bajaId,
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
                'servicio:id,name',
                'area:id,name',
                'propietario:id,name'
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
            $equipos = Equipo::with(['area:id,name', 'estadoEquipo:id,name'])
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
            $equipos = Equipo::with(['servicio:id,name', 'estadoEquipo:id,name'])
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
                'servicio:id,name',
                'area:id,name',
                'clasificacionRiesgo:id,name',
                'contingencias' => function ($query) {
                    $query->where('estado', '!=', 'Cerrado');
                }
            ])
                ->whereHas('clasificacionRiesgo', function ($query) {
                    $query->whereIn('name', ['ALTO', 'MEDIO ALTO']);
                })
                ->where(function ($query) {
                    $query->where('fecha_mantenimiento', '<', now()->subDays(30))
                        ->orWhereHas('contingencias', function ($q) {
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
     * Obtener estadísticas completas de equipos
     */
    public function getStats()
    {
        try {
            $stats = [
                'total' => Equipo::where('status', true)->count(),
                'por_servicio' => Equipo::join('servicios', 'equipos.servicio_id', '=', 'servicios.id')
                    ->where('equipos.status', true)
                    ->groupBy('servicios.id', 'servicios.name')
                    ->selectRaw('servicios.name as servicio, count(*) as total')
                    ->get(),
                'por_area' => Equipo::join('areas', 'equipos.area_id', '=', 'areas.id')
                    ->where('equipos.status', true)
                    ->groupBy('areas.id', 'areas.name')
                    ->selectRaw('areas.name as area, count(*) as total')
                    ->get(),
                'por_riesgo' => Equipo::join('criesgo', 'equipos.criesgo_id', '=', 'criesgo.id')
                    ->where('equipos.status', true)
                    ->groupBy('criesgo.id', 'criesgo.name')
                    ->selectRaw('criesgo.name as riesgo, count(*) as total')
                    ->get(),
                'por_estado' => Equipo::join('estadoequipos', 'equipos.estadoequipo_id', '=', 'estadoequipos.id')
                    ->where('equipos.status', true)
                    ->groupBy('estadoequipos.id', 'estadoequipos.name')
                    ->selectRaw('estadoequipos.name as estado, count(*) as total')
                    ->get(),
                'valor_total' => Equipo::where('status', true)->sum('costo'),
                'promedio_vida_util' => Equipo::where('status', true)->avg('vida_util'),
                'equipos_con_calibracion' => Equipo::where('status', true)->where('calibracion', true)->count(),
                'equipos_con_repuesto_pendiente' => Equipo::where('status', true)->where('repuesto_pendiente', true)->count()
            ];

            return ResponseFormatter::success($stats, 'Estadísticas obtenidas exitosamente');
        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener estadísticas: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Buscar equipos por código
     */
    public function searchByCode(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'code' => 'required|string'
        ]);

        if ($validator->fails()) {
            return ResponseFormatter::validation($validator->errors());
        }

        try {
            $equipos = Equipo::with(['servicio:id,name', 'area:id,name', 'propietario:id,name'])
                ->where('code', 'like', "%{$request->code}%")
                ->where('status', true)
                ->limit(10)
                ->get();

            return ResponseFormatter::success($equipos, 'Búsqueda completada exitosamente');
        } catch (\Exception $e) {
            return ResponseFormatter::error('Error en la búsqueda: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Buscar equipos con filtros avanzados
     */
    public function busquedaAvanzada(Request $request)
    {
        try {
            $query = Equipo::with([
                'servicio:id,name',
                'area:id,name',
                'propietario:id,name',
                'clasificacionRiesgo:id,name',
                'estadoEquipo:id,name'
            ]);

            // Aplicar múltiples filtros
            if ($request->filled('servicios')) {
                $query->whereIn('servicio_id', $request->servicios);
            }

            if ($request->filled('areas')) {
                $query->whereIn('area_id', $request->areas);
            }

            if ($request->filled('riesgos')) {
                $query->whereIn('criesgo_id', $request->riesgos);
            }

            if ($request->filled('estados')) {
                $query->whereIn('estadoequipo_id', $request->estados);
            }

            if ($request->filled('marcas')) {
                $query->whereIn('marca', $request->marcas);
            }

            if ($request->filled('fecha_fabricacion_desde')) {
                $query->where('fecha_fabricacion', '>=', $request->fecha_fabricacion_desde);
            }

            if ($request->filled('fecha_fabricacion_hasta')) {
                $query->where('fecha_fabricacion', '<=', $request->fecha_fabricacion_hasta);
            }

            if ($request->filled('costo_min')) {
                $query->where('costo', '>=', $request->costo_min);
            }

            if ($request->filled('costo_max')) {
                $query->where('costo', '<=', $request->costo_max);
            }

            if ($request->filled('vida_util_min')) {
                $query->where('vida_util', '>=', $request->vida_util_min);
            }

            if ($request->filled('con_mantenimiento_vencido')) {
                $query->where('fecha_mantenimiento', '<', now()->subDays(30));
            }

            if ($request->filled('requiere_calibracion')) {
                $query->where('calibracion', $request->requiere_calibracion);
            }

            $equipos = $query->where('status', true)
                ->orderBy('created_at', 'desc')
                ->paginate($request->get('per_page', 15));

            return ResponseFormatter::success($equipos, 'Búsqueda avanzada completada');
        } catch (\Exception $e) {
            return ResponseFormatter::error('Error en búsqueda avanzada: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Obtener marcas disponibles
     */
    public function getMarcas()
    {
        try {
            $marcas = Equipo::where('status', true)
                ->whereNotNull('marca')
                ->distinct()
                ->pluck('marca')
                ->sort()
                ->values();

            return ResponseFormatter::success($marcas, 'Marcas obtenidas');
        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener marcas: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Obtener modelos por marca
     */
    public function getModelosPorMarca($marca)
    {
        try {
            $modelos = Equipo::where('status', true)
                ->where('marca', $marca)
                ->whereNotNull('modelo')
                ->distinct()
                ->pluck('modelo')
                ->sort()
                ->values();

            return ResponseFormatter::success($modelos, 'Modelos obtenidos');
        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener modelos: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Calcular depreciación del equipo
     */
    private function calcularDepreciacion($equipo)
    {
        if (!$equipo->costo || !$equipo->vida_util || !$equipo->fecha_instalacion) {
            return null;
        }

        $añosTranscurridos = Carbon::parse($equipo->fecha_instalacion)->diffInYears(now());
        $depreciacionAnual = $equipo->costo / $equipo->vida_util;
        $depreciacionTotal = $depreciacionAnual * $añosTranscurridos;

        return max(0, $equipo->costo - $depreciacionTotal);
    }
}
