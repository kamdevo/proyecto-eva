<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('movimientos', function (Blueprint $table) {
            $table->id();
            $table->integer('equipo_id');
            $table->integer('usuario_id');
            $table->string('tipo_movimiento', 50); // entrada, salida, transferencia
            $table->integer('ubicacion_origen_id')->nullable();
            $table->integer('ubicacion_destino_id')->nullable();
            $table->text('observaciones')->nullable();
            $table->datetime('fecha_movimiento')->useCurrent();
            $table->string('documento_soporte', 255)->nullable();
            
            $table->index('equipo_id');
            $table->index('usuario_id');
            $table->index('ubicacion_origen_id');
            $table->index('ubicacion_destino_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('movimientos');
    }
};
