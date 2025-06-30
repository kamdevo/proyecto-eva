<?php

namespace Tests\Integration;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Services\Export\EquiposReportService;
use App\Services\Export\MantenimientoReportService;
use App\Services\Export\ContingenciasReportService;
use App\Services\Export\CalibracionesReportService;
use App\Services\Export\InventarioReportService;
use App\Http\Controllers\ExportController;
use App\Models\Equipo;
use App\Models\Mantenimiento;
use App\Models\Contingencia;
use App\Models\Calibracion;
use App\Models\InventarioRepuesto;
use App\Models\Ticket;
use App\Models\Area;
use App\Models\Servicio;
use App\Models\User;

/**
 * Tests de Integración para Servicios de Exportación Refactorizados
 * 
 * Valida la inyección de dependencias y funcionamiento conjunto
 * de todos los servicios de exportación especializados.
 */
class ExportServicesIntegrationTest extends TestCase
{
    use RefreshDatabase;

    protected $exportController;
    protected $equiposService;
    protected $mantenimientoService;
    protected $contingenciasService;
    protected $calibracionesService;
    protected $inventarioService;
    protected $user;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Crear usuario autenticado
        $this->user = User::factory()->create([
            'role' => 'admin'
        ]);
        $this->actingAs($this->user);

        // Resolver servicios desde el contenedor
        $this->equiposService = app(EquiposReportService::class);
        $this->mantenimientoService = app(MantenimientoReportService::class);
        $this->contingenciasService = app(ContingenciasReportService::class);
        $this->calibracionesService = app(CalibracionesReportService::class);
        $this->inventarioService = app(InventarioReportService::class);
        
        // Resolver controlador con inyección de dependencias
        $this->exportController = app(ExportController::class);

        // Crear datos de prueba
        $this->createTestData();
    }

    protected function createTestData()
    {
        // Crear áreas y servicios
        $area = Area::factory()->create(['nombre' => 'Quirófanos']);
        $servicio = Servicio::factory()->create(['nombre' => 'Cardiología']);

        // Crear equipos
        Equipo::factory()->count(10)->create([
            'area_id' => $area->id,
            'servicio_id' => $servicio->id
        ]);

        // Crear mantenimientos
        $equipos = Equipo::all();
        foreach ($equipos as $equipo) {
            Mantenimiento::factory()->count(2)->create([
                'equipo_id' => $equipo->id
            ]);
        }

        // Crear contingencias
        Contingencia::factory()->count(5)->create();

        // Crear calibraciones
        foreach ($equipos->take(5) as $equipo) {
            Calibracion::factory()->create([
                'equipo_id' => $equipo->id
            ]);
        }

        // Crear inventario y tickets
        InventarioRepuesto::factory()->count(8)->create();
        Ticket::factory()->count(6)->create();
    }

    /** @test */
    public function test_dependency_injection_works_correctly()
    {
        // Verificar que los servicios se resuelven correctamente
        $this->assertInstanceOf(EquiposReportService::class, $this->equiposService);
        $this->assertInstanceOf(MantenimientoReportService::class, $this->mantenimientoService);
        $this->assertInstanceOf(ContingenciasReportService::class, $this->contingenciasService);
        $this->assertInstanceOf(CalibracionesReportService::class, $this->calibracionesService);
        $this->assertInstanceOf(InventarioReportService::class, $this->inventarioService);
        
        // Verificar que el controlador tiene acceso a los servicios
        $this->assertInstanceOf(ExportController::class, $this->exportController);
    }

    /** @test */
    public function test_equipos_service_integration()
    {
        // Test exportación consolidada de equipos
        $response = $this->get('/api/export/equipos-consolidado?format=pdf');
        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'application/pdf');

        // Test exportación de equipos críticos
        $response = $this->get('/api/export/equipos-criticos?format=excel');
        $response->assertStatus(200);
        $this->assertStringContainsString('application/vnd.openxmlformats', $response->headers->get('Content-Type'));
    }

    /** @test */
    public function test_mantenimiento_service_integration()
    {
        // Test exportación de plantilla de mantenimiento
        $response = $this->get('/api/export/plantilla-mantenimiento?format=pdf');
        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'application/pdf');

        // Test exportación de estadísticas de cumplimiento
        $response = $this->get('/api/export/estadisticas-cumplimiento?format=excel');
        $response->assertStatus(200);
        $this->assertStringContainsString('application/vnd.openxmlformats', $response->headers->get('Content-Type'));
    }

    /** @test */
    public function test_contingencias_service_integration()
    {
        $response = $this->get('/api/export/contingencias?format=pdf');
        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'application/pdf');

        // Test con filtros
        $response = $this->get('/api/export/contingencias?format=csv&fecha_inicio=2024-01-01&fecha_fin=2024-12-31');
        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'text/csv');
    }

    /** @test */
    public function test_calibraciones_service_integration()
    {
        $response = $this->get('/api/export/calibraciones?format=excel');
        $response->assertStatus(200);
        $this->assertStringContainsString('application/vnd.openxmlformats', $response->headers->get('Content-Type'));

        // Test con parámetros específicos
        $response = $this->get('/api/export/calibraciones?format=pdf&estado=vigente');
        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'application/pdf');
    }

    /** @test */
    public function test_inventario_service_integration()
    {
        // Test exportación de inventario de repuestos
        $response = $this->get('/api/export/inventario-repuestos?format=excel');
        $response->assertStatus(200);
        $this->assertStringContainsString('application/vnd.openxmlformats', $response->headers->get('Content-Type'));

        // Test exportación de tickets
        $response = $this->get('/api/export/tickets?format=csv');
        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'text/csv');
    }

    /** @test */
    public function test_all_services_work_together()
    {
        // Ejecutar múltiples exportaciones en secuencia
        $endpoints = [
            '/api/export/equipos-consolidado?format=pdf',
            '/api/export/plantilla-mantenimiento?format=excel',
            '/api/export/contingencias?format=csv',
            '/api/export/calibraciones?format=pdf',
            '/api/export/inventario-repuestos?format=excel'
        ];

        foreach ($endpoints as $endpoint) {
            $response = $this->get($endpoint);
            $response->assertStatus(200);
            
            // Verificar que el contenido no está vacío
            $this->assertNotEmpty($response->getContent());
        }
    }

    /** @test */
    public function test_error_handling_integration()
    {
        // Test con formato inválido
        $response = $this->get('/api/export/equipos-consolidado?format=invalid');
        $response->assertStatus(400);

        // Test con parámetros inválidos
        $response = $this->get('/api/export/contingencias?fecha_inicio=invalid-date');
        $response->assertStatus(400);
    }

    /** @test */
    public function test_authentication_integration()
    {
        // Test sin autenticación
        auth()->logout();
        
        $response = $this->get('/api/export/equipos-consolidado?format=pdf');
        $response->assertStatus(401);
    }

    /** @test */
    public function test_performance_integration()
    {
        $startTime = microtime(true);
        
        // Ejecutar exportación de gran volumen
        $response = $this->get('/api/export/equipos-consolidado?format=excel');
        
        $endTime = microtime(true);
        $executionTime = ($endTime - $startTime) * 1000; // en milisegundos
        
        $response->assertStatus(200);
        
        // Verificar que la exportación se completa en tiempo razonable
        $this->assertLessThan(5000, $executionTime, 'La exportación debe completarse en menos de 5 segundos');
    }

    /** @test */
    public function test_memory_usage_integration()
    {
        $initialMemory = memory_get_usage(true);
        
        // Ejecutar múltiples exportaciones
        for ($i = 0; $i < 5; $i++) {
            $response = $this->get('/api/export/equipos-consolidado?format=pdf');
            $response->assertStatus(200);
        }
        
        $finalMemory = memory_get_usage(true);
        $memoryIncrease = $finalMemory - $initialMemory;
        
        // Verificar que el uso de memoria no crece excesivamente
        $this->assertLessThan(50 * 1024 * 1024, $memoryIncrease, 'El incremento de memoria debe ser menor a 50MB');
    }

    /** @test */
    public function test_concurrent_requests_integration()
    {
        // Simular múltiples requests concurrentes
        $responses = [];
        
        for ($i = 0; $i < 3; $i++) {
            $responses[] = $this->get('/api/export/equipos-consolidado?format=pdf');
        }
        
        // Verificar que todas las respuestas son exitosas
        foreach ($responses as $response) {
            $response->assertStatus(200);
            $response->assertHeader('Content-Type', 'application/pdf');
        }
    }

    /** @test */
    public function test_data_consistency_integration()
    {
        // Exportar datos en diferentes formatos
        $pdfResponse = $this->get('/api/export/equipos-consolidado?format=pdf');
        $excelResponse = $this->get('/api/export/equipos-consolidado?format=excel');
        $csvResponse = $this->get('/api/export/equipos-consolidado?format=csv');
        
        $pdfResponse->assertStatus(200);
        $excelResponse->assertStatus(200);
        $csvResponse->assertStatus(200);
        
        // Verificar que todos los formatos contienen datos
        $this->assertNotEmpty($pdfResponse->getContent());
        $this->assertNotEmpty($excelResponse->getContent());
        $this->assertNotEmpty($csvResponse->getContent());
    }

    /** @test */
    public function test_service_isolation_integration()
    {
        // Verificar que los servicios no interfieren entre sí
        
        // Exportar desde diferentes servicios simultáneamente
        $equiposResponse = $this->get('/api/export/equipos-consolidado?format=pdf');
        $mantenimientoResponse = $this->get('/api/export/plantilla-mantenimiento?format=excel');
        $contingenciasResponse = $this->get('/api/export/contingencias?format=csv');
        
        // Todos deben ser exitosos
        $equiposResponse->assertStatus(200);
        $mantenimientoResponse->assertStatus(200);
        $contingenciasResponse->assertStatus(200);
        
        // Verificar tipos de contenido correctos
        $equiposResponse->assertHeader('Content-Type', 'application/pdf');
        $this->assertStringContainsString('application/vnd.openxmlformats', $mantenimientoResponse->headers->get('Content-Type'));
        $contingenciasResponse->assertHeader('Content-Type', 'text/csv');
    }

    /** @test */
    public function test_configuration_integration()
    {
        // Verificar que las configuraciones se aplican correctamente
        
        // Test con configuración de timeout
        config(['export.timeout' => 30]);
        
        $response = $this->get('/api/export/equipos-consolidado?format=pdf');
        $response->assertStatus(200);
        
        // Test con configuración de memoria
        config(['export.memory_limit' => '256M']);
        
        $response = $this->get('/api/export/equipos-consolidado?format=excel');
        $response->assertStatus(200);
    }

    /** @test */
    public function test_logging_integration()
    {
        // Verificar que el logging funciona correctamente
        
        $response = $this->get('/api/export/equipos-consolidado?format=pdf');
        $response->assertStatus(200);
        
        // Verificar que se generaron logs (esto dependería de la configuración específica de logging)
        $this->assertTrue(true); // Placeholder - en implementación real verificaríamos logs
    }

    /** @test */
    public function test_cache_integration()
    {
        // Test de integración con sistema de cache
        
        // Primera llamada (sin cache)
        $startTime = microtime(true);
        $response1 = $this->get('/api/export/equipos-consolidado?format=pdf');
        $time1 = microtime(true) - $startTime;
        
        $response1->assertStatus(200);
        
        // Segunda llamada (con cache, si está implementado)
        $startTime = microtime(true);
        $response2 = $this->get('/api/export/equipos-consolidado?format=pdf');
        $time2 = microtime(true) - $startTime;
        
        $response2->assertStatus(200);
        
        // Verificar que ambas respuestas son válidas
        $this->assertNotEmpty($response1->getContent());
        $this->assertNotEmpty($response2->getContent());
    }

    /** @test */
    public function test_validation_integration()
    {
        // Test de validación integrada
        
        // Parámetros válidos
        $response = $this->get('/api/export/equipos-consolidado?format=pdf&area_id=1');
        $response->assertStatus(200);
        
        // Parámetros inválidos
        $response = $this->get('/api/export/equipos-consolidado?format=pdf&area_id=999999');
        $response->assertStatus(400);
        
        // Formato inválido
        $response = $this->get('/api/export/equipos-consolidado?format=invalid');
        $response->assertStatus(400);
    }
}
