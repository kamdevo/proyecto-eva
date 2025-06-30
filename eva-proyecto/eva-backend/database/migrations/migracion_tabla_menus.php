<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('menus', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100)->nullable();
            $table->string('url', 255)->nullable();
            $table->string('icon', 50)->nullable();
            $table->integer('parent_id')->nullable();
            $table->integer('order')->default(0);
            $table->boolean('active')->default(true);
            
            $table->index('parent_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('menus');
    }
};
