<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== SIMPLE EXPORT TEST ===\n\n";

try {
    // Get data directly from database
    $calibraciones = \DB::table('calibracion')
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
        ->limit(10)
        ->get();

    echo "Records found: " . $calibraciones->count() . "\n";

    // Prepare simple data array
    $data = [];
    $data[] = ['Codigo calibracion', 'Fecha de ejecucion', 'Marca', 'Codigo', 'Serie', 'Nombre equipo', 'Id equipo', 'Archivo', 'Ubicación'];

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

    // Create simple Excel export
    $filename = 'simple_calibraciones_' . date('Y-m-d_H-i-s') . '.xlsx';
    
    \Maatwebsite\Excel\Facades\Excel::store(new class($data) implements \Maatwebsite\Excel\Concerns\FromArray {
        private $data;
        public function __construct($data) { $this->data = $data; }
        public function array(): array { return $this->data; }
    }, $filename);

    if (file_exists($filename)) {
        echo "✅ Simple Excel file created: $filename\n";
        echo "✅ File size: " . number_format(filesize($filename)) . " bytes\n";
        
        // Test if we can create a download response
        $response = \Maatwebsite\Excel\Facades\Excel::download(new class($data) implements \Maatwebsite\Excel\Concerns\FromArray {
            private $data;
            public function __construct($data) { $this->data = $data; }
            public function array(): array { return $this->data; }
        }, 'calibracionesEB.xlsx');
        
        echo "✅ Download response created: " . get_class($response) . "\n";
        
    } else {
        echo "❌ File not created\n";
    }

} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . ":" . $e->getLine() . "\n";
}

echo "\n=== SIMPLE TEST COMPLETED ===\n";
