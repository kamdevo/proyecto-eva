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
     * Exportar plantilla de mantenimiento
     */
    public function exportPlantillaMantenimiento(Request $request)
    {
        $validation = $this->validateExportRequest($request, [
            'año' => 'required|integer|min:2020|max:2030',
            'mes' => 'nullable|integer|min:1|max:12',
            'servicio_id' => 'nullable|exists:servicios,id',
            'formato' => 'required|in:pdf,excel'
        ]);

        if ($validation) {
            return $validation;
        }

        try {
            $query = Mantenimiento::with(['equipo.servicio', 'equipo.area', 'tecnico'])
                ->whereYear('fecha_programada', $request->año);

            if ($request->mes) {
                $query->whereMonth('fecha_programada', $request->mes);
            }

            if ($request->servicio_id) {
                $query->whereHas('equipo', function ($q) use ($request) {
                    $q->where('servicio_id', $request->servicio_id);
                });
            }

            $mantenimientos = $query->orderBy('fecha_programada')->get();

            $data = $this->preparePlantillaData($mantenimientos);
            $titulo = 'Plantilla de Mantenimiento ' . $request->año;
            if ($request->mes) {
                $titulo .= ' - ' . Carbon::create($request->año, $request->mes, 1)->format('F');
            }
            $filename = 'plantilla_mantenimiento_' . $request->año;

            return $this->executeExport($data, $titulo, $request->formato, $filename);

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al exportar plantilla: ' . $e->getMessage(), 500);
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
}
