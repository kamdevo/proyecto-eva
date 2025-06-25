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
        // System events table
        Schema::create('system_events', function (Blueprint $table) {
            $table->id();
            $table->string('event_type');
            $table->string('event_category', 100);
            $table->enum('event_priority', ['critical', 'high', 'normal', 'low'])->default('normal');
            $table->unsignedBigInteger('user_id')->nullable();
            $table->json('data');
            $table->json('metadata')->nullable();
            $table->timestamp('created_at');
            
            $table->index(['event_type', 'created_at']);
            $table->index(['event_category', 'created_at']);
            $table->index(['event_priority', 'created_at']);
            $table->index(['user_id', 'created_at']);
            
            $table->foreign('user_id')->references('id')->on('usuarios')->onDelete('set null');
        });

        // System alerts table
        Schema::create('system_alerts', function (Blueprint $table) {
            $table->id();
            $table->string('type');
            $table->string('title');
            $table->text('message');
            $table->enum('severity', ['critical', 'high', 'medium', 'low'])->default('medium');
            $table->enum('status', ['active', 'acknowledged', 'resolved', 'dismissed'])->default('active');
            $table->unsignedBigInteger('equipment_id')->nullable();
            $table->unsignedBigInteger('service_id')->nullable();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('acknowledged_by')->nullable();
            $table->unsignedBigInteger('resolved_by')->nullable();
            $table->json('data')->nullable();
            $table->timestamp('acknowledged_at')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
            
            $table->index(['type', 'status']);
            $table->index(['severity', 'status']);
            $table->index(['equipment_id', 'status']);
            $table->index(['service_id', 'status']);
            $table->index(['created_at', 'status']);
            
            $table->foreign('equipment_id')->references('id')->on('equipos')->onDelete('cascade');
            $table->foreign('service_id')->references('id')->on('servicios')->onDelete('cascade');
            $table->foreign('created_by')->references('id')->on('usuarios')->onDelete('set null');
            $table->foreign('acknowledged_by')->references('id')->on('usuarios')->onDelete('set null');
            $table->foreign('resolved_by')->references('id')->on('usuarios')->onDelete('set null');
        });

        // Equipment location history table
        Schema::create('equipment_location_history', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('equipment_id');
            $table->unsignedBigInteger('previous_service_id')->nullable();
            $table->unsignedBigInteger('new_service_id')->nullable();
            $table->unsignedBigInteger('previous_area_id')->nullable();
            $table->unsignedBigInteger('new_area_id')->nullable();
            $table->unsignedBigInteger('changed_by')->nullable();
            $table->text('reason')->nullable();
            $table->json('changes');
            $table->timestamp('changed_at');
            
            $table->index(['equipment_id', 'changed_at']);
            $table->index(['new_service_id', 'changed_at']);
            $table->index(['new_area_id', 'changed_at']);
            
            $table->foreign('equipment_id')->references('id')->on('equipos')->onDelete('cascade');
            $table->foreign('previous_service_id')->references('id')->on('servicios')->onDelete('set null');
            $table->foreign('new_service_id')->references('id')->on('servicios')->onDelete('set null');
            $table->foreign('previous_area_id')->references('id')->on('areas')->onDelete('set null');
            $table->foreign('new_area_id')->references('id')->on('areas')->onDelete('set null');
            $table->foreign('changed_by')->references('id')->on('usuarios')->onDelete('set null');
        });

        // Event metrics table
        Schema::create('event_metrics', function (Blueprint $table) {
            $table->id();
            $table->string('metric_type');
            $table->string('metric_category');
            $table->string('metric_key');
            $table->decimal('metric_value', 15, 4);
            $table->json('metadata')->nullable();
            $table->date('metric_date');
            $table->tinyInteger('metric_hour')->nullable();
            $table->timestamps();
            
            $table->unique(['metric_type', 'metric_category', 'metric_key', 'metric_date', 'metric_hour']);
            $table->index(['metric_type', 'metric_date']);
            $table->index(['metric_category', 'metric_date']);
        });

        // Notification preferences table
        Schema::create('notification_preferences', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->string('event_type');
            $table->json('channels'); // ['email', 'database', 'broadcast', 'sms']
            $table->enum('priority_threshold', ['critical', 'high', 'normal', 'low'])->default('normal');
            $table->boolean('enabled')->default(true);
            $table->json('filters')->nullable(); // Additional filters for the event type
            $table->timestamps();
            
            $table->unique(['user_id', 'event_type']);
            $table->index(['user_id', 'enabled']);
            
            $table->foreign('user_id')->references('id')->on('usuarios')->onDelete('cascade');
        });

        // Event subscriptions table (for real-time updates)
        Schema::create('event_subscriptions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->string('channel_name');
            $table->string('event_pattern'); // Pattern to match events (e.g., 'equipment.*', 'maintenance.scheduled')
            $table->json('filters')->nullable();
            $table->boolean('active')->default(true);
            $table->timestamp('last_activity')->nullable();
            $table->timestamps();
            
            $table->index(['user_id', 'active']);
            $table->index(['channel_name', 'active']);
            
            $table->foreign('user_id')->references('id')->on('usuarios')->onDelete('cascade');
        });

        // Audit trail table
        Schema::create('audit_trail', function (Blueprint $table) {
            $table->id();
            $table->string('auditable_type');
            $table->unsignedBigInteger('auditable_id');
            $table->string('event_type');
            $table->unsignedBigInteger('user_id')->nullable();
            $table->json('old_values')->nullable();
            $table->json('new_values')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
            
            $table->index(['auditable_type', 'auditable_id']);
            $table->index(['event_type', 'created_at']);
            $table->index(['user_id', 'created_at']);
            
            $table->foreign('user_id')->references('id')->on('usuarios')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('audit_trail');
        Schema::dropIfExists('event_subscriptions');
        Schema::dropIfExists('notification_preferences');
        Schema::dropIfExists('event_metrics');
        Schema::dropIfExists('equipment_location_history');
        Schema::dropIfExists('system_alerts');
        Schema::dropIfExists('system_events');
    }
};
