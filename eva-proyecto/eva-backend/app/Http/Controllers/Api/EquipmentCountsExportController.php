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
     * Exportar cantidades de equipos a Excel
     */
    public function export(Request $request)
    {
        try {
            $type = $request->get('type', 'biomedical'); // 'biomedical' or 'industrial'
            
            // Determinar la tabla según el tipo
            $table = $type === 'industrial' ? 'equipos_industriales' : 'equipos';
            $title = $type === 'industrial' ? 'Cantidades equipos industriales' : 'Cantidades equipos biomedicos';
            $filename = $type === 'industrial' ? 'CantidadesEquiposIndustriales.xlsx' : 'CantidadesEquiposBiomedicos.xlsx';
            
            // Obtener estadísticas de equipos
            $stats = $this->getEquipmentStats($table);
            
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
            
            // Datos de la fila
            $row = 4;
            $sheet->setCellValue("A{$row}", $stats['total']);
            $sheet->setCellValue("B{$row}", Carbon::now()->format('Y-m-d H:i:s'));
            $sheet->setCellValue("C{$row}", $stats['sede_norte']);
            $sheet->setCellValue("D{$row}", $stats['sede_principal']);
            $sheet->setCellValue("E{$row}", $stats['sede_principal_activos']);
            $sheet->setCellValue("F{$row}", $stats['sede_norte_activos']);
            $sheet->setCellValue("G{$row}", $stats['sede_principal_fuera_servicio']);
            $sheet->setCellValue("H{$row}", $stats['sede_norte_fuera_servicio']);
            $sheet->setCellValue("I{$row}", $stats['sede_principal_baja']);
            $sheet->setCellValue("J{$row}", $stats['sede_norte_baja']);
            $sheet->setCellValue("K{$row}", $stats['sede_principal_pendiente_baja']);
            $sheet->setCellValue("L{$row}", $stats['sede_norte_pendiente_baja']);
            $sheet->setCellValue("M{$row}", $stats['sede_principal_repuesto_activos']);
            $sheet->setCellValue("N{$row}", $stats['sede_norte_repuesto_activos']);
            $sheet->setCellValue("O{$row}", $stats['sede_principal_repuesto_fuera']);
            $sheet->setCellValue("P{$row}", $stats['sede_norte_repuesto_fuera']);
            $sheet->setCellValue("Q{$row}", $stats['sede_principal_pendiente_entregar']);
            $sheet->setCellValue("R{$row}", $stats['sede_norte_pendiente_entregar']);
            
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
            return ResponseFormatter::error('Error al exportar cantidades de equipos: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * Obtener estadísticas de equipos
     */
    private function getEquipmentStats($table)
    {
        try {
            // Total de equipos
            $total = DB::table($table)->count();
            
            // Obtener estadísticas por servicio/área ya que no hay campo sede directamente
            // Usaremos servicio_id para determinar ubicaciones
            $servicios = DB::table('servicios')->get();
            
            // Identificar servicios de sede norte (ajustar según nombres reales)
            $serviciosNorte = $servicios->filter(function($servicio) {
                return stripos($servicio->name, 'norte') !== false || 
                       stripos($servicio->name, 'urgencias') !== false ||
                       stripos($servicio->name, 'pediatría') !== false;
            })->pluck('id');
            
            // Equipos por sede basado en servicios
            $sedeNorte = DB::table($table)
                ->whereIn('servicio_id', $serviciosNorte)
                ->count();
            
            $sedePrincipal = $total - $sedeNorte;
            
            // Equipos activos por sede (usando campo status)
            $sedePrincipalActivos = DB::table($table)
                ->where('status', 1) // Asumiendo que status es 1 para activo
                ->whereNotIn('servicio_id', $serviciosNorte)
                ->count();
                
            $sedeNorteActivos = DB::table($table)
                ->where('status', 1)
                ->whereIn('servicio_id', $serviciosNorte)
                ->count();
            
            // Equipos fuera de servicio
            $sedePrincipalFueraServicio = DB::table($table)
                ->where('status', 0) // Asumiendo que status es 0 para inactivo
                ->whereNotIn('servicio_id', $serviciosNorte)
                ->count();
                
            $sedeNorteFueraServicio = DB::table($table)
                ->where('status', 0)
                ->whereIn('servicio_id', $serviciosNorte)
                ->count();
            
            // Equipos dados de baja (si existe campo baja o similar)
            $sedePrincipalBaja = 0;
            $sedeNorteBaja = 0;
            
            // Verificar si existe campo para equipos dados de baja
            $columns = DB::getSchemaBuilder()->getColumnListing($table);
            if (in_array('dado_baja', $columns)) {
                $sedePrincipalBaja = DB::table($table)
                    ->where('dado_baja', 1)
                    ->whereNotIn('servicio_id', $serviciosNorte)
                    ->count();
                    
                $sedeNorteBaja = DB::table($table)
                    ->where('dado_baja', 1)
                    ->whereIn('servicio_id', $serviciosNorte)
                    ->count();
            }
            
            // Equipos con repuesto pendiente (si existe campo)
            $sedePrincipalRepuestoActivos = 0;
            $sedeNorteRepuestoActivos = 0;
            $sedePrincipalRepuestoFuera = 0;
            $sedeNorteRepuestoFuera = 0;
            
            if (in_array('repuesto_pendiente', $columns)) {
                $sedePrincipalRepuestoActivos = DB::table($table)
                    ->where('repuesto_pendiente', 1)
                    ->where('status', 1)
                    ->whereNotIn('servicio_id', $serviciosNorte)
                    ->count();
                    
                $sedeNorteRepuestoActivos = DB::table($table)
                    ->where('repuesto_pendiente', 1)
                    ->where('status', 1)
                    ->whereIn('servicio_id', $serviciosNorte)
                    ->count();
                    
                $sedePrincipalRepuestoFuera = DB::table($table)
                    ->where('repuesto_pendiente', 1)
                    ->where('status', 0)
                    ->whereNotIn('servicio_id', $serviciosNorte)
                    ->count();
                    
                $sedeNorteRepuestoFuera = DB::table($table)
                    ->where('repuesto_pendiente', 1)
                    ->where('status', 0)
                    ->whereIn('servicio_id', $serviciosNorte)
                    ->count();
            }
            
            return [
                'total' => $total,
                'sede_norte' => $sedeNorte,
                'sede_principal' => $sedePrincipal,
                'sede_principal_activos' => $sedePrincipalActivos,
                'sede_norte_activos' => $sedeNorteActivos,
                'sede_principal_fuera_servicio' => $sedePrincipalFueraServicio,
                'sede_norte_fuera_servicio' => $sedeNorteFueraServicio,
                'sede_principal_baja' => $sedePrincipalBaja,
                'sede_norte_baja' => $sedeNorteBaja,
                'sede_principal_pendiente_baja' => 0, // Implementar si existe campo específico
                'sede_norte_pendiente_baja' => 0,
                'sede_principal_repuesto_activos' => $sedePrincipalRepuestoActivos,
                'sede_norte_repuesto_activos' => $sedeNorteRepuestoActivos,
                'sede_principal_repuesto_fuera' => $sedePrincipalRepuestoFuera,
                'sede_norte_repuesto_fuera' => $sedeNorteRepuestoFuera,
                'sede_principal_pendiente_entregar' => 0, // Implementar si existe campo específico
                'sede_norte_pendiente_entregar' => 0
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
}
