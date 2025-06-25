<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Equipo;
use App\Models\Servicio;
use App\Models\Area;
use Illuminate\Foundation\Testing\RefreshDatabase;

/**
 * Test de validación de formatos de exportación
 * Verifica que todos los formatos (PDF, Excel, CSV) funcionen correctamente
 */
class ExportFormatsValidationTest extends TestCase
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
     * Test: Validar formato PDF en equipos consolidado
     */
    public function test_pdf_format_equipos_consolidado()
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/export/equipos-consolidado', [
                'equipos_ids' => [$this->equipo->id],
                'formato' => 'pdf',
                'incluir' => [
                    'detalles_equipo' => true,
                    'cronograma' => true,
                    'cumplimiento' => true,
                    'responsables' => true,
                    'estadisticas' => true
                ]
            ]);

        $response->assertStatus(200);
        $response->assertHeader('content-type', 'application/json');
        
        $data = $response->json();
        $this->assertEquals('success', $data['status']);
        $this->assertArrayHasKey('html_content', $data['data']);
        $this->assertEquals('pdf', $data['data']['formato']);
        
        // Verificar que el HTML contiene elementos esperados
        $html = $data['data']['html_content'];
        $this->assertStringContainsString('<h1>', $html);
        $this->assertStringContainsString('<table', $html);
        $this->assertStringContainsString('Generado el:', $html);
    }

    /**
     * Test: Validar formato Excel en equipos consolidado
     */
    public function test_excel_format_equipos_consolidado()
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
        
        // Para Excel, debería retornar un archivo binario
        $contentType = $response->headers->get('content-type');
        $this->assertStringContainsString('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', $contentType);
        
        $contentDisposition = $response->headers->get('content-disposition');
        $this->assertStringContainsString('attachment', $contentDisposition);
        $this->assertStringContainsString('.xlsx', $contentDisposition);
    }

    /**
     * Test: Validar formato CSV en equipos consolidado
     */
    public function test_csv_format_equipos_consolidado()
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/export/equipos-consolidado', [
                'equipos_ids' => [$this->equipo->id],
                'formato' => 'csv',
                'incluir' => [
                    'detalles_equipo' => true,
                    'cronograma' => true,
                    'cumplimiento' => true,
                    'responsables' => true,
                    'estadisticas' => true
                ]
            ]);

        $response->assertStatus(200);
        $response->assertHeader('content-type', 'text/csv');
        
        $contentDisposition = $response->headers->get('content-disposition');
        $this->assertStringContainsString('attachment', $contentDisposition);
        $this->assertStringContainsString('.csv', $contentDisposition);
        
        // Verificar contenido CSV
        $content = $response->getContent();
        $this->assertStringContainsString('"ID"', $content);
        $this->assertStringContainsString('"Código"', $content);
        $this->assertStringContainsString('"Nombre"', $content);
    }

    /**
     * Test: Validar todos los formatos en equipos críticos
     */
    public function test_all_formats_equipos_criticos()
    {
        $formats = [
            'pdf' => 'application/json',
            'excel' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'csv' => 'text/csv'
        ];

        foreach ($formats as $format => $expectedContentType) {
            $response = $this->actingAs($this->user)
                ->postJson('/api/export/equipos-criticos', [
                    'formato' => $format
                ]);

            $response->assertStatus(200);
            
            if ($format === 'pdf') {
                $response->assertHeader('content-type', 'application/json');
                $data = $response->json();
                $this->assertEquals('success', $data['status']);
                $this->assertEquals('pdf', $data['data']['formato']);
            } else {
                $contentType = $response->headers->get('content-type');
                $this->assertStringContainsString($expectedContentType, $contentType);
            }
        }
    }

    /**
     * Test: Validar formatos en plantilla mantenimiento
     */
    public function test_formats_plantilla_mantenimiento()
    {
        $formats = ['pdf', 'excel']; // Solo PDF y Excel soportados

        foreach ($formats as $format) {
            $response = $this->actingAs($this->user)
                ->postJson('/api/export/plantilla-mantenimiento', [
                    'año' => date('Y'),
                    'formato' => $format
                ]);

            $response->assertStatus(200);
            
            if ($format === 'pdf') {
                $response->assertHeader('content-type', 'application/json');
            } else {
                $contentType = $response->headers->get('content-type');
                $this->assertStringContainsString('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', $contentType);
            }
        }
    }

    /**
     * Test: Validar formato inválido
     */
    public function test_invalid_format_validation()
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/export/equipos-criticos', [
                'formato' => 'invalid_format'
            ]);

        $response->assertStatus(422);
        $response->assertJsonStructure([
            'status',
            'message',
            'errors' => [
                'formato'
            ]
        ]);
    }

    /**
     * Test: Validar contenido CSV con caracteres especiales
     */
    public function test_csv_special_characters_handling()
    {
        // Crear equipo con caracteres especiales
        $equipoEspecial = Equipo::factory()->create([
            'nombre' => 'Equipo "con comillas" y, comas',
            'codigo' => 'EQ-001',
            'servicio_id' => $this->servicio->id,
            'area_id' => $this->area->id
        ]);

        $response = $this->actingAs($this->user)
            ->postJson('/api/export/equipos-consolidado', [
                'equipos_ids' => [$equipoEspecial->id],
                'formato' => 'csv',
                'incluir' => [
                    'detalles_equipo' => true,
                    'cronograma' => false,
                    'cumplimiento' => false,
                    'responsables' => false,
                    'estadisticas' => false
                ]
            ]);

        $response->assertStatus(200);
        
        $content = $response->getContent();
        
        // Verificar que las comillas se escapan correctamente
        $this->assertStringContainsString('""con comillas""', $content);
        $this->assertStringContainsString('"EQ-001"', $content);
    }

    /**
     * Test: Validar contenido HTML para PDF con caracteres especiales
     */
    public function test_pdf_html_special_characters_handling()
    {
        // Crear equipo con caracteres especiales
        $equipoEspecial = Equipo::factory()->create([
            'nombre' => 'Equipo <script>alert("test")</script>',
            'codigo' => 'EQ & Co',
            'servicio_id' => $this->servicio->id,
            'area_id' => $this->area->id
        ]);

        $response = $this->actingAs($this->user)
            ->postJson('/api/export/equipos-consolidado', [
                'equipos_ids' => [$equipoEspecial->id],
                'formato' => 'pdf',
                'incluir' => [
                    'detalles_equipo' => true,
                    'cronograma' => false,
                    'cumplimiento' => false,
                    'responsables' => false,
                    'estadisticas' => false
                ]
            ]);

        $response->assertStatus(200);
        
        $data = $response->json();
        $html = $data['data']['html_content'];
        
        // Verificar que los caracteres especiales se escapan correctamente
        $this->assertStringContainsString('&lt;script&gt;', $html);
        $this->assertStringContainsString('&amp; Co', $html);
        $this->assertStringNotContainsString('<script>', $html);
    }

    /**
     * Test: Validar tamaño de archivos generados
     */
    public function test_file_sizes_validation()
    {
        $formats = ['pdf', 'excel', 'csv'];
        $sizes = [];

        foreach ($formats as $format) {
            $response = $this->actingAs($this->user)
                ->postJson('/api/export/equipos-consolidado', [
                    'equipos_ids' => [$this->equipo->id],
                    'formato' => $format,
                    'incluir' => [
                        'detalles_equipo' => true,
                        'cronograma' => true,
                        'cumplimiento' => true,
                        'responsables' => true,
                        'estadisticas' => true
                    ]
                ]);

            $response->assertStatus(200);
            
            if ($format === 'pdf') {
                $data = $response->json();
                $sizes[$format] = strlen($data['data']['html_content']);
            } else {
                $sizes[$format] = strlen($response->getContent());
            }
            
            // Verificar que el archivo no esté vacío
            $this->assertGreaterThan(0, $sizes[$format], "Archivo {$format} no debería estar vacío");
        }

        // CSV debería ser generalmente más pequeño que Excel
        $this->assertLessThan($sizes['excel'], $sizes['csv'], 'CSV debería ser más pequeño que Excel');
    }

    /**
     * Test: Validar headers HTTP correctos para cada formato
     */
    public function test_http_headers_validation()
    {
        $formatTests = [
            'pdf' => [
                'content-type' => 'application/json',
                'cache-control' => null // JSON response
            ],
            'excel' => [
                'content-type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'content-disposition' => 'attachment'
            ],
            'csv' => [
                'content-type' => 'text/csv',
                'content-disposition' => 'attachment'
            ]
        ];

        foreach ($formatTests as $format => $expectedHeaders) {
            $response = $this->actingAs($this->user)
                ->postJson('/api/export/equipos-criticos', [
                    'formato' => $format
                ]);

            $response->assertStatus(200);

            foreach ($expectedHeaders as $header => $expectedValue) {
                if ($expectedValue !== null) {
                    $actualValue = $response->headers->get($header);
                    $this->assertStringContainsString($expectedValue, $actualValue, 
                        "Header {$header} para formato {$format} debería contener {$expectedValue}");
                }
            }
        }
    }

    /**
     * Test: Validar consistencia de datos entre formatos
     */
    public function test_data_consistency_between_formats()
    {
        $equiposIds = [$this->equipo->id];
        $incluir = [
            'detalles_equipo' => true,
            'cronograma' => false,
            'cumplimiento' => false,
            'responsables' => false,
            'estadisticas' => false
        ];

        // Obtener datos en formato PDF (JSON)
        $pdfResponse = $this->actingAs($this->user)
            ->postJson('/api/export/equipos-consolidado', [
                'equipos_ids' => $equiposIds,
                'formato' => 'pdf',
                'incluir' => $incluir
            ]);

        $pdfResponse->assertStatus(200);
        $pdfData = $pdfResponse->json();

        // Obtener datos en formato CSV
        $csvResponse = $this->actingAs($this->user)
            ->postJson('/api/export/equipos-consolidado', [
                'equipos_ids' => $equiposIds,
                'formato' => 'csv',
                'incluir' => $incluir
            ]);

        $csvResponse->assertStatus(200);
        $csvContent = $csvResponse->getContent();

        // Verificar que ambos contienen el código del equipo
        $this->assertStringContainsString($this->equipo->codigo, $pdfData['data']['html_content']);
        $this->assertStringContainsString($this->equipo->codigo, $csvContent);

        // Verificar que ambos contienen el nombre del equipo
        $this->assertStringContainsString($this->equipo->nombre, $pdfData['data']['html_content']);
        $this->assertStringContainsString($this->equipo->nombre, $csvContent);
    }

    /**
     * Test: Validar límites de formatos por endpoint
     */
    public function test_format_limits_per_endpoint()
    {
        $endpointFormats = [
            'equipos-consolidado' => ['pdf', 'excel', 'csv'],
            'plantilla-mantenimiento' => ['pdf', 'excel'],
            'estadisticas-cumplimiento' => ['pdf', 'excel'],
            'contingencias' => ['pdf', 'excel', 'csv'],
            'equipos-criticos' => ['pdf', 'excel', 'csv'],
            'tickets' => ['pdf', 'excel', 'csv'],
            'calibraciones' => ['pdf', 'excel', 'csv'],
            'inventario-repuestos' => ['pdf', 'excel', 'csv']
        ];

        foreach ($endpointFormats as $endpoint => $supportedFormats) {
            foreach (['pdf', 'excel', 'csv'] as $format) {
                $params = $this->getEndpointParams($endpoint, $format);
                
                $response = $this->actingAs($this->user)
                    ->postJson("/api/export/{$endpoint}", $params);

                if (in_array($format, $supportedFormats)) {
                    $response->assertStatus(200);
                } else {
                    // Si el formato no está soportado, debería dar error de validación
                    $response->assertStatus(422);
                }
            }
        }
    }

    /**
     * Obtener parámetros base para cada endpoint
     */
    private function getEndpointParams($endpoint, $format)
    {
        $baseParams = ['formato' => $format];

        switch ($endpoint) {
            case 'equipos-consolidado':
                return array_merge($baseParams, [
                    'equipos_ids' => [$this->equipo->id],
                    'incluir' => [
                        'detalles_equipo' => true,
                        'cronograma' => false,
                        'cumplimiento' => false,
                        'responsables' => false,
                        'estadisticas' => false
                    ]
                ]);
            case 'plantilla-mantenimiento':
            case 'estadisticas-cumplimiento':
            case 'calibraciones':
                return array_merge($baseParams, ['año' => date('Y')]);
            case 'contingencias':
            case 'tickets':
                return array_merge($baseParams, [
                    'fecha_desde' => date('Y-m-01'),
                    'fecha_hasta' => date('Y-m-d')
                ]);
            default:
                return $baseParams;
        }
    }
}
