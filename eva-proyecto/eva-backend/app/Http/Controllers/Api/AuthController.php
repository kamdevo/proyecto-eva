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
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use App\Mail\ConfirmacionCuentaEmail;

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

            // Verificar contraseña - soporta Bcrypt, MD5 y texto plano (NO modifica la BD)
            $passwordValid = false;
            if ($usuario) {
                // Intentar Bcrypt (formato Laravel)
                try {
                    $passwordValid = Hash::check($request->password, $usuario->password);
                } catch (\Exception $e) {
                    $passwordValid = false;
                }

                // Si no es Bcrypt, verificar MD5
                if (!$passwordValid && $usuario->password === md5($request->password)) {
                    $passwordValid = true;
                }

                // Si no es MD5, verificar texto plano
                if (!$passwordValid && $usuario->password === $request->password) {
                    $passwordValid = true;
                }
            }

            if (!$usuario || !$passwordValid) {
                RateLimiter::hit($key, 300); // 5 minutes lockout

                Log::channel('security')->warning('Failed login attempt', [
                    'username' => $request->username,
                    'ip' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                ]);

                return ResponseFormatter::unauthorized('Credenciales incorrectas');
            }

            if (!$usuario->estado) {
                Log::channel('security')->warning('Disabled user login attempt', [
                    'user_id' => $usuario->id,
                    'username' => $usuario->username,
                    'ip' => $request->ip(),
                ]);

                return ResponseFormatter::unauthorized('Usuario deshabilitado. Contacta al administrador.');
            }
            
            if ($usuario->active !== 'true') {
                Log::channel('security')->info('Unverified user login attempt', [
                    'user_id' => $usuario->id,
                    'username' => $usuario->username,
                    'email' => $usuario->email,
                    'ip' => $request->ip(),
                ]);

                return ResponseFormatter::error('Cuenta pendiente de verificación. Por favor, revisa tu correo electrónico y confirma tu cuenta.', 403);
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

            // Cargar permisos del usuario
            $permisos = $this->getUserPermissionsForLogin($usuario->id);

            // Debug: Log permissions for troubleshooting
            Log::info('Login permissions loaded', [
                'user_id' => $usuario->id,
                'role_id' => $usuario->rol_id,
                'permissions_count' => count($permisos),
                'permissions' => $permisos
            ]);

            $response = [
                'user' => [
                    'id' => $usuario->id,
                    'nombre' => $usuario->nombre,
                    'apellido' => $usuario->apellido,
                    'email' => $usuario->email,
                    'username' => $usuario->username,
                    'rol' => $usuario->rol?->nombre,
                    'rol_id' => $usuario->rol_id,
                    'servicio' => $usuario->servicio?->name,
                    'permissions' => $permisos,
                ],
                'token' => $token,
                'token_type' => 'Bearer',
                'expires_at' => now()->addHours(24)->toISOString(),
            ];

            // Return response directly to match the expected format
            return response()->json([
                'success' => true,
                'message' => 'Login exitoso - UPDATED VERSION',
                'user' => [
                    'id' => $usuario->id,
                    'nombre' => $usuario->nombre,
                    'apellido' => $usuario->apellido,
                    'email' => $usuario->email,
                    'username' => $usuario->username,
                    'rol' => $usuario->rol?->nombre,
                    'rol_id' => $usuario->rol_id,
                    'servicio' => $usuario->servicio?->name,
                    'permissions' => $permisos,
                    'debug_permissions_count' => count($permisos),
                ],
                'token' => $token,
                'token_type' => 'Bearer',
                'expires_at' => now()->addHours(24)->toISOString(),
            ], 200);
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
            DB::beginTransaction();
            
            // Crear usuario con cuenta PENDIENTE de verificación
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
                'anio_plan' => date('Y'),
                'active' => 'false' // ⚠️ CUENTA PENDIENTE DE VERIFICACIÓN
            ]);

            // Crear permisos por defecto para usuario normal
            $this->createDefaultPermissions($usuario->id);

            // Generar token de verificación único
            $verificationToken = Str::random(64);
            
            // Guardar token en tabla email_verifications
            DB::table('email_verifications')->insert([
                'usuario_id' => $usuario->id,
                'token' => $verificationToken,
                'email' => $usuario->email,
                'expires_at' => now()->addHours(24), // Expira en 24 horas
                'created_at' => now(),
                'updated_at' => now()
            ]);

            // ✅ COMMIT ANTES de enviar email (asegurar que registro sea exitoso)
            DB::commit();
            
            // Enviar email de confirmación
            $emailSent = false;
            try {
                Mail::to($usuario->email)->send(new ConfirmacionCuentaEmail($usuario, $verificationToken));
                Log::info('Email de confirmación enviado a: ' . $usuario->email);
                $emailSent = true;
            } catch (\Exception $mailError) {
                Log::error('Error enviando email de confirmación: ' . $mailError->getMessage(), [
                    'usuario_id' => $usuario->id,
                    'email' => $usuario->email,
                    'error' => $mailError->getMessage()
                ]);
                // No fallar el registro si falla el email, solo loguearlo
            }

            // Respuesta sin token de sesión (debe verificar email primero)
            $response = [
                'user' => [
                    'id' => $usuario->id,
                    'nombre' => $usuario->nombre,
                    'apellido' => $usuario->apellido,
                    'email' => $usuario->email,
                    'username' => $usuario->username,
                ],
                'message' => $emailSent 
                    ? 'Cuenta creada exitosamente. Por favor, revisa tu correo electrónico para confirmar tu cuenta.'
                    : 'Cuenta creada exitosamente. El email de confirmación no pudo ser enviado. Contacta al administrador para activar tu cuenta.',
                'email_sent' => $emailSent,
                'verification_required' => true
            ];

            return ResponseFormatter::success($response, 'Usuario registrado. Verifica tu email para activar la cuenta.', 201);
            
        } catch (\Exception $e) {
            DB::rollBack();
            
            // Log del error sin exponer información sensible
            Log::error('Error en registro de usuario', [
                'email' => $request->email,
                'username' => $request->username,
                'ip' => $request->ip(),
                'error' => $e->getMessage()
            ]);

            return ResponseFormatter::error('Error en el proceso de registro', 500);
        }
    }

    /**
     * Verificar email con token
     */
    public function verifyEmail($token)
    {
        try {
            // Buscar token de verificación
            $verification = DB::table('email_verifications')
                ->where('token', $token)
                ->whereNull('verified_at')
                ->first();

            if (!$verification) {
                return ResponseFormatter::error('Token de verificación inválido o ya utilizado', 400);
            }

            // Verificar si el token ha expirado
            if (now()->gt($verification->expires_at)) {
                return ResponseFormatter::error('El token de verificación ha expirado. Solicita uno nuevo.', 400);
            }

            // Activar cuenta del usuario
            DB::table('usuarios')
                ->where('id', $verification->usuario_id)
                ->update(['active' => 'true']);

            // Marcar token como verificado
            DB::table('email_verifications')
                ->where('id', $verification->id)
                ->update(['verified_at' => now()]);

            // Obtener usuario verificado
            $usuario = Usuario::find($verification->usuario_id);

            Log::info('Email verificado exitosamente', [
                'usuario_id' => $usuario->id,
                'email' => $usuario->email
            ]);

            return ResponseFormatter::success([
                'user' => [
                    'id' => $usuario->id,
                    'nombre' => $usuario->nombre,
                    'apellido' => $usuario->apellido,
                    'email' => $usuario->email,
                    'username' => $usuario->username,
                ],
                'verified' => true
            ], 'Cuenta verificada exitosamente. Ya puedes iniciar sesión.');

        } catch (\Exception $e) {
            Log::error('Error en verificación de email: ' . $e->getMessage());
            return ResponseFormatter::error('Error al verificar el email', 500);
        }
    }

    /**
     * Reenviar email de verificación
     */
    public function resendVerification(Request $request)
    {
        try {
            $request->validate([
                'email' => 'required|email'
            ]);

            // Buscar usuario
            $usuario = Usuario::where('email', $request->email)->first();

            if (!$usuario) {
                return ResponseFormatter::error('No existe una cuenta con ese email', 404);
            }

            // Verificar si ya está activo
            if ($usuario->active === 'true') {
                return ResponseFormatter::error('Esta cuenta ya ha sido verificada', 400);
            }

            // Eliminar tokens antiguos de este usuario
            DB::table('email_verifications')
                ->where('usuario_id', $usuario->id)
                ->delete();

            // Generar nuevo token
            $verificationToken = Str::random(64);

            // Guardar nuevo token
            DB::table('email_verifications')->insert([
                'usuario_id' => $usuario->id,
                'token' => $verificationToken,
                'email' => $usuario->email,
                'expires_at' => now()->addHours(24),
                'created_at' => now(),
                'updated_at' => now()
            ]);

            // Enviar email
            try {
                Mail::to($usuario->email)->send(new ConfirmacionCuentaEmail($usuario, $verificationToken));
                Log::info('Email de verificación reenviado a: ' . $usuario->email);
            } catch (\Exception $mailError) {
                Log::error('Error reenviando email: ' . $mailError->getMessage());
                return ResponseFormatter::error('Error al enviar el email', 500);
            }

            return ResponseFormatter::success([
                'email_sent' => true
            ], 'Email de verificación enviado. Revisa tu correo.');

        } catch (\Exception $e) {
            Log::error('Error reenviando verificación: ' . $e->getMessage());
            return ResponseFormatter::error('Error al reenviar la verificación', 500);
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
            // El middleware auth:sanctum ya validó el token
            $usuario = $request->user();
            
            if (!$usuario) {
                Log::warning('Usuario no encontrado después de autenticación válida');
                return ResponseFormatter::error('Usuario no encontrado', 401);
            }
            
            // CARGAR RELACIONES NECESARIAS (especialmente 'rol' para el sidebar)
            $usuario->load(['rol', 'servicio', 'zona']);
            
            Log::info('Usuario obtenido exitosamente con relaciones', [
                'user_id' => $usuario->id,
                'rol_loaded' => $usuario->rol ? 'YES' : 'NO',
                'rol_name' => $usuario->rol?->nombre
            ]);
            
            return ResponseFormatter::success($usuario, 'Usuario obtenido exitosamente');
            
        } catch (\Exception $e) {
            Log::error('Error inesperado al obtener usuario autenticado', [
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return ResponseFormatter::error('Error interno del servidor', 500);
        }
    }

    /**
     * Obtener perfil de usuario
     */
    public function profile(Request $request)
    {
        try {
            $usuario = $request->user(); // Sin cargar relaciones
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

    /**
     * refreshToken
     * Método generado automáticamente para corregir referencias de rutas
     */
    public function refreshToken(Request $request)
    {
        try {
            // TODO: Implementar lógica específica para refreshToken
            
            return ResponseFormatter::success(
                [],
                'Método refreshToken ejecutado correctamente (pendiente implementación)',
                200
            );
            
        } catch (Exception $e) {
            Log::error('Error en AuthController::refreshToken', [
                'error' => $e->getMessage(),
                'request' => $request->all()
            ]);
            
            return ResponseFormatter::error(
                null,
                'Error ejecutando refreshToken: ' . $e->getMessage(),
                500
            );
        }
    }


    /**
     * forgotPassword
     * Método generado automáticamente para corregir referencias de rutas
     */
    public function forgotPassword(Request $request)
    {
        try {
            // TODO: Implementar lógica específica para forgotPassword
            
            return ResponseFormatter::success(
                [],
                'Método forgotPassword ejecutado correctamente (pendiente implementación)',
                200
            );
            
        } catch (Exception $e) {
            Log::error('Error en AuthController::forgotPassword', [
                'error' => $e->getMessage(),
                'request' => $request->all()
            ]);
            
            return ResponseFormatter::error(
                null,
                'Error ejecutando forgotPassword: ' . $e->getMessage(),
                500
            );
        }
    }


    /**
     * resetPassword
     * Método generado automáticamente para corregir referencias de rutas
     */
    public function resetPassword(Request $request)
    {
        try {
            // TODO: Implementar lógica específica para resetPassword
            
            return ResponseFormatter::success(
                [],
                'Método resetPassword ejecutado correctamente (pendiente implementación)',
                200
            );
            
        } catch (Exception $e) {
            Log::error('Error en AuthController::resetPassword', [
                'error' => $e->getMessage(),
                'request' => $request->all()
            ]);
            
            return ResponseFormatter::error(
                null,
                'Error ejecutando resetPassword: ' . $e->getMessage(),
                500
            );
        }
    }

    /**
     * Obtener permisos del usuario para incluir en la respuesta de login
     *
     * @param int $userId
     * @return array
     */
    private function getUserPermissionsForLogin(int $userId): array
    {
        try {
            Log::info('getUserPermissions called', ['user_id' => $userId]);

            // Obtener información del usuario para verificar si es Super Admin
            $usuario = DB::table('usuarios')->where('id', $userId)->first();

            Log::info('User data retrieved', [
                'user_id' => $userId,
                'user_found' => !!$usuario,
                'role_id' => $usuario ? $usuario->rol_id : null
            ]);

            // Si es Super Administrador (Role ID 1), dar acceso completo a todos los módulos
            if ($usuario && $usuario->rol_id == 1) {
                Log::info('Super Administrator detected, granting full permissions', [
                    'user_id' => $userId,
                    'role_id' => $usuario->rol_id
                ]);

                // Crear permisos completos para módulos comunes
                $fullPermissions = [
                    'equipos' => [
                        'leer' => true,
                        'insertar' => true,
                        'editar' => true,
                        'eliminar' => true,
                    ],
                    'usuarios' => [
                        'leer' => true,
                        'insertar' => true,
                        'editar' => true,
                        'eliminar' => true,
                    ],
                    'mantenimiento' => [
                        'leer' => true,
                        'insertar' => true,
                        'editar' => true,
                        'eliminar' => true,
                    ],
                    'reportes' => [
                        'leer' => true,
                        'insertar' => true,
                        'editar' => true,
                        'eliminar' => true,
                    ],
                    'configuracion' => [
                        'leer' => true,
                        'insertar' => true,
                        'editar' => true,
                        'eliminar' => true,
                    ]
                ];

                Log::info('Full permissions granted', ['permissions_count' => count($fullPermissions)]);
                return $fullPermissions;
            }

            // Para otros usuarios, cargar permisos específicos desde la tabla acciones
            $permisos = DB::table('acciones')
                ->join('modulos', 'acciones.modulo_id', '=', 'modulos.id')
                ->where('acciones.usuario_id', $userId)
                ->select([
                    'modulos.name as modulo',
                    'acciones.leer',
                    'acciones.insertar',
                    'acciones.editar',
                    'acciones.eliminar'
                ])
                ->get();

            Log::info('Regular user permissions loaded', [
                'user_id' => $userId,
                'permissions_count' => $permisos->count()
            ]);

            // Convertir a formato más fácil de usar en el frontend
            $permissionsArray = [];
            foreach ($permisos as $permiso) {
                $permissionsArray[$permiso->modulo] = [
                    'leer' => (bool) $permiso->leer,
                    'insertar' => (bool) $permiso->insertar,
                    'editar' => (bool) $permiso->editar,
                    'eliminar' => (bool) $permiso->eliminar,
                ];
            }

            Log::info('Permissions array being returned', [
                'user_id' => $userId,
                'permissions' => $permissionsArray,
                'modules_with_read' => array_filter($permissionsArray, function($p) { return $p['leer']; })
            ]);

            return $permissionsArray;
        } catch (\Exception $e) {
            Log::error('Error loading user permissions', [
                'user_id' => $userId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return [];
        }
    }

    /**
     * Crear permisos por defecto para un usuario normal (rol_id = 4)
     *
     * @param int $userId
     * @return void
     */
    private function createDefaultPermissions(int $userId): void
    {
        try {
            // Permisos por defecto MÍNIMOS para usuarios recién activados
            // Solo acceso de lectura a equipos biomédicos, industriales y mis tickets
            $defaultPermissions = [
                'equipos' => ['leer' => 1, 'insertar' => 0, 'editar' => 0, 'eliminar' => 0],
                'equipos industriales' => ['leer' => 1, 'insertar' => 0, 'editar' => 0, 'eliminar' => 0],
                'tickets propios' => ['leer' => 1, 'insertar' => 0, 'editar' => 0, 'eliminar' => 0],
                'usuarios' => ['leer' => 0, 'insertar' => 0, 'editar' => 0, 'eliminar' => 0],
                'servicios' => ['leer' => 0, 'insertar' => 0, 'editar' => 0, 'eliminar' => 0],
                'bajas equipos biomedicos' => ['leer' => 0, 'insertar' => 0, 'editar' => 0, 'eliminar' => 0],
                'invimas' => ['leer' => 0, 'insertar' => 0, 'editar' => 0, 'eliminar' => 0],
                'soportes compra' => ['leer' => 0, 'insertar' => 0, 'editar' => 0, 'eliminar' => 0],
                'repuestos' => ['leer' => 0, 'insertar' => 0, 'editar' => 0, 'eliminar' => 0],
                'estado equipos' => ['leer' => 0, 'insertar' => 0, 'editar' => 0, 'eliminar' => 0],
                'contactos' => ['leer' => 0, 'insertar' => 0, 'editar' => 0, 'eliminar' => 0],
                'reportes' => ['leer' => 0, 'insertar' => 0, 'editar' => 0, 'eliminar' => 0],
                'planes mantenimiento' => ['leer' => 0, 'insertar' => 0, 'editar' => 0, 'eliminar' => 0],
                'capacitaciones' => ['leer' => 0, 'insertar' => 0, 'editar' => 0, 'eliminar' => 0],
                'equipo archivos' => ['leer' => 0, 'insertar' => 0, 'editar' => 0, 'eliminar' => 0],
                'tickets activos' => ['leer' => 0, 'insertar' => 0, 'editar' => 0, 'eliminar' => 0],
                'tickets cerrados' => ['leer' => 0, 'insertar' => 0, 'editar' => 0, 'eliminar' => 0],
                'observaciones' => ['leer' => 0, 'insertar' => 0, 'editar' => 0, 'eliminar' => 0],
                'areas' => ['leer' => 0, 'insertar' => 0, 'editar' => 0, 'eliminar' => 0],
                'contingencias' => ['leer' => 0, 'insertar' => 0, 'editar' => 0, 'eliminar' => 0],
                'guias rapidas' => ['leer' => 0, 'insertar' => 0, 'editar' => 0, 'eliminar' => 0],
                'manuales' => ['leer' => 0, 'insertar' => 0, 'editar' => 0, 'eliminar' => 0],
            ];

            foreach ($defaultPermissions as $moduleName => $permissions) {
                // Obtener el ID del módulo
                $modulo = DB::table('modulos')->where('name', $moduleName)->first();

                if ($modulo) {
                    DB::table('acciones')->insert([
                        'usuario_id' => $userId,
                        'modulo_id' => $modulo->id,
                        'leer' => $permissions['leer'],
                        'insertar' => $permissions['insertar'],
                        'editar' => $permissions['editar'],
                        'eliminar' => $permissions['eliminar'],
                    ]);
                }
            }

            Log::info('Default permissions created for user', ['user_id' => $userId]);
        } catch (\Exception $e) {
            Log::error('Error creating default permissions', [
                'user_id' => $userId,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Actualizar contraseña del usuario autenticado
     */
    public function updatePassword(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'current_password' => 'required|string',
                'new_password' => 'required|string|min:6',
                'new_password_confirmation' => 'required|string|same:new_password'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validación fallida',
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = Auth::user();

            // Verificar contraseña actual
            if (!Hash::check($request->current_password, $user->password)) {
                return response()->json([
                    'success' => false,
                    'message' => 'La contraseña actual es incorrecta'
                ], 401);
            }

            // Actualizar contraseña
            $user->password = Hash::make($request->new_password);
            $user->save();

            Log::info('Password updated successfully', ['user_id' => $user->id]);

            return response()->json([
                'success' => true,
                'message' => 'Contraseña actualizada exitosamente'
            ]);

        } catch (\Exception $e) {
            Log::error('Error updating password', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar la contraseña'
            ], 500);
        }
    }

    /**
     * Actualizar sede preferida del usuario autenticado
     */
    public function updateSede(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'sede_preferida' => 'required|string|in:Todo,Sede principal,Sede norte'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validación fallida',
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = Auth::user();
            $user->sede_preferida = $request->sede_preferida;
            $user->save();

            Log::info('Sede updated successfully', [
                'user_id' => $user->id,
                'sede' => $request->sede_preferida
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Sede actualizada exitosamente',
                'data' => [
                    'sede_preferida' => $user->sede_preferida
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Error updating sede', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar la sede'
            ], 500);
        }
    }

    /**
     * Obtener permisos del usuario autenticado (self-permissions)
     */
    public function getAuthUserPermissions(Request $request)
    {
        try {
            $user = $request->user();
            
            if (!$user) {
                return ResponseFormatter::error('Usuario no autenticado', 401);
            }
            
            Log::info('getAuthUserPermissions API called', [
                'user_id' => $user->id,
                'role_id' => $user->rol_id
            ]);
            
            // Usar el método privado existente
            $permissions = $this->getUserPermissionsForLogin($user->id);
            
            Log::info('getAuthUserPermissions API response', [
                'user_id' => $user->id,
                'permissions_count' => count($permissions)
            ]);
            
            return ResponseFormatter::success($permissions, 'Permisos obtenidos correctamente');
            
        } catch (\Exception $e) {
            Log::error('Error getting user permissions', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id()
            ]);
            
            return ResponseFormatter::error('Error al obtener permisos: ' . $e->getMessage(), 500);
        }
    }

}
