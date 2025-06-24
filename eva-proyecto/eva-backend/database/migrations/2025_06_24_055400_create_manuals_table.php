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
        Schema::create('manuals', function (Blueprint $table) {
            $table->id();
            $table->string('title'); // Título del manual
            $table->text('description')->nullable(); // Descripción
            $table->string('file_path'); // Ruta del archivo
            $table->string('file_name'); // Nombre del archivo
            $table->string('file_type'); // Tipo de archivo (PDF, DOC, etc.)
            $table->integer('file_size')->nullable(); // Tamaño del archivo en bytes
            $table->string('version')->default('1.0'); // Versión del manual
            $table->foreignId('equipment_id')->nullable()->constrained('equipment')->onDelete('cascade');
            $table->foreignId('uploaded_by')->constrained('users')->onDelete('cascade');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('manuals');
    }
};
