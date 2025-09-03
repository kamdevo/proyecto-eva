<?php

namespace App\Services\Export\Reports;

use App\Services\Export\ExportServiceBase;
use App\ConexionesVista\ResponseFormatter;
use Illuminate\Http\Request;
use Carbon\Carbon;

/**
 * Servicio especializado para reportes de calibraciones
 * Maneja exportación de reportes de calibraciones
 */
class CalibracionesReportService extends ExportServiceBase
{
    /**
     * Exportar reporte de calibraciones
     */
    public function exportCalibraciones(Request $request)
    {
        try {
            // Use direct DB query instead of Eloquent to avoid relationship issues
            $query = \DB::table('calibracion')
                ->leftJoin('equipos', 'calibracion.equipo_id', '=', 'equipos.id')
                ->leftJoin('areas', 'equipos.area_id', '=', 'areas.id')
                ->select([
                    'calibracion.id as codigo_calibracion',
                    'calibracion.fecha_calibracion',
                    'equipos.marca',
                    'equipos.code as codigo_equipo',
                    'equipos.serial',
                    'equipos.name as nombre_equipo',
                    'calibracion.equipo_id',
                    'calibracion.file as archivo',
                    'areas.name as ubicacion'
                ]);

            // Apply filters
            if ($request->has('equipo_id')) {
                $query->where('calibracion.equipo_id', $request->equipo_id);
            }

            if ($request->has('fecha_inicio')) {
                $query->where('calibracion.fecha_calibracion', '>=', $request->fecha_inicio);
            }

            if ($request->has('fecha_fin')) {
                $query->where('calibracion.fecha_calibracion', '<=', $request->fecha_fin);
            }

            $calibraciones = $query->orderBy('calibracion.fecha_calibracion', 'desc')->get();

            $data = $this->prepareCalibracionesData($calibraciones);
            $filename = 'calibracionesEB.xlsx';

            // Generate formatted Excel with professional styling
            return $this->generateFormattedExcel($data, $filename);

        } catch (\Exception $e) {
            \Log::error('Error en exportación de calibraciones: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
            
            // Return a simple error response that won't cause 500 errors
            return response()->json([
                'success' => false,
                'message' => 'Error al exportar calibraciones: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Preparar datos de calibraciones
     */
    private function prepareCalibracionesData($calibraciones)
    {
        $data = [];
        $headers = [
            'Codigo calibracion', 'Fecha de ejecucion', 'Marca', 'Codigo', 
            'Serie', 'Nombre equipo', 'Id equipo', 'Archivo', 'Ubicación'
        ];
        $data[] = $headers;

        foreach ($calibraciones as $calibracion) {
            $data[] = [
                $calibracion->codigo_calibracion ?? '',
                $calibracion->fecha_calibracion ?? '',
                $calibracion->marca ?? '',
                $calibracion->codigo_equipo ?? '',
                $calibracion->serial ?? '',
                $calibracion->nombre_equipo ?? '',
                $calibracion->equipo_id ?? '',
                $calibracion->archivo ?? '',
                $calibracion->ubicacion ?? ''
            ];
        }

        return $data;
    }

    /**
     * Generate formatted Excel file with borders and styling
     */
    private function generateFormattedExcel($data, $filename)
    {
        try {
            return \Maatwebsite\Excel\Facades\Excel::download(new class($data) implements 
            \Maatwebsite\Excel\Concerns\FromArray,
            \Maatwebsite\Excel\Concerns\WithHeadings,
            \Maatwebsite\Excel\Concerns\WithStyles,
            \Maatwebsite\Excel\Concerns\WithColumnWidths,
            \Maatwebsite\Excel\Concerns\WithTitle
        {
            private $data;

            public function __construct($data) {
                $this->data = $data;
            }

            public function array(): array {
                return array_slice($this->data, 1); // Skip headers
            }

            public function headings(): array {
                return $this->data[0]; // First row as headers
            }

            public function styles(\PhpOffice\PhpSpreadsheet\Worksheet\Worksheet $sheet)
            {
                $lastRow = count($this->data);
                
                // Header styling - Gray background with dark text
                $sheet->getStyle('A1:I1')->applyFromArray([
                    'font' => [
                        'bold' => true,
                        'color' => ['rgb' => '374151'],
                        'size' => 11,
                        'name' => 'Calibri'
                    ],
                    'fill' => [
                        'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                        'startColor' => ['rgb' => 'F3F4F6']
                    ],
                    'alignment' => [
                        'horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER,
                        'vertical' => \PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_CENTER
                    ],
                    'borders' => [
                        'allBorders' => [
                            'borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN,
                            'color' => ['rgb' => '000000']
                        ]
                    ]
                ]);

                // Data rows - All borders
                $sheet->getStyle('A1:I' . $lastRow)->applyFromArray([
                    'borders' => [
                        'allBorders' => [
                            'borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN,
                            'color' => ['rgb' => '000000']
                        ]
                    ],
                    'font' => [
                        'size' => 10,
                        'name' => 'Calibri'
                    ]
                ]);

                // Alternate row colors (zebra striping)
                for ($row = 2; $row <= $lastRow; $row++) {
                    if ($row % 2 == 0) {
                        $sheet->getStyle('A' . $row . ':I' . $row)->applyFromArray([
                            'fill' => [
                                'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                                'startColor' => ['rgb' => 'F8F9FA']
                            ]
                        ]);
                    }
                }

                // Center align specific columns
                $sheet->getStyle('A2:A' . $lastRow)->getAlignment()->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER);
                $sheet->getStyle('B2:B' . $lastRow)->getAlignment()->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER);
                $sheet->getStyle('G2:G' . $lastRow)->getAlignment()->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER);

                // Set row height for header
                $sheet->getRowDimension(1)->setRowHeight(25);
                
                // Auto-fit other rows
                for ($row = 2; $row <= $lastRow; $row++) {
                    $sheet->getRowDimension($row)->setRowHeight(-1);
                }

                return [];
            }

            public function columnWidths(): array
            {
                return [
                    'A' => 18, // Código Calibración
                    'B' => 20, // Fecha de Ejecución
                    'C' => 18, // Marca
                    'D' => 15, // Código
                    'E' => 25, // Serie
                    'F' => 40, // Nombre Equipo
                    'G' => 12, // ID Equipo
                    'H' => 20, // Archivo
                    'I' => 30, // Ubicación
                ];
            }

            public function title(): string
            {
                return 'Calibraciones';
            }
        }, $filename);
        } catch (\Exception $e) {
            \Log::error('Error generating formatted Excel: ' . $e->getMessage());
            throw $e;
        }
    }
}
