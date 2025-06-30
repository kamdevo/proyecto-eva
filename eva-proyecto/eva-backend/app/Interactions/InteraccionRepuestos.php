<?php

namespace App\Interactions;

use App\Models\Repuesto;
use App\Models\Equipo;
use App\Models\MovimientoInventario;
use App\ConexionesVista\ResponseFormatter;
use App\Events\SparePart\SparePartManaged;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

/**
 * Clase de interacción para gestión de repuestos
 * Maneja operaciones complejas relacionadas con inventario de repuestos
 */
class InteraccionRepuestos
{
    /**
     * Gestionar entrada de repuestos al inventario
     */
    public static function gestionarEntradaRepuestos($datos)
    {
        try {
            DB::beginTransaction();

            $repuesto = Repuesto::findOrFail($datos['repuesto_id']);

            // Crear movimiento de inventario
            $movimiento = MovimientoInventario::create([
                'repuesto_id' => $repuesto->id,
                'tipo_movimiento' => 'entrada',
                'cantidad' => $datos['cantidad'],
                'cantidad_anterior' => $repuesto->stock_actual,
                'cantidad_nueva' => $repuesto->stock_actual + $datos['cantidad'],
                'motivo' => $datos['motivo'] ?? 'Compra de repuestos',
                'numero_factura' => $datos['numero_factura'] ?? null,
                'proveedor' => $datos['proveedor'] ?? null,
                'costo_unitario' => $datos['costo_unitario'] ?? $repuesto->costo_promedio,
                'costo_total' => ($datos['costo_unitario'] ?? $repuesto->costo_promedio) * $datos['cantidad'],
                'usuario_id' => auth()->id(),
                'fecha_movimiento' => now(),
                'observaciones' => $datos['observaciones'] ?? null
            ]);

            // Actualizar stock del repuesto
            $nuevoStock = $repuesto->stock_actual + $datos['cantidad'];
            $nuevoCostoPromedio = self::calcularCostoPromedio(
                $repuesto->stock_actual,
                $repuesto->costo_promedio,
                $datos['cantidad'],
                $datos['costo_unitario'] ?? $repuesto->costo_promedio
            );

            $repuesto->update([
                'stock_actual' => $nuevoStock,
                'costo_promedio' => $nuevoCostoPromedio,
                'fecha_ultima_entrada' => now(),
                'valor_inventario' => $nuevoStock * $nuevoCostoPromedio
            ]);

            // Verificar si sale del estado de stock bajo
            if ($repuesto->stock_actual >= $repuesto->stock_minimo && $repuesto->estado_stock === 'bajo') {
                $repuesto->update(['estado_stock' => 'normal']);
            }

            // Disparar evento
            event(new SparePartManaged($repuesto, 'entrada', $datos, auth()->user()));

            DB::commit();

            return ResponseFormatter::success([
                'repuesto' => $repuesto,
                'movimiento' => $movimiento
            ], 'Entrada de repuestos registrada exitosamente');

        } catch (\Exception $e) {
            DB::rollBack();
            return ResponseFormatter::error('Error al registrar entrada: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Gestionar salida de repuestos del inventario
     */
    public static function gestionarSalidaRepuestos($datos)
    {
        try {
            DB::beginTransaction();

            $repuesto = Repuesto::findOrFail($datos['repuesto_id']);

            // Verificar stock disponible
            if ($repuesto->stock_actual < $datos['cantidad']) {
                return ResponseFormatter::error('Stock insuficiente. Disponible: ' . $repuesto->stock_actual, 400);
            }

            // Crear movimiento de inventario
            $movimiento = MovimientoInventario::create([
                'repuesto_id' => $repuesto->id,
                'tipo_movimiento' => 'salida',
                'cantidad' => $datos['cantidad'],
                'cantidad_anterior' => $repuesto->stock_actual,
                'cantidad_nueva' => $repuesto->stock_actual - $datos['cantidad'],
                'motivo' => $datos['motivo'] ?? 'Uso en mantenimiento',
                'equipo_id' => $datos['equipo_id'] ?? null,
                'orden_trabajo' => $datos['orden_trabajo'] ?? null,
                'costo_unitario' => $repuesto->costo_promedio,
                'costo_total' => $repuesto->costo_promedio * $datos['cantidad'],
                'usuario_id' => auth()->id(),
                'fecha_movimiento' => now(),
                'observaciones' => $datos['observaciones'] ?? null
            ]);

            // Actualizar stock del repuesto
            $nuevoStock = $repuesto->stock_actual - $datos['cantidad'];
            
            $repuesto->update([
                'stock_actual' => $nuevoStock,
                'fecha_ultima_salida' => now(),
                'valor_inventario' => $nuevoStock * $repuesto->costo_promedio
            ]);

            // Verificar estado de stock
            $nuevoEstado = self::determinarEstadoStock($repuesto, $nuevoStock);
            if ($nuevoEstado !== $repuesto->estado_stock) {
                $repuesto->update(['estado_stock' => $nuevoEstado]);
                
                // Crear alerta si es necesario
                if ($nuevoEstado === 'bajo') {
                    self::crearAlertaStockBajo($repuesto);
                } elseif ($nuevoEstado === 'agotado') {
                    self::crearAlertaStockAgotado($repuesto);
                }
            }

            // Disparar evento
            event(new SparePartManaged($repuesto, 'salida', $datos, auth()->user()));

            DB::commit();

            return ResponseFormatter::success([
                'repuesto' => $repuesto,
                'movimiento' => $movimiento
            ], 'Salida de repuestos registrada exitosamente');

        } catch (\Exception $e) {
            DB::rollBack();
            return ResponseFormatter::error('Error al registrar salida: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Realizar inventario físico
     */
    public static function realizarInventarioFisico($datos)
    {
        try {
            DB::beginTransaction();

            $resultados = [];
            $diferenciasEncontradas = 0;

            foreach ($datos['repuestos'] as $item) {
                $repuesto = Repuesto::findOrFail($item['repuesto_id']);
                $stockSistema = $repuesto->stock_actual;
                $stockFisico = $item['stock_fisico'];
                $diferencia = $stockFisico - $stockSistema;

                if ($diferencia != 0) {
                    // Crear movimiento de ajuste
                    $movimiento = MovimientoInventario::create([
                        'repuesto_id' => $repuesto->id,
                        'tipo_movimiento' => $diferencia > 0 ? 'ajuste_positivo' : 'ajuste_negativo',
                        'cantidad' => abs($diferencia),
                        'cantidad_anterior' => $stockSistema,
                        'cantidad_nueva' => $stockFisico,
                        'motivo' => 'Ajuste por inventario físico',
                        'costo_unitario' => $repuesto->costo_promedio,
                        'costo_total' => abs($diferencia) * $repuesto->costo_promedio,
                        'usuario_id' => auth()->id(),
                        'fecha_movimiento' => now(),
                        'observaciones' => $item['observaciones'] ?? 'Ajuste automático por inventario físico'
                    ]);

                    // Actualizar repuesto
                    $repuesto->update([
                        'stock_actual' => $stockFisico,
                        'fecha_ultimo_inventario' => now(),
                        'valor_inventario' => $stockFisico * $repuesto->costo_promedio
                    ]);

                    $diferenciasEncontradas++;
                }

                $resultados[] = [
                    'repuesto_id' => $repuesto->id,
                    'nombre' => $repuesto->nombre,
                    'stock_sistema' => $stockSistema,
                    'stock_fisico' => $stockFisico,
                    'diferencia' => $diferencia,
                    'ajustado' => $diferencia != 0
                ];
            }

            // Crear registro de inventario
            $inventario = DB::table('inventarios_fisicos')->insert([
                'fecha_inventario' => now(),
                'realizado_por' => auth()->id(),
                'total_repuestos' => count($datos['repuestos']),
                'diferencias_encontradas' => $diferenciasEncontradas,
                'observaciones' => $datos['observaciones'] ?? null,
                'created_at' => now()
            ]);

            DB::commit();

            return ResponseFormatter::success([
                'resultados' => $resultados,
                'resumen' => [
                    'total_repuestos' => count($datos['repuestos']),
                    'diferencias_encontradas' => $diferenciasEncontradas,
                    'porcentaje_exactitud' => (count($datos['repuestos']) - $diferenciasEncontradas) / count($datos['repuestos']) * 100
                ]
            ], 'Inventario físico completado');

        } catch (\Exception $e) {
            DB::rollBack();
            return ResponseFormatter::error('Error al realizar inventario: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Obtener repuestos con stock bajo
     */
    public static function obtenerRepuestosStockBajo()
    {
        try {
            $repuestos = Repuesto::where('stock_actual', '<=', DB::raw('stock_minimo'))
                ->orWhere('estado_stock', 'bajo')
                ->with(['categoria', 'proveedor'])
                ->orderBy('stock_actual', 'asc')
                ->get();

            $repuestosFormateados = $repuestos->map(function($repuesto) {
                return [
                    'id' => $repuesto->id,
                    'nombre' => $repuesto->nombre,
                    'codigo' => $repuesto->codigo,
                    'categoria' => $repuesto->categoria?->nombre,
                    'stock_actual' => $repuesto->stock_actual,
                    'stock_minimo' => $repuesto->stock_minimo,
                    'diferencia' => $repuesto->stock_minimo - $repuesto->stock_actual,
                    'estado_stock' => $repuesto->estado_stock,
                    'costo_reposicion' => ($repuesto->stock_minimo - $repuesto->stock_actual) * $repuesto->costo_promedio,
                    'proveedor' => $repuesto->proveedor?->nombre,
                    'dias_sin_stock' => $repuesto->stock_actual == 0 ? 
                        ($repuesto->fecha_ultima_salida ? now()->diffInDays($repuesto->fecha_ultima_salida) : 0) : 0
                ];
            });

            return ResponseFormatter::success($repuestosFormateados, 'Repuestos con stock bajo obtenidos');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener repuestos: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Generar orden de compra automática
     */
    public static function generarOrdenCompraAutomatica($repuestosIds = null)
    {
        try {
            $query = Repuesto::with(['proveedor'])
                ->where('stock_actual', '<=', DB::raw('stock_minimo'));

            if ($repuestosIds) {
                $query->whereIn('id', $repuestosIds);
            }

            $repuestos = $query->get();

            if ($repuestos->isEmpty()) {
                return ResponseFormatter::error('No hay repuestos que requieran reposición', 400);
            }

            // Agrupar por proveedor
            $repuestosPorProveedor = $repuestos->groupBy('proveedor_id');

            $ordenesGeneradas = [];

            foreach ($repuestosPorProveedor as $proveedorId => $repuestosProveedor) {
                $orden = [
                    'numero_orden' => 'OC-' . now()->format('YmdHis') . '-' . $proveedorId,
                    'proveedor_id' => $proveedorId,
                    'proveedor_nombre' => $repuestosProveedor->first()->proveedor?->nombre ?? 'Sin proveedor',
                    'fecha_orden' => now(),
                    'estado' => 'pendiente',
                    'items' => [],
                    'total' => 0
                ];

                foreach ($repuestosProveedor as $repuesto) {
                    $cantidadSugerida = max(
                        $repuesto->stock_minimo - $repuesto->stock_actual,
                        $repuesto->stock_maximo - $repuesto->stock_actual
                    );

                    $item = [
                        'repuesto_id' => $repuesto->id,
                        'nombre' => $repuesto->nombre,
                        'codigo' => $repuesto->codigo,
                        'cantidad_sugerida' => $cantidadSugerida,
                        'costo_unitario' => $repuesto->costo_promedio,
                        'subtotal' => $cantidadSugerida * $repuesto->costo_promedio
                    ];

                    $orden['items'][] = $item;
                    $orden['total'] += $item['subtotal'];
                }

                $ordenesGeneradas[] = $orden;
            }

            return ResponseFormatter::success($ordenesGeneradas, 'Órdenes de compra generadas automáticamente');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al generar órdenes: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Calcular costo promedio ponderado
     */
    private static function calcularCostoPromedio($stockAnterior, $costoAnterior, $cantidadNueva, $costoNuevo)
    {
        if ($stockAnterior + $cantidadNueva == 0) {
            return $costoNuevo;
        }

        return (($stockAnterior * $costoAnterior) + ($cantidadNueva * $costoNuevo)) / ($stockAnterior + $cantidadNueva);
    }

    /**
     * Determinar estado de stock
     */
    private static function determinarEstadoStock($repuesto, $stockActual)
    {
        if ($stockActual == 0) {
            return 'agotado';
        } elseif ($stockActual <= $repuesto->stock_minimo) {
            return 'bajo';
        } elseif ($stockActual >= $repuesto->stock_maximo) {
            return 'exceso';
        } else {
            return 'normal';
        }
    }

    /**
     * Crear alerta de stock bajo
     */
    private static function crearAlertaStockBajo($repuesto)
    {
        DB::table('system_alerts')->insert([
            'type' => 'stock_bajo',
            'title' => 'Stock Bajo',
            'message' => "El repuesto '{$repuesto->nombre}' tiene stock bajo: {$repuesto->stock_actual} unidades",
            'severity' => 'medium',
            'status' => 'active',
            'data' => json_encode([
                'repuesto_id' => $repuesto->id,
                'stock_actual' => $repuesto->stock_actual,
                'stock_minimo' => $repuesto->stock_minimo
            ]),
            'expires_at' => now()->addDays(7),
            'created_at' => now(),
            'updated_at' => now()
        ]);
    }

    /**
     * Crear alerta de stock agotado
     */
    private static function crearAlertaStockAgotado($repuesto)
    {
        DB::table('system_alerts')->insert([
            'type' => 'stock_agotado',
            'title' => 'Stock Agotado',
            'message' => "El repuesto '{$repuesto->nombre}' está agotado",
            'severity' => 'high',
            'status' => 'active',
            'data' => json_encode([
                'repuesto_id' => $repuesto->id,
                'stock_minimo' => $repuesto->stock_minimo
            ]),
            'expires_at' => now()->addDays(3),
            'created_at' => now(),
            'updated_at' => now()
        ]);
    }
}
