<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use Carbon\Carbon;

/**
 * Controlador para exportar contingencias en formato Excel
 */
class ContingenciasExportController extends Controller
{
    /**
     * Exportar contingencias a Excel
     */
    public function export(Request $request)
    {
        try {
            \Log::info('Starting contingencias Excel export...');
            
            // Obtener contingencias - solo tabla principal para evitar errores de JOIN
            $contingencias = DB::table('contingencias')
                ->orderBy('fecha', 'desc')
                ->get();
            
            \Log::info('Found ' . $contingencias->count() . ' contingencias');
            
            $filename = 'Contingencias_HUV_' . date('Y-m-d') . '.xlsx';
            
            // Crear el archivo Excel
            $spreadsheet = new Spreadsheet();
            $sheet = $spreadsheet->getActiveSheet();
            
            // Configurar título
            $sheet->setTitle('Contingencias HUV');
            
            // HEADER
            $sheet->setCellValue('A1', 'HOSPITAL UNIVERSITARIO DEL VALLE');
            $sheet->mergeCells('A1:H1');
            $sheet->getStyle('A1')->applyFromArray([
                'font' => ['bold' => true, 'size' => 16],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]
            ]);
            
            $sheet->setCellValue('A2', 'LISTADO DE CONTINGENCIAS');
            $sheet->mergeCells('A2:H2');
            $sheet->getStyle('A2')->applyFromArray([
                'font' => ['bold' => true, 'size' => 14],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]
            ]);
            
            $sheet->setCellValue('A3', 'Fecha: ' . Carbon::now()->format('d/m/Y H:i:s'));
            $sheet->mergeCells('A3:H3');
            
            // HEADERS - simplificado
            $headers = [
                'No.', 'ID', 'Fecha', 'Descripción', 'Estado', 'Usuario ID', 'Equipo ID', 'Archivo'
            ];
            $col = 'A';
            foreach ($headers as $header) {
                $sheet->setCellValue($col . '5', $header);
                $col++;
            }
            
            $sheet->getStyle('A5:H5')->applyFromArray([
                'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
                'fill' => [
                    'fillType' => Fill::FILL_SOLID,
                    'startColor' => ['rgb' => '4472C4']
                ],
                'borders' => [
                    'allBorders' => [
                        'borderStyle' => Border::BORDER_THIN,
                        'color' => ['rgb' => '000000']
                    ]
                ],
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_CENTER,
                    'vertical' => Alignment::VERTICAL_CENTER,
                    'wrapText' => true
                ]
            ]);
            
            // DATOS - simplificado
            $row = 6;
            $counter = 1;
            foreach ($contingencias as $contingencia) {
                $sheet->setCellValue("A{$row}", $counter);
                $sheet->setCellValue("B{$row}", $contingencia->id ?? '');
                $sheet->setCellValue("C{$row}", $contingencia->fecha ?? '');
                $sheet->setCellValue("D{$row}", $contingencia->observacion ?? 'Sin descripción');
                $sheet->setCellValue("E{$row}", ($contingencia->fecha_cierre ?? false) ? 'Cerrada' : 'Abierta');
                $sheet->setCellValue("F{$row}", $contingencia->usuario_id ?? 'N/A');
                $sheet->setCellValue("G{$row}", $contingencia->equipo_id ?? 'N/A');
                $sheet->setCellValue("H{$row}", $contingencia->file ?? 'Sin archivo');
                
                // Estilo de la fila de datos
                $sheet->getStyle("A{$row}:H{$row}")->applyFromArray([
                    'borders' => [
                        'allBorders' => [
                            'borderStyle' => Border::BORDER_THIN,
                            'color' => ['rgb' => '000000']
                        ]
                    ],
                    'alignment' => [
                        'horizontal' => Alignment::HORIZONTAL_CENTER,
                        'vertical' => Alignment::VERTICAL_CENTER
                    ]
                ]);
                
                $row++;
                $counter++;
            }
            
            // Ajustar ancho de columnas
            foreach (range('A', 'H') as $column) {
                $sheet->getColumnDimension($column)->setAutoSize(true);
            }
            
            // Ajustar altura de filas
            $sheet->getRowDimension(1)->setRowHeight(30);
            $sheet->getRowDimension(2)->setRowHeight(25);
            $sheet->getRowDimension(5)->setRowHeight(40);
            
            // Crear el writer y generar el archivo
            $writer = new Xlsx($spreadsheet);
            
            // Configurar headers para descarga
            $response = response()->stream(
                function () use ($writer) {
                    $writer->save('php://output');
                },
                200,
                [
                    'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    'Content-Disposition' => 'attachment; filename="' . $filename . '"',
                    'Cache-Control' => 'max-age=0',
                ]
            );
            
            \Log::info('Contingencias Excel export completed successfully');
            return $response;
            
        } catch (\Exception $e) {
            \Log::error('Error al exportar contingencias Excel: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'success' => false,
                'message' => 'Error al exportar contingencias a Excel',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
