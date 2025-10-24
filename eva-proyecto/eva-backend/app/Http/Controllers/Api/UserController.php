<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Helpers\ResponseFormatter;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Exception;

/**
 * Controlador UserController - API Empresarial
 * 
 * Controlador optimizado para la gestión de User
 * con funcionalidades empresariales completas.
 * 
 * @package App\Http\Controllers\Api
 * @author Sistema EVA
 * @version 2.0.0
 */
class UserController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/user",
     *     tags={"User"},
     *     summary="Listar users",
     *     security={{"sanctum": {}}},
     *     @OA\Response(response=200, description="Lista obtenida exitosamente")
     * )
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'page' => 'nullable|integer|min:1',
                'per_page' => 'nullable|integer|min:1|max:100',
                'search' => 'nullable|string|max:255'
            ]);

            $query = User::query();

            if ($request->search) {
                $query->where(function($q) use ($request) {
                    $q->where('name', 'LIKE', "%{$request->search}%")
                      ->orWhere('nombre', 'LIKE', "%{$request->search}%")
                      ->orWhere('descripcion', 'LIKE', "%{$request->search}%");
                });
            }

            $data = $query->orderBy('created_at', 'desc')
                          ->paginate($request->per_page ?? 15);

            return ResponseFormatter::success($data, 'Lista obtenida exitosamente');

        } catch (Exception $e) {
            Log::error('Error en UserController::index', ['error' => $e->getMessage()]);
            return ResponseFormatter::error(null, 'Error al obtener lista', 500);
        }
    }

    /**
     * @OA\Post(
     *     path="/api/user",
     *     tags={"User"},
     *     summary="Crear user",
     *     security={{"sanctum": {}}},
     *     @OA\Response(response=201, description="Creado exitosamente")
     * )
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'name' => 'required|string|max:255',
                'descripcion' => 'nullable|string|max:1000',
                'activo' => 'nullable|boolean'
            ]);

            $data = $request->all();
            $data['usuario_id'] = auth()->id();

            $item = User::create($data);

            return ResponseFormatter::success($item, 'Creado exitosamente', 201);

        } catch (Exception $e) {
            Log::error('Error en UserController::store', ['error' => $e->getMessage()]);
            return ResponseFormatter::error(null, 'Error al crear', 500);
        }
    }

    /**
     * @OA\Get(
     *     path="/api/user/{id}",
     *     tags={"User"},
     *     summary="Obtener user",
     *     security={{"sanctum": {}}},
     *     @OA\Response(response=200, description="Obtenido exitosamente")
     * )
     */
    public function show($id): JsonResponse
    {
        try {
            $item = User::findOrFail($id);
            return ResponseFormatter::success($item, 'Obtenido exitosamente');

        } catch (Exception $e) {
            Log::error('Error en UserController::show', ['error' => $e->getMessage()]);
            return ResponseFormatter::error(null, 'No encontrado', 404);
        }
    }

    /**
     * @OA\Put(
     *     path="/api/user/{id}",
     *     tags={"User"},
     *     summary="Actualizar user",
     *     security={{"sanctum": {}}},
     *     @OA\Response(response=200, description="Actualizado exitosamente")
     * )
     */
    public function update(Request $request, $id): JsonResponse
    {
        try {
            // Validación robusta de datos
            $validator = Validator::make($request->all(), [
                'nombre' => 'nullable|string|max:255',
                'apellido' => 'nullable|string|max:255',
                'telefono' => 'nullable|string|max:20',
                'email' => 'nullable|email|max:255',
                'username' => 'nullable|string|max:100|unique:usuarios,username,' . $id,
                'password' => 'nullable|string|min:6',
                'rol_id' => 'nullable|integer|exists:roles,id',
                'estado' => 'nullable|in:0,1',
                'servicio_id' => 'nullable|integer',
                'centro_id' => 'nullable|integer',
                'sede_id' => 'nullable|string|max:10',
                'zona_id' => 'nullable|integer',
                'anio_plan' => 'nullable|integer',
                'id_empresa' => 'nullable|integer',
                'active' => 'nullable|string|in:true,false',
                'permisos' => 'nullable|array',
                'permisos.*' => 'integer'
            ]);

            if ($validator->fails()) {
                return ResponseFormatter::error($validator->errors(), 'Datos de validación incorrectos', 422);
            }

            // Verificar que el usuario existe
            $usuario = DB::table('usuarios')->where('id', $id)->first();
            if (!$usuario) {
                return ResponseFormatter::error(null, 'Usuario no encontrado', 404);
            }

            // Preparar datos para actualización
            $updateData = [];
            $validFields = ['nombre', 'apellido', 'telefono', 'email', 'username', 'rol_id', 'estado', 'servicio_id', 'centro_id', 'sede_id', 'zona_id', 'anio_plan', 'id_empresa', 'active'];

            foreach ($validFields as $field) {
                if ($request->has($field) && $request->get($field) !== null) {
                    $updateData[$field] = $request->get($field);
                }
            }

            // Manejo especial de contraseña
            if ($request->has('password') && !empty($request->password)) {
                $updateData['password'] = Hash::make($request->password);
                Log::info("Actualizando contraseña para usuario ID: $id");
            }

            $updateData['updated_at'] = now();

            // Actualizar usuario con consulta directa
            $updated = DB::table('usuarios')
                ->where('id', $id)
                ->update($updateData);

            if (!$updated) {
                return ResponseFormatter::error(null, 'No se pudo actualizar el usuario', 500);
            }

            // Actualizar permisos individuales del usuario si se proporcionan
            if ($request->has('permisos') && is_array($request->permisos)) {
                // Eliminar permisos existentes del usuario
                DB::table('acciones')->where('usuario_id', $id)->delete();
                
                // Insertar nuevos permisos individuales para el usuario
                $permisos = [];
                foreach ($request->permisos as $moduloId) {
                    $permisos[] = [
                        'usuario_id' => $id,
                        'modulo_id' => $moduloId,
                        'leer' => 1,
                        'insertar' => 1,
                        'editar' => 1,
                        'eliminar' => 0
                    ];
                }
                
                if (!empty($permisos)) {
                    DB::table('acciones')->insert($permisos);
                }
                
                Log::info("Permisos individuales actualizados para usuario ID: $id", ['permisos' => $request->permisos]);
            }

            // Obtener usuario actualizado con relaciones
            $usuarioActualizado = DB::table('usuarios')
                ->leftJoin('roles', 'usuarios.rol_id', '=', 'roles.id')
                ->leftJoin('servicios', 'usuarios.servicio_id', '=', 'servicios.id')
                ->leftJoin('zonas', 'usuarios.zona_id', '=', 'zonas.id')
                ->select(
                    'usuarios.*',
                    'roles.nombre as rol_nombre',
                    'servicios.nombre as servicio_nombre',
                    'zonas.nombre as zona_nombre'
                )
                ->where('usuarios.id', $id)
                ->first();

            // Obtener permisos individuales del usuario
            $permisos = DB::table('acciones')
                ->join('modulos', 'acciones.modulo_id', '=', 'modulos.id')
                ->where('acciones.usuario_id', $id)
                ->select('modulos.id', 'modulos.name as nombre', 'acciones.leer', 'acciones.insertar', 'acciones.editar', 'acciones.eliminar')
                ->get();

            $usuarioActualizado->permisos = $permisos;

            Log::info("Usuario actualizado exitosamente", ['user_id' => $id, 'updated_fields' => array_keys($updateData)]);

            return ResponseFormatter::success($usuarioActualizado, 'Usuario actualizado exitosamente');

        } catch (Exception $e) {
            Log::error('Error en UserController::update', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'user_id' => $id,
                'request_data' => $request->all()
            ]);
            return ResponseFormatter::error(null, 'Error al actualizar usuario: ' . $e->getMessage(), 500);
        }
    }

    /**
     * @OA\Delete(
     *     path="/api/user/{id}",
     *     tags={"User"},
     *     summary="Eliminar user",
     *     security={{"sanctum": {}}},
     *     @OA\Response(response=200, description="Eliminado exitosamente")
     * )
     */
    public function destroy($id): JsonResponse
    {
        try {
            $item = User::findOrFail($id);
            $item->delete();

            return ResponseFormatter::success(null, 'Eliminado exitosamente');

        } catch (Exception $e) {
            Log::error('Error en UserController::destroy', ['error' => $e->getMessage()]);
            return ResponseFormatter::error(null, 'Error al eliminar', 500);
        }
    }
}
