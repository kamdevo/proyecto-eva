<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('empresas', function (Blueprint $table) {
            $table->id();
            $table->string('name', 200);
            $table->string('estado', 200)->default('true');
            $table->string('area', 200);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('empresas');
    }
};
