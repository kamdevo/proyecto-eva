<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Material;
use App\ConexionesVista\ResponseFormatter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class MaterialController extends Controller
{
    /**
     * Obtener listado de materiales
     */
    public function index(Request $request)
    {
        try {
            $query = Material::query();

            // Filtrado por búsqueda en código, nombre y descripción
            if ($request->has('search') && !empty($request->search)) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('codigo', 'like', "%{$search}%")
                      ->orWhere('nombre', 'like', "%{$search}%")
                      ->orWhere('descripcion', 'like', "%{$search}%");
                });
            }

            // Ordenamiento por defecto
            $sortBy = $request->get('sort_by', 'id');
            $sortOrder = $request->get('sort_order', 'desc');
            $query->orderBy($sortBy, $sortOrder);

            // Paginación
            $perPage = $request->get('per_page', 10);
            $materiales = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => [
                    'data' => $materiales->items(),
                    'current_page' => $materiales->currentPage(),
                    'per_page' => $materiales->perPage(),
                    'total' => $materiales->total(),
                    'total_pages' => $materiales->lastPage()
                ],
                'message' => 'Materiales obtenidos correctamente'
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error en MaterialController@index: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener materiales',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Crear un nuevo material
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'codigo' => 'nullable|string|max:50|unique:materiales,codigo',
            'nombre' => 'required|string|max:100',
            'descripcion' => 'nullable|string',
            'cantidad' => 'integer|min:0',
            'precio_unitario' => 'nullable|numeric|min:0'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $data = $request->all();

            // Auto-generación de código si no fue provisto
            if (empty($data['codigo'])) {
                $lastId = DB::table('materiales')->max('id');
                $nextId = $lastId ? $lastId + 1 : 1;
                $data['codigo'] = 'MAT-' . str_pad($nextId, 4, '0', STR_PAD_LEFT);
            }
            
            // Si la cantidad no fue provista, el default es 0
            if (!isset($data['cantidad'])) {
                $data['cantidad'] = 0;
            }

            $material = Material::create($data);

            return response()->json([
                'success' => true,
                'data' => $material,
                'message' => 'Material creado exitosamente'
            ], 201);

        } catch (\Exception $e) {
            Log::error('Error en MaterialController@store: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al crear material',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Actualizar material existente
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'codigo' => 'required|string|max:50|unique:materiales,codigo,'.$id,
            'nombre' => 'required|string|max:100',
            'descripcion' => 'nullable|string',
            'cantidad' => 'integer|min:0',
            'precio_unitario' => 'nullable|numeric|min:0'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $material = Material::find($id);

            if (!$material) {
                return response()->json([
                    'success' => false,
                    'message' => 'Material no encontrado'
                ], 404);
            }

            $material->update($request->all());

            return response()->json([
                'success' => true,
                'data' => $material,
                'message' => 'Material actualizado exitosamente'
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error en MaterialController@update: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar material',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Eliminar material
     */
    public function destroy($id)
    {
        try {
            $material = Material::find($id);

            if (!$material) {
                return response()->json([
                    'success' => false,
                    'message' => 'Material no encontrado'
                ], 404);
            }

            $material->delete();

            return response()->json([
                'success' => true,
                'message' => 'Material eliminado exitosamente'
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error en MaterialController@destroy: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar material',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
