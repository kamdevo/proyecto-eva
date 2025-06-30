<?php

namespace Tests\Performance;

use Tests\TestCase;
use App\Models\User;
use App\Models\Equipo;
use App\Models\Servicio;
use App\Models\Area;
use App\Models\Mantenimiento;
use App\Models\Contingencia;
use Illuminate\Foundation\Testing\RefreshDatabase;

/**
 * Test de rendimiento para endpoints de exportación
 * Verifica que los endpoints respondan dentro de límites aceptables
 */
class ExportPerformanceTest extends TestCase
{
    use RefreshDatabase;

    protected $user;
    protected $equipos;
    protected $servicio;
    protected $area;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Crear usuario de prueba
        $this->user = User::factory()->create([
            'rol' => 'administrador'
        ]);

        // Crear datos de prueba en cantidad
        $this->servicio = Servicio::factory()->create();
        $this->area = Area::factory()->create(['servicio_id' => $this->servicio->id]);
        
        // Crear múltiples equipos para tests de rendimiento
        $this->equipos = Equipo::factory()->count(50)->create([
            'servicio_id' => $this->servicio->id,
            'area_id' => $this->area->id
        ]);

        // Crear mantenimientos para algunos equipos
        foreach ($this->equipos->take(20) as $equipo) {
            Mantenimiento::factory()->count(3)->create([
                'equipo_id' => $equipo->id,
                'fecha_programada' => now()->addDays(rand(1, 365))
            ]);
        }

        // Crear contingencias para algunos equipos
        foreach ($this->equipos->take(10) as $equipo) {
            Contingencia::factory()->count(2)->create([
                'equipo_id' => $equipo->id,
                'fecha' => now()->subDays(rand(1, 30))
            ]);
        }
    }

    /**
     * Test: Rendimiento del endpoint de equipos consolidado con múltiples equipos
     */
    public function test_equipos_consolidado_performance_with_multiple_equipos()
    {
        $equiposIds = $this->equipos->pluck('id')->toArray();
        
        $startTime = microtime(true);
        $startMemory = memory_get_usage();
        
        $response = $this->actingAs($this->user)
            ->postJson('/api/export/equipos-consolidado', [
                'equipos_ids' => $equiposIds,
                'formato' => 'excel',
                'incluir' => [
                    'detalles_equipo' => true,
                    'cronograma' => true,
                    'cumplimiento' => true,
                    'responsables' => true,
                    'estadisticas' => true
                ]
            ]);
        
        $endTime = microtime(true);
        $endMemory = memory_get_usage();
        
        $executionTime = $endTime - $startTime;
        $memoryUsed = $endMemory - $startMemory;
        
        $response->assertStatus(200);
        
        // Verificar límites de rendimiento
        $this->assertLessThan(3.0, $executionTime, 'Exportación de 50 equipos debería completarse en menos de 3 segundos');
        $this->assertLessThan(50 * 1024 * 1024, $memoryUsed, 'Uso de memoria debería ser menor a 50MB');
        
        echo "\n📊 Rendimiento Equipos Consolidado (50 equipos):\n";
        echo "   ⏱️  Tiempo: " . round($executionTime, 3) . "s\n";
        echo "   💾 Memoria: " . round($memoryUsed / 1024 / 1024, 2) . "MB\n";
    }

    /**
     * Test: Rendimiento del endpoint de plantilla mantenimiento
     */
    public function test_plantilla_mantenimiento_performance()
    {
        $startTime = microtime(true);
        $startMemory = memory_get_usage();
        
        $response = $this->actingAs($this->user)
            ->postJson('/api/export/plantilla-mantenimiento', [
                'año' => date('Y'),
                'formato' => 'excel'
            ]);
        
        $endTime = microtime(true);
        $endMemory = memory_get_usage();
        
        $executionTime = $endTime - $startTime;
        $memoryUsed = $endMemory - $startMemory;
        
        $response->assertStatus(200);
        
        $this->assertLessThan(2.0, $executionTime, 'Plantilla de mantenimiento debería generarse en menos de 2 segundos');
        $this->assertLessThan(30 * 1024 * 1024, $memoryUsed, 'Uso de memoria debería ser menor a 30MB');
        
        echo "\n📊 Rendimiento Plantilla Mantenimiento:\n";
        echo "   ⏱️  Tiempo: " . round($executionTime, 3) . "s\n";
        echo "   💾 Memoria: " . round($memoryUsed / 1024 / 1024, 2) . "MB\n";
    }

    /**
     * Test: Rendimiento del endpoint de contingencias
     */
    public function test_contingencias_performance()
    {
        $startTime = microtime(true);
        $startMemory = memory_get_usage();
        
        $response = $this->actingAs($this->user)
            ->postJson('/api/export/contingencias', [
                'fecha_desde' => date('Y-01-01'),
                'fecha_hasta' => date('Y-12-31'),
                'formato' => 'excel'
            ]);
        
        $endTime = microtime(true);
        $endMemory = memory_get_usage();
        
        $executionTime = $endTime - $startTime;
        $memoryUsed = $endMemory - $startMemory;
        
        $response->assertStatus(200);
        
        $this->assertLessThan(2.0, $executionTime, 'Reporte de contingencias debería generarse en menos de 2 segundos');
        $this->assertLessThan(25 * 1024 * 1024, $memoryUsed, 'Uso de memoria debería ser menor a 25MB');
        
        echo "\n📊 Rendimiento Contingencias:\n";
        echo "   ⏱️  Tiempo: " . round($executionTime, 3) . "s\n";
        echo "   💾 Memoria: " . round($memoryUsed / 1024 / 1024, 2) . "MB\n";
    }

    /**
     * Test: Rendimiento comparativo entre formatos
     */
    public function test_performance_comparison_between_formats()
    {
        $formats = ['pdf', 'excel', 'csv'];
        $results = [];
        
        foreach ($formats as $format) {
            $startTime = microtime(true);
            $startMemory = memory_get_usage();
            
            $response = $this->actingAs($this->user)
                ->postJson('/api/export/equipos-criticos', [
                    'formato' => $format
                ]);
            
            $endTime = microtime(true);
            $endMemory = memory_get_usage();
            
            $executionTime = $endTime - $startTime;
            $memoryUsed = $endMemory - $startMemory;
            
            $response->assertStatus(200);
            
            $results[$format] = [
                'time' => $executionTime,
                'memory' => $memoryUsed
            ];
            
            // Límites específicos por formato
            switch ($format) {
                case 'pdf':
                    $this->assertLessThan(2.5, $executionTime, "PDF debería generarse en menos de 2.5 segundos");
                    break;
                case 'excel':
                    $this->assertLessThan(2.0, $executionTime, "Excel debería generarse en menos de 2 segundos");
                    break;
                case 'csv':
                    $this->assertLessThan(1.0, $executionTime, "CSV debería generarse en menos de 1 segundo");
                    break;
            }
        }
        
        echo "\n📊 Comparación de Rendimiento por Formato:\n";
        foreach ($results as $format => $metrics) {
            echo "   📄 {$format}: " . round($metrics['time'], 3) . "s, " . round($metrics['memory'] / 1024 / 1024, 2) . "MB\n";
        }
        
        // CSV debería ser el más rápido
        $this->assertLessThan($results['excel']['time'], $results['csv']['time'], 'CSV debería ser más rápido que Excel');
    }

    /**
     * Test: Rendimiento con carga de datos grande
     */
    public function test_performance_with_large_dataset()
    {
        // Crear más equipos para simular carga grande
        $largeEquipos = Equipo::factory()->count(100)->create([
            'servicio_id' => $this->servicio->id,
            'area_id' => $this->area->id
        ]);
        
        $equiposIds = $largeEquipos->pluck('id')->toArray();
        
        $startTime = microtime(true);
        $startMemory = memory_get_usage();
        
        $response = $this->actingAs($this->user)
            ->postJson('/api/export/equipos-consolidado', [
                'equipos_ids' => $equiposIds,
                'formato' => 'csv', // CSV es más rápido
                'incluir' => [
                    'detalles_equipo' => true,
                    'cronograma' => false,
                    'cumplimiento' => false,
                    'responsables' => false,
                    'estadisticas' => false
                ]
            ]);
        
        $endTime = microtime(true);
        $endMemory = memory_get_usage();
        
        $executionTime = $endTime - $startTime;
        $memoryUsed = $endMemory - $startMemory;
        
        $response->assertStatus(200);
        
        // Límites más amplios para dataset grande
        $this->assertLessThan(5.0, $executionTime, 'Exportación de 100 equipos debería completarse en menos de 5 segundos');
        $this->assertLessThan(100 * 1024 * 1024, $memoryUsed, 'Uso de memoria debería ser menor a 100MB');
        
        echo "\n📊 Rendimiento Dataset Grande (100 equipos):\n";
        echo "   ⏱️  Tiempo: " . round($executionTime, 3) . "s\n";
        echo "   💾 Memoria: " . round($memoryUsed / 1024 / 1024, 2) . "MB\n";
        echo "   📈 Throughput: " . round(100 / $executionTime, 2) . " equipos/segundo\n";
    }

    /**
     * Test: Rendimiento de múltiples requests concurrentes (simulado)
     */
    public function test_multiple_requests_performance()
    {
        $requestCount = 5;
        $totalTime = 0;
        $maxTime = 0;
        $minTime = PHP_FLOAT_MAX;
        
        for ($i = 0; $i < $requestCount; $i++) {
            $startTime = microtime(true);
            
            $response = $this->actingAs($this->user)
                ->postJson('/api/export/equipos-criticos', [
                    'formato' => 'csv'
                ]);
            
            $endTime = microtime(true);
            $requestTime = $endTime - $startTime;
            
            $response->assertStatus(200);
            
            $totalTime += $requestTime;
            $maxTime = max($maxTime, $requestTime);
            $minTime = min($minTime, $requestTime);
        }
        
        $avgTime = $totalTime / $requestCount;
        
        // Verificar que el promedio sea aceptable
        $this->assertLessThan(2.0, $avgTime, 'Tiempo promedio de múltiples requests debería ser menor a 2 segundos');
        $this->assertLessThan(3.0, $maxTime, 'Tiempo máximo de request debería ser menor a 3 segundos');
        
        echo "\n📊 Rendimiento Múltiples Requests ({$requestCount} requests):\n";
        echo "   ⏱️  Promedio: " . round($avgTime, 3) . "s\n";
        echo "   ⏱️  Máximo: " . round($maxTime, 3) . "s\n";
        echo "   ⏱️  Mínimo: " . round($minTime, 3) . "s\n";
    }

    /**
     * Test: Rendimiento de validación de parámetros
     */
    public function test_validation_performance()
    {
        $startTime = microtime(true);
        
        // Request con errores de validación
        $response = $this->actingAs($this->user)
            ->postJson('/api/export/equipos-consolidado', [
                'equipos_ids' => [], // Error: array vacío
                'formato' => 'invalid', // Error: formato inválido
                'incluir' => [] // Error: estructura incorrecta
            ]);
        
        $endTime = microtime(true);
        $validationTime = $endTime - $startTime;
        
        $response->assertStatus(422);
        
        // La validación debería ser muy rápida
        $this->assertLessThan(0.1, $validationTime, 'Validación debería completarse en menos de 100ms');
        
        echo "\n📊 Rendimiento Validación:\n";
        echo "   ⏱️  Tiempo: " . round($validationTime * 1000, 2) . "ms\n";
    }

    /**
     * Test: Benchmark de todos los endpoints
     */
    public function test_all_endpoints_benchmark()
    {
        $endpoints = [
            'equipos-consolidado' => [
                'equipos_ids' => [$this->equipos->first()->id],
                'formato' => 'csv',
                'incluir' => [
                    'detalles_equipo' => true,
                    'cronograma' => false,
                    'cumplimiento' => false,
                    'responsables' => false,
                    'estadisticas' => false
                ]
            ],
            'plantilla-mantenimiento' => [
                'año' => date('Y'),
                'formato' => 'csv'
            ],
            'contingencias' => [
                'fecha_desde' => date('Y-m-01'),
                'fecha_hasta' => date('Y-m-d'),
                'formato' => 'csv'
            ],
            'estadisticas-cumplimiento' => [
                'año' => date('Y'),
                'formato' => 'csv'
            ],
            'equipos-criticos' => [
                'formato' => 'csv'
            ],
            'tickets' => [
                'fecha_desde' => date('Y-m-01'),
                'fecha_hasta' => date('Y-m-d'),
                'formato' => 'csv'
            ],
            'calibraciones' => [
                'año' => date('Y'),
                'formato' => 'csv'
            ],
            'inventario-repuestos' => [
                'formato' => 'csv'
            ]
        ];
        
        echo "\n📊 Benchmark de Todos los Endpoints:\n";
        
        foreach ($endpoints as $endpoint => $params) {
            $startTime = microtime(true);
            
            $response = $this->actingAs($this->user)
                ->postJson("/api/export/{$endpoint}", $params);
            
            $endTime = microtime(true);
            $executionTime = $endTime - $startTime;
            
            $response->assertStatus(200);
            
            // Límite general de 3 segundos para cualquier endpoint
            $this->assertLessThan(3.0, $executionTime, "Endpoint {$endpoint} debería responder en menos de 3 segundos");
            
            echo "   📤 {$endpoint}: " . round($executionTime, 3) . "s\n";
        }
    }
}
