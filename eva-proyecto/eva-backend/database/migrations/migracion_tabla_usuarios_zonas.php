<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('usuarios_zonas', function (Blueprint $table) {
            $table->id();
            $table->integer('usuario_id');
            $table->integer('zona_id');
            $table->datetime('created_at')->useCurrent();
            $table->boolean('activo')->default(true);
            
            $table->index('usuario_id');
            $table->index('zona_id');
            $table->unique(['usuario_id', 'zona_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('usuarios_zonas');
    }
};
