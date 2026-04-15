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
use PhpOffice\PhpSpreadsheet\Style\Font;
use Carbon\Carbon;

/**
 * Controlador para exportar LISTADO COMPLETO de equipos en formato Excel
 * Basado en la estructura de la plantilla EquiposHUV (53).xls
 */
class EquipmentListExportController extends Controller
{
    /**
     * Exportar listado completo de equipos a Excel
     */
    public function export(Request $request)
    {
        try {
            $type = $request->get('type', 'biomedical'); // 'biomedical' or 'industrial'
            
            // Determinar la tabla según el tipo
            $table = $type === 'industrial' ? 'equipos_industriales' : 'equipos';
            $title = $type === 'industrial' ? 'LISTADO DE EQUIPOS INDUSTRIALES' : 'LISTADO DE EQUIPOS BIOMÉDICOS';
            $filename = $type === 'industrial' ? 'EquiposIndustrialesHUV.xlsx' : 'EquiposBiomedicosHUV.xlsx';
            
            // Obtener TODOS los equipos con sus relaciones
            $equipos = $this->getEquiposCompletos($table);
            
            // Crear el archivo Excel
            $spreadsheet = new Spreadsheet();
            $sheet = $spreadsheet->getActiveSheet();
            
            // Configurar título de la hoja
            $sheet->setTitle('Equipos HUV');
            
            // ===== HEADER PRINCIPAL =====
            $sheet->setCellValue('A1', 'HOSPITAL UNIVERSITARIO DEL VALLE');
            $sheet->mergeCells('A1:O1');
            $sheet->getStyle('A1')->applyFromArray([
                'font' => ['bold' => true, 'size' => 18, 'color' => ['rgb' => 'FFFFFF']],
                'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '1F4E78']],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER]
            ]);
            $sheet->getRowDimension(1)->setRowHeight(35);
            
            // ===== SUBTÍTULO =====
            $sheet->setCellValue('A2', $title);
            $sheet->mergeCells('A2:O2');
            $sheet->getStyle('A2')->applyFromArray([
                'font' => ['bold' => true, 'size' => 14, 'color' => ['rgb' => 'FFFFFF']],
                'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '2E5C8A']],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER]
            ]);
            $sheet->getRowDimension(2)->setRowHeight(28);
            
            // ===== FECHA Y HORA DE GENERACIÓN =====
            $sheet->setCellValue('A3', 'Fecha de generación: ' . Carbon::now()->format('d/m/Y H:i:s'));
            $sheet->mergeCells('A3:O3');
            $sheet->getStyle('A3')->applyFromArray([
                'font' => ['size' => 10, 'italic' => true],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_RIGHT]
            ]);
            $sheet->getRowDimension(3)->setRowHeight(18);
            
            // ===== HEADERS DE COLUMNAS =====
            $headers = [
                'A5' => '#',
                'B5' => 'CÓDIGO',
                'C5' => 'NOMBRE DEL EQUIPO',
                'D5' => 'MARCA',
                'E5' => 'MODELO',
                'F5' => 'SERIE',
                'G5' => 'SERVICIO',
                'H5' => 'ÁREA',
                'I5' => 'SEDE',
                'J5' => 'ESTADO',
                'K5' => 'ESTADO EQUIPO',
                'L5' => 'FECHA REGISTRO',
                'M5' => 'ÚLTIMA ACTUALIZACIÓN',
                'N5' => 'RESPONSABLE',
                'O5' => 'OBSERVACIONES'
            ];
            
            // Aplicar headers
            foreach ($headers as $cell => $header) {
                $sheet->setCellValue($cell, $header);
            }
            
            // Estilo de headers
            $sheet->getStyle('A5:O5')->applyFromArray([
                'font' => [
                    'bold' => true,
                    'color' => ['rgb' => 'FFFFFF'],
                    'size' => 11
                ],
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
            $sheet->getRowDimension(5)->setRowHeight(35);
            
            // ===== DATOS DE EQUIPOS =====
            $row = 6;
            $counter = 1;
            
            foreach ($equipos as $equipo) {
                $sheet->setCellValue("A{$row}", $counter);
                $sheet->setCellValue("B{$row}", $equipo->code ?: 'N/A');
                $sheet->setCellValue("C{$row}", $equipo->name ?: 'N/A');
                $sheet->setCellValue("D{$row}", $equipo->marca ?: 'N/A');
                $sheet->setCellValue("E{$row}", $equipo->modelo ?: 'N/A');
                $sheet->setCellValue("F{$row}", $equipo->serial ?: 'N/A');
                $sheet->setCellValue("G{$row}", $equipo->servicio_nombre ?: 'N/A');
                $sheet->setCellValue("H{$row}", $equipo->area_nombre ?: 'N/A');
                $sheet->setCellValue("I{$row}", $equipo->sede_nombre ?: 'N/A');
                $sheet->setCellValue("J{$row}", $equipo->status == 1 ? 'ACTIVO' : 'INACTIVO');
                $sheet->setCellValue("K{$row}", $equipo->estado_equipo ?: 'N/A');
                $sheet->setCellValue("L{$row}", $equipo->fecha_registro ?: 'N/A');
                $sheet->setCellValue("M{$row}", $equipo->updated_at ?: 'N/A');
                $sheet->setCellValue("N{$row}", $equipo->responsable_mantenimiento ?: 'N/A');
                $sheet->setCellValue("O{$row}", $equipo->observaciones ?: '');
                
                // Estilo de fila (alternar colores)
                $fillColor = ($counter % 2 == 0) ? 'F2F2F2' : 'FFFFFF';
                $sheet->getStyle("A{$row}:O{$row}")->applyFromArray([
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
                        'wrapText' => false
                    ]
                ]);
                
                // Color especial para estado
                $statusColor = $equipo->status == 1 ? '00B050' : 'FF0000';
                $sheet->getStyle("J{$row}")->applyFromArray([
                    'font' => [
                        'bold' => true,
                        'color' => ['rgb' => $statusColor]
                    ]
                ]);
                
                $row++;
                $counter++;
            }
            
            // ===== RESUMEN AL FINAL =====
            $row++; // Espacio
            $sheet->setCellValue("A{$row}", 'RESUMEN:');
            $sheet->getStyle("A{$row}")->getFont()->setBold(true)->setSize(12);
            
            $row++;
            $totalEquipos = count($equipos);
            $totalActivos = collect($equipos)->where('status', 1)->count();
            $totalInactivos = $totalEquipos - $totalActivos;
            
            $sheet->setCellValue("A{$row}", "Total de Equipos: {$totalEquipos}");
            $sheet->setCellValue("C{$row}", "Activos: {$totalActivos}");
            $sheet->setCellValue("E{$row}", "Inactivos: {$totalInactivos}");
            
            $sheet->getStyle("A{$row}:E{$row}")->applyFromArray([
                'font' => ['bold' => true],
                'fill' => [
                    'fillType' => Fill::FILL_SOLID,
                    'startColor' => ['rgb' => 'E7E6E6']
                ]
            ]);
            
            // ===== AJUSTAR ANCHOS DE COLUMNAS =====
            $sheet->getColumnDimension('A')->setWidth(6);   // #
            $sheet->getColumnDimension('B')->setWidth(15);  // Código
            $sheet->getColumnDimension('C')->setWidth(35);  // Nombre
            $sheet->getColumnDimension('D')->setWidth(18);  // Marca
            $sheet->getColumnDimension('E')->setWidth(18);  // Modelo
            $sheet->getColumnDimension('F')->setWidth(18);  // Serie
            $sheet->getColumnDimension('G')->setWidth(25);  // Servicio
            $sheet->getColumnDimension('H')->setWidth(20);  // Área
            $sheet->getColumnDimension('I')->setWidth(15);  // Sede
            $sheet->getColumnDimension('J')->setWidth(12);  // Estado
            $sheet->getColumnDimension('K')->setWidth(18);  // Estado Equipo
            $sheet->getColumnDimension('L')->setWidth(18);  // Fecha Registro
            $sheet->getColumnDimension('M')->setWidth(18);  // Última Actualización
            $sheet->getColumnDimension('N')->setWidth(20);  // Responsable
            $sheet->getColumnDimension('O')->setWidth(30);  // Observaciones
            
            // ===== CONGELAR PANELES (filas de header) =====
            $sheet->freezePane('A6');
            
            // ===== CREAR Y DESCARGAR =====
            $writer = new Xlsx($spreadsheet);
            
            $response = response()->stream(
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
            
            return $response;
            
        } catch (\Exception $e) {
            \Log::error('Error al exportar listado de equipos: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al exportar listado de equipos',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Obtener todos los equipos con sus relaciones completas
     */
    private function getEquiposCompletos($table)
    {
        try {
            // Query COMPLETA con TODOS los JOINs necesarios
            $equipos = DB::table($table)
                ->leftJoin('servicios', "{$table}.servicio_id", '=', 'servicios.id')
                ->leftJoin('areas', "{$table}.area_id", '=', 'areas.id')
                ->leftJoin('sedes', 'servicios.sede_id', '=', 'sedes.id')
                ->leftJoin('estadoequipos', "{$table}.estadoequipo_id", '=', 'estadoequipos.id')
                ->select(
                    "{$table}.id",
                    "{$table}.code",
                    "{$table}.name",
                    "{$table}.marca",
                    "{$table}.modelo",
                    "{$table}.serial",
                    "{$table}.status",
                    "{$table}.created_at as fecha_registro",
                    DB::raw("COALESCE(servicios.name, 'N/A') as servicio_nombre"),
                    DB::raw("COALESCE(areas.name, 'N/A') as area_nombre"),
                    DB::raw("COALESCE(sedes.name, 'N/A') as sede_nombre"),
                    DB::raw("COALESCE(estadoequipos.name, 'N/A') as estado_equipo"),
                    // Subquery para responsable de mantenimiento (del año más reciente)
                    DB::raw("(SELECT pm.responsable FROM planes_mantenimientos pm 
                             WHERE pm.equipo_id = {$table}.id 
                             ORDER BY pm.anio DESC LIMIT 1) as responsable_mantenimiento"),
                    // Subquery para última observación de tabla observaciones
                    DB::raw("(SELECT o.description FROM observaciones o 
                             WHERE o.equipo_id = {$table}.id 
                             ORDER BY o.created_at DESC LIMIT 1) as observaciones")
                )
                ->orderBy("{$table}.name", 'asc')
                ->get();
            
            // Formatear fecha_registro
            foreach ($equipos as $equipo) {
                $equipo->fecha_registro = $equipo->fecha_registro ? 
                    Carbon::parse($equipo->fecha_registro)->format('d/m/Y') : 'N/A';
                // Como updated_at NO existe, usar N/A
                $equipo->updated_at = 'N/A';
            }
            
            return $equipos;
            
        } catch (\Exception $e) {
            \Log::error('Error obteniendo equipos completos: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
            throw $e;
        }
    }
}
