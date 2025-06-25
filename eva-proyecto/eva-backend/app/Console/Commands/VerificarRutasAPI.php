<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Http;
use Exception;

class VerificarRutasAPI extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'api:verificar-rutas {--test-endpoints} {--grupo=}';

    /**
     * The console command description.
     */
    protected $description = 'Verifica todas las rutas API del backend y su conectividad con el frontend';

    /**
     * Grupos de rutas principales
     */
    protected $gruposRutas = [
        'auth' => 'Autenticación',
        'equipos' => 'Gestión de Equipos',
        'usuarios' => 'Gestión de Usuarios',
        'contingencias' => 'Gestión de Contingencias',
        'mantenimiento' => 'Gestión de Mantenimiento',
        'calibracion' => 'Gestión de Calibración',
        'dashboard' => 'Dashboard y Reportes',
        'archivos' => 'Gestión de Archivos',
        'system' => 'Sistema y Configuración'
    ];

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🔍 INICIANDO VERIFICACIÓN DE RUTAS API');
        $this->info('=====================================');
        
        $testEndpoints = $this->option('test-endpoints');
        $grupo = $this->option('grupo');
        
        try {
            // 1. Listar todas las rutas API
            $this->listarRutasAPI($grupo);
            
            // 2. Verificar estructura de controladores
            $this->verificarControladores();
            
            // 3. Verificar middleware y autenticación
            $this->verificarMiddleware();
            
            // 4. Test de endpoints (opcional)
            if ($testEndpoints) {
                $this->testearEndpoints();
            }
            
            // 5. Verificar CORS y configuración
            $this->verificarConfiguracionCORS();
            
            // 6. Generar resumen
            $this->generarResumen();
            
        } catch (Exception $e) {
            $this->error('❌ Error durante la verificación: ' . $e->getMessage());
            return 1;
        }
        
        return 0;
    }

    /**
     * Listar todas las rutas API
     */
    protected function listarRutasAPI($grupoFiltro = null)
    {
        $this->info('1. LISTANDO RUTAS API...');
        
        $routes = collect(Route::getRoutes())->filter(function ($route) {
            return str_starts_with($route->uri(), 'api/');
        });
        
        $rutasPorGrupo = [];
        $totalRutas = 0;
        
        foreach ($routes as $route) {
            $uri = $route->uri();
            $methods = implode('|', $route->methods());
            $name = $route->getName() ?? 'Sin nombre';
            $action = $route->getActionName();
            
            // Determinar grupo
            $grupo = $this->determinarGrupoRuta($uri);
            
            if ($grupoFiltro && $grupo !== $grupoFiltro) {
                continue;
            }
            
            if (!isset($rutasPorGrupo[$grupo])) {
                $rutasPorGrupo[$grupo] = [];
            }
            
            $rutasPorGrupo[$grupo][] = [
                'uri' => $uri,
                'methods' => $methods,
                'name' => $name,
                'action' => $action
            ];
            
            $totalRutas++;
        }
        
        // Mostrar rutas organizadas por grupo
        foreach ($rutasPorGrupo as $grupo => $rutas) {
            $descripcionGrupo = $this->gruposRutas[$grupo] ?? 'Otros';
            $this->line("\n📁 <fg=cyan>{$descripcionGrupo}</fg=cyan> ({$grupo}) - " . count($rutas) . " rutas");
            
            foreach ($rutas as $ruta) {
                $this->line("  <fg=green>{$ruta['methods']}</fg=green> {$ruta['uri']}");
                if ($ruta['name'] !== 'Sin nombre') {
                    $this->line("    📝 Nombre: {$ruta['name']}");
                }
                $this->line("    🎯 Acción: {$ruta['action']}");
                $this->line("");
            }
        }
        
        $this->info("📊 Total de rutas API encontradas: {$totalRutas}");
    }

    /**
     * Determinar el grupo de una ruta
     */
    protected function determinarGrupoRuta($uri)
    {
        if (str_contains($uri, 'auth') || str_contains($uri, 'login') || str_contains($uri, 'register')) {
            return 'auth';
        }
        if (str_contains($uri, 'equip')) {
            return 'equipos';
        }
        if (str_contains($uri, 'usuario') || str_contains($uri, 'user')) {
            return 'usuarios';
        }
        if (str_contains($uri, 'contingencia')) {
            return 'contingencias';
        }
        if (str_contains($uri, 'mantenimiento')) {
            return 'mantenimiento';
        }
        if (str_contains($uri, 'calibracion')) {
            return 'calibracion';
        }
        if (str_contains($uri, 'dashboard')) {
            return 'dashboard';
        }
        if (str_contains($uri, 'archivo') || str_contains($uri, 'file')) {
            return 'archivos';
        }
        if (str_contains($uri, 'system')) {
            return 'system';
        }
        
        return 'otros';
    }

    /**
     * Verificar controladores
     */
    protected function verificarControladores()
    {
        $this->info('2. VERIFICANDO CONTROLADORES...');
        
        $controllerPath = app_path('Http/Controllers/Api');
        
        if (!is_dir($controllerPath)) {
            $this->error('❌ Directorio de controladores API no encontrado');
            return;
        }
        
        $controllers = glob($controllerPath . '/*.php');
        $this->line("📁 Directorio: {$controllerPath}");
        $this->line("📊 Controladores encontrados: " . count($controllers));
        
        foreach ($controllers as $controller) {
            $className = basename($controller, '.php');
            $this->line("✅ {$className}");
            
            // Verificar que la clase existe
            $fullClassName = "App\\Http\\Controllers\\Api\\{$className}";
            if (!class_exists($fullClassName)) {
                $this->warn("  ⚠️  Clase {$fullClassName} no se puede cargar");
            }
        }
    }

    /**
     * Verificar middleware
     */
    protected function verificarMiddleware()
    {
        $this->info('3. VERIFICANDO MIDDLEWARE...');
        
        $routes = collect(Route::getRoutes())->filter(function ($route) {
            return str_starts_with($route->uri(), 'api/');
        });
        
        $middlewareStats = [];
        
        foreach ($routes as $route) {
            $middleware = $route->middleware();
            
            foreach ($middleware as $mw) {
                if (!isset($middlewareStats[$mw])) {
                    $middlewareStats[$mw] = 0;
                }
                $middlewareStats[$mw]++;
            }
        }
        
        $this->line("📊 Middleware utilizados en rutas API:");
        foreach ($middlewareStats as $middleware => $count) {
            $this->line("  ✅ {$middleware}: {$count} rutas");
        }
    }

    /**
     * Testear endpoints básicos
     */
    protected function testearEndpoints()
    {
        $this->info('4. TESTEANDO ENDPOINTS BÁSICOS...');
        
        $baseUrl = config('app.url');
        $endpoints = [
            'GET /api/dashboard' => 'Dashboard principal',
            'GET /api/equipos' => 'Lista de equipos',
            'GET /api/usuarios' => 'Lista de usuarios',
            'GET /api/system/health' => 'Health check'
        ];
        
        foreach ($endpoints as $endpoint => $descripcion) {
            [$method, $path] = explode(' ', $endpoint, 2);
            $url = $baseUrl . $path;
            
            try {
                $response = Http::timeout(5)->get($url);
                $status = $response->status();
                
                if ($status === 200) {
                    $this->line("✅ {$endpoint} - {$descripcion}");
                } elseif ($status === 401) {
                    $this->line("🔐 {$endpoint} - Requiere autenticación");
                } else {
                    $this->warn("⚠️  {$endpoint} - Status: {$status}");
                }
                
            } catch (Exception $e) {
                $this->error("❌ {$endpoint} - Error: " . $e->getMessage());
            }
        }
    }

    /**
     * Verificar configuración CORS
     */
    protected function verificarConfiguracionCORS()
    {
        $this->info('5. VERIFICANDO CONFIGURACIÓN CORS...');
        
        $corsConfig = config('cors');
        
        if ($corsConfig) {
            $this->line("✅ Configuración CORS encontrada");
            $this->line("  📝 Paths: " . implode(', ', $corsConfig['paths'] ?? []));
            $this->line("  🌐 Allowed Origins: " . implode(', ', $corsConfig['allowed_origins'] ?? []));
            $this->line("  📋 Allowed Methods: " . implode(', ', $corsConfig['allowed_methods'] ?? []));
        } else {
            $this->warn("⚠️  Configuración CORS no encontrada");
        }
    }

    /**
     * Generar resumen
     */
    protected function generarResumen()
    {
        $this->info('6. RESUMEN DE VERIFICACIÓN');
        $this->info('==========================');
        
        $this->line('✅ Verificación de rutas API completada');
        $this->line('📊 Para ver rutas por grupo: --grupo=nombre_grupo');
        $this->line('🧪 Para testear endpoints: --test-endpoints');
        
        $this->newLine();
        $this->info('🎯 GRUPOS DISPONIBLES:');
        foreach ($this->gruposRutas as $key => $descripcion) {
            $this->line("  - {$key}: {$descripcion}");
        }
    }
}
