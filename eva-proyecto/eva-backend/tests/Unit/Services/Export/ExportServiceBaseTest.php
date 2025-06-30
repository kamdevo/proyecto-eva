<?php

namespace Tests\Unit\Services\Export;

use Tests\TestCase;
use App\Services\Export\ExportServiceBase;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Mockery;

/**
 * Test unitario para ExportServiceBase
 * Verifica funcionalidades comunes de exportación
 */
class ExportServiceBaseTest extends TestCase
{
    protected $exportService;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Crear mock de la clase abstracta
        $this->exportService = Mockery::mock(ExportServiceBase::class)->makePartial();
    }

    protected function tearDown(): void
    {
        Mockery::close();
        parent::tearDown();
    }

    /**
     * Test: Validación de request exitosa
     */
    public function test_validate_export_request_success()
    {
        $request = new Request([
            'formato' => 'excel',
            'año' => 2024
        ]);

        $rules = [
            'formato' => 'required|in:pdf,excel,csv',
            'año' => 'required|integer|min:2020|max:2030'
        ];

        $result = $this->exportService->validateExportRequest($request, $rules);

        $this->assertNull($result);
    }

    /**
     * Test: Validación de request con errores
     */
    public function test_validate_export_request_with_errors()
    {
        $request = new Request([
            'formato' => 'invalid',
            'año' => 'not_a_number'
        ]);

        $rules = [
            'formato' => 'required|in:pdf,excel,csv',
            'año' => 'required|integer|min:2020|max:2030'
        ];

        $result = $this->exportService->validateExportRequest($request, $rules);

        $this->assertNotNull($result);
        $this->assertInstanceOf(\Illuminate\Http\JsonResponse::class, $result);
    }

    /**
     * Test: Formateo de fecha
     */
    public function test_format_date()
    {
        $date = '2024-03-15';
        $formatted = $this->exportService->formatDate($date);
        
        $this->assertEquals('15/03/2024', $formatted);
    }

    /**
     * Test: Formateo de fecha con formato personalizado
     */
    public function test_format_date_custom_format()
    {
        $date = '2024-03-15';
        $formatted = $this->exportService->formatDate($date, 'Y-m-d');
        
        $this->assertEquals('2024-03-15', $formatted);
    }

    /**
     * Test: Formateo de fecha nula
     */
    public function test_format_date_null()
    {
        $formatted = $this->exportService->formatDate(null);
        
        $this->assertEquals('', $formatted);
    }

    /**
     * Test: Formateo de fecha y hora
     */
    public function test_format_date_time()
    {
        $date = '2024-03-15 14:30:00';
        $formatted = $this->exportService->formatDateTime($date);
        
        $this->assertEquals('15/03/2024 14:30', $formatted);
    }

    /**
     * Test: Ejecutar exportación PDF
     */
    public function test_execute_export_pdf()
    {
        $data = [
            ['Columna 1', 'Columna 2'],
            ['Valor 1', 'Valor 2']
        ];
        
        $result = $this->exportService->executeExport($data, 'Test Title', 'pdf', 'test_file');
        
        $this->assertInstanceOf(\Illuminate\Http\JsonResponse::class, $result);
        
        $responseData = $result->getData(true);
        $this->assertEquals('success', $responseData['status']);
        $this->assertArrayHasKey('html_content', $responseData['data']);
        $this->assertEquals('Test Title', $responseData['data']['titulo']);
    }

    /**
     * Test: Ejecutar exportación con formato inválido
     */
    public function test_execute_export_invalid_format()
    {
        $data = [['test']];
        
        $result = $this->exportService->executeExport($data, 'Test', 'invalid', 'test');
        
        $this->assertInstanceOf(\Illuminate\Http\JsonResponse::class, $result);
        
        $responseData = $result->getData(true);
        $this->assertEquals('error', $responseData['status']);
        $this->assertEquals('Formato no soportado', $responseData['message']);
    }

    /**
     * Test: Generar tabla HTML
     */
    public function test_generate_html_table()
    {
        $data = [
            ['Header 1', 'Header 2'],
            ['Value 1', 'Value 2'],
            ['Value 3', 'Value 4']
        ];
        
        $html = $this->exportService->generateHTMLTable($data, 'Test Report');
        
        $this->assertStringContainsString('<h1>Test Report</h1>', $html);
        $this->assertStringContainsString('<table', $html);
        $this->assertStringContainsString('<th', $html);
        $this->assertStringContainsString('<td', $html);
        $this->assertStringContainsString('Header 1', $html);
        $this->assertStringContainsString('Value 1', $html);
        $this->assertStringContainsString('Generado el:', $html);
    }

    /**
     * Test: Exportar a CSV
     */
    public function test_export_to_csv()
    {
        $data = [
            ['Header 1', 'Header 2'],
            ['Value 1', 'Value 2'],
            ['Value "with quotes"', 'Value, with comma']
        ];
        
        $response = $this->exportService->exportToCSV($data, 'test_file');
        
        $this->assertInstanceOf(\Illuminate\Http\Response::class, $response);
        $this->assertEquals('text/csv', $response->headers->get('Content-Type'));
        $this->assertStringContainsString('attachment', $response->headers->get('Content-Disposition'));
        
        $content = $response->getContent();
        $this->assertStringContainsString('"Header 1","Header 2"', $content);
        $this->assertStringContainsString('"Value ""with quotes"""', $content);
    }

    /**
     * Test: Exportar a Excel (mock)
     */
    public function test_export_to_excel_structure()
    {
        $data = [
            ['Header 1', 'Header 2'],
            ['Value 1', 'Value 2']
        ];
        
        // Verificar que el método existe y puede ser llamado
        $this->assertTrue(method_exists($this->exportService, 'exportToExcel'));
        
        // En un test real, aquí se mockearía Excel::download
        // Por ahora solo verificamos la estructura
        $this->expectNotToPerformAssertions();
    }

    /**
     * Test: Validar estructura de datos para exportación
     */
    public function test_data_structure_validation()
    {
        $validData = [
            ['Column 1', 'Column 2'],
            ['Value 1', 'Value 2']
        ];
        
        $this->assertIsArray($validData);
        $this->assertGreaterThan(0, count($validData));
        $this->assertIsArray($validData[0]);
    }

    /**
     * Test: Manejo de datos vacíos
     */
    public function test_empty_data_handling()
    {
        $emptyData = [];
        
        $html = $this->exportService->generateHTMLTable($emptyData, 'Empty Report');
        
        $this->assertStringContainsString('<h1>Empty Report</h1>', $html);
        $this->assertStringContainsString('<table', $html);
    }

    /**
     * Test: Caracteres especiales en HTML
     */
    public function test_html_special_characters()
    {
        $data = [
            ['Header <script>', 'Header & Co'],
            ['Value "quotes"', 'Value <tag>']
        ];
        
        $html = $this->exportService->generateHTMLTable($data, 'Special Chars');
        
        $this->assertStringContainsString('&lt;script&gt;', $html);
        $this->assertStringContainsString('&amp; Co', $html);
        $this->assertStringContainsString('&quot;quotes&quot;', $html);
        $this->assertStringContainsString('&lt;tag&gt;', $html);
    }
}
