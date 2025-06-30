<?php

namespace App\Services\Export;

use App\ConexionesVista\ResponseFormatter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Maatwebsite\Excel\Facades\Excel;
use Carbon\Carbon;

/**
 * Clase base abstracta para servicios de exportación
 * Proporciona funcionalidades comunes para PDF, Excel y CSV
 */
abstract class ExportServiceBase
{
    /**
     * Exportar datos a Excel
     */
    protected function exportToExcel($data, ?string $filename = null): \Symfony\Component\HttpFoundation\BinaryFileResponse
    {
        $filename = $filename ?: ('export_' . now()->format('Y-m-d_H-i-s') . '.xlsx');

        return Excel::download(new class($data) implements \Maatwebsite\Excel\Concerns\FromCollection {
            private $data;

            public function __construct($data) {
                $this->data = $data;
            }

            public function collection() {
                return collect($this->data);
            }
        }, $filename);
    }

    /**
     * Exportar datos a CSV
     */
    protected function exportToCSV($data, $filename)
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
     * Exportar datos a PDF
     */
    protected function exportToPDF($data, $titulo)
    {
        $html = $this->generateHTMLTable($data, $titulo);

        return ResponseFormatter::success([
            'html_content' => $html,
            'titulo' => $titulo,
            'formato' => 'pdf',
            'total_registros' => count($data) - 1 // -1 por el header
        ], 'Datos preparados para exportación PDF');
    }

    /**
     * Generar tabla HTML para PDF
     */
    protected function generateHTMLTable($data, $titulo)
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
     * Validar request común para exportación
     */
    protected function validateExportRequest(Request $request, array $rules)
    {
        $validator = Validator::make($request->all(), $rules);

        if ($validator->fails()) {
            return ResponseFormatter::validation($validator->errors());
        }

        return null;
    }

    /**
     * Ejecutar exportación según formato
     */
    protected function executeExport($data, $titulo, $formato, $filename)
    {
        switch ($formato) {
            case 'pdf':
                return $this->exportToPDF($data, $titulo);
            case 'excel':
                return $this->exportToExcel($data, $filename);
            case 'csv':
                return $this->exportToCSV($data, $filename);
            default:
                return ResponseFormatter::error('Formato no soportado', 400);
        }
    }

    /**
     * Formatear fecha para mostrar
     */
    protected function formatDate($date, $format = 'd/m/Y')
    {
        return $date ? Carbon::parse($date)->format($format) : '';
    }

    /**
     * Formatear fecha y hora para mostrar
     */
    protected function formatDateTime($date, $format = 'd/m/Y H:i')
    {
        return $date ? Carbon::parse($date)->format($format) : '';
    }
}
