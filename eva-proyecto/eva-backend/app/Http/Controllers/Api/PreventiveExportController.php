<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\ConexionesVista\ResponseFormatter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
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
            
            // Query base para mantenimientos preventivos
            $query = DB::table('mantenimientos_preventivos as mp')
                ->leftJoin('equipos as e', 'mp.equipo_id', '=', 'e.id')
                ->leftJoin('servicios as s', 'e.servicio_id', '=', 's.id')
                ->leftJoin('areas as a', 'e.area_id', '=', 'a.id')
                ->select([
                    'mp.id',
                    'mp.codigo',
                    'mp.fecha_programada',
                    'mp.fecha_ejecucion',
                    'mp.descripcion',
                    'mp.observaciones',
                    'mp.estado',
                    'mp.tipo',
                    'mp.tecnico_responsable',
                    'mp.costo',
                    'mp.file',
                    'e.id as equipo_id',
                    'e.name as equipo_nombre',
                    'e.code as equipo_codigo',
                    'e.marca',
                    'e.modelo',
                    'e.serial',
                    's.name as servicio',
                    'a.name as area'
                ]);
            
            // Filtrar por equipo si se especifica
            if ($equipoId) {
                $query->where('mp.equipo_id', $equipoId);
            }
            
            // Ordenar por fecha más reciente
            $query->orderBy('mp.fecha_programada', 'desc');
            
            $mantenimientos = $query->get();
            
            // Crear el archivo Excel
            $spreadsheet = new Spreadsheet();
            $sheet = $spreadsheet->getActiveSheet();
            
            // Configurar título
            $sheet->setTitle('Mantenimientos Preventivos');
            
            // Agregar título principal
            $title = $equipoId ? "Mantenimientos Preventivos - Equipo #{$equipoId}" : "Mantenimientos Preventivos";
            $sheet->setCellValue('A1', $title);
            $sheet->mergeCells('A1:R1');
            
            // Estilo del título
            $sheet->getStyle('A1')->applyFromArray([
                'font' => [
                    'bold' => true,
                    'size' => 16,
                    'color' => ['rgb' => 'FFFFFF']
                ],
                'fill' => [
                    'fillType' => Fill::FILL_SOLID,
                    'startColor' => ['rgb' => '2E7D32']
                ],
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_CENTER,
                    'vertical' => Alignment::VERTICAL_CENTER
                ]
            ]);
            
            // Headers de la tabla
            $headers = [
                'A3' => 'Código',
                'B3' => 'Fecha Programada',
                'C3' => 'Fecha Ejecución',
                'D3' => 'Estado',
                'E3' => 'Tipo',
                'F3' => 'Equipo',
                'G3' => 'Código Equipo',
                'H3' => 'Marca',
                'I3' => 'Modelo',
                'J3' => 'Serie',
                'K3' => 'Servicio',
                'L3' => 'Área',
                'M3' => 'Técnico',
                'N3' => 'Descripción',
                'O3' => 'Observaciones',
                'P3' => 'Costo',
                'Q3' => 'Archivo',
                'R3' => 'ID'
            ];
            
            // Aplicar headers
            foreach ($headers as $cell => $header) {
                $sheet->setCellValue($cell, $header);
            }
            
            // Estilo de headers
            $sheet->getStyle('A3:R3')->applyFromArray([
                'font' => [
                    'bold' => true,
                    'color' => ['rgb' => 'FFFFFF']
                ],
                'fill' => [
                    'fillType' => Fill::FILL_SOLID,
                    'startColor' => ['rgb' => '1976D2']
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
                $sheet->setCellValue("A{$row}", $mantenimiento->codigo ?: 'N/A');
                $sheet->setCellValue("B{$row}", $mantenimiento->fecha_programada ? Carbon::parse($mantenimiento->fecha_programada)->format('Y-m-d') : 'N/A');
                $sheet->setCellValue("C{$row}", $mantenimiento->fecha_ejecucion ? Carbon::parse($mantenimiento->fecha_ejecucion)->format('Y-m-d') : 'Pendiente');
                $sheet->setCellValue("D{$row}", ucfirst($mantenimiento->estado ?: 'N/A'));
                $sheet->setCellValue("E{$row}", ucfirst($mantenimiento->tipo ?: 'N/A'));
                $sheet->setCellValue("F{$row}", $mantenimiento->equipo_nombre ?: 'N/A');
                $sheet->setCellValue("G{$row}", $mantenimiento->equipo_codigo ?: 'N/A');
                $sheet->setCellValue("H{$row}", $mantenimiento->marca ?: 'N/A');
                $sheet->setCellValue("I{$row}", $mantenimiento->modelo ?: 'N/A');
                $sheet->setCellValue("J{$row}", $mantenimiento->serial ?: 'N/A');
                $sheet->setCellValue("K{$row}", $mantenimiento->servicio ?: 'N/A');
                $sheet->setCellValue("L{$row}", $mantenimiento->area ?: 'N/A');
                $sheet->setCellValue("M{$row}", $mantenimiento->tecnico_responsable ?: 'N/A');
                $sheet->setCellValue("N{$row}", $mantenimiento->descripcion ?: 'N/A');
                $sheet->setCellValue("O{$row}", $mantenimiento->observaciones ?: 'N/A');
                $sheet->setCellValue("P{$row}", $mantenimiento->costo ? '$' . number_format($mantenimiento->costo, 2) : 'N/A');
                $sheet->setCellValue("Q{$row}", $mantenimiento->file ? 'Sí' : 'No');
                $sheet->setCellValue("R{$row}", $mantenimiento->id);
                
                // Estilo alternado para las filas
                $fillColor = ($row % 2 == 0) ? 'F5F5F5' : 'FFFFFF';
                $sheet->getStyle("A{$row}:R{$row}")->applyFromArray([
                    'borders' => [
                        'allBorders' => [
                            'borderStyle' => Border::BORDER_THIN,
                            'color' => ['rgb' => 'CCCCCC']
                        ]
                    ],
                    'fill' => [
                        'fillType' => Fill::FILL_SOLID,
                        'startColor' => ['rgb' => $fillColor]
                    ],
                    'alignment' => [
                        'vertical' => Alignment::VERTICAL_CENTER,
                        'wrapText' => true
                    ]
                ]);
                
                $row++;
            }
            
            // Ajustar ancho de columnas
            $columnWidths = [
                'A' => 15, // Código
                'B' => 15, // Fecha Programada
                'C' => 15, // Fecha Ejecución
                'D' => 12, // Estado
                'E' => 12, // Tipo
                'F' => 25, // Equipo
                'G' => 15, // Código Equipo
                'H' => 15, // Marca
                'I' => 15, // Modelo
                'J' => 20, // Serie
                'K' => 20, // Servicio
                'L' => 15, // Área
                'M' => 20, // Técnico
                'N' => 30, // Descripción
                'O' => 30, // Observaciones
                'P' => 12, // Costo
                'Q' => 10, // Archivo
                'R' => 8   // ID
            ];
            
            foreach ($columnWidths as $column => $width) {
                $sheet->getColumnDimension($column)->setWidth($width);
            }
            
            // Ajustar altura de filas
            $sheet->getRowDimension(1)->setRowHeight(30);
            $sheet->getRowDimension(3)->setRowHeight(25);
            
            // Crear el writer y generar el archivo
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
