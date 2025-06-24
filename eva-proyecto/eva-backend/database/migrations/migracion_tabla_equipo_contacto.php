<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('equipo_contacto', function (Blueprint $table) {
            $table->id();
            $table->integer('equipo_id');
            $table->integer('contacto_id');
            $table->datetime('created_at')->useCurrent();
            
            $table->index('equipo_id');
            $table->index('contacto_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('equipo_contacto');
    }
};
