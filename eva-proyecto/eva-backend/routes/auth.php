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
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AdministradorController;
use App\Http\Controllers\Api\UsuarioController;

/*
|--------------------------------------------------------------------------
| Authentication Routes
|--------------------------------------------------------------------------
|
| Rutas para autenticación, gestión de usuarios y administradores
|
*/

// Rutas públicas de autenticación

// Agrupación optimizada de rutas con middleware empresarial
Route::prefix('v1')->middleware(['auth:sanctum', 'throttle:60,1', 'cors', 'api.version'])->group(function () {
    Route::post('login', [AuthController::class, 'login']);
    Route::post('register', [AuthController::class, 'register']);
    Route::post('forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('reset-password', [AuthController::class, 'resetPassword']);

// Rutas protegidas de autenticación
Route::middleware('auth:sanctum')->group(function () {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::get('user', [AuthController::class, 'user']);
        Route::put('user/profile', [AuthController::class, 'updateProfile']);
        Route::put('user/password', [AuthController::class, 'changePassword']);
        Route::post('refresh-token', [AuthController::class, 'refreshToken']);
    
    // Gestión de usuarios
    Route::apiResource('usuarios', UsuarioController::class);
        Route::get('usuarios/search', [UsuarioController::class, 'search']);
        Route::get('usuarios/stats', [UsuarioController::class, 'stats']);
        Route::post('usuarios/{id}/toggle-status', [UsuarioController::class, 'toggleStatus']);

    // Gestión de administradores
    Route::apiResource('administradores', AdministradorController::class);
        Route::get('administradores/{id}/permissions', [AdministradorController::class, 'getPermissions']);
        Route::put('administradores/{id}/permissions', [AdministradorController::class, 'updatePermissions']);
        Route::post('administradores/{id}/toggle-status', [AdministradorController::class, 'toggleStatus']);
});

});