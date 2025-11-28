<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

if ($argc < 2) {
    echo "Uso: php get-token.php <email>\n";
    echo "Ejemplo: php get-token.php usuario@example.com\n";
    exit(1);
}

$email = $argv[1];

echo "\n🔍 Buscando usuario: $email\n";
echo "=====================================\n\n";

$user = DB::table('usuarios')
    ->where('email', $email)
    ->select('id', 'nombre', 'apellido', 'email', 'username', 'active')
    ->first();

if (!$user) {
    echo "❌ Usuario no encontrado\n";
    exit(1);
}

echo "✅ Usuario encontrado:\n";
echo "   ID: {$user->id}\n";
echo "   Nombre: {$user->nombre} {$user->apellido}\n";
echo "   Email: {$user->email}\n";
echo "   Username: {$user->username}\n";
echo "   Active: {$user->active}\n\n";

$verification = DB::table('email_verifications')
    ->where('usuario_id', $user->id)
    ->latest()
    ->first();

if (!$verification) {
    echo "❌ No se encontró token de verificación\n";
    exit(1);
}

echo "📧 Token de verificación:\n";
echo "   Token: {$verification->token}\n";
echo "   Expira: {$verification->expires_at}\n";
echo "   Verificado: " . ($verification->verified_at ?? 'No') . "\n\n";

$frontendUrl = env('FRONTEND_URL', 'http://192.168.2.146:5174');
$verificationUrl = "{$frontendUrl}/confirmar-cuenta/{$verification->token}";

echo "🔗 URL de verificación:\n";
echo "   {$verificationUrl}\n\n";

echo "📋 Copia esta URL y ábrela en el navegador para verificar la cuenta.\n\n";
