<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('codificacion_cierres', function (Blueprint $table) {
            $table->id();
            $table->string('name', 150)->nullable();
            $table->string('code', 10)->unique()->nullable();
            $table->timestamp('created_at')->useCurrent()->nullable();
            $table->integer('status')->default(1)->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('codificacion_cierres');
    }
};
