<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cambios_hdv', function (Blueprint $table) {
            $table->id();
            $table->text('descripcion');
            $table->datetime('created_at')->useCurrent();
            $table->integer('usuario_id');
            $table->integer('equipo_id');
            
            $table->index('usuario_id');
            $table->index('equipo_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cambios_hdv');
    }
};
