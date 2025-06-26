<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Usuario;
use App\ConexionesVista\ResponseFormatter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

/**
 * Controlador para gestión de usuarios
 * Maneja operaciones CRUD para la tabla usuarios
 */
class UsuarioController extends Controller
{
    /**
     * Listar todos los usuarios
     */
    public function index(Request $request)
    {
        try {
            $query = Usuario::query();

            // Filtros
            if ($request->has('search')) {
                $search = $request->get('search');
                $query->where(function($q) use ($search) {
                    $q->where('nombre', 'LIKE', "%{$search}%")
                      ->orWhere('apellido', 'LIKE', "%{$search}%")
                      ->orWhere('email', 'LIKE', "%{$search}%")
                      ->orWhere('username', 'LIKE', "%{$search}%");
                });
            }

            if ($request->has('estado')) {
                $query->where('estado', $request->get('estado'));
            }

            if ($request->has('rol_id')) {
                $query->where('rol_id', $request->get('rol_id'));
            }

            if ($request->has('servicio_id')) {
                $query->where('servicio_id', $request->get('servicio_id'));
            }

            // Paginación
            $perPage = $request->get('per_page', 15);
            $usuarios = $query->with(['rol', 'servicio'])
                             ->orderBy('nombre')
                             ->paginate($perPage);

            return ResponseFormatter::success($usuarios, 'Usuarios obtenidos exitosamente');

        } catch (\Exception $e) {
            return ResponseFormatter::error(null, 'Error al obtener usuarios: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Crear nuevo usuario
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'nombre' => 'required|string|max:255',
                'apellido' => 'required|string|max:255',
                'email' => 'required|email|unique:usuarios,email',
                'username' => 'required|string|unique:usuarios,username',
                'password' => 'required|string|min:6',
                'rol_id' => 'required|integer',
                'telefono' => 'nullable|string|max:20',
                'servicio_id' => 'nullable|integer',
                'centro_id' => 'nullable|string',
                'zona_id' => 'nullable|integer'
            ]);

            if ($validator->fails()) {
                return ResponseFormatter::error($validator->errors(), 'Datos de validación incorrectos', 422);
            }

            $data = $request->all();
            $data['password'] = Hash::make($request->password);
            $data['estado'] = $request->get('estado', 1);

            $usuario = Usuario::create($data);

            return ResponseFormatter::success($usuario, 'Usuario creado exitosamente', 201);

        } catch (\Exception $e) {
            return ResponseFormatter::error(null, 'Error al crear usuario: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Mostrar usuario específico
     */
    public function show($id)
    {
        try {
            $usuario = Usuario::with(['rol', 'servicio', 'zona'])->find($id);

            if (!$usuario) {
                return ResponseFormatter::error(null, 'Usuario no encontrado', 404);
            }

            return ResponseFormatter::success($usuario, 'Usuario obtenido exitosamente');

        } catch (\Exception $e) {
            return ResponseFormatter::error(null, 'Error al obtener usuario: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Actualizar usuario
     */
    public function update(Request $request, $id)
    {
        try {
            $usuario = Usuario::find($id);

            if (!$usuario) {
                return ResponseFormatter::error(null, 'Usuario no encontrado', 404);
            }

            $validator = Validator::make($request->all(), [
                'nombre' => 'sometimes|required|string|max:255',
                'apellido' => 'sometimes|required|string|max:255',
                'email' => 'sometimes|required|email|unique:usuarios,email,' . $id,
                'username' => 'sometimes|required|string|unique:usuarios,username,' . $id,
                'password' => 'sometimes|string|min:6',
                'rol_id' => 'sometimes|required|integer',
                'telefono' => 'nullable|string|max:20',
                'servicio_id' => 'nullable|integer',
                'centro_id' => 'nullable|string',
                'zona_id' => 'nullable|integer',
                'estado' => 'sometimes|boolean'
            ]);

            if ($validator->fails()) {
                return ResponseFormatter::error($validator->errors(), 'Datos de validación incorrectos', 422);
            }

            $data = $request->all();
            
            if ($request->has('password')) {
                $data['password'] = Hash::make($request->password);
            }

            $usuario->update($data);

            return ResponseFormatter::success($usuario, 'Usuario actualizado exitosamente');

        } catch (\Exception $e) {
            return ResponseFormatter::error(null, 'Error al actualizar usuario: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Eliminar usuario
     */
    public function destroy($id)
    {
        try {
            $usuario = Usuario::find($id);

            if (!$usuario) {
                return ResponseFormatter::error(null, 'Usuario no encontrado', 404);
            }

            $usuario->delete();

            return ResponseFormatter::success(null, 'Usuario eliminado exitosamente');

        } catch (\Exception $e) {
            return ResponseFormatter::error(null, 'Error al eliminar usuario: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Cambiar estado del usuario
     */
    public function toggleStatus($id)
    {
        try {
            $usuario = Usuario::find($id);

            if (!$usuario) {
                return ResponseFormatter::error(null, 'Usuario no encontrado', 404);
            }

            $usuario->estado = !$usuario->estado;
            $usuario->save();

            $mensaje = $usuario->estado ? 'Usuario activado' : 'Usuario desactivado';

            return ResponseFormatter::success($usuario, $mensaje);

        } catch (\Exception $e) {
            return ResponseFormatter::error(null, 'Error al cambiar estado: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Obtener estadísticas de usuarios
     */
    public function stats()
    {
        try {
            $stats = [
                'total' => Usuario::count(),
                'activos' => Usuario::where('estado', 1)->count(),
                'inactivos' => Usuario::where('estado', 0)->count(),
                'por_rol' => Usuario::select('rol_id', DB::raw('count(*) as total'))
                                  ->groupBy('rol_id')
                                  ->with('rol')
                                  ->get(),
                'por_servicio' => Usuario::select('servicio_id', DB::raw('count(*) as total'))
                                        ->whereNotNull('servicio_id')
                                        ->groupBy('servicio_id')
                                        ->with('servicio')
                                        ->get()
            ];

            return ResponseFormatter::success($stats, 'Estadísticas obtenidas exitosamente');

        } catch (\Exception $e) {
            return ResponseFormatter::error(null, 'Error al obtener estadísticas: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Buscar usuarios
     */
    public function search(Request $request)
    {
        try {
            $query = $request->get('q');
            
            if (!$query) {
                return ResponseFormatter::error(null, 'Parámetro de búsqueda requerido', 400);
            }

            $usuarios = Usuario::where('nombre', 'LIKE', "%{$query}%")
                              ->orWhere('apellido', 'LIKE', "%{$query}%")
                              ->orWhere('email', 'LIKE', "%{$query}%")
                              ->orWhere('username', 'LIKE', "%{$query}%")
                              ->with(['rol', 'servicio'])
                              ->limit(10)
                              ->get();

            return ResponseFormatter::success($usuarios, 'Búsqueda completada');

        } catch (\Exception $e) {
            return ResponseFormatter::error(null, 'Error en búsqueda: ' . $e->getMessage(), 500);
        }
    }
}
