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
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Log;

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
            // Rate limiting key
            $key = 'login:' . $request->ip();

            // Check rate limit
            if (RateLimiter::tooManyAttempts($key, 5)) {
                $seconds = RateLimiter::availableIn($key);

                Log::channel('security')->warning('Login rate limit exceeded', [
                    'ip' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                    'attempts' => RateLimiter::attempts($key),
                ]);

                return ResponseFormatter::error(
                    'Demasiados intentos de login. Intente nuevamente en ' . $seconds . ' segundos.',
                    429
                );
            }

            // Buscar usuario por username o email
            $usuario = Usuario::where('username', $request->username)
                ->orWhere('email', $request->username)
                ->first();

            if (!$usuario || !Hash::check($request->password, $usuario->password)) {
                RateLimiter::hit($key, 300); // 5 minutes lockout

                Log::channel('security')->warning('Failed login attempt', [
                    'username' => $request->username,
                    'ip' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                ]);

                return ResponseFormatter::unauthorized('Credenciales incorrectas');
            }

            if (!$usuario->estado || $usuario->active !== 'true') {
                Log::channel('security')->warning('Inactive user login attempt', [
                    'user_id' => $usuario->id,
                    'username' => $usuario->username,
                    'ip' => $request->ip(),
                ]);

                return ResponseFormatter::unauthorized('Usuario inactivo');
            }

            // Clear rate limit on successful login
            RateLimiter::clear($key);

            // Crear token con expiración
            $tokenName = 'eva-token-' . now()->timestamp;
            $token = $usuario->createToken($tokenName, ['*'], now()->addHours(24))->plainTextToken;

            // Log successful login
            Log::channel('audit')->info('User logged in', [
                'user_id' => $usuario->id,
                'username' => $usuario->username,
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            $response = [
                'user' => [
                    'id' => $usuario->id,
                    'nombre' => $usuario->nombre,
                    'apellido' => $usuario->apellido,
                    'email' => $usuario->email,
                    'username' => $usuario->username,
                    'rol' => $usuario->rol?->nombre,
                    'servicio' => $usuario->servicio?->name,
                ],
                'token' => $token,
                'token_type' => 'Bearer',
                'expires_at' => now()->addHours(24)->toISOString(),
            ];

            return ResponseFormatter::success($response, 'Login exitoso');
        } catch (\Exception $e) {
            // Log del error sin exponer información sensible
            Log::error('Login error', [
                'username' => $request->username,
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'error' => $e->getMessage(),
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
            $user = $request->user();

            // Revoke current token
            $request->user()->currentAccessToken()->delete();

            // Log logout
            Log::channel('audit')->info('User logged out', [
                'user_id' => $user->id,
                'username' => $user->username,
                'ip' => $request->ip(),
            ]);

            return ResponseFormatter::success(null, 'Logout exitoso');
        } catch (\Exception $e) {
            Log::error('Logout error', [
                'error' => $e->getMessage(),
                'user_id' => $request->user()?->id,
                'ip' => $request->ip(),
            ]);

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
