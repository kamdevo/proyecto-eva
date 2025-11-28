<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Mail;
use App\Mail\ConfirmacionCuentaEmail;
use Illuminate\Support\Str;

Route::get('/test-email-config', function () {
    return response()->json([
        'mail_mailer' => env('MAIL_MAILER'),
        'mail_host' => env('MAIL_HOST'),
        'mail_port' => env('MAIL_PORT'),
        'mail_username' => env('MAIL_USERNAME'),
        'mail_from_address' => env('MAIL_FROM_ADDRESS'),
        'mail_from_name' => env('MAIL_FROM_NAME'),
    ]);
});

Route::get('/test-send-email/{email}', function ($email) {
    try {
        $testUser = (object)[
            'id' => 9999,
            'nombre' => 'Test',
            'apellido' => 'Usuario',
            'email' => $email
        ];
        
        $token = Str::random(64);
        
        Mail::to($email)->send(new ConfirmacionCuentaEmail($testUser, $token));
        
        return response()->json([
            'success' => true,
            'message' => 'Email de prueba enviado a ' . $email,
            'token' => $token
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ], 500);
    }
});
