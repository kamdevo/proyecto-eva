<?php
require_once __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

// 1. _ind records
$indCount = DB::table('correctivos_generales_ind')->count();
echo "correctivos_generales_ind: $indCount\n";

// 2. Tickets industriales (misma query del controller)
$ticketCount = DB::table('ordenes as o')
    ->leftJoin('equipos as eo', 'o.equipo_id', '=', 'eo.id')
    ->where(function($q) {
        $q->where('eo.tipo_id', 2)
          ->orWhere('o.subproceso_id', 2);
    })
    ->where(function($q) {
        $q->whereNull('o.equipo_id')
          ->orWhere('o.equipo_id', 0)
          ->orWhereNotNull('eo.id');
    })
    ->count();
echo "Tickets industriales: $ticketCount\n";
echo "Total combinado esperado: " . ($indCount + $ticketCount) . "\n";

// 3. Verificar si algún año está filtrando
$ticketsByYear = DB::table('ordenes as o')
    ->leftJoin('equipos as eo', 'o.equipo_id', '=', 'eo.id')
    ->where(function($q) {
        $q->where('eo.tipo_id', 2)
          ->orWhere('o.subproceso_id', 2);
    })
    ->where(function($q) {
        $q->whereNull('o.equipo_id')
          ->orWhere('o.equipo_id', 0)
          ->orWhereNotNull('eo.id');
    })
    ->select(DB::raw('YEAR(o.fecha_inicio) as anio'), DB::raw('COUNT(*) as total'))
    ->groupBy(DB::raw('YEAR(o.fecha_inicio)'))
    ->orderBy('anio', 'desc')
    ->get();
echo "\nTickets por año:\n";
foreach ($ticketsByYear as $row) {
    echo "  {$row->anio}: {$row->total}\n";
}

// 4. Columnas de ordenes
$cols = DB::select('SHOW COLUMNS FROM ordenes');
$colNames = array_map(function($c) { return $c->Field; }, $cols);
echo "\nColumnas de ordenes: " . implode(', ', $colNames) . "\n";

// 5. Archivos en _ind
$indConArchivo = DB::table('correctivos_generales_ind')
    ->whereNotNull('file')
    ->where('file', '!=', '')
    ->count();
echo "Ind con archivo: $indConArchivo / $indCount\n";

// 6. Sample de archivos ind
$sampleFiles = DB::table('correctivos_generales_ind')
    ->whereNotNull('file')
    ->where('file', '!=', '')
    ->select('id', 'file')
    ->limit(5)
    ->get();
echo "\nSample archivos _ind:\n";
foreach ($sampleFiles as $f) {
    echo "  id={$f->id}: {$f->file}\n";
}

// 7. Simulamos lo que devolvería el endpoint (page 1, per_page 25, sin filtros)
$indRecords = DB::table('correctivos_generales_ind as cgi')
    ->leftJoin('equipos as ei', 'cgi.equipo_id', '=', 'ei.id')
    ->select('cgi.id', DB::raw("COALESCE(cgi.created_at, cgi.fecha_mantenimiento) as created_at"), DB::raw("'ind' as fuente_tabla"))
    ->orderBy(DB::raw("COALESCE(cgi.created_at, cgi.fecha_mantenimiento)"), 'desc')
    ->get();

$ticketRecords = DB::table('ordenes as o')
    ->leftJoin('equipos as eo', 'o.equipo_id', '=', 'eo.id')
    ->select('o.id', DB::raw("CAST(o.fecha_inicio AS DATETIME) as created_at"), DB::raw("'ticket' as fuente_tabla"))
    ->where(function($q) {
        $q->where('eo.tipo_id', 2)
          ->orWhere('o.subproceso_id', 2);
    })
    ->where(function($q) {
        $q->whereNull('o.equipo_id')
          ->orWhere('o.equipo_id', 0)
          ->orWhereNotNull('eo.id');
    })
    ->get();

$combined = collect($indRecords)->concat($ticketRecords)->sortByDesc('created_at')->values();
echo "\nSimulación endpoint:\n";
echo "  Ind records: " . count($indRecords) . "\n";
echo "  Ticket records: " . count($ticketRecords) . "\n";
echo "  Combined total: " . $combined->count() . "\n";
echo "  Page 1 (25 items):\n";
$page1 = $combined->slice(0, 25);
$indInPage = $page1->where('fuente_tabla', 'ind')->count();
$ticketInPage = $page1->where('fuente_tabla', 'ticket')->count();
echo "    _ind: $indInPage, tickets: $ticketInPage\n";
echo "  First 5 items:\n";
foreach ($page1->take(5) as $item) {
    echo "    id={$item->id} fuente={$item->fuente_tabla} fecha={$item->created_at}\n";
}
