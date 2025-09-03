<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Maatwebsite\Excel\Facades\Excel;

echo "=== GENERANDO EXCEL DIRECTO CON FORMATO ===\n\n";

try {
    // Get calibrations data directly
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
        ->limit(50)
        ->get();

    echo "Registros encontrados: " . $calibraciones->count() . "\n";

    // Prepare data array
    $data = [];
    $data[] = [
        'Codigo calibracion', 'Fecha de ejecucion', 'Marca', 'Codigo', 
        'Serie', 'Nombre equipo', 'Id equipo', 'Archivo', 'Ubicación'
    ];

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

    // Create Excel with formatting
    $filename = 'calibraciones_formateado_' . date('Y-m-d_H-i-s') . '.xlsx';
    
    Excel::store(new class($data) implements 
        \Maatwebsite\Excel\Concerns\FromArray,
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

        public function styles(\PhpOffice\PhpSpreadsheet\Worksheet\Worksheet $sheet)
        {
            // Header row styling
            $sheet->getStyle('A1:I1')->applyFromArray([
                'font' => [
                    'bold' => true,
                    'color' => ['rgb' => 'FFFFFF'],
                    'size' => 12
                ],
                'fill' => [
                    'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                    'startColor' => ['rgb' => '4472C4']
                ],
                'alignment' => [
                    'horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER,
                    'vertical' => \PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_CENTER
                ]
            ]);

            // Data rows styling with borders
            $lastRow = count($this->data);
            $sheet->getStyle('A1:I' . $lastRow)->applyFromArray([
                'borders' => [
                    'allBorders' => [
                        'borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN,
                        'color' => ['rgb' => '000000']
                    ]
                ]
            ]);

            // Alternate row colors
            for ($row = 2; $row <= $lastRow; $row++) {
                if ($row % 2 == 0) {
                    $sheet->getStyle('A' . $row . ':I' . $row)->applyFromArray([
                        'fill' => [
                            'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                            'startColor' => ['rgb' => 'F8F9FA']
                        ]
                    ]);
                }
            }

            return [];
        }

        public function columnWidths(): array
        {
            return [
                'A' => 15, // Codigo calibracion
                'B' => 18, // Fecha de ejecucion
                'C' => 15, // Marca
                'D' => 12, // Codigo
                'E' => 20, // Serie
                'F' => 35, // Nombre equipo
                'G' => 10, // Id equipo
                'H' => 15, // Archivo
                'I' => 25, // Ubicación
            ];
        }

        public function title(): string
        {
            return 'Calibraciones';
        }
    }, $filename);

    echo "✅ Excel formateado generado: $filename\n";
    echo "✅ Tamaño: " . filesize($filename) . " bytes\n";
    
    // Verify file exists and is valid
    if (file_exists($filename)) {
        $fileHeader = substr(file_get_contents($filename), 0, 4);
        if ($fileHeader === "PK\x03\x04") {
            echo "✅ Archivo Excel válido generado\n";
        }
    }

} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "Archivo: " . $e->getFile() . ":" . $e->getLine() . "\n";
}

echo "\n=== GENERACIÓN COMPLETADA ===\n";
