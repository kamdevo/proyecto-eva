<?php

/**
 * Script para verificar que las clases de servicio se instancien correctamente
 * y que la inyección de dependencias funcione
 */

require_once __DIR__ . '/../vendor/autoload.php';

// Simular el entorno de Laravel
if (!defined('LARAVEL_START')) {
    define('LARAVEL_START', microtime(true));
}

class ServiceInstantiationVerifier
{
    private $results = [];

    /**
     * Verificar que todas las clases existen y se pueden instanciar
     */
    public function verifyServiceClasses()
    {
        echo "🔍 Verificando instanciación de clases de servicio...\n\n";

        $services = [
            'ExportServiceBase' => 'App\\Services\\Export\\ExportServiceBase',
            'EquiposReportService' => 'App\\Services\\Export\\Reports\\EquiposReportService',
            'MantenimientoReportService' => 'App\\Services\\Export\\Reports\\MantenimientoReportService',
            'ContingenciasReportService' => 'App\\Services\\Export\\Reports\\ContingenciasReportService',
            'CalibracionesReportService' => 'App\\Services\\Export\\Reports\\CalibracionesReportService',
            'InventarioReportService' => 'App\\Services\\Export\\Reports\\InventarioReportService'
        ];

        foreach ($services as $name => $class) {
            $this->verifyClass($name, $class);
        }
    }

    /**
     * Verificar una clase específica
     */
    private function verifyClass($name, $className)
    {
        echo "📦 Verificando: $name\n";

        // Verificar que la clase existe
        if (!class_exists($className)) {
            echo "  ❌ Clase no encontrada: $className\n";
            $this->results[$name] = 'CLASS_NOT_FOUND';
            return;
        }

        echo "  ✅ Clase encontrada\n";

        // Verificar que se puede instanciar (solo para clases concretas)
        if ($name !== 'ExportServiceBase') {
            try {
                $reflection = new ReflectionClass($className);
                
                if ($reflection->isAbstract()) {
                    echo "  ℹ️  Clase abstracta (no se puede instanciar directamente)\n";
                    $this->results[$name] = 'ABSTRACT_CLASS';
                } else {
                    // Intentar instanciar
                    $instance = new $className();
                    echo "  ✅ Instanciación exitosa\n";
                    $this->results[$name] = 'SUCCESS';
                    
                    // Verificar métodos públicos
                    $this->verifyPublicMethods($name, $instance);
                }
            } catch (Exception $e) {
                echo "  ❌ Error al instanciar: " . $e->getMessage() . "\n";
                $this->results[$name] = 'INSTANTIATION_ERROR';
            }
        } else {
            echo "  ℹ️  Clase base abstracta\n";
            $this->results[$name] = 'ABSTRACT_BASE';
        }

        echo "\n";
    }

    /**
     * Verificar métodos públicos de una instancia
     */
    private function verifyPublicMethods($serviceName, $instance)
    {
        $expectedMethods = $this->getExpectedMethods($serviceName);
        
        if (empty($expectedMethods)) {
            return;
        }

        echo "  🔧 Verificando métodos:\n";
        
        foreach ($expectedMethods as $method) {
            if (method_exists($instance, $method)) {
                echo "    ✅ $method()\n";
            } else {
                echo "    ❌ $method() - NO ENCONTRADO\n";
                $this->results[$serviceName] = 'MISSING_METHODS';
            }
        }
    }

    /**
     * Obtener métodos esperados para cada servicio
     */
    private function getExpectedMethods($serviceName)
    {
        $methodMap = [
            'EquiposReportService' => [
                'exportEquiposConsolidado',
                'exportEquiposCriticos'
            ],
            'MantenimientoReportService' => [
                'exportPlantillaMantenimiento',
                'exportEstadisticasCumplimiento'
            ],
            'ContingenciasReportService' => [
                'exportContingencias'
            ],
            'CalibracionesReportService' => [
                'exportCalibraciones'
            ],
            'InventarioReportService' => [
                'exportInventarioRepuestos',
                'exportTickets'
            ]
        ];

        return $methodMap[$serviceName] ?? [];
    }

    /**
     * Verificar que el ExportController se puede instanciar con inyección de dependencias
     */
    public function verifyControllerInstantiation()
    {
        echo "🎯 Verificando instanciación del ExportController...\n\n";

        try {
            // Instanciar servicios
            $equiposService = new \App\Services\Export\Reports\EquiposReportService();
            $mantenimientoService = new \App\Services\Export\Reports\MantenimientoReportService();
            $contingenciasService = new \App\Services\Export\Reports\ContingenciasReportService();
            $calibracionesService = new \App\Services\Export\Reports\CalibracionesReportService();
            $inventarioService = new \App\Services\Export\Reports\InventarioReportService();

            echo "  ✅ Todos los servicios instanciados correctamente\n";

            // Verificar que el controlador existe
            if (!class_exists('App\\Http\\Controllers\\Api\\ExportController')) {
                echo "  ❌ ExportController no encontrado\n";
                $this->results['ExportController'] = 'CONTROLLER_NOT_FOUND';
                return;
            }

            echo "  ✅ ExportController encontrado\n";

            // Intentar instanciar el controlador con dependencias
            $controller = new \App\Http\Controllers\Api\ExportController(
                $equiposService,
                $mantenimientoService,
                $contingenciasService,
                $calibracionesService,
                $inventarioService
            );

            echo "  ✅ ExportController instanciado con inyección de dependencias\n";
            $this->results['ExportController'] = 'SUCCESS';

            // Verificar métodos del controlador
            $this->verifyControllerMethods($controller);

        } catch (Exception $e) {
            echo "  ❌ Error al instanciar ExportController: " . $e->getMessage() . "\n";
            $this->results['ExportController'] = 'CONTROLLER_ERROR';
        }

        echo "\n";
    }

    /**
     * Verificar métodos del controlador
     */
    private function verifyControllerMethods($controller)
    {
        $expectedMethods = [
            'exportEquiposConsolidado',
            'exportPlantillaMantenimiento',
            'exportContingencias',
            'exportEstadisticasCumplimiento',
            'exportEquiposCriticos',
            'exportTickets',
            'exportCalibraciones',
            'exportInventarioRepuestos'
        ];

        echo "  🔧 Verificando métodos del controlador:\n";
        
        foreach ($expectedMethods as $method) {
            if (method_exists($controller, $method)) {
                echo "    ✅ $method()\n";
            } else {
                echo "    ❌ $method() - NO ENCONTRADO\n";
                $this->results['ExportController'] = 'MISSING_CONTROLLER_METHODS';
            }
        }
    }

    /**
     * Verificar estructura de archivos
     */
    public function verifyFileStructure()
    {
        echo "📁 Verificando estructura de archivos...\n\n";

        $expectedFiles = [
            'ExportController' => 'app/Http/Controllers/Api/ExportController.php',
            'ExportServiceBase' => 'app/Services/Export/ExportServiceBase.php',
            'EquiposReportService' => 'app/Services/Export/Reports/EquiposReportService.php',
            'MantenimientoReportService' => 'app/Services/Export/Reports/MantenimientoReportService.php',
            'ContingenciasReportService' => 'app/Services/Export/Reports/ContingenciasReportService.php',
            'CalibracionesReportService' => 'app/Services/Export/Reports/CalibracionesReportService.php',
            'InventarioReportService' => 'app/Services/Export/Reports/InventarioReportService.php'
        ];

        foreach ($expectedFiles as $name => $file) {
            $fullPath = __DIR__ . '/../' . $file;
            if (file_exists($fullPath)) {
                echo "  ✅ $name: $file\n";
            } else {
                echo "  ❌ $name: $file - NO ENCONTRADO\n";
                $this->results[$name . '_file'] = 'FILE_NOT_FOUND';
            }
        }

        echo "\n";
    }

    /**
     * Ejecutar todas las verificaciones
     */
    public function runAllVerifications()
    {
        echo "🚀 Iniciando verificación de instanciación de servicios...\n\n";

        $this->verifyFileStructure();
        $this->verifyServiceClasses();
        $this->verifyControllerInstantiation();

        $this->printSummary();
    }

    /**
     * Imprimir resumen
     */
    private function printSummary()
    {
        echo "📊 RESUMEN DE VERIFICACIÓN:\n";
        echo "=" . str_repeat("=", 50) . "\n";

        $success = 0;
        $total = count($this->results);

        foreach ($this->results as $component => $status) {
            $icon = in_array($status, ['SUCCESS', 'ABSTRACT_CLASS', 'ABSTRACT_BASE']) ? '✅' : '❌';
            echo sprintf("%-30s %s %s\n", $component, $icon, $status);
            
            if (in_array($status, ['SUCCESS', 'ABSTRACT_CLASS', 'ABSTRACT_BASE'])) {
                $success++;
            }
        }

        echo "\n";
        echo "Componentes verificados: $success/$total\n";

        if ($success === $total) {
            echo "🎉 ¡Todas las clases se instancian correctamente!\n";
        } else {
            echo "⚠️  Algunos componentes requieren atención.\n";
        }
    }
}

// Ejecutar verificación
$verifier = new ServiceInstantiationVerifier();
$verifier->runAllVerifications();
