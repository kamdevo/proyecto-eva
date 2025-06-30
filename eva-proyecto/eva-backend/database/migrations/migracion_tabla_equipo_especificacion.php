<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('equipo_especificacion', function (Blueprint $table) {
            $table->id();
            $table->integer('equipo_id');
            $table->integer('especificacion_id');
            $table->text('valor')->nullable();
            $table->text('unidad')->nullable();
            $table->datetime('created_at')->useCurrent();
            
            $table->index('equipo_id');
            $table->index('especificacion_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('equipo_especificacion');
    }
};
