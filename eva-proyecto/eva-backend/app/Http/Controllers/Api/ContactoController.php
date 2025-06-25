<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\ConexionesVista\ApiController;
use App\ConexionesVista\ResponseFormatter;
use App\Models\Contacto;
use App\Models\Equipo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

/**
 * Controlador completo para gestión de contactos
 * Maneja contactos de equipos, proveedores y técnicos
 */
class ContactoController extends ApiController
{
    /**
     * Obtener lista paginada de contactos
     */
        /**
     * @OA\GET(
     *     path="/api/contactos",
     *     tags={"Contactos"},
     *     summary="Listar contactos",
     *     security={{"sanctum": {}}},
     *     @OA\Response(response=200, description="Operación exitosa"),
     *     @OA\Response(response=401, description="No autorizado"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     */
    public function index(Request $request)
    {
        try {
            $query = Contacto::with(['equipo']);

            // Aplicar filtros
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('nombre', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%")
                      ->orWhere('telefono', 'like', "%{$search}%")
                      ->orWhere('empresa', 'like', "%{$search}%");
                });
            }

            if ($request->has('tipo')) {
                $query->where('tipo', $request->tipo);
            }

            if ($request->has('equipo_id')) {
                $query->where('equipo_id', $request->equipo_id);
            }

            if ($request->has('activo')) {
                $query->where('activo', $request->activo);
            }

            // Ordenamiento
            $sortBy = $request->get('sort_by', 'nombre');
            $sortOrder = $request->get('sort_order', 'asc');
            $query->orderBy($sortBy, $sortOrder);

            // Paginación
            $perPage = $request->get('per_page', 10);
            $contactos = $query->paginate($perPage);

            return $this->paginatedResponse($contactos, 'Contactos obtenidos exitosamente');

        } catch (\Exception $e) {
            return $this->errorResponse('Error al obtener contactos: ' . $e->getMessage());
        }
    }

    /**
     * Crear nuevo contacto
     */
        /**
     * @OA\POST(
     *     path="/api/contactos",
     *     tags={"Contactos"},
     *     summary="Crear nuevo contacto",
     *     security={{"sanctum": {}}},
     *     @OA\Response(response=200, description="Operación exitosa"),
     *     @OA\Response(response=401, description="No autorizado"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'nombre' => 'required|string|max:255',
                'email' => 'nullable|email|max:255',
                'telefono' => 'nullable|string|max:20',
                'celular' => 'nullable|string|max:20',
                'empresa' => 'nullable|string|max:255',
                'cargo' => 'nullable|string|max:255',
                'direccion' => 'nullable|string',
                'tipo' => 'required|string|in:proveedor,tecnico,soporte,comercial,administrativo',
                'equipo_id' => 'nullable|integer|exists:equipos,id',
                'observaciones' => 'nullable|string',
                'activo' => 'boolean'
            ]);

            if ($validator->fails()) {
                return $this->validationErrorResponse($validator->errors());
            }

            DB::beginTransaction();

            $contacto = Contacto::create([
                'nombre' => $request->nombre,
                'email' => $request->email,
                'telefono' => $request->telefono,
                'celular' => $request->celular,
                'empresa' => $request->empresa,
                'cargo' => $request->cargo,
                'direccion' => $request->direccion,
                'tipo' => $request->tipo,
                'equipo_id' => $request->equipo_id,
                'observaciones' => $request->observaciones,
                'activo' => $request->get('activo', true)
            ]);

            DB::commit();

            return $this->successResponse($contacto->load('equipo'), 'Contacto creado exitosamente', 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Error al crear contacto: ' . $e->getMessage());
        }
    }

    /**
     * Mostrar contacto específico
     */
        /**
     * @OA\GET(
     *     path="/api/contactos/{id}",
     *     tags={"Contactos"},
     *     summary="Obtener contacto específico",
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
            $contacto = Contacto::with(['equipo'])->find($id);

            if (!$contacto) {
                return $this->notFoundResponse('Contacto no encontrado');
            }

            return $this->successResponse($contacto, 'Contacto obtenido exitosamente');

        } catch (\Exception $e) {
            return $this->errorResponse('Error al obtener contacto: ' . $e->getMessage());
        }
    }

    /**
     * Actualizar contacto
     */
        /**
     * @OA\PUT(
     *     path="/api/contactos/{id}",
     *     tags={"Contactos"},
     *     summary="Actualizar contacto",
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
        try {
            $contacto = Contacto::find($id);

            if (!$contacto) {
                return $this->notFoundResponse('Contacto no encontrado');
            }

            $validator = Validator::make($request->all(), [
                'nombre' => 'required|string|max:255',
                'email' => 'nullable|email|max:255',
                'telefono' => 'nullable|string|max:20',
                'celular' => 'nullable|string|max:20',
                'empresa' => 'nullable|string|max:255',
                'cargo' => 'nullable|string|max:255',
                'direccion' => 'nullable|string',
                'tipo' => 'required|string|in:proveedor,tecnico,soporte,comercial,administrativo',
                'equipo_id' => 'nullable|integer|exists:equipos,id',
                'observaciones' => 'nullable|string',
                'activo' => 'boolean'
            ]);

            if ($validator->fails()) {
                return $this->validationErrorResponse($validator->errors());
            }

            DB::beginTransaction();

            $contacto->update([
                'nombre' => $request->nombre,
                'email' => $request->email,
                'telefono' => $request->telefono,
                'celular' => $request->celular,
                'empresa' => $request->empresa,
                'cargo' => $request->cargo,
                'direccion' => $request->direccion,
                'tipo' => $request->tipo,
                'equipo_id' => $request->equipo_id,
                'observaciones' => $request->observaciones,
                'activo' => $request->get('activo', $contacto->activo)
            ]);

            DB::commit();

            return $this->successResponse($contacto->load('equipo'), 'Contacto actualizado exitosamente');

        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Error al actualizar contacto: ' . $e->getMessage());
        }
    }

    /**
     * Eliminar contacto
     */
        /**
     * @OA\DELETE(
     *     path="/api/contactos/{id}",
     *     tags={"Contactos"},
     *     summary="Eliminar contacto",
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
            $contacto = Contacto::find($id);

            if (!$contacto) {
                return $this->notFoundResponse('Contacto no encontrado');
            }

            DB::beginTransaction();
            $contacto->delete();
            DB::commit();

            return $this->successResponse(null, 'Contacto eliminado exitosamente');

        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Error al eliminar contacto: ' . $e->getMessage());
        }
    }

    /**
     * Obtener contactos por tipo
     */
    public function porTipo($tipo)
    {
        try {
            $contactos = Contacto::where('tipo', $tipo)
                ->where('activo', true)
                ->with(['equipo'])
                ->orderBy('nombre')
                ->get();

            return $this->successResponse($contactos, "Contactos de tipo {$tipo} obtenidos");

        } catch (\Exception $e) {
            return $this->errorResponse('Error al obtener contactos por tipo: ' . $e->getMessage());
        }
    }

    /**
     * Obtener contactos de un equipo
     */
    public function porEquipo($equipoId)
    {
        try {
            $equipo = Equipo::find($equipoId);

            if (!$equipo) {
                return $this->notFoundResponse('Equipo no encontrado');
            }

            $contactos = Contacto::where('equipo_id', $equipoId)
                ->where('activo', true)
                ->orderBy('tipo')
                ->orderBy('nombre')
                ->get();

            return $this->successResponse($contactos, 'Contactos del equipo obtenidos');

        } catch (\Exception $e) {
            return $this->errorResponse('Error al obtener contactos del equipo: ' . $e->getMessage());
        }
    }

    /**
     * Cambiar estado activo/inactivo
     */
    public function toggleStatus($id)
    {
        try {
            $contacto = Contacto::find($id);

            if (!$contacto) {
                return $this->notFoundResponse('Contacto no encontrado');
            }

            DB::beginTransaction();
            $contacto->activo = !$contacto->activo;
            $contacto->save();
            DB::commit();

            $status = $contacto->activo ? 'activado' : 'desactivado';
            return $this->successResponse($contacto, "Contacto {$status} exitosamente");

        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Error al cambiar estado: ' . $e->getMessage());
        }
    }

    /**
     * Obtener estadísticas de contactos
     */
    public function estadisticas()
    {
        try {
            $stats = [
                'total' => Contacto::count(),
                'activos' => Contacto::where('activo', true)->count(),
                'inactivos' => Contacto::where('activo', false)->count(),
                'por_tipo' => Contacto::groupBy('tipo')
                    ->selectRaw('tipo, count(*) as total')
                    ->pluck('total', 'tipo'),
                'con_email' => Contacto::whereNotNull('email')->count(),
                'con_telefono' => Contacto::whereNotNull('telefono')->count(),
                'por_empresa' => Contacto::whereNotNull('empresa')
                    ->groupBy('empresa')
                    ->selectRaw('empresa, count(*) as total')
                    ->orderBy('total', 'desc')
                    ->limit(10)
                    ->pluck('total', 'empresa')
            ];

            return $this->successResponse($stats, 'Estadísticas obtenidas exitosamente');

        } catch (\Exception $e) {
            return $this->errorResponse('Error al obtener estadísticas: ' . $e->getMessage());
        }
    }

    /**
     * Buscar contactos
     */
    public function buscar(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'query' => 'required|string|min:2',
                'tipo' => 'nullable|string',
                'limit' => 'nullable|integer|min:1|max:50'
            ]);

            if ($validator->fails()) {
                return $this->validationErrorResponse($validator->errors());
            }

            $query = Contacto::where('activo', true);
            $searchTerm = $request->query;

            $query->where(function($q) use ($searchTerm) {
                $q->where('nombre', 'like', "%{$searchTerm}%")
                  ->orWhere('email', 'like', "%{$searchTerm}%")
                  ->orWhere('empresa', 'like', "%{$searchTerm}%");
            });

            if ($request->has('tipo')) {
                $query->where('tipo', $request->tipo);
            }

            $limit = $request->get('limit', 20);
            $contactos = $query->limit($limit)->get();

            return $this->successResponse($contactos, 'Búsqueda completada');

        } catch (\Exception $e) {
            return $this->errorResponse('Error en la búsqueda: ' . $e->getMessage());
        }
    }
}
