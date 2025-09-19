<?php

namespace App\Services\Export\Reports;

use App\Services\Export\ExportServiceBase;
use App\ConexionesVista\ResponseFormatter;
use App\Interactions\DatabaseInteraction;
use App\Models\Mantenimiento;
use Illuminate\Http\Request;
use Carbon\Carbon;

/**
 * Servicio especializado para reportes de mantenimiento
 * Maneja exportación de plantillas y estadísticas de mantenimiento
 */
class MantenimientoReportService extends ExportServiceBase
{
    /**
     * Exportar plantilla de mantenimiento vacía
     * Genera archivo Excel vacío con las 6 columnas específicas para carga de cronogramas
     */
    public function exportPlantillaMantenimiento(Request $request)
    {
        try {
            // Solo formato Excel es soportado para plantilla vacía
            $spreadsheet = new \PhpOffice\PhpSpreadsheet\Spreadsheet();
            $sheet = $spreadsheet->getActiveSheet();
            
            // Configurar título de la hoja
            $sheet->setTitle('Plantilla Mantenimiento');
            
            // Headers según especificación del informe exportacionesmto.md
            $headers = [
                'A1' => 'Id equipo',
                'B1' => 'Mes1', 
                'C1' => 'Mes2',
                'D1' => 'Mes3',
                'E1' => 'Responsable',
                'F1' => 'Frecuencia de mantenimiento'
            ];
            
            // Aplicar headers
            foreach ($headers as $cell => $header) {
                $sheet->setCellValue($cell, $header);
            }
            
            // Estilo de headers
            $sheet->getStyle('A1:F1')->applyFromArray([
                'font' => [
                    'bold' => true,
                    'color' => ['rgb' => '374151'],
                    'size' => 12,
                    'name' => 'Calibri'
                ],
                'fill' => [
                    'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                    'startColor' => ['rgb' => 'E5E7EB']
                ],
                'borders' => [
                    'allBorders' => [
                        'borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN,
                        'color' => ['rgb' => '000000']
                    ]
                ],
                'alignment' => [
                    'horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER,
                    'vertical' => \PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_CENTER
                ]
            ]);
            
            // Ajustar ancho de columnas
            $columnWidths = [
                'A' => 12, // Id equipo
                'B' => 8,  // Mes1
                'C' => 8,  // Mes2  
                'D' => 8,  // Mes3
                'E' => 20, // Responsable
                'F' => 25  // Frecuencia de mantenimiento
            ];
            
            foreach ($columnWidths as $column => $width) {
                $sheet->getColumnDimension($column)->setWidth($width);
            }
            
            // Crear el writer y generar el archivo
            $writer = new \PhpOffice\PhpSpreadsheet\Writer\Xlsx($spreadsheet);
            $filename = 'Plantilla_Mantenimiento_' . date('Y-m-d') . '.xlsx';
            
            // Configurar headers para descarga
            return response()->stream(
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
            
        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al exportar plantilla: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Exportar consolidado de mantenimiento
     * Genera reporte completo con 32 columnas según especificación del informe
     */
    public function exportConsolidadoMantenimiento(Request $request)
    {
        try {
            $anio = $request->get('anio', date('Y'));
            
            // Consulta compleja para obtener todos los datos requeridos según el informe
            $query = \Illuminate\Support\Facades\DB::table('planes_mantenimientos')
                ->leftJoin('equipos', 'planes_mantenimientos.equipo_id', '=', 'equipos.id')
                ->leftJoin('servicios', 'equipos.servicio_id', '=', 'servicios.id')
                ->leftJoin('areas', 'equipos.area_id', '=', 'areas.id')
                ->leftJoin('sedes', 'servicios.sede_id', '=', 'sedes.id')
                ->leftJoin('estadoequipos', 'equipos.estadoequipo_id', '=', 'estadoequipos.id')
                ->leftJoin('cambios_cronograma', 'planes_mantenimientos.id', '=', 'cambios_cronograma.planes_mantenimientos_id')
                ->leftJoin('usuarios as creador', 'planes_mantenimientos.usuario_id', '=', 'creador.id')
                ->leftJoin('usuarios as editor', 'cambios_cronograma.usuario_id', '=', 'editor.id')
                ->where('planes_mantenimientos.anio', $anio)
                ->select([
                    'planes_mantenimientos.created_at as fecha_creacion',
                    \Illuminate\Support\Facades\DB::raw("CONCAT(creador.nombre, ' ', creador.apellido, ' (', creador.username, ')') as usuario_responsable"),
                    'cambios_cronograma.created_at as fecha_ultima_actualizacion',
                    'cambios_cronograma.cambio as ultima_edicion',
                    \Illuminate\Support\Facades\DB::raw("CONCAT(editor.nombre, ' ', editor.apellido, ' (', editor.username, ')') as responsable_edicion"),
                    'planes_mantenimientos.equipo_id',
                    'equipos.name as nombre_equipo',
                    'equipos.marca',
                    'equipos.modelo',
                    'equipos.serial',
                    'equipos.code as codigo',
                    'servicios.name as servicio',
                    'areas.name as area',
                    'sedes.name as sede',
                    'equipos.propiedad',
                    'planes_mantenimientos.anio',
                    'planes_mantenimientos.frecuencia',
                    'planes_mantenimientos.mes1',
                    'planes_mantenimientos.mes2', 
                    'planes_mantenimientos.mes3',
                    'planes_mantenimientos.responsable',
                    'estadoequipos.name as estado_equipo'
                ]);
            
            $planes = $query->get();
            
            // Para cada plan, obtener los mantenimientos ejecutados
            $data = [];
            foreach ($planes as $plan) {
                $mantenimientos = \Illuminate\Support\Facades\DB::table('mantenimiento')
                    ->leftJoin('proveedor_mantenimiento', 'mantenimiento.proveedor_mantenimiento_id', '=', 'proveedor_mantenimiento.id')
                    ->where('mantenimiento.equipo_id', $plan->equipo_id)
                    ->whereYear('mantenimiento.fecha_mantenimiento', $anio)
                    ->orderBy('mantenimiento.fecha_mantenimiento')
                    ->select([
                        'mantenimiento.description',
                        'mantenimiento.fecha_mantenimiento',
                        'proveedor_mantenimiento.name as proveedor'
                    ])
                    ->limit(4) // Máximo 4 visitas según especificación
                    ->get();
                
                $data[] = [
                    // 1-5: Información de control
                    $plan->fecha_creacion ? Carbon::parse($plan->fecha_creacion)->format('Y-m-d H:i:s') : '',
                    $plan->usuario_responsable ?: '',
                    $plan->fecha_ultima_actualizacion ? Carbon::parse($plan->fecha_ultima_actualizacion)->format('Y-m-d H:i:s') : '',
                    $plan->ultima_edicion ?: '',
                    $plan->responsable_edicion ?: '',
                    
                    // 6-15: Información del equipo
                    $plan->equipo_id,
                    $plan->nombre_equipo ?: '',
                    $plan->marca ?: '',
                    $plan->modelo ?: '',
                    $plan->serial ?: '',
                    $plan->codigo ?: '',
                    $plan->servicio ?: '',
                    $plan->area ?: '',
                    $plan->sede ?: '',
                    $plan->propiedad ?: '',
                    
                    // 16-22: Información de planificación
                    $plan->anio,
                    $plan->frecuencia ?: '',
                    $plan->mes1 ?: '',
                    $plan->mes2 ?: '',
                    $plan->mes3 ?: '',
                    $plan->responsable ?: '',
                    count($mantenimientos), // Cantidad de preventivos realizados
                    
                    // 23-30: Información de mantenimientos ejecutados (hasta 4 visitas)
                    isset($mantenimientos[0]) ? ($mantenimientos[0]->description . ' - ' . $mantenimientos[0]->proveedor) : '',
                    isset($mantenimientos[0]) ? ($mantenimientos[0]->fecha_mantenimiento ? Carbon::parse($mantenimientos[0]->fecha_mantenimiento)->format('Y-m-d') : '') : '',
                    isset($mantenimientos[1]) ? ($mantenimientos[1]->description . ' - ' . $mantenimientos[1]->proveedor) : '',
                    isset($mantenimientos[1]) ? ($mantenimientos[1]->fecha_mantenimiento ? Carbon::parse($mantenimientos[1]->fecha_mantenimiento)->format('Y-m-d') : '') : '',
                    isset($mantenimientos[2]) ? ($mantenimientos[2]->description . ' - ' . $mantenimientos[2]->proveedor) : '',
                    isset($mantenimientos[2]) ? ($mantenimientos[2]->fecha_mantenimiento ? Carbon::parse($mantenimientos[2]->fecha_mantenimiento)->format('Y-m-d') : '') : '',
                    isset($mantenimientos[3]) ? ($mantenimientos[3]->description . ' - ' . $mantenimientos[3]->proveedor) : '',
                    isset($mantenimientos[3]) ? ($mantenimientos[3]->fecha_mantenimiento ? Carbon::parse($mantenimientos[3]->fecha_mantenimiento)->format('Y-m-d') : '') : '',
                    
                    // 31-32: Estados
                    $plan->estado_equipo ?: '',
                    $this->determinarEstadoMantenimiento($plan, $mantenimientos)
                ];
            }
            
            return $this->generarExcelConsolidado($data, $anio);
            
        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al exportar consolidado: ' . $e->getMessage(), 500);
        }
    }
    
    /**
     * Exportar estadísticas de cumplimiento
     */
    public function exportEstadisticasCumplimiento(Request $request)
    {
        $validation = $this->validateExportRequest($request, [
            'año' => 'required|integer|min:2020|max:2030',
            'servicio_id' => 'nullable|exists:servicios,id',
            'formato' => 'required|in:pdf,excel'
        ]);

        if ($validation) {
            return $validation;
        }

        try {
            $resumen = DatabaseInteraction::getMaintenanceComplianceSummary($request->año);

            if ($resumen->getData()->status !== 'success') {
                return $resumen;
            }

            $data = $this->prepareEstadisticasData($resumen->getData()->data);
            $titulo = 'Estadísticas de Cumplimiento ' . $request->año;
            $filename = 'estadisticas_cumplimiento_' . $request->año;

            return $this->executeExport($data, $titulo, $request->formato, $filename);

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al exportar estadísticas: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Preparar datos de plantilla
     */
    private function preparePlantillaData($mantenimientos)
    {
        $data = [];
        $headers = [
            'Fecha Programada', 'Equipo', 'Código', 'Tipo', 'Técnico Asignado',
            'Servicio', 'Área', 'Estado', 'Observaciones'
        ];
        $data[] = $headers;

        foreach ($mantenimientos as $mantenimiento) {
            $data[] = [
                $this->formatDate($mantenimiento->fecha_programada),
                $mantenimiento->equipo->nombre ?? '',
                $mantenimiento->equipo->codigo ?? '',
                ucfirst($mantenimiento->type),
                $mantenimiento->tecnico ? $mantenimiento->tecnico->nombre . ' ' . $mantenimiento->tecnico->apellidos : '',
                $mantenimiento->equipo->servicio->nombre ?? '',
                $mantenimiento->equipo->area->nombre ?? '',
                ucfirst($mantenimiento->status),
                $mantenimiento->observaciones ?? ''
            ];
        }

        return $data;
    }

    /**
     * Preparar datos de estadísticas
     */
    private function prepareEstadisticasData($resumen)
    {
        $data = [];

        // Resumen general
        $data[] = ['RESUMEN GENERAL'];
        $data[] = ['Total Programados', $resumen->total_programados];
        $data[] = ['Total Ejecutados', $resumen->total_ejecutados];
        $data[] = ['% Cumplimiento Global', $resumen->porcentaje_cumplimiento . '%'];
        $data[] = [''];

        // Por mes
        $data[] = ['CUMPLIMIENTO POR MES'];
        $data[] = ['Mes', 'Programados', 'Ejecutados', '% Cumplimiento'];
        foreach ($resumen->por_mes as $mes) {
            $data[] = [
                $mes->nombre_mes,
                $mes->programados,
                $mes->ejecutados,
                $mes->cumplimiento . '%'
            ];
        }
        $data[] = [''];

        // Por tipo
        $data[] = ['CUMPLIMIENTO POR TIPO'];
        $data[] = ['Tipo', 'Programados', 'Ejecutados', '% Cumplimiento'];
        foreach ($resumen->por_tipo as $tipo) {
            $data[] = [
                ucfirst($tipo->tipo),
                $tipo->programados,
                $tipo->ejecutados,
                $tipo->cumplimiento . '%'
            ];
        }

        return $data;
    }
    
    /**
     * Generar archivo Excel consolidado con las 32 columnas especificadas
     */
    private function generarExcelConsolidado($data, $anio)
    {
        $spreadsheet = new \PhpOffice\PhpSpreadsheet\Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        
        // Configurar título
        $sheet->setTitle('Consolidado Mantenimiento');
        
        // Título principal
        $titulo = "REPORTE CONSOLIDADO DE MANTENIMIENTO PREVENTIVO - AÑO {$anio}";
        $sheet->setCellValue('A1', $titulo);
        $sheet->mergeCells('A1:AF1');
        
        // Estilo del título
        $sheet->getStyle('A1')->applyFromArray([
            'font' => [
                'bold' => true,
                'size' => 14,
                'color' => ['rgb' => '374151'],
                'name' => 'Calibri'
            ],
            'fill' => [
                'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                'startColor' => ['rgb' => 'D1FAE5']
            ],
            'alignment' => [
                'horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER,
                'vertical' => \PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_CENTER
            ]
        ]);
        
        // Headers de las 32 columnas según especificación
        $headers = [
            'A3' => 'Fecha de creación del registro',
            'B3' => 'Usuario responsable',
            'C3' => 'Fecha de la ultima actualización',
            'D3' => 'Ultima edición realizada',
            'E3' => 'Responsable de la edición',
            'F3' => 'Equipo Id',
            'G3' => 'Nombre',
            'H3' => 'Marca',
            'I3' => 'Modelo',
            'J3' => 'Serie',
            'K3' => 'Codigo',
            'L3' => 'Servicio',
            'M3' => 'Area',
            'N3' => 'Sede',
            'O3' => 'Propiedad',
            'P3' => 'Año vigencia mantenimiento',
            'Q3' => 'Frecuencia de mantenimiento',
            'R3' => 'Mes1',
            'S3' => 'Mes2',
            'T3' => 'Mes3',
            'U3' => 'Responsable del mantenimiento',
            'V3' => 'Cantidad de preventivos realizados en el año',
            'W3' => 'Soporte primer visita',
            'X3' => 'Fecha primer visita',
            'Y3' => 'Soporte segunda visita',
            'Z3' => 'Fecha segunda visita',
            'AA3' => 'Soporte tercer visita',
            'AB3' => 'Fecha tercer visita',
            'AC3' => 'Soporte cuarta visita',
            'AD3' => 'Fecha cuarta visita',
            'AE3' => 'Estado del equipo',
            'AF3' => 'Estado del mantenimiento'
        ];
        
        // Aplicar headers
        foreach ($headers as $cell => $header) {
            $sheet->setCellValue($cell, $header);
        }
        
        // Estilo de headers
        $sheet->getStyle('A3:AF3')->applyFromArray([
            'font' => [
                'bold' => true,
                'color' => ['rgb' => '374151'],
                'size' => 10,
                'name' => 'Calibri'
            ],
            'fill' => [
                'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                'startColor' => ['rgb' => 'F3F4F6']
            ],
            'borders' => [
                'allBorders' => [
                    'borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN,
                    'color' => ['rgb' => '000000']
                ]
            ],
            'alignment' => [
                'horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER,
                'vertical' => \PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_CENTER,
                'wrapText' => true
            ]
        ]);
        
        // Datos de las filas
        $row = 4;
        foreach ($data as $registro) {
            $col = 'A';
            foreach ($registro as $valor) {
                $sheet->setCellValue($col . $row, $valor);
                $col++;
            }
            
            // Estilo alternado para las filas
            $fillColor = ($row % 2 == 0) ? 'F8F9FA' : 'FFFFFF';
            $sheet->getStyle('A' . $row . ':AF' . $row)->applyFromArray([
                'borders' => [
                    'allBorders' => [
                        'borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN,
                        'color' => ['rgb' => '000000']
                    ]
                ],
                'fill' => [
                    'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                    'startColor' => ['rgb' => $fillColor]
                ],
                'alignment' => [
                    'vertical' => \PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_CENTER,
                    'wrapText' => true
                ],
                'font' => [
                    'size' => 9,
                    'name' => 'Calibri'
                ]
            ]);
            
            $row++;
        }
        
        // Ajustar ancho de columnas
        $columnWidths = [
            'A' => 20, 'B' => 25, 'C' => 20, 'D' => 30, 'E' => 25,
            'F' => 10, 'G' => 25, 'H' => 15, 'I' => 15, 'J' => 20,
            'K' => 15, 'L' => 20, 'M' => 15, 'N' => 15, 'O' => 15,
            'P' => 8, 'Q' => 20, 'R' => 8, 'S' => 8, 'T' => 8,
            'U' => 20, 'V' => 12, 'W' => 30, 'X' => 15, 'Y' => 30,
            'Z' => 15, 'AA' => 30, 'AB' => 15, 'AC' => 30, 'AD' => 15,
            'AE' => 15, 'AF' => 20
        ];
        
        foreach ($columnWidths as $column => $width) {
            $sheet->getColumnDimension($column)->setWidth($width);
        }
        
        // Ajustar altura de filas
        $sheet->getRowDimension(1)->setRowHeight(25);
        $sheet->getRowDimension(3)->setRowHeight(30);
        
        // Crear el writer y generar el archivo
        $writer = new \PhpOffice\PhpSpreadsheet\Writer\Xlsx($spreadsheet);
        $filename = "Consolidado_Mantenimiento_{$anio}_" . date('Y-m-d') . '.xlsx';
        
        // Configurar headers para descarga
        return response()->stream(
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
    }
    
    /**
     * Determinar estado del mantenimiento basado en programación vs ejecución
     */
    private function determinarEstadoMantenimiento($plan, $mantenimientos)
    {
        $mesesProgramados = array_filter([$plan->mes1, $plan->mes2, $plan->mes3]);
        $mantenimientosEjecutados = count($mantenimientos);
        $totalProgramados = count($mesesProgramados);
        
        if ($mantenimientosEjecutados == 0) {
            return 'Pendiente';
        } elseif ($mantenimientosEjecutados >= $totalProgramados) {
            return 'Completo';
        } else {
            return 'Parcial';
        }
    }
}
