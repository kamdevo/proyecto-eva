<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('observaciones', function (Blueprint $table) {
            $table->id();
            $table->text('description')->nullable();
            $table->datetime('created_at')->useCurrent()->nullable();
            $table->integer('equipo_id')->nullable();
            $table->string('file', 200)->nullable();
            $table->integer('usuario_id')->nullable();
            $table->text('repuesto_id')->nullable();
            $table->string('repuesto_pendiente', 20)->default('no')->nullable();
            $table->integer('preventivo_id');
            $table->date('fecha_nota')->nullable();
            
            $table->index('equipo_id');
            $table->index('usuario_id');
            $table->index('preventivo_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('observaciones');
    }
};
