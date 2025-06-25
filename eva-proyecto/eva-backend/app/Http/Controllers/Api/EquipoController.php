<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\BaseController;
use App\Models\Equipo;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class EquipoController extends BaseController
{
    /**
     * Searchable fields for equipment.
     */
    protected array $searchableFields = [
        'code',
        'name',
        'descripcion',
        'marca',
        'modelo',
        'serial',
    ];

    /**
     * Display a listing of equipment.
     */
        /**
     * @OA\GET(
     *     path="/api/equipos-basic",
     *     tags={"Equipos"},
     *     summary="Listar equipos básico",
     *     security={{"sanctum": {}}},
     *     @OA\Response(response=200, description="Operación exitosa"),
     *     @OA\Response(response=401, description="No autorizado"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $this->logAction('index', ['filters' => $request->all()]);

            $paginationParams = $this->getPaginationParams($request);
            $searchParams = $this->getSearchParams($request);

            $cacheKey = 'equipos:list:' . md5(serialize($request->all()));

            $equipos = $this->cacheResponse($cacheKey, function () use ($paginationParams, $searchParams) {
                $query = Equipo::with([
                    'servicio:id,name',
                    'area:id,name',
                    'tipo:id,name',
                    'estadoequipo:id,name',
                    'propietario:id,nombre'
                ]);

                $query = $this->applySearchAndFilters($query, $searchParams, $this->searchableFields);

                return $query->paginate($paginationParams['perPage']);
            }, 300); // 5 minutes cache

            return $this->paginatedResponse($equipos, 'Equipos retrieved successfully');

        } catch (\Exception $e) {
            return $this->handleException($e, 'Error retrieving equipment');
        }
    }

    /**
     * Store a newly created equipment.
     */
        /**
     * @OA\POST(
     *     path="/api/equipos-basic",
     *     tags={"Equipos"},
     *     summary="Crear equipo básico",
     *     security={{"sanctum": {}}},
     *     @OA\Response(response=200, description="Operación exitosa"),
     *     @OA\Response(response=401, description="No autorizado"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $this->logAction('store', ['request_data' => $request->except(['file', 'image'])]);

            $validatedData = $this->validateRequest($request, [
                'code' => 'required|string|max:100|unique:equipos,code',
                'name' => 'required|string|max:500',
                'descripcion' => 'nullable|string',
                'marca' => 'nullable|string|max:255',
                'modelo' => 'nullable|string|max:255',
                'serial' => 'nullable|string|max:255',
                'servicio_id' => 'required|integer|exists:servicios,id',
                'area_id' => 'required|integer|exists:areas,id',
                'tipo_id' => 'required|integer|exists:tipos,id',
                'estadoequipo_id' => 'required|integer|exists:estadoequipos,id',
                'propietario_id' => 'required|integer|exists:propietarios,id',
                'fuente_id' => 'required|integer|exists:fuenteal,id',
                'tecnologia_id' => 'required|integer|exists:tecnologiap,id',
                'frecuencia_id' => 'required|integer|exists:frecuenciam,id',
                'cbiomedica_id' => 'required|integer|exists:cbiomedica,id',
                'criesgo_id' => 'required|integer|exists:criesgo,id',
                'tadquisicion_id' => 'required|integer|exists:tadquisicion,id',
                'disponibilidad_id' => 'required|integer|exists:disponibilidad,id',
                'fecha_ad' => 'nullable|date',
                'fecha_instalacion' => 'nullable|date',
                'vida_util' => 'nullable|string|max:100',
                'costo' => 'nullable|string|max:100',
                'garantia' => 'nullable|string|max:100',
                'periodicidad' => 'nullable|string|max:100',
                'calibracion' => 'nullable|string|max:100',
                'verificacion_inventario' => 'nullable|string|max:10',
                'repuesto_pendiente' => 'nullable|string|max:10',
                'propiedad' => 'nullable|string|max:60',
                'movilidad' => 'nullable|string|max:100',
                'evaluacion_desempenio' => 'nullable|string|max:100',
            ]);

            DB::beginTransaction();

            $equipo = Equipo::create($validatedData);

            // Handle file uploads if present
            if ($request->hasFile('image')) {
                $equipo->image = $this->handleFileUpload($request->file('image'), 'equipos/images');
                $equipo->save();
            }

            if ($request->hasFile('file')) {
                $equipo->file = $this->handleFileUpload($request->file('file'), 'equipos/files');
                $equipo->save();
            }

            DB::commit();

            // Clear related cache
            $this->clearCache('equipos:*');

            $equipo->load([
                'servicio:id,name',
                'area:id,name',
                'tipo:id,name',
                'estadoequipo:id,name',
                'propietario:id,nombre'
            ]);

            return $this->successResponse($equipo, 'Equipment created successfully', 201);

        } catch (ValidationException $e) {
            DB::rollBack();
            return $this->validationErrorResponse($e);
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->handleException($e, 'Error creating equipment');
        }
    }

    /**
     * Display the specified equipment.
     */
        /**
     * @OA\GET(
     *     path="/api/equipos-basic/{id}",
     *     tags={"Equipos"},
     *     summary="Obtener equipo básico",
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
    public function show(int $id): JsonResponse
    {
        try {
            $this->logAction('show', ['equipo_id' => $id]);

            $cacheKey = "equipo:{$id}:details";

            $equipo = $this->cacheResponse($cacheKey, function () use ($id) {
                return Equipo::with([
                    'servicio:id,name',
                    'area:id,name',
                    'tipo:id,name',
                    'estadoequipo:id,name',
                    'propietario:id,nombre',
                    'mantenimientos' => function ($query) {
                        $query->latest()->limit(5);
                    },
                    'contingencias' => function ($query) {
                        $query->latest()->limit(5);
                    },
                    'calibraciones' => function ($query) {
                        $query->latest()->limit(5);
                    }
                ])->findOrFail($id);
            });

            return $this->successResponse($equipo, 'Equipment retrieved successfully');

        } catch (\Exception $e) {
            return $this->handleException($e, 'Equipment not found');
        }
    }

    /**
     * Update the specified equipment.
     */
        /**
     * @OA\PUT(
     *     path="/api/equipos-basic/{id}",
     *     tags={"Equipos"},
     *     summary="Actualizar equipo básico",
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
    public function update(Request $request, int $id): JsonResponse
    {
        try {
            $this->logAction('update', ['equipo_id' => $id, 'request_data' => $request->except(['file', 'image'])]);

            $equipo = Equipo::findOrFail($id);

            $validatedData = $this->validateRequest($request, [
                'code' => 'sometimes|required|string|max:100|unique:equipos,code,' . $id,
                'name' => 'sometimes|required|string|max:500',
                'descripcion' => 'nullable|string',
                'marca' => 'nullable|string|max:255',
                'modelo' => 'nullable|string|max:255',
                'serial' => 'nullable|string|max:255',
                'servicio_id' => 'sometimes|required|integer|exists:servicios,id',
                'area_id' => 'sometimes|required|integer|exists:areas,id',
                'tipo_id' => 'sometimes|required|integer|exists:tipos,id',
                'estadoequipo_id' => 'sometimes|required|integer|exists:estadoequipos,id',
                'propietario_id' => 'sometimes|required|integer|exists:propietarios,id',
                'fuente_id' => 'sometimes|required|integer|exists:fuenteal,id',
                'tecnologia_id' => 'sometimes|required|integer|exists:tecnologiap,id',
                'frecuencia_id' => 'sometimes|required|integer|exists:frecuenciam,id',
                'cbiomedica_id' => 'sometimes|required|integer|exists:cbiomedica,id',
                'criesgo_id' => 'sometimes|required|integer|exists:criesgo,id',
                'tadquisicion_id' => 'sometimes|required|integer|exists:tadquisicion,id',
                'disponibilidad_id' => 'sometimes|required|integer|exists:disponibilidad,id',
                'fecha_ad' => 'nullable|date',
                'fecha_instalacion' => 'nullable|date',
                'vida_util' => 'nullable|string|max:100',
                'costo' => 'nullable|string|max:100',
                'garantia' => 'nullable|string|max:100',
                'periodicidad' => 'nullable|string|max:100',
                'calibracion' => 'nullable|string|max:100',
                'verificacion_inventario' => 'nullable|string|max:10',
                'repuesto_pendiente' => 'nullable|string|max:10',
                'propiedad' => 'nullable|string|max:60',
                'movilidad' => 'nullable|string|max:100',
                'evaluacion_desempenio' => 'nullable|string|max:100',
            ]);

            DB::beginTransaction();

            $equipo->update($validatedData);

            // Handle file uploads if present
            if ($request->hasFile('image')) {
                $equipo->image = $this->handleFileUpload($request->file('image'), 'equipos/images');
                $equipo->save();
            }

            if ($request->hasFile('file')) {
                $equipo->file = $this->handleFileUpload($request->file('file'), 'equipos/files');
                $equipo->save();
            }

            DB::commit();

            // Clear related cache
            $this->clearCache('equipos:*');

            $equipo->load([
                'servicio:id,name',
                'area:id,name',
                'tipo:id,name',
                'estadoequipo:id,name',
                'propietario:id,nombre'
            ]);

            return $this->successResponse($equipo, 'Equipment updated successfully');

        } catch (ValidationException $e) {
            DB::rollBack();
            return $this->validationErrorResponse($e);
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->handleException($e, 'Error updating equipment');
        }
    }

    /**
     * Remove the specified equipment.
     */
        /**
     * @OA\DELETE(
     *     path="/api/equipos-basic/{id}",
     *     tags={"Equipos"},
     *     summary="Eliminar equipo básico",
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
    public function destroy(int $id): JsonResponse
    {
        try {
            $this->logAction('destroy', ['equipo_id' => $id]);

            $equipo = Equipo::findOrFail($id);

            DB::beginTransaction();

            $equipo->delete();

            DB::commit();

            // Clear related cache
            $this->clearCache('equipos:*');

            return $this->successResponse(null, 'Equipment deleted successfully');

        } catch (\Exception $e) {
            DB::rollBack();
            return $this->handleException($e, 'Error deleting equipment');
        }
    }

    /**
     * Handle file upload.
     */
    private function handleFileUpload($file, string $directory): string
    {
        $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
        $file->storeAs($directory, $filename, 'public');
        return $directory . '/' . $filename;
    }
}
