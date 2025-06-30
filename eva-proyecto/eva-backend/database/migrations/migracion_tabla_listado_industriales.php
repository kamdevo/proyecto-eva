<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('listado_industriales', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100)->nullable();
            $table->integer('status')->default(1);
            $table->datetime('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('listado_industriales');
    }
};
