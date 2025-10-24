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
 * Controlador para exportar cantidades de equipos en formato Excel
 * Basado en la plantilla CantidadesEquiposBiomedicos(1).xls
 */
class EquipmentCountsExportController extends Controller
{
    /**
     * Exportar cantidades de equipos a Excel - TODOS los registros históricos
     */
    public function export(Request $request)
    {
        try {
            $type = $request->get('type', 'biomedical'); // 'biomedical' or 'industrial'
            
            $title = $type === 'industrial' ? 'Cantidades equipos industriales' : 'Cantidades equipos biomedicos';
            $filename = 'CantidadesEquipos.xlsx';
            
            // Obtener TODOS los registros históricos de equipos_indicador
            $registros = DB::table('equipos_indicador')
                ->orderBy('fecha', 'DESC')
                ->get();
            
            // Crear el archivo Excel
            $spreadsheet = new Spreadsheet();
            $sheet = $spreadsheet->getActiveSheet();
            
            // Configurar título
            $sheet->setTitle('Cantidades Equipos');
            
            // Agregar título principal
            $sheet->setCellValue('A1', $title);
            $sheet->mergeCells('A1:R1');
            
            // Estilo del título
            $sheet->getStyle('A1')->applyFromArray([
                'font' => [
                    'bold' => true,
                    'size' => 16
                ],
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_CENTER,
                    'vertical' => Alignment::VERTICAL_CENTER
                ]
            ]);
            
            // Headers de la tabla
            $headers = [
                'A3' => 'Cantidad registrada',
                'B3' => 'Fecha registro',
                'C3' => 'Total sede norte',
                'D3' => 'Total sede principal',
                'E3' => 'Total sede principal activos',
                'F3' => 'Total sede norte activos',
                'G3' => 'Total sede principal fuera de servicio',
                'H3' => 'Total sede norte fuera de servicio',
                'I3' => 'Total sede principal dados de baja',
                'J3' => 'Total sede norte dados de baja',
                'K3' => 'Total sede principal pendientes de dar de baja',
                'L3' => 'Total sede norte pendientes de dar de baja',
                'M3' => 'Total sede principal con repuesto pendiente activos',
                'N3' => 'Total sede norte con repuesto pendiente activos',
                'O3' => 'Total sede principal con repuesto pendiente fuera de servicio',
                'P3' => 'Total sede norte con repuesto pendiente fuera de servicio',
                'Q3' => 'Total sede principal pendiente por entregar',
                'R3' => 'Total sede norte pendiente por entregar'
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
            
            // Escribir TODOS los registros (uno por fila)
            $row = 4;
            foreach ($registros as $registro) {
                $sheet->setCellValue("A{$row}", $registro->cantidad ?? 0);
                $sheet->setCellValue("B{$row}", $registro->fecha ?? '');
                $sheet->setCellValue("C{$row}", $registro->cantidad_sede_norte ?? 0);
                $sheet->setCellValue("D{$row}", $registro->cantidad_sede_principal ?? 0);
                $sheet->setCellValue("E{$row}", $registro->cantidad_sede_principal_activos ?? 0);
                $sheet->setCellValue("F{$row}", $registro->cantidad_sede_norte_activos ?? 0);
                $sheet->setCellValue("G{$row}", $registro->cantidad_sede_principal_fuera_de_servicio ?? 0);
                $sheet->setCellValue("H{$row}", $registro->cantidad_sede_norte_fuera_de_servicio ?? 0);
                $sheet->setCellValue("I{$row}", $registro->cantidad_sede_principal_baja ?? 0);
                $sheet->setCellValue("J{$row}", $registro->cantidad_sede_norte_baja ?? 0);
                $sheet->setCellValue("K{$row}", $registro->cantidad_sede_principal_pendiente_baja ?? 0);
                $sheet->setCellValue("L{$row}", $registro->cantidad_sede_norte_pendiente_baja ?? 0);
                $sheet->setCellValue("M{$row}", $registro->cantidad_sede_principal_repuesto_pendiente_activos ?? 0);
                $sheet->setCellValue("N{$row}", $registro->cantidad_sede_norte_repuesto_pendiente_activos ?? 0);
                $sheet->setCellValue("O{$row}", $registro->cantidad_sede_principal_repuesto_pendiente_fuera_de_servicio ?? 0);
                $sheet->setCellValue("P{$row}", $registro->cantidad_sede_norte_repuesto_pendiente_fuera_de_servicio ?? 0);
                $sheet->setCellValue("Q{$row}", $registro->cantidad_sede_principal_pendiente_entregar ?? 0);
                $sheet->setCellValue("R{$row}", $registro->cantidad_sede_norte_pendiente_entregar ?? 0);
                
                // Estilo de la fila de datos
                $sheet->getStyle("A{$row}:R{$row}")->applyFromArray([
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
            }
            
            // Ajustar ancho de columnas
            foreach (range('A', 'R') as $column) {
                $sheet->getColumnDimension($column)->setAutoSize(true);
            }
            
            // Ajustar altura de filas
            $sheet->getRowDimension(1)->setRowHeight(30);
            $sheet->getRowDimension(3)->setRowHeight(40);
            $sheet->getRowDimension(4)->setRowHeight(25);
            
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
            
            return $response;
            
        } catch (\Exception $e) {
            \Log::error('Error al exportar cantidades de equipos: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al exportar cantidades de equipos',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Obtener estadísticas de equipos desde tabla equipos_indicador
     * Los datos ya están pre-calculados en esta tabla
     */
    private function getEquipmentStats($table)
    {
        try {
            // Obtener el registro más reciente de equipos_indicador
            $indicador = DB::table('equipos_indicador')
                ->orderBy('fecha', 'DESC')
                ->first();
            
            // Si no hay datos, retornar ceros
            if (!$indicador) {
                return [
                    'total' => 0,
                    'sede_norte' => 0,
                    'sede_principal' => 0,
                    'sede_principal_activos' => 0,
                    'sede_norte_activos' => 0,
                    'sede_principal_fuera_servicio' => 0,
                    'sede_norte_fuera_servicio' => 0,
                    'sede_principal_baja' => 0,
                    'sede_norte_baja' => 0,
                    'sede_principal_pendiente_baja' => 0,
                    'sede_norte_pendiente_baja' => 0,
                    'sede_principal_repuesto_activos' => 0,
                    'sede_norte_repuesto_activos' => 0,
                    'sede_principal_repuesto_fuera' => 0,
                    'sede_norte_repuesto_fuera' => 0,
                    'sede_principal_pendiente_entregar' => 0,
                    'sede_norte_pendiente_entregar' => 0
                ];
            }
            
            // Retornar datos directamente de la tabla equipos_indicador
            return [
                'total' => $indicador->cantidad ?? 0,
                'sede_norte' => $indicador->cantidad_sede_norte ?? 0,
                'sede_principal' => $indicador->cantidad_sede_principal ?? 0,
                'sede_principal_activos' => $indicador->cantidad_sede_principal_activos ?? 0,
                'sede_norte_activos' => $indicador->cantidad_sede_norte_activos ?? 0,
                'sede_principal_fuera_servicio' => $indicador->cantidad_sede_principal_fuera_de_servicio ?? 0,
                'sede_norte_fuera_servicio' => $indicador->cantidad_sede_norte_fuera_de_servicio ?? 0,
                'sede_principal_baja' => $indicador->cantidad_sede_principal_baja ?? 0,
                'sede_norte_baja' => $indicador->cantidad_sede_norte_baja ?? 0,
                'sede_principal_pendiente_baja' => $indicador->cantidad_sede_principal_pendiente_baja ?? 0,
                'sede_norte_pendiente_baja' => $indicador->cantidad_sede_norte_pendiente_baja ?? 0,
                'sede_principal_repuesto_activos' => $indicador->cantidad_sede_principal_repuesto_pendiente_activos ?? 0,
                'sede_norte_repuesto_activos' => $indicador->cantidad_sede_norte_repuesto_pendiente_activos ?? 0,
                'sede_principal_repuesto_fuera' => $indicador->cantidad_sede_principal_repuesto_pendiente_fuera_de_servicio ?? 0,
                'sede_norte_repuesto_fuera' => $indicador->cantidad_sede_norte_repuesto_pendiente_fuera_de_servicio ?? 0,
                'sede_principal_pendiente_entregar' => $indicador->cantidad_sede_principal_pendiente_entregar ?? 0,
                'sede_norte_pendiente_entregar' => $indicador->cantidad_sede_norte_pendiente_entregar ?? 0
            ];
            
        } catch (\Exception $e) {
            \Log::error('Error getting equipment stats: ' . $e->getMessage());
            
            // En caso de error, devolver valores básicos
            $total = DB::table($table)->count();
            return [
                'total' => $total,
                'sede_norte' => intval($total * 0.3), // Estimación 30% sede norte
                'sede_principal' => intval($total * 0.7), // Estimación 70% sede principal
                'sede_principal_activos' => intval($total * 0.6),
                'sede_norte_activos' => intval($total * 0.25),
                'sede_principal_fuera_servicio' => intval($total * 0.1),
                'sede_norte_fuera_servicio' => intval($total * 0.05),
                'sede_principal_baja' => 0,
                'sede_norte_baja' => 0,
                'sede_principal_pendiente_baja' => 0,
                'sede_norte_pendiente_baja' => 0,
                'sede_principal_repuesto_activos' => 0,
                'sede_norte_repuesto_activos' => 0,
                'sede_principal_repuesto_fuera' => 0,
                'sede_norte_repuesto_fuera' => 0,
                'sede_principal_pendiente_entregar' => 0,
                'sede_norte_pendiente_entregar' => 0
            ];
        }
    }
    
    private function getTableName()
    {
        return 'equipos'; // Default table name for subqueries
    }
    
    /**
     * DEBUG: Ver datos en JSON antes de exportar
     */
    public function exportListDebug(Request $request)
    {
        try {
            $type = $request->get('type', 'biomedical');
            $table = $type === 'industrial' ? 'equipos_industriales' : 'equipos';
            
            // Obtener solo 5 equipos para prueba
            $equipos = DB::table($table)
                ->leftJoin('servicios', "{$table}.servicio_id", '=', 'servicios.id')
                ->leftJoin('areas', "{$table}.area_id", '=', 'areas.id')
                ->leftJoin('sedes', 'servicios.sede_id', '=', 'sedes.id')
                ->select(
                    "{$table}.id",
                    "{$table}.code",
                    "{$table}.name",
                    "{$table}.marca",
                    "{$table}.modelo",
                    "{$table}.serial",
                    "{$table}.status",
                    "{$table}.created_at",
                    DB::raw("COALESCE(servicios.name, 'N/A') as servicio_nombre"),
                    DB::raw("COALESCE(areas.name, 'N/A') as area_nombre"),
                    DB::raw("COALESCE(sedes.name, 'N/A') as sede_nombre")
                )
                ->limit(5)
                ->get();
            
            return response()->json([
                'success' => true,
                'table' => $table,
                'count' => $equipos->count(),
                'data' => $equipos
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
                'line' => $e->getLine(),
                'file' => $e->getFile()
            ], 500);
        }
    }
    
    /**
     * Exportar LISTADO COMPLETO de equipos a Excel
     */
    public function exportList(Request $request)
    {
        try {
            $type = $request->get('type', 'biomedical');
            $table = $type === 'industrial' ? 'equipos_industriales' : 'equipos';
            $title = $type === 'industrial' ? 'LISTADO DE EQUIPOS INDUSTRIALES' : 'LISTADO DE EQUIPOS BIOMÉDICOS';
            $filename = $type === 'industrial' ? 'EquiposIndustrialesHUV.xlsx' : 'EquiposBiomedicosHUV.xlsx';
            
            // Obtener equipos
            $equipos = DB::table($table)
                ->leftJoin('servicios', "{$table}.servicio_id", '=', 'servicios.id')
                ->leftJoin('areas', "{$table}.area_id", '=', 'areas.id')
                ->leftJoin('sedes', 'servicios.sede_id', '=', 'sedes.id')
                ->select(
                    "{$table}.id",
                    "{$table}.code",
                    "{$table}.name",
                    "{$table}.marca",
                    "{$table}.modelo",
                    "{$table}.serial",
                    "{$table}.status",
                    "{$table}.created_at",
                    DB::raw("COALESCE(servicios.name, 'N/A') as servicio_nombre"),
                    DB::raw("COALESCE(areas.name, 'N/A') as area_nombre"),
                    DB::raw("COALESCE(sedes.name, 'N/A') as sede_nombre")
                )
                ->orderBy("{$table}.name", 'asc')
                ->get();
            
            // Crear Excel
            $spreadsheet = new Spreadsheet();
            $sheet = $spreadsheet->getActiveSheet();
            $sheet->setTitle('Equipos HUV');
            
            // HEADER
            $sheet->setCellValue('A1', 'HOSPITAL UNIVERSITARIO DEL VALLE');
            $sheet->mergeCells('A1:L1');
            $sheet->getStyle('A1')->applyFromArray([
                'font' => ['bold' => true, 'size' => 16],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]
            ]);
            
            $sheet->setCellValue('A2', $title);
            $sheet->mergeCells('A2:L2');
            $sheet->getStyle('A2')->applyFromArray([
                'font' => ['bold' => true, 'size' => 14],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]
            ]);
            
            $sheet->setCellValue('A3', 'Fecha: ' . Carbon::now()->format('d/m/Y H:i:s'));
            $sheet->mergeCells('A3:L3');
            
            // HEADERS
            $headers = ['#', 'CÓDIGO', 'NOMBRE', 'MARCA', 'MODELO', 'SERIE', 'SERVICIO', 'ÁREA', 'SEDE', 'ESTADO', 'FECHA REGISTRO', 'ID'];
            $col = 'A';
            foreach ($headers as $header) {
                $sheet->setCellValue($col . '5', $header);
                $col++;
            }
            
            $sheet->getStyle('A5:L5')->applyFromArray([
                'font' => ['bold' => true],
                'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '4472C4']],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]
            ]);
            
            // DATOS
            $row = 6;
            $counter = 1;
            foreach ($equipos as $equipo) {
                $sheet->setCellValue("A{$row}", $counter);
                $sheet->setCellValue("B{$row}", $equipo->code ?: 'N/A');
                $sheet->setCellValue("C{$row}", $equipo->name ?: 'N/A');
                $sheet->setCellValue("D{$row}", $equipo->marca ?: 'N/A');
                $sheet->setCellValue("E{$row}", $equipo->modelo ?: 'N/A');
                $sheet->setCellValue("F{$row}", $equipo->serial ?: 'N/A');
                $sheet->setCellValue("G{$row}", $equipo->servicio_nombre);
                $sheet->setCellValue("H{$row}", $equipo->area_nombre);
                $sheet->setCellValue("I{$row}", $equipo->sede_nombre);
                $sheet->setCellValue("J{$row}", $equipo->status == 1 ? 'ACTIVO' : 'INACTIVO');
                $sheet->setCellValue("K{$row}", $equipo->created_at ? Carbon::parse($equipo->created_at)->format('d/m/Y') : 'N/A');
                $sheet->setCellValue("L{$row}", $equipo->id);
                $row++;
                $counter++;
            }
            
            // Ajustar columnas
            foreach (range('A', 'L') as $column) {
                $sheet->getColumnDimension($column)->setAutoSize(true);
            }
            
            // Descargar
            $writer = new Xlsx($spreadsheet);
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
            \Log::error('Error exportando listado: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al exportar listado de equipos',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
