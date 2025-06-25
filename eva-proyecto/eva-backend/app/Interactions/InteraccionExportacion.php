<?php

namespace App\Interactions;

use App\Models\Equipo;
use App\Models\Mantenimiento;
use App\Models\Calibracion;
use App\Models\Contingencia;
use App\ConexionesVista\ResponseFormatter;
use App\Events\Export\DataExported;
use Illuminate\Support\Facades\Storage;
use Maatwebsite\Excel\Facades\Excel;
use Carbon\Carbon;

/**
 * Clase de interacción para exportaciones avanzadas
 * Maneja operaciones complejas de exportación de datos
 */
class InteraccionExportacion
{
    /**
     * Exportar equipos seleccionados
     */
    public static function exportarEquiposSeleccionados($equiposIds, $formato = 'excel')
    {
        try {
            $equipos = Equipo::with(['servicio', 'area', 'marca', 'modelo', 'estadoEquipo'])
                ->whereIn('id', $equiposIds)
                ->get();

            if ($equipos->isEmpty()) {
                return ResponseFormatter::error('No se encontraron equipos para exportar', 400);
            }

            $datos = $equipos->map(function($equipo) {
                return [
                    'ID' => $equipo->id,
                    'Código' => $equipo->code,
                    'Nombre' => $equipo->name,
                    'Marca' => $equipo->marca?->name,
                    'Modelo' => $equipo->modelo?->name,
                    'Serie' => $equipo->serie,
                    'Servicio' => $equipo->servicio?->name,
                    'Área' => $equipo->area?->name,
                    'Estado' => $equipo->estadoEquipo?->name,
                    'Fecha Adquisición' => $equipo->fecha_adquisicion,
                    'Valor' => $equipo->valor,
                    'Ubicación' => $equipo->ubicacion,
                    'Observaciones' => $equipo->observaciones,
                    'Último Mantenimiento' => $equipo->ultimo_mantenimiento,
                    'Próximo Mantenimiento' => $equipo->proximo_mantenimiento,
                    'Última Calibración' => $equipo->ultima_calibracion,
                    'Próxima Calibración' => $equipo->proxima_calibracion
                ];
            });

            $nombreArchivo = 'equipos_seleccionados_' . now()->format('Y-m-d_H-i-s');

            if ($formato === 'excel') {
                return self::exportarAExcel($datos, $nombreArchivo);
            } else {
                return self::exportarAPDF($datos, $nombreArchivo, 'Equipos Seleccionados');
            }

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al exportar equipos: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Exportar reporte completo de mantenimientos
     */
    public static function exportarReporteMantenimientos($filtros = [], $formato = 'excel')
    {
        try {
            $query = Mantenimiento::with(['equipo.servicio', 'equipo.area', 'tecnico']);

            // Aplicar filtros
            if (isset($filtros['fecha_inicio'])) {
                $query->where('fecha_programada', '>=', $filtros['fecha_inicio']);
            }
            if (isset($filtros['fecha_fin'])) {
                $query->where('fecha_programada', '<=', $filtros['fecha_fin']);
            }
            if (isset($filtros['servicio_id'])) {
                $query->whereHas('equipo', function($q) use ($filtros) {
                    $q->where('servicio_id', $filtros['servicio_id']);
                });
            }
            if (isset($filtros['estado'])) {
                $query->where('status', $filtros['estado']);
            }

            $mantenimientos = $query->orderBy('fecha_programada', 'desc')->get();

            $datos = $mantenimientos->map(function($mantenimiento) {
                return [
                    'ID' => $mantenimiento->id,
                    'Equipo' => $mantenimiento->equipo?->name,
                    'Código Equipo' => $mantenimiento->equipo?->code,
                    'Servicio' => $mantenimiento->equipo?->servicio?->name,
                    'Área' => $mantenimiento->equipo?->area?->name,
                    'Tipo Mantenimiento' => $mantenimiento->tipo_mantenimiento,
                    'Fecha Programada' => $mantenimiento->fecha_programada,
                    'Fecha Realizada' => $mantenimiento->fecha_realizada,
                    'Estado' => $mantenimiento->status,
                    'Técnico' => $mantenimiento->tecnico?->getFullNameAttribute(),
                    'Descripción' => $mantenimiento->description,
                    'Observaciones' => $mantenimiento->observacion,
                    'Costo' => $mantenimiento->costo ?? 0,
                    'Duración (horas)' => $mantenimiento->duracion_horas
                ];
            });

            $nombreArchivo = 'reporte_mantenimientos_' . now()->format('Y-m-d_H-i-s');

            if ($formato === 'excel') {
                return self::exportarAExcel($datos, $nombreArchivo);
            } else {
                return self::exportarAPDF($datos, $nombreArchivo, 'Reporte de Mantenimientos');
            }

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al exportar reporte: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Exportar dashboard completo
     */
    public static function exportarDashboardCompleto($formato = 'excel')
    {
        try {
            // Obtener estadísticas generales
            $estadisticas = [
                'equipos_total' => Equipo::count(),
                'equipos_activos' => Equipo::where('status', true)->count(),
                'equipos_criticos' => Equipo::where('es_critico', true)->count(),
                'mantenimientos_pendientes' => Mantenimiento::where('status', 'programado')->count(),
                'mantenimientos_vencidos' => Mantenimiento::where('fecha_programada', '<', now())
                    ->where('status', 'programado')->count(),
                'calibraciones_pendientes' => Calibracion::where('estado', 'programada')->count(),
                'calibraciones_vencidas' => Calibracion::where('fecha_vencimiento', '<', now())
                    ->where('estado', 'completada')->count(),
                'contingencias_activas' => Contingencia::where('estado', 'Activa')->count(),
                'contingencias_criticas' => Contingencia::where('estado', 'Activa')
                    ->where('severidad', 'Crítica')->count()
            ];

            // Obtener datos por servicio
            $datosPorServicio = \App\Models\Servicio::with(['equipos', 'areas'])
                ->get()
                ->map(function($servicio) {
                    return [
                        'Servicio' => $servicio->name,
                        'Total Equipos' => $servicio->equipos->count(),
                        'Equipos Activos' => $servicio->equipos->where('status', true)->count(),
                        'Equipos Críticos' => $servicio->equipos->where('es_critico', true)->count(),
                        'Áreas' => $servicio->areas->count(),
                        'Mantenimientos Pendientes' => $servicio->equipos->sum(function($equipo) {
                            return $equipo->mantenimientos()->where('status', 'programado')->count();
                        }),
                        'Contingencias Activas' => $servicio->equipos->sum(function($equipo) {
                            return $equipo->contingencias()->where('estado', 'Activa')->count();
                        })
                    ];
                });

            if ($formato === 'excel') {
                return self::exportarDashboardAExcel($estadisticas, $datosPorServicio);
            } else {
                return self::exportarDashboardAPDF($estadisticas, $datosPorServicio);
            }

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al exportar dashboard: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Exportar a Excel
     */
    public static function exportarAExcel($datos, $nombreArchivo)
    {
        try {
            $nombreCompleto = $nombreArchivo . '.xlsx';
            $rutaArchivo = 'exports/' . $nombreCompleto;

            // Crear archivo Excel
            Excel::store(new class($datos) implements \Maatwebsite\Excel\Concerns\FromCollection, 
                \Maatwebsite\Excel\Concerns\WithHeadings, \Maatwebsite\Excel\Concerns\WithStyles {
                
                private $datos;

                public function __construct($datos) {
                    $this->datos = $datos;
                }

                public function collection() {
                    return collect($this->datos);
                }

                public function headings(): array {
                    return $this->datos->isNotEmpty() ? array_keys($this->datos->first()) : [];
                }

                public function styles(\PhpOffice\PhpSpreadsheet\Worksheet\Worksheet $sheet) {
                    return [
                        1 => ['font' => ['bold' => true]],
                    ];
                }
            }, $rutaArchivo, 'public');

            // Disparar evento de exportación
            event(new DataExported(
                'excel_export',
                'excel',
                $datos->count(),
                Storage::disk('public')->size($rutaArchivo),
                ['file_path' => $rutaArchivo],
                auth()->user()
            ));

            return ResponseFormatter::success([
                'archivo' => $nombreCompleto,
                'url' => Storage::url($rutaArchivo),
                'registros' => $datos->count(),
                'tamaño' => self::formatearTamaño(Storage::disk('public')->size($rutaArchivo))
            ], 'Archivo Excel generado exitosamente');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al generar Excel: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Exportar a PDF
     */
    public static function exportarAPDF($datos, $nombreArchivo, $titulo = 'Reporte')
    {
        try {
            $nombreCompleto = $nombreArchivo . '.pdf';
            $rutaArchivo = 'exports/' . $nombreCompleto;

            // Generar HTML para PDF
            $html = self::generarHTMLParaPDF($datos, $titulo);

            // Crear PDF usando DomPDF o similar
            $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadHTML($html);
            $pdf->setPaper('A4', 'landscape');

            // Guardar archivo
            Storage::disk('public')->put($rutaArchivo, $pdf->output());

            // Disparar evento de exportación
            event(new DataExported(
                'pdf_export',
                'pdf',
                $datos->count(),
                Storage::disk('public')->size($rutaArchivo),
                ['file_path' => $rutaArchivo],
                auth()->user()
            ));

            return ResponseFormatter::success([
                'archivo' => $nombreCompleto,
                'url' => Storage::url($rutaArchivo),
                'registros' => $datos->count(),
                'tamaño' => self::formatearTamaño(Storage::disk('public')->size($rutaArchivo))
            ], 'Archivo PDF generado exitosamente');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al generar PDF: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Exportar dashboard a Excel con múltiples hojas
     */
    private static function exportarDashboardAExcel($estadisticas, $datosPorServicio)
    {
        try {
            $nombreArchivo = 'dashboard_completo_' . now()->format('Y-m-d_H-i-s') . '.xlsx';
            $rutaArchivo = 'exports/' . $nombreArchivo;

            Excel::store(new class($estadisticas, $datosPorServicio) implements 
                \Maatwebsite\Excel\Concerns\WithMultipleSheets {
                
                private $estadisticas;
                private $datosPorServicio;

                public function __construct($estadisticas, $datosPorServicio) {
                    $this->estadisticas = $estadisticas;
                    $this->datosPorServicio = $datosPorServicio;
                }

                public function sheets(): array {
                    return [
                        'Estadísticas Generales' => new class($this->estadisticas) implements 
                            \Maatwebsite\Excel\Concerns\FromArray {
                            private $estadisticas;
                            public function __construct($estadisticas) { $this->estadisticas = $estadisticas; }
                            public function array(): array {
                                return [
                                    array_keys($this->estadisticas),
                                    array_values($this->estadisticas)
                                ];
                            }
                        },
                        'Datos por Servicio' => new class($this->datosPorServicio) implements 
                            \Maatwebsite\Excel\Concerns\FromCollection,
                            \Maatwebsite\Excel\Concerns\WithHeadings {
                            private $datos;
                            public function __construct($datos) { $this->datos = $datos; }
                            public function collection() { return collect($this->datos); }
                            public function headings(): array {
                                return $this->datos->isNotEmpty() ? array_keys($this->datos->first()) : [];
                            }
                        }
                    ];
                }
            }, $rutaArchivo, 'public');

            return ResponseFormatter::success([
                'archivo' => $nombreArchivo,
                'url' => Storage::url($rutaArchivo),
                'tamaño' => self::formatearTamaño(Storage::disk('public')->size($rutaArchivo))
            ], 'Dashboard exportado exitosamente');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al exportar dashboard: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Generar HTML para PDF
     */
    private static function generarHTMLParaPDF($datos, $titulo)
    {
        $html = "
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; font-size: 10px; }
                h1 { text-align: center; color: #333; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #ddd; padding: 5px; text-align: left; }
                th { background-color: #f2f2f2; font-weight: bold; }
                .footer { text-align: center; margin-top: 20px; font-size: 8px; }
            </style>
        </head>
        <body>
            <h1>{$titulo}</h1>
            <p>Generado el: " . now()->format('d/m/Y H:i:s') . "</p>
            <table>";

        if ($datos->isNotEmpty()) {
            // Encabezados
            $html .= "<tr>";
            foreach (array_keys($datos->first()) as $header) {
                $html .= "<th>{$header}</th>";
            }
            $html .= "</tr>";

            // Datos
            foreach ($datos as $fila) {
                $html .= "<tr>";
                foreach ($fila as $valor) {
                    $html .= "<td>{$valor}</td>";
                }
                $html .= "</tr>";
            }
        }

        $html .= "
            </table>
            <div class='footer'>
                <p>Sistema EVA - Gestión de Equipos Médicos</p>
                <p>Total de registros: " . $datos->count() . "</p>
            </div>
        </body>
        </html>";

        return $html;
    }

    /**
     * Formatear tamaño de archivo
     */
    private static function formatearTamaño($bytes)
    {
        $units = ['B', 'KB', 'MB', 'GB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        
        $bytes /= pow(1024, $pow);
        
        return round($bytes, 2) . ' ' . $units[$pow];
    }
}
