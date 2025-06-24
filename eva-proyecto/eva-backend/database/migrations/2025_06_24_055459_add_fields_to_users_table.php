<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('apellidos')->nullable()->after('name');
            $table->string('telefono')->nullable()->after('email');
            $table->string('username')->unique()->after('telefono');
            $table->enum('rol', ['administrador', 'admin', 'usuario'])->default('usuario')->after('username');
            $table->string('centro_costo')->nullable()->after('rol');
            $table->string('empresa')->nullable()->after('centro_costo');
            $table->json('permissions')->nullable()->after('empresa'); // Para almacenar permisos
            $table->boolean('cambio_clave')->default(false)->after('permissions');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'apellidos', 'telefono', 'username', 'rol',
                'centro_costo', 'empresa', 'permissions', 'cambio_clave'
            ]);
        });
    }
};
