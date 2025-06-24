<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('equipos_excluidos_guias', function (Blueprint $table) {
            $table->id();
            $table->integer('equipo_id');
            $table->integer('guia_id');
            $table->datetime('created_at')->useCurrent();
            $table->integer('usuario_id')->nullable();
            
            $table->index('equipo_id');
            $table->index('guia_id');
            $table->index('usuario_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('equipos_excluidos_guias');
    }
};
