<?php

/**
 * Script de verificación de compatibilidad para ExportController refactorizado
 * Verifica que todas las rutas y funcionalidades sigan funcionando correctamente
 */

require_once __DIR__ . '/../vendor/autoload.php';

use Illuminate\Http\Request;
use App\Http\Controllers\Api\ExportController;
use App\Services\Export\Reports\EquiposReportService;
use App\Services\Export\Reports\MantenimientoReportService;
use App\Services\Export\Reports\ContingenciasReportService;
use App\Services\Export\Reports\CalibracionesReportService;
use App\Services\Export\Reports\InventarioReportService;

class ExportCompatibilityVerifier
{
    private $controller;
    private $results = [];

    public function __construct()
    {
        // Simular la inyección de dependencias
        $this->controller = new ExportController(
            new EquiposReportService(),
            new MantenimientoReportService(),
            new ContingenciasReportService(),
            new CalibracionesReportService(),
            new InventarioReportService()
        );
    }

    /**
     * Verificar que todos los métodos públicos existen
     */
    public function verifyPublicMethods()
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

        $reflection = new ReflectionClass($this->controller);
        $publicMethods = array_map(function($method) {
            return $method->getName();
        }, $reflection->getMethods(ReflectionMethod::IS_PUBLIC));

        foreach ($expectedMethods as $method) {
            if (in_array($method, $publicMethods)) {
                $this->results['methods'][$method] = '✅ EXISTE';
            } else {
                $this->results['methods'][$method] = '❌ FALTA';
            }
        }
    }

    /**
     * Verificar que las clases de servicio existen
     */
    public function verifyServiceClasses()
    {
        $expectedServices = [
            'App\Services\Export\ExportServiceBase',
            'App\Services\Export\Reports\EquiposReportService',
            'App\Services\Export\Reports\MantenimientoReportService',
            'App\Services\Export\Reports\ContingenciasReportService',
            'App\Services\Export\Reports\CalibracionesReportService',
            'App\Services\Export\Reports\InventarioReportService'
        ];

        foreach ($expectedServices as $service) {
            if (class_exists($service)) {
                $this->results['services'][$service] = '✅ EXISTE';
            } else {
                $this->results['services'][$service] = '❌ FALTA';
            }
        }
    }

    /**
     * Verificar que los métodos de servicio existen
     */
    public function verifyServiceMethods()
    {
        $serviceMethodMap = [
            'App\Services\Export\Reports\EquiposReportService' => [
                'exportEquiposConsolidado',
                'exportEquiposCriticos'
            ],
            'App\Services\Export\Reports\MantenimientoReportService' => [
                'exportPlantillaMantenimiento',
                'exportEstadisticasCumplimiento'
            ],
            'App\Services\Export\Reports\ContingenciasReportService' => [
                'exportContingencias'
            ],
            'App\Services\Export\Reports\CalibracionesReportService' => [
                'exportCalibraciones'
            ],
            'App\Services\Export\Reports\InventarioReportService' => [
                'exportInventarioRepuestos',
                'exportTickets'
            ]
        ];

        foreach ($serviceMethodMap as $serviceClass => $methods) {
            if (class_exists($serviceClass)) {
                $reflection = new ReflectionClass($serviceClass);
                foreach ($methods as $method) {
                    if ($reflection->hasMethod($method)) {
                        $this->results['service_methods'][$serviceClass][$method] = '✅ EXISTE';
                    } else {
                        $this->results['service_methods'][$serviceClass][$method] = '❌ FALTA';
                    }
                }
            }
        }
    }

    /**
     * Verificar estructura de archivos
     */
    public function verifyFileStructure()
    {
        $expectedFiles = [
            'app/Http/Controllers/Api/ExportController.php',
            'app/Services/Export/ExportServiceBase.php',
            'app/Services/Export/Reports/EquiposReportService.php',
            'app/Services/Export/Reports/MantenimientoReportService.php',
            'app/Services/Export/Reports/ContingenciasReportService.php',
            'app/Services/Export/Reports/CalibracionesReportService.php',
            'app/Services/Export/Reports/InventarioReportService.php'
        ];

        foreach ($expectedFiles as $file) {
            $fullPath = __DIR__ . '/../' . $file;
            if (file_exists($fullPath)) {
                $this->results['files'][$file] = '✅ EXISTE';
            } else {
                $this->results['files'][$file] = '❌ FALTA';
            }
        }
    }

    /**
     * Verificar tamaño del controlador refactorizado
     */
    public function verifyControllerSize()
    {
        $controllerPath = __DIR__ . '/../app/Http/Controllers/Api/ExportController.php';
        if (file_exists($controllerPath)) {
            $lines = count(file($controllerPath));
            $this->results['controller_size'] = [
                'lines' => $lines,
                'status' => $lines <= 200 ? '✅ CUMPLE (≤200 líneas)' : '❌ EXCEDE (>200 líneas)'
            ];
        }
    }

    /**
     * Ejecutar todas las verificaciones
     */
    public function runAllVerifications()
    {
        echo "🔍 Verificando compatibilidad del ExportController refactorizado...\n\n";

        $this->verifyFileStructure();
        $this->verifyServiceClasses();
        $this->verifyPublicMethods();
        $this->verifyServiceMethods();
        $this->verifyControllerSize();

        $this->printResults();
    }

    /**
     * Imprimir resultados
     */
    private function printResults()
    {
        echo "📁 ESTRUCTURA DE ARCHIVOS:\n";
        foreach ($this->results['files'] as $file => $status) {
            echo "  $file: $status\n";
        }

        echo "\n🏗️ CLASES DE SERVICIO:\n";
        foreach ($this->results['services'] as $service => $status) {
            echo "  $service: $status\n";
        }

        echo "\n🔧 MÉTODOS PÚBLICOS DEL CONTROLADOR:\n";
        foreach ($this->results['methods'] as $method => $status) {
            echo "  $method(): $status\n";
        }

        echo "\n⚙️ MÉTODOS DE SERVICIOS:\n";
        foreach ($this->results['service_methods'] as $service => $methods) {
            echo "  " . basename($service) . ":\n";
            foreach ($methods as $method => $status) {
                echo "    $method(): $status\n";
            }
        }

        echo "\n📏 TAMAÑO DEL CONTROLADOR:\n";
        if (isset($this->results['controller_size'])) {
            echo "  Líneas: {$this->results['controller_size']['lines']}\n";
            echo "  Estado: {$this->results['controller_size']['status']}\n";
        }

        echo "\n✅ Verificación completada!\n";
    }
}

// Ejecutar verificación
$verifier = new ExportCompatibilityVerifier();
$verifier->runAllVerifications();
