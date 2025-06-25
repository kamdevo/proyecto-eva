<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use App\Models\User;
use App\Models\Equipo;
use App\Models\Servicio;
use App\Models\Area;
use App\Models\Mantenimiento;
use App\Models\Contingencia;
use App\Models\Calibracion;
use App\Models\Ticket;
use App\Models\Repuesto;
use App\Models\Proveedor;

/**
 * Test completo de verificación de endpoints de exportación
 * Prueba cada endpoint con datos reales y valida las respuestas
 */
class ExportEndpointsVerificationTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected $user;
    protected $equipo;
    protected $servicio;
    protected $area;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Crear usuario administrador
        $this->user = User::factory()->create([
            'rol' => 'administrador',
            'nombre' => 'Test Admin',
            'email' => 'admin@test.com'
        ]);

        // Crear datos base
        $this->servicio = Servicio::factory()->create([
            'nombre' => 'Servicio Test',
            'codigo' => 'ST001'
        ]);

        $this->area = Area::factory()->create([
            'name' => 'Área Test',
            'servicio_id' => $this->servicio->id
        ]);

        $this->equipo = Equipo::factory()->create([
            'nombre' => 'Equipo Test',
            'codigo' => 'EQ001',
            'servicio_id' => $this->servicio->id,
            'area_id' => $this->area->id
        ]);

        // Crear datos relacionados
        $this->createRelatedData();
    }

    private function createRelatedData()
    {
        // Crear mantenimientos
        Mantenimiento::factory()->count(3)->create([
            'equipo_id' => $this->equipo->id,
            'fecha_programada' => now()->addDays(30),
            'type' => 'preventivo',
            'status' => 'programado'
        ]);

        // Crear contingencias
        Contingencia::factory()->count(2)->create([
            'equipo_id' => $this->equipo->id,
            'fecha' => now()->subDays(10),
            'estado' => 'Activa',
            'severidad' => 'Media'
        ]);

        // Crear calibraciones
        Calibracion::factory()->count(2)->create([
            'equipo_id' => $this->equipo->id,
            'fecha_programada' => now()->addDays(60),
            'estado' => 'programada'
        ]);

        // Crear tickets
        Ticket::factory()->count(3)->create([
            'equipo_id' => $this->equipo->id,
            'fecha_creacion' => now()->subDays(5),
            'estado' => 'abierto'
        ]);

        // Crear repuestos
        $proveedor = Proveedor::factory()->create();
        Repuesto::factory()->count(2)->create([
            'equipo_id' => $this->equipo->id,
            'proveedor_id' => $proveedor->id,
            'estado' => 'activo'
        ]);
    }

    /**
     * Test: Verificar endpoint de equipos consolidado
     */
    public function test_export_equipos_consolidado_endpoint()
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
        
        // Verificar que es una descarga de archivo Excel
        $response->assertHeader('content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        
        echo "✅ Endpoint equipos-consolidado: FUNCIONAL\n";
    }

    /**
     * Test: Verificar endpoint de plantilla mantenimiento
     */
    public function test_export_plantilla_mantenimiento_endpoint()
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/export/plantilla-mantenimiento', [
                'año' => date('Y'),
                'formato' => 'excel',
                'servicio_id' => $this->servicio->id
            ]);

        $response->assertStatus(200);
        $this->assertNotNull($response->getContent());
        
        echo "✅ Endpoint plantilla-mantenimiento: FUNCIONAL\n";
    }

    /**
     * Test: Verificar endpoint de contingencias
     */
    public function test_export_contingencias_endpoint()
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/export/contingencias', [
                'fecha_desde' => now()->subMonth()->format('Y-m-d'),
                'fecha_hasta' => now()->format('Y-m-d'),
                'formato' => 'excel',
                'estado' => 'Activa'
            ]);

        $response->assertStatus(200);
        $this->assertNotNull($response->getContent());
        
        echo "✅ Endpoint contingencias: FUNCIONAL\n";
    }

    /**
     * Test: Verificar endpoint de estadísticas cumplimiento
     */
    public function test_export_estadisticas_cumplimiento_endpoint()
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/export/estadisticas-cumplimiento', [
                'año' => date('Y'),
                'formato' => 'excel'
            ]);

        $response->assertStatus(200);
        $this->assertNotNull($response->getContent());
        
        echo "✅ Endpoint estadisticas-cumplimiento: FUNCIONAL\n";
    }

    /**
     * Test: Verificar endpoint de equipos críticos
     */
    public function test_export_equipos_criticos_endpoint()
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/export/equipos-criticos', [
                'formato' => 'excel'
            ]);

        $response->assertStatus(200);
        $this->assertNotNull($response->getContent());
        
        echo "✅ Endpoint equipos-criticos: FUNCIONAL\n";
    }

    /**
     * Test: Verificar endpoint de tickets
     */
    public function test_export_tickets_endpoint()
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/export/tickets', [
                'fecha_desde' => now()->subMonth()->format('Y-m-d'),
                'fecha_hasta' => now()->format('Y-m-d'),
                'formato' => 'excel'
            ]);

        $response->assertStatus(200);
        $this->assertNotNull($response->getContent());
        
        echo "✅ Endpoint tickets: FUNCIONAL\n";
    }

    /**
     * Test: Verificar endpoint de calibraciones
     */
    public function test_export_calibraciones_endpoint()
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/export/calibraciones', [
                'año' => date('Y'),
                'formato' => 'excel'
            ]);

        $response->assertStatus(200);
        $this->assertNotNull($response->getContent());
        
        echo "✅ Endpoint calibraciones: FUNCIONAL\n";
    }

    /**
     * Test: Verificar endpoint de inventario repuestos
     */
    public function test_export_inventario_repuestos_endpoint()
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/export/inventario-repuestos', [
                'formato' => 'excel'
            ]);

        $response->assertStatus(200);
        $this->assertNotNull($response->getContent());
        
        echo "✅ Endpoint inventario-repuestos: FUNCIONAL\n";
    }

    /**
     * Test: Verificar todos los formatos de exportación
     */
    public function test_all_export_formats()
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
        
        echo "✅ Todos los formatos (PDF, Excel, CSV): FUNCIONALES\n";
    }

    /**
     * Test: Verificar validaciones de parámetros
     */
    public function test_parameter_validations()
    {
        // Test parámetros faltantes
        $response = $this->actingAs($this->user)
            ->postJson('/api/export/equipos-consolidado', []);

        $response->assertStatus(422);
        $response->assertJsonStructure([
            'status',
            'message',
            'errors'
        ]);

        // Test formato inválido
        $response = $this->actingAs($this->user)
            ->postJson('/api/export/equipos-criticos', [
                'formato' => 'invalid_format'
            ]);

        $response->assertStatus(422);
        
        echo "✅ Validaciones de parámetros: FUNCIONANDO\n";
    }
}
