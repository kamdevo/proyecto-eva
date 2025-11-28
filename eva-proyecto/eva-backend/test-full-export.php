<?php
require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

ini_set('memory_limit', '2048M');
set_time_limit(600);

echo "========== TEST DE EXPORTACIÓN EXCEL COMPLETA ==========\n\n";

try {
    echo "1. Obteniendo datos de correctivos generales...\n";
    $queryGenerales = DB::table('correctivos_generales as cg')
        ->leftJoin('equipos as e', 'cg.equipo_id', '=', 'e.id')
        ->leftJoin('servicios as s', 'e.servicio_id', '=', 's.id')
        ->leftJoin('sedes as sede', 's.sede_id', '=', 'sede.id')
        ->leftJoin('estadoequipos as ee', 'e.estadoequipo_id', '=', 'ee.id')
        ->select([
            'cg.id',
            'cg.created_at',
            DB::raw("cg.created_at as fecha_inicio"),
            DB::raw("NULL as retro_cierre"),
            DB::raw("COALESCE(sede.name, 'N/A') as sede_nombre"),
            DB::raw("'Correctivo General' as tipo"),
            DB::raw("'' as responsable_nombre"),
            'e.name as equipo_name',
            'e.code as equipo_code', 
            'e.marca',
            'e.modelo',
            'e.serial',
            's.name as servicio_nombre',
            DB::raw("COALESCE(ee.name, 'N/A') as estado_actual"),
            'cg.fecha_mantenimiento as fecha_cierre',
            DB::raw("NULL as fecha_fin"),
            DB::raw("COALESCE(cg.description, cg.orden) as descripcion"),
            DB::raw("NULL as tecnico_cierre_text")
        ])
        ->where('e.tipo_id', 1)
        ->orderBy('cg.created_at', 'desc')
        ->get();
    echo "   ✅ Correctivos generales: " . $queryGenerales->count() . " registros\n";

    echo "2. Obteniendo datos de tickets/ordenes...\n";
    $queryTickets = DB::table('ordenes as o')
        ->leftJoin('equipos as e', 'o.equipo_id', '=', 'e.id')
        ->leftJoin('servicios as s', 'o.servicio_id', '=', 's.id')
        ->leftJoin('sedes as sede', 's.sede_id', '=', 'sede.id')
        ->leftJoin('usuarios as u', 'o.asignado_id', '=', 'u.id')
        ->leftJoin('estadoequipos as ee', 'e.estadoequipo_id', '=', 'ee.id')
        ->select([
            'o.id',
            DB::raw("CAST(o.fecha_inicio AS DATETIME) as created_at"),
            'o.fecha_inicio',
            'o.retro_cierre',
            DB::raw("COALESCE(sede.name, 'N/A') as sede_nombre"),
            DB::raw("'Ticket/Orden' as tipo"),
            DB::raw("CONCAT(COALESCE(u.nombre, ''), ' ', COALESCE(u.apellido, '')) as responsable_nombre"),
            DB::raw("COALESCE(e.name, o.nombre_equipo) as equipo_name"),
            DB::raw("COALESCE(e.code, o.codigo_equipo) as equipo_code"), 
            DB::raw("COALESCE(e.marca, o.marca_equipo) as marca"),
            DB::raw("COALESCE(e.modelo, o.modelo_equipo) as modelo"),
            DB::raw("COALESCE(e.serial, o.serie_equipo) as serial"),
            's.name as servicio_nombre',
            DB::raw("COALESCE(ee.name, 'N/A') as estado_actual"),
            'o.fecha_fin as fecha_cierre',
            'o.fecha_fin',
            'o.descripcion as descripcion',
            'o.tecnico_cierre_text'
        ])
        ->where(function($query) {
            $query->where('e.tipo_id', 1)
                  ->orWhere('o.subproceso_id', 1);
        })
        ->orderBy('o.fecha_inicio', 'desc')
        ->get();
    echo "   ✅ Tickets/Ordenes: " . $queryTickets->count() . " registros\n";

    echo "3. Combinando datos...\n";
    $correctivos = $queryGenerales->concat($queryTickets)->sortByDesc('created_at');
    echo "   ✅ Total combinado: " . $correctivos->count() . " registros\n";
    echo "   Memoria usada: " . round(memory_get_usage() / 1024 / 1024, 2) . " MB\n";

    echo "4. Creando spreadsheet...\n";
    $spreadsheet = new Spreadsheet();
    $sheet = $spreadsheet->getActiveSheet();
    $sheet->setTitle('Parada de Equipo');
    echo "   ✅ Spreadsheet creado\n";

    echo "5. Configurando headers...\n";
    $headers = [
        'FECHA DE CREACIÓN',
        'CODIFICACIÓN DE CIERRE',
        'SEDE',
        'TIPO',
        'RESPONSABLE DE MANTENIMIENTO',
        'ID',
        'NOMBRE',
        'CÓDIGO',
        'MARCA',
        'MODELO',
        'SERIE',
        'SERVICIO',
        'ESTADO DEL EQUIPO',
        'CIERRE',
        'FECHA FIN',
        'DESCRIPCIÓN',
        'DESCRIPCIÓN DE CIERRE DEL TICKET'
    ];

    $col = 'A';
    foreach ($headers as $header) {
        $sheet->setCellValue($col . '4', $header);
        $col++;
    }
    echo "   ✅ Headers configurados (17 columnas: A-Q)\n";

    echo "6. Llenando datos (esto puede tomar tiempo)...\n";
    $row = 5;
    $count = 0;
    foreach ($correctivos as $correctivo) {
        // FECHA DE CREACIÓN
        $fechaCreacion = $correctivo->fecha_inicio ?? $correctivo->created_at ?? '';
        if ($fechaCreacion) {
            $fechaCreacion = date('Y-m-d H:i:s', strtotime($fechaCreacion));
        }
        $sheet->setCellValue('A' . $row, $fechaCreacion);
        
        // CODIFICACIÓN DE CIERRE
        $sheet->setCellValue('B' . $row, $correctivo->retro_cierre ?? '');
        
        // SEDE
        $sheet->setCellValue('C' . $row, $correctivo->sede_nombre ?? '');
        
        // TIPO
        $sheet->setCellValue('D' . $row, $correctivo->tipo ?? '');
        
        // RESPONSABLE
        $sheet->setCellValue('E' . $row, trim($correctivo->responsable_nombre ?? ''));
        
        // ID
        $sheet->setCellValue('F' . $row, $correctivo->id ?? '');
        
        // NOMBRE
        $sheet->setCellValue('G' . $row, $correctivo->equipo_name ?? '');
        
        // CÓDIGO
        $sheet->setCellValue('H' . $row, $correctivo->equipo_code ?? '');
        
        // MARCA
        $sheet->setCellValue('I' . $row, $correctivo->marca ?? '');
        
        // MODELO
        $sheet->setCellValue('J' . $row, $correctivo->modelo ?? '');
        
        // SERIE
        $sheet->setCellValue('K' . $row, $correctivo->serial ?? '');
        
        // SERVICIO
        $sheet->setCellValue('L' . $row, $correctivo->servicio_nombre ?? '');
        
        // ESTADO
        $sheet->setCellValue('M' . $row, $correctivo->estado_actual ?? 'N/A');
        
        // CIERRE
        $fechaCierre = $correctivo->fecha_cierre ?? '';
        if ($fechaCierre) {
            $fechaCierre = date('Y-m-d H:i:s', strtotime($fechaCierre));
        }
        $sheet->setCellValue('N' . $row, $fechaCierre);
        
        // FECHA FIN
        $fechaFin = $correctivo->fecha_fin ?? '';
        if ($fechaFin) {
            $fechaFin = date('Y-m-d H:i:s', strtotime($fechaFin));
        }
        $sheet->setCellValue('O' . $row, $fechaFin);
        
        // DESCRIPCIÓN
        $sheet->setCellValue('P' . $row, $correctivo->descripcion ?? '');
        
        // DESCRIPCIÓN DE CIERRE
        $sheet->setCellValue('Q' . $row, $correctivo->tecnico_cierre_text ?? '');
        
        $row++;
        $count++;
        
        if ($count % 1000 === 0) {
            echo "   Procesados: $count registros - Memoria: " . round(memory_get_usage() / 1024 / 1024, 2) . " MB\n";
        }
    }
    echo "   ✅ Datos llenados: $count registros\n";
    echo "   Memoria usada: " . round(memory_get_usage() / 1024 / 1024, 2) . " MB\n";

    echo "7. Guardando archivo...\n";
    $filename = 'test_export_' . date('Y-m-d_H-i-s') . '.xlsx';
    $writer = new Xlsx($spreadsheet);
    $writer->save($filename);
    echo "   ✅ Archivo guardado: $filename\n";
    
    // Limpiar
    $spreadsheet->disconnectWorksheets();
    unset($spreadsheet);
    
    echo "\n✅ EXPORTACIÓN COMPLETADA EXITOSAMENTE\n";
    echo "Memoria final: " . round(memory_get_usage() / 1024 / 1024, 2) . " MB\n";
    echo "Memoria pico: " . round(memory_get_peak_usage() / 1024 / 1024, 2) . " MB\n";

} catch (\Exception $e) {
    echo "\n❌ ERROR: " . $e->getMessage() . "\n";
    echo "Línea: " . $e->getLine() . "\n";
    echo "Archivo: " . $e->getFile() . "\n";
}
