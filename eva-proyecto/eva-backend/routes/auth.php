<?php

/**
 * Rutas API - auth
 * 
 * Archivo de rutas optimizado para el sistema EVA
 * con middleware de seguridad empresarial completo.
 * 
 * Middleware aplicado:
 * - auth:sanctum: Autenticación requerida
 * - throttle:60,1: Rate limiting (60 requests por minuto)
 * - cors: Cross-Origin Resource Sharing
 * - api.version: Versionado de API
 * - verified: Verificación de email (donde aplique)
 * 
 * @package EVA
 * @version 2.0.0
 * @author Sistema EVA
 */

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AdministradorController;
use App\Http\Controllers\Api\UsuarioController;

// La función getDefaultPermissionsByRole está definida en api.php

/*
|--------------------------------------------------------------------------
| Authentication Routes
|--------------------------------------------------------------------------
|
| Rutas para autenticación, gestión de usuarios y administradores
|
*/

// Rutas públicas de autenticación (sin middleware de autenticación)
Route::prefix('v1')->group(function () {
    Route::post('login', [AuthController::class, 'login']);
    Route::post('register', [AuthController::class, 'register']);
    Route::post('forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('reset-password', [AuthController::class, 'resetPassword']);
});

// Rutas protegidas de autenticación
Route::prefix('v1')->middleware(['auth:sanctum'])->group(function () {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::get('user', [AuthController::class, 'user']);
        Route::get('user/permissions', [AuthController::class, 'getAuthUserPermissions']);
        Route::put('user/password', [AuthController::class, 'changePassword']);
        Route::post('refresh-token', [AuthController::class, 'refreshToken']);
        
        // Endpoint de perfil completo con datos reales de BD (reemplaza el original)
        Route::get('user/profile', function(Request $request) {
            try {
                // Obtener usuario autenticado actual
                $user = $request->user();
                
                if (!$user) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Usuario no autenticado'
                    ], 401);
                }
                
                $userId = $user->id;
                
                // Obtener datos completos del usuario con relaciones
                $usuario = DB::table('usuarios as u')
                    ->leftJoin('roles as r', 'u.rol_id', '=', 'r.id')
                    ->leftJoin('servicios as s', 'u.servicio_id', '=', 's.id')
                    ->select(
                        'u.id',
                        'u.nombre',
                        'u.apellido',
                        'u.telefono',
                        'u.email',
                        'u.username',
                        'u.estado',
                        'u.active',
                        'r.nombre as rol_nombre',
                        'r.id as rol_id',
                        's.name as centro_nombre',
                        's.id as servicio_id'
                    )
                    ->where('u.id', $userId)
                    ->first();
                    
                if (!$usuario) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Usuario no encontrado'
                    ], 404);
                }
                
                // Formatear respuesta
                $userData = [
                    'id' => $usuario->id,
                    'nombre' => $usuario->nombre,
                    'apellido' => $usuario->apellido,
                    'telefono' => $usuario->telefono,
                    'email' => $usuario->email,
                    'username' => $usuario->username,
                    'estado' => $usuario->estado,
                    'active' => $usuario->active,
                    'rol_id' => $usuario->rol_id,
                    'rol' => [
                        'id' => $usuario->rol_id,
                        'name' => $usuario->rol_nombre
                    ],
                    'servicio_id' => $usuario->servicio_id,
                    'centro' => $usuario->centro_nombre
                ];
                
                return response()->json([
                    'success' => true,
                    'data' => $userData,
                    'message' => 'Perfil obtenido exitosamente'
                ]);
                
            } catch (\Exception $e) {
                \Log::error('Error obteniendo perfil: ' . $e->getMessage());
                return response()->json([
                    'success' => false,
                    'message' => 'Error interno del servidor'
                ], 500);
            }
        });
    
    // Endpoint para actualizar contraseña (VERSIÓN SIMPLIFICADA)
    Route::post('user/update-password', function(Request $request) {
        try {
            \Log::info('🔐 [PASSWORD] Iniciando cambio de contraseña', $request->all());
            
            // Validaciones básicas
            if (empty($request->current_password) || empty($request->new_password) || empty($request->new_password_confirmation)) {
                \Log::warning('🔐 [PASSWORD] Campos faltantes');
                return response()->json([
                    'success' => false,
                    'message' => 'Todos los campos son obligatorios'
                ], 400);
            }
            
            if ($request->new_password !== $request->new_password_confirmation) {
                \Log::warning('🔐 [PASSWORD] Contraseñas no coinciden');
                return response()->json([
                    'success' => false,
                    'message' => 'Las contraseñas nuevas no coinciden'
                ], 400);
            }
            
            if (strlen($request->new_password) < 6) {
                \Log::warning('🔐 [PASSWORD] Contraseña muy corta');
                return response()->json([
                    'success' => false,
                    'message' => 'La contraseña debe tener al menos 6 caracteres'
                ], 400);
            }
            
            // Obtener usuario autenticado
            $user = $request->user();
            if (!$user) {
                \Log::error('🔐 [PASSWORD] Usuario no autenticado');
                return response()->json([
                    'success' => false,
                    'message' => 'Usuario no autenticado'
                ], 401);
            }
            
            \Log::info('🔐 [PASSWORD] Usuario autenticado: ' . $user->id);
            
            // Buscar usuario en BD - probar ambas tablas
            $usuario = null;
            
            // Opción 1: Tabla 'usuarios'
            if (DB::getSchemaBuilder()->hasTable('usuarios')) {
                $usuario = DB::table('usuarios')->where('id', $user->id)->first();
                \Log::info('🔐 [PASSWORD] Buscar en tabla usuarios: ' . ($usuario ? 'ENCONTRADO' : 'NO ENCONTRADO'));
            }
            
            // Opción 2: Tabla 'users' (estándar Laravel)
            if (!$usuario && DB::getSchemaBuilder()->hasTable('users')) {
                $usuario = DB::table('users')->where('id', $user->id)->first();
                \Log::info('🔐 [PASSWORD] Buscar en tabla users: ' . ($usuario ? 'ENCONTRADO' : 'NO ENCONTRADO'));
            }
            
            if (!$usuario) {
                \Log::error('🔐 [PASSWORD] Usuario no encontrado en BD');
                return response()->json([
                    'success' => false,
                    'message' => 'Usuario no encontrado en base de datos'
                ], 404);
            }
            
            \Log::info('🔐 [PASSWORD] Usuario encontrado, verificando contraseña actual');
            
            // Verificar contraseña actual usando Hash de Laravel
            if (!\Illuminate\Support\Facades\Hash::check($request->current_password, $usuario->password)) {
                \Log::warning('🔐 [PASSWORD] Contraseña actual incorrecta');
                return response()->json([
                    'success' => false,
                    'message' => 'La contraseña actual es incorrecta'
                ], 400);
            }
            
            \Log::info('🔐 [PASSWORD] Contraseña actual correcta, actualizando...');
            
            // Actualizar contraseña en la tabla correcta
            $tableName = DB::getSchemaBuilder()->hasTable('usuarios') ? 'usuarios' : 'users';
            $updated = DB::table($tableName)
                ->where('id', $user->id)
                ->update([
                    'password' => \Illuminate\Support\Facades\Hash::make($request->new_password)
                ]);
                
            \Log::info('🔐 [PASSWORD] Resultado actualización: ' . ($updated ? 'EXITOSO' : 'FALLIDO'));
                
            if ($updated) {
                return response()->json([
                    'success' => true,
                    'message' => 'Contraseña actualizada exitosamente'
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'No se pudo actualizar la contraseña'
                ], 500);
            }
            
        } catch (\Exception $e) {
            \Log::error('🔐 [PASSWORD] Error completo: ' . $e->getMessage());
            \Log::error('🔐 [PASSWORD] Stack trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'success' => false,
                'message' => 'Error interno: ' . $e->getMessage()
            ], 500);
        }
    });
    Route::post('user/update-sede', [AuthController::class, 'updateSede']);
    
    // Gestión de usuarios
    Route::apiResource('usuarios', UsuarioController::class);
        Route::get('usuarios/search', [UsuarioController::class, 'search']);
        Route::get('usuarios/stats', [UsuarioController::class, 'stats']);
        Route::post('usuarios/{id}/toggle-status', [UsuarioController::class, 'toggleStatus']);
        
        // Endpoint para obtener permisos del usuario actual
        Route::get('usuarios/{id}/permissions', function($id) {
            try {
                $currentUser = request()->user();
                
                // Solo permitir que el usuario obtenga sus propios permisos
                if ($currentUser->id != $id) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Solo puedes obtener tus propios permisos'
                    ], 403);
                }
                
                // Obtener información del usuario
                $user = DB::table('usuarios')
                    ->leftJoin('roles', 'usuarios.rol_id', '=', 'roles.id')
                    ->select('usuarios.*', 'roles.nombre as rol_nombre')
                    ->where('usuarios.id', $id)
                    ->first();
                
                if (!$user) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Usuario no encontrado'
                    ], 404);
                }
                
                // Obtener todos los módulos activos
                $modules = DB::table('modulos')->where('estado', 1)->get();
                
                // Obtener permisos específicos del usuario desde la tabla acciones
                $userPermissions = DB::table('acciones')
                    ->join('modulos', 'acciones.modulo_id', '=', 'modulos.id')
                    ->where('acciones.usuario_id', $id)
                    ->select([
                        'acciones.*',
                        'modulos.name as modulo_name'
                    ])
                    ->get()
                    ->keyBy('modulo_id');
                
                // Formatear permisos
                $formattedPermissions = [];
                foreach ($modules as $module) {
                    $userPermission = $userPermissions->get($module->id);
                    
                    if ($userPermission) {
                        // Usar permisos específicos de la BD
                        $formattedPermissions[] = [
                            'modulo_id' => $module->id,
                            'modulo_name' => $module->name,
                            'leer' => (int)$userPermission->leer,
                            'insertar' => (int)$userPermission->insertar,
                            'editar' => (int)$userPermission->editar,
                            'eliminar' => (int)$userPermission->eliminar
                        ];
                    } else {
                        // Super Admin (rol 1) tiene TODOS los permisos
                        if ($user->rol_id == 1) {
                            $formattedPermissions[] = [
                                'modulo_id' => $module->id,
                                'modulo_name' => $module->name,
                                'leer' => 1,
                                'insertar' => 1,
                                'editar' => 1,
                                'eliminar' => 1
                            ];
                        } else {
                            // Usar permisos por defecto basados en el rol para otros roles
                            $defaultPermissions = getDefaultPermissionsByRole($user->rol_id, $module->name);
                            $formattedPermissions[] = [
                                'modulo_id' => $module->id,
                                'modulo_name' => $module->name,
                                'leer' => $defaultPermissions['leer'],
                                'insertar' => $defaultPermissions['insertar'],
                                'editar' => $defaultPermissions['editar'],
                                'eliminar' => $defaultPermissions['eliminar']
                            ];
                        }
                    }
                }
                
                return response()->json([
                    'success' => true,
                    'data' => $formattedPermissions
                ]);
                
            } catch (\Exception $e) {
                \Log::error('Error obteniendo permisos de usuario: ' . $e->getMessage());
                return response()->json([
                    'success' => false,
                    'message' => 'Error interno del servidor'
                ], 500);
            }
        });

    // Gestión de administradores
    Route::apiResource('administradores', AdministradorController::class);
        Route::get('administradores/{id}/permissions', [AdministradorController::class, 'getPermissions']);
        Route::put('administradores/{id}/permissions', [AdministradorController::class, 'updatePermissions']);
        Route::post('administradores/{id}/toggle-status', [AdministradorController::class, 'toggleStatus']);
});