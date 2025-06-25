<?php

namespace App\Services\Export\Reports;

use App\Services\Export\ExportServiceBase;
use App\ConexionesVista\ResponseFormatter;
use App\Interactions\DatabaseInteraction;
use App\Models\Equipo;
use Illuminate\Http\Request;
use Carbon\Carbon;

/**
 * Servicio especializado para reportes de equipos
 * Maneja exportación de equipos consolidados y críticos
 */
class EquiposReportService extends ExportServiceBase
{
    /**
     * Exportar equipos consolidado
     */
    public function exportEquiposConsolidado(Request $request)
    {
        $validation = $this->validateExportRequest($request, [
            'equipos_ids' => 'required|array',
            'equipos_ids.*' => 'exists:equipos,id',
            'formato' => 'required|in:pdf,excel,csv',
            'incluir' => 'required|array',
            'incluir.detalles_equipo' => 'boolean',
            'incluir.cronograma' => 'boolean',
            'incluir.cumplimiento' => 'boolean',
            'incluir.responsables' => 'boolean',
            'incluir.estadisticas' => 'boolean'
        ]);

        if ($validation) {
            return $validation;
        }

        try {
            $equipos = Equipo::with([
                'servicio',
                'area',
                'propietario',
                'usuarioResponsable',
                'mantenimientos' => function ($query) {
                    $query->whereYear('fecha_programada', date('Y'));
                }
            ])->whereIn('id', $request->equipos_ids)->get();

            $data = $this->prepareConsolidatedData($equipos, $request->incluir);
            $titulo = 'Reporte Consolidado de Equipos';
            $filename = 'reporte_consolidado_equipos';

            return $this->executeExport($data, $titulo, $request->formato, $filename);

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al exportar: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Exportar equipos críticos
     */
    public function exportEquiposCriticos(Request $request)
    {
        $validation = $this->validateExportRequest($request, [
            'formato' => 'required|in:pdf,excel,csv'
        ]);

        if ($validation) {
            return $validation;
        }

        try {
            $equiposCriticos = DatabaseInteraction::getCriticalEquipments();

            if ($equiposCriticos->getData()->status !== 'success') {
                return $equiposCriticos;
            }

            $data = $this->prepareEquiposCriticosData($equiposCriticos->getData()->data);
            $titulo = 'Reporte de Equipos Críticos';
            $filename = 'equipos_criticos';

            return $this->executeExport($data, $titulo, $request->formato, $filename);

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al exportar equipos críticos: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Preparar datos consolidados
     */
    private function prepareConsolidatedData($equipos, $incluir)
    {
        $data = [];
        $headers = ['ID', 'Código', 'Nombre'];

        if ($incluir['detalles_equipo']) {
            $headers = array_merge($headers, ['Marca', 'Modelo', 'Serie', 'Estado', 'Riesgo']);
        }

        $headers = array_merge($headers, ['Servicio', 'Área']);

        if ($incluir['responsables']) {
            $headers[] = 'Responsable';
        }

        if ($incluir['cronograma']) {
            $headers = array_merge($headers, ['Último Mantenimiento', 'Próximo Mantenimiento']);
        }

        if ($incluir['cumplimiento']) {
            $headers = array_merge($headers, ['Mantenimientos Programados', 'Mantenimientos Ejecutados', '% Cumplimiento']);
        }

        $data[] = $headers;

        foreach ($equipos as $equipo) {
            $row = [$equipo->id, $equipo->codigo, $equipo->nombre];

            if ($incluir['detalles_equipo']) {
                $row = array_merge($row, [
                    $equipo->marca,
                    $equipo->modelo,
                    $equipo->serie,
                    $equipo->estado,
                    $equipo->riesgo
                ]);
            }

            $row = array_merge($row, [
                $equipo->servicio->nombre ?? '',
                $equipo->area->nombre ?? ''
            ]);

            if ($incluir['responsables']) {
                $responsable = $equipo->usuarioResponsable
                    ? $equipo->usuarioResponsable->nombre . ' ' . $equipo->usuarioResponsable->apellidos
                    : '';
                $row[] = $responsable;
            }

            if ($incluir['cronograma']) {
                $row = array_merge($row, [
                    $this->formatDate($equipo->ultimo_mantenimiento),
                    $this->formatDate($equipo->proximo_mantenimiento)
                ]);
            }

            if ($incluir['cumplimiento']) {
                $programados = $equipo->mantenimientos->count();
                $ejecutados = $equipo->mantenimientos->where('status', 'completado')->count();
                $cumplimiento = $programados > 0 ? round(($ejecutados / $programados) * 100, 2) : 0;

                $row = array_merge($row, [$programados, $ejecutados, $cumplimiento . '%']);
            }

            $data[] = $row;
        }

        return $data;
    }

    /**
     * Preparar datos de equipos críticos
     */
    private function prepareEquiposCriticosData($equipos)
    {
        $data = [];
        $headers = [
            'Código', 'Nombre', 'Marca', 'Modelo', 'Riesgo', 'Estado',
            'Servicio', 'Área', 'Nivel Criticidad', 'Último Mantenimiento',
            'Próximo Mantenimiento', 'Contingencias Activas'
        ];
        $data[] = $headers;

        foreach ($equipos as $equipo) {
            $data[] = [
                $equipo->codigo,
                $equipo->nombre,
                $equipo->marca ?? '',
                $equipo->modelo ?? '',
                $equipo->riesgo,
                $equipo->estado,
                $equipo->servicio->nombre ?? '',
                $equipo->area->nombre ?? '',
                $equipo->nivel_criticidad,
                $this->formatDate($equipo->ultimo_mantenimiento),
                $this->formatDate($equipo->proximo_mantenimiento),
                $equipo->contingencias->count()
            ];
        }

        return $data;
    }
}
