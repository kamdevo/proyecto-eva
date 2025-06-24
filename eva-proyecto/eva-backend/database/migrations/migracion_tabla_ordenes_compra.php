<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ordenes_compra', function (Blueprint $table) {
            $table->id();
            $table->string('orden', 100);
            $table->string('file', 100);
            $table->date('fecha')->nullable();
            $table->integer('status')->default(1)->nullable();
            $table->integer('proveedor_id')->nullable();
            $table->integer('tipo_compra_id')->nullable();
            $table->string('secop_id', 255)->nullable();
            $table->string('url_secop', 255)->nullable();
            
            $table->index('proveedor_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ordenes_compra');
    }
};
