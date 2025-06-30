<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('invimas', function (Blueprint $table) {
            $table->id();
            $table->string('invima', 100)->nullable();
            $table->string('file', 100)->nullable();
            $table->text('description')->nullable();
            $table->integer('status')->default(1)->nullable();
            $table->text('titulo')->nullable();
            $table->text('marcas')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('invimas');
    }
};
