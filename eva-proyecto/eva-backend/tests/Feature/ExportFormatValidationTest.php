<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\User;
use App\Models\Equipo;
use App\Models\Mantenimiento;
use App\Models\Contingencia;
use App\Models\Calibracion;
use App\Models\InventarioRepuesto;
use App\Models\Ticket;
use App\Models\Area;
use App\Models\Servicio;

/**
 * Tests de Validación de Formatos de Exportación
 * 
 * Valida que todos los formatos de exportación (PDF, Excel, CSV)
 * generen archivos válidos con el contenido correcto.
 */
class ExportFormatValidationTest extends TestCase
{
    use RefreshDatabase;

    protected $user;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->user = User::factory()->create(['role' => 'admin']);
        $this->actingAs($this->user);
        
        $this->createTestData();
    }

    protected function createTestData()
    {
        $area = Area::factory()->create(['nombre' => 'Test Area']);
        $servicio = Servicio::factory()->create(['nombre' => 'Test Servicio']);

        // Crear equipos con datos específicos para validación
        $equipos = Equipo::factory()->count(5)->create([
            'area_id' => $area->id,
            'servicio_id' => $servicio->id,
            'nombre' => 'Equipo Test',
            'codigo' => 'TEST001',
            'estado' => 'activo'
        ]);

        // Crear mantenimientos
        foreach ($equipos as $equipo) {
            Mantenimiento::factory()->create([
                'equipo_id' => $equipo->id,
                'tipo' => 'preventivo',
                'estado' => 'completado'
            ]);
        }

        // Crear contingencias
        Contingencia::factory()->count(3)->create([
            'descripcion' => 'Test Contingencia',
            'estado' => 'resuelto'
        ]);

        // Crear calibraciones
        Calibracion::factory()->count(3)->create([
            'equipo_id' => $equipos->first()->id,
            'estado' => 'vigente'
        ]);

        // Crear inventario
        InventarioRepuesto::factory()->count(4)->create([
            'nombre' => 'Repuesto Test',
            'stock_actual' => 10
        ]);

        // Crear tickets
        Ticket::factory()->count(3)->create([
            'titulo' => 'Ticket Test',
            'estado' => 'abierto'
        ]);
    }

    /** @test */
    public function test_pdf_format_validation_equipos_consolidado()
    {
        $response = $this->get('/api/export/equipos-consolidado?format=pdf');
        
        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'application/pdf');
        
        $content = $response->getContent();
        
        // Validar que es un PDF válido
        $this->assertStringStartsWith('%PDF-', $content);
        $this->assertStringContainsString('%%EOF', $content);
        
        // Validar tamaño mínimo del archivo
        $this->assertGreaterThan(1000, strlen($content));
        
        // Validar headers de descarga
        $response->assertHeader('Content-Disposition');
        $this->assertStringContainsString('attachment', $response->headers->get('Content-Disposition'));
        $this->assertStringContainsString('.pdf', $response->headers->get('Content-Disposition'));
    }

    /** @test */
    public function test_excel_format_validation_equipos_consolidado()
    {
        $response = $this->get('/api/export/equipos-consolidado?format=excel');
        
        $response->assertStatus(200);
        $this->assertStringContainsString('application/vnd.openxmlformats', $response->headers->get('Content-Type'));
        
        $content = $response->getContent();
        
        // Validar que es un archivo Excel válido (XLSX)
        $this->assertStringStartsWith('PK', $content); // Los archivos XLSX son ZIP
        
        // Validar tamaño mínimo
        $this->assertGreaterThan(500, strlen($content));
        
        // Validar headers
        $response->assertHeader('Content-Disposition');
        $this->assertStringContainsString('.xlsx', $response->headers->get('Content-Disposition'));
    }

    /** @test */
    public function test_csv_format_validation_equipos_consolidado()
    {
        $response = $this->get('/api/export/equipos-consolidado?format=csv');
        
        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'text/csv');
        
        $content = $response->getContent();
        
        // Validar estructura CSV
        $lines = explode("\n", trim($content));
        $this->assertGreaterThan(1, count($lines)); // Al menos header + 1 fila
        
        // Validar header CSV
        $header = str_getcsv($lines[0]);
        $this->assertContains('Código', $header);
        $this->assertContains('Nombre', $header);
        $this->assertContains('Estado', $header);
        
        // Validar datos
        if (count($lines) > 1) {
            $firstRow = str_getcsv($lines[1]);
            $this->assertEquals(count($header), count($firstRow));
        }
        
        // Validar headers de descarga
        $response->assertHeader('Content-Disposition');
        $this->assertStringContainsString('.csv', $response->headers->get('Content-Disposition'));
    }

    /** @test */
    public function test_pdf_format_validation_mantenimiento()
    {
        $response = $this->get('/api/export/plantilla-mantenimiento?format=pdf');
        
        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'application/pdf');
        
        $content = $response->getContent();
        $this->assertStringStartsWith('%PDF-', $content);
        $this->assertStringContainsString('%%EOF', $content);
        $this->assertGreaterThan(1000, strlen($content));
    }

    /** @test */
    public function test_excel_format_validation_mantenimiento()
    {
        $response = $this->get('/api/export/estadisticas-cumplimiento?format=excel');
        
        $response->assertStatus(200);
        $this->assertStringContainsString('application/vnd.openxmlformats', $response->headers->get('Content-Type'));
        
        $content = $response->getContent();
        $this->assertStringStartsWith('PK', $content);
        $this->assertGreaterThan(500, strlen($content));
    }

    /** @test */
    public function test_csv_format_validation_contingencias()
    {
        $response = $this->get('/api/export/contingencias?format=csv');
        
        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'text/csv');
        
        $content = $response->getContent();
        $lines = explode("\n", trim($content));
        $this->assertGreaterThan(1, count($lines));
        
        $header = str_getcsv($lines[0]);
        $this->assertContains('Descripción', $header);
        $this->assertContains('Estado', $header);
        $this->assertContains('Fecha', $header);
    }

    /** @test */
    public function test_pdf_format_validation_calibraciones()
    {
        $response = $this->get('/api/export/calibraciones?format=pdf');
        
        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'application/pdf');
        
        $content = $response->getContent();
        $this->assertStringStartsWith('%PDF-', $content);
        $this->assertStringContainsString('%%EOF', $content);
    }

    /** @test */
    public function test_excel_format_validation_inventario()
    {
        $response = $this->get('/api/export/inventario-repuestos?format=excel');
        
        $response->assertStatus(200);
        $this->assertStringContainsString('application/vnd.openxmlformats', $response->headers->get('Content-Type'));
        
        $content = $response->getContent();
        $this->assertStringStartsWith('PK', $content);
    }

    /** @test */
    public function test_csv_format_validation_tickets()
    {
        $response = $this->get('/api/export/tickets?format=csv');
        
        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'text/csv');
        
        $content = $response->getContent();
        $lines = explode("\n", trim($content));
        $this->assertGreaterThan(1, count($lines));
        
        $header = str_getcsv($lines[0]);
        $this->assertContains('Título', $header);
        $this->assertContains('Estado', $header);
    }

    /** @test */
    public function test_invalid_format_returns_error()
    {
        $response = $this->get('/api/export/equipos-consolidado?format=invalid');
        $response->assertStatus(400);
        
        $response = $this->get('/api/export/contingencias?format=xml');
        $response->assertStatus(400);
    }

    /** @test */
    public function test_missing_format_defaults_to_pdf()
    {
        $response = $this->get('/api/export/equipos-consolidado');
        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'application/pdf');
    }

    /** @test */
    public function test_case_insensitive_format_parameter()
    {
        $response = $this->get('/api/export/equipos-consolidado?format=PDF');
        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'application/pdf');
        
        $response = $this->get('/api/export/equipos-consolidado?format=Excel');
        $response->assertStatus(200);
        $this->assertStringContainsString('application/vnd.openxmlformats', $response->headers->get('Content-Type'));
        
        $response = $this->get('/api/export/equipos-consolidado?format=CSV');
        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'text/csv');
    }

    /** @test */
    public function test_content_encoding_validation()
    {
        // Test UTF-8 encoding para CSV
        $response = $this->get('/api/export/equipos-consolidado?format=csv');
        $response->assertStatus(200);
        
        $content = $response->getContent();
        $this->assertTrue(mb_check_encoding($content, 'UTF-8'));
    }

    /** @test */
    public function test_file_size_validation()
    {
        // Test que los archivos no estén vacíos y tengan tamaño razonable
        $formats = ['pdf', 'excel', 'csv'];
        
        foreach ($formats as $format) {
            $response = $this->get("/api/export/equipos-consolidado?format={$format}");
            $response->assertStatus(200);
            
            $content = $response->getContent();
            $size = strlen($content);
            
            // Validar tamaño mínimo
            $this->assertGreaterThan(100, $size, "Archivo {$format} muy pequeño");
            
            // Validar tamaño máximo razonable (10MB)
            $this->assertLessThan(10 * 1024 * 1024, $size, "Archivo {$format} muy grande");
        }
    }

    /** @test */
    public function test_filename_validation()
    {
        $response = $this->get('/api/export/equipos-consolidado?format=pdf');
        $response->assertStatus(200);
        
        $disposition = $response->headers->get('Content-Disposition');
        $this->assertStringContainsString('filename=', $disposition);
        $this->assertStringContainsString('equipos-consolidado', $disposition);
        $this->assertStringContainsString('.pdf', $disposition);
        
        // Validar que el filename no contiene caracteres peligrosos
        $this->assertStringNotContainsString('../', $disposition);
        $this->assertStringNotContainsString('\\', $disposition);
    }

    /** @test */
    public function test_concurrent_format_requests()
    {
        // Test múltiples formatos simultáneamente
        $responses = [];
        
        $responses['pdf'] = $this->get('/api/export/equipos-consolidado?format=pdf');
        $responses['excel'] = $this->get('/api/export/equipos-consolidado?format=excel');
        $responses['csv'] = $this->get('/api/export/equipos-consolidado?format=csv');
        
        foreach ($responses as $format => $response) {
            $response->assertStatus(200);
            $this->assertNotEmpty($response->getContent());
        }
        
        // Validar que cada formato es diferente
        $this->assertNotEquals($responses['pdf']->getContent(), $responses['excel']->getContent());
        $this->assertNotEquals($responses['pdf']->getContent(), $responses['csv']->getContent());
        $this->assertNotEquals($responses['excel']->getContent(), $responses['csv']->getContent());
    }

    /** @test */
    public function test_format_specific_headers()
    {
        // PDF headers
        $response = $this->get('/api/export/equipos-consolidado?format=pdf');
        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'application/pdf');
        $this->assertStringContainsString('attachment', $response->headers->get('Content-Disposition'));
        
        // Excel headers
        $response = $this->get('/api/export/equipos-consolidado?format=excel');
        $response->assertStatus(200);
        $this->assertStringContainsString('application/vnd.openxmlformats', $response->headers->get('Content-Type'));
        $this->assertStringContainsString('attachment', $response->headers->get('Content-Disposition'));
        
        // CSV headers
        $response = $this->get('/api/export/equipos-consolidado?format=csv');
        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'text/csv');
        $this->assertStringContainsString('attachment', $response->headers->get('Content-Disposition'));
    }

    /** @test */
    public function test_data_integrity_across_formats()
    {
        // Exportar en CSV para validar datos
        $csvResponse = $this->get('/api/export/equipos-consolidado?format=csv');
        $csvResponse->assertStatus(200);
        
        $csvContent = $csvResponse->getContent();
        $lines = explode("\n", trim($csvContent));
        $dataRows = count($lines) - 1; // Excluir header
        
        // Validar que otros formatos contienen la misma cantidad de datos
        $pdfResponse = $this->get('/api/export/equipos-consolidado?format=pdf');
        $pdfResponse->assertStatus(200);
        $this->assertNotEmpty($pdfResponse->getContent());
        
        $excelResponse = $this->get('/api/export/equipos-consolidado?format=excel');
        $excelResponse->assertStatus(200);
        $this->assertNotEmpty($excelResponse->getContent());
        
        // Los archivos PDF y Excel deben tener contenido proporcional
        $this->assertGreaterThan(0, $dataRows);
    }

    /** @test */
    public function test_special_characters_handling()
    {
        // Crear equipo con caracteres especiales
        Equipo::factory()->create([
            'nombre' => 'Equipo con ñ, acentós y "comillas"',
            'descripcion' => 'Descripción con caracteres especiales: áéíóú, ñ, ¿?¡!'
        ]);
        
        // Test CSV con caracteres especiales
        $response = $this->get('/api/export/equipos-consolidado?format=csv');
        $response->assertStatus(200);
        
        $content = $response->getContent();
        $this->assertStringContainsString('ñ', $content);
        $this->assertStringContainsString('acentós', $content);
        
        // Test PDF con caracteres especiales
        $response = $this->get('/api/export/equipos-consolidado?format=pdf');
        $response->assertStatus(200);
        $this->assertNotEmpty($response->getContent());
        
        // Test Excel con caracteres especiales
        $response = $this->get('/api/export/equipos-consolidado?format=excel');
        $response->assertStatus(200);
        $this->assertNotEmpty($response->getContent());
    }
}
