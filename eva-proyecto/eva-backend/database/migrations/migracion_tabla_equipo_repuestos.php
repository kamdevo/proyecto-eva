<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('equipo_repuestos', function (Blueprint $table) {
            $table->id();
            $table->integer('equipo_id');
            $table->integer('repuesto_id');
            $table->integer('cantidad_recomendada')->default(1);
            $table->integer('cantidad_actual')->default(0);
            $table->text('observaciones')->nullable();
            $table->datetime('created_at')->useCurrent();
            
            $table->index('equipo_id');
            $table->index('repuesto_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('equipo_repuestos');
    }
};
