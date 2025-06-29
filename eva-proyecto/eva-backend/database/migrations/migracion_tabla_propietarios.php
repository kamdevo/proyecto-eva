<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('propietarios', function (Blueprint $table) {
            $table->id();
            $table->text('nombre');
            $table->string('logo', 50);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('propietarios');
    }
};
