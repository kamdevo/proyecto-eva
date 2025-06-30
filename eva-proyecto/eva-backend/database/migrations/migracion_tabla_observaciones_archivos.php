<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('observaciones_archivos', function (Blueprint $table) {
            $table->id();
            $table->integer('observacion_id');
            $table->string('file', 200)->nullable();
            $table->string('title', 100)->nullable();
            $table->text('description')->nullable();
            $table->datetime('created_at')->useCurrent();
            
            $table->index('observacion_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('observaciones_archivos');
    }
};
