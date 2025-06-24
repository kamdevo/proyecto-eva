<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tipos', function (Blueprint $table) {
            $table->integer('id')->primary();
            $table->string('name', 100);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tipos');
    }
};
