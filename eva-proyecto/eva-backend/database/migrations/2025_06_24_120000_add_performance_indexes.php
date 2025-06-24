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
        // Índices para tabla equipos
        Schema::table('equipos', function (Blueprint $table) {
            // Índices para campos de búsqueda frecuente
            $table->index('code', 'idx_equipos_code');
            $table->index('serial', 'idx_equipos_serial');
            $table->index('marca', 'idx_equipos_marca');
            $table->index('modelo', 'idx_equipos_modelo');
            $table->index('status', 'idx_equipos_status');
            
            // Índices para relaciones
            $table->index('servicio_id', 'idx_equipos_servicio');
            $table->index('area_id', 'idx_equipos_area');
            $table->index('propietario_id', 'idx_equipos_propietario');
            $table->index('estadoequipo_id', 'idx_equipos_estado');
            $table->index('criesgo_id', 'idx_equipos_riesgo');
            
            // Índices para fechas
            $table->index('fecha_instalacion', 'idx_equipos_fecha_instalacion');
            $table->index('fecha_vencimiento_garantia', 'idx_equipos_garantia');
            $table->index('created_at', 'idx_equipos_created');
            
            // Índice compuesto para búsquedas complejas
            $table->index(['servicio_id', 'area_id', 'status'], 'idx_equipos_servicio_area_status');
        });

        // Índices para tabla mantenimiento
        Schema::table('mantenimiento', function (Blueprint $table) {
            $table->index('equipo_id', 'idx_mantenimiento_equipo');
            $table->index('tecnico_id', 'idx_mantenimiento_tecnico');
            $table->index('status', 'idx_mantenimiento_status');
            $table->index('fecha_programada', 'idx_mantenimiento_fecha_prog');
            $table->index('tipo', 'idx_mantenimiento_tipo');
            
            // Índice compuesto para consultas de vencidos
            $table->index(['status', 'fecha_programada'], 'idx_mantenimiento_status_fecha');
        });

        // Índices para tabla contingencias
        Schema::table('contingencias', function (Blueprint $table) {
            $table->index('equipo_id', 'idx_contingencias_equipo');
            $table->index('usuario_id', 'idx_contingencias_usuario');
            $table->index('estado_id', 'idx_contingencias_estado');
            $table->index('prioridad', 'idx_contingencias_prioridad');
            $table->index('fecha', 'idx_contingencias_fecha');
            
            // Índice compuesto para contingencias activas
            $table->index(['estado_id', 'prioridad'], 'idx_contingencias_estado_prioridad');
        });

        // Índices para tabla usuarios
        Schema::table('usuarios', function (Blueprint $table) {
            $table->index('email', 'idx_usuarios_email');
            $table->index('username', 'idx_usuarios_username');
            $table->index('rol_id', 'idx_usuarios_rol');
            $table->index('estado', 'idx_usuarios_estado');
            $table->index('servicio_id', 'idx_usuarios_servicio');
            
            // Índice compuesto para autenticación
            $table->index(['username', 'estado'], 'idx_usuarios_auth');
        });

        // Índices para tabla archivos
        Schema::table('archivos', function (Blueprint $table) {
            $table->index('equipo_id', 'idx_archivos_equipo');
            $table->index('usuario_id', 'idx_archivos_usuario');
            $table->index('tipo', 'idx_archivos_tipo');
            $table->index('status', 'idx_archivos_status');
            $table->index('created_at', 'idx_archivos_created');
        });

        // Índices para tabla calibracion
        Schema::table('calibracion', function (Blueprint $table) {
            $table->index('equipo_id', 'idx_calibracion_equipo');
            $table->index('estado', 'idx_calibracion_estado');
            $table->index('fecha', 'idx_calibracion_fecha');
            $table->index('fecha_vencimiento', 'idx_calibracion_vencimiento');
        });

        // Índices para tabla observaciones
        Schema::table('observaciones', function (Blueprint $table) {
            $table->index('equipo_id', 'idx_observaciones_equipo');
            $table->index('usuario_id', 'idx_observaciones_usuario');
            $table->index('preventivo_id', 'idx_observaciones_preventivo');
            $table->index('estado', 'idx_observaciones_estado');
            $table->index('created_at', 'idx_observaciones_created');
        });

        // Índices para tablas de relación
        Schema::table('usuarios_zonas', function (Blueprint $table) {
            $table->index('usuario_id', 'idx_usuarios_zonas_usuario');
            $table->index('zona_id', 'idx_usuarios_zonas_zona');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Eliminar índices de equipos
        Schema::table('equipos', function (Blueprint $table) {
            $table->dropIndex('idx_equipos_code');
            $table->dropIndex('idx_equipos_serial');
            $table->dropIndex('idx_equipos_marca');
            $table->dropIndex('idx_equipos_modelo');
            $table->dropIndex('idx_equipos_status');
            $table->dropIndex('idx_equipos_servicio');
            $table->dropIndex('idx_equipos_area');
            $table->dropIndex('idx_equipos_propietario');
            $table->dropIndex('idx_equipos_estado');
            $table->dropIndex('idx_equipos_riesgo');
            $table->dropIndex('idx_equipos_fecha_instalacion');
            $table->dropIndex('idx_equipos_garantia');
            $table->dropIndex('idx_equipos_created');
            $table->dropIndex('idx_equipos_servicio_area_status');
        });

        // Eliminar índices de mantenimiento
        Schema::table('mantenimiento', function (Blueprint $table) {
            $table->dropIndex('idx_mantenimiento_equipo');
            $table->dropIndex('idx_mantenimiento_tecnico');
            $table->dropIndex('idx_mantenimiento_status');
            $table->dropIndex('idx_mantenimiento_fecha_prog');
            $table->dropIndex('idx_mantenimiento_tipo');
            $table->dropIndex('idx_mantenimiento_status_fecha');
        });

        // Eliminar índices de contingencias
        Schema::table('contingencias', function (Blueprint $table) {
            $table->dropIndex('idx_contingencias_equipo');
            $table->dropIndex('idx_contingencias_usuario');
            $table->dropIndex('idx_contingencias_estado');
            $table->dropIndex('idx_contingencias_prioridad');
            $table->dropIndex('idx_contingencias_fecha');
            $table->dropIndex('idx_contingencias_estado_prioridad');
        });

        // Eliminar índices de usuarios
        Schema::table('usuarios', function (Blueprint $table) {
            $table->dropIndex('idx_usuarios_email');
            $table->dropIndex('idx_usuarios_username');
            $table->dropIndex('idx_usuarios_rol');
            $table->dropIndex('idx_usuarios_estado');
            $table->dropIndex('idx_usuarios_servicio');
            $table->dropIndex('idx_usuarios_auth');
        });

        // Eliminar índices de archivos
        Schema::table('archivos', function (Blueprint $table) {
            $table->dropIndex('idx_archivos_equipo');
            $table->dropIndex('idx_archivos_usuario');
            $table->dropIndex('idx_archivos_tipo');
            $table->dropIndex('idx_archivos_status');
            $table->dropIndex('idx_archivos_created');
        });

        // Eliminar índices de calibracion
        Schema::table('calibracion', function (Blueprint $table) {
            $table->dropIndex('idx_calibracion_equipo');
            $table->dropIndex('idx_calibracion_estado');
            $table->dropIndex('idx_calibracion_fecha');
            $table->dropIndex('idx_calibracion_vencimiento');
        });

        // Eliminar índices de observaciones
        Schema::table('observaciones', function (Blueprint $table) {
            $table->dropIndex('idx_observaciones_equipo');
            $table->dropIndex('idx_observaciones_usuario');
            $table->dropIndex('idx_observaciones_preventivo');
            $table->dropIndex('idx_observaciones_estado');
            $table->dropIndex('idx_observaciones_created');
        });

        // Eliminar índices de usuarios_zonas
        Schema::table('usuarios_zonas', function (Blueprint $table) {
            $table->dropIndex('idx_usuarios_zonas_usuario');
            $table->dropIndex('idx_usuarios_zonas_zona');
        });
    }
};
