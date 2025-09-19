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
        Schema::create('notification_logs', function (Blueprint $table) {
            $table->id();
            $table->string('type'); // maintenance, calibration, contingency, etc.
            $table->string('recipient_email');
            $table->unsignedBigInteger('user_id')->nullable();
            $table->string('subject');
            $table->enum('status', ['sent', 'delivered', 'failed', 'bounced'])->default('sent');
            $table->json('metadata')->nullable(); // equipment_id, maintenance_id, etc.
            $table->text('error_message')->nullable();
            $table->timestamp('sent_at');
            $table->timestamp('delivered_at')->nullable();
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('usuarios')->onDelete('set null');
            $table->index(['type', 'sent_at']);
            $table->index(['recipient_email', 'sent_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notification_logs');
    }
};
