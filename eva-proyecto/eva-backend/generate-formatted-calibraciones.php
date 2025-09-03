<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Maatwebsite\Excel\Facades\Excel;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Alignment;

echo "=== GENERANDO EXCEL FORMATEADO CALIBRACIONES ===\n\n";

try {
    // Get calibrations data
    $calibraciones = DB::table('calibracion')
        ->leftJoin('equipos', 'calibracion.equipo_id', '=', 'equipos.id')
        ->leftJoin('areas', 'equipos.area_id', '=', 'areas.id')
        ->select([
            'calibracion.id as codigo_calibracion',
            'calibracion.fecha_calibracion',
            'equipos.marca',
            'equipos.code as codigo_equipo',
            'equipos.serial',
            'equipos.name as nombre_equipo',
            'calibracion.equipo_id',
            'calibracion.file as archivo',
            'areas.name as ubicacion'
        ])
        ->orderBy('calibracion.fecha_calibracion', 'desc')
        ->limit(100)
        ->get();

    echo "Registros encontrados: " . $calibraciones->count() . "\n";

    // Prepare data
    $data = [];
    foreach ($calibraciones as $cal) {
        $data[] = [
            $cal->codigo_calibracion ?? '',
            $cal->fecha_calibracion ?? '',
            $cal->marca ?? '',
            $cal->codigo_equipo ?? '',
            $cal->serial ?? '',
            $cal->nombre_equipo ?? '',
            $cal->equipo_id ?? '',
            $cal->archivo ?? '',
            $cal->ubicacion ?? ''
        ];
    }

    $filename = 'calibraciones_formateado_' . date('Y-m-d_H-i-s') . '.xlsx';
    
    // Create Excel with professional formatting
    Excel::store(new class($data) implements 
        \Maatwebsite\Excel\Concerns\FromArray,
        \Maatwebsite\Excel\Concerns\WithHeadings,
        \Maatwebsite\Excel\Concerns\WithStyles,
        \Maatwebsite\Excel\Concerns\WithColumnWidths,
        \Maatwebsite\Excel\Concerns\WithTitle
    {
        private $data;

        public function __construct($data) {
            $this->data = $data;
        }

        public function array(): array {
            return $this->data;
        }

        public function headings(): array {
            return [
                'Código Calibración',
                'Fecha de Ejecución', 
                'Marca',
                'Código',
                'Serie',
                'Nombre Equipo',
                'ID Equipo',
                'Archivo',
                'Ubicación'
            ];
        }

        public function styles(\PhpOffice\PhpSpreadsheet\Worksheet\Worksheet $sheet)
        {
            $lastRow = count($this->data) + 1; // +1 for header
            
            // Header styling - Blue background with white text
            $sheet->getStyle('A1:I1')->applyFromArray([
                'font' => [
                    'bold' => true,
                    'color' => ['rgb' => 'FFFFFF'],
                    'size' => 11,
                    'name' => 'Calibri'
                ],
                'fill' => [
                    'fillType' => Fill::FILL_SOLID,
                    'startColor' => ['rgb' => '4472C4']
                ],
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_CENTER,
                    'vertical' => Alignment::VERTICAL_CENTER
                ],
                'borders' => [
                    'allBorders' => [
                        'borderStyle' => Border::BORDER_THIN,
                        'color' => ['rgb' => '000000']
                    ]
                ]
            ]);

            // Data rows - All borders
            $sheet->getStyle('A1:I' . $lastRow)->applyFromArray([
                'borders' => [
                    'allBorders' => [
                        'borderStyle' => Border::BORDER_THIN,
                        'color' => ['rgb' => '000000']
                    ]
                ],
                'font' => [
                    'size' => 10,
                    'name' => 'Calibri'
                ]
            ]);

            // Alternate row colors (zebra striping)
            for ($row = 2; $row <= $lastRow; $row++) {
                if ($row % 2 == 0) {
                    $sheet->getStyle('A' . $row . ':I' . $row)->applyFromArray([
                        'fill' => [
                            'fillType' => Fill::FILL_SOLID,
                            'startColor' => ['rgb' => 'F8F9FA']
                        ]
                    ]);
                }
            }

            // Center align specific columns
            $sheet->getStyle('A2:A' . $lastRow)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle('B2:B' . $lastRow)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle('G2:G' . $lastRow)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

            // Set row height for header
            $sheet->getRowDimension(1)->setRowHeight(25);
            
            // Auto-fit other rows
            for ($row = 2; $row <= $lastRow; $row++) {
                $sheet->getRowDimension($row)->setRowHeight(-1);
            }

            return [];
        }

        public function columnWidths(): array
        {
            return [
                'A' => 18, // Código Calibración
                'B' => 20, // Fecha de Ejecución
                'C' => 18, // Marca
                'D' => 15, // Código
                'E' => 25, // Serie
                'F' => 40, // Nombre Equipo
                'G' => 12, // ID Equipo
                'H' => 20, // Archivo
                'I' => 30, // Ubicación
            ];
        }

        public function title(): string
        {
            return 'Calibraciones';
        }
    }, $filename);

    if (file_exists($filename)) {
        echo "✅ Excel formateado generado exitosamente: $filename\n";
        echo "✅ Tamaño del archivo: " . number_format(filesize($filename)) . " bytes\n";
        
        // Verify Excel format
        $fileHeader = substr(file_get_contents($filename), 0, 4);
        if ($fileHeader === "PK\x03\x04") {
            echo "✅ Formato Excel válido (ZIP signature)\n";
        }
        
        echo "\n📊 CARACTERÍSTICAS DEL FORMATO:\n";
        echo "- Encabezados con fondo azul (#4472C4) y texto blanco\n";
        echo "- Bordes negros en todas las celdas\n";
        echo "- Filas alternadas con fondo gris claro (#F8F9FA)\n";
        echo "- Columnas ajustadas automáticamente\n";
        echo "- Fuente Calibri profesional\n";
        echo "- Alineación centrada en columnas clave\n";
        
    } else {
        echo "❌ Error: No se pudo generar el archivo\n";
    }

} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "Línea: " . $e->getLine() . " en " . $e->getFile() . "\n";
}

echo "\n=== PROCESO COMPLETADO ===\n";
