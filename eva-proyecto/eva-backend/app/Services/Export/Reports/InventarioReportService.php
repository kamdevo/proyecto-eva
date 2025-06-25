<?php

namespace App\Services\Export\Reports;

use App\Services\Export\ExportServiceBase;
use App\ConexionesVista\ResponseFormatter;
use Illuminate\Http\Request;
use Carbon\Carbon;

/**
 * Servicio especializado para reportes de inventario
 * Maneja exportación de repuestos y tickets
 */
class InventarioReportService extends ExportServiceBase
{
    /**
     * Exportar inventario de repuestos
     */
    public function exportInventarioRepuestos(Request $request)
    {
        $validation = $this->validateExportRequest($request, [
            'categoria' => 'nullable|string',
            'bajo_stock' => 'nullable|boolean',
            'criticos' => 'nullable|boolean',
            'formato' => 'required|in:pdf,excel,csv'
        ]);

        if ($validation) {
            return $validation;
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
            $filename = 'inventario_repuestos';

            return $this->executeExport($data, $titulo, $request->formato, $filename);

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al exportar inventario: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Exportar reporte de tickets
     */
    public function exportTickets(Request $request)
    {
        $validation = $this->validateExportRequest($request, [
            'fecha_desde' => 'required|date',
            'fecha_hasta' => 'required|date|after_or_equal:fecha_desde',
            'estado' => 'nullable|in:abierto,en_proceso,pendiente,resuelto,cerrado',
            'categoria' => 'nullable|string',
            'formato' => 'required|in:pdf,excel,csv'
        ]);

        if ($validation) {
            return $validation;
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
            $filename = 'reporte_tickets';

            return $this->executeExport($data, $titulo, $request->formato, $filename);

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al exportar tickets: ' . $e->getMessage(), 500);
        }
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
                $this->formatDateTime($ticket->fecha_creacion),
                $this->formatDateTime($ticket->fecha_cierre)
            ];
        }

        return $data;
    }
}
