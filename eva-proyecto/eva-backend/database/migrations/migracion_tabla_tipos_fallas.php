<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tipos_fallas', function (Blueprint $table) {
            $table->integer('id')->primary();
            $table->string('name', 200)->nullable();
            $table->datetime('created_at')->useCurrent();
            $table->integer('status')->default(1);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tipos_fallas');
    }
};
