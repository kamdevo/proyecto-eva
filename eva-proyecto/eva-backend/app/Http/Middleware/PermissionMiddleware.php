<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use App\ConexionesVista\ResponseFormatter;

/**
 * Middleware para verificar permisos de usuario basado en el sistema de acciones
 * 
 * Este middleware verifica si el usuario autenticado tiene permisos para realizar
 * una acción específica en un módulo determinado según la tabla 'acciones'.
 */
class PermissionMiddleware
{
    /**
     * Mapeo de módulos del sistema con sus nombres en la base de datos
     */
    private const MODULE_MAPPING = [
        'equipos' => 'equipos',
        'usuarios' => 'usuarios',
        'servicios' => 'servicios',
        'equipos-industriales' => 'equipos industriales',
        'bajas-equipos' => 'bajas equipos biomedicos',
        'invimas' => 'invimas',
        'ordenes-compra' => 'soportes compra',
        'repuestos' => 'repuestos',
        'estado-equipos' => 'estado equipos',
        'contactos' => 'contactos',
        'reportes' => 'reportes',
        'planes-mantenimiento' => 'planes mantenimiento',
        'capacitaciones' => 'capacitaciones',
        'archivos' => 'equipo archivos',
        'tickets-propios' => 'tickets propios',
        'tickets-activos' => 'tickets activos',
        'tickets-cerrados' => 'tickets cerrados',
        'observaciones' => 'observaciones',
        'areas' => 'areas',
        'contingencias' => 'contingencias',
        'guias-rapidas' => 'guias rapidas',
        'manuales' => 'manuales'
    ];

    /**
     * Mapeo de acciones HTTP a permisos en la base de datos
     */
    private const ACTION_MAPPING = [
        'GET' => 'leer',
        'POST' => 'insertar',
        'PUT' => 'editar',
        'PATCH' => 'editar',
        'DELETE' => 'eliminar'
    ];

    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @param  string  $module
     * @param  string|null  $action
     * @return mixed
     */
    public function handle(Request $request, Closure $next, string $module, string $action = null)
    {
        // Verificar que el usuario esté autenticado
        if (!Auth::check()) {
            return ResponseFormatter::error('No autenticado', 401);
        }

        $user = Auth::user();

        // Los administradores (rol_id = 1) tienen acceso completo
        if ($user->rol_id === 1) {
            return $next($request);
        }

        // Determinar la acción basada en el método HTTP si no se especifica
        if (!$action) {
            $httpMethod = $request->method();
            $action = self::ACTION_MAPPING[$httpMethod] ?? 'leer';
        }

        // Verificar permisos
        if (!$this->hasPermission($user->id, $module, $action)) {
            return ResponseFormatter::error(
                'No tienes permisos para realizar esta acción en este módulo',
                403
            );
        }

        return $next($request);
    }

    /**
     * Verificar si el usuario tiene permiso para una acción específica en un módulo
     *
     * @param int $userId
     * @param string $module
     * @param string $action
     * @return bool
     */
    private function hasPermission(int $userId, string $module, string $action): bool
    {
        // Usar caché para mejorar rendimiento (5 minutos)
        $cacheKey = "user_permission_{$userId}_{$module}_{$action}";
        
        return Cache::remember($cacheKey, 300, function () use ($userId, $module, $action) {
            // Obtener el nombre del módulo en la base de datos
            $moduleName = self::MODULE_MAPPING[$module] ?? $module;

            // Consultar permisos del usuario
            $permission = DB::table('acciones')
                ->join('modulos', 'acciones.modulo_id', '=', 'modulos.id')
                ->where('acciones.usuario_id', $userId)
                ->where('modulos.name', $moduleName)
                ->select("acciones.{$action}")
                ->first();

            return $permission && $permission->{$action} == 1;
        });
    }

    /**
     * Limpiar caché de permisos para un usuario específico
     *
     * @param int $userId
     * @return void
     */
    public static function clearUserPermissionsCache(int $userId): void
    {
        $modules = array_keys(self::MODULE_MAPPING);
        $actions = array_values(self::ACTION_MAPPING);

        foreach ($modules as $module) {
            foreach ($actions as $action) {
                $cacheKey = "user_permission_{$userId}_{$module}_{$action}";
                Cache::forget($cacheKey);
            }
        }
    }

    /**
     * Obtener todos los permisos de un usuario
     *
     * @param int $userId
     * @return array
     */
    public static function getUserPermissions(int $userId): array
    {
        $cacheKey = "user_all_permissions_{$userId}";
        
        return Cache::remember($cacheKey, 300, function () use ($userId) {
            return DB::table('acciones')
                ->join('modulos', 'acciones.modulo_id', '=', 'modulos.id')
                ->where('acciones.usuario_id', $userId)
                ->select([
                    'modulos.name as modulo',
                    'acciones.leer',
                    'acciones.insertar',
                    'acciones.editar',
                    'acciones.eliminar'
                ])
                ->get()
                ->keyBy('modulo')
                ->toArray();
        });
    }
}
