<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== DEBUGGING EXPORT 500 ERROR ===\n\n";

try {
    echo "1. Testing database connection...\n";
    $count = DB::table('calibracion')->count();
    echo "✅ Database connected. Calibraciones count: $count\n\n";
    
    echo "2. Testing query with joins...\n";
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
        ->limit(5)
        ->get();
        
    echo "✅ Query executed. Records found: " . $calibraciones->count() . "\n\n";
    
    echo "3. Testing data preparation...\n";
    $data = [];
    $headers = [
        'Codigo calibracion', 'Fecha de ejecucion', 'Marca', 'Codigo', 
        'Serie', 'Nombre equipo', 'Id equipo', 'Archivo', 'Ubicación'
    ];
    $data[] = $headers;
    
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
    echo "✅ Data prepared. Total rows: " . count($data) . "\n\n";
    
    echo "4. Testing Excel export base class...\n";
    
    // Create a simple test export
    $testExport = new class($data) implements 
        \Maatwebsite\Excel\Concerns\FromArray,
        \Maatwebsite\Excel\Concerns\WithHeadings,
        \Maatwebsite\Excel\Concerns\WithStyles
    {
        private $data;

        public function __construct($data) {
            $this->data = $data;
        }

        public function array(): array {
            return array_slice($this->data, 1); // Skip headers
        }

        public function headings(): array {
            return $this->data[0]; // First row as headers
        }

        public function styles(\PhpOffice\PhpSpreadsheet\Worksheet\Worksheet $sheet)
        {
            return [
                1 => ['font' => ['bold' => true]]
            ];
        }
    };
    
    echo "✅ Export class created\n";
    
    echo "5. Testing Excel generation...\n";
    $filename = 'test_export_debug_' . date('Y-m-d_H-i-s') . '.xlsx';
    
    \Maatwebsite\Excel\Facades\Excel::store($testExport, $filename);
    
    if (file_exists($filename)) {
        echo "✅ Excel file generated: $filename\n";
        echo "✅ File size: " . filesize($filename) . " bytes\n";
    } else {
        echo "❌ Excel file not generated\n";
    }
    
} catch (\Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . ":" . $e->getLine() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}

echo "\n=== DEBUG COMPLETED ===\n";
