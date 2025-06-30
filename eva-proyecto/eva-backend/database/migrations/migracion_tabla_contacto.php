<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('contacto', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100)->unique()->nullable();
            $table->string('email', 100)->nullable();
            $table->string('telefono', 100)->nullable();
            $table->integer('tcontacto_id');
            $table->datetime('created_at');
            $table->integer('status')->default(1);
            
            $table->index('tcontacto_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contacto');
    }
};
