<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Exception;

class GenerarInformeProyecto extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'proyecto:generar-informe {--output=informe_proyecto.md} {--formato=markdown}';

    /**
     * The console command description.
     */
    protected $description = 'Genera un informe exhaustivo del proyecto backend con todas las estructuras y funcionalidades';

    /**
     * Datos del informe
     */
    protected $informe = [];

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('📋 GENERANDO INFORME EXHAUSTIVO DEL PROYECTO EVA');
        $this->info('===============================================');
        
        $output = $this->option('output');
        $formato = $this->option('formato');
        
        try {
            // 1. Información general del proyecto
            $this->analizarInformacionGeneral();
            
            // 2. Estructura de directorios
            $this->analizarEstructuraDirectorios();
            
            // 3. Base de datos y modelos
            $this->analizarBaseDatos();
            
            // 4. Controladores y rutas
            $this->analizarControladores();
            
            // 5. Middleware y seguridad
            $this->analizarMiddleware();
            
            // 6. Configuraciones
            $this->analizarConfiguraciones();
            
            // 7. Jobs y colas
            $this->analizarJobs();
            
            // 8. Eventos y listeners
            $this->analizarEventos();
            
            // 9. Servicios y providers
            $this->analizarServicios();
            
            // 10. Dependencias
            $this->analizarDependencias();
            
            // 11. Generar archivo de informe
            $this->generarArchivoInforme($output, $formato);
            
            $this->info("✅ Informe generado exitosamente: {$output}");
            
        } catch (Exception $e) {
            $this->error('❌ Error generando informe: ' . $e->getMessage());
            return 1;
        }
        
        return 0;
    }

    /**
     * Analizar información general del proyecto
     */
    protected function analizarInformacionGeneral()
    {
        $this->info('1. Analizando información general...');
        
        $composer = json_decode(File::get(base_path('composer.json')), true);
        $env = File::exists(base_path('.env')) ? File::get(base_path('.env')) : '';
        
        $this->informe['general'] = [
            'nombre' => $composer['name'] ?? 'EVA - Sistema de Gestión de Equipos',
            'descripcion' => $composer['description'] ?? 'Sistema de gestión de equipos médicos',
            'version' => $composer['version'] ?? '1.0.0',
            'laravel_version' => app()->version(),
            'php_version' => PHP_VERSION,
            'fecha_analisis' => now()->format('Y-m-d H:i:s'),
            'entorno' => app()->environment(),
            'debug' => config('app.debug'),
            'url' => config('app.url'),
            'timezone' => config('app.timezone'),
            'locale' => config('app.locale')
        ];
    }

    /**
     * Analizar estructura de directorios
     */
    protected function analizarEstructuraDirectorios()
    {
        $this->info('2. Analizando estructura de directorios...');
        
        $directorios = [
            'app' => $this->analizarDirectorio(app_path()),
            'config' => $this->analizarDirectorio(config_path()),
            'database' => $this->analizarDirectorio(database_path()),
            'routes' => $this->analizarDirectorio(base_path('routes')),
            'resources' => $this->analizarDirectorio(resource_path()),
            'storage' => $this->analizarDirectorio(storage_path()),
            'public' => $this->analizarDirectorio(public_path()),
            'tests' => $this->analizarDirectorio(base_path('tests'))
        ];
        
        $this->informe['estructura'] = $directorios;
    }

    /**
     * Analizar un directorio específico
     */
    protected function analizarDirectorio($path)
    {
        if (!File::exists($path)) {
            return ['existe' => false];
        }
        
        $archivos = File::allFiles($path);
        $directorios = File::directories($path);
        
        $analisis = [
            'existe' => true,
            'total_archivos' => count($archivos),
            'total_directorios' => count($directorios),
            'subdirectorios' => array_map('basename', $directorios),
            'tipos_archivo' => []
        ];
        
        // Contar tipos de archivo
        foreach ($archivos as $archivo) {
            $extension = $archivo->getExtension();
            if (!isset($analisis['tipos_archivo'][$extension])) {
                $analisis['tipos_archivo'][$extension] = 0;
            }
            $analisis['tipos_archivo'][$extension]++;
        }
        
        return $analisis;
    }

    /**
     * Analizar base de datos y modelos
     */
    protected function analizarBaseDatos()
    {
        $this->info('3. Analizando base de datos y modelos...');
        
        try {
            // Información de conexión
            $connection = DB::connection();
            $databaseName = $connection->getDatabaseName();
            
            // Listar tablas
            $tablas = DB::select('SHOW TABLES');
            $nombreTablas = array_map(function($tabla) use ($databaseName) {
                return $tabla->{"Tables_in_{$databaseName}"};
            }, $tablas);
            
            // Analizar modelos
            $modelos = $this->analizarModelos();
            
            $this->informe['base_datos'] = [
                'driver' => config('database.default'),
                'host' => config('database.connections.mysql.host'),
                'database' => $databaseName,
                'total_tablas' => count($nombreTablas),
                'tablas' => $nombreTablas,
                'modelos' => $modelos
            ];
            
        } catch (Exception $e) {
            $this->informe['base_datos'] = [
                'error' => 'No se pudo conectar a la base de datos: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Analizar modelos Eloquent
     */
    protected function analizarModelos()
    {
        $modelPath = app_path('Models');
        if (!File::exists($modelPath)) {
            return [];
        }
        
        $archivosModelo = File::files($modelPath);
        $modelos = [];
        
        foreach ($archivosModelo as $archivo) {
            $nombreClase = pathinfo($archivo->getFilename(), PATHINFO_FILENAME);
            $modelos[] = [
                'nombre' => $nombreClase,
                'archivo' => $archivo->getFilename(),
                'tamaño' => $archivo->getSize()
            ];
        }
        
        return $modelos;
    }

    /**
     * Analizar controladores y rutas
     */
    protected function analizarControladores()
    {
        $this->info('4. Analizando controladores y rutas...');
        
        // Analizar controladores
        $controllerPath = app_path('Http/Controllers');
        $controladores = $this->analizarDirectorio($controllerPath);
        
        // Analizar rutas API
        $rutasApi = collect(Route::getRoutes())->filter(function ($route) {
            return str_starts_with($route->uri(), 'api/');
        })->map(function ($route) {
            return [
                'uri' => $route->uri(),
                'methods' => $route->methods(),
                'name' => $route->getName(),
                'action' => $route->getActionName()
            ];
        })->values()->toArray();
        
        $this->informe['controladores_rutas'] = [
            'controladores' => $controladores,
            'total_rutas_api' => count($rutasApi),
            'rutas_api' => $rutasApi
        ];
    }

    /**
     * Analizar middleware
     */
    protected function analizarMiddleware()
    {
        $this->info('5. Analizando middleware...');
        
        $middlewarePath = app_path('Http/Middleware');
        $middleware = [];
        
        if (File::exists($middlewarePath)) {
            $archivos = File::files($middlewarePath);
            foreach ($archivos as $archivo) {
                $middleware[] = pathinfo($archivo->getFilename(), PATHINFO_FILENAME);
            }
        }
        
        $this->informe['middleware'] = [
            'total' => count($middleware),
            'lista' => $middleware
        ];
    }

    /**
     * Analizar configuraciones
     */
    protected function analizarConfiguraciones()
    {
        $this->info('6. Analizando configuraciones...');
        
        $configPath = config_path();
        $configuraciones = [];
        
        if (File::exists($configPath)) {
            $archivos = File::files($configPath);
            foreach ($archivos as $archivo) {
                $nombre = pathinfo($archivo->getFilename(), PATHINFO_FILENAME);
                $configuraciones[$nombre] = [
                    'archivo' => $archivo->getFilename(),
                    'tamaño' => $archivo->getSize(),
                    'modificado' => date('Y-m-d H:i:s', $archivo->getMTime())
                ];
            }
        }
        
        $this->informe['configuraciones'] = $configuraciones;
    }

    /**
     * Analizar jobs y colas
     */
    protected function analizarJobs()
    {
        $this->info('7. Analizando jobs y colas...');
        
        $jobsPath = app_path('Jobs');
        $jobs = [];
        
        if (File::exists($jobsPath)) {
            $archivos = File::files($jobsPath);
            foreach ($archivos as $archivo) {
                $jobs[] = pathinfo($archivo->getFilename(), PATHINFO_FILENAME);
            }
        }
        
        $this->informe['jobs'] = [
            'total' => count($jobs),
            'lista' => $jobs,
            'queue_driver' => config('queue.default')
        ];
    }

    /**
     * Analizar eventos y listeners
     */
    protected function analizarEventos()
    {
        $this->info('8. Analizando eventos y listeners...');
        
        $eventsPath = app_path('Events');
        $listenersPath = app_path('Listeners');
        
        $eventos = [];
        $listeners = [];
        
        if (File::exists($eventsPath)) {
            $archivos = File::files($eventsPath);
            foreach ($archivos as $archivo) {
                $eventos[] = pathinfo($archivo->getFilename(), PATHINFO_FILENAME);
            }
        }
        
        if (File::exists($listenersPath)) {
            $archivos = File::files($listenersPath);
            foreach ($archivos as $archivo) {
                $listeners[] = pathinfo($archivo->getFilename(), PATHINFO_FILENAME);
            }
        }
        
        $this->informe['eventos'] = [
            'eventos' => $eventos,
            'listeners' => $listeners,
            'total_eventos' => count($eventos),
            'total_listeners' => count($listeners)
        ];
    }

    /**
     * Analizar servicios y providers
     */
    protected function analizarServicios()
    {
        $this->info('9. Analizando servicios y providers...');
        
        $providersPath = app_path('Providers');
        $servicesPath = app_path('Services');
        
        $providers = [];
        $services = [];
        
        if (File::exists($providersPath)) {
            $archivos = File::files($providersPath);
            foreach ($archivos as $archivo) {
                $providers[] = pathinfo($archivo->getFilename(), PATHINFO_FILENAME);
            }
        }
        
        if (File::exists($servicesPath)) {
            $archivos = File::files($servicesPath);
            foreach ($archivos as $archivo) {
                $services[] = pathinfo($archivo->getFilename(), PATHINFO_FILENAME);
            }
        }
        
        $this->informe['servicios'] = [
            'providers' => $providers,
            'services' => $services,
            'total_providers' => count($providers),
            'total_services' => count($services)
        ];
    }

    /**
     * Analizar dependencias
     */
    protected function analizarDependencias()
    {
        $this->info('10. Analizando dependencias...');
        
        $composer = json_decode(File::get(base_path('composer.json')), true);
        
        $this->informe['dependencias'] = [
            'require' => $composer['require'] ?? [],
            'require_dev' => $composer['require-dev'] ?? [],
            'total_dependencias' => count($composer['require'] ?? []),
            'total_dependencias_dev' => count($composer['require-dev'] ?? [])
        ];
    }

    /**
     * Generar archivo de informe
     */
    protected function generarArchivoInforme($output, $formato)
    {
        $this->info('11. Generando archivo de informe...');
        
        if ($formato === 'markdown') {
            $contenido = $this->generarMarkdown();
        } else {
            $contenido = json_encode($this->informe, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        }
        
        File::put(base_path($output), $contenido);
    }

    /**
     * Generar contenido en formato Markdown
     */
    protected function generarMarkdown()
    {
        $md = "# Informe Exhaustivo del Proyecto EVA\n\n";
        $md .= "**Fecha de generación:** " . $this->informe['general']['fecha_analisis'] . "\n\n";
        
        // Información general
        $md .= "## 1. Información General\n\n";
        foreach ($this->informe['general'] as $key => $value) {
            $md .= "- **" . ucfirst(str_replace('_', ' ', $key)) . ":** {$value}\n";
        }
        $md .= "\n";
        
        // Estructura de directorios
        $md .= "## 2. Estructura de Directorios\n\n";
        foreach ($this->informe['estructura'] as $dir => $info) {
            $md .= "### {$dir}\n";
            if ($info['existe']) {
                $md .= "- **Archivos:** {$info['total_archivos']}\n";
                $md .= "- **Subdirectorios:** {$info['total_directorios']}\n";
                if (!empty($info['subdirectorios'])) {
                    $md .= "- **Subdirectorios:** " . implode(', ', $info['subdirectorios']) . "\n";
                }
                if (!empty($info['tipos_archivo'])) {
                    $md .= "- **Tipos de archivo:**\n";
                    foreach ($info['tipos_archivo'] as $ext => $count) {
                        $md .= "  - .{$ext}: {$count} archivos\n";
                    }
                }
            } else {
                $md .= "- **Estado:** No existe\n";
            }
            $md .= "\n";
        }
        
        // Base de datos
        $md .= "## 3. Base de Datos\n\n";
        if (isset($this->informe['base_datos']['error'])) {
            $md .= "**Error:** " . $this->informe['base_datos']['error'] . "\n\n";
        } else {
            $bd = $this->informe['base_datos'];
            $md .= "- **Driver:** {$bd['driver']}\n";
            $md .= "- **Host:** {$bd['host']}\n";
            $md .= "- **Base de datos:** {$bd['database']}\n";
            $md .= "- **Total de tablas:** {$bd['total_tablas']}\n";
            $md .= "- **Total de modelos:** " . count($bd['modelos']) . "\n\n";
            
            $md .= "### Tablas\n";
            foreach ($bd['tablas'] as $tabla) {
                $md .= "- {$tabla}\n";
            }
            $md .= "\n";
            
            $md .= "### Modelos\n";
            foreach ($bd['modelos'] as $modelo) {
                $md .= "- **{$modelo['nombre']}** ({$modelo['archivo']})\n";
            }
            $md .= "\n";
        }
        
        // Controladores y rutas
        $md .= "## 4. Controladores y Rutas\n\n";
        $cr = $this->informe['controladores_rutas'];
        $md .= "- **Total de rutas API:** {$cr['total_rutas_api']}\n";
        $md .= "- **Controladores encontrados:** {$cr['controladores']['total_archivos']}\n\n";
        
        // Middleware
        $md .= "## 5. Middleware\n\n";
        $md .= "- **Total:** {$this->informe['middleware']['total']}\n";
        foreach ($this->informe['middleware']['lista'] as $mw) {
            $md .= "- {$mw}\n";
        }
        $md .= "\n";
        
        // Configuraciones
        $md .= "## 6. Configuraciones\n\n";
        foreach ($this->informe['configuraciones'] as $nombre => $config) {
            $md .= "- **{$nombre}** ({$config['archivo']}) - {$config['tamaño']} bytes\n";
        }
        $md .= "\n";
        
        // Jobs
        $md .= "## 7. Jobs y Colas\n\n";
        $md .= "- **Driver de cola:** {$this->informe['jobs']['queue_driver']}\n";
        $md .= "- **Total de jobs:** {$this->informe['jobs']['total']}\n";
        foreach ($this->informe['jobs']['lista'] as $job) {
            $md .= "- {$job}\n";
        }
        $md .= "\n";
        
        // Eventos
        $md .= "## 8. Eventos y Listeners\n\n";
        $md .= "- **Total de eventos:** {$this->informe['eventos']['total_eventos']}\n";
        $md .= "- **Total de listeners:** {$this->informe['eventos']['total_listeners']}\n\n";
        
        // Servicios
        $md .= "## 9. Servicios y Providers\n\n";
        $md .= "- **Total de providers:** {$this->informe['servicios']['total_providers']}\n";
        $md .= "- **Total de services:** {$this->informe['servicios']['total_services']}\n\n";
        
        // Dependencias
        $md .= "## 10. Dependencias\n\n";
        $md .= "- **Dependencias de producción:** {$this->informe['dependencias']['total_dependencias']}\n";
        $md .= "- **Dependencias de desarrollo:** {$this->informe['dependencias']['total_dependencias_dev']}\n\n";
        
        $md .= "### Dependencias principales\n";
        foreach ($this->informe['dependencias']['require'] as $package => $version) {
            $md .= "- {$package}: {$version}\n";
        }
        
        return $md;
    }
}
