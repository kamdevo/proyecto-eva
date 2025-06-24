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
        if (!Schema::hasTable('repuestos')) {
            Schema::create('repuestos', function (Blueprint $table) {
                $table->id();
                $table->string('nombre');
                $table->string('codigo', 100)->unique();
                $table->text('descripcion')->nullable();
                $table->string('numero_parte', 100)->nullable();
                $table->string('categoria', 100);
                $table->unsignedBigInteger('equipo_id')->nullable();
                $table->unsignedBigInteger('proveedor_id')->nullable();
                $table->integer('stock_actual')->default(0);
                $table->integer('stock_minimo')->default(0);
                $table->integer('stock_maximo')->nullable();
                $table->decimal('precio_unitario', 10, 2);
                $table->string('unidad_medida', 50);
                $table->string('ubicacion')->nullable();
                $table->boolean('critico')->default(false);
                $table->enum('estado', ['activo', 'inactivo', 'descontinuado'])->default('activo');
                $table->string('imagen')->nullable();
                $table->text('observaciones')->nullable();
                $table->timestamps();

                // Claves foráneas
                $table->foreign('equipo_id')->references('id')->on('equipos')->onDelete('set null');
                $table->foreign('proveedor_id')->references('id')->on('proveedores')->onDelete('set null');
                
                $table->index(['categoria']);
                $table->index(['estado']);
                $table->index(['critico']);
                $table->index(['stock_actual', 'stock_minimo']);
            });
        }

        // Tabla para movimientos de repuestos
        if (!Schema::hasTable('repuesto_movimientos')) {
            Schema::create('repuesto_movimientos', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('repuesto_id');
                $table->enum('tipo', ['entrada', 'salida']);
                $table->integer('cantidad');
                $table->integer('stock_anterior');
                $table->integer('stock_nuevo');
                $table->string('motivo');
                $table->unsignedBigInteger('equipo_destino')->nullable();
                $table->string('documento', 100)->nullable();
                $table->text('observaciones')->nullable();
                $table->unsignedBigInteger('usuario_id');
                $table->timestamp('fecha');
                $table->timestamps();

                $table->foreign('repuesto_id')->references('id')->on('repuestos')->onDelete('cascade');
                $table->foreign('equipo_destino')->references('id')->on('equipos')->onDelete('set null');
                $table->foreign('usuario_id')->references('id')->on('usuarios')->onDelete('cascade');
                
                $table->index(['repuesto_id', 'fecha']);
                $table->index(['tipo']);
            });
        }

        // Tabla para solicitudes de repuestos
        if (!Schema::hasTable('repuesto_solicitudes')) {
            Schema::create('repuesto_solicitudes', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('repuesto_id');
                $table->unsignedBigInteger('usuario_solicita');
                $table->integer('cantidad_solicitada');
                $table->string('motivo');
                $table->text('justificacion')->nullable();
                $table->enum('estado', ['pendiente', 'aprobada', 'rechazada', 'entregada'])->default('pendiente');
                $table->unsignedBigInteger('usuario_aprueba')->nullable();
                $table->timestamp('fecha_solicitud');
                $table->timestamp('fecha_aprobacion')->nullable();
                $table->timestamp('fecha_entrega')->nullable();
                $table->text('observaciones')->nullable();
                $table->timestamps();

                $table->foreign('repuesto_id')->references('id')->on('repuestos')->onDelete('cascade');
                $table->foreign('usuario_solicita')->references('id')->on('usuarios')->onDelete('cascade');
                $table->foreign('usuario_aprueba')->references('id')->on('usuarios')->onDelete('set null');
                
                $table->index(['estado']);
                $table->index(['fecha_solicitud']);
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('repuesto_solicitudes');
        Schema::dropIfExists('repuesto_movimientos');
        Schema::dropIfExists('repuestos');
    }
};
