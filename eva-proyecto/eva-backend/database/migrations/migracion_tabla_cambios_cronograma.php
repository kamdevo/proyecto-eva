<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cambios_cronograma', function (Blueprint $table) {
            $table->id();
            $table->datetime('created_at')->useCurrent()->nullable();
            $table->integer('usuario_id')->nullable();
            $table->text('cambio')->nullable();
            $table->integer('planes_mantenimientos_id')->nullable();
            
            $table->index('usuario_id');
            $table->index('planes_mantenimientos_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cambios_cronograma');
    }
};
