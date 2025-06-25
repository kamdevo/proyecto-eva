<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use App\Models\User;
use App\Models\Equipo;
use App\Models\Servicio;
use App\Models\Area;

/**
 * Test de compatibilidad para verificar que la refactorización del ExportController
 * mantiene la misma interfaz pública y funcionalidad
 */
class ExportControllerCompatibilityTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected $user;
    protected $equipo;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Crear usuario de prueba
        $this->user = User::factory()->create([
            'rol' => 'administrador'
        ]);

        // Crear datos de prueba
        $servicio = Servicio::factory()->create();
        $area = Area::factory()->create(['servicio_id' => $servicio->id]);
        $this->equipo = Equipo::factory()->create([
            'servicio_id' => $servicio->id,
            'area_id' => $area->id
        ]);
    }

    /**
     * Test: Verificar que la ruta de equipos consolidado funciona
     */
    public function test_export_equipos_consolidado_endpoint_works()
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
     * Test: Verificar que la ruta de plantilla mantenimiento funciona
     */
    public function test_export_plantilla_mantenimiento_endpoint_works()
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/export/plantilla-mantenimiento', [
                'año' => 2024,
                'formato' => 'excel'
            ]);

        $response->assertStatus(200);
        $this->assertNotNull($response->getContent());
    }

    /**
     * Test: Verificar que la ruta de contingencias funciona
     */
    public function test_export_contingencias_endpoint_works()
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/export/contingencias', [
                'fecha_desde' => '2024-01-01',
                'fecha_hasta' => '2024-12-31',
                'formato' => 'excel'
            ]);

        $response->assertStatus(200);
        $this->assertNotNull($response->getContent());
    }

    /**
     * Test: Verificar que la ruta de estadísticas cumplimiento funciona
     */
    public function test_export_estadisticas_cumplimiento_endpoint_works()
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/export/estadisticas-cumplimiento', [
                'año' => 2024,
                'formato' => 'excel'
            ]);

        $response->assertStatus(200);
        $this->assertNotNull($response->getContent());
    }

    /**
     * Test: Verificar que la ruta de equipos críticos funciona
     */
    public function test_export_equipos_criticos_endpoint_works()
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/export/equipos-criticos', [
                'formato' => 'excel'
            ]);

        $response->assertStatus(200);
        $this->assertNotNull($response->getContent());
    }

    /**
     * Test: Verificar que la ruta de tickets funciona
     */
    public function test_export_tickets_endpoint_works()
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/export/tickets', [
                'fecha_desde' => '2024-01-01',
                'fecha_hasta' => '2024-12-31',
                'formato' => 'excel'
            ]);

        $response->assertStatus(200);
        $this->assertNotNull($response->getContent());
    }

    /**
     * Test: Verificar que la ruta de calibraciones funciona
     */
    public function test_export_calibraciones_endpoint_works()
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/export/calibraciones', [
                'año' => 2024,
                'formato' => 'excel'
            ]);

        $response->assertStatus(200);
        $this->assertNotNull($response->getContent());
    }

    /**
     * Test: Verificar que la ruta de inventario repuestos funciona
     */
    public function test_export_inventario_repuestos_endpoint_works()
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/export/inventario-repuestos', [
                'formato' => 'excel'
            ]);

        $response->assertStatus(200);
        $this->assertNotNull($response->getContent());
    }

    /**
     * Test: Verificar validación de parámetros requeridos
     */
    public function test_validation_errors_are_returned_correctly()
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/export/equipos-consolidado', [
                // Faltan parámetros requeridos
            ]);

        $response->assertStatus(422); // Validation error
        $response->assertJsonStructure([
            'status',
            'message',
            'errors'
        ]);
    }

    /**
     * Test: Verificar que todos los formatos son soportados
     */
    public function test_all_export_formats_are_supported()
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
}
