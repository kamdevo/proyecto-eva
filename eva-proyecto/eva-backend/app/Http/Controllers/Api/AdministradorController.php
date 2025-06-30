<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\ConexionesVista\ApiController;
use App\ConexionesVista\ResponseFormatter;
use App\Models\Usuario;
use App\Models\UsuarioZona;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AdministradorController extends ApiController
{
    /**
     * Obtener lista de usuarios
     */
        /**
     * @OA\GET(
     *     path="/api/administradores",
     *     tags={"Administradores"},
     *     summary="Listar administradores",
     *     security={{"sanctum": {}}},
     *     @OA\Response(response=200, description="Operación exitosa"),
     *     @OA\Response(response=401, description="No autorizado"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     */
        /**
     * @OA\GET(
     *     path="/api/administradores",
     *     tags={"Administradores"},
     *     summary="Listar administradores",
     *     security={{"sanctum": {}}},
     *     @OA\Response(response=200, description="Operación exitosa"),
     *     @OA\Response(response=401, description="No autorizado"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     */
    public function index(Request $request)
    {
        try {
            $usuarios = Usuario::with(['zonasUsuario'])
                ->when($request->search, function ($query, $search) {
                    return $query->where('nombre', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('username', 'like', "%{$search}%");
                })
                ->when($request->rol, function ($query, $rol) {
                    return $query->where('rol', $rol);
                })
                ->paginate($request->per_page ?? 10);

            return ResponseFormatter::success($usuarios, 'Usuarios obtenidos exitosamente');
        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener usuarios: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Crear nuevo usuario
     */
        /**
     * @OA\POST(
     *     path="/api/administradores",
     *     tags={"Administradores"},
     *     summary="Crear nuevo administrador",
     *     security={{"sanctum": {}}},
     *     @OA\Response(response=200, description="Operación exitosa"),
     *     @OA\Response(response=401, description="No autorizado"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     */
        /**
     * @OA\POST(
     *     path="/api/administradores",
     *     tags={"Administradores"},
     *     summary="Crear nuevo administrador",
     *     security={{"sanctum": {}}},
     *     @OA\Response(response=200, description="Operación exitosa"),
     *     @OA\Response(response=401, description="No autorizado"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nombre' => 'required|string|max:255',
            'apellidos' => 'nullable|string|max:255',
            'telefono' => 'nullable|string|max:20',
            'email' => 'required|email|unique:usuarios,email',
            'username' => 'required|string|unique:usuarios,username|max:255',
            'password' => 'required|string|min:6',
            'rol' => 'required|in:administrador,admin,usuario',
            'centro_costo' => 'nullable|string|max:255',
            'empresa' => 'nullable|string|max:255',
            'permissions' => 'nullable|array'
        ]);

        if ($validator->fails()) {
            return ResponseFormatter::validation($validator->errors());
        }

        try {
            $usuario = Usuario::create([
                'nombre' => $request->nombre,
                'apellidos' => $request->apellidos,
                'telefono' => $request->telefono,
                'email' => $request->email,
                'username' => $request->username,
                'password' => Hash::make($request->password),
                'rol' => $request->rol,
                'centro_costo' => $request->centro_costo,
                'empresa' => $request->empresa,
                'permissions' => $request->permissions ?? [],
                'cambio_clave' => false,
                'activo' => true
            ]);

            return ResponseFormatter::success($usuario, 'Usuario creado exitosamente', 201);
        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al crear usuario: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Obtener usuario específico
     */
        /**
     * @OA\GET(
     *     path="/api/administradores/{id}",
     *     tags={"Administradores"},
     *     summary="Obtener administrador específico",
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
        /**
     * @OA\GET(
     *     path="/api/administradores/{id}",
     *     tags={"Administradores"},
     *     summary="Obtener administrador específico",
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
    public function show(string $id)
    {
        try {
            $usuario = Usuario::with(['zonasUsuario'])->findOrFail($id);
            return ResponseFormatter::success($usuario, 'Usuario obtenido exitosamente');
        } catch (\Exception $e) {
            return ResponseFormatter::notFound('Usuario no encontrado');
        }
    }

    /**
     * Actualizar usuario
     */
        /**
     * @OA\PUT(
     *     path="/api/administradores/{id}",
     *     tags={"Administradores"},
     *     summary="Actualizar administrador",
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
        /**
     * @OA\PUT(
     *     path="/api/administradores/{id}",
     *     tags={"Administradores"},
     *     summary="Actualizar administrador",
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
    public function update(Request $request, string $id)
    {
        $validator = Validator::make($request->all(), [
            'nombre' => 'sometimes|required|string|max:255',
            'apellidos' => 'nullable|string|max:255',
            'telefono' => 'nullable|string|max:20',
            'email' => 'sometimes|required|email|unique:usuarios,email,' . $id,
            'username' => 'sometimes|required|string|unique:usuarios,username,' . $id . '|max:255',
            'password' => 'nullable|string|min:6',
            'rol' => 'sometimes|required|in:administrador,admin,usuario',
            'centro_costo' => 'nullable|string|max:255',
            'empresa' => 'nullable|string|max:255',
            'permissions' => 'nullable|array'
        ]);

        if ($validator->fails()) {
            return ResponseFormatter::validation($validator->errors());
        }

        try {
            $usuario = Usuario::findOrFail($id);

            $updateData = $request->only([
                'nombre', 'apellidos', 'telefono', 'email', 'username',
                'rol', 'centro_costo', 'empresa', 'permissions'
            ]);

            if ($request->password) {
                $updateData['password'] = Hash::make($request->password);
            }

            $usuario->update($updateData);

            return ResponseFormatter::success($usuario, 'Usuario actualizado exitosamente');
        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al actualizar usuario: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Eliminar usuario
     */
        /**
     * @OA\DELETE(
     *     path="/api/administradores/{id}",
     *     tags={"Administradores"},
     *     summary="Eliminar administrador",
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
        /**
     * @OA\DELETE(
     *     path="/api/administradores/{id}",
     *     tags={"Administradores"},
     *     summary="Eliminar administrador",
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
    public function destroy(string $id)
    {
        try {
            $usuario = Usuario::findOrFail($id);
            $usuario->delete();

            return ResponseFormatter::success(null, 'Usuario eliminado exitosamente');
        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al eliminar usuario: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Obtener relaciones zona-usuario
     */
    public function getZoneRelations()
    {
        try {
            $relations = UsuarioZona::with(['usuario'])
                ->get()
                ->map(function ($relation) {
                    return [
                        'id' => $relation->id,
                        'nombre_zona' => $relation->nombre_zona,
                        'nombre_usuario' => $relation->usuario->nombre ?? 'N/A',
                        'correo_electronico' => $relation->correo_electronico ?? $relation->usuario->email ?? 'N/A'
                    ];
                });

            return ResponseFormatter::success($relations, 'Relaciones zona-usuario obtenidas exitosamente');
        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener relaciones: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Crear relación zona-usuario
     */
    public function createZoneRelation(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'usuario_id' => 'required|exists:usuarios,id',
            'nombre_zona' => 'required|string|max:255',
            'correo_electronico' => 'nullable|email'
        ]);

        if ($validator->fails()) {
            return ResponseFormatter::validation($validator->errors());
        }

        try {
            $relation = UsuarioZona::create([
                'usuario_id' => $request->usuario_id,
                'nombre_zona' => $request->nombre_zona,
                'correo_electronico' => $request->correo_electronico,
                'activo' => true
            ]);

            return ResponseFormatter::success($relation, 'Relación zona-usuario creada exitosamente', 201);
        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al crear relación: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Eliminar relación zona-usuario
     */
    public function deleteZoneRelation(string $id)
    {
        try {
            $relation = UsuarioZona::findOrFail($id);
            $relation->delete();

            return ResponseFormatter::success(null, 'Relación eliminada exitosamente');
        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al eliminar relación: ' . $e->getMessage(), 500);
        }
    }
}
