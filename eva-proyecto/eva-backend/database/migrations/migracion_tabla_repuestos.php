<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('repuestos', function (Blueprint $table) {
            $table->id();
            $table->string('name', 250)->nullable();
            $table->integer('cantidad')->nullable();
            $table->timestamp('created_at')->useCurrent()->nullable();
            $table->string('code', 100)->nullable();
            $table->integer('status')->default(1)->nullable();
            $table->decimal('precio', 10, 0)->nullable();
            $table->string('grupo', 10)->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('repuestos');
    }
};
