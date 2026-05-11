<?php
require 'vendor/autoload.php';
$app = require 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$equipoId = 1;

// Get current state
$original = DB::table('equipos')->where('id', $equipoId)->first();
echo "=== ESTADO ORIGINAL ===" . PHP_EOL;
echo "garantia: '{$original->garantia}'" . PHP_EOL;
echo "propietario_id: {$original->propietario_id}" . PHP_EOL;
echo "calibracion: '{$original->calibracion}'" . PHP_EOL;
echo "repuesto_pendiente: '{$original->repuesto_pendiente}'" . PHP_EOL;
echo "movilidad: '{$original->movilidad}'" . PHP_EOL;
echo "evaluacion_desempenio: '{$original->evaluacion_desempenio}'" . PHP_EOL;
echo "periodicidad: '{$original->periodicidad}'" . PHP_EOL;
echo "vida_util: '{$original->vida_util}'" . PHP_EOL;
echo "costo: '{$original->costo}'" . PHP_EOL;
echo "observacion: '" . substr($original->observacion ?? '', 0, 50) . "'" . PHP_EOL;
echo "propiedad: '{$original->propiedad}'" . PHP_EOL;
echo "localizacion_actual: '{$original->localizacion_actual}'" . PHP_EOL;
echo "activo_comodato: '{$original->activo_comodato}'" . PHP_EOL;
echo "accesorios: '" . substr($original->accesorios ?? '', 0, 50) . "'" . PHP_EOL;
echo "v1: '{$original->v1}', v2: '{$original->v2}', v3: '{$original->v3}'" . PHP_EOL;
echo "fecha_fabricacion: '{$original->fecha_fabricacion}'" . PHP_EOL;
echo "fecha_instalacion: '{$original->fecha_instalacion}'" . PHP_EOL;
echo "fecha_vencimiento_garantia: '{$original->fecha_vencimiento_garantia}'" . PHP_EOL;
echo "fecha_acta_recibo: '{$original->fecha_acta_recibo}'" . PHP_EOL;
echo "fecha_inicio_operacion: '{$original->fecha_inicio_operacion}'" . PHP_EOL;
echo "fecha_recepcion_almacen: '{$original->fecha_recepcion_almacen}'" . PHP_EOL;
echo "codigo_antiguo: '{$original->codigo_antiguo}'" . PHP_EOL;
echo "estadoequipo_id: {$original->estadoequipo_id}" . PHP_EOL;
echo "fuente_id: {$original->fuente_id}" . PHP_EOL;
echo "tecnologia_id: {$original->tecnologia_id}" . PHP_EOL;
echo "frecuencia_id: {$original->frecuencia_id}" . PHP_EOL;
echo "cbiomedica_id: {$original->cbiomedica_id}" . PHP_EOL;
echo "criesgo_id: {$original->criesgo_id}" . PHP_EOL;
echo "tadquisicion_id: {$original->tadquisicion_id}" . PHP_EOL;
echo "tipo_id: {$original->tipo_id}" . PHP_EOL;
echo "" . PHP_EOL;

// Check what exists in related tables
echo "=== VERIFICANDO FKs ===" . PHP_EOL;
$areaOk = DB::table('areas')->where('id', $original->area_id)->exists();
$propietarioOk = DB::table('propietarios')->where('id', $original->propietario_id)->exists();
echo "area_id={$original->area_id} existe: " . ($areaOk ? 'SI' : 'NO') . PHP_EOL;
echo "propietario_id={$original->propietario_id} existe: " . ($propietarioOk ? 'SI' : 'NO') . PHP_EOL;

// Find valid propietario
$propietario = DB::table('propietarios')->first();
echo "Propietario disponible: id={$propietario->id}, nombre={$propietario->nombre}" . PHP_EOL;

// Find valid area
$area = DB::table('areas')->first();
echo "Area disponible: id={$area->id}, name={$area->name}" . PHP_EOL;

// Check if 'garantia' field in DB stores string value
echo "" . PHP_EOL;
echo "=== COMPROBANDO CAMPO GARANTIA ===" . PHP_EOL;
$periodos = DB::table('periodos_garantias')->get();
foreach ($periodos as $p) {
    echo "  id={$p->id}, name={$p->name}" . PHP_EOL;
}
echo "garantia actual en DB: '{$original->garantia}'" . PHP_EOL;
echo "(La garantia debe guardarse como el NAME del periodo, ej: '12 meses')" . PHP_EOL;

echo "" . PHP_EOL;
echo "=== SIMULANDO UPDATE (via Eloquent) ===" . PHP_EOL;

// Simulate what the frontend sends and the controller processes
$testData = [
    'name'                     => $original->name,
    'code'                     => $original->code,
    'marca'                    => $original->marca,
    'modelo'                   => $original->modelo,
    'serial'                   => $original->serial,
    'descripcion'              => $original->descripcion ?? 'TEST DESCRIPCION ' . date('H:i:s'),
    'servicio_id'              => $original->servicio_id,
    'area_id'                  => $original->area_id > 0 ? $original->area_id : $area->id,
    'propietario_id'           => $original->propietario_id > 0 ? $original->propietario_id : $propietario->id,
    'fuente_id'                => $original->fuente_id > 0 ? $original->fuente_id : null,
    'tecnologia_id'            => $original->tecnologia_id > 0 ? $original->tecnologia_id : null,
    'frecuencia_id'            => $original->frecuencia_id > 0 ? $original->frecuencia_id : null,
    'cbiomedica_id'            => $original->cbiomedica_id > 0 ? $original->cbiomedica_id : null,
    'criesgo_id'               => $original->criesgo_id > 0 ? $original->criesgo_id : null,
    'tadquisicion_id'          => $original->tadquisicion_id > 0 ? $original->tadquisicion_id : null,
    'estadoequipo_id'          => $original->estadoequipo_id > 0 ? $original->estadoequipo_id : null,
    'tipo_id'                  => $original->tipo_id > 0 ? $original->tipo_id : null,
    'garantia'                 => '12 meses',   // TEST: string from periodos_garantias
    'calibracion'              => '1',           // TEST: boolean as string
    'repuesto_pendiente'       => '1',           // TEST
    'movilidad'                => 'MOVIL',       // TEST: changed value
    'evaluacion_desempenio'    => 'BUENO',       // TEST: changed value
    'periodicidad'             => 'SEMESTRAL',   // TEST: changed value
    'vida_util'                => 15,            // TEST: changed value
    'costo'                    => '9999999',     // TEST: changed value
    'observacion'              => 'TEST OBSERVACION ' . date('H:i:s'),
    'propiedad'                => 'ARRENDADO',   // TEST: changed value
    'localizacion_actual'      => 'PISO 3 TEST', // TEST
    'activo_comodato'          => 'SI',          // TEST
    'v1'                       => '110V',        // TEST
    'v2'                       => '220V',        // TEST
    'v3'                       => '380V',        // TEST
    'fecha_fabricacion'        => '2010-01-15',  // TEST
    'fecha_instalacion'        => '2011-07-07',
    'fecha_vencimiento_garantia' => '2025-12-31', // TEST
    'fecha_acta_recibo'        => '2011-06-30',  // TEST
    'fecha_inicio_operacion'   => '2011-08-01',  // TEST
    'fecha_recepcion_almacen'  => '2011-06-25',  // TEST
    'codigo_antiguo'           => 'COD-TEST-001', // TEST
    'accesorios'               => 'ACCESORIO 1, ACCESORIO 2', // TEST
];

try {
    $equipo = App\Models\Equipo::findOrFail($equipoId);
    $equipo->update($testData);
    echo "UPDATE ejecutado OK" . PHP_EOL;

    // Verify each field was saved
    $updated = DB::table('equipos')->where('id', $equipoId)->first();
    echo "" . PHP_EOL;
    echo "=== VERIFICACION POST-UPDATE ===" . PHP_EOL;
    $fields = [
        'garantia'                  => '12 meses',
        'calibracion'               => '1',
        'repuesto_pendiente'        => '1',
        'movilidad'                 => 'MOVIL',
        'evaluacion_desempenio'     => 'BUENO',
        'periodicidad'              => 'SEMESTRAL',
        'vida_util'                 => '15',
        'costo'                     => '9999999',
        'propiedad'                 => 'ARRENDADO',
        'localizacion_actual'       => 'PISO 3 TEST',
        'activo_comodato'           => 'SI',
        'v1'                        => '110V',
        'v2'                        => '220V',
        'v3'                        => '380V',
        'fecha_fabricacion'         => '2010-01-15',
        'fecha_vencimiento_garantia'=> '2025-12-31',
        'fecha_acta_recibo'         => '2011-06-30',
        'fecha_inicio_operacion'    => '2011-08-01',
        'fecha_recepcion_almacen'   => '2011-06-25',
        'codigo_antiguo'            => 'COD-TEST-001',
    ];

    $ok = 0; $fail = 0;
    foreach ($fields as $field => $expected) {
        $actual = (string)($updated->$field ?? '');
        $passed = ($actual === $expected);
        $icon = $passed ? 'OK' : 'FAIL';
        echo "  [{$icon}] {$field}: expected='{$expected}' actual='{$actual}'" . PHP_EOL;
        if ($passed) $ok++; else $fail++;
    }

    // Check observacion contains the timestamp
    $obsOk = str_contains($updated->observacion ?? '', 'TEST OBSERVACION');
    echo "  [" . ($obsOk ? 'OK' : 'FAIL') . "] observacion: '" . substr($updated->observacion ?? '', 0, 40) . "'" . PHP_EOL;

    echo "" . PHP_EOL;
    echo "RESULTADO: {$ok} OK, {$fail} FAIL" . PHP_EOL;

    // Restore original values
    echo "" . PHP_EOL;
    echo "=== RESTAURANDO VALORES ORIGINALES ===" . PHP_EOL;
    DB::table('equipos')->where('id', $equipoId)->update([
        'garantia'                  => $original->garantia,
        'calibracion'               => $original->calibracion,
        'repuesto_pendiente'        => $original->repuesto_pendiente,
        'movilidad'                 => $original->movilidad,
        'evaluacion_desempenio'     => $original->evaluacion_desempenio,
        'periodicidad'              => $original->periodicidad,
        'vida_util'                 => $original->vida_util,
        'costo'                     => $original->costo,
        'observacion'               => $original->observacion,
        'propiedad'                 => $original->propiedad,
        'localizacion_actual'       => $original->localizacion_actual,
        'activo_comodato'           => $original->activo_comodato,
        'v1'                        => $original->v1,
        'v2'                        => $original->v2,
        'v3'                        => $original->v3,
        'fecha_fabricacion'         => $original->fecha_fabricacion,
        'fecha_vencimiento_garantia'=> $original->fecha_vencimiento_garantia,
        'fecha_acta_recibo'         => $original->fecha_acta_recibo,
        'fecha_inicio_operacion'    => $original->fecha_inicio_operacion,
        'fecha_recepcion_almacen'   => $original->fecha_recepcion_almacen,
        'codigo_antiguo'            => $original->codigo_antiguo,
        'accesorios'                => $original->accesorios,
        'descripcion'               => $original->descripcion,
    ]);
    echo "Valores restaurados OK" . PHP_EOL;

} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage() . PHP_EOL;
    echo "File: " . $e->getFile() . " Line: " . $e->getLine() . PHP_EOL;
}
