<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Color;

/**
 * Controlador para exportación de reportes de Guías Rápidas
 */
class GuiaRapidaExportController extends Controller
{
    // Colores institucionales
    const COLOR_HEADER = '1E3A8A'; // Azul oscuro
    const COLOR_SUBHEADER = '3B82F6'; // Azul
    const COLOR_SUCCESS = '10B981'; // Verde
    const COLOR_WARNING = 'F59E0B'; // Naranja
    const COLOR_DANGER = 'EF4444'; // Rojo
    const COLOR_INFO = '8B5CF6'; // Púrpura

    /**
     * Obtener equipos priorizados (que cumplen criterios)
     */
    private function getEquiposPriorizados()
    {
        return DB::table('equipos as e')
            ->leftJoin('servicios as s', 'e.servicio_id', '=', 's.id')
            ->leftJoin('sedes as sed', 's.sede_id', '=', 'sed.id')
            ->leftJoin('estadoequipos as ee', 'e.estadoequipo_id', '=', 'ee.id')
            ->leftJoin('guias_rapidas as gr', 'e.guia_id', '=', 'gr.id')
            ->leftJoin('criesgo as cr', 'e.criesgo_id', '=', 'cr.id')
            ->where('e.tipo_id', 1) // Solo biomédicos
            ->whereNotIn('e.estadoequipo_id', function($query) {
                $query->select('estadoequipo_id')
                      ->from('estados_excluidos_guias');
            })
            ->whereIn('e.criesgo_id', function($query) {
                $query->select('criesgo_id')
                      ->from('riesgos_incluidos_guias');
            })
            ->whereNotIn('e.name', function($query) {
                $query->select('name')
                      ->from('equipos_excluidos_guias');
            })
            ->where(function($query) {
                $query->where('s.sede_id', '!=', 2)
                      ->orWhere('e.propietario_id', '!=', 25)
                      ->orWhereNull('s.sede_id');
            })
            ->select(
                'e.id',
                'e.name as equipo',
                'e.code as codigo',
                'e.serial',
                'e.marca',
                'e.modelo',
                'sed.name as sede',
                's.name as servicio',
                'ee.name as estado',
                'cr.name as riesgo',
                'gr.name as guia',
                'gr.estado as estado_guia'
            )
            ->orderBy('e.name')
            ->get();
    }

    /**
     * Exportar equipos priorizados
     */
    public function exportPriorizados(Request $request)
    {
        try {
            $equipos = $this->getEquiposPriorizados();
            
            $spreadsheet = new Spreadsheet();
            $sheet = $spreadsheet->getActiveSheet();
            $sheet->setTitle('Equipos Priorizados');

            // Encabezado
            $this->setHeader($sheet, 'EQUIPOS PRIORIZADOS - GUÍAS RÁPIDAS', 'J');
            
            // Columnas
            $headers = ['ID', 'Equipo', 'Código', 'Serial', 'Marca', 'Modelo', 'Sede', 'Servicio', 'Estado', 'Riesgo'];
            $this->setColumnHeaders($sheet, 3, $headers, self::COLOR_HEADER);
            
            // Datos
            $row = 4;
            foreach ($equipos as $equipo) {
                $sheet->setCellValue('A' . $row, $equipo->id);
                $sheet->setCellValue('B' . $row, $equipo->equipo);
                $sheet->setCellValue('C' . $row, $equipo->codigo);
                $sheet->setCellValue('D' . $row, $equipo->serial);
                $sheet->setCellValue('E' . $row, $equipo->marca);
                $sheet->setCellValue('F' . $row, $equipo->modelo);
                $sheet->setCellValue('G' . $row, $equipo->sede);
                $sheet->setCellValue('H' . $row, $equipo->servicio);
                $sheet->setCellValue('I' . $row, $equipo->estado);
                $sheet->setCellValue('J' . $row, $equipo->riesgo);
                $row++;
            }
            
            // Estilos
            $this->applyTableStyles($sheet, 'A3:J' . ($row - 1));
            $this->autoSizeColumns($sheet, 'A', 'J');
            
            // Resumen
            $sheet->setCellValue('A' . ($row + 1), 'Total de equipos priorizados:');
            $sheet->setCellValue('B' . ($row + 1), count($equipos));
            $sheet->getStyle('A' . ($row + 1) . ':B' . ($row + 1))->getFont()->setBold(true);
            
            return $this->downloadSpreadsheet($spreadsheet, 'Equipos_Priorizados');
            
        } catch (\Exception $e) {
            Log::error('Error exportando equipos priorizados: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Exportar equipos con guía
     */
    public function exportConGuia(Request $request)
    {
        try {
            $equipos = $this->getEquiposPriorizados()
                ->filter(function($equipo) {
                    return !empty($equipo->guia);
                });
            
            $spreadsheet = new Spreadsheet();
            $sheet = $spreadsheet->getActiveSheet();
            $sheet->setTitle('Equipos Con Guía');

            // Encabezado
            $this->setHeader($sheet, 'EQUIPOS CON GUÍA RÁPIDA', 'K');
            
            // Columnas
            $headers = ['ID', 'Equipo', 'Código', 'Serial', 'Marca', 'Modelo', 'Sede', 'Servicio', 'Estado', 'Guía', 'Estado Guía'];
            $this->setColumnHeaders($sheet, 3, $headers, self::COLOR_SUCCESS);
            
            // Datos
            $row = 4;
            foreach ($equipos as $equipo) {
                $sheet->setCellValue('A' . $row, $equipo->id);
                $sheet->setCellValue('B' . $row, $equipo->equipo);
                $sheet->setCellValue('C' . $row, $equipo->codigo);
                $sheet->setCellValue('D' . $row, $equipo->serial);
                $sheet->setCellValue('E' . $row, $equipo->marca);
                $sheet->setCellValue('F' . $row, $equipo->modelo);
                $sheet->setCellValue('G' . $row, $equipo->sede);
                $sheet->setCellValue('H' . $row, $equipo->servicio);
                $sheet->setCellValue('I' . $row, $equipo->estado);
                $sheet->setCellValue('J' . $row, $equipo->guia);
                $sheet->setCellValue('K' . $row, $equipo->estado_guia ? 'Activo' : 'Inactivo');
                $row++;
            }
            
            // Estilos
            $this->applyTableStyles($sheet, 'A3:K' . ($row - 1));
            $this->autoSizeColumns($sheet, 'A', 'K');
            
            // Resumen
            $sheet->setCellValue('A' . ($row + 1), 'Total de equipos con guía:');
            $sheet->setCellValue('B' . ($row + 1), count($equipos));
            $sheet->getStyle('A' . ($row + 1) . ':B' . ($row + 1))->getFont()->setBold(true);
            $sheet->getStyle('B' . ($row + 1))->getFill()
                ->setFillType(Fill::FILL_SOLID)
                ->getStartColor()->setARGB(self::COLOR_SUCCESS);
            
            return $this->downloadSpreadsheet($spreadsheet, 'Equipos_Con_Guia');
            
        } catch (\Exception $e) {
            Log::error('Error exportando equipos con guía: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Exportar equipos sin guía
     */
    public function exportSinGuia(Request $request)
    {
        try {
            $equipos = $this->getEquiposPriorizados()
                ->filter(function($equipo) {
                    return empty($equipo->guia);
                });
            
            $spreadsheet = new Spreadsheet();
            $sheet = $spreadsheet->getActiveSheet();
            $sheet->setTitle('Equipos Sin Guía');

            // Encabezado
            $this->setHeader($sheet, 'EQUIPOS SIN GUÍA RÁPIDA', 'J');
            
            // Columnas
            $headers = ['ID', 'Equipo', 'Código', 'Serial', 'Marca', 'Modelo', 'Sede', 'Servicio', 'Estado', 'Riesgo'];
            $this->setColumnHeaders($sheet, 3, $headers, self::COLOR_WARNING);
            
            // Datos
            $row = 4;
            foreach ($equipos as $equipo) {
                $sheet->setCellValue('A' . $row, $equipo->id);
                $sheet->setCellValue('B' . $row, $equipo->equipo);
                $sheet->setCellValue('C' . $row, $equipo->codigo);
                $sheet->setCellValue('D' . $row, $equipo->serial);
                $sheet->setCellValue('E' . $row, $equipo->marca);
                $sheet->setCellValue('F' . $row, $equipo->modelo);
                $sheet->setCellValue('G' . $row, $equipo->sede);
                $sheet->setCellValue('H' . $row, $equipo->servicio);
                $sheet->setCellValue('I' . $row, $equipo->estado);
                $sheet->setCellValue('J' . $row, $equipo->riesgo);
                $row++;
            }
            
            // Estilos
            $this->applyTableStyles($sheet, 'A3:J' . ($row - 1));
            $this->autoSizeColumns($sheet, 'A', 'J');
            
            // Resumen
            $sheet->setCellValue('A' . ($row + 1), 'Total de equipos sin guía:');
            $sheet->setCellValue('B' . ($row + 1), count($equipos));
            $sheet->getStyle('A' . ($row + 1) . ':B' . ($row + 1))->getFont()->setBold(true);
            $sheet->getStyle('B' . ($row + 1))->getFill()
                ->setFillType(Fill::FILL_SOLID)
                ->getStartColor()->setARGB(self::COLOR_WARNING);
            
            return $this->downloadSpreadsheet($spreadsheet, 'Equipos_Sin_Guia');
            
        } catch (\Exception $e) {
            Log::error('Error exportando equipos sin guía: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Exportar indicador por grupo
     */
    public function exportIndicador(Request $request)
    {
        try {
            $indicadores = DB::select("
                SELECT 
                    e.name as nombre,
                    COUNT(DISTINCT CASE WHEN e.guia_id IS NOT NULL THEN e.id END) as cantidad_cubierta,
                    COUNT(DISTINCT e.id) as cantidad_total,
                    ROUND((COUNT(DISTINCT CASE WHEN e.guia_id IS NOT NULL THEN e.id END) / COUNT(DISTINCT e.id)) * 100, 2) as porcentaje
                FROM equipos e
                LEFT JOIN servicios s ON e.servicio_id = s.id
                WHERE e.tipo_id = 1
                    AND e.estadoequipo_id NOT IN (SELECT estadoequipo_id FROM estados_excluidos_guias)
                    AND e.criesgo_id IN (SELECT criesgo_id FROM riesgos_incluidos_guias)
                    AND e.name NOT IN (SELECT name FROM equipos_excluidos_guias)
                    AND (s.sede_id != 2 OR e.propietario_id != 25 OR s.sede_id IS NULL)
                GROUP BY e.name
                ORDER BY e.name ASC
            ");
            
            $spreadsheet = new Spreadsheet();
            $sheet = $spreadsheet->getActiveSheet();
            $sheet->setTitle('Indicador por Grupo');

            // Encabezado
            $this->setHeader($sheet, 'INDICADOR POR GRUPO - GUÍAS RÁPIDAS', 'D');
            
            // Columnas
            $headers = ['Nombre del Equipo', 'Cantidad Cubierta', 'Cantidad Total', 'Porcentaje (%)'];
            $this->setColumnHeaders($sheet, 3, $headers, self::COLOR_INFO);
            
            // Datos
            $row = 4;
            foreach ($indicadores as $indicador) {
                $sheet->setCellValue('A' . $row, $indicador->nombre);
                $sheet->setCellValue('B' . $row, $indicador->cantidad_cubierta);
                $sheet->setCellValue('C' . $row, $indicador->cantidad_total);
                $sheet->setCellValue('D' . $row, $indicador->porcentaje);
                
                // Color según porcentaje
                $color = $indicador->porcentaje == 100 ? self::COLOR_SUCCESS :
                        ($indicador->porcentaje >= 75 ? self::COLOR_HEADER :
                        ($indicador->porcentaje >= 50 ? self::COLOR_WARNING : self::COLOR_DANGER));
                
                $sheet->getStyle('D' . $row)->getFill()
                    ->setFillType(Fill::FILL_SOLID)
                    ->getStartColor()->setARGB($color);
                $sheet->getStyle('D' . $row)->getFont()->getColor()->setARGB(Color::COLOR_WHITE);
                
                $row++;
            }
            
            // Estilos
            $this->applyTableStyles($sheet, 'A3:D' . ($row - 1));
            $this->autoSizeColumns($sheet, 'A', 'D');
            
            // Resumen
            $totalEquipos = array_sum(array_column($indicadores, 'cantidad_total'));
            $totalCubiertos = array_sum(array_column($indicadores, 'cantidad_cubierta'));
            $porcentajeGlobal = $totalEquipos > 0 ? round(($totalCubiertos / $totalEquipos) * 100, 2) : 0;
            
            $sheet->setCellValue('A' . ($row + 1), 'TOTALES:');
            $sheet->setCellValue('B' . ($row + 1), $totalCubiertos);
            $sheet->setCellValue('C' . ($row + 1), $totalEquipos);
            $sheet->setCellValue('D' . ($row + 1), $porcentajeGlobal);
            $sheet->getStyle('A' . ($row + 1) . ':D' . ($row + 1))->getFont()->setBold(true);
            $sheet->getStyle('A' . ($row + 1) . ':D' . ($row + 1))->getFill()
                ->setFillType(Fill::FILL_SOLID)
                ->getStartColor()->setARGB('E5E7EB');
            
            return $this->downloadSpreadsheet($spreadsheet, 'Indicador_Por_Grupo');
            
        } catch (\Exception $e) {
            Log::error('Error exportando indicador: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Exportar detalle por grupo
     */
    public function exportDetalle(Request $request)
    {
        try {
            $nombreFiltro = $request->input('nombre');
            
            $query = "
                SELECT 
                    e.name as nombre,
                    e.marca,
                    e.modelo,
                    COUNT(DISTINCT e.id) as cantidad_total,
                    COUNT(DISTINCT CASE WHEN e.guia_id IS NOT NULL THEN e.id END) as cantidad_con_guia
                FROM equipos e
                LEFT JOIN servicios s ON e.servicio_id = s.id
                WHERE e.tipo_id = 1
                    AND e.estadoequipo_id NOT IN (SELECT estadoequipo_id FROM estados_excluidos_guias)
                    AND e.criesgo_id IN (SELECT criesgo_id FROM riesgos_incluidos_guias)
                    AND e.name NOT IN (SELECT name FROM equipos_excluidos_guias)
                    AND (s.sede_id != 2 OR e.propietario_id != 25 OR s.sede_id IS NULL)
            ";
            
            if ($nombreFiltro) {
                $query .= " AND e.name = :nombre";
            }
            
            $query .= " GROUP BY e.name, e.marca, e.modelo ORDER BY e.name, e.marca, e.modelo";
            
            $detalles = $nombreFiltro 
                ? DB::select($query, ['nombre' => $nombreFiltro])
                : DB::select($query);
            
            $spreadsheet = new Spreadsheet();
            $sheet = $spreadsheet->getActiveSheet();
            $sheet->setTitle('Detalle por Grupo');

            // Encabezado
            $titulo = $nombreFiltro 
                ? "DETALLE POR GRUPO - $nombreFiltro"
                : "DETALLE POR GRUPO - TODOS LOS EQUIPOS";
            $this->setHeader($sheet, $titulo, 'E');
            
            // Columnas
            $headers = ['Nombre', 'Marca', 'Modelo', 'Cantidad Total', 'Cantidad con Guía'];
            $this->setColumnHeaders($sheet, 3, $headers, self::COLOR_INFO);
            
            // Datos
            $row = 4;
            foreach ($detalles as $detalle) {
                $sheet->setCellValue('A' . $row, $detalle->nombre);
                $sheet->setCellValue('B' . $row, $detalle->marca ?: 'N/A');
                $sheet->setCellValue('C' . $row, $detalle->modelo ?: 'N/A');
                $sheet->setCellValue('D' . $row, $detalle->cantidad_total);
                $sheet->setCellValue('E' . $row, $detalle->cantidad_con_guia);
                
                // Color según cobertura
                $color = $detalle->cantidad_con_guia == $detalle->cantidad_total ? self::COLOR_SUCCESS :
                        ($detalle->cantidad_con_guia > 0 ? self::COLOR_WARNING : self::COLOR_DANGER);
                
                $sheet->getStyle('E' . $row)->getFill()
                    ->setFillType(Fill::FILL_SOLID)
                    ->getStartColor()->setARGB($color);
                $sheet->getStyle('E' . $row)->getFont()->getColor()->setARGB(Color::COLOR_WHITE);
                
                $row++;
            }
            
            // Estilos
            $this->applyTableStyles($sheet, 'A3:E' . ($row - 1));
            $this->autoSizeColumns($sheet, 'A', 'E');
            
            // Resumen
            $totalEquipos = array_sum(array_column($detalles, 'cantidad_total'));
            $totalConGuia = array_sum(array_column($detalles, 'cantidad_con_guia'));
            
            $sheet->setCellValue('A' . ($row + 1), 'TOTALES:');
            $sheet->setCellValue('D' . ($row + 1), $totalEquipos);
            $sheet->setCellValue('E' . ($row + 1), $totalConGuia);
            $sheet->getStyle('A' . ($row + 1) . ':E' . ($row + 1))->getFont()->setBold(true);
            $sheet->getStyle('A' . ($row + 1) . ':E' . ($row + 1))->getFill()
                ->setFillType(Fill::FILL_SOLID)
                ->getStartColor()->setARGB('E5E7EB');
            
            $filename = $nombreFiltro 
                ? 'Detalle_' . str_replace(' ', '_', $nombreFiltro)
                : 'Detalle_Por_Grupo';
            
            return $this->downloadSpreadsheet($spreadsheet, $filename);
            
        } catch (\Exception $e) {
            Log::error('Error exportando detalle: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Establecer encabezado principal
     */
    private function setHeader($sheet, $title, $lastColumn)
    {
        $sheet->setCellValue('A1', $title);
        $sheet->mergeCells('A1:' . $lastColumn . '1');
        $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(14);
        $sheet->getStyle('A1')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        $sheet->getStyle('A1')->getFill()
            ->setFillType(Fill::FILL_SOLID)
            ->getStartColor()->setARGB(self::COLOR_HEADER);
        $sheet->getStyle('A1')->getFont()->getColor()->setARGB(Color::COLOR_WHITE);
        $sheet->getRowDimension(1)->setRowHeight(30);
        
        // Fecha
        $sheet->setCellValue('A2', 'Generado: ' . date('Y-m-d H:i:s'));
        $sheet->mergeCells('A2:' . $lastColumn . '2');
        $sheet->getStyle('A2')->getFont()->setItalic(true)->setSize(10);
        $sheet->getStyle('A2')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
    }

    /**
     * Establecer encabezados de columnas
     */
    private function setColumnHeaders($sheet, $row, $headers, $color)
    {
        $col = 'A';
        foreach ($headers as $header) {
            $sheet->setCellValue($col . $row, $header);
            $sheet->getStyle($col . $row)->getFont()->setBold(true)->getColor()->setARGB(Color::COLOR_WHITE);
            $sheet->getStyle($col . $row)->getFill()
                ->setFillType(Fill::FILL_SOLID)
                ->getStartColor()->setARGB($color);
            $sheet->getStyle($col . $row)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $col++;
        }
    }

    /**
     * Aplicar estilos de tabla
     */
    private function applyTableStyles($sheet, $range)
    {
        $sheet->getStyle($range)->getBorders()->getAllBorders()
            ->setBorderStyle(Border::BORDER_THIN)
            ->getColor()->setARGB('D1D5DB');
        
        $sheet->getStyle($range)->getAlignment()->setVertical(Alignment::VERTICAL_CENTER);
    }

    /**
     * Auto ajustar columnas
     */
    private function autoSizeColumns($sheet, $startCol, $endCol)
    {
        for ($col = $startCol; $col <= $endCol; $col++) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }
    }

    /**
     * Descargar spreadsheet
     */
    private function downloadSpreadsheet($spreadsheet, $filename)
    {
        $writer = new Xlsx($spreadsheet);
        $filename = $filename . '_' . date('Y-m-d') . '.xlsx';
        
        // Crear archivo temporal
        $tempFile = tempnam(sys_get_temp_dir(), 'excel');
        $writer->save($tempFile);
        
        // Retornar respuesta con headers correctos
        return response()->download($tempFile, $filename, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            'Cache-Control' => 'max-age=0'
        ])->deleteFileAfterSend(true);
    }
}
