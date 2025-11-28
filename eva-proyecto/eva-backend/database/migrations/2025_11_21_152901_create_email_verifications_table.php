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
        Schema::create('email_verifications', function (Blueprint $table) {
            $table->id();
            $table->integer('usuario_id')->unsigned();
            $table->string('token', 64)->unique();
            $table->string('email');
            $table->timestamp('expires_at');
            $table->timestamp('verified_at')->nullable();
            $table->timestamps();
            
            // Índices
            $table->index('token');
            $table->index('usuario_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('email_verifications');
    }
};
