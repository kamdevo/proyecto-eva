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
        Schema::create('digital_signatures', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('title')->nullable();
            $table->string('position')->nullable();
            $table->string('document_title')->nullable();
            $table->enum('signature_type', ['draw', 'type']);
            $table->string('file_path');
            $table->string('file_name');
            $table->unsignedBigInteger('work_order_id')->nullable();
            $table->string('signature_role')->nullable(); // technician, supervisor, etc.
            $table->timestamps();

            $table->index(['work_order_id', 'signature_role']);
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('digital_signatures');
    }
};
