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
     * Obtener lista de equipos con filtros y paginación
     */
    public function index(Request $request)
    {
        try {
            $query = Equipo::with([
                'servicio:id,name',
                'area:id,name', 
                'propietario:id,name',
                'fuenteAlimentacion:id,name',
                'tecnologia:id,name',
                'frecuenciaMantenimiento:id,name',
                'clasificacionBiomedica:id,name',
                'clasificacionRiesgo:id,name',
                'estadoEquipo:id,name'
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
     * Crear nuevo equipo
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
                'servicio:id,name',
                'area:id,name',
                'propietario:id,name',
                'fuenteAlimentacion:id,name',
                'tecnologia:id,name',
                'frecuenciaMantenimiento:id,name',
                'clasificacionBiomedica:id,name',
                'clasificacionRiesgo:id,name',
                'estadoEquipo:id,name'
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
     * Mostrar equipo específico
     */
    public function show($id)
    {
        try {
            $equipo = Equipo::with([
                'servicio:id,name',
                'area:id,name',
                'propietario:id,name',
                'fuenteAlimentacion:id,name',
                'tecnologia:id,name',
                'frecuenciaMantenimiento:id,name',
                'clasificacionBiomedica:id,name',
                'clasificacionRiesgo:id,name',
                'estadoEquipo:id,name',
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
                'servicio:id,name',
                'area:id,name',
                'propietario:id,name',
                'fuenteAlimentacion:id,name',
                'tecnologia:id,name',
                'frecuenciaMantenimiento:id,name',
                'clasificacionBiomedica:id,name',
                'clasificacionRiesgo:id,name',
                'estadoEquipo:id,name'
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
}