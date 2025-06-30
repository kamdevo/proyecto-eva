<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('proveedores_mantenimiento', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100)->unique()->nullable();
            $table->integer('status')->default(1);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('proveedores_mantenimiento');
    }
};
