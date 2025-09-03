<?php

namespace App\Services\Export;

use App\ConexionesVista\ResponseFormatter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Maatwebsite\Excel\Facades\Excel;
use Carbon\Carbon;

/**
 * Clase base abstracta para servicios de exportación
 * Proporciona funcionalidades comunes para PDF, Excel y CSV
 */
abstract class ExportServiceBase
{
    /**
     * Exportar datos a Excel
     */
    protected function exportToExcel($data, ?string $filename = null): \Symfony\Component\HttpFoundation\BinaryFileResponse
    {
        $filename = $filename ?: ('export_' . now()->format('Y-m-d_H-i-s') . '.xlsx');

        return Excel::download(new class($data) implements 
            \Maatwebsite\Excel\Concerns\FromCollection,
            \Maatwebsite\Excel\Concerns\WithHeadings,
            \Maatwebsite\Excel\Concerns\WithStyles,
            \Maatwebsite\Excel\Concerns\WithColumnWidths,
            \Maatwebsite\Excel\Concerns\WithTitle
        {
            private $data;

            public function __construct($data) {
                $this->data = $data;
            }

            public function collection() {
                // Skip the first row (headers) since we handle them in headings()
                return collect($this->data)->skip(1);
            }

            public function headings(): array
            {
                // Return the first row as headers
                return $this->data[0] ?? [];
            }

            public function styles(\PhpOffice\PhpSpreadsheet\Worksheet\Worksheet $sheet)
            {
                // Header row styling
                $sheet->getStyle('A1:I1')->applyFromArray([
                    'font' => [
                        'bold' => true,
                        'color' => ['rgb' => 'FFFFFF'],
                        'size' => 12
                    ],
                    'fill' => [
                        'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                        'startColor' => ['rgb' => '4472C4']
                    ],
                    'alignment' => [
                        'horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER,
                        'vertical' => \PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_CENTER
                    ]
                ]);

                // Data rows styling
                $lastRow = count($this->data);
                $sheet->getStyle('A1:I' . $lastRow)->applyFromArray([
                    'borders' => [
                        'allBorders' => [
                            'borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN,
                            'color' => ['rgb' => '000000']
                        ]
                    ]
                ]);

                // Alternate row colors
                for ($row = 2; $row <= $lastRow; $row++) {
                    if ($row % 2 == 0) {
                        $sheet->getStyle('A' . $row . ':I' . $row)->applyFromArray([
                            'fill' => [
                                'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                                'startColor' => ['rgb' => 'F2F2F2']
                            ]
                        ]);
                    }
                }

                // Auto-fit row heights
                for ($row = 1; $row <= $lastRow; $row++) {
                    $sheet->getRowDimension($row)->setRowHeight(-1);
                }

                return [];
            }

            public function columnWidths(): array
            {
                return [
                    'A' => 15, // Codigo calibracion
                    'B' => 18, // Fecha de ejecucion
                    'C' => 15, // Marca
                    'D' => 12, // Codigo
                    'E' => 20, // Serie
                    'F' => 35, // Nombre equipo
                    'G' => 10, // Id equipo
                    'H' => 15, // Archivo
                    'I' => 25, // Ubicación
                ];
            }

            public function title(): string
            {
                return 'Calibraciones';
            }
        }, $filename);
    }

    /**
     * Exportar datos a CSV
     */
    protected function exportToCSV($data, $filename)
    {
        $csvContent = '';
        foreach ($data as $row) {
            $csvContent .= implode(',', array_map(function($field) {
                return '"' . str_replace('"', '""', $field) . '"';
            }, $row)) . "\n";
        }

        return response($csvContent)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', 'attachment; filename="' . $filename . '_' . date('Y-m-d') . '.csv"');
    }

    /**
     * Exportar datos a PDF
     */
    protected function exportToPDF($data, $titulo)
    {
        $html = $this->generateHTMLTable($data, $titulo);

        return ResponseFormatter::success([
            'html_content' => $html,
            'titulo' => $titulo,
            'formato' => 'pdf',
            'total_registros' => count($data) - 1 // -1 por el header
        ], 'Datos preparados para exportación PDF');
    }

    /**
     * Generar tabla HTML para PDF
     */
    protected function generateHTMLTable($data, $titulo)
    {
        $html = '<h1>' . $titulo . '</h1>';
        $html .= '<table border="1" cellpadding="5" cellspacing="0" style="width:100%; border-collapse: collapse;">';

        foreach ($data as $index => $row) {
            $html .= '<tr>';
            foreach ($row as $cell) {
                if ($index === 0) {
                    $html .= '<th style="background-color: #f0f0f0; font-weight: bold;">' . htmlspecialchars($cell) . '</th>';
                } else {
                    $html .= '<td>' . htmlspecialchars($cell) . '</td>';
                }
            }
            $html .= '</tr>';
        }

        $html .= '</table>';
        $html .= '<p>Generado el: ' . date('d/m/Y H:i:s') . '</p>';

        return $html;
    }

    /**
     * Validar request común para exportación
     */
    protected function validateExportRequest(Request $request, array $rules)
    {
        $validator = Validator::make($request->all(), $rules);

        if ($validator->fails()) {
            return ResponseFormatter::validation($validator->errors());
        }

        return null;
    }

    /**
     * Ejecutar exportación según formato
     */
    protected function executeExport($data, $titulo, $formato, $filename)
    {
        switch ($formato) {
            case 'pdf':
                return $this->exportToPDF($data, $titulo);
            case 'excel':
                return $this->exportToExcel($data, $filename);
            case 'csv':
                return $this->exportToCSV($data, $filename);
            default:
                return ResponseFormatter::error('Formato no soportado', 400);
        }
    }

    /**
     * Formatear fecha para mostrar
     */
    protected function formatDate($date, $format = 'd/m/Y')
    {
        return $date ? Carbon::parse($date)->format($format) : '';
    }

    /**
     * Formatear fecha y hora para mostrar
     */
    protected function formatDateTime($date, $format = 'd/m/Y H:i')
    {
        return $date ? Carbon::parse($date)->format($format) : '';
    }
}
