<?php
require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== CHECKING USERS AND ROLES ===" . PHP_EOL;

// Check users table
$users = DB::table('usuarios')->get();
echo "Users in database:" . PHP_EOL;
foreach ($users as $user) {
    echo "ID: {$user->id} - Name: {$user->nombre} - Email: {$user->email} - Role ID: {$user->rol_id}" . PHP_EOL;
}

echo PHP_EOL . "=== CHECKING ROLES TABLE ===" . PHP_EOL;

// Check roles table
$roles = DB::table('roles')->get();
echo "Roles in database:" . PHP_EOL;
foreach ($roles as $role) {
    echo "ID: {$role->id} - Name: {$role->nombre} - Description: {$role->descripcion}" . PHP_EOL;
}

echo PHP_EOL . "=== CHECKING USER PERMISSIONS ===" . PHP_EOL;

// Check user permissions
$permissions = DB::table('permisos_usuarios')->get();
echo "User permissions:" . PHP_EOL;
foreach ($permissions as $perm) {
    echo "User ID: {$perm->usuario_id} - Module ID: {$perm->modulo_id} - Read: {$perm->leer} - Insert: {$perm->insertar} - Edit: {$perm->editar} - Delete: {$perm->eliminar}" . PHP_EOL;
}

echo PHP_EOL . "=== CHECKING MODULES ===" . PHP_EOL;

// Check modules
$modules = DB::table('modulos')->get();
echo "Modules in database:" . PHP_EOL;
foreach ($modules as $module) {
    echo "ID: {$module->id} - Name: {$module->nombre}" . PHP_EOL;
}
?>
