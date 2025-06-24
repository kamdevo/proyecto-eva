<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('necesidades', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100)->nullable();
            $table->integer('status')->default(1)->nullable();
            $table->datetime('created_at')->useCurrent()->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('necesidades');
    }
};
