<?php

/**
 * Script de verificación manual de endpoints de exportación
 * Ejecuta pruebas reales contra los endpoints refactorizados
 */

require_once __DIR__ . '/../vendor/autoload.php';

use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;

class ExportEndpointsTester
{
    private $baseUrl;
    private $authToken;
    private $results = [];

    public function __construct()
    {
        $this->baseUrl = env('APP_URL', 'http://localhost:8000') . '/api';
        echo "🔍 Verificando endpoints de exportación en: {$this->baseUrl}\n\n";
    }

    /**
     * Simular autenticación (en un entorno real usarías un token válido)
     */
    private function getAuthHeaders()
    {
        return [
            'Content-Type: application/json',
            'Accept: application/json',
            'Authorization: Bearer ' . ($this->authToken ?? 'test-token')
        ];
    }

    /**
     * Realizar petición HTTP
     */
    private function makeRequest($endpoint, $data)
    {
        $url = $this->baseUrl . $endpoint;
        $ch = curl_init();

        curl_setopt_array($ch, [
            CURLOPT_URL => $url,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => json_encode($data),
            CURLOPT_HTTPHEADER => $this->getAuthHeaders(),
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 30,
            CURLOPT_SSL_VERIFYPEER => false
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);

        return [
            'http_code' => $httpCode,
            'response' => $response,
            'error' => $error
        ];
    }

    /**
     * Test endpoint de equipos consolidado
     */
    public function testEquiposConsolidado()
    {
        echo "📋 Probando: /export/equipos-consolidado\n";
        
        $data = [
            'equipos_ids' => [1, 2], // IDs de ejemplo
            'formato' => 'excel',
            'incluir' => [
                'detalles_equipo' => true,
                'cronograma' => true,
                'cumplimiento' => true,
                'responsables' => true,
                'estadisticas' => true
            ]
        ];

        $result = $this->makeRequest('/export/equipos-consolidado', $data);
        $this->evaluateResult('equipos-consolidado', $result);
    }

    /**
     * Test endpoint de plantilla mantenimiento
     */
    public function testPlantillaMantenimiento()
    {
        echo "📋 Probando: /export/plantilla-mantenimiento\n";
        
        $data = [
            'año' => date('Y'),
            'formato' => 'excel'
        ];

        $result = $this->makeRequest('/export/plantilla-mantenimiento', $data);
        $this->evaluateResult('plantilla-mantenimiento', $result);
    }

    /**
     * Test endpoint de contingencias
     */
    public function testContingencias()
    {
        echo "📋 Probando: /export/contingencias\n";
        
        $data = [
            'fecha_desde' => date('Y-m-01'),
            'fecha_hasta' => date('Y-m-d'),
            'formato' => 'excel'
        ];

        $result = $this->makeRequest('/export/contingencias', $data);
        $this->evaluateResult('contingencias', $result);
    }

    /**
     * Test endpoint de estadísticas cumplimiento
     */
    public function testEstadisticasCumplimiento()
    {
        echo "📋 Probando: /export/estadisticas-cumplimiento\n";
        
        $data = [
            'año' => date('Y'),
            'formato' => 'excel'
        ];

        $result = $this->makeRequest('/export/estadisticas-cumplimiento', $data);
        $this->evaluateResult('estadisticas-cumplimiento', $result);
    }

    /**
     * Test endpoint de equipos críticos
     */
    public function testEquiposCriticos()
    {
        echo "📋 Probando: /export/equipos-criticos\n";
        
        $data = [
            'formato' => 'excel'
        ];

        $result = $this->makeRequest('/export/equipos-criticos', $data);
        $this->evaluateResult('equipos-criticos', $result);
    }

    /**
     * Test endpoint de tickets
     */
    public function testTickets()
    {
        echo "📋 Probando: /export/tickets\n";
        
        $data = [
            'fecha_desde' => date('Y-m-01'),
            'fecha_hasta' => date('Y-m-d'),
            'formato' => 'excel'
        ];

        $result = $this->makeRequest('/export/tickets', $data);
        $this->evaluateResult('tickets', $result);
    }

    /**
     * Test endpoint de calibraciones
     */
    public function testCalibraciones()
    {
        echo "📋 Probando: /export/calibraciones\n";
        
        $data = [
            'año' => date('Y'),
            'formato' => 'excel'
        ];

        $result = $this->makeRequest('/export/calibraciones', $data);
        $this->evaluateResult('calibraciones', $result);
    }

    /**
     * Test endpoint de inventario repuestos
     */
    public function testInventarioRepuestos()
    {
        echo "📋 Probando: /export/inventario-repuestos\n";
        
        $data = [
            'formato' => 'excel'
        ];

        $result = $this->makeRequest('/export/inventario-repuestos', $data);
        $this->evaluateResult('inventario-repuestos', $result);
    }

    /**
     * Test todos los formatos
     */
    public function testAllFormats()
    {
        echo "📋 Probando todos los formatos (PDF, Excel, CSV)\n";
        
        $formats = ['pdf', 'excel', 'csv'];
        $allPassed = true;

        foreach ($formats as $format) {
            $data = ['formato' => $format];
            $result = $this->makeRequest('/export/equipos-criticos', $data);
            
            if ($result['http_code'] === 200) {
                echo "  ✅ Formato $format: OK\n";
            } else {
                echo "  ❌ Formato $format: ERROR (HTTP {$result['http_code']})\n";
                $allPassed = false;
            }
        }

        $this->results['all-formats'] = $allPassed ? 'PASS' : 'FAIL';
    }

    /**
     * Test validaciones
     */
    public function testValidations()
    {
        echo "📋 Probando validaciones de parámetros\n";
        
        // Test sin parámetros requeridos
        $result = $this->makeRequest('/export/equipos-consolidado', []);
        
        if ($result['http_code'] === 422) {
            echo "  ✅ Validación de parámetros faltantes: OK\n";
            $this->results['validations'] = 'PASS';
        } else {
            echo "  ❌ Validación de parámetros faltantes: FAIL\n";
            $this->results['validations'] = 'FAIL';
        }
    }

    /**
     * Evaluar resultado de una prueba
     */
    private function evaluateResult($endpoint, $result)
    {
        if ($result['error']) {
            echo "  ❌ ERROR de conexión: {$result['error']}\n";
            $this->results[$endpoint] = 'CONNECTION_ERROR';
            return;
        }

        switch ($result['http_code']) {
            case 200:
                echo "  ✅ Respuesta exitosa (HTTP 200)\n";
                $this->results[$endpoint] = 'PASS';
                break;
            case 422:
                echo "  ⚠️  Error de validación (HTTP 422)\n";
                $this->results[$endpoint] = 'VALIDATION_ERROR';
                break;
            case 500:
                echo "  ❌ Error del servidor (HTTP 500)\n";
                $this->results[$endpoint] = 'SERVER_ERROR';
                break;
            default:
                echo "  ❌ Código HTTP inesperado: {$result['http_code']}\n";
                $this->results[$endpoint] = 'UNEXPECTED_ERROR';
        }

        // Mostrar respuesta si hay error
        if ($result['http_code'] !== 200 && $result['response']) {
            $response = json_decode($result['response'], true);
            if ($response && isset($response['message'])) {
                echo "     Mensaje: {$response['message']}\n";
            }
        }

        echo "\n";
    }

    /**
     * Ejecutar todas las pruebas
     */
    public function runAllTests()
    {
        echo "🚀 Iniciando verificación de endpoints de exportación...\n\n";

        $this->testEquiposConsolidado();
        $this->testPlantillaMantenimiento();
        $this->testContingencias();
        $this->testEstadisticasCumplimiento();
        $this->testEquiposCriticos();
        $this->testTickets();
        $this->testCalibraciones();
        $this->testInventarioRepuestos();
        $this->testAllFormats();
        $this->testValidations();

        $this->printSummary();
    }

    /**
     * Imprimir resumen de resultados
     */
    private function printSummary()
    {
        echo "📊 RESUMEN DE RESULTADOS:\n";
        echo "=" . str_repeat("=", 50) . "\n";

        $passed = 0;
        $total = count($this->results);

        foreach ($this->results as $test => $result) {
            $status = $result === 'PASS' ? '✅' : '❌';
            echo sprintf("%-30s %s %s\n", $test, $status, $result);
            if ($result === 'PASS') $passed++;
        }

        echo "\n";
        echo "Total: $passed/$total pruebas exitosas\n";
        
        if ($passed === $total) {
            echo "🎉 ¡Todos los endpoints funcionan correctamente!\n";
        } else {
            echo "⚠️  Algunos endpoints requieren atención.\n";
        }
    }
}

// Ejecutar las pruebas
$tester = new ExportEndpointsTester();
$tester->runAllTests();
