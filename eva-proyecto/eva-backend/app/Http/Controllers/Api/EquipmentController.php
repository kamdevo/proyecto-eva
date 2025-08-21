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

            $equipoData = $request->except(['image', 'archivo_excel']);
            $equipoData['status'] = 1;

            // Manejar propietario_id = 0 como null
            if (isset($equipoData['propietario_id']) && $equipoData['propietario_id'] == '0') {
                $equipoData['propietario_id'] = null;
            }

            // Manejar area_id = 0 como null
            if (isset($equipoData['area_id']) && $equipoData['area_id'] == '0') {
                $equipoData['area_id'] = null;
            }

            // Asegurar que los IDs foráneos tengan valores por defecto válidos
            $defaultValues = [
                'fuente_id' => 1,
                'tecnologia_id' => 1,
                'frecuencia_id' => 1,
                'cbiomedica_id' => 1,
                'criesgo_id' => 1,
                'tadquisicion_id' => 1,
                'invima_id' => 1,
                'orden_compra_id' => 1,
                'baja_id' => 1,
                'estadoequipo_id' => 1,
                'tipo_id' => 1,
                'guia_id' => 1,
                'manual_id' => 1,
                'disponibilidad_id' => 1
            ];

            foreach ($defaultValues as $field => $defaultValue) {
                if (!isset($equipoData[$field]) || empty($equipoData[$field])) {
                    $equipoData[$field] = $defaultValue;
                }
            }

            // Procesar manuales y planos JSON - SOLUCIÓN ROBUSTA
            \Log::info('DEBUG: Before processing manuales and planos', [
                'request_all' => $request->all(),
                'has_manuales' => $request->has('manuales'),
                'has_planos' => $request->has('planos'),
                'manuales_value' => $request->input('manuales'),
                'planos_value' => $request->input('planos')
            ]);

            $this->processManualesAndPlanos($request, $equipoData);

            \Log::info('DEBUG: After processing manuales and planos', [
                'has_manual_in_data' => isset($equipoData['manual']),
                'manual_value' => $equipoData['manual'] ?? 'NOT_SET',
                'has_plano_in_data' => isset($equipoData['plano']),
                'plano_value' => $equipoData['plano'] ?? 'NOT_SET'
            ]);

            // Manejar subida de imagen
            if ($request->hasFile('image')) {
                $image = $request->file('image');
                $timestamp = now()->format('YmdHis');
                $imageName = "equipo_{$timestamp}_" . uniqid() . '.' . $image->getClientOriginalExtension();
                $imagePath = $image->storeAs('equipos/images', $imageName, 'public');
                $equipoData['image'] = $imagePath;
            }

            // Manejar subida de archivo Excel/PDF
            if ($request->hasFile('archivo_excel')) {
                $archivo = $request->file('archivo_excel');
                $timestamp = now()->format('YmdHis');
                $archivoName = "hoja_vida_{$timestamp}_" . uniqid() . '.' . $archivo->getClientOriginalExtension();
                $archivoPath = $archivo->storeAs('equipos/documentos', $archivoName, 'public');
                $equipoData['archivo_hoja_vida'] = $archivoPath;
            }

            // Final verification and forced setting of manual/plano before creation
            if ($request->filled('manuales') && !isset($equipoData['manual'])) {
                $manualesInput = $request->input('manuales');
                if (is_string($manualesInput)) {
                    $equipoData['manual'] = $manualesInput;
                }
            }

            if ($request->filled('planos') && !isset($equipoData['plano'])) {
                $planosInput = $request->input('planos');
                if (is_string($planosInput)) {
                    $equipoData['plano'] = $planosInput;
                }
            }

            \Log::info('DEBUG: Final equipoData before creation', [
                'has_manual' => isset($equipoData['manual']),
                'manual_value' => $equipoData['manual'] ?? 'NOT_SET',
                'has_plano' => isset($equipoData['plano']),
                'plano_value' => $equipoData['plano'] ?? 'NOT_SET',
                'total_fields' => count($equipoData)
            ]);

            $equipo = Equipo::create($equipoData);

            \Log::info('DEBUG: Equipment created', [
                'id' => $equipo->id,
                'manual_in_db' => $equipo->manual,
                'plano_in_db' => $equipo->plano
            ]);

            // Skip relationship loading for now to focus on core functionality
            // $equipo->load([...]);

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
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120',
            'manuales' => 'nullable|json',
            'planos' => 'nullable|json'
        ]);

        if ($validator->fails()) {
            return ResponseFormatter::validation($validator->errors());
        }

        try {
            DB::beginTransaction();

            $equipo = Equipo::findOrFail($id);
            $equipoData = $request->except(['image', 'manuales', 'planos']);

            // Process manuales and planos JSON
            if ($request->has('manuales')) {
                $manuales = is_string($request->manuales) ? json_decode($request->manuales, true) : $request->manuales;
                $equipoData['manual'] = json_encode($manuales);
            }

            if ($request->has('planos')) {
                $planos = is_string($request->planos) ? json_decode($request->planos, true) : $request->planos;
                $equipoData['plano'] = json_encode($planos);
            }

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

    /**
     * Obtener equipos médicos con información completa usando la consulta SQL especificada
     * Esta función implementa la consulta SQL completa solicitada
     */
    public function getMedicalDevicesComplete(Request $request)
    {
        try {
            $perPage = $request->get('per_page', 15);
            $page = $request->get('page', 1);
            $search = $request->get('search', '');
            $sortBy = $request->get('sort_by', 'equipos.name');
            $sortOrder = $request->get('sort_order', 'asc');

            // Debug: Log todos los filtros recibidos
            $activeFilters = array_filter($request->all(), function($value, $key) {
                return !empty($value) && !in_array($key, ['page', 'per_page', 'sort_by', 'sort_order']);
            }, ARRAY_FILTER_USE_BOTH);

            if (!empty($activeFilters)) {
                \Log::info('🔍 Backend: Filtros activos recibidos', [
                    'active_filters' => $activeFilters,
                    'total_filters' => count($activeFilters)
                ]);
            }

            // Consulta SQL completa como se especificó
            $query = DB::table('equipos')
                ->select([
                    'equipos.id',
                    'equipos.name',
                    'equipos.code',
                    'equipos.serial',
                    'equipos.marca',
                    'equipos.modelo',
                    'equipos.image',
                    'equipos.file',
                    'equipos.archivo_invima',
                    'equipos.registro_sanitario',
                    'equipos.numero_invima',
                    'equipos.fecha_vencimiento_invima',
                    'equipos.estado_invima',
                    'servicios.name as servicios',
                    'areas.name as area',
                    'sedes.name as sede',
                    'estadoequipos.name as estadoequipo',
                    'cbiomedica.name as clasificacion',
                    'criesgo.name as riesgo',
                    // Información adicional dinámica
                    DB::raw('(SELECT fecha_mantenimiento FROM mantenimiento 
                             WHERE equipo_id = equipos.id 
                             ORDER BY fecha_mantenimiento DESC LIMIT 1) AS ultimo_mantenimiento'),
                    DB::raw('(SELECT fecha_calibracion FROM calibracion 
                             WHERE equipo_id = equipos.id 
                             ORDER BY fecha_calibracion DESC LIMIT 1) AS ultima_calibracion'),
                    DB::raw('(SELECT fecha_mantenimiento FROM correctivos_generales 
                             WHERE equipo_id = equipos.id 
                             ORDER BY fecha_mantenimiento DESC LIMIT 1) AS ultimo_correctivo'),
                    DB::raw('(SELECT fecha_inicio FROM ordenes 
                             WHERE equipo_id = equipos.id 
                             ORDER BY fecha_inicio DESC LIMIT 1) AS fecha_inicio_ultimo_ticket'),
                    DB::raw('(SELECT COUNT(*) FROM equipo_archivo 
                             WHERE equipo_id = equipos.id AND archivo_id != 9) AS cuenta_archivos'),
                    DB::raw('(SELECT COUNT(*) FROM planes_mantenimientos 
                             WHERE equipo_id = equipos.id AND anio = 2025) AS cuenta_planes_mantenimientos'),
                    DB::raw('(SELECT description FROM observaciones 
                             WHERE equipo_id = equipos.id 
                             ORDER BY id DESC LIMIT 1) AS ultima_observacion'),
                    'invimas.invima as registro_sanitario',
                    'invimas.file as archivo_registro_sanitario',
                    'pro.nombre as propietario',
                    'pro.logo as propietario_logo',
                    'ordenes_compra.orden as orden_compra',
                    'tipos_compra.tipo_compra as tipo_compra'
                ])
                ->leftJoin('servicios', 'servicios.id', '=', 'equipos.servicio_id')
                ->leftJoin('areas', 'areas.id', '=', 'equipos.area_id')
                ->leftJoin('sedes', 'sedes.id', '=', 'servicios.sede_id')
                ->leftJoin('estadoequipos', 'estadoequipos.id', '=', 'equipos.estadoequipo_id')
                ->leftJoin('cbiomedica', 'cbiomedica.id', '=', 'equipos.cbiomedica_id')
                ->leftJoin('criesgo', 'criesgo.id', '=', 'equipos.criesgo_id')
                ->leftJoin('invimas', 'invimas.id', '=', 'equipos.invima_id')
                ->leftJoin('propietarios as pro', 'pro.id', '=', 'equipos.propietario_id')
                ->leftJoin('ordenes_compra', 'ordenes_compra.id', '=', 'equipos.orden_compra_id')
                ->leftJoin('tipos_compra', 'tipos_compra.id', '=', 'ordenes_compra.tipo_compra_id')
                ->where('equipos.status', '!=', 0)
                ->where('equipos.tipo_id', 1); // Solo equipos médicos

            // FILTRO POR ID ESPECÍFICO (consulta_id) - Debe ser exacto y único
            if ($request->has('consulta_id') && !empty($request->consulta_id)) {
                $equipmentId = (int) $request->consulta_id;
                $query->where('equipos.id', $equipmentId);
                // Cuando se busca por ID específico, no aplicar otros filtros de búsqueda
            } else {
                // Aplicar filtros de búsqueda solo si no se está buscando por ID específico
                if (!empty($search)) {
                    $query->where(function ($q) use ($search) {
                        $q->where('equipos.name', 'like', "%{$search}%")
                            ->orWhere('equipos.code', 'like', "%{$search}%")
                            ->orWhere('equipos.marca', 'like', "%{$search}%")
                            ->orWhere('equipos.modelo', 'like', "%{$search}%")
                            ->orWhere('equipos.serial', 'like', "%{$search}%")
                            ->orWhere('servicios.name', 'like', "%{$search}%")
                            ->orWhere('areas.name', 'like', "%{$search}%");
                    });
                }
            }

            // FILTROS ESPECÍFICOS SEGÚN EL INFORME

            // Sección 1: Identificación del Equipo
            if ($request->has('filtro_code') && !empty($request->filtro_code)) {
                $query->where('equipos.code', 'like', "%{$request->filtro_code}%");
            }

            if ($request->has('filtro_name') && !empty($request->filtro_name)) {
                $query->where('equipos.name', 'like', "%{$request->filtro_name}%");
            }

            if ($request->has('filtro_serial') && !empty($request->filtro_serial)) {
                $query->where('equipos.serial', 'like', "%{$request->filtro_serial}%");
            }

            if ($request->has('filtro_marca') && !empty($request->filtro_marca)) {
                $query->where('equipos.marca', 'like', "%{$request->filtro_marca}%");
            }

            if ($request->has('filtro_modelo') && !empty($request->filtro_modelo)) {
                $query->where('equipos.modelo', 'like', "%{$request->filtro_modelo}%");
            }

            // Sección 2: Ubicación Geográfica
            if ($request->has('filtro_zona') && !empty($request->filtro_zona)) {
                $query->where('sedes.id', $request->filtro_zona);
            }

            if ($request->has('servicio_id_auxiliar') && !empty($request->servicio_id_auxiliar)) {
                $query->where('equipos.servicio_id', $request->servicio_id_auxiliar);
            }

            if ($request->has('area_id_auxiliar') && !empty($request->area_id_auxiliar)) {
                $query->where('equipos.area_id', $request->area_id_auxiliar);
            }

            // Sección 3: Estado y Operación
            if ($request->has('filtro_estadoequipo_id') && !empty($request->filtro_estadoequipo_id)) {
                $query->where('equipos.estadoequipo_id', $request->filtro_estadoequipo_id);
            }

            if ($request->has('filtro_estadom') && !empty($request->filtro_estadom)) {
                $query->where('equipos.estado_mantenimiento', $request->filtro_estadom);
            }

            if ($request->has('proveedor_mantenimiento') && !empty($request->proveedor_mantenimiento)) {
                // Filtrar por proveedor de mantenimiento (puede requerir join con tabla de mantenimientos)
                $query->whereExists(function ($subQuery) use ($request) {
                    $subQuery->select(DB::raw(1))
                        ->from('mantenimiento')
                        ->whereColumn('mantenimiento.equipo_id', 'equipos.id')
                        ->where('mantenimiento.proveedor_id', $request->proveedor_mantenimiento);
                });
            }

            // Sección 4: Clasificación Técnica
            if ($request->has('tipo_id') && !empty($request->tipo_id)) {
                $query->where('equipos.tipo_id', $request->tipo_id);
            }

            if ($request->has('estado_id') && !empty($request->estado_id)) {
                $query->where('equipos.criesgo_id', $request->estado_id);
            }

            if ($request->has('estado_id_cg') && !empty($request->estado_id_cg)) {
                $query->where('equipos.propietario_id', $request->estado_id_cg);
            }

            // Sección 5: Parámetros Temporales
            if ($request->has('anio_plan') && !empty($request->anio_plan)) {
                // Filtrar por fecha específica o año
                $dateValue = $request->anio_plan;
                if (strlen($dateValue) === 4) {
                    // Si es solo año (4 dígitos)
                    $query->whereYear('equipos.created_at', $dateValue);
                } else {
                    // Si es fecha completa
                    $query->whereDate('equipos.created_at', $dateValue);
                }
            }

            // Filtros adicionales de compatibilidad
            if ($request->has('servicio_id') && !empty($request->servicio_id)) {
                $query->where('equipos.servicio_id', $request->servicio_id);
            }

            if ($request->has('area_id') && !empty($request->area_id)) {
                $query->where('equipos.area_id', $request->area_id);
            }

            if ($request->has('sede_id') && !empty($request->sede_id)) {
                $query->where('sedes.id', $request->sede_id);
            }

            if ($request->has('clasificacion_id') && !empty($request->clasificacion_id)) {
                $query->where('equipos.cbiomedica_id', $request->clasificacion_id);
            }

            if ($request->has('riesgo_id') && !empty($request->riesgo_id)) {
                $query->where('equipos.criesgo_id', $request->riesgo_id);
            }

            if ($request->has('propietario_id') && !empty($request->propietario_id)) {
                $query->where('equipos.propietario_id', $request->propietario_id);
            }

            // Filtro por estado del equipo (estadoequipo_id)
            if ($request->has('estadoequipo_id') && !empty($request->estadoequipo_id)) {
                $query->where('equipos.estadoequipo_id', $request->estadoequipo_id);
            }

            // Filtro por estado general del equipo
            if ($request->has('estado_id') && !empty($request->estado_id)) {
                $query->where('equipos.estadoequipo_id', $request->estado_id);
            }

            // Ordenamiento
            $query->orderBy($sortBy, $sortOrder);

            // Obtener total de registros para paginación
            $total = $query->count();

            // Debug: Log resultados de la consulta
            if ($request->has('consulta_id')) {
                \Log::info('📊 Backend: Resultados de búsqueda por ID', [
                    'consulta_id' => $request->consulta_id,
                    'total_found' => $total,
                    'page' => $page,
                    'per_page' => $perPage
                ]);
            }

            // Aplicar paginación
            $offset = ($page - 1) * $perPage;
            $equipos = $query->skip($offset)->take($perPage)->get();

            // Formatear datos para respuesta
            $formattedEquipos = $equipos->map(function ($equipo) {
                return [
                    'id' => $equipo->id,
                    'equipo' => [
                        'id' => $equipo->id,
                        'name' => $equipo->name,
                        'code' => $equipo->code,
                        'brand' => $equipo->marca,
                        'model' => $equipo->modelo,
                        'series' => $equipo->serial,
                        'image' => $equipo->image ? url('storage/equipos/images/' . $equipo->image) : null,
                        'hasImage' => !empty($equipo->image),
                    ],
                    'data' => [
                        'status' => $equipo->estadoequipo,
                        'registroSanitario' => $equipo->registro_sanitario ?: ($equipo->numero_invima ?: null),
                        'numeroInvima' => $equipo->numero_invima,
                        'fechaVencimientoInvima' => $equipo->fecha_vencimiento_invima,
                        'estadoInvima' => $equipo->estado_invima,
                        'archivoInvima' => $equipo->archivo_invima,
                        'clasificacion' => $equipo->clasificacion,
                        'riesgo' => $equipo->riesgo,
                        'archivos' => (int) $equipo->cuenta_archivos,
                        'planesMantenimiento' => (int) $equipo->cuenta_planes_mantenimientos,
                    ],
                    'ubicacion' => [
                        'servicio' => $equipo->servicios,
                        'area' => $equipo->area,
                        'sede' => $equipo->sede,
                    ],
                    'mantenimiento' => [
                        'ultimoMantenimiento' => $equipo->ultimo_mantenimiento,
                        'ultimaCalibración' => $equipo->ultima_calibracion,
                        'ultimoCorrectivo' => $equipo->ultimo_correctivo,
                    ],
                    'propietario' => [
                        'nombre' => $equipo->propietario,
                        'logo' => $equipo->propietario_logo,
                    ],
                    'compra' => [
                        'orden' => $equipo->orden_compra,
                        'tipo' => $equipo->tipo_compra,
                    ],
                    'observaciones' => [
                        'ultima' => $equipo->ultima_observacion,
                    ],
                    'tickets' => [
                        'fechaUltimoTicket' => $equipo->fecha_inicio_ultimo_ticket,
                    ],
                ];
            });

            $responseData = [
                'current_page' => (int) $page,
                'data' => $formattedEquipos,
                'per_page' => (int) $perPage,
                'total' => $total,
                'last_page' => ceil($total / $perPage),
                'from' => $offset + 1,
                'to' => min($offset + $perPage, $total),
            ];

            return response()->json([
                'success' => true,
                'message' => 'Equipos médicos obtenidos exitosamente',
                'data' => $responseData
            ])->header('Access-Control-Allow-Origin', '*')
              ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
              ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener equipos médicos: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener información completa de un equipo específico
     * Incluye todos los campos requeridos según el informe de hoja de vida
     */
    public function getCompleteInfo($id)
    {
        try {
            // Primero obtener el equipo básico
            $equipoBasico = DB::table('equipos')->where('id', $id)->first();

            if (!$equipoBasico) {
                return response()->json([
                    'success' => false,
                    'message' => 'Equipo no encontrado'
                ], 404);
            }

            // Luego hacer joins seguros uno por uno
            $equipo = DB::table('equipos')
                ->select([
                    // Información básica del equipo
                    'equipos.*',

                    // Información de relaciones básicas
                    'servicios.name as servicio_nombre',
                    'areas.name as area_nombre',
                    'estadoequipos.name as estado_nombre',
                    'pro.nombre as propietario_nombre',
                    'pro.logo as propietario_logo'
                ])
                ->leftJoin('servicios', 'servicios.id', '=', 'equipos.servicio_id')
                ->leftJoin('areas', 'areas.id', '=', 'equipos.area_id')
                ->leftJoin('estadoequipos', 'estadoequipos.id', '=', 'equipos.estadoequipo_id')
                ->leftJoin('propietarios as pro', 'pro.id', '=', 'equipos.propietario_id')
                ->where('equipos.id', $id)
                ->first();

            if (!$equipo) {
                return response()->json([
                    'success' => false,
                    'message' => 'Equipo no encontrado'
                ], 404);
            }

            // Convertir a array para manipulación
            $equipoData = (array) $equipo;

            // Intentar obtener información adicional de forma segura
            try {
                $sede = DB::table('sedes')
                    ->join('servicios', 'servicios.sede_id', '=', 'sedes.id')
                    ->where('servicios.id', $equipo->servicio_id)
                    ->select('sedes.id as sede_id', 'sedes.name as sede_nombre')
                    ->first();
                if ($sede) {
                    $equipoData['sede_id'] = $sede->sede_id;
                    $equipoData['sede_nombre'] = $sede->sede_nombre;
                }
            } catch (\Exception $e) {
                $equipoData['sede_id'] = null;
                $equipoData['sede_nombre'] = null;
            }

            try {
                $clasificacion = DB::table('cbiomedica')->where('id', $equipo->cbiomedica_id)->first();
                if ($clasificacion) {
                    $equipoData['clasificacion_nombre'] = $clasificacion->name;
                }
            } catch (\Exception $e) {
                $equipoData['clasificacion_nombre'] = null;
            }

            try {
                $riesgo = DB::table('criesgo')->where('id', $equipo->criesgo_id)->first();
                if ($riesgo) {
                    $equipoData['riesgo_nombre'] = $riesgo->name;
                }
            } catch (\Exception $e) {
                $equipoData['riesgo_nombre'] = null;
            }

            try {
                // Query the correct invimas table
                $registroInvima = DB::table('invimas')->where('id', $equipo->invima_id)->first();
                if ($registroInvima) {
                    $equipoData['registro_sanitario'] = $registroInvima->invima;
                    $equipoData['archivo_registro_sanitario'] = $registroInvima->file;

                    // Additional INVIMA data for completeness
                    $equipoData['invima_nombre_equipo'] = $registroInvima->titulo;
                    $equipoData['invima_fabricante'] = $registroInvima->marcas;
                    $equipoData['invima_modelo'] = $registroInvima->description;
                    $equipoData['invima_estado'] = 'vigente'; // Por defecto vigente

                    \Log::info('INVIMA data retrieved successfully', [
                        'equipo_id' => $equipo->id,
                        'invima_id' => $equipo->invima_id,
                        'numero_registro' => $registroInvima->numero_registro
                    ]);
                } else {
                    \Log::warning('INVIMA record not found', [
                        'equipo_id' => $equipo->id,
                        'invima_id' => $equipo->invima_id
                    ]);
                }
            } catch (\Exception $e) {
                \Log::error('Error retrieving INVIMA data', [
                    'equipo_id' => $equipo->id,
                    'invima_id' => $equipo->invima_id,
                    'error' => $e->getMessage()
                ]);
                $equipoData['registro_sanitario'] = null;
                $equipoData['archivo_registro_sanitario'] = null;
            }

            // Calcular campos derivados básicos
            if ($equipo->fecha_fabricacion) {
                try {
                    $equipoData['edad_equipo'] = \Carbon\Carbon::parse($equipo->fecha_fabricacion)->diffInYears(now());
                } catch (\Exception $e) {
                    $equipoData['edad_equipo'] = null;
                }
            }

            if ($equipo->fecha_mantenimiento) {
                try {
                    $equipoData['dias_desde_ultimo_mantenimiento'] = \Carbon\Carbon::parse($equipo->fecha_mantenimiento)->diffInDays(now());
                } catch (\Exception $e) {
                    $equipoData['dias_desde_ultimo_mantenimiento'] = null;
                }
            }

            // Contar archivos de forma segura
            try {
                $cuentaArchivos = DB::table('equipo_archivo')
                    ->where('equipo_id', $id)
                    ->where('archivo_id', '!=', 9)
                    ->count();
                $equipoData['cuenta_archivos'] = $cuentaArchivos;
            } catch (\Exception $e) {
                $equipoData['cuenta_archivos'] = 0;
            }

            // Agregar URLs de archivos si existen
            if ($equipo->image) {
                $equipoData['image_url'] = url('storage/equipos/images/' . $equipo->image);
            }

            if ($equipo->file) {
                $equipoData['file_url'] = url('storage/' . $equipo->file);
            }

            return response()->json([
                'success' => true,
                'message' => 'Información completa del equipo obtenida exitosamente',
                'data' => $equipoData
            ])->header('Access-Control-Allow-Origin', '*')
              ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
              ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

        } catch (\Exception $e) {
            \Log::error('Error en getCompleteInfo: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener información completa del equipo: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener opciones para filtros
     */
    public function getFilterOptions()
    {
        try {
            // Helper function to safely query tables with optional status column and default fallback
            $safeQuery = function($table, $select = ['id', 'name'], $orderBy = 'name', $defaultOption = null) {
                try {
                    $query = DB::table($table)->select($select);

                    // Check if status column exists
                    $columns = DB::getSchemaBuilder()->getColumnListing($table);
                    if (in_array('status', $columns)) {
                        $query->where('status', 1);
                    }

                    $results = $query->orderBy($orderBy)->get();

                    // Si no hay resultados y se especifica una opción por defecto, agregarla
                    if ($results->isEmpty() && $defaultOption) {
                        $results = collect([$defaultOption]);
                    }

                    return $results;
                } catch (\Exception $e) {
                    // Si la tabla no existe o hay problemas, devolver opción por defecto si se especifica
                    if ($defaultOption) {
                        return collect([$defaultOption]);
                    }
                    return collect([]);
                }
            };

            $options = [
                // Ubicación geográfica con relaciones
                'sedes' => $safeQuery('sedes'),
                'servicios' => $safeQuery('servicios', ['id', 'name', 'sede_id']),
                'areas' => $safeQuery('areas', ['id', 'name', 'servicio_id']),

                // Estados y clasificaciones
                'estados' => $this->getEstadosEquipoWithDefault(),
                'clasificaciones' => $safeQuery('cbiomedica', ['id', 'name'], 'name',
                    ['id' => 0, 'name' => 'No disponible - Configurar clasificaciones biomédicas']),
                'riesgos' => $safeQuery('criesgo', ['id', 'name'], 'name',
                    ['id' => 0, 'name' => 'No disponible - Configurar clasificaciones de riesgo']),
                'propietarios' => $safeQuery('propietarios', ['id', 'nombre as name'], 'nombre',
                    ['id' => 0, 'name' => 'No disponible - Configurar propietarios']),
                'tipos_equipos' => $safeQuery('tipos', ['id', 'name'], 'name',
                    ['id' => 0, 'name' => 'No disponible - Configurar tipos de equipos']),

                // Proveedores y tecnología
                'proveedores' => $safeQuery('proveedores', ['id', 'name'], 'name',
                    ['id' => 0, 'name' => 'No disponible - Configurar proveedores']),
                'tecnologias' => $safeQuery('tecnologiap', ['id', 'name'], 'name',
                    ['id' => 0, 'name' => 'No disponible - Configurar tecnologías']),
                'fuentes' => $safeQuery('fuenteal', ['id', 'name'], 'name',
                    ['id' => 0, 'name' => 'No disponible - Configurar fuentes de alimentación']),
                'frecuencias' => $safeQuery('frecuenciam', ['id', 'name'], 'name',
                    ['id' => 0, 'name' => 'No disponible - Configurar frecuencias de mantenimiento']),

                // Tipos de adquisición
                'tipos_adquisicion' => $safeQuery('tadquisicion', ['id', 'name'], 'name',
                    ['id' => 0, 'name' => 'No disponible - Configurar tipos de adquisición']),

                // Estados de mantenimiento (valores fijos según el informe)
                'estados_mantenimiento' => collect([
                    ['id' => 1, 'name' => 'Pendiente'],
                    ['id' => 2, 'name' => 'Realizado'],
                    ['id' => 3, 'name' => 'Atrasado'],
                    ['id' => 4, 'name' => 'No definido'],
                    ['id' => 5, 'name' => 'Frecuencia no definida'],
                    ['id' => 6, 'name' => 'Programado']
                ]),

                // Disponibilidad y documentación
                'disponibilidades' => $safeQuery('disponibilidades', ['id', 'name'], 'name',
                    ['id' => 0, 'name' => 'No disponible - Configurar disponibilidades']),
                'guias' => $safeQuery('guias', ['id', 'name'], 'name',
                    ['id' => 0, 'name' => 'No disponible - Configurar guías']),
                'manuales' => $safeQuery('manuales', ['id', 'name'], 'name',
                    ['id' => 0, 'name' => 'No disponible - Configurar manuales']),

                // Años disponibles para filtros temporales
                'years' => collect(range(date('Y') - 10, date('Y') + 2))->map(function($year) {
                    return ['id' => $year, 'name' => $year];
                })
            ];

            return response()->json([
                'success' => true,
                'message' => 'Opciones de filtros obtenidas exitosamente',
                'data' => $options
            ])->header('Access-Control-Allow-Origin', '*')
              ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
              ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener opciones de filtros: ' . $e->getMessage()
            ], 500)->header('Access-Control-Allow-Origin', '*')
                    ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
                    ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
        }
    }

    /**
     * Obtener estadísticas específicas para equipos médicos
     */
    public function getMedicalDevicesStats()
    {
        try {
            $stats = [
                'total_equipos' => DB::table('equipos')->where('tipo_id', 1)->where('status', '!=', 0)->count(),
                'operativos' => DB::table('equipos')
                    ->join('estadoequipos', 'equipos.estadoequipo_id', '=', 'estadoequipos.id')
                    ->where('equipos.tipo_id', 1)
                    ->where('equipos.status', '!=', 0)
                    ->where('estadoequipos.name', 'Operativo')
                    ->count(),
                'en_mantenimiento' => DB::table('equipos')
                    ->join('estadoequipos', 'equipos.estadoequipo_id', '=', 'estadoequipos.id')
                    ->where('equipos.tipo_id', 1)
                    ->where('equipos.status', '!=', 0)
                    ->where('estadoequipos.name', 'En Mantenimiento')
                    ->count(),
                'fuera_servicio' => DB::table('equipos')
                    ->join('estadoequipos', 'equipos.estadoequipo_id', '=', 'estadoequipos.id')
                    ->where('equipos.tipo_id', 1)
                    ->where('equipos.status', '!=', 0)
                    ->where('estadoequipos.name', 'Fuera de Servicio')
                    ->count(),
                'mantenimientos_mes' => DB::table('mantenimiento')
                    ->whereMonth('fecha_mantenimiento', now()->month)
                    ->whereYear('fecha_mantenimiento', now()->year)
                    ->count(),
                'calibraciones_mes' => DB::table('calibracion')
                    ->whereMonth('fecha_calibracion', now()->month)
                    ->whereYear('fecha_calibracion', now()->year)
                    ->count(),
                'por_clasificacion' => DB::table('equipos')
                    ->join('cbiomedica', 'equipos.cbiomedica_id', '=', 'cbiomedica.id')
                    ->where('equipos.tipo_id', 1)
                    ->where('equipos.status', '!=', 0)
                    ->groupBy('cbiomedica.name')
                    ->select('cbiomedica.name', DB::raw('count(*) as total'))
                    ->get(),
                'por_riesgo' => DB::table('equipos')
                    ->join('criesgo', 'equipos.criesgo_id', '=', 'criesgo.id')
                    ->where('equipos.tipo_id', 1)
                    ->where('equipos.status', '!=', 0)
                    ->groupBy('criesgo.name')
                    ->select('criesgo.name', DB::raw('count(*) as total'))
                    ->get(),
            ];

            return response()->json([
                'success' => true,
                'message' => 'Estadísticas de equipos médicos obtenidas exitosamente',
                'data' => $stats
            ])->header('Access-Control-Allow-Origin', '*')
              ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
              ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener estadísticas: ' . $e->getMessage()
            ], 500)->header('Access-Control-Allow-Origin', '*')
                    ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
                    ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
        }
    }

    /**
     * Exportar equipos filtrados a Excel
     */
    public function exportFilteredEquipment(Request $request)
    {
        try {
            // Usar la misma lógica de filtros que getMedicalDevicesComplete pero sin paginación
            $query = DB::table('equipos')
                ->select([
                    'equipos.id',
                    'equipos.name as nombre_equipo',
                    'equipos.code as codigo_inventario',
                    'equipos.serial as numero_serie',
                    'equipos.marca',
                    'equipos.modelo',
                    'servicios.name as servicio',
                    'areas.name as area',
                    'sedes.name as sede',
                    'estadoequipos.name as estado_equipo',
                    'cbiomedicas.name as clasificacion_biomedica',
                    'criesgos.name as clasificacion_riesgo',
                    'propietarios.nombre as propietario',
                    'tipos.name as tipo_equipo',
                    'equipos.created_at as fecha_registro',
                    'equipos.updated_at as fecha_actualizacion'
                ])
                ->leftJoin('servicios', 'equipos.servicio_id', '=', 'servicios.id')
                ->leftJoin('areas', 'equipos.area_id', '=', 'areas.id')
                ->leftJoin('sedes', 'servicios.sede_id', '=', 'sedes.id')
                ->leftJoin('estadoequipos', 'equipos.estadoequipo_id', '=', 'estadoequipos.id')
                ->leftJoin('cbiomedicas', 'equipos.cbiomedica_id', '=', 'cbiomedicas.id')
                ->leftJoin('criesgos', 'equipos.criesgo_id', '=', 'criesgos.id')
                ->leftJoin('propietarios', 'equipos.propietario_id', '=', 'propietarios.id')
                ->leftJoin('tipos', 'equipos.tipo_id', '=', 'tipos.id')
                ->where('equipos.status', '!=', 0);

            // Aplicar los mismos filtros que en getMedicalDevicesComplete
            // Sección 1: Identificación del Equipo
            if ($request->has('filtro_code') && !empty($request->filtro_code)) {
                $query->where('equipos.code', 'like', "%{$request->filtro_code}%");
            }

            if ($request->has('filtro_name') && !empty($request->filtro_name)) {
                $query->where('equipos.name', 'like', "%{$request->filtro_name}%");
            }

            if ($request->has('filtro_serial') && !empty($request->filtro_serial)) {
                $query->where('equipos.serial', 'like', "%{$request->filtro_serial}%");
            }

            if ($request->has('filtro_marca') && !empty($request->filtro_marca)) {
                $query->where('equipos.marca', 'like', "%{$request->filtro_marca}%");
            }

            if ($request->has('filtro_modelo') && !empty($request->filtro_modelo)) {
                $query->where('equipos.modelo', 'like', "%{$request->filtro_modelo}%");
            }

            // Sección 2: Ubicación Geográfica
            if ($request->has('filtro_zona') && !empty($request->filtro_zona)) {
                $query->where('sedes.id', $request->filtro_zona);
            }

            if ($request->has('servicio_id_auxiliar') && !empty($request->servicio_id_auxiliar)) {
                $query->where('equipos.servicio_id', $request->servicio_id_auxiliar);
            }

            if ($request->has('area_id_auxiliar') && !empty($request->area_id_auxiliar)) {
                $query->where('equipos.area_id', $request->area_id_auxiliar);
            }

            // Sección 3: Estado y Operación
            if ($request->has('filtro_estadoequipo_id') && !empty($request->filtro_estadoequipo_id)) {
                $query->where('equipos.estadoequipo_id', $request->filtro_estadoequipo_id);
            }

            if ($request->has('filtro_estadom') && !empty($request->filtro_estadom)) {
                $query->where('equipos.estado_mantenimiento', $request->filtro_estadom);
            }

            // Sección 4: Clasificación Técnica
            if ($request->has('tipo_id') && !empty($request->tipo_id)) {
                $query->where('equipos.tipo_id', $request->tipo_id);
            }

            if ($request->has('estado_id') && !empty($request->estado_id)) {
                $query->where('equipos.criesgo_id', $request->estado_id);
            }

            if ($request->has('estado_id_cg') && !empty($request->estado_id_cg)) {
                $query->where('equipos.propietario_id', $request->estado_id_cg);
            }

            // Sección 5: Parámetros Temporales
            if ($request->has('anio_plan') && !empty($request->anio_plan)) {
                $query->whereYear('equipos.created_at', $request->anio_plan);
            }

            // Obtener todos los resultados
            $equipos = $query->orderBy('equipos.name')->get();

            // Crear archivo Excel usando PhpSpreadsheet
            $spreadsheet = new \PhpOffice\PhpSpreadsheet\Spreadsheet();
            $sheet = $spreadsheet->getActiveSheet();

            // Configurar encabezados
            $headers = [
                'A1' => 'ID',
                'B1' => 'Nombre del Equipo',
                'C1' => 'Código de Inventario',
                'D1' => 'Número de Serie',
                'E1' => 'Marca',
                'F1' => 'Modelo',
                'G1' => 'Servicio',
                'H1' => 'Área',
                'I1' => 'Sede',
                'J1' => 'Estado del Equipo',
                'K1' => 'Clasificación Biomédica',
                'L1' => 'Clasificación de Riesgo',
                'M1' => 'Propietario',
                'N1' => 'Tipo de Equipo',
                'O1' => 'Fecha de Registro',
                'P1' => 'Fecha de Actualización'
            ];

            foreach ($headers as $cell => $header) {
                $sheet->setCellValue($cell, $header);
                $sheet->getStyle($cell)->getFont()->setBold(true);
            }

            // Llenar datos
            $row = 2;
            foreach ($equipos as $equipo) {
                $sheet->setCellValue('A' . $row, $equipo->id);
                $sheet->setCellValue('B' . $row, $equipo->nombre_equipo);
                $sheet->setCellValue('C' . $row, $equipo->codigo_inventario);
                $sheet->setCellValue('D' . $row, $equipo->numero_serie);
                $sheet->setCellValue('E' . $row, $equipo->marca);
                $sheet->setCellValue('F' . $row, $equipo->modelo);
                $sheet->setCellValue('G' . $row, $equipo->servicio);
                $sheet->setCellValue('H' . $row, $equipo->area);
                $sheet->setCellValue('I' . $row, $equipo->sede);
                $sheet->setCellValue('J' . $row, $equipo->estado_equipo);
                $sheet->setCellValue('K' . $row, $equipo->clasificacion_biomedica);
                $sheet->setCellValue('L' . $row, $equipo->clasificacion_riesgo);
                $sheet->setCellValue('M' . $row, $equipo->propietario);
                $sheet->setCellValue('N' . $row, $equipo->tipo_equipo);
                $sheet->setCellValue('O' . $row, $equipo->fecha_registro);
                $sheet->setCellValue('P' . $row, $equipo->fecha_actualizacion);
                $row++;
            }

            // Ajustar ancho de columnas
            foreach (range('A', 'P') as $column) {
                $sheet->getColumnDimension($column)->setAutoSize(true);
            }

            // Crear el archivo
            $writer = new \PhpOffice\PhpSpreadsheet\Writer\Xlsx($spreadsheet);
            $filename = 'equipos_filtrados_' . date('Y-m-d_H-i-s') . '.xlsx';
            $tempFile = tempnam(sys_get_temp_dir(), $filename);
            $writer->save($tempFile);

            // Retornar el archivo
            return response()->download($tempFile, $filename, [
                'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Access-Control-Allow-Origin' => '*',
                'Access-Control-Allow-Methods' => 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers' => 'Content-Type, Authorization, X-Requested-With'
            ])->deleteFileAfterSend(true);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al exportar equipos: ' . $e->getMessage()
            ], 500)->header('Access-Control-Allow-Origin', '*')
                    ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
                    ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
        }
    }

    /**
     * Helper function para obtener estados de equipo con opción por defecto
     * Si la tabla estadoequipos está vacía, retorna opción "No disponible"
     */
    private function getEstadosEquipoWithDefault()
    {
        try {
            $estados = DB::table('estadoequipos')
                ->where('status', 1) // Solo estados activos
                ->get(['id', 'name'])
                ->toArray();

            // Si la tabla está vacía, retornar opción por defecto
            if (empty($estados)) {
                return [
                    (object) [
                        'id' => 1,
                        'name' => 'No disponible'
                    ]
                ];
            }

            return $estados;

        } catch (\Exception $e) {
            // En caso de error, retornar opción por defecto
            \Log::warning('Error obteniendo estados de equipo: ' . $e->getMessage());
            return [
                (object) [
                    'id' => 1,
                    'name' => 'No disponible'
                ]
            ];
        }
    }

    /**
     * Procesar manuales y planos JSON de forma robusta
     * Garantiza que los datos se procesen correctamente independientemente del formato de entrada
     */
    private function processManualesAndPlanos($request, &$equipoData)
    {
        \Log::info('DEBUG: processManualesAndPlanos called', [
            'filled_manuales' => $request->filled('manuales'),
            'filled_planos' => $request->filled('planos')
        ]);

        // Procesar MANUALES
        if ($request->filled('manuales')) {
            $manualesInput = $request->input('manuales');
            \Log::info('DEBUG: Processing manuales', [
                'input' => $manualesInput,
                'type' => gettype($manualesInput)
            ]);

            // Si es string JSON válido, usarlo directamente
            if (is_string($manualesInput)) {
                $decoded = json_decode($manualesInput, true);
                if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                    $equipoData['manual'] = $manualesInput;
                    \Log::info('DEBUG: Manuales set as JSON string', ['manual' => $equipoData['manual']]);
                } else {
                    // Si no es JSON válido, intentar crear estructura válida
                    $equipoData['manual'] = json_encode([
                        'operacion' => false,
                        'mantenimiento' => false,
                        'partes' => false,
                        'otros' => false
                    ]);
                    \Log::info('DEBUG: Manuales set as default structure', ['manual' => $equipoData['manual']]);
                }
            }
            // Si es array, convertir a JSON
            elseif (is_array($manualesInput)) {
                $equipoData['manual'] = json_encode($manualesInput);
                \Log::info('DEBUG: Manuales converted from array', ['manual' => $equipoData['manual']]);
            }
        } else {
            \Log::info('DEBUG: No manuales to process');
        }

        // Procesar PLANOS
        if ($request->filled('planos')) {
            $planosInput = $request->input('planos');

            // Si es string JSON válido, usarlo directamente
            if (is_string($planosInput)) {
                $decoded = json_decode($planosInput, true);
                if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                    $equipoData['plano'] = $planosInput;
                } else {
                    // Si no es JSON válido, intentar crear estructura válida
                    $equipoData['plano'] = json_encode([
                        'electrico' => false,
                        'electronico' => false,
                        'neumatico' => false,
                        'mecanico' => false
                    ]);
                }
            }
            // Si es array, convertir a JSON
            elseif (is_array($planosInput)) {
                $equipoData['plano'] = json_encode($planosInput);
            }
        }

        // Limpiar campos que no deben ir a la base de datos
        unset($equipoData['manuales'], $equipoData['planos']);
    }
}
