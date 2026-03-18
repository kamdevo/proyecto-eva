<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TipoMantenimiento;
use App\Helpers\ResponseFormatter;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Exception;

class TipoMantenimientoController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        try {
            $query = TipoMantenimiento::query()
                ->whereNull('id_padre')
                ->with('subcategories');

            if ($request->search) {
                $query->where(function($q) use ($request) {
                    $q->where('nombre', 'LIKE', "%{$request->search}%")
                      ->orWhere('codigo', 'LIKE', "%{$request->search}%");
                });
            }

            $types = $query->orderBy('id', 'desc')->get();

            return ResponseFormatter::success($types, 'Tipos de mantenimiento obtenidos');
        } catch (Exception $e) {
            Log::error('Error en TipoMantenimientoController::index: ' . $e->getMessage());
            return ResponseFormatter::error(null, 'Error al obtener los tipos de mantenimiento', 500);
        }
    }

    public function store(Request $request): JsonResponse
    {
        DB::beginTransaction();
        try {
            $request->validate([
                'codigo' => 'required|string|max:100|unique:tipos_mantenimientos,codigo',
                'nombre' => 'required|string|max:100',
                'subcategories' => 'nullable|array'
            ]);

            $mainType = TipoMantenimiento::create([
                'codigo' => $request->codigo,
                'nombre' => $request->nombre,
                'id_padre' => null
            ]);

            if ($request->has('subcategories') && is_array($request->subcategories)) {
                foreach ($request->subcategories as $subName) {
                    TipoMantenimiento::create([
                        'codigo' => $mainType->codigo . '-' . strtoupper(substr(uniqid(), -4)),
                        'nombre' => $subName,
                        'id_padre' => $mainType->id
                    ]);
                }
            }

            DB::commit();
            return ResponseFormatter::success($mainType->load('subcategories'), 'Tipo de mantenimiento creado correctamente', 201);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Error en TipoMantenimientoController::store: ' . $e->getMessage());
            return ResponseFormatter::error(null, 'Error al crear el tipo de mantenimiento', 500);
        }
    }

    public function update(Request $request, $id): JsonResponse
    {
        DB::beginTransaction();
        try {
            $mainType = TipoMantenimiento::findOrFail($id);

            $request->validate([
                'nombre' => 'required|string|max:100',
                'subcategories' => 'nullable|array'
            ]);

            $mainType->update([
                'nombre' => $request->nombre
            ]);

            if ($request->has('subcategories') && is_array($request->subcategories)) {
                $mainType->subcategories()->delete();
                foreach ($request->subcategories as $subName) {
                    TipoMantenimiento::create([
                        'codigo' => $mainType->codigo . '-' . strtoupper(substr(uniqid(), -4)),
                        'nombre' => $subName,
                        'id_padre' => $mainType->id
                    ]);
                }
            }

            DB::commit();
            return ResponseFormatter::success($mainType->load('subcategories'), 'Tipo de mantenimiento actualizado correctamente');
        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Error en TipoMantenimientoController::update: ' . $e->getMessage());
            return ResponseFormatter::error(null, 'Error al actualizar el tipo de mantenimiento', 500);
        }
    }

    public function destroy($id): JsonResponse
    {
        try {
            $mainType = TipoMantenimiento::findOrFail($id);
            $mainType->delete();

            return ResponseFormatter::success(null, 'Tipo de mantenimiento eliminado correctamente');
        } catch (Exception $e) {
            Log::error('Error en TipoMantenimientoController::destroy: ' . $e->getMessage());
            return ResponseFormatter::error(null, 'Error al eliminar el tipo de mantenimiento', 500);
        }
    }
}
