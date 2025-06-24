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
        Schema::table('areas', function (Blueprint $table) {
            // Agregar campos faltantes para áreas
            if (!Schema::hasColumn('areas', 'status')) {
                $table->boolean('status')->default(true)->after('description');
            }
            
            if (!Schema::hasColumn('areas', 'responsable_id')) {
                $table->unsignedBigInteger('responsable_id')->nullable()->after('status');
                $table->foreign('responsable_id')->references('id')->on('usuarios')->onDelete('set null');
            }
            
            if (!Schema::hasColumn('areas', 'telefono')) {
                $table->string('telefono', 20)->nullable()->after('responsable_id');
            }
            
            if (!Schema::hasColumn('areas', 'email')) {
                $table->string('email')->nullable()->after('telefono');
            }
            
            if (!Schema::hasColumn('areas', 'ubicacion')) {
                $table->string('ubicacion')->nullable()->after('email');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('areas', function (Blueprint $table) {
            $table->dropForeign(['responsable_id']);
            $table->dropColumn([
                'status',
                'responsable_id',
                'telefono',
                'email',
                'ubicacion'
            ]);
        });
    }
};
