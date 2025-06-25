<?php

/**
 * Script para verificar que todos los endpoints estén correctamente documentados
 * Analiza las rutas definidas y verifica su documentación
 */

class EndpointsDocumentationVerifier
{
    private $routesFile;
    private $controllersDir;
    private $results = [];

    public function __construct()
    {
        $this->routesFile = __DIR__ . '/../routes/api.php';
        $this->controllersDir = __DIR__ . '/../app/Http/Controllers/Api/';
    }

    /**
     * Extraer rutas del archivo api.php
     */
    public function extractRoutes()
    {
        echo "🔍 Extrayendo rutas del archivo api.php...\n";

        $content = file_get_contents($this->routesFile);
        $routes = [];

        // Buscar rutas Route::
        preg_match_all('/Route::(get|post|put|patch|delete|apiResource)\s*\(\s*[\'"]([^\'"]+)[\'"]/', $content, $matches, PREG_SET_ORDER);

        foreach ($matches as $match) {
            $method = $match[1];
            $path = $match[2];
            
            // Convertir apiResource a rutas individuales
            if ($method === 'apiResource') {
                $routes[] = ['method' => 'GET', 'path' => $path, 'type' => 'resource_index'];
                $routes[] = ['method' => 'POST', 'path' => $path, 'type' => 'resource_store'];
                $routes[] = ['method' => 'GET', 'path' => $path . '/{id}', 'type' => 'resource_show'];
                $routes[] = ['method' => 'PUT', 'path' => $path . '/{id}', 'type' => 'resource_update'];
                $routes[] = ['method' => 'DELETE', 'path' => $path . '/{id}', 'type' => 'resource_destroy'];
            } else {
                $routes[] = ['method' => strtoupper($method), 'path' => $path, 'type' => 'single'];
            }
        }

        echo "✅ Encontradas " . count($routes) . " rutas\n\n";
        return $routes;
    }

    /**
     * Verificar controladores con documentación Swagger
     */
    public function verifyControllersDocumentation()
    {
        echo "📋 Verificando documentación en controladores...\n";

        $controllers = glob($this->controllersDir . '*.php');
        $documented = 0;
        $total = count($controllers);

        foreach ($controllers as $controller) {
            $content = file_get_contents($controller);
            $controllerName = basename($controller, '.php');
            
            // Verificar si tiene anotaciones @OA\
            $hasSwaggerDocs = preg_match('/@OA\\\\/', $content);
            
            // Contar métodos públicos
            preg_match_all('/public\s+function\s+(\w+)\s*\(/', $content, $methods);
            $publicMethods = count($methods[1]);
            
            // Contar métodos documentados
            preg_match_all('/@OA\\\\(Get|Post|Put|Patch|Delete|Info|Tag)/', $content, $docMethods);
            $documentedMethods = count($docMethods[0]);

            $this->results['controllers'][$controllerName] = [
                'has_swagger_docs' => $hasSwaggerDocs,
                'public_methods' => $publicMethods,
                'documented_methods' => $documentedMethods,
                'documentation_percentage' => $publicMethods > 0 ? round(($documentedMethods / $publicMethods) * 100, 2) : 0
            ];

            if ($hasSwaggerDocs) {
                $documented++;
            }

            echo "  📄 {$controllerName}: ";
            echo $hasSwaggerDocs ? "✅ Documentado" : "❌ Sin documentar";
            echo " ({$documentedMethods}/{$publicMethods} métodos)\n";
        }

        $this->results['controllers_summary'] = [
            'total' => $total,
            'documented' => $documented,
            'percentage' => round(($documented / $total) * 100, 2)
        ];

        echo "\n📊 Resumen controladores: {$documented}/{$total} documentados ({$this->results['controllers_summary']['percentage']}%)\n\n";
    }

    /**
     * Verificar endpoints específicos de exportación
     */
    public function verifyExportEndpoints()
    {
        echo "📤 Verificando endpoints de exportación refactorizados...\n";

        $exportEndpoints = [
            '/export/equipos-consolidado',
            '/export/plantilla-mantenimiento',
            '/export/contingencias',
            '/export/estadisticas-cumplimiento',
            '/export/equipos-criticos',
            '/export/tickets',
            '/export/calibraciones',
            '/export/inventario-repuestos'
        ];

        $exportController = $this->controllersDir . 'ExportController.php';
        $content = file_get_contents($exportController);

        foreach ($exportEndpoints as $endpoint) {
            $methodName = $this->pathToMethodName($endpoint);
            
            // Verificar si el método existe
            $methodExists = preg_match("/public\s+function\s+{$methodName}\s*\(/", $content);
            
            // Verificar si tiene documentación Swagger
            $escapedEndpoint = preg_quote($endpoint, '/');
            $hasSwaggerDoc = preg_match("/@OA\\\\Post\s*\(\s*[^)]*path\s*=\s*['\"]\/api" . $escapedEndpoint . "['\"]/", $content);
            
            $this->results['export_endpoints'][$endpoint] = [
                'method_exists' => $methodExists,
                'has_documentation' => $hasSwaggerDoc,
                'status' => $methodExists && $hasSwaggerDoc ? 'COMPLETE' : 'INCOMPLETE'
            ];

            echo "  📤 {$endpoint}: ";
            echo $methodExists ? "✅ Método" : "❌ Método";
            echo " | ";
            echo $hasSwaggerDoc ? "✅ Docs" : "❌ Docs";
            echo " | ";
            echo $this->results['export_endpoints'][$endpoint]['status'] === 'COMPLETE' ? "✅ COMPLETO" : "⚠️ INCOMPLETO";
            echo "\n";
        }

        $completeEndpoints = array_filter($this->results['export_endpoints'], function($ep) {
            return $ep['status'] === 'COMPLETE';
        });

        echo "\n📊 Endpoints de exportación: " . count($completeEndpoints) . "/" . count($exportEndpoints) . " completos\n\n";
    }

    /**
     * Convertir path a nombre de método
     */
    private function pathToMethodName($path)
    {
        $methodMap = [
            '/export/equipos-consolidado' => 'exportEquiposConsolidado',
            '/export/plantilla-mantenimiento' => 'exportPlantillaMantenimiento',
            '/export/contingencias' => 'exportContingencias',
            '/export/estadisticas-cumplimiento' => 'exportEstadisticasCumplimiento',
            '/export/equipos-criticos' => 'exportEquiposCriticos',
            '/export/tickets' => 'exportTickets',
            '/export/calibraciones' => 'exportCalibraciones',
            '/export/inventario-repuestos' => 'exportInventarioRepuestos'
        ];

        return $methodMap[$path] ?? '';
    }

    /**
     * Verificar archivos de documentación generados
     */
    public function verifyGeneratedDocs()
    {
        echo "📚 Verificando archivos de documentación generados...\n";

        $docFiles = [
            'docs/api/openapi.json' => 'OpenAPI JSON',
            'docs/api/index.html' => 'Swagger UI HTML',
            'docs/api/API_DOCUMENTATION.md' => 'Documentación Markdown',
            'docs/api/api_stats.json' => 'Estadísticas API',
            'public/docs/openapi.json' => 'OpenAPI JSON (público)',
            'public/docs/index.html' => 'Swagger UI HTML (público)',
            'docs/SERVICIOS_ESPECIALIZADOS.md' => 'Documentación Servicios',
            'docs/EJEMPLOS_ENDPOINTS_EXPORTACION.md' => 'Ejemplos de Endpoints'
        ];

        foreach ($docFiles as $file => $description) {
            $fullPath = __DIR__ . '/../' . $file;
            $exists = file_exists($fullPath);
            
            $this->results['documentation_files'][$file] = [
                'exists' => $exists,
                'size' => $exists ? filesize($fullPath) : 0,
                'description' => $description
            ];

            echo "  📄 {$description}: ";
            echo $exists ? "✅ Existe" : "❌ Falta";
            if ($exists) {
                echo " (" . round(filesize($fullPath) / 1024, 2) . " KB)";
            }
            echo "\n";
        }

        $existingFiles = array_filter($this->results['documentation_files'], function($file) {
            return $file['exists'];
        });

        echo "\n📊 Archivos de documentación: " . count($existingFiles) . "/" . count($docFiles) . " generados\n\n";
    }

    /**
     * Generar reporte de cobertura
     */
    public function generateCoverageReport()
    {
        echo "📈 Generando reporte de cobertura de documentación...\n";

        $report = [
            'timestamp' => date('Y-m-d H:i:s'),
            'summary' => [
                'controllers_documented' => $this->results['controllers_summary']['percentage'] ?? 0,
                'export_endpoints_complete' => 0,
                'documentation_files_generated' => 0
            ],
            'details' => $this->results
        ];

        // Calcular porcentajes
        if (isset($this->results['export_endpoints'])) {
            $completeEndpoints = array_filter($this->results['export_endpoints'], function($ep) {
                return $ep['status'] === 'COMPLETE';
            });
            $report['summary']['export_endpoints_complete'] = round((count($completeEndpoints) / count($this->results['export_endpoints'])) * 100, 2);
        }

        if (isset($this->results['documentation_files'])) {
            $existingFiles = array_filter($this->results['documentation_files'], function($file) {
                return $file['exists'];
            });
            $report['summary']['documentation_files_generated'] = round((count($existingFiles) / count($this->results['documentation_files'])) * 100, 2);
        }

        // Calcular cobertura general
        $overallCoverage = round((
            $report['summary']['controllers_documented'] +
            $report['summary']['export_endpoints_complete'] +
            $report['summary']['documentation_files_generated']
        ) / 3, 2);

        $report['summary']['overall_coverage'] = $overallCoverage;

        $reportFile = __DIR__ . '/../docs/api/documentation_coverage_report.json';
        file_put_contents($reportFile, json_encode($report, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

        echo "✅ Reporte generado: {$reportFile}\n";
        echo "\n📊 COBERTURA GENERAL DE DOCUMENTACIÓN: {$overallCoverage}%\n";
        echo "   - Controladores documentados: {$report['summary']['controllers_documented']}%\n";
        echo "   - Endpoints de exportación completos: {$report['summary']['export_endpoints_complete']}%\n";
        echo "   - Archivos de documentación generados: {$report['summary']['documentation_files_generated']}%\n";

        return $overallCoverage;
    }

    /**
     * Ejecutar verificación completa
     */
    public function runCompleteVerification()
    {
        echo "🚀 Iniciando verificación completa de documentación de endpoints...\n\n";

        $this->extractRoutes();
        $this->verifyControllersDocumentation();
        $this->verifyExportEndpoints();
        $this->verifyGeneratedDocs();
        $coverage = $this->generateCoverageReport();

        echo "\n🎯 RESULTADO FINAL:\n";
        if ($coverage >= 95) {
            echo "🎉 EXCELENTE: Documentación prácticamente completa ({$coverage}%)\n";
        } elseif ($coverage >= 85) {
            echo "✅ BUENO: Documentación en buen estado ({$coverage}%)\n";
        } elseif ($coverage >= 70) {
            echo "⚠️ REGULAR: Documentación necesita mejoras ({$coverage}%)\n";
        } else {
            echo "❌ DEFICIENTE: Documentación requiere trabajo significativo ({$coverage}%)\n";
        }

        echo "\n📚 Documentación disponible en:\n";
        echo "   - http://localhost:8000/docs/ (Swagger UI)\n";
        echo "   - docs/api/ (archivos técnicos)\n";
        echo "   - docs/SERVICIOS_ESPECIALIZADOS.md\n";
        echo "   - docs/EJEMPLOS_ENDPOINTS_EXPORTACION.md\n";
    }
}

// Ejecutar verificación
$verifier = new EndpointsDocumentationVerifier();
$verifier->runCompleteVerification();
