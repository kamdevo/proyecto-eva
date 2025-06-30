<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('consultas_guias_rapidas', function (Blueprint $table) {
            $table->id();
            $table->integer('guia_id');
            $table->datetime('date')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('consultas_guias_rapidas');
    }
};
