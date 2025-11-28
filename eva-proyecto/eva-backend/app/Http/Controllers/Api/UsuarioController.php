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
                'password' => 'required|string',
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
            // CAMBIO: Usuarios nuevos DESACTIVADOS por defecto
            $data['estado'] = $request->get('estado', 0); // 0 = desactivado por defecto

            $usuario = Usuario::create($data);

            // NO asignar permisos al crear - solo cuando se active

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

            $estadoAnterior = $usuario->estado;
            $usuario->estado = !$usuario->estado;
            $usuario->save();

            // NUEVA LÓGICA: Si el usuario se está ACTIVANDO, asignar permisos automáticamente
            if (!$estadoAnterior && $usuario->estado) {
                // Usuario se acaba de activar (de 0 a 1)
                \Log::info("Usuario {$usuario->username} activado - Asignando permisos por defecto");
                $this->assignDefaultPermissions($usuario->id, $usuario->rol_id);
            }
            
            // Si se desactiva, opcionalmente puedes eliminar permisos
            if ($estadoAnterior && !$usuario->estado) {
                // Usuario se desactivó (de 1 a 0) - eliminar permisos
                \Log::info("Usuario {$usuario->username} desactivado - Eliminando permisos");
                DB::table('acciones')->where('usuario_id', $usuario->id)->delete();
            }

            $mensaje = $usuario->estado ? 'Usuario activado y permisos asignados' : 'Usuario desactivado y permisos eliminados';

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

    /**
     * Assign default permissions to user based on role
     */
    private function assignDefaultPermissions($userId, $rolId)
    {
        try {
            // Get all active modules
            $modulos = DB::table('modulos')->where('estado', 1)->get();
            
            // Delete existing permissions
            DB::table('acciones')->where('usuario_id', $userId)->delete();
            
            // Assign permissions based on role
            foreach ($modulos as $modulo) {
                $permissions = $this->getDefaultPermissionsByRole($rolId, $modulo->name);
                
                DB::table('acciones')->insert([
                    'usuario_id' => $userId,
                    'modulo_id' => $modulo->id,
                    'leer' => $permissions['leer'],
                    'insertar' => $permissions['insertar'],
                    'editar' => $permissions['editar'],
                    'eliminar' => $permissions['eliminar']
                ]);
            }
        } catch (\Exception $e) {
            \Log::error('Error assigning default permissions: ' . $e->getMessage());
        }
    }

    /**
     * Get default permissions by role based on roles.md specification
     */
    private function getDefaultPermissionsByRole($rolId, $moduleName)
    {
        // Role 1 (Super Admin) - Full access to everything
        if ($rolId == 1) {
            return ['leer' => 1, 'insertar' => 1, 'editar' => 1, 'eliminar' => 1];
        }
        
        // Role 4 (Basic User) - Permisos MÍNIMOS para usuarios recién activados
        // Solo lectura de equipos biomédicos, industriales y mis tickets
        if ($rolId == 4) {
            $basicUserModules = [
                'equipos' => ['leer' => 1, 'insertar' => 0, 'editar' => 0, 'eliminar' => 0],
                'equipos industriales' => ['leer' => 1, 'insertar' => 0, 'editar' => 0, 'eliminar' => 0],
                'tickets propios' => ['leer' => 1, 'insertar' => 0, 'editar' => 0, 'eliminar' => 0],
            ];
            
            return $basicUserModules[$moduleName] ?? ['leer' => 0, 'insertar' => 0, 'editar' => 0, 'eliminar' => 0];
        }
        
        // Role 3 (Advanced User) - Extended permissions
        if ($rolId == 3) {
            $advancedUserModules = [
                'equipos' => ['leer' => 1, 'insertar' => 1, 'editar' => 1, 'eliminar' => 0],
                'equipos industriales' => ['leer' => 1, 'insertar' => 1, 'editar' => 1, 'eliminar' => 0],
                'tickets propios' => ['leer' => 1, 'insertar' => 1, 'editar' => 1, 'eliminar' => 0],
                'tickets activos' => ['leer' => 1, 'insertar' => 0, 'editar' => 1, 'eliminar' => 0],
                'guias rapidas' => ['leer' => 1, 'insertar' => 1, 'editar' => 1, 'eliminar' => 0],
                'contactos' => ['leer' => 1, 'insertar' => 1, 'editar' => 1, 'eliminar' => 0],
                'repuestos' => ['leer' => 1, 'insertar' => 1, 'editar' => 1, 'eliminar' => 0],
                'capacitaciones' => ['leer' => 1, 'insertar' => 1, 'editar' => 1, 'eliminar' => 0],
                'usuarios' => ['leer' => 0, 'insertar' => 0, 'editar' => 0, 'eliminar' => 0]
            ];
            
            return $advancedUserModules[$moduleName] ?? ['leer' => 1, 'insertar' => 1, 'editar' => 1, 'eliminar' => 0];
        }
        
        // Role 2 (Administrator) - Administrative permissions
        if ($rolId == 2) {
            $adminModules = [
                'equipos' => ['leer' => 1, 'insertar' => 1, 'editar' => 1, 'eliminar' => 0],
                'equipos industriales' => ['leer' => 1, 'insertar' => 1, 'editar' => 1, 'eliminar' => 0],
                'usuarios' => ['leer' => 1, 'insertar' => 1, 'editar' => 1, 'eliminar' => 0],
                'tickets propios' => ['leer' => 1, 'insertar' => 1, 'editar' => 1, 'eliminar' => 1],
                'tickets activos' => ['leer' => 1, 'insertar' => 1, 'editar' => 1, 'eliminar' => 1],
                'reportes' => ['leer' => 1, 'insertar' => 0, 'editar' => 0, 'eliminar' => 0],
                'tickets cerrados' => ['leer' => 1, 'insertar' => 0, 'editar' => 0, 'eliminar' => 0]
            ];
            
            return $adminModules[$moduleName] ?? ['leer' => 1, 'insertar' => 1, 'editar' => 1, 'eliminar' => 0];
        }
        
        // Default: no permissions
        return ['leer' => 0, 'insertar' => 0, 'editar' => 0, 'eliminar' => 0];
    }
}
