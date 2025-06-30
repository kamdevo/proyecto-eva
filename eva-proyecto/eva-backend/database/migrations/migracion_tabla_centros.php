<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('centros', function (Blueprint $table) {
            $table->id();
            $table->string('code', 100)->nullable();
            $table->string('name', 250)->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->integer('status')->default(1)->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('centros');
    }
};
