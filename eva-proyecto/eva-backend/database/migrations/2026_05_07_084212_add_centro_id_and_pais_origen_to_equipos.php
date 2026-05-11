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
        Schema::table('equipos', function (Blueprint $table) {
            if (!Schema::hasColumn('equipos', 'centro_id')) {
                $table->unsignedInteger('centro_id')->nullable()->after('servicio_id');
                $table->index('centro_id', 'equipos_centro_id_idx');
            }
            if (!Schema::hasColumn('equipos', 'pais_origen')) {
                $table->string('pais_origen', 150)->nullable()->after('propiedad');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('equipos', function (Blueprint $table) {
            if (Schema::hasColumn('equipos', 'centro_id')) {
                $table->dropIndex('equipos_centro_id_idx');
                $table->dropColumn('centro_id');
            }
            if (Schema::hasColumn('equipos', 'pais_origen')) {
                $table->dropColumn('pais_origen');
            }
        });
    }
};
