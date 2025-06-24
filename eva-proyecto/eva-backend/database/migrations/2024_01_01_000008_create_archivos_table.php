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
        Schema::create('archivos', function (Blueprint $table) {
            $table->id();
            $table->string('name', 250)->unique()->nullable();
            $table->text('description')->nullable();
            $table->string('file_name', 191)->nullable();
            $table->string('file_path', 191)->nullable();
            $table->bigInteger('file_size')->nullable();
            $table->string('extension', 10)->nullable();
            $table->string('mime_type', 191)->nullable();
            $table->enum('tipo', ['manual', 'imagen', 'documento', 'certificado', 'reporte', 'otro'])->default('documento');
            $table->string('categoria', 100)->nullable();
            $table->bigInteger('equipo_id')->unsigned()->nullable();
            $table->bigInteger('usuario_id')->unsigned()->nullable();
            $table->boolean('publico')->default(false);
            $table->boolean('activo')->default(true);
            $table->integer('descargas')->default(0);
            
            $table->index('tipo');
            $table->index('equipo_id');
            $table->index('usuario_id');
            $table->index('activo');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('archivos');
    }
};
