<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\ConexionesVista\ApiController;
use App\ConexionesVista\ResponseFormatter;
use App\Interactions\DatabaseInteraction;
use App\Models\Equipo;
use App\Models\Mantenimiento;
use App\Models\Contingencia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class ExportController extends ApiController
{
    /**
     * Exportar equipos consolidado
     */
    public function exportEquiposConsolidado(Request $request)
    {
        $validator = Validator::make($request->all(), [
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

        if ($validator->fails()) {
            return ResponseFormatter::validation($validator->errors());
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

            switch ($request->formato) {
                case 'pdf':
                    return $this->exportToPDF($data, 'Reporte Consolidado de Equipos');
                case 'excel':
                    return $this->exportToExcel($data, 'reporte_consolidado_equipos');
                case 'csv':
                    return $this->exportToCSV($data, 'reporte_consolidado_equipos');
            }

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al exportar: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Exportar plantilla de mantenimiento
     */
    public function exportPlantillaMantenimiento(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'año' => 'required|integer|min:2020|max:2030',
            'mes' => 'nullable|integer|min:1|max:12',
            'servicio_id' => 'nullable|exists:servicios,id',
            'formato' => 'required|in:pdf,excel'
        ]);

        if ($validator->fails()) {
            return ResponseFormatter::validation($validator->errors());
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

            switch ($request->formato) {
                case 'pdf':
                    return $this->exportToPDF($data, $titulo);
                case 'excel':
                    return $this->exportToExcel($data, 'plantilla_mantenimiento_' . $request->año);
            }

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al exportar plantilla: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Exportar reporte de contingencias
     */
    public function exportContingencias(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'fecha_desde' => 'required|date',
            'fecha_hasta' => 'required|date|after_or_equal:fecha_desde',
            'estado' => 'nullable|in:Activa,En Proceso,Resuelta',
            'severidad' => 'nullable|in:Baja,Media,Alta,Crítica',
            'formato' => 'required|in:pdf,excel,csv'
        ]);

        if ($validator->fails()) {
            return ResponseFormatter::validation($validator->errors());
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

            switch ($request->formato) {
                case 'pdf':
                    return $this->exportToPDF($data, $titulo);
                case 'excel':
                    return $this->exportToExcel($data, 'reporte_contingencias');
                case 'csv':
                    return $this->exportToCSV($data, 'reporte_contingencias');
            }

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al exportar contingencias: ' . $e->getMessage(), 500);
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
                    $equipo->ultimo_mantenimiento ? Carbon::parse($equipo->ultimo_mantenimiento)->format('d/m/Y') : '',
                    $equipo->proximo_mantenimiento ? Carbon::parse($equipo->proximo_mantenimiento)->format('d/m/Y') : ''
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
                Carbon::parse($mantenimiento->fecha_programada)->format('d/m/Y'),
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
                Carbon::parse($contingencia->fecha)->format('d/m/Y'),
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

    /**
     * Exportar a PDF
     */
    private function exportToPDF($data, $titulo)
    {
        // Aquí se integraría con una librería como DomPDF o TCPDF
        // Por ahora retornamos los datos preparados para PDF

        $html = $this->generateHTMLTable($data, $titulo);

        return ResponseFormatter::success([
            'html_content' => $html,
            'titulo' => $titulo,
            'formato' => 'pdf',
            'total_registros' => count($data) - 1 // -1 por el header
        ], 'Datos preparados para exportación PDF');
    }

    /**
     * Exportar a Excel
     */
    private function exportToExcel($data, $filename)
    {
        // Aquí se integraría con Laravel Excel
        // Por ahora retornamos los datos preparados para Excel

        return ResponseFormatter::success([
            'data' => $data,
            'filename' => $filename . '_' . date('Y-m-d') . '.xlsx',
            'formato' => 'excel',
            'total_registros' => count($data) - 1
        ], 'Datos preparados para exportación Excel');
    }

    /**
     * Exportar a CSV
     */
    private function exportToCSV($data, $filename)
    {
        $csvContent = '';
        foreach ($data as $row) {
            $csvContent .= implode(',', array_map(function($field) {
                return '"' . str_replace('"', '""', $field) . '"';
            }, $row)) . "\n";
        }

        return response($csvContent)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', 'attachment; filename="' . $filename . '_' . date('Y-m-d') . '.csv"');
    }

    /**
     * Generar tabla HTML para PDF
     */
    private function generateHTMLTable($data, $titulo)
    {
        $html = '<h1>' . $titulo . '</h1>';
        $html .= '<table border="1" cellpadding="5" cellspacing="0" style="width:100%; border-collapse: collapse;">';

        foreach ($data as $index => $row) {
            $html .= '<tr>';
            foreach ($row as $cell) {
                if ($index === 0) {
                    $html .= '<th style="background-color: #f0f0f0; font-weight: bold;">' . htmlspecialchars($cell) . '</th>';
                } else {
                    $html .= '<td>' . htmlspecialchars($cell) . '</td>';
                }
            }
            $html .= '</tr>';
        }

        $html .= '</table>';
        $html .= '<p>Generado el: ' . date('d/m/Y H:i:s') . '</p>';

        return $html;
    }

    /**
     * Exportar estadísticas de cumplimiento
     */
    public function exportEstadisticasCumplimiento(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'año' => 'required|integer|min:2020|max:2030',
            'servicio_id' => 'nullable|exists:servicios,id',
            'formato' => 'required|in:pdf,excel'
        ]);

        if ($validator->fails()) {
            return ResponseFormatter::validation($validator->errors());
        }

        try {
            $resumen = DatabaseInteraction::getMaintenanceComplianceSummary($request->año);

            if ($resumen->getData()->status !== 'success') {
                return $resumen;
            }

            $data = $this->prepareEstadisticasData($resumen->getData()->data);
            $titulo = 'Estadísticas de Cumplimiento ' . $request->año;

            switch ($request->formato) {
                case 'pdf':
                    return $this->exportToPDF($data, $titulo);
                case 'excel':
                    return $this->exportToExcel($data, 'estadisticas_cumplimiento_' . $request->año);
            }

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al exportar estadísticas: ' . $e->getMessage(), 500);
        }
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
     * Generar reporte de equipos críticos
     */
    public function exportEquiposCriticos(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'formato' => 'required|in:pdf,excel,csv'
        ]);

        if ($validator->fails()) {
            return ResponseFormatter::validation($validator->errors());
        }

        try {
            $equiposCriticos = DatabaseInteraction::getCriticalEquipments();

            if ($equiposCriticos->getData()->status !== 'success') {
                return $equiposCriticos;
            }

            $data = $this->prepareEquiposCriticosData($equiposCriticos->getData()->data);
            $titulo = 'Reporte de Equipos Críticos';

            switch ($request->formato) {
                case 'pdf':
                    return $this->exportToPDF($data, $titulo);
                case 'excel':
                    return $this->exportToExcel($data, 'equipos_criticos');
                case 'csv':
                    return $this->exportToCSV($data, 'equipos_criticos');
            }

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al exportar equipos críticos: ' . $e->getMessage(), 500);
        }
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
                $equipo->ultimo_mantenimiento ? Carbon::parse($equipo->ultimo_mantenimiento)->format('d/m/Y') : '',
                $equipo->proximo_mantenimiento ? Carbon::parse($equipo->proximo_mantenimiento)->format('d/m/Y') : '',
                $equipo->contingencias->count()
            ];
        }

        return $data;
    }

    /**
     * Exportar reporte de tickets
     */
    public function exportTickets(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'fecha_desde' => 'required|date',
            'fecha_hasta' => 'required|date|after_or_equal:fecha_desde',
            'estado' => 'nullable|in:abierto,en_proceso,pendiente,resuelto,cerrado',
            'categoria' => 'nullable|string',
            'formato' => 'required|in:pdf,excel,csv'
        ]);

        if ($validator->fails()) {
            return ResponseFormatter::validation($validator->errors());
        }

        try {
            $query = \App\Models\Ticket::with([
                'equipo:id,name,code',
                'usuarioCreador:id,nombre,apellido',
                'usuarioAsignado:id,nombre,apellido'
            ])->whereBetween('fecha_creacion', [$request->fecha_desde, $request->fecha_hasta]);

            if ($request->estado) {
                $query->where('estado', $request->estado);
            }

            if ($request->categoria) {
                $query->where('categoria', $request->categoria);
            }

            $tickets = $query->orderBy('fecha_creacion', 'desc')->get();

            $data = $this->prepareTicketsData($tickets);
            $titulo = 'Reporte de Tickets ' . $request->fecha_desde . ' a ' . $request->fecha_hasta;

            switch ($request->formato) {
                case 'pdf':
                    return $this->exportToPDF($data, $titulo);
                case 'excel':
                    return $this->exportToExcel($data, 'reporte_tickets');
                case 'csv':
                    return $this->exportToCSV($data, 'reporte_tickets');
            }

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al exportar tickets: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Exportar reporte de calibraciones
     */
    public function exportCalibraciones(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'año' => 'required|integer|min:2020|max:2030',
            'mes' => 'nullable|integer|min:1|max:12',
            'estado' => 'nullable|in:programada,completada,vencida',
            'formato' => 'required|in:pdf,excel,csv'
        ]);

        if ($validator->fails()) {
            return ResponseFormatter::validation($validator->errors());
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

            switch ($request->formato) {
                case 'pdf':
                    return $this->exportToPDF($data, $titulo);
                case 'excel':
                    return $this->exportToExcel($data, 'reporte_calibraciones');
                case 'csv':
                    return $this->exportToCSV($data, 'reporte_calibraciones');
            }

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al exportar calibraciones: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Exportar inventario de repuestos
     */
    public function exportInventarioRepuestos(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'categoria' => 'nullable|string',
            'bajo_stock' => 'nullable|boolean',
            'criticos' => 'nullable|boolean',
            'formato' => 'required|in:pdf,excel,csv'
        ]);

        if ($validator->fails()) {
            return ResponseFormatter::validation($validator->errors());
        }

        try {
            $query = \App\Models\Repuesto::with([
                'equipo:id,name,code',
                'proveedor:id,nombre'
            ])->where('estado', 'activo');

            if ($request->categoria) {
                $query->where('categoria', $request->categoria);
            }

            if ($request->bajo_stock) {
                $query->whereRaw('stock_actual <= stock_minimo');
            }

            if ($request->criticos) {
                $query->where('critico', true);
            }

            $repuestos = $query->orderBy('nombre')->get();

            $data = $this->prepareRepuestosData($repuestos);
            $titulo = 'Inventario de Repuestos';

            switch ($request->formato) {
                case 'pdf':
                    return $this->exportToPDF($data, $titulo);
                case 'excel':
                    return $this->exportToExcel($data, 'inventario_repuestos');
                case 'csv':
                    return $this->exportToCSV($data, 'inventario_repuestos');
            }

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al exportar inventario: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Preparar datos de tickets
     */
    private function prepareTicketsData($tickets)
    {
        $data = [];
        $headers = [
            'Número Ticket', 'Título', 'Categoría', 'Prioridad', 'Estado',
            'Equipo', 'Creado Por', 'Asignado A', 'Fecha Creación', 'Fecha Cierre'
        ];
        $data[] = $headers;

        foreach ($tickets as $ticket) {
            $data[] = [
                $ticket->numero_ticket,
                $ticket->titulo,
                $ticket->categoria,
                $ticket->prioridad,
                $ticket->estado,
                $ticket->equipo ? $ticket->equipo->name : 'N/A',
                $ticket->usuarioCreador ? $ticket->usuarioCreador->nombre . ' ' . $ticket->usuarioCreador->apellido : '',
                $ticket->usuarioAsignado ? $ticket->usuarioAsignado->nombre . ' ' . $ticket->usuarioAsignado->apellido : '',
                Carbon::parse($ticket->fecha_creacion)->format('d/m/Y H:i'),
                $ticket->fecha_cierre ? Carbon::parse($ticket->fecha_cierre)->format('d/m/Y H:i') : ''
            ];
        }

        return $data;
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
                Carbon::parse($calibracion->fecha_programada)->format('d/m/Y'),
                $calibracion->equipo->name ?? '',
                $calibracion->equipo->code ?? '',
                $calibracion->equipo->servicio->name ?? '',
                $calibracion->equipo->area->name ?? '',
                $calibracion->tecnico ? $calibracion->tecnico->nombre . ' ' . $calibracion->tecnico->apellido : '',
                $calibracion->estado,
                $calibracion->resultado ?? '',
                $calibracion->certificado ? 'Sí' : 'No',
                $calibracion->proxima_calibracion ? Carbon::parse($calibracion->proxima_calibracion)->format('d/m/Y') : ''
            ];
        }

        return $data;
    }

    /**
     * Preparar datos de repuestos
     */
    private function prepareRepuestosData($repuestos)
    {
        $data = [];
        $headers = [
            'Código', 'Nombre', 'Categoría', 'Stock Actual', 'Stock Mínimo',
            'Stock Máximo', 'Precio Unitario', 'Valor Total', 'Ubicación',
            'Proveedor', 'Crítico', 'Estado Stock'
        ];
        $data[] = $headers;

        foreach ($repuestos as $repuesto) {
            $valorTotal = $repuesto->stock_actual * $repuesto->precio_unitario;
            $estadoStock = $repuesto->stock_actual <= 0 ? 'Agotado' :
                          ($repuesto->stock_actual <= $repuesto->stock_minimo ? 'Bajo' : 'Normal');

            $data[] = [
                $repuesto->codigo,
                $repuesto->nombre,
                $repuesto->categoria,
                $repuesto->stock_actual,
                $repuesto->stock_minimo,
                $repuesto->stock_maximo ?? '',
                '$' . number_format($repuesto->precio_unitario, 2),
                '$' . number_format($valorTotal, 2),
                $repuesto->ubicacion ?? '',
                $repuesto->proveedor->nombre ?? '',
                $repuesto->critico ? 'Sí' : 'No',
                $estadoStock
            ];
        }

        return $data;
    }
}
