<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('equipo_archivo', function (Blueprint $table) {
            $table->id();
            $table->integer('equipo_id');
            $table->integer('archivo_id');
            $table->datetime('created_at')->useCurrent();
            $table->integer('usuario_id')->nullable();
            $table->text('observaciones')->nullable();
            
            $table->index('equipo_id');
            $table->index('archivo_id');
            $table->index('usuario_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('equipo_archivo');
    }
};
