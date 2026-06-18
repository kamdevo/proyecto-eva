<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Agrega la sede directamente al equipo. Antes la sede se derivaba del
     * servicio (servicios.sede_id); ahora cada equipo guarda su propia sede,
     * editable de forma independiente desde el modal de editar equipo.
     */
    public function up(): void
    {
        if (!Schema::hasColumn('equipos', 'sede_id')) {
            Schema::table('equipos', function (Blueprint $table) {
                $table->integer('sede_id')->nullable()->after('servicio_id');
                $table->index('sede_id');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('equipos', 'sede_id')) {
            Schema::table('equipos', function (Blueprint $table) {
                $table->dropIndex(['sede_id']);
                $table->dropColumn('sede_id');
            });
        }
    }
};
