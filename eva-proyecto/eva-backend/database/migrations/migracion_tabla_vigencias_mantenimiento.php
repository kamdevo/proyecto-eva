<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vigencias_mantenimiento', function (Blueprint $table) {
            $table->id();
            $table->integer('equipo_id');
            $table->date('fecha_ultimo_mantenimiento')->nullable();
            $table->date('fecha_proximo_mantenimiento')->nullable();
            $table->integer('dias_vigencia')->default(365);
            $table->boolean('vigente')->default(true);
            $table->text('observaciones')->nullable();
            $table->datetime('created_at')->useCurrent();
            $table->datetime('updated_at')->useCurrent()->useCurrentOnUpdate();
            
            $table->index('equipo_id');
            $table->index('fecha_proximo_mantenimiento');
            $table->index('vigente');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vigencias_mantenimiento');
    }
};
