<?php
$data = [
    'nombre' => 'Felipe',
    'apellido' => 'Muriel',
    'telefono' => '3123456789',
    'email' => 'electromedicinacorreohuv@gmail.com',
    'username' => 'felipe.muriel',
    'password' => '123456',
    'password_confirmation' => '123456',
    'centro_id' => '1'
];
$options = [
    'http' => [
        'header'  => "Content-type: application/json\r\nAccept: application/json\r\n",
        'method'  => 'POST',
        'content' => json_encode($data),
        'ignore_errors' => true
    ]
];
$context  = stream_context_create($options);

// API endpoint URL
$url = 'http://api.eva2.huv.gov.co/api/auth/register';

$result = file_get_contents($url, false, $context);

file_put_contents('reg_error.json', $result);
echo "Written to reg_error.json\n";
