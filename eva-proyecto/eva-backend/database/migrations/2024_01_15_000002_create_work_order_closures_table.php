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
        Schema::create('work_order_closures', function (Blueprint $table) {
            $table->id();
            $table->string('order_number')->unique();
            $table->date('closure_date');
            $table->string('work_type');
            $table->string('status');
            $table->string('equipment_name');
            $table->string('equipment_code');
            $table->string('location')->nullable();
            $table->string('service')->nullable();
            $table->text('work_description');
            $table->text('observations')->nullable();
            $table->unsignedBigInteger('technician_signature_id')->nullable();
            $table->unsignedBigInteger('supervisor_signature_id')->nullable();
            $table->timestamps();

            $table->index('order_number');
            $table->index('equipment_code');
            $table->index('closure_date');
            $table->index('created_at');
            
            $table->foreign('technician_signature_id')->references('id')->on('digital_signatures')->onDelete('set null');
            $table->foreign('supervisor_signature_id')->references('id')->on('digital_signatures')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('work_order_closures');
    }
};
