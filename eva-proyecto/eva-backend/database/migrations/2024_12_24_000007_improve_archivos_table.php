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
        Schema::table('archivos', function (Blueprint $table) {
            // Agregar campos faltantes para archivos
            if (!Schema::hasColumn('archivos', 'description')) {
                $table->text('description')->nullable()->after('name');
            }
            
            if (!Schema::hasColumn('archivos', 'file_name')) {
                $table->string('file_name')->nullable()->after('description');
            }
            
            if (!Schema::hasColumn('archivos', 'file_path')) {
                $table->string('file_path')->nullable()->after('file_name');
            }
            
            if (!Schema::hasColumn('archivos', 'file_size')) {
                $table->bigInteger('file_size')->nullable()->after('file_path');
            }
            
            if (!Schema::hasColumn('archivos', 'extension')) {
                $table->string('extension', 10)->nullable()->after('file_size');
            }
            
            if (!Schema::hasColumn('archivos', 'mime_type')) {
                $table->string('mime_type')->nullable()->after('extension');
            }
            
            if (!Schema::hasColumn('archivos', 'tipo')) {
                $table->enum('tipo', ['manual', 'imagen', 'documento', 'certificado', 'reporte', 'otro'])->default('documento')->after('mime_type');
            }
            
            if (!Schema::hasColumn('archivos', 'categoria')) {
                $table->string('categoria', 100)->nullable()->after('tipo');
            }
            
            if (!Schema::hasColumn('archivos', 'equipo_id')) {
                $table->unsignedBigInteger('equipo_id')->nullable()->after('categoria');
                $table->foreign('equipo_id')->references('id')->on('equipos')->onDelete('set null');
            }
            
            if (!Schema::hasColumn('archivos', 'usuario_id')) {
                $table->unsignedBigInteger('usuario_id')->nullable()->after('equipo_id');
                $table->foreign('usuario_id')->references('id')->on('usuarios')->onDelete('set null');
            }
            
            if (!Schema::hasColumn('archivos', 'publico')) {
                $table->boolean('publico')->default(false)->after('usuario_id');
            }
            
            if (!Schema::hasColumn('archivos', 'activo')) {
                $table->boolean('activo')->default(true)->after('publico');
            }
            
            if (!Schema::hasColumn('archivos', 'descargas')) {
                $table->integer('descargas')->default(0)->after('activo');
            }
        });

        // Agregar índices
        Schema::table('archivos', function (Blueprint $table) {
            if (!Schema::hasIndex('archivos', ['tipo'])) {
                $table->index(['tipo']);
            }
            if (!Schema::hasIndex('archivos', ['equipo_id'])) {
                $table->index(['equipo_id']);
            }
            if (!Schema::hasIndex('archivos', ['activo'])) {
                $table->index(['activo']);
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('archivos', function (Blueprint $table) {
            $table->dropForeign(['equipo_id']);
            $table->dropForeign(['usuario_id']);
            $table->dropColumn([
                'description',
                'file_name',
                'file_path',
                'file_size',
                'extension',
                'mime_type',
                'tipo',
                'categoria',
                'equipo_id',
                'usuario_id',
                'publico',
                'activo',
                'descargas'
            ]);
        });
    }
};
