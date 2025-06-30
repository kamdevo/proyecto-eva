<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('estados_excluidos_guias', function (Blueprint $table) {
            $table->id();
            $table->integer('estado_id');
            $table->integer('guia_id');
            $table->datetime('created_at')->useCurrent();
            
            $table->index('estado_id');
            $table->index('guia_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('estados_excluidos_guias');
    }
};
