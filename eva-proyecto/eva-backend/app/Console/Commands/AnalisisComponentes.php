<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Exception;

class AnalisisComponentes extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'proyecto:analizar-componentes {--output=analisis_componentes.md}';

    /**
     * The console command description.
     */
    protected $description = 'Analiza en detalle los componentes específicos del sistema EVA';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🔍 ANALIZANDO COMPONENTES ESPECÍFICOS DEL SISTEMA EVA');
        $this->info('==================================================');
        
        $output = $this->option('output');
        
        try {
            $analisis = [];
            
            // 1. Analizar controladores específicos
            $analisis['controladores'] = $this->analizarControladores();
            
            // 2. Analizar modelos y relaciones
            $analisis['modelos'] = $this->analizarModelosDetallado();
            
            // 3. Analizar middleware personalizado
            $analisis['middleware'] = $this->analizarMiddlewarePersonalizado();
            
            // 4. Analizar eventos y listeners
            $analisis['eventos'] = $this->analizarEventosDetallado();
            
            // 5. Analizar servicios personalizados
            $analisis['servicios'] = $this->analizarServiciosPersonalizados();
            
            // 6. Analizar traits y contratos
            $analisis['traits'] = $this->analizarTraits();
            
            // 7. Analizar observers
            $analisis['observers'] = $this->analizarObservers();
            
            // 8. Analizar jobs
            $analisis['jobs'] = $this->analizarJobsDetallado();
            
            // 9. Generar informe
            $this->generarInformeComponentes($analisis, $output);
            
            $this->info("✅ Análisis de componentes completado: {$output}");
            
        } catch (Exception $e) {
            $this->error('❌ Error analizando componentes: ' . $e->getMessage());
            return 1;
        }
        
        return 0;
    }

    /**
     * Analizar controladores específicos
     */
    protected function analizarControladores()
    {
        $this->info('1. Analizando controladores...');
        
        $controllerPath = app_path('Http/Controllers/Api');
        $controladores = [];
        
        if (File::exists($controllerPath)) {
            $archivos = File::files($controllerPath);
            
            foreach ($archivos as $archivo) {
                $nombre = pathinfo($archivo->getFilename(), PATHINFO_FILENAME);
                $contenido = File::get($archivo->getPathname());
                
                $controladores[$nombre] = [
                    'archivo' => $archivo->getFilename(),
                    'tamaño' => $archivo->getSize(),
                    'lineas' => substr_count($contenido, "\n") + 1,
                    'metodos' => $this->extraerMetodos($contenido),
                    'dependencias' => $this->extraerDependencias($contenido),
                    'funcionalidad' => $this->determinarFuncionalidad($nombre)
                ];
            }
        }
        
        return $controladores;
    }

    /**
     * Extraer métodos de un archivo
     */
    protected function extraerMetodos($contenido)
    {
        preg_match_all('/public function (\w+)\s*\(/', $contenido, $matches);
        return $matches[1] ?? [];
    }

    /**
     * Extraer dependencias (use statements)
     */
    protected function extraerDependencias($contenido)
    {
        preg_match_all('/use ([^;]+);/', $contenido, $matches);
        return array_map('trim', $matches[1] ?? []);
    }

    /**
     * Determinar funcionalidad del controlador
     */
    protected function determinarFuncionalidad($nombre)
    {
        $funcionalidades = [
            'AuthController' => 'Autenticación y autorización de usuarios',
            'EquipmentController' => 'Gestión completa de equipos médicos',
            'ContingenciaController' => 'Manejo de contingencias y eventos adversos',
            'MantenimientoController' => 'Gestión de mantenimientos preventivos y correctivos',
            'CalibracionController' => 'Control de calibraciones de equipos',
            'DashboardController' => 'Dashboard principal y estadísticas',
            'AdministradorController' => 'Administración de usuarios del sistema',
            'FileController' => 'Gestión de archivos y documentos',
            'ExportController' => 'Exportación de datos y reportes',
            'SystemManagerController' => 'Gestión integral del sistema'
        ];
        
        return $funcionalidades[$nombre] ?? 'Funcionalidad específica del módulo';
    }

    /**
     * Analizar modelos en detalle
     */
    protected function analizarModelosDetallado()
    {
        $this->info('2. Analizando modelos...');
        
        $modelPath = app_path('Models');
        $modelos = [];
        
        if (File::exists($modelPath)) {
            $archivos = File::files($modelPath);
            
            foreach ($archivos as $archivo) {
                $nombre = pathinfo($archivo->getFilename(), PATHINFO_FILENAME);
                $contenido = File::get($archivo->getPathname());
                
                $modelos[$nombre] = [
                    'archivo' => $archivo->getFilename(),
                    'tamaño' => $archivo->getSize(),
                    'lineas' => substr_count($contenido, "\n") + 1,
                    'fillable' => $this->extraerFillable($contenido),
                    'relaciones' => $this->extraerRelaciones($contenido),
                    'scopes' => $this->extraerScopes($contenido),
                    'traits' => $this->extraerTraits($contenido),
                    'tabla' => $this->extraerTabla($contenido, $nombre)
                ];
            }
        }
        
        return $modelos;
    }

    /**
     * Extraer campos fillable
     */
    protected function extraerFillable($contenido)
    {
        if (preg_match('/protected \$fillable\s*=\s*\[(.*?)\];/s', $contenido, $matches)) {
            $fillable = $matches[1];
            preg_match_all("/'([^']+)'/", $fillable, $campos);
            return $campos[1] ?? [];
        }
        return [];
    }

    /**
     * Extraer relaciones del modelo
     */
    protected function extraerRelaciones($contenido)
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
    protected function extraerScopes($contenido)
    {
        preg_match_all('/public function scope(\w+)\(/', $contenido, $matches);
        return $matches[1] ?? [];
    }

    /**
     * Extraer traits utilizados
     */
    protected function extraerTraits($contenido)
    {
        if (preg_match('/use\s+([^;{]+);/', $contenido, $matches)) {
            return array_map('trim', explode(',', $matches[1]));
        }
        return [];
    }

    /**
     * Extraer nombre de tabla
     */
    protected function extraerTabla($contenido, $nombreModelo)
    {
        if (preg_match('/protected \$table\s*=\s*[\'"]([^\'"]+)[\'"]/', $contenido, $matches)) {
            return $matches[1];
        }
        return strtolower($nombreModelo) . 's'; // Convención Laravel
    }

    /**
     * Analizar middleware personalizado
     */
    protected function analizarMiddlewarePersonalizado()
    {
        $this->info('3. Analizando middleware...');
        
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
                    'proposito' => $this->determinarPropositoMiddleware($nombre, $contenido)
                ];
            }
        }
        
        return $middleware;
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
            'ReactApiMiddleware' => 'Middleware específico para API React'
        ];
        
        return $propositos[$nombre] ?? 'Middleware personalizado del sistema';
    }

    /**
     * Analizar eventos en detalle
     */
    protected function analizarEventosDetallado()
    {
        $this->info('4. Analizando eventos...');
        
        $eventsPath = app_path('Events');
        $listenersPath = app_path('Listeners');
        
        $eventos = [];
        $listeners = [];
        
        // Analizar eventos
        if (File::exists($eventsPath)) {
            $archivos = File::files($eventsPath);
            foreach ($archivos as $archivo) {
                $nombre = pathinfo($archivo->getFilename(), PATHINFO_FILENAME);
                $contenido = File::get($archivo->getPathname());
                
                $eventos[$nombre] = [
                    'archivo' => $archivo->getFilename(),
                    'tamaño' => $archivo->getSize(),
                    'propiedades' => $this->extraerPropiedadesEvento($contenido)
                ];
            }
        }
        
        // Analizar listeners
        if (File::exists($listenersPath)) {
            $archivos = File::files($listenersPath);
            foreach ($archivos as $archivo) {
                $nombre = pathinfo($archivo->getFilename(), PATHINFO_FILENAME);
                $contenido = File::get($archivo->getPathname());
                
                $listeners[$nombre] = [
                    'archivo' => $archivo->getFilename(),
                    'tamaño' => $archivo->getSize(),
                    'metodos' => $this->extraerMetodos($contenido)
                ];
            }
        }
        
        return [
            'eventos' => $eventos,
            'listeners' => $listeners
        ];
    }

    /**
     * Extraer propiedades de evento
     */
    protected function extraerPropiedadesEvento($contenido)
    {
        preg_match_all('/public \$(\w+);/', $contenido, $matches);
        return $matches[1] ?? [];
    }

    /**
     * Analizar servicios personalizados
     */
    protected function analizarServiciosPersonalizados()
    {
        $this->info('5. Analizando servicios...');
        
        $servicesPath = app_path('Services');
        $servicios = [];
        
        if (File::exists($servicesPath)) {
            $archivos = File::files($servicesPath);
            
            foreach ($archivos as $archivo) {
                $nombre = pathinfo($archivo->getFilename(), PATHINFO_FILENAME);
                $contenido = File::get($archivo->getPathname());
                
                $servicios[$nombre] = [
                    'archivo' => $archivo->getFilename(),
                    'tamaño' => $archivo->getSize(),
                    'metodos' => $this->extraerMetodos($contenido),
                    'dependencias' => $this->extraerDependencias($contenido)
                ];
            }
        }
        
        return $servicios;
    }

    /**
     * Analizar traits
     */
    protected function analizarTraits()
    {
        $this->info('6. Analizando traits...');
        
        $traitsPath = app_path('Traits');
        $traits = [];
        
        if (File::exists($traitsPath)) {
            $archivos = File::files($traitsPath);
            
            foreach ($archivos as $archivo) {
                $nombre = pathinfo($archivo->getFilename(), PATHINFO_FILENAME);
                $contenido = File::get($archivo->getPathname());
                
                $traits[$nombre] = [
                    'archivo' => $archivo->getFilename(),
                    'tamaño' => $archivo->getSize(),
                    'metodos' => $this->extraerMetodos($contenido),
                    'proposito' => $this->determinarPropositoTrait($nombre)
                ];
            }
        }
        
        return $traits;
    }

    /**
     * Determinar propósito del trait
     */
    protected function determinarPropositoTrait($nombre)
    {
        $propositos = [
            'Auditable' => 'Funcionalidad de auditoría para modelos',
            'Cacheable' => 'Sistema de caché para modelos',
            'ValidatesData' => 'Validación de datos personalizada'
        ];
        
        return $propositos[$nombre] ?? 'Trait personalizado del sistema';
    }

    /**
     * Analizar observers
     */
    protected function analizarObservers()
    {
        $this->info('7. Analizando observers...');
        
        $observersPath = app_path('Observers');
        $observers = [];
        
        if (File::exists($observersPath)) {
            $archivos = File::files($observersPath);
            
            foreach ($archivos as $archivo) {
                $nombre = pathinfo($archivo->getFilename(), PATHINFO_FILENAME);
                $contenido = File::get($archivo->getPathname());
                
                $observers[$nombre] = [
                    'archivo' => $archivo->getFilename(),
                    'tamaño' => $archivo->getSize(),
                    'metodos' => $this->extraerMetodos($contenido)
                ];
            }
        }
        
        return $observers;
    }

    /**
     * Analizar jobs en detalle
     */
    protected function analizarJobsDetallado()
    {
        $this->info('8. Analizando jobs...');
        
        $jobsPath = app_path('Jobs');
        $jobs = [];
        
        if (File::exists($jobsPath)) {
            $archivos = File::files($jobsPath);
            
            foreach ($archivos as $archivo) {
                $nombre = pathinfo($archivo->getFilename(), PATHINFO_FILENAME);
                $contenido = File::get($archivo->getPathname());
                
                $jobs[$nombre] = [
                    'archivo' => $archivo->getFilename(),
                    'tamaño' => $archivo->getSize(),
                    'metodos' => $this->extraerMetodos($contenido),
                    'interfaces' => $this->extraerInterfaces($contenido)
                ];
            }
        }
        
        return $jobs;
    }

    /**
     * Extraer interfaces implementadas
     */
    protected function extraerInterfaces($contenido)
    {
        if (preg_match('/implements\s+([^{]+)/', $contenido, $matches)) {
            return array_map('trim', explode(',', $matches[1]));
        }
        return [];
    }

    /**
     * Generar informe de componentes
     */
    protected function generarInformeComponentes($analisis, $output)
    {
        $this->info('9. Generando informe...');
        
        $md = "# Análisis Detallado de Componentes - Sistema EVA\n\n";
        $md .= "**Fecha de análisis:** " . now()->format('Y-m-d H:i:s') . "\n\n";
        
        // Controladores
        $md .= "## 1. Controladores API\n\n";
        foreach ($analisis['controladores'] as $nombre => $info) {
            $md .= "### {$nombre}\n";
            $md .= "- **Funcionalidad:** {$info['funcionalidad']}\n";
            $md .= "- **Archivo:** {$info['archivo']}\n";
            $md .= "- **Líneas de código:** {$info['lineas']}\n";
            $md .= "- **Métodos públicos:** " . count($info['metodos']) . "\n";
            if (!empty($info['metodos'])) {
                $md .= "- **Métodos:** " . implode(', ', $info['metodos']) . "\n";
            }
            $md .= "\n";
        }
        
        // Modelos
        $md .= "## 2. Modelos Eloquent\n\n";
        foreach ($analisis['modelos'] as $nombre => $info) {
            $md .= "### {$nombre}\n";
            $md .= "- **Tabla:** {$info['tabla']}\n";
            $md .= "- **Campos fillable:** " . count($info['fillable']) . "\n";
            $md .= "- **Relaciones:** " . count($info['relaciones']) . "\n";
            $md .= "- **Scopes:** " . count($info['scopes']) . "\n";
            if (!empty($info['traits'])) {
                $md .= "- **Traits:** " . implode(', ', $info['traits']) . "\n";
            }
            $md .= "\n";
        }
        
        // Middleware
        $md .= "## 3. Middleware Personalizado\n\n";
        foreach ($analisis['middleware'] as $nombre => $info) {
            $md .= "### {$nombre}\n";
            $md .= "- **Propósito:** {$info['proposito']}\n";
            $md .= "- **Archivo:** {$info['archivo']}\n";
            $md .= "\n";
        }
        
        // Eventos y Listeners
        $md .= "## 4. Sistema de Eventos\n\n";
        $md .= "### Eventos\n";
        foreach ($analisis['eventos']['eventos'] as $nombre => $info) {
            $md .= "- **{$nombre}:** " . count($info['propiedades']) . " propiedades\n";
        }
        $md .= "\n### Listeners\n";
        foreach ($analisis['eventos']['listeners'] as $nombre => $info) {
            $md .= "- **{$nombre}:** " . count($info['metodos']) . " métodos\n";
        }
        $md .= "\n";
        
        // Servicios
        $md .= "## 5. Servicios Personalizados\n\n";
        foreach ($analisis['servicios'] as $nombre => $info) {
            $md .= "### {$nombre}\n";
            $md .= "- **Métodos:** " . count($info['metodos']) . "\n";
            $md .= "- **Dependencias:** " . count($info['dependencias']) . "\n";
            $md .= "\n";
        }
        
        // Traits
        $md .= "## 6. Traits\n\n";
        foreach ($analisis['traits'] as $nombre => $info) {
            $md .= "### {$nombre}\n";
            $md .= "- **Propósito:** {$info['proposito']}\n";
            $md .= "- **Métodos:** " . count($info['metodos']) . "\n";
            $md .= "\n";
        }
        
        // Observers
        $md .= "## 7. Observers\n\n";
        foreach ($analisis['observers'] as $nombre => $info) {
            $md .= "### {$nombre}\n";
            $md .= "- **Métodos:** " . count($info['metodos']) . "\n";
            $md .= "\n";
        }
        
        // Jobs
        $md .= "## 8. Jobs\n\n";
        foreach ($analisis['jobs'] as $nombre => $info) {
            $md .= "### {$nombre}\n";
            $md .= "- **Métodos:** " . count($info['metodos']) . "\n";
            $md .= "- **Interfaces:** " . implode(', ', $info['interfaces']) . "\n";
            $md .= "\n";
        }
        
        File::put(base_path($output), $md);
    }
}
