<?php

namespace App\Services\Export\Reports;

use App\Services\Export\ExportServiceBase;
use App\ConexionesVista\ResponseFormatter;
use Illuminate\Http\Request;
use Carbon\Carbon;

/**
 * Servicio especializado para reportes de calibraciones
 * Maneja exportación de reportes de calibraciones
 */
class CalibracionesReportService extends ExportServiceBase
{
    /**
     * Exportar reporte de calibraciones
     */
    public function exportCalibraciones(Request $request)
    {
        $validation = $this->validateExportRequest($request, [
            'año' => 'required|integer|min:2020|max:2030',
            'mes' => 'nullable|integer|min:1|max:12',
            'estado' => 'nullable|in:programada,completada,vencida',
            'formato' => 'required|in:pdf,excel,csv'
        ]);

        if ($validation) {
            return $validation;
        }

        try {
            $query = \App\Models\Calibracion::with([
                'equipo:id,name,code,servicio_id,area_id',
                'equipo.servicio:id,name',
                'equipo.area:id,name',
                'tecnico:id,nombre,apellido'
            ])->whereYear('fecha_programada', $request->año);

            if ($request->mes) {
                $query->whereMonth('fecha_programada', $request->mes);
            }

            if ($request->estado) {
                $query->where('estado', $request->estado);
            }

            $calibraciones = $query->orderBy('fecha_programada')->get();

            $data = $this->prepareCalibracionesData($calibraciones);
            $titulo = 'Reporte de Calibraciones ' . $request->año;
            if ($request->mes) {
                $titulo .= ' - ' . Carbon::create($request->año, $request->mes, 1)->format('F');
            }
            $filename = 'reporte_calibraciones';

            return $this->executeExport($data, $titulo, $request->formato, $filename);

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al exportar calibraciones: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Preparar datos de calibraciones
     */
    private function prepareCalibracionesData($calibraciones)
    {
        $data = [];
        $headers = [
            'Fecha Programada', 'Equipo', 'Código', 'Servicio', 'Área',
            'Técnico', 'Estado', 'Resultado', 'Certificado', 'Próxima Calibración'
        ];
        $data[] = $headers;

        foreach ($calibraciones as $calibracion) {
            $data[] = [
                $this->formatDate($calibracion->fecha_programada),
                $calibracion->equipo->name ?? '',
                $calibracion->equipo->code ?? '',
                $calibracion->equipo->servicio->name ?? '',
                $calibracion->equipo->area->name ?? '',
                $calibracion->tecnico ? $calibracion->tecnico->nombre . ' ' . $calibracion->tecnico->apellido : '',
                $calibracion->estado,
                $calibracion->resultado ?? '',
                $calibracion->certificado ? 'Sí' : 'No',
                $this->formatDate($calibracion->proxima_calibracion)
            ];
        }

        return $data;
    }
}
