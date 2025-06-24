<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\ConexionesVista\ApiController;
use App\ConexionesVista\ResponseFormatter;
use App\Models\Usuario;
use Illuminate\Http\Request;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends ApiController
{
    /**
     * @OA\Post(
     *     path="/login",
     *     tags={"Autenticación"},
     *     summary="Iniciar sesión",
     *     description="Autentica un usuario y devuelve un token de acceso",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"username","password"},
     *             @OA\Property(property="username", type="string", example="admin@hospital.com"),
     *             @OA\Property(property="password", type="string", example="password123")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Login exitoso",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Login exitoso"),
     *             @OA\Property(
     *                 property="data",
     *                 type="object",
     *                 @OA\Property(property="user", ref="#/components/schemas/User"),
     *                 @OA\Property(property="token", type="string", example="1|abc123def456...")
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Credenciales inválidas",
     *         @OA\JsonContent(ref="#/components/schemas/ApiResponse")
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Error de validación",
     *         @OA\JsonContent(ref="#/components/schemas/ValidationError")
     *     )
     * )
     *
     * Login de usuario
     */
    public function login(LoginRequest $request)
    {
        // Las validaciones ya están manejadas por el FormRequest

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
            // Log del error sin exponer información sensible
            \Log::warning('Intento de login fallido', [
                'username' => $request->username,
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'timestamp' => now()
            ]);

            return ResponseFormatter::error('Error en el proceso de autenticación', 500);
        }
    }

    /**
     * Registro de usuario
     */
    public function register(RegisterRequest $request)
    {
        // Las validaciones ya están manejadas por el FormRequest

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
            // Log del error sin exponer información sensible
            \Log::error('Error en registro de usuario', [
                'email' => $request->email,
                'username' => $request->username,
                'ip' => $request->ip(),
                'error' => $e->getMessage()
            ]);

            return ResponseFormatter::error('Error en el proceso de registro', 500);
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
