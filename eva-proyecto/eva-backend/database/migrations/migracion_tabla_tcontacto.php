<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tcontacto', function (Blueprint $table) {
            $table->integer('id')->primary();
            $table->string('description', 100)->nullable();
            $table->datetime('created_at');
            $table->integer('status')->default(1);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tcontacto');
    }
};
