<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('zonas', function (Blueprint $table) {
            $table->integer('id')->primary();
            $table->string('name', 100)->unique();
            $table->integer('status')->default(1);
            $table->datetime('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('zonas');
    }
};
