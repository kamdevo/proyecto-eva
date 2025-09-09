<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\ConexionesVista\ResponseFormatter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use Carbon\Carbon;

/**
 * Controlador para exportar mantenimientos preventivos en formato Excel
 */
class PreventiveExportController extends Controller
{
    /**
     * Exportar mantenimientos preventivos a Excel
     */
    public function export(Request $request)
    {
        try {
            $equipoId = $request->get('equipo_id');
            
            // Construir consulta base
            $query = DB::table('planes_mantenimientos')
                ->select('planes_mantenimientos.*')
                ->leftJoin('equipos', 'planes_mantenimientos.equipo_id', '=', 'equipos.id')
                ->leftJoin('servicios', 'equipos.servicio_id', '=', 'servicios.id')
                ->leftJoin('areas', 'equipos.area_id', '=', 'areas.id')
                ->addSelect([
                    'equipos.name as equipo_nombre',
                    'equipos.code as equipo_codigo',
                    'equipos.marca',
                    'equipos.modelo', 
                    'equipos.serial',
                    'servicios.name as servicio',
                    'areas.name as area'
                ]);
            
            // Filtrar por equipo si se especifica
            if ($equipoId) {
                $query->where('planes_mantenimientos.equipo_id', $equipoId);
            }
            
            // Ordenar por fecha más reciente
            $query->orderBy('planes_mantenimientos.fecha_programada', 'desc');
            
            $mantenimientos = $query->get();
            
            // Crear el archivo Excel
            $spreadsheet = new Spreadsheet();
            $sheet = $spreadsheet->getActiveSheet();
            
            // Configurar título
            $sheet->setTitle('Mantenimientos Preventivos');
            
            // Agregar título principal
            $title = $equipoId ? "Mantenimientos Preventivos - Equipo #{$equipoId}" : "Mantenimientos Preventivos";
            $sheet->setCellValue('A1', $title);
            $sheet->mergeCells('A1:Q1');
            
            // Estilo del título
            $sheet->getStyle('A1')->applyFromArray([
                'font' => [
                    'bold' => true,
                    'size' => 16,
                    'color' => ['rgb' => '374151'],
                    'name' => 'Calibri'
                ],
                'fill' => [
                    'fillType' => Fill::FILL_SOLID,
                    'startColor' => ['rgb' => 'E5E7EB']
                ],
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
            
            // Headers de la tabla
            $headers = [
                'A3' => 'ID',
                'B3' => 'Equipo ID',
                'C3' => 'Fecha Programada', 
                'D3' => 'Fecha Mantenimiento',
                'E3' => 'Estado',
                'F3' => 'Tipo Mantenimiento',
                'G3' => 'Descripción',
                'H3' => 'Responsable',
                'I3' => 'Observaciones',
                'J3' => 'Año',
                'K3' => 'Equipo',
                'L3' => 'Código Equipo',
                'M3' => 'Marca',
                'N3' => 'Modelo',
                'O3' => 'Serie',
                'P3' => 'Servicio',
                'Q3' => 'Área'
            ];
            
            // Aplicar headers
            foreach ($headers as $cell => $header) {
                $sheet->setCellValue($cell, $header);
            }
            
            // Estilo de headers
            $sheet->getStyle('A3:Q3')->applyFromArray([
                'font' => [
                    'bold' => true,
                    'color' => ['rgb' => '374151'],
                    'size' => 11,
                    'name' => 'Calibri'
                ],
                'fill' => [
                    'fillType' => Fill::FILL_SOLID,
                    'startColor' => ['rgb' => 'F3F4F6']
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
            
            // Datos de las filas
            $row = 4;
            foreach ($mantenimientos as $mantenimiento) {
                $sheet->setCellValue("A{$row}", $mantenimiento->id);
                $sheet->setCellValue("B{$row}", $mantenimiento->equipo_id ?: 'N/A');
                $sheet->setCellValue("C{$row}", $mantenimiento->fecha_programada ? Carbon::parse($mantenimiento->fecha_programada)->format('Y-m-d') : 'N/A');
                $sheet->setCellValue("D{$row}", $mantenimiento->fecha_mantenimiento ? Carbon::parse($mantenimiento->fecha_mantenimiento)->format('Y-m-d') : 'Pendiente');
                $sheet->setCellValue("E{$row}", ucfirst($mantenimiento->estado ?: 'N/A'));
                $sheet->setCellValue("F{$row}", $mantenimiento->tipo_mantenimiento ?: 'N/A');
                $sheet->setCellValue("G{$row}", $mantenimiento->descripcion ?: 'N/A');
                $sheet->setCellValue("H{$row}", $mantenimiento->responsable ?: 'N/A');
                $sheet->setCellValue("I{$row}", $mantenimiento->observaciones ?: 'N/A');
                $sheet->setCellValue("J{$row}", $mantenimiento->anio ?: 'N/A');
                $sheet->setCellValue("K{$row}", $mantenimiento->equipo_nombre ?: 'N/A');
                $sheet->setCellValue("L{$row}", $mantenimiento->equipo_codigo ?: 'N/A');
                $sheet->setCellValue("M{$row}", $mantenimiento->marca ?: 'N/A');
                $sheet->setCellValue("N{$row}", $mantenimiento->modelo ?: 'N/A');
                $sheet->setCellValue("O{$row}", $mantenimiento->serial ?: 'N/A');
                $sheet->setCellValue("P{$row}", $mantenimiento->servicio ?: 'N/A');
                $sheet->setCellValue("Q{$row}", $mantenimiento->area ?: 'N/A');
                
                // Estilo alternado para las filas
                $fillColor = ($row % 2 == 0) ? 'F8F9FA' : 'FFFFFF';
                $sheet->getStyle("A{$row}:Q{$row}")->applyFromArray([
                    'borders' => [
                        'allBorders' => [
                            'borderStyle' => Border::BORDER_THIN,
                            'color' => ['rgb' => '000000']
                        ]
                    ],
                    'fill' => [
                        'fillType' => Fill::FILL_SOLID,
                        'startColor' => ['rgb' => $fillColor]
                    ],
                    'alignment' => [
                        'vertical' => Alignment::VERTICAL_CENTER,
                        'wrapText' => true
                    ],
                    'font' => [
                        'size' => 10,
                        'name' => 'Calibri'
                    ]
                ]);
                
                $row++;
            }
            
            // Ajustar ancho de columnas
            $columnWidths = [
                'A' => 8,  // ID
                'B' => 12, // Equipo ID
                'C' => 15, // Fecha Programada
                'D' => 15, // Fecha Real
                'E' => 12, // Estado
                'F' => 20, // Tipo Mantenimiento
                'G' => 30, // Descripción
                'H' => 20, // Responsable
                'I' => 30, // Observaciones
                'J' => 8,  // Año
                'K' => 25, // Equipo
                'L' => 15, // Código Equipo
                'M' => 15, // Marca
                'N' => 15, // Modelo
                'O' => 20, // Serie
                'P' => 20, // Servicio
                'Q' => 15  // Área
            ];
            
            foreach ($columnWidths as $column => $width) {
                $sheet->getColumnDimension($column)->setWidth($width);
            }
            
            // Centrar ciertas columnas
            $sheet->getStyle('A4:A' . ($row - 1))->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle('B4:B' . ($row - 1))->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle('E4:E' . ($row - 1))->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle('J4:J' . ($row - 1))->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

            // Ajustar altura de filas
            $sheet->getRowDimension(1)->setRowHeight(30);
            $sheet->getRowDimension(3)->setRowHeight(25);
            
            // Auto-fit para las filas de datos
            for ($i = 4; $i < $row; $i++) {
                $sheet->getRowDimension($i)->setRowHeight(-1);
            }            // Crear el writer y generar el archivo
            $writer = new Xlsx($spreadsheet);
            
            $filename = $equipoId ? "MantenimientosPreventivos_Equipo_{$equipoId}.xlsx" : "MantenimientosPreventivos.xlsx";
            
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
            
            return $response;
            
        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al exportar mantenimientos preventivos: ' . $e->getMessage(), 500);
        }
    }
}
