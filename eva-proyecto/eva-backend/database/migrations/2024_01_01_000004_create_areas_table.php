<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('areas', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100)->nullable();
            $table->integer('servicio_id')->nullable();
            $table->integer('centro_id')->nullable();
            $table->integer('piso_id');
            $table->boolean('status')->default(true);
            $table->bigInteger('responsable_id')->unsigned()->nullable();
            $table->string('telefono', 20)->nullable();
            $table->string('email', 191)->nullable();
            $table->string('ubicacion', 191)->nullable();
            
            $table->index('servicio_id');
            $table->index('centro_id');
            $table->index('piso_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('areas');
    }
};
