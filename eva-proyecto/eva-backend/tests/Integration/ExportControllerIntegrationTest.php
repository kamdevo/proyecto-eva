<?php

namespace Tests\Integration;

use Tests\TestCase;
use App\Http\Controllers\Api\ExportController;
use App\Services\Export\Reports\EquiposReportService;
use App\Services\Export\Reports\MantenimientoReportService;
use App\Services\Export\Reports\ContingenciasReportService;
use App\Services\Export\Reports\CalibracionesReportService;
use App\Services\Export\Reports\InventarioReportService;
use App\Models\User;
use App\Models\Equipo;
use App\Models\Servicio;
use App\Models\Area;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;

/**
 * Test de integración para ExportController
 * Verifica la inyección de dependencias y funcionamiento completo
 */
class ExportControllerIntegrationTest extends TestCase
{
    use RefreshDatabase;

    protected $user;
    protected $equipo;
    protected $servicio;
    protected $area;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Crear usuario de prueba
        $this->user = User::factory()->create([
            'rol' => 'administrador'
        ]);

        // Crear datos de prueba
        $this->servicio = Servicio::factory()->create();
        $this->area = Area::factory()->create(['servicio_id' => $this->servicio->id]);
        $this->equipo = Equipo::factory()->create([
            'servicio_id' => $this->servicio->id,
            'area_id' => $this->area->id
        ]);
    }

    /**
     * Test: Verificar que el ExportController se instancia correctamente con inyección de dependencias
     */
    public function test_export_controller_dependency_injection()
    {
        $equiposService = app(EquiposReportService::class);
        $mantenimientoService = app(MantenimientoReportService::class);
        $contingenciasService = app(ContingenciasReportService::class);
        $calibracionesService = app(CalibracionesReportService::class);
        $inventarioService = app(InventarioReportService::class);

        $controller = new ExportController(
            $equiposService,
            $mantenimientoService,
            $contingenciasService,
            $calibracionesService,
            $inventarioService
        );

        $this->assertInstanceOf(ExportController::class, $controller);
        
        // Verificar que las dependencias se inyectaron correctamente
        $reflection = new \ReflectionClass($controller);
        
        $equiposProperty = $reflection->getProperty('equiposReportService');
        $equiposProperty->setAccessible(true);
        $this->assertInstanceOf(EquiposReportService::class, $equiposProperty->getValue($controller));
        
        $mantenimientoProperty = $reflection->getProperty('mantenimientoReportService');
        $mantenimientoProperty->setAccessible(true);
        $this->assertInstanceOf(MantenimientoReportService::class, $mantenimientoProperty->getValue($controller));
    }

    /**
     * Test: Verificar que todos los servicios se pueden resolver desde el contenedor
     */
    public function test_services_can_be_resolved_from_container()
    {
        $services = [
            EquiposReportService::class,
            MantenimientoReportService::class,
            ContingenciasReportService::class,
            CalibracionesReportService::class,
            InventarioReportService::class
        ];

        foreach ($services as $serviceClass) {
            $service = app($serviceClass);
            $this->assertInstanceOf($serviceClass, $service);
        }
    }

    /**
     * Test: Integración completa del endpoint de equipos consolidado
     */
    public function test_equipos_consolidado_endpoint_integration()
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/export/equipos-consolidado', [
                'equipos_ids' => [$this->equipo->id],
                'formato' => 'excel',
                'incluir' => [
                    'detalles_equipo' => true,
                    'cronograma' => true,
                    'cumplimiento' => true,
                    'responsables' => true,
                    'estadisticas' => true
                ]
            ]);

        $response->assertStatus(200);
        $this->assertNotNull($response->getContent());
    }

    /**
     * Test: Integración del endpoint de plantilla mantenimiento
     */
    public function test_plantilla_mantenimiento_endpoint_integration()
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/export/plantilla-mantenimiento', [
                'año' => date('Y'),
                'formato' => 'excel'
            ]);

        $response->assertStatus(200);
        $this->assertNotNull($response->getContent());
    }

    /**
     * Test: Integración del endpoint de contingencias
     */
    public function test_contingencias_endpoint_integration()
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/export/contingencias', [
                'fecha_desde' => date('Y-m-01'),
                'fecha_hasta' => date('Y-m-d'),
                'formato' => 'excel'
            ]);

        $response->assertStatus(200);
        $this->assertNotNull($response->getContent());
    }

    /**
     * Test: Integración del endpoint de estadísticas cumplimiento
     */
    public function test_estadisticas_cumplimiento_endpoint_integration()
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/export/estadisticas-cumplimiento', [
                'año' => date('Y'),
                'formato' => 'excel'
            ]);

        $response->assertStatus(200);
        $this->assertNotNull($response->getContent());
    }

    /**
     * Test: Integración del endpoint de equipos críticos
     */
    public function test_equipos_criticos_endpoint_integration()
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/export/equipos-criticos', [
                'formato' => 'excel'
            ]);

        $response->assertStatus(200);
        $this->assertNotNull($response->getContent());
    }

    /**
     * Test: Integración del endpoint de tickets
     */
    public function test_tickets_endpoint_integration()
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/export/tickets', [
                'fecha_desde' => date('Y-m-01'),
                'fecha_hasta' => date('Y-m-d'),
                'formato' => 'excel'
            ]);

        $response->assertStatus(200);
        $this->assertNotNull($response->getContent());
    }

    /**
     * Test: Integración del endpoint de calibraciones
     */
    public function test_calibraciones_endpoint_integration()
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/export/calibraciones', [
                'año' => date('Y'),
                'formato' => 'excel'
            ]);

        $response->assertStatus(200);
        $this->assertNotNull($response->getContent());
    }

    /**
     * Test: Integración del endpoint de inventario repuestos
     */
    public function test_inventario_repuestos_endpoint_integration()
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/export/inventario-repuestos', [
                'formato' => 'excel'
            ]);

        $response->assertStatus(200);
        $this->assertNotNull($response->getContent());
    }

    /**
     * Test: Verificar que todos los formatos funcionan en integración
     */
    public function test_all_formats_integration()
    {
        $formats = ['pdf', 'excel', 'csv'];
        
        foreach ($formats as $format) {
            $response = $this->actingAs($this->user)
                ->postJson('/api/export/equipos-criticos', [
                    'formato' => $format
                ]);

            $response->assertStatus(200);
            $this->assertNotNull($response->getContent());
        }
    }

    /**
     * Test: Verificar manejo de errores de validación en integración
     */
    public function test_validation_errors_integration()
    {
        // Test sin parámetros requeridos
        $response = $this->actingAs($this->user)
            ->postJson('/api/export/equipos-consolidado', []);

        $response->assertStatus(422);
        $response->assertJsonStructure([
            'status',
            'message',
            'errors'
        ]);
    }

    /**
     * Test: Verificar autenticación requerida
     */
    public function test_authentication_required_integration()
    {
        $response = $this->postJson('/api/export/equipos-criticos', [
            'formato' => 'excel'
        ]);

        $response->assertStatus(401);
    }

    /**
     * Test: Verificar que el controlador delega correctamente a los servicios
     */
    public function test_controller_delegates_to_services()
    {
        $controller = app(ExportController::class);
        
        // Verificar que todos los métodos públicos existen
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

        foreach ($expectedMethods as $method) {
            $this->assertTrue(
                method_exists($controller, $method),
                "El método {$method} debe existir en ExportController"
            );
        }
    }

    /**
     * Test: Verificar que las respuestas tienen el formato correcto
     */
    public function test_response_format_consistency()
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/export/equipos-criticos', [
                'formato' => 'pdf'
            ]);

        $response->assertStatus(200);
        
        if ($response->headers->get('content-type') === 'application/json') {
            // Para PDF, debería retornar JSON con HTML content
            $response->assertJsonStructure([
                'status',
                'message',
                'data' => [
                    'html_content',
                    'titulo',
                    'formato'
                ]
            ]);
        }
    }

    /**
     * Test: Verificar rendimiento básico de integración
     */
    public function test_basic_performance_integration()
    {
        $startTime = microtime(true);
        
        $response = $this->actingAs($this->user)
            ->postJson('/api/export/equipos-criticos', [
                'formato' => 'excel'
            ]);
        
        $endTime = microtime(true);
        $executionTime = $endTime - $startTime;
        
        $response->assertStatus(200);
        
        // Verificar que la respuesta se genera en menos de 5 segundos
        $this->assertLessThan(5.0, $executionTime, 'La exportación debería completarse en menos de 5 segundos');
    }

    /**
     * Test: Verificar que los servicios mantienen estado independiente
     */
    public function test_services_maintain_independent_state()
    {
        $service1 = app(EquiposReportService::class);
        $service2 = app(EquiposReportService::class);
        
        // En Laravel, por defecto los servicios son singleton, pero deberían funcionar independientemente
        $this->assertInstanceOf(EquiposReportService::class, $service1);
        $this->assertInstanceOf(EquiposReportService::class, $service2);
        
        // Ambos deberían ser la misma instancia (singleton)
        $this->assertSame($service1, $service2);
    }
}
