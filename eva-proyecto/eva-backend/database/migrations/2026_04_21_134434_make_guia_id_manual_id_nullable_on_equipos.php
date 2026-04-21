<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Hace nullable guia_id y manual_id en la tabla equipos para permitir
     * desasociar una guía rápida o manual sin romper la actualización.
     */
    public function up(): void
    {
        DB::statement("ALTER TABLE `equipos` MODIFY `guia_id` INT NULL DEFAULT NULL");
        DB::statement("ALTER TABLE `equipos` MODIFY `manual_id` INT NULL DEFAULT NULL");
    }

    public function down(): void
    {
        DB::statement("UPDATE `equipos` SET `guia_id` = 0 WHERE `guia_id` IS NULL");
        DB::statement("UPDATE `equipos` SET `manual_id` = 0 WHERE `manual_id` IS NULL");
        DB::statement("ALTER TABLE `equipos` MODIFY `guia_id` INT NOT NULL");
        DB::statement("ALTER TABLE `equipos` MODIFY `manual_id` INT NOT NULL");
    }
};
