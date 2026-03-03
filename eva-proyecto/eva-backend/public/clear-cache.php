<?php
/**
 * ELIMINAR DESPUÉS DE USAR
 * Acceder: http://api.eva2.huv.gov.co/clear-cache.php?key=HUV2026
 */
if (!isset($_GET['key']) || $_GET['key'] !== 'HUV2026') {
    http_response_code(403); die('Acceso denegado');
}

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);

$results = [];

$kernel->call('config:clear');
$results['config:clear'] = $kernel->output();

$kernel->call('cache:clear');
$results['cache:clear'] = $kernel->output();

$kernel->call('config:cache');
$results['config:cache'] = $kernel->output();

// Mostrar config de mail actual
$results['mail_config'] = [
    'MAIL_MAILER'   => env('MAIL_MAILER'),
    'MAIL_HOST'     => env('MAIL_HOST'),
    'MAIL_PORT'     => env('MAIL_PORT'),
    'MAIL_USERNAME' => env('MAIL_USERNAME'),
    'MAIL_FROM'     => env('MAIL_FROM_ADDRESS'),
    'MAIL_ENCRYPTION' => env('MAIL_ENCRYPTION'),
    'MAIL_PASSWORD_SET' => !empty(env('MAIL_PASSWORD')),
];

header('Content-Type: application/json');
echo json_encode($results, JSON_PRETTY_PRINT);
