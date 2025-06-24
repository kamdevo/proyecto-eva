<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('equipos', function (Blueprint $table) {
            $table->id();
            $table->text('image')->nullable();
            $table->string('code', 100)->nullable();
            $table->text('name')->nullable();
            $table->text('descripcion')->nullable();
            $table->datetime('created_at')->nullable();
            $table->integer('status')->default(1);
            $table->text('marca')->nullable();
            $table->text('modelo')->nullable();
            $table->text('serial')->nullable();
            $table->text('invima')->nullable();
            $table->date('fecha_ad')->nullable();
            $table->integer('servicio_id');
            $table->integer('fuente_id');
            $table->integer('tecnologia_id');
            $table->integer('frecuencia_id');
            $table->integer('cbiomedica_id');
            $table->integer('criesgo_id');
            $table->integer('tadquisicion_id');
            $table->integer('invima_id');
            $table->integer('orden_compra_id');
            $table->integer('baja_id');
            $table->text('file')->nullable();
            $table->date('fecha_instalacion')->nullable();
            $table->string('vida_util', 100)->nullable();
            $table->text('observacion')->nullable();
            $table->string('fecha', 100)->nullable();
            $table->string('v1', 100)->nullable();
            $table->string('v2', 100)->nullable();
            $table->string('v3', 100)->nullable();
            $table->timestamp('fecha_cambio')->useCurrent()->useCurrentOnUpdate()->nullable();
            $table->text('fecha_mantenimiento')->nullable();
            $table->integer('estado_mantenimiento')->default(0);
            $table->string('costo', 100)->nullable();
            $table->string('plan', 100)->nullable();
            $table->string('garantia', 100)->nullable();
            $table->integer('estadoequipo_id');
            $table->string('archivo_invima', 250)->nullable();
            $table->string('manual', 250)->nullable();
            $table->text('plano')->nullable();
            $table->integer('necesidad_id')->nullable();
            $table->text('fecha_vencimiento_garantia')->nullable();
            $table->text('fecha_acta_recibo')->nullable();
            $table->text('fecha_inicio_operacion')->nullable();
            $table->text('fecha_fabricacion')->nullable();
            $table->text('accesorios')->nullable();
            $table->string('verificacion_inventario', 10)->default('NO')->nullable();
            $table->string('propiedad', 60)->nullable();
            $table->integer('propietario_id');
            $table->text('otros')->nullable();
            $table->text('fecha_recepcion_almacen')->nullable();
            $table->string('activo_comodato', 100)->nullable();
            $table->string('movilidad', 100)->nullable();
            $table->string('codigo_antiguo', 100)->nullable();
            $table->string('evaluacion_desempenio', 100)->nullable();
            $table->string('periodicidad', 100)->default('ANUAL')->nullable();
            $table->string('calibracion', 100)->nullable();
            $table->string('repuesto_pendiente', 10)->default('no')->nullable();
            $table->integer('area_id');
            $table->integer('tipo_id');
            $table->integer('guia_id');
            $table->integer('manual_id');
            $table->text('localizacion_actual')->nullable();
            $table->integer('disponibilidad_id');
            
            // Índices para optimización
            $table->index('servicio_id');
            $table->index('fuente_id');
            $table->index('tecnologia_id');
            $table->index('frecuencia_id');
            $table->index('cbiomedica_id');
            $table->index('criesgo_id');
            $table->index('tadquisicion_id');
            $table->index('invima_id');
            $table->index('orden_compra_id');
            $table->index('baja_id');
            $table->index('estado_mantenimiento');
            $table->index('estadoequipo_id');
            $table->index('propietario_id');
            $table->index('area_id');
            $table->index('tipo_id');
            $table->index('guia_id');
            $table->index('manual_id');
            $table->index('disponibilidad_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('equipos');
    }
};
