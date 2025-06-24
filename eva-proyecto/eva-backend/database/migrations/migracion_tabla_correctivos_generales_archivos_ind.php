<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('correctivos_generales_archivos_ind', function (Blueprint $table) {
            $table->id();
            $table->integer('correctivo_general_id');
            $table->string('file', 100)->nullable();
            $table->string('title', 100)->nullable();
            $table->text('description')->nullable();
            $table->datetime('created_at')->useCurrent();
            
            $table->index('correctivo_general_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('correctivos_generales_archivos_ind');
    }
};
