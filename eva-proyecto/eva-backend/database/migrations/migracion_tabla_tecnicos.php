<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tecnicos', function (Blueprint $table) {
            $table->integer('id')->primary();
            $table->string('name', 150)->nullable();
            $table->datetime('created_at')->useCurrent()->nullable();
            $table->integer('trabajo_id');
            
            $table->index('trabajo_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tecnicos');
    }
};
