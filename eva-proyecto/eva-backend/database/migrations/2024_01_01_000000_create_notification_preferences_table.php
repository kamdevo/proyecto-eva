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
        Schema::create('notification_preferences', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->boolean('maintenance_reminders')->default(true);
            $table->boolean('calibration_reminders')->default(true);
            $table->boolean('contingency_alerts')->default(true);
            $table->boolean('equipment_status_changes')->default(true);
            $table->boolean('export_notifications')->default(true);
            $table->enum('reminder_frequency', ['daily', 'weekly', 'monthly'])->default('daily');
            $table->enum('email_format', ['html', 'text'])->default('html');
            $table->time('send_time')->default('08:00');
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('usuarios')->onDelete('cascade');
            $table->unique('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notification_preferences');
    }
};
