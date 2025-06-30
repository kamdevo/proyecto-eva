<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('equipos_industriales', function (Blueprint $table) {
            $table->id();
            $table->text('image')->nullable();
            $table->string('code', 100)->nullable();
            $table->text('name')->nullable();
            $table->text('descripcion')->nullable();
            $table->datetime('created_at')->nullable();
            $table->integer('status')->default(1);
            $table->text('marca')->nullable();
            $table->text('modelo')->nullable();
            $table->text('serial')->nullable();
            $table->text('invima')->nullable();
            $table->date('fecha_ad')->nullable();
            $table->integer('servicio_id');
            $table->integer('fuente_id');
            $table->integer('tecnologia_id');
            $table->integer('frecuencia_id');
            $table->integer('cbiomedica_id');
            $table->integer('criesgo_id');
            $table->integer('tadquisicion_id');
            $table->integer('invima_id');
            $table->integer('orden_compra_id');
            $table->integer('baja_id');
            $table->text('file')->nullable();
            $table->date('fecha_instalacion')->nullable();
            $table->string('vida_util', 100)->nullable();
            $table->text('observacion')->nullable();
            $table->string('fecha', 100)->nullable();
            $table->string('v1', 100)->nullable();
            $table->string('v2', 100)->nullable();
            $table->string('v3', 100)->nullable();
            $table->timestamp('fecha_cambio')->useCurrent()->useCurrentOnUpdate()->nullable();
            
            $table->index('servicio_id');
            $table->index('fuente_id');
            $table->index('tecnologia_id');
            $table->index('frecuencia_id');
            $table->index('cbiomedica_id');
            $table->index('criesgo_id');
            $table->index('tadquisicion_id');
            $table->index('invima_id');
            $table->index('orden_compra_id');
            $table->index('baja_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('equipos_industriales');
    }
};
