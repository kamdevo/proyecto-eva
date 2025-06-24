<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\ConexionesVista\ApiController;
use App\ConexionesVista\ResponseFormatter;
use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends ApiController
{
    /**
     * Login de usuario
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return ResponseFormatter::validation($validator->errors());
        }

        try {
            // Buscar usuario por username o email
            $usuario = Usuario::where('username', $request->username)
                ->orWhere('email', $request->username)
                ->first();

            if (!$usuario || !Hash::check($request->password, $usuario->password)) {
                return ResponseFormatter::unauthorized('Credenciales incorrectas');
            }

            if (!$usuario->estado) {
                return ResponseFormatter::unauthorized('Usuario inactivo');
            }

            // Crear token
            $token = $usuario->createToken('eva-token')->plainTextToken;

            $response = [
                'user' => $usuario,
                'token' => $token,
                'token_type' => 'Bearer'
            ];

            return ResponseFormatter::success($response, 'Login exitoso');
        } catch (\Exception $e) {
            return ResponseFormatter::error('Error en el login: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Registro de usuario
     */
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nombre' => 'required|string|max:100',
            'apellido' => 'nullable|string|max:100',
            'telefono' => 'nullable|string|max:20',
            'email' => 'required|email|unique:usuarios,email',
            'username' => 'required|string|unique:usuarios,username|max:45',
            'password' => 'required|string|min:6|confirmed',
            'centro_id' => 'nullable|string|max:100',
            'id_empresa' => 'nullable|integer',
        ]);

        if ($validator->fails()) {
            return ResponseFormatter::validation($validator->errors());
        }

        try {
            $usuario = Usuario::create([
                'nombre' => $request->nombre,
                'apellido' => $request->apellido,
                'telefono' => $request->telefono,
                'email' => $request->email,
                'username' => $request->username,
                'password' => Hash::make($request->password),
                'rol_id' => 4, // Rol por defecto (usuario)
                'centro_id' => $request->centro_id,
                'id_empresa' => $request->id_empresa ?? 0,
                'estado' => 1, // Activo
                'sede_id' => '1', // Sede por defecto
                'anio_plan' => date('Y')
            ]);

            $token = $usuario->createToken('eva-token')->plainTextToken;

            $response = [
                'user' => $usuario,
                'token' => $token,
                'token_type' => 'Bearer'
            ];

            return ResponseFormatter::success($response, 'Usuario registrado exitosamente', 201);
        } catch (\Exception $e) {
            return ResponseFormatter::error('Error en el registro: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Logout de usuario
     */
    public function logout(Request $request)
    {
        try {
            $request->user()->currentAccessToken()->delete();
            return ResponseFormatter::success(null, 'Logout exitoso');
        } catch (\Exception $e) {
            return ResponseFormatter::error('Error en el logout: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Obtener usuario autenticado
     */
    public function user(Request $request)
    {
        try {
            $usuario = $request->user()->load(['zonasUsuario']);
            return ResponseFormatter::success($usuario, 'Usuario obtenido exitosamente');
        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener usuario: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Obtener perfil de usuario
     */
    public function profile(Request $request)
    {
        try {
            $usuario = $request->user()->load(['zonasUsuario', 'equiposAsignados', 'mantenimientosAsignados']);
            return ResponseFormatter::success($usuario, 'Perfil obtenido exitosamente');
        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener perfil: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Actualizar perfil de usuario
     */
    public function updateProfile(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nombre' => 'sometimes|required|string|max:100',
            'apellido' => 'nullable|string|max:100',
            'telefono' => 'nullable|string|max:20',
            'email' => 'sometimes|required|email|unique:usuarios,email,' . $request->user()->id,
        ]);

        if ($validator->fails()) {
            return ResponseFormatter::validation($validator->errors());
        }

        try {
            $usuario = $request->user();
            $usuario->update($request->only(['nombre', 'apellido', 'telefono', 'email']));

            return ResponseFormatter::success($usuario, 'Perfil actualizado exitosamente');
        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al actualizar perfil: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Cambiar contraseña
     */
    public function changePassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:6|confirmed',
        ]);

        if ($validator->fails()) {
            return ResponseFormatter::validation($validator->errors());
        }

        try {
            $usuario = $request->user();

            if (!Hash::check($request->current_password, $usuario->password)) {
                return ResponseFormatter::error('Contraseña actual incorrecta', 400);
            }

            $usuario->update([
                'password' => Hash::make($request->new_password)
            ]);

            return ResponseFormatter::success(null, 'Contraseña cambiada exitosamente');
        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al cambiar contraseña: ' . $e->getMessage(), 500);
        }
    }
}
