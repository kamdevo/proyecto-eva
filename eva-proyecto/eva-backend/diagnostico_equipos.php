<?php
// Script de diagnóstico para equipos biomédicos en EVA
// Ejecutar con: php diagnostico_equipos.php

use Illuminate\Database\Capsule\Manager as DB;

require __DIR__ . '/vendor/autoload.php';

// Configuración rápida de Eloquent (si no está en Laravel)
$capsule = new DB;
$capsule->addConnection([
    'driver'    => 'mysql',
    'host'      => getenv('DB_HOST') ?: '127.0.0.1',
    'database'  => getenv('DB_DATABASE') ?: 'eva',
    'username'  => getenv('DB_USERNAME') ?: 'root',
    'password'  => getenv('DB_PASSWORD') ?: '',
    'charset'   => 'utf8',
    'collation' => 'utf8_unicode_ci',
    'prefix'    => '',
]);
$capsule->setAsGlobal();
$capsule->bootEloquent();

// Diagnóstico principal
function diagnosticoEquipos() {
    echo "\n==== DIAGNÓSTICO DE EQUIPOS BIOMÉDICOS ====";
    $total = DB::table('equipos')->count();
    $activos = DB::table('equipos')->where('status', 1)->count();
    $tipoMedico = DB::table('equipos')->where('tipo_id', 1)->count();
    $tipoIndustrial = DB::table('equipos')->where('tipo_id', 2)->count();
    $sinServicio = DB::table('equipos')->whereNull('servicio_id')->orWhere('servicio_id', 0)->count();
    $sinArea = DB::table('equipos')->whereNull('area_id')->orWhere('area_id', 0)->count();
    $sinInvima = DB::table('equipos')->whereNull('invima_id')->orWhere('invima_id', 0)->count();
    $sinPropietario = DB::table('equipos')->whereNull('propietario_id')->orWhere('propietario_id', 0)->count();

    echo "\nTotal equipos: $total";
    echo "\nActivos (status=1): $activos";
    echo "\nTipo médico (tipo_id=1): $tipoMedico";
    echo "\nTipo industrial (tipo_id=2): $tipoIndustrial";
    echo "\nEquipos sin servicio: $sinServicio";
    echo "\nEquipos sin área: $sinArea";
    echo "\nEquipos sin invima: $sinInvima";
    echo "\nEquipos sin propietario: $sinPropietario";

    // Muestra 3 equipos ejemplo
    $ejemplo = DB::table('equipos')->limit(3)->get();
    echo "\n\nEjemplo de equipos:\n";
    foreach ($ejemplo as $eq) {
        echo "ID: $eq->id | Nombre: $eq->name | Status: $eq->status | Tipo: $eq->tipo_id\n";
    }

    echo "\n==== FIN DIAGNÓSTICO ====";
}

diagnosticoEquipos();
