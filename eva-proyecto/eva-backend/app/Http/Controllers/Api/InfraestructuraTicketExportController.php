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
use Illuminate\Support\Facades\Log;

class InfraestructuraTicketExportController extends Controller
{
    public function export(Request $request)
    {
        try {
            $year = $request->get('year', date('Y'));
            
            // Consultar la tabla ordenes sumando por tipo de mantenimiento
            $stats = DB::table('ordenes')
                ->leftJoin('tipos_mantenimientos', 'ordenes.tipo_mantenimiento_id', '=', 'tipos_mantenimientos.id')
                ->where('ordenes.subproceso_id', 3) // 3 = Infraestructura
                ->whereYear('ordenes.fecha_inicio', $year)
                ->select(
                    DB::raw('COALESCE(tipos_mantenimientos.nombre, "Sin Categoría") as categoria'),
                    DB::raw('COUNT(ordenes.id) as total')
                )
                ->groupBy('tipos_mantenimientos.nombre')
                ->orderBy('total', 'desc')
                ->get();

            $spreadsheet = new Spreadsheet();
            $sheet = $spreadsheet->getActiveSheet();
            $sheet->setTitle('Estadísticas Infraestructura');

            // Header Principal
            $sheet->setCellValue('A1', 'HOSPITAL UNIVERSITARIO DEL VALLE');
            $sheet->mergeCells('A1:B1');
            $sheet->getStyle('A1')->applyFromArray([
                'font' => ['bold' => true, 'size' => 16, 'color' => ['rgb' => 'FFFFFF']],
                'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '1F4E78']],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER]
            ]);
            $sheet->getRowDimension(1)->setRowHeight(30);

            // Subtítulo
            $sheet->setCellValue('A2', 'CONSOLIDADO DE TICKETS DE INFRAESTRUCTURA POR CATEGORÍA (' . $year . ')');
            $sheet->mergeCells('A2:B2');
            $sheet->getStyle('A2')->applyFromArray([
                'font' => ['bold' => true, 'size' => 12, 'color' => ['rgb' => 'FFFFFF']],
                'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '14b8a6']], // Teal color for Infra
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]
            ]);
            $sheet->getRowDimension(2)->setRowHeight(25);

            // Fecha Generación
            $sheet->setCellValue('A3', 'Generado: ' . Carbon::now()->format('d/m/Y H:i:s'));
            $sheet->mergeCells('A3:B3');
            $sheet->getStyle('A3')->applyFromArray([
                'font' => ['italic' => true, 'size' => 10],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_RIGHT]
            ]);

            // Headers Columnas
            $sheet->setCellValue('A5', 'CATEGORÍA DE MANTENIMIENTO');
            $sheet->setCellValue('B5', 'CANTIDAD DE TICKETS');

            $sheet->getStyle('A5:B5')->applyFromArray([
                'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
                'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '0f766e']], // Dark teal
                'borders' => [
                    'allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => '000000']]
                ],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER]
            ]);
            $sheet->getRowDimension(5)->setRowHeight(25);

            // Datos
            $row = 6;
            $totalTickets = 0;

            foreach ($stats as $stat) {
                $sheet->setCellValue("A{$row}", $stat->categoria);
                $sheet->setCellValue("B{$row}", $stat->total);
                
                $totalTickets += $stat->total;

                $fillColor = ($row % 2 == 0) ? 'F2F2F2' : 'FFFFFF';
                $sheet->getStyle("A{$row}:B{$row}")->applyFromArray([
                    'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => 'CCCCCC']]],
                    'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => $fillColor]],
                    'alignment' => ['vertical' => Alignment::VERTICAL_CENTER]
                ]);
                $sheet->getStyle("B{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                $row++;
            }

            // Total Final
            $sheet->setCellValue("A{$row}", 'TOTAL GENERAL');
            $sheet->setCellValue("B{$row}", $totalTickets);
            $sheet->getStyle("A{$row}:B{$row}")->applyFromArray([
                'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
                'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '14b8a6']],
                'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => '000000']]],
            ]);
            $sheet->getStyle("B{$row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

            // Anchos
            $sheet->getColumnDimension('A')->setWidth(40);
            $sheet->getColumnDimension('B')->setWidth(25);

            $filename = 'Consolidado_Tickets_Infraestructura_' . $year . '.xlsx';

            $writer = new Xlsx($spreadsheet);

            return response()->stream(
                function () use ($writer) {
                    $writer->save('php://output');
                },
                200,
                [
                    'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    'Content-Disposition' => 'attachment; filename="' . $filename . '"',
                    'Cache-Control' => 'max-age=0'
                ]
            );

        } catch (\Exception $e) {
            Log::error('Error exportando stats infraestructura: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error exportando estadísticas',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
