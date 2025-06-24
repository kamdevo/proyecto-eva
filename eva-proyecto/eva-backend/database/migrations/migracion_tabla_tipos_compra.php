<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tipos_compra', function (Blueprint $table) {
            $table->integer('id')->primary();
            $table->string('tipo_compra', 100)->nullable();
            $table->integer('status')->default(1)->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tipos_compra');
    }
};
