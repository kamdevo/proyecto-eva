<?php

namespace App\Services\Export\Reports;

use App\Services\Export\ExportServiceBase;
use App\ConexionesVista\ResponseFormatter;
use App\Models\Contingencia;
use Illuminate\Http\Request;
use Carbon\Carbon;

/**
 * Servicio especializado para reportes de contingencias
 * Maneja exportación de reportes de contingencias
 */
class ContingenciasReportService extends ExportServiceBase
{
    /**
     * Exportar reporte de contingencias
     */
    public function exportContingencias(Request $request)
    {
        $validation = $this->validateExportRequest($request, [
            'fecha_desde' => 'required|date',
            'fecha_hasta' => 'required|date|after_or_equal:fecha_desde',
            'estado' => 'nullable|in:Activa,En Proceso,Resuelta',
            'severidad' => 'nullable|in:Baja,Media,Alta,Crítica',
            'formato' => 'required|in:pdf,excel,csv'
        ]);

        if ($validation) {
            return $validation;
        }

        try {
            $query = Contingencia::with(['equipo.servicio', 'equipo.area', 'usuarioReporta'])
                ->whereBetween('fecha', [$request->fecha_desde, $request->fecha_hasta]);

            if ($request->estado) {
                $query->where('estado', $request->estado);
            }

            if ($request->severidad) {
                $query->where('severidad', $request->severidad);
            }

            $contingencias = $query->orderBy('fecha', 'desc')->get();

            $data = $this->prepareContingenciasData($contingencias);
            $titulo = 'Reporte de Contingencias ' . $request->fecha_desde . ' a ' . $request->fecha_hasta;
            $filename = 'reporte_contingencias';

            return $this->executeExport($data, $titulo, $request->formato, $filename);

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al exportar contingencias: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Preparar datos de contingencias
     */
    private function prepareContingenciasData($contingencias)
    {
        $data = [];
        $headers = [
            'Fecha', 'Equipo', 'Código', 'Descripción', 'Severidad',
            'Estado', 'Reportado Por', 'Servicio', 'Área', 'Acciones Tomadas'
        ];
        $data[] = $headers;

        foreach ($contingencias as $contingencia) {
            $data[] = [
                $this->formatDate($contingencia->fecha),
                $contingencia->equipo->nombre ?? '',
                $contingencia->equipo->codigo ?? '',
                $contingencia->descripcion,
                $contingencia->severidad,
                $contingencia->estado,
                $contingencia->usuarioReporta ? $contingencia->usuarioReporta->nombre . ' ' . $contingencia->usuarioReporta->apellidos : '',
                $contingencia->equipo->servicio->nombre ?? '',
                $contingencia->equipo->area->nombre ?? '',
                $contingencia->acciones_tomadas ?? ''
            ];
        }

        return $data;
    }
}
