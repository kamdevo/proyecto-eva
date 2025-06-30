<?php

namespace Tests\Unit\Services\Export\Reports;

use Tests\TestCase;
use App\Services\Export\Reports\EquiposReportService;
use App\Models\Equipo;
use App\Models\Servicio;
use App\Models\Area;
use App\Models\User;
use App\Interactions\DatabaseInteraction;
use Illuminate\Http\Request;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery;

/**
 * Test unitario para EquiposReportService
 * Verifica funcionalidades específicas de reportes de equipos
 */
class EquiposReportServiceTest extends TestCase
{
    use RefreshDatabase;

    protected $equiposReportService;
    protected $equipo;
    protected $servicio;
    protected $area;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->equiposReportService = new EquiposReportService();
        
        // Crear datos de prueba
        $this->servicio = Servicio::factory()->create([
            'nombre' => 'Servicio Test'
        ]);
        
        $this->area = Area::factory()->create([
            'name' => 'Área Test',
            'servicio_id' => $this->servicio->id
        ]);
        
        $this->equipo = Equipo::factory()->create([
            'nombre' => 'Equipo Test',
            'codigo' => 'EQ001',
            'servicio_id' => $this->servicio->id,
            'area_id' => $this->area->id,
            'marca' => 'Marca Test',
            'modelo' => 'Modelo Test',
            'serie' => 'Serie Test',
            'estado' => 'Operativo',
            'riesgo' => 'Medio'
        ]);
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    /**
     * Test: Validación exitosa para equipos consolidado
     */
    public function test_export_equipos_consolidado_validation_success()
    {
        $request = new Request([
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

        // Mock del método de validación para que pase
        $service = Mockery::mock(EquiposReportService::class)->makePartial();
        $service->shouldReceive('validateExportRequest')->andReturn(null);
        $service->shouldReceive('executeExport')->andReturn(response()->json(['status' => 'success']));

        $result = $service->exportEquiposConsolidado($request);
        
        $this->assertInstanceOf(\Illuminate\Http\JsonResponse::class, $result);
    }

    /**
     * Test: Validación fallida para equipos consolidado
     */
    public function test_export_equipos_consolidado_validation_failure()
    {
        $request = new Request([
            'equipos_ids' => [], // Array vacío - debería fallar
            'formato' => 'invalid',
            'incluir' => []
        ]);

        $result = $this->equiposReportService->exportEquiposConsolidado($request);
        
        $this->assertInstanceOf(\Illuminate\Http\JsonResponse::class, $result);
        
        $responseData = $result->getData(true);
        $this->assertEquals('error', $responseData['status']);
    }

    /**
     * Test: Preparación de datos consolidados
     */
    public function test_prepare_consolidated_data_structure()
    {
        $equipos = collect([$this->equipo]);
        $incluir = [
            'detalles_equipo' => true,
            'cronograma' => true,
            'cumplimiento' => true,
            'responsables' => true,
            'estadisticas' => true
        ];

        // Usar reflexión para acceder al método privado
        $reflection = new \ReflectionClass($this->equiposReportService);
        $method = $reflection->getMethod('prepareConsolidatedData');
        $method->setAccessible(true);

        $data = $method->invoke($this->equiposReportService, $equipos, $incluir);

        // Verificar estructura de datos
        $this->assertIsArray($data);
        $this->assertGreaterThan(0, count($data));
        
        // Verificar headers
        $headers = $data[0];
        $this->assertContains('ID', $headers);
        $this->assertContains('Código', $headers);
        $this->assertContains('Nombre', $headers);
        $this->assertContains('Marca', $headers);
        $this->assertContains('Servicio', $headers);
        
        // Verificar datos del equipo
        $equipoData = $data[1];
        $this->assertEquals($this->equipo->id, $equipoData[0]);
        $this->assertEquals($this->equipo->codigo, $equipoData[1]);
        $this->assertEquals($this->equipo->nombre, $equipoData[2]);
    }

    /**
     * Test: Preparación de datos con opciones mínimas
     */
    public function test_prepare_consolidated_data_minimal_options()
    {
        $equipos = collect([$this->equipo]);
        $incluir = [
            'detalles_equipo' => false,
            'cronograma' => false,
            'cumplimiento' => false,
            'responsables' => false,
            'estadisticas' => false
        ];

        $reflection = new \ReflectionClass($this->equiposReportService);
        $method = $reflection->getMethod('prepareConsolidatedData');
        $method->setAccessible(true);

        $data = $method->invoke($this->equiposReportService, $equipos, $incluir);

        // Verificar que solo incluye campos básicos
        $headers = $data[0];
        $this->assertContains('ID', $headers);
        $this->assertContains('Código', $headers);
        $this->assertContains('Nombre', $headers);
        $this->assertContains('Servicio', $headers);
        $this->assertContains('Área', $headers);
        
        // No debe contener campos opcionales
        $this->assertNotContains('Marca', $headers);
        $this->assertNotContains('Responsable', $headers);
        $this->assertNotContains('% Cumplimiento', $headers);
    }

    /**
     * Test: Exportar equipos críticos - validación
     */
    public function test_export_equipos_criticos_validation()
    {
        $request = new Request([
            'formato' => 'excel'
        ]);

        // Mock DatabaseInteraction
        $mockResponse = response()->json([
            'status' => 'success',
            'data' => [$this->equipo]
        ]);

        DatabaseInteraction::shouldReceive('getCriticalEquipments')
            ->once()
            ->andReturn($mockResponse);

        $service = Mockery::mock(EquiposReportService::class)->makePartial();
        $service->shouldReceive('validateExportRequest')->andReturn(null);
        $service->shouldReceive('executeExport')->andReturn(response()->json(['status' => 'success']));

        $result = $service->exportEquiposCriticos($request);
        
        $this->assertInstanceOf(\Illuminate\Http\JsonResponse::class, $result);
    }

    /**
     * Test: Preparación de datos de equipos críticos
     */
    public function test_prepare_equipos_criticos_data_structure()
    {
        $equiposCriticos = collect([
            (object)[
                'codigo' => 'EQ001',
                'nombre' => 'Equipo Crítico',
                'marca' => 'Marca Test',
                'modelo' => 'Modelo Test',
                'riesgo' => 'Alto',
                'estado' => 'Operativo',
                'servicio' => (object)['nombre' => 'Servicio Test'],
                'area' => (object)['nombre' => 'Área Test'],
                'nivel_criticidad' => 'Alto',
                'ultimo_mantenimiento' => '2024-01-15',
                'proximo_mantenimiento' => '2024-04-15',
                'contingencias' => collect([])
            ]
        ]);

        $reflection = new \ReflectionClass($this->equiposReportService);
        $method = $reflection->getMethod('prepareEquiposCriticosData');
        $method->setAccessible(true);

        $data = $method->invoke($this->equiposReportService, $equiposCriticos);

        // Verificar estructura
        $this->assertIsArray($data);
        $this->assertGreaterThan(0, count($data));
        
        // Verificar headers
        $headers = $data[0];
        $this->assertContains('Código', $headers);
        $this->assertContains('Nombre', $headers);
        $this->assertContains('Nivel Criticidad', $headers);
        $this->assertContains('Contingencias Activas', $headers);
        
        // Verificar datos
        $equipoData = $data[1];
        $this->assertEquals('EQ001', $equipoData[0]);
        $this->assertEquals('Equipo Crítico', $equipoData[1]);
        $this->assertEquals('Alto', $equipoData[8]); // nivel_criticidad
    }

    /**
     * Test: Manejo de errores en exportación
     */
    public function test_export_error_handling()
    {
        $request = new Request([
            'equipos_ids' => [999999], // ID que no existe
            'formato' => 'excel',
            'incluir' => [
                'detalles_equipo' => true,
                'cronograma' => true,
                'cumplimiento' => true,
                'responsables' => true,
                'estadisticas' => true
            ]
        ]);

        $result = $this->equiposReportService->exportEquiposConsolidado($request);
        
        $this->assertInstanceOf(\Illuminate\Http\JsonResponse::class, $result);
        
        $responseData = $result->getData(true);
        $this->assertEquals('error', $responseData['status']);
        $this->assertStringContainsString('Error al exportar', $responseData['message']);
    }

    /**
     * Test: Formatos de exportación soportados
     */
    public function test_supported_export_formats()
    {
        $supportedFormats = ['pdf', 'excel', 'csv'];
        
        foreach ($supportedFormats as $format) {
            $request = new Request([
                'equipos_ids' => [$this->equipo->id],
                'formato' => $format,
                'incluir' => [
                    'detalles_equipo' => true,
                    'cronograma' => false,
                    'cumplimiento' => false,
                    'responsables' => false,
                    'estadisticas' => false
                ]
            ]);

            // Verificar que no hay errores de validación de formato
            $reflection = new \ReflectionClass($this->equiposReportService);
            $method = $reflection->getMethod('validateExportRequest');
            $method->setAccessible(true);

            $rules = [
                'equipos_ids' => 'required|array',
                'formato' => 'required|in:pdf,excel,csv'
            ];

            $validation = $method->invoke($this->equiposReportService, $request, $rules);
            $this->assertNull($validation, "Formato {$format} debería ser válido");
        }
    }

    /**
     * Test: Datos vacíos
     */
    public function test_empty_equipos_handling()
    {
        $equipos = collect([]);
        $incluir = [
            'detalles_equipo' => true,
            'cronograma' => true,
            'cumplimiento' => true,
            'responsables' => true,
            'estadisticas' => true
        ];

        $reflection = new \ReflectionClass($this->equiposReportService);
        $method = $reflection->getMethod('prepareConsolidatedData');
        $method->setAccessible(true);

        $data = $method->invoke($this->equiposReportService, $equipos, $incluir);

        // Debe tener al menos los headers
        $this->assertIsArray($data);
        $this->assertEquals(1, count($data)); // Solo headers
        $this->assertIsArray($data[0]); // Headers es array
    }
}
