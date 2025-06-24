<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('estadoequipos', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100)->nullable();
            $table->integer('status')->default(1)->nullable();
            $table->integer('tipoestado_id');
            $table->string('color', 30)->nullable();
            
            $table->index('tipoestado_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('estadoequipos');
    }
};
