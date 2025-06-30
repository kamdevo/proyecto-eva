<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('guias_rapidas', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100)->nullable();
            $table->string('file', 100)->nullable();
            $table->integer('estado')->default(1)->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('guias_rapidas');
    }
};
