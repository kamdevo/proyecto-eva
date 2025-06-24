<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('manuales', function (Blueprint $table) {
            $table->id();
            $table->integer('status')->default(1);
            $table->text('descripcion')->nullable();
            $table->datetime('fecha')->useCurrent();
            $table->text('url')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('manuales');
    }
};
