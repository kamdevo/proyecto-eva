<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('servicios', function (Blueprint $table) {
            $table->id();
            $table->string('code', 255)->nullable();
            $table->string('name', 255)->unique()->nullable();
            $table->text('description')->nullable();
            $table->datetime('created_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('piso_id')->nullable();
            $table->integer('status')->default(1);
            $table->integer('zona_id')->default(1)->nullable();
            $table->integer('centro_id')->nullable();
            $table->integer('sede_id')->default(1)->nullable();
            
            $table->index('piso_id');
            $table->index('zona_id');
            $table->index('centro_id');
            $table->index('sede_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('servicios');
    }
};
