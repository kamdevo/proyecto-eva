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
        Schema::create('usuarios', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 100)->nullable();
            $table->string('apellido', 100)->nullable();
            $table->string('telefono', 20)->nullable();
            $table->string('email', 100)->unique()->nullable();
            $table->string('username', 45)->unique()->nullable();
            $table->string('password', 100)->default('10470c3b4b1fed12c3baac014be15fac67c6e815')->nullable();
            $table->integer('rol_id')->default(4)->nullable();
            $table->tinyInteger('estado')->default(1)->nullable();
            $table->integer('servicio_id')->nullable();
            $table->string('centro_id', 100)->nullable();
            $table->text('code')->nullable();
            $table->string('active', 20)->nullable();
            $table->timestamp('fecha_registro')->useCurrent()->nullable();
            $table->integer('id_empresa')->default(0)->nullable();
            $table->string('sede_id', 10)->default('1')->nullable();
            $table->integer('zona_id')->nullable();
            $table->integer('anio_plan')->default(2023)->nullable();
            
            $table->index('rol_id');
            $table->index('servicio_id');
            $table->index('centro_id');
            $table->index('id_empresa');
            $table->index('sede_id');
            $table->index('zona_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('usuarios');
    }
};
