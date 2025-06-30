<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('avances_correctivos', function (Blueprint $table) {
            $table->id();
            $table->text('description')->nullable();
            $table->date('date')->nullable();
            $table->string('file', 100)->nullable();
            $table->string('title', 100)->nullable();
            $table->integer('correctivo_general_id')->nullable();
            $table->integer('usuario_id')->nullable();
            $table->integer('orden_id');
            
            $table->index('correctivo_general_id');
            $table->index('orden_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('avances_correctivos');
    }
};
