<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Config;
use Exception;

class AnalisisExhaustivoBackend extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'backend:analisis-exhaustivo {--output=ANALISIS_EXHAUSTIVO_BACKEND.md} {--incluir-codigo}';

    /**
     * The console command description.
     */
    protected $description = 'Realiza un análisis exhaustivo y completo de todo el backend del sistema EVA sin omitir ningún componente';

    /**
     * Datos del análisis
     */
    protected $analisis = [];

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🔍 INICIANDO ANÁLISIS EXHAUSTIVO DEL BACKEND EVA');
        $this->info('===============================================');

        $output = $this->option('output');
        $incluirCodigo = $this->option('incluir-codigo');

        try {
            // 1. Información del sistema
            $this->analizarSistema();

            // 2. Estructura completa de directorios
            $this->analizarEstructuraCompleta();

            // 3. Controladores exhaustivo
            $this->analizarControladoresExhaustivo();

            // 4. Modelos y base de datos completo
            $this->analizarModelosCompleto();

            // 5. Middleware completo
            $this->analizarMiddlewareCompleto();

            // 6. Rutas exhaustivo
            $this->analizarRutasExhaustivo();

            // 7. Configuraciones completas
            $this->analizarConfiguracionesCompletas();

            // 8. Eventos, listeners y observers
            $this->analizarEventosCompleto();

            // 9. Jobs y colas
            $this->analizarJobsCompleto();

            // 10. Servicios y providers
            $this->analizarServiciosCompleto();

            // 11. Traits y contratos
            $this->analizarTraitsYContratos();

            // 12. Helpers y utilidades
            $this->analizarHelpersYUtilidades();

            // 13. Validaciones y requests
            $this->analizarValidaciones();

            // 14. Resources y transformers
            $this->analizarResources();

            // 15. Migraciones y seeders
            $this->analizarMigracionesYSeeders();

            // 16. Tests
            $this->analizarTests();

            // 17. Dependencias y composer
            $this->analizarDependencias();

            // 18. Archivos de configuración del proyecto
            $this->analizarArchivosProyecto();

            // 19. Generar informe final
            $this->generarInformeExhaustivo($output, $incluirCodigo);

            $this->info("✅ Análisis exhaustivo completado: {$output}");

        } catch (Exception $e) {
            $this->error('❌ Error durante el análisis: ' . $e->getMessage());
            return 1;
        }

        return 0;
    }

    /**
     * Analizar información del sistema
     */
    protected function analizarSistema()
    {
        $this->info('1. Analizando información del sistema...');

        $composer = json_decode(File::get(base_path('composer.json')), true);
        $packageJson = File::exists(base_path('package.json')) ?
            json_decode(File::get(base_path('package.json')), true) : null;

        $this->analisis['sistema'] = [
            'nombre_proyecto' => $composer['name'] ?? 'EVA Backend',
            'descripcion' => $composer['description'] ?? 'Sistema de gestión de equipos médicos',
            'version' => $composer['version'] ?? '1.0.0',
            'laravel_version' => app()->version(),
            'php_version' => PHP_VERSION,
            'fecha_analisis' => now()->format('Y-m-d H:i:s'),
            'entorno' => app()->environment(),
            'debug_mode' => config('app.debug'),
            'url_base' => config('app.url'),
            'timezone' => config('app.timezone'),
            'locale' => config('app.locale'),
            'package_json' => $packageJson !== null,
            'git_info' => $this->obtenerInfoGit()
        ];
    }

    /**
     * Obtener información de Git
     */
    protected function obtenerInfoGit()
    {
        $gitDir = base_path('.git');
        if (!File::exists($gitDir)) {
            return ['repositorio' => false];
        }

        return [
            'repositorio' => true,
            'branch_actual' => trim(shell_exec('git branch --show-current 2>/dev/null') ?? 'unknown'),
            'ultimo_commit' => trim(shell_exec('git log -1 --format="%h - %s (%cr)" 2>/dev/null') ?? 'unknown')
        ];
    }

    /**
     * Analizar estructura completa de directorios
     */
    protected function analizarEstructuraCompleta()
    {
        $this->info('2. Analizando estructura completa...');

        $directorios = [
            'app' => app_path(),
            'bootstrap' => base_path('bootstrap'),
            'config' => config_path(),
            'database' => database_path(),
            'public' => public_path(),
            'resources' => resource_path(),
            'routes' => base_path('routes'),
            'storage' => storage_path(),
            'tests' => base_path('tests'),
            'vendor' => base_path('vendor')
        ];

        $estructura = [];

        foreach ($directorios as $nombre => $path) {
            $estructura[$nombre] = $this->analizarDirectorioRecursivo($path, $nombre === 'vendor' ? 1 : 3);
        }

        $this->analisis['estructura'] = $estructura;
    }

    /**
     * Analizar directorio recursivamente
     */
    protected function analizarDirectorioRecursivo($path, $maxDepth = 3, $currentDepth = 0)
    {
        if (!File::exists($path) || $currentDepth >= $maxDepth) {
            return ['existe' => false];
        }

        $archivos = File::files($path);
        $subdirectorios = File::directories($path);

        $analisis = [
            'existe' => true,
            'path' => $path,
            'total_archivos' => count($archivos),
            'total_subdirectorios' => count($subdirectorios),
            'tipos_archivo' => [],
            'subdirectorios' => []
        ];

        // Analizar tipos de archivo
        foreach ($archivos as $archivo) {
            $extension = $archivo->getExtension() ?: 'sin_extension';
            if (!isset($analisis['tipos_archivo'][$extension])) {
                $analisis['tipos_archivo'][$extension] = 0;
            }
            $analisis['tipos_archivo'][$extension]++;
        }

        // Analizar subdirectorios recursivamente
        foreach ($subdirectorios as $subdir) {
            $nombreSubdir = basename($subdir);
            $analisis['subdirectorios'][$nombreSubdir] =
                $this->analizarDirectorioRecursivo($subdir, $maxDepth, $currentDepth + 1);
        }

        return $analisis;
    }

    /**
     * Analizar controladores exhaustivo
     */
    protected function analizarControladoresExhaustivo()
    {
        $this->info('3. Analizando controladores exhaustivo...');

        $controllerPaths = [
            'Api' => app_path('Http/Controllers/Api'),
            'Web' => app_path('Http/Controllers'),
            'Console' => app_path('Console/Commands')
        ];

        $controladores = [];

        foreach ($controllerPaths as $tipo => $path) {
            if (File::exists($path)) {
                $controladores[$tipo] = $this->analizarControladores($path);
            }
        }

        $this->analisis['controladores'] = $controladores;
    }

    /**
     * Analizar controladores en un directorio
     */
    protected function analizarControladores($path)
    {
        $archivos = File::allFiles($path);
        $controladores = [];

        foreach ($archivos as $archivo) {
            if ($archivo->getExtension() === 'php') {
                $nombre = pathinfo($archivo->getFilename(), PATHINFO_FILENAME);
                $contenido = File::get($archivo->getPathname());

                $controladores[$nombre] = [
                    'archivo' => $archivo->getFilename(),
                    'path_relativo' => str_replace(base_path(), '', $archivo->getPathname()),
                    'tamaño' => $archivo->getSize(),
                    'lineas' => substr_count($contenido, "\n") + 1,
                    'metodos_publicos' => $this->extraerMetodosPublicos($contenido),
                    'metodos_privados' => $this->extraerMetodosPrivados($contenido),
                    'propiedades' => $this->extraerPropiedades($contenido),
                    'dependencias' => $this->extraerUseStatements($contenido),
                    'traits_utilizados' => $this->extraerTraitsUtilizados($contenido),
                    'extends' => $this->extraerClaseExtendida($contenido),
                    'implements' => $this->extraerInterfacesImplementadas($contenido),
                    'comentarios_docblock' => $this->extraerComentariosDocblock($contenido)
                ];
            }
        }

        return $controladores;
    }

    /**
     * Extraer métodos públicos
     */
    protected function extraerMetodosPublicos($contenido)
    {
        preg_match_all('/public function (\w+)\s*\([^)]*\)/', $contenido, $matches);
        return $matches[1] ?? [];
    }

    /**
     * Extraer métodos privados
     */
    protected function extraerMetodosPrivados($contenido)
    {
        preg_match_all('/(private|protected) function (\w+)\s*\([^)]*\)/', $contenido, $matches);
        return $matches[2] ?? [];
    }

    /**
     * Extraer propiedades
     */
    protected function extraerPropiedades($contenido)
    {
        preg_match_all('/(public|private|protected) \$(\w+)/', $contenido, $matches);
        return array_combine($matches[2] ?? [], $matches[1] ?? []);
    }

    /**
     * Extraer use statements
     */
    protected function extraerUseStatements($contenido)
    {
        preg_match_all('/use ([^;]+);/', $contenido, $matches);
        return array_map('trim', $matches[1] ?? []);
    }

    /**
     * Extraer traits utilizados
     */
    protected function extraerTraitsUtilizados($contenido)
    {
        if (preg_match('/use\s+([^;{]+);/', $contenido, $matches)) {
            return array_map('trim', explode(',', $matches[1]));
        }
        return [];
    }

    /**
     * Extraer clase extendida
     */
    protected function extraerClaseExtendida($contenido)
    {
        if (preg_match('/class\s+\w+\s+extends\s+(\w+)/', $contenido, $matches)) {
            return $matches[1];
        }
        return null;
    }

    /**
     * Extraer interfaces implementadas
     */
    protected function extraerInterfacesImplementadas($contenido)
    {
        if (preg_match('/implements\s+([^{]+)/', $contenido, $matches)) {
            return array_map('trim', explode(',', $matches[1]));
        }
        return [];
    }

    /**
     * Extraer comentarios docblock
     */
    protected function extraerComentariosDocblock($contenido)
    {
        preg_match_all('/\/\*\*(.*?)\*\//s', $contenido, $matches);
        return count($matches[0] ?? []);
    }

    /**
     * Analizar modelos completo
     */
    protected function analizarModelosCompleto()
    {
        $this->info('4. Analizando modelos y base de datos...');

        // Información de base de datos
        $baseDatos = $this->analizarBaseDatos();

        // Modelos
        $modelos = $this->analizarModelos();

        // Migraciones
        $migraciones = $this->analizarMigraciones();

        $this->analisis['modelos_bd'] = [
            'base_datos' => $baseDatos,
            'modelos' => $modelos,
            'migraciones' => $migraciones
        ];
    }

    /**
     * Analizar base de datos
     */
    protected function analizarBaseDatos()
    {
        try {
            $connection = DB::connection();
            $databaseName = $connection->getDatabaseName();

            // Obtener todas las tablas
            $tablas = DB::select('SHOW TABLES');
            $nombreTablas = array_map(function($tabla) use ($databaseName) {
                return $tabla->{"Tables_in_{$databaseName}"};
            }, $tablas);

            // Analizar cada tabla
            $detallesTablas = [];
            foreach ($nombreTablas as $tabla) {
                $detallesTablas[$tabla] = $this->analizarTabla($tabla);
            }

            return [
                'driver' => config('database.default'),
                'host' => config('database.connections.mysql.host'),
                'database' => $databaseName,
                'total_tablas' => count($nombreTablas),
                'tablas' => $nombreTablas,
                'detalles_tablas' => $detallesTablas
            ];

        } catch (Exception $e) {
            return [
                'error' => 'Error conectando a la base de datos: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Analizar una tabla específica
     */
    protected function analizarTabla($tabla)
    {
        try {
            $columnas = DB::select("DESCRIBE {$tabla}");
            $count = DB::table($tabla)->count();

            return [
                'columnas' => count($columnas),
                'registros' => $count,
                'estructura' => $columnas
            ];
        } catch (Exception $e) {
            return [
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Analizar modelos
     */
    protected function analizarModelos()
    {
        $modelPath = app_path('Models');
        if (!File::exists($modelPath)) {
            return [];
        }

        $archivos = File::files($modelPath);
        $modelos = [];

        foreach ($archivos as $archivo) {
            $nombre = pathinfo($archivo->getFilename(), PATHINFO_FILENAME);
            $contenido = File::get($archivo->getPathname());

            $modelos[$nombre] = [
                'archivo' => $archivo->getFilename(),
                'tamaño' => $archivo->getSize(),
                'lineas' => substr_count($contenido, "\n") + 1,
                'tabla' => $this->extraerTablaModelo($contenido, $nombre),
                'fillable' => $this->extraerFillableModelo($contenido),
                'hidden' => $this->extraerHiddenModelo($contenido),
                'casts' => $this->extraerCastsModelo($contenido),
                'relaciones' => $this->extraerRelacionesModelo($contenido),
                'scopes' => $this->extraerScopesModelo($contenido),
                'traits' => $this->extraerTraitsUtilizados($contenido),
                'timestamps' => $this->extraerTimestampsModelo($contenido),
                'primary_key' => $this->extraerPrimaryKeyModelo($contenido)
            ];
        }

        return $modelos;
    }

    /**
     * Extraer tabla del modelo
     */
    protected function extraerTablaModelo($contenido, $nombreModelo)
    {
        if (preg_match('/protected \$table\s*=\s*[\'"]([^\'"]+)[\'"]/', $contenido, $matches)) {
            return $matches[1];
        }
        return strtolower($nombreModelo) . 's';
    }

    /**
     * Extraer fillable del modelo
     */
    protected function extraerFillableModelo($contenido)
    {
        if (preg_match('/protected \$fillable\s*=\s*\[(.*?)\];/s', $contenido, $matches)) {
            preg_match_all("/'([^']+)'/", $matches[1], $campos);
            return $campos[1] ?? [];
        }
        return [];
    }

    /**
     * Extraer hidden del modelo
     */
    protected function extraerHiddenModelo($contenido)
    {
        if (preg_match('/protected \$hidden\s*=\s*\[(.*?)\];/s', $contenido, $matches)) {
            preg_match_all("/'([^']+)'/", $matches[1], $campos);
            return $campos[1] ?? [];
        }
        return [];
    }

    /**
     * Extraer casts del modelo
     */
    protected function extraerCastsModelo($contenido)
    {
        if (preg_match('/protected \$casts\s*=\s*\[(.*?)\];/s', $contenido, $matches)) {
            preg_match_all("/'([^']+)'\s*=>\s*'([^']+)'/", $matches[1], $casts);
            return array_combine($casts[1] ?? [], $casts[2] ?? []);
        }
        return [];
    }

    /**
     * Extraer relaciones del modelo
     */
    protected function extraerRelacionesModelo($contenido)
    {
        preg_match_all('/public function (\w+)\(\).*?return \$this->(\w+)\(/', $contenido, $matches);
        $relaciones = [];

        if (!empty($matches[1])) {
            for ($i = 0; $i < count($matches[1]); $i++) {
                $relaciones[] = [
                    'metodo' => $matches[1][$i],
                    'tipo' => $matches[2][$i] ?? 'unknown'
                ];
            }
        }

        return $relaciones;
    }

    /**
     * Extraer scopes del modelo
     */
    protected function extraerScopesModelo($contenido)
    {
        preg_match_all('/public function scope(\w+)\(/', $contenido, $matches);
        return $matches[1] ?? [];
    }

    /**
     * Extraer timestamps del modelo
     */
    protected function extraerTimestampsModelo($contenido)
    {
        if (preg_match('/public \$timestamps\s*=\s*(true|false)/', $contenido, $matches)) {
            return $matches[1] === 'true';
        }
        return true; // Default Laravel
    }

    /**
     * Extraer primary key del modelo
     */
    protected function extraerPrimaryKeyModelo($contenido)
    {
        if (preg_match('/protected \$primaryKey\s*=\s*[\'"]([^\'"]+)[\'"]/', $contenido, $matches)) {
            return $matches[1];
        }
        return 'id'; // Default Laravel
    }

    /**
     * Analizar migraciones
     */
    protected function analizarMigraciones()
    {
        $migrationPath = database_path('migrations');
        if (!File::exists($migrationPath)) {
            return [];
        }

        $archivos = File::files($migrationPath);
        $migraciones = [];

        foreach ($archivos as $archivo) {
            $nombre = $archivo->getFilename();
            $contenido = File::get($archivo->getPathname());

            $migraciones[$nombre] = [
                'archivo' => $nombre,
                'tamaño' => $archivo->getSize(),
                'fecha_creacion' => date('Y-m-d H:i:s', $archivo->getMTime()),
                'metodos' => $this->extraerMetodosPublicos($contenido),
                'tablas_afectadas' => $this->extraerTablasAfectadas($contenido)
            ];
        }

        return $migraciones;
    }

    /**
     * Extraer tablas afectadas en migración
     */
    protected function extraerTablasAfectadas($contenido)
    {
        preg_match_all('/Schema::(create|table|drop)\([\'"]([^\'"]+)[\'"]/', $contenido, $matches);
        return array_unique($matches[2] ?? []);
    }

    /**
     * Analizar middleware completo
     */
    protected function analizarMiddlewareCompleto()
    {
        $this->info('5. Analizando middleware...');

        $middlewarePath = app_path('Http/Middleware');
        $middleware = [];

        if (File::exists($middlewarePath)) {
            $archivos = File::files($middlewarePath);

            foreach ($archivos as $archivo) {
                $nombre = pathinfo($archivo->getFilename(), PATHINFO_FILENAME);
                $contenido = File::get($archivo->getPathname());

                $middleware[$nombre] = [
                    'archivo' => $archivo->getFilename(),
                    'tamaño' => $archivo->getSize(),
                    'lineas' => substr_count($contenido, "\n") + 1,
                    'metodos' => $this->extraerMetodosPublicos($contenido),
                    'dependencias' => $this->extraerUseStatements($contenido),
                    'proposito' => $this->determinarPropositoMiddleware($nombre, $contenido)
                ];
            }
        }

        $this->analisis['middleware'] = $middleware;
    }

    /**
     * Determinar propósito del middleware
     */
    protected function determinarPropositoMiddleware($nombre, $contenido)
    {
        $propositos = [
            'AuditMiddleware' => 'Auditoría de acciones del usuario',
            'SecurityHeaders' => 'Configuración de headers de seguridad',
            'AdvancedRateLimit' => 'Control avanzado de límites de peticiones',
            'CompressionMiddleware' => 'Compresión de respuestas HTTP',
            'ReactApiMiddleware' => 'Middleware específico para API React',
            'SecurityHeadersMiddleware' => 'Headers de seguridad HTTP'
        ];

        return $propositos[$nombre] ?? 'Middleware personalizado del sistema';
    }

    /**
     * Analizar rutas exhaustivo
     */
    protected function analizarRutasExhaustivo()
    {
        $this->info('6. Analizando rutas...');

        // Analizar archivos de rutas
        $routeFiles = [
            'api' => base_path('routes/api.php'),
            'web' => base_path('routes/web.php'),
            'console' => base_path('routes/console.php'),
            'channels' => base_path('routes/channels.php')
        ];

        $rutasArchivos = [];
        foreach ($routeFiles as $tipo => $archivo) {
            if (File::exists($archivo)) {
                $contenido = File::get($archivo);
                $rutasArchivos[$tipo] = [
                    'archivo' => basename($archivo),
                    'tamaño' => File::size($archivo),
                    'lineas' => substr_count($contenido, "\n") + 1,
                    'rutas_definidas' => $this->contarRutasEnArchivo($contenido)
                ];
            }
        }

        // Analizar rutas registradas
        $rutasRegistradas = $this->analizarRutasRegistradas();

        $this->analisis['rutas'] = [
            'archivos' => $rutasArchivos,
            'registradas' => $rutasRegistradas
        ];
    }

    /**
     * Contar rutas en archivo
     */
    protected function contarRutasEnArchivo($contenido)
    {
        $patrones = [
            'Route::get',
            'Route::post',
            'Route::put',
            'Route::patch',
            'Route::delete',
            'Route::options',
            'Route::any',
            'Route::match',
            'Route::resource',
            'Route::apiResource'
        ];

        $total = 0;
        foreach ($patrones as $patron) {
            $total += substr_count($contenido, $patron);
        }

        return $total;
    }

    /**
     * Analizar rutas registradas
     */
    protected function analizarRutasRegistradas()
    {
        $routes = Route::getRoutes();
        $rutasApi = [];
        $rutasWeb = [];

        foreach ($routes as $route) {
            $uri = $route->uri();
            $info = [
                'uri' => $uri,
                'methods' => $route->methods(),
                'name' => $route->getName(),
                'action' => $route->getActionName(),
                'middleware' => $route->middleware()
            ];

            if (str_starts_with($uri, 'api/')) {
                $rutasApi[] = $info;
            } else {
                $rutasWeb[] = $info;
            }
        }

        return [
            'api' => [
                'total' => count($rutasApi),
                'rutas' => $rutasApi
            ],
            'web' => [
                'total' => count($rutasWeb),
                'rutas' => $rutasWeb
            ]
        ];
    }

    /**
     * Analizar configuraciones completas
     */
    protected function analizarConfiguracionesCompletas()
    {
        $this->info('7. Analizando configuraciones...');

        $configPath = config_path();
        $configuraciones = [];

        if (File::exists($configPath)) {
            $archivos = File::files($configPath);

            foreach ($archivos as $archivo) {
                $nombre = pathinfo($archivo->getFilename(), PATHINFO_FILENAME);
                $contenido = File::get($archivo->getPathname());

                $configuraciones[$nombre] = [
                    'archivo' => $archivo->getFilename(),
                    'tamaño' => $archivo->getSize(),
                    'lineas' => substr_count($contenido, "\n") + 1,
                    'modificado' => date('Y-m-d H:i:s', $archivo->getMTime()),
                    'configuraciones_principales' => $this->extraerConfiguracionesPrincipales($contenido),
                    'arrays_configuracion' => $this->contarArraysConfiguracion($contenido)
                ];
            }
        }

        $this->analisis['configuraciones'] = $configuraciones;
    }

    /**
     * Extraer configuraciones principales
     */
    protected function extraerConfiguracionesPrincipales($contenido)
    {
        preg_match_all("/'([^']+)'\s*=>/", $contenido, $matches);
        return array_slice($matches[1] ?? [], 0, 10); // Primeras 10
    }

    /**
     * Contar arrays de configuración
     */
    protected function contarArraysConfiguracion($contenido)
    {
        return substr_count($contenido, '=>');
    }

    /**
     * Analizar eventos completo
     */
    protected function analizarEventosCompleto()
    {
        $this->info('8. Analizando eventos y listeners...');

        $eventos = $this->analizarDirectorioComponentes(app_path('Events'), 'Evento');
        $listeners = $this->analizarDirectorioComponentes(app_path('Listeners'), 'Listener');
        $observers = $this->analizarDirectorioComponentes(app_path('Observers'), 'Observer');

        $this->analisis['eventos_sistema'] = [
            'eventos' => $eventos,
            'listeners' => $listeners,
            'observers' => $observers
        ];
    }

    /**
     * Analizar jobs completo
     */
    protected function analizarJobsCompleto()
    {
        $this->info('9. Analizando jobs...');

        $jobs = $this->analizarDirectorioComponentes(app_path('Jobs'), 'Job');

        $this->analisis['jobs'] = [
            'jobs' => $jobs,
            'queue_config' => [
                'default_driver' => config('queue.default'),
                'connections' => array_keys(config('queue.connections', []))
            ]
        ];
    }

    /**
     * Analizar servicios completo
     */
    protected function analizarServiciosCompleto()
    {
        $this->info('10. Analizando servicios...');

        $services = $this->analizarDirectorioComponentes(app_path('Services'), 'Servicio');
        $providers = $this->analizarDirectorioComponentes(app_path('Providers'), 'Provider');

        $this->analisis['servicios'] = [
            'services' => $services,
            'providers' => $providers
        ];
    }

    /**
     * Analizar traits y contratos
     */
    protected function analizarTraitsYContratos()
    {
        $this->info('11. Analizando traits y contratos...');

        $traits = $this->analizarDirectorioComponentes(app_path('Traits'), 'Trait');
        $contracts = $this->analizarDirectorioComponentes(app_path('Contracts'), 'Contract');
        $interfaces = $this->analizarDirectorioComponentes(app_path('Interfaces'), 'Interface');

        $this->analisis['traits_contratos'] = [
            'traits' => $traits,
            'contracts' => $contracts,
            'interfaces' => $interfaces
        ];
    }

    /**
     * Analizar directorio de componentes genérico
     */
    protected function analizarDirectorioComponentes($path, $tipo)
    {
        if (!File::exists($path)) {
            return [];
        }

        $archivos = File::files($path);
        $componentes = [];

        foreach ($archivos as $archivo) {
            if ($archivo->getExtension() === 'php') {
                $nombre = pathinfo($archivo->getFilename(), PATHINFO_FILENAME);
                $contenido = File::get($archivo->getPathname());

                $componentes[$nombre] = [
                    'archivo' => $archivo->getFilename(),
                    'tipo' => $tipo,
                    'tamaño' => $archivo->getSize(),
                    'lineas' => substr_count($contenido, "\n") + 1,
                    'metodos_publicos' => $this->extraerMetodosPublicos($contenido),
                    'metodos_privados' => $this->extraerMetodosPrivados($contenido),
                    'propiedades' => $this->extraerPropiedades($contenido),
                    'dependencias' => $this->extraerUseStatements($contenido),
                    'traits' => $this->extraerTraitsUtilizados($contenido),
                    'extends' => $this->extraerClaseExtendida($contenido),
                    'implements' => $this->extraerInterfacesImplementadas($contenido)
                ];
            }
        }

        return $componentes;
    }

    /**
     * Analizar helpers y utilidades
     */
    protected function analizarHelpersYUtilidades()
    {
        $this->info('12. Analizando helpers...');

        $helpers = [];

        // Buscar archivos de helpers
        $helperPaths = [
            app_path('Helpers'),
            app_path('Utils'),
            app_path('Support')
        ];

        foreach ($helperPaths as $path) {
            if (File::exists($path)) {
                $helpers[basename($path)] = $this->analizarDirectorioComponentes($path, 'Helper');
            }
        }

        $this->analisis['helpers'] = $helpers;
    }

    /**
     * Analizar validaciones
     */
    protected function analizarValidaciones()
    {
        $this->info('13. Analizando validaciones...');

        $requests = $this->analizarDirectorioComponentes(app_path('Http/Requests'), 'Request');
        $rules = $this->analizarDirectorioComponentes(app_path('Rules'), 'Rule');

        $this->analisis['validaciones'] = [
            'requests' => $requests,
            'rules' => $rules
        ];
    }

    /**
     * Analizar resources
     */
    protected function analizarResources()
    {
        $this->info('14. Analizando resources...');

        $resources = $this->analizarDirectorioComponentes(app_path('Http/Resources'), 'Resource');

        $this->analisis['resources'] = $resources;
    }

    /**
     * Analizar migraciones y seeders
     */
    protected function analizarMigracionesYSeeders()
    {
        $this->info('15. Analizando migraciones y seeders...');

        $seeders = $this->analizarDirectorioComponentes(database_path('seeders'), 'Seeder');
        $factories = $this->analizarDirectorioComponentes(database_path('factories'), 'Factory');

        $this->analisis['database_components'] = [
            'seeders' => $seeders,
            'factories' => $factories
        ];
    }

    /**
     * Analizar tests
     */
    protected function analizarTests()
    {
        $this->info('16. Analizando tests...');

        $tests = [];
        $testPaths = [
            'Feature' => base_path('tests/Feature'),
            'Unit' => base_path('tests/Unit')
        ];

        foreach ($testPaths as $tipo => $path) {
            if (File::exists($path)) {
                $tests[$tipo] = $this->analizarDirectorioComponentes($path, 'Test');
            }
        }

        $this->analisis['tests'] = $tests;
    }

    /**
     * Analizar dependencias
     */
    protected function analizarDependencias()
    {
        $this->info('17. Analizando dependencias...');

        $composer = json_decode(File::get(base_path('composer.json')), true);
        $composerLock = File::exists(base_path('composer.lock')) ?
            json_decode(File::get(base_path('composer.lock')), true) : null;

        $this->analisis['dependencias'] = [
            'composer_json' => [
                'require' => $composer['require'] ?? [],
                'require_dev' => $composer['require-dev'] ?? [],
                'autoload' => $composer['autoload'] ?? [],
                'scripts' => $composer['scripts'] ?? []
            ],
            'composer_lock' => $composerLock ? [
                'packages' => count($composerLock['packages'] ?? []),
                'packages_dev' => count($composerLock['packages-dev'] ?? [])
            ] : null
        ];
    }

    /**
     * Analizar archivos del proyecto
     */
    protected function analizarArchivosProyecto()
    {
        $this->info('18. Analizando archivos del proyecto...');

        $archivosProyecto = [
            '.env' => base_path('.env'),
            '.env.example' => base_path('.env.example'),
            'artisan' => base_path('artisan'),
            'server.php' => base_path('server.php'),
            'webpack.mix.js' => base_path('webpack.mix.js'),
            'package.json' => base_path('package.json'),
            'README.md' => base_path('README.md'),
            '.gitignore' => base_path('.gitignore'),
            'phpunit.xml' => base_path('phpunit.xml')
        ];

        $analisisArchivos = [];

        foreach ($archivosProyecto as $nombre => $path) {
            if (File::exists($path)) {
                $analisisArchivos[$nombre] = [
                    'existe' => true,
                    'tamaño' => File::size($path),
                    'modificado' => date('Y-m-d H:i:s', File::lastModified($path))
                ];
            } else {
                $analisisArchivos[$nombre] = ['existe' => false];
            }
        }

        $this->analisis['archivos_proyecto'] = $analisisArchivos;
    }

    /**
     * Generar informe exhaustivo
     */
    protected function generarInformeExhaustivo($output, $incluirCodigo)
    {
        $this->info('19. Generando informe exhaustivo...');

        $md = $this->generarMarkdownExhaustivo($incluirCodigo);

        File::put(base_path($output), $md);
    }

    /**
     * Generar markdown exhaustivo
     */
    protected function generarMarkdownExhaustivo($incluirCodigo)
    {
        $md = "# ANÁLISIS EXHAUSTIVO DEL BACKEND - SISTEMA EVA\n\n";
        $md .= "**Fecha de análisis:** " . $this->analisis['sistema']['fecha_analisis'] . "\n";
        $md .= "**Versión Laravel:** " . $this->analisis['sistema']['laravel_version'] . "\n";
        $md .= "**Versión PHP:** " . $this->analisis['sistema']['php_version'] . "\n\n";

        $md .= "---\n\n";

        // 1. Información del sistema
        $md .= "## 1. INFORMACIÓN DEL SISTEMA\n\n";
        foreach ($this->analisis['sistema'] as $key => $value) {
            if (is_array($value)) {
                $md .= "- **" . ucfirst(str_replace('_', ' ', $key)) . ":**\n";
                foreach ($value as $subkey => $subvalue) {
                    $md .= "  - {$subkey}: {$subvalue}\n";
                }
            } else {
                $md .= "- **" . ucfirst(str_replace('_', ' ', $key)) . ":** {$value}\n";
            }
        }
        $md .= "\n";

        // 2. Estructura de directorios
        $md .= "## 2. ESTRUCTURA DE DIRECTORIOS\n\n";
        foreach ($this->analisis['estructura'] as $dir => $info) {
            $md .= "### {$dir}\n";
            if ($info['existe']) {
                $md .= "- **Archivos:** {$info['total_archivos']}\n";
                $md .= "- **Subdirectorios:** {$info['total_subdirectorios']}\n";
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

        // 3. Controladores
        $md .= "## 3. CONTROLADORES\n\n";
        foreach ($this->analisis['controladores'] as $tipo => $controladores) {
            $md .= "### {$tipo}\n";
            $md .= "**Total:** " . count($controladores) . " controladores\n\n";

            foreach ($controladores as $nombre => $info) {
                $md .= "#### {$nombre}\n";
                $md .= "- **Archivo:** {$info['archivo']}\n";
                $md .= "- **Líneas:** {$info['lineas']}\n";
                $md .= "- **Métodos públicos:** " . count($info['metodos_publicos']) . "\n";
                $md .= "- **Métodos privados:** " . count($info['metodos_privados']) . "\n";
                if (!empty($info['metodos_publicos'])) {
                    $md .= "- **Métodos:** " . implode(', ', $info['metodos_publicos']) . "\n";
                }
                $md .= "\n";
            }
        }

        // 4. Base de datos y modelos
        $md .= "## 4. BASE DE DATOS Y MODELOS\n\n";
        if (isset($this->analisis['modelos_bd']['base_datos']['error'])) {
            $md .= "**Error de conexión:** " . $this->analisis['modelos_bd']['base_datos']['error'] . "\n\n";
        } else {
            $bd = $this->analisis['modelos_bd']['base_datos'];
            $md .= "### Base de Datos\n";
            $md .= "- **Driver:** {$bd['driver']}\n";
            $md .= "- **Host:** {$bd['host']}\n";
            $md .= "- **Base de datos:** {$bd['database']}\n";
            $md .= "- **Total de tablas:** {$bd['total_tablas']}\n\n";

            $md .= "### Modelos\n";
            $md .= "**Total:** " . count($this->analisis['modelos_bd']['modelos']) . " modelos\n\n";

            foreach ($this->analisis['modelos_bd']['modelos'] as $nombre => $modelo) {
                $md .= "#### {$nombre}\n";
                $md .= "- **Tabla:** {$modelo['tabla']}\n";
                $md .= "- **Campos fillable:** " . count($modelo['fillable']) . "\n";
                $md .= "- **Relaciones:** " . count($modelo['relaciones']) . "\n";
                $md .= "- **Scopes:** " . count($modelo['scopes']) . "\n";
                $md .= "\n";
            }
        }

        // 5. Rutas
        $md .= "## 5. RUTAS\n\n";
        $md .= "### Rutas API\n";
        $md .= "**Total:** " . $this->analisis['rutas']['registradas']['api']['total'] . " rutas\n\n";

        $md .= "### Rutas Web\n";
        $md .= "**Total:** " . $this->analisis['rutas']['registradas']['web']['total'] . " rutas\n\n";

        // 6. Middleware
        $md .= "## 6. MIDDLEWARE\n\n";
        $md .= "**Total:** " . count($this->analisis['middleware']) . " middleware personalizados\n\n";

        foreach ($this->analisis['middleware'] as $nombre => $info) {
            $md .= "### {$nombre}\n";
            $md .= "- **Propósito:** {$info['proposito']}\n";
            $md .= "- **Líneas:** {$info['lineas']}\n";
            $md .= "\n";
        }

        // 7. Configuraciones
        $md .= "## 7. CONFIGURACIONES\n\n";
        $md .= "**Total:** " . count($this->analisis['configuraciones']) . " archivos de configuración\n\n";

        // 8. Sistema de eventos
        $md .= "## 8. SISTEMA DE EVENTOS\n\n";
        $md .= "- **Eventos:** " . count($this->analisis['eventos_sistema']['eventos']) . "\n";
        $md .= "- **Listeners:** " . count($this->analisis['eventos_sistema']['listeners']) . "\n";
        $md .= "- **Observers:** " . count($this->analisis['eventos_sistema']['observers']) . "\n\n";

        // 9. Jobs
        $md .= "## 9. JOBS Y COLAS\n\n";
        $md .= "- **Jobs:** " . count($this->analisis['jobs']['jobs']) . "\n";
        $md .= "- **Driver de cola:** " . $this->analisis['jobs']['queue_config']['default_driver'] . "\n\n";

        // 10. Servicios
        $md .= "## 10. SERVICIOS\n\n";
        $md .= "- **Services:** " . count($this->analisis['servicios']['services']) . "\n";
        $md .= "- **Providers:** " . count($this->analisis['servicios']['providers']) . "\n\n";

        // 11. Traits y contratos
        $md .= "## 11. TRAITS Y CONTRATOS\n\n";
        $md .= "- **Traits:** " . count($this->analisis['traits_contratos']['traits']) . "\n";
        $md .= "- **Contracts:** " . count($this->analisis['traits_contratos']['contracts']) . "\n";
        $md .= "- **Interfaces:** " . count($this->analisis['traits_contratos']['interfaces']) . "\n\n";

        // 12. Tests
        $md .= "## 12. TESTS\n\n";
        if (isset($this->analisis['tests']['Feature'])) {
            $md .= "- **Feature Tests:** " . count($this->analisis['tests']['Feature']) . "\n";
        }
        if (isset($this->analisis['tests']['Unit'])) {
            $md .= "- **Unit Tests:** " . count($this->analisis['tests']['Unit']) . "\n";
        }
        $md .= "\n";

        // 13. Dependencias
        $md .= "## 13. DEPENDENCIAS\n\n";
        $md .= "- **Dependencias de producción:** " . count($this->analisis['dependencias']['composer_json']['require']) . "\n";
        $md .= "- **Dependencias de desarrollo:** " . count($this->analisis['dependencias']['composer_json']['require_dev']) . "\n\n";

        // 14. Archivos del proyecto
        $md .= "## 14. ARCHIVOS DEL PROYECTO\n\n";
        foreach ($this->analisis['archivos_proyecto'] as $archivo => $info) {
            $estado = $info['existe'] ? '✅' : '❌';
            $md .= "- {$estado} **{$archivo}**";
            if ($info['existe']) {
                $md .= " ({$info['tamaño']} bytes)";
            }
            $md .= "\n";
        }

        $md .= "\n---\n\n";
        $md .= "**Análisis completado el:** " . now()->format('Y-m-d H:i:s') . "\n";
        $md .= "**Generado por:** Sistema de Análisis Exhaustivo EVA\n";

        return $md;
    }
}