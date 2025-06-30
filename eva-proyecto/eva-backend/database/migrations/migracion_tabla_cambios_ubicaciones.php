<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cambios_ubicaciones', function (Blueprint $table) {
            $table->id();
            $table->datetime('created_at')->useCurrent()->nullable();
            $table->integer('servicio_origen_id')->default(0)->nullable();
            $table->integer('servicio_destino_id')->default(0)->nullable();
            $table->integer('equipo_id')->nullable();
            $table->integer('area_origen_id')->default(0)->nullable();
            $table->integer('area_destino_id')->default(0)->nullable();
            $table->integer('usuario_id')->nullable();
            $table->integer('sede_origen_id');
            $table->integer('sede_destino_id');
            
            $table->index('servicio_origen_id');
            $table->index('servicio_destino_id');
            $table->index('equipo_id');
            $table->index('area_origen_id');
            $table->index('area_destino_id');
            $table->index('usuario_id');
            $table->index('sede_origen_id');
            $table->index('sede_destino_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cambios_ubicaciones');
    }
};
