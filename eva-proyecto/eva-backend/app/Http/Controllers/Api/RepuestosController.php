<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\ConexionesVista\ApiController;
use App\ConexionesVista\ResponseFormatter;
use App\Models\Repuesto;
use App\Models\Equipo;
use App\Models\Proveedor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

/**
 * Controlador para gestión completa de repuestos
 * Maneja inventario, solicitudes y control de repuestos
 */
class RepuestosController extends ApiController
{
    /**
     * Obtener lista de repuestos con filtros
     */
        /**
     * @OA\GET(
     *     path="/api/repuestos",
     *     tags={"Repuestos"},
     *     summary="Listar repuestos",
     *     security={{"sanctum": {}}},
     *     @OA\Response(response=200, description="Operación exitosa"),
     *     @OA\Response(response=401, description="No autorizado"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     */
    public function index(Request $request)
    {
        try {
            $query = Repuesto::with([
                'equipo:id,name,code',
                'proveedor:id,nombre'
            ]);

            // Aplicar filtros
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('nombre', 'like', "%{$search}%")
                      ->orWhere('codigo', 'like', "%{$search}%")
                      ->orWhere('descripcion', 'like', "%{$search}%")
                      ->orWhere('numero_parte', 'like', "%{$search}%");
                });
            }

            if ($request->has('equipo_id')) {
                $query->where('equipo_id', $request->equipo_id);
            }

            if ($request->has('categoria')) {
                $query->where('categoria', $request->categoria);
            }

            if ($request->has('estado')) {
                $query->where('estado', $request->estado);
            }

            if ($request->has('proveedor_id')) {
                $query->where('proveedor_id', $request->proveedor_id);
            }

            if ($request->has('stock_minimo')) {
                $query->where('stock_actual', '<=', DB::raw('stock_minimo'));
            }

            if ($request->has('critico')) {
                $query->where('critico', $request->critico);
            }

            // Ordenamiento
            $orderBy = $request->get('order_by', 'nombre');
            $orderDirection = $request->get('order_direction', 'asc');
            $query->orderBy($orderBy, $orderDirection);

            // Paginación
            $perPage = $request->get('per_page', 15);
            $repuestos = $query->paginate($perPage);

            // Agregar información adicional
            $repuestos->getCollection()->transform(function ($repuesto) {
                $repuesto->necesita_reposicion = $repuesto->stock_actual <= $repuesto->stock_minimo;
                $repuesto->valor_total_stock = $repuesto->stock_actual * $repuesto->precio_unitario;
                
                if ($repuesto->imagen) {
                    $repuesto->imagen_url = Storage::disk('public')->url($repuesto->imagen);
                }
                
                return $repuesto;
            });

            return ResponseFormatter::success($repuestos, 'Repuestos obtenidos exitosamente');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener repuestos: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Crear nuevo repuesto
     */
        /**
     * @OA\POST(
     *     path="/api/repuestos",
     *     tags={"Repuestos"},
     *     summary="Crear nuevo repuesto",
     *     security={{"sanctum": {}}},
     *     @OA\Response(response=200, description="Operación exitosa"),
     *     @OA\Response(response=401, description="No autorizado"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nombre' => 'required|string|max:255',
            'codigo' => 'required|string|max:100|unique:repuestos,codigo',
            'descripcion' => 'nullable|string',
            'numero_parte' => 'nullable|string|max:100',
            'categoria' => 'required|string|max:100',
            'equipo_id' => 'nullable|exists:equipos,id',
            'proveedor_id' => 'nullable|exists:proveedores,id',
            'stock_actual' => 'required|integer|min:0',
            'stock_minimo' => 'required|integer|min:0',
            'stock_maximo' => 'nullable|integer|min:0',
            'precio_unitario' => 'required|numeric|min:0',
            'unidad_medida' => 'required|string|max:50',
            'ubicacion' => 'nullable|string|max:255',
            'critico' => 'nullable|boolean',
            'estado' => 'nullable|in:activo,inactivo,descontinuado',
            'imagen' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120'
        ]);

        if ($validator->fails()) {
            return ResponseFormatter::validation($validator->errors());
        }

        try {
            DB::beginTransaction();

            $repuestoData = $request->except(['imagen']);
            $repuestoData['estado'] = $repuestoData['estado'] ?? 'activo';
            $repuestoData['created_at'] = now();

            // Manejar imagen
            if ($request->hasFile('imagen')) {
                $image = $request->file('imagen');
                $imageName = 'repuestos/' . uniqid() . '.' . $image->getClientOriginalExtension();
                $imagePath = $image->storeAs('repuestos', $imageName, 'public');
                $repuestoData['imagen'] = $imagePath;
            }

            $repuesto = Repuesto::create($repuestoData);

            // Cargar relaciones para la respuesta
            $repuesto->load([
                'equipo:id,name,code',
                'proveedor:id,nombre'
            ]);

            if ($repuesto->imagen) {
                $repuesto->imagen_url = Storage::disk('public')->url($repuesto->imagen);
            }

            DB::commit();

            return ResponseFormatter::success($repuesto, 'Repuesto creado exitosamente', 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return ResponseFormatter::error('Error al crear repuesto: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Mostrar repuesto específico
     */
        /**
     * @OA\GET(
     *     path="/api/repuestos/{id}",
     *     tags={"Repuestos"},
     *     summary="Obtener repuesto específico",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(response=200, description="Operación exitosa"),
     *     @OA\Response(response=401, description="No autorizado"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     */
    public function show($id)
    {
        try {
            $repuesto = Repuesto::with([
                'equipo:id,name,code,servicio_id,area_id',
                'equipo.servicio:id,name',
                'equipo.area:id,name',
                'proveedor:id,nombre,telefono,email',
                'movimientos' => function($query) {
                    $query->orderBy('fecha', 'desc')->limit(10);
                }
            ])->findOrFail($id);

            // Agregar información adicional
            if ($repuesto->imagen) {
                $repuesto->imagen_url = Storage::disk('public')->url($repuesto->imagen);
            }

            $repuesto->necesita_reposicion = $repuesto->stock_actual <= $repuesto->stock_minimo;
            $repuesto->valor_total_stock = $repuesto->stock_actual * $repuesto->precio_unitario;

            return ResponseFormatter::success($repuesto, 'Repuesto obtenido exitosamente');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener repuesto: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Actualizar repuesto
     */
        /**
     * @OA\PUT(
     *     path="/api/repuestos/{id}",
     *     tags={"Repuestos"},
     *     summary="Actualizar repuesto",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(response=200, description="Operación exitosa"),
     *     @OA\Response(response=401, description="No autorizado"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'nombre' => 'required|string|max:255',
            'codigo' => 'required|string|max:100|unique:repuestos,codigo,' . $id,
            'descripcion' => 'nullable|string',
            'numero_parte' => 'nullable|string|max:100',
            'categoria' => 'required|string|max:100',
            'equipo_id' => 'nullable|exists:equipos,id',
            'proveedor_id' => 'nullable|exists:proveedores,id',
            'stock_actual' => 'required|integer|min:0',
            'stock_minimo' => 'required|integer|min:0',
            'stock_maximo' => 'nullable|integer|min:0',
            'precio_unitario' => 'required|numeric|min:0',
            'unidad_medida' => 'required|string|max:50',
            'ubicacion' => 'nullable|string|max:255',
            'critico' => 'nullable|boolean',
            'estado' => 'required|in:activo,inactivo,descontinuado',
            'imagen' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120'
        ]);

        if ($validator->fails()) {
            return ResponseFormatter::validation($validator->errors());
        }

        try {
            DB::beginTransaction();

            $repuesto = Repuesto::findOrFail($id);
            $repuestoData = $request->except(['imagen']);

            // Manejar actualización de imagen
            if ($request->hasFile('imagen')) {
                // Eliminar imagen anterior si existe
                if ($repuesto->imagen && Storage::disk('public')->exists($repuesto->imagen)) {
                    Storage::disk('public')->delete($repuesto->imagen);
                }

                $image = $request->file('imagen');
                $imageName = 'repuestos/' . uniqid() . '.' . $image->getClientOriginalExtension();
                $imagePath = $image->storeAs('repuestos', $imageName, 'public');
                $repuestoData['imagen'] = $imagePath;
            }

            $repuesto->update($repuestoData);

            // Cargar relaciones para la respuesta
            $repuesto->load([
                'equipo:id,name,code',
                'proveedor:id,nombre'
            ]);

            if ($repuesto->imagen) {
                $repuesto->imagen_url = Storage::disk('public')->url($repuesto->imagen);
            }

            DB::commit();

            return ResponseFormatter::success($repuesto, 'Repuesto actualizado exitosamente');

        } catch (\Exception $e) {
            DB::rollBack();
            return ResponseFormatter::error('Error al actualizar repuesto: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Eliminar repuesto
     */
        /**
     * @OA\DELETE(
     *     path="/api/repuestos/{id}",
     *     tags={"Repuestos"},
     *     summary="Eliminar repuesto",
     *     security={{"sanctum": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(response=200, description="Operación exitosa"),
     *     @OA\Response(response=401, description="No autorizado"),
     *     @OA\Response(response=500, description="Error interno del servidor")
     * )
     */
    public function destroy($id)
    {
        try {
            $repuesto = Repuesto::findOrFail($id);

            // Verificar si tiene movimientos
            if ($repuesto->movimientos()->count() > 0) {
                return ResponseFormatter::error(
                    'No se puede eliminar el repuesto porque tiene movimientos registrados', 
                    400
                );
            }

            // Eliminar imagen si existe
            if ($repuesto->imagen && Storage::disk('public')->exists($repuesto->imagen)) {
                Storage::disk('public')->delete($repuesto->imagen);
            }

            $repuesto->delete();

            return ResponseFormatter::success(null, 'Repuesto eliminado exitosamente');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al eliminar repuesto: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Registrar entrada de stock
     */
    public function entrada(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'cantidad' => 'required|integer|min:1',
            'motivo' => 'required|string|max:255',
            'documento' => 'nullable|string|max:100',
            'observaciones' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return ResponseFormatter::validation($validator->errors());
        }

        try {
            DB::beginTransaction();

            $repuesto = Repuesto::findOrFail($id);
            
            // Actualizar stock
            $repuesto->increment('stock_actual', $request->cantidad);

            // Registrar movimiento
            $repuesto->movimientos()->create([
                'tipo' => 'entrada',
                'cantidad' => $request->cantidad,
                'stock_anterior' => $repuesto->stock_actual - $request->cantidad,
                'stock_nuevo' => $repuesto->stock_actual,
                'motivo' => $request->motivo,
                'documento' => $request->documento,
                'observaciones' => $request->observaciones,
                'usuario_id' => auth()->id(),
                'fecha' => now()
            ]);

            DB::commit();

            return ResponseFormatter::success($repuesto, 'Entrada de stock registrada exitosamente');

        } catch (\Exception $e) {
            DB::rollBack();
            return ResponseFormatter::error('Error al registrar entrada: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Registrar salida de stock
     */
    public function salida(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'cantidad' => 'required|integer|min:1',
            'motivo' => 'required|string|max:255',
            'equipo_destino' => 'nullable|exists:equipos,id',
            'documento' => 'nullable|string|max:100',
            'observaciones' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return ResponseFormatter::validation($validator->errors());
        }

        try {
            DB::beginTransaction();

            $repuesto = Repuesto::findOrFail($id);
            
            // Verificar stock disponible
            if ($repuesto->stock_actual < $request->cantidad) {
                return ResponseFormatter::error('Stock insuficiente', 400);
            }

            // Actualizar stock
            $repuesto->decrement('stock_actual', $request->cantidad);

            // Registrar movimiento
            $repuesto->movimientos()->create([
                'tipo' => 'salida',
                'cantidad' => $request->cantidad,
                'stock_anterior' => $repuesto->stock_actual + $request->cantidad,
                'stock_nuevo' => $repuesto->stock_actual,
                'motivo' => $request->motivo,
                'equipo_destino' => $request->equipo_destino,
                'documento' => $request->documento,
                'observaciones' => $request->observaciones,
                'usuario_id' => auth()->id(),
                'fecha' => now()
            ]);

            DB::commit();

            return ResponseFormatter::success($repuesto, 'Salida de stock registrada exitosamente');

        } catch (\Exception $e) {
            DB::rollBack();
            return ResponseFormatter::error('Error al registrar salida: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Obtener repuestos con bajo stock
     */
    public function bajoStock()
    {
        try {
            $repuestos = Repuesto::with([
                'equipo:id,name,code',
                'proveedor:id,nombre'
            ])
            ->whereRaw('stock_actual <= stock_minimo')
            ->where('estado', 'activo')
            ->orderBy('stock_actual', 'asc')
            ->get();

            return ResponseFormatter::success($repuestos, 'Repuestos con bajo stock obtenidos');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener repuestos: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Obtener repuestos críticos
     */
    public function criticos()
    {
        try {
            $repuestos = Repuesto::with([
                'equipo:id,name,code',
                'proveedor:id,nombre'
            ])
            ->where('critico', true)
            ->where('estado', 'activo')
            ->orderBy('stock_actual', 'asc')
            ->get();

            return ResponseFormatter::success($repuestos, 'Repuestos críticos obtenidos');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener repuestos críticos: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Obtener estadísticas de repuestos
     */
    public function estadisticas()
    {
        try {
            $stats = [
                'total_repuestos' => Repuesto::where('estado', 'activo')->count(),
                'repuestos_bajo_stock' => Repuesto::whereRaw('stock_actual <= stock_minimo')
                    ->where('estado', 'activo')->count(),
                'repuestos_criticos' => Repuesto::where('critico', true)
                    ->where('estado', 'activo')->count(),
                'repuestos_agotados' => Repuesto::where('stock_actual', 0)
                    ->where('estado', 'activo')->count(),
                'valor_total_inventario' => Repuesto::where('estado', 'activo')
                    ->selectRaw('SUM(stock_actual * precio_unitario) as total')
                    ->value('total'),
                'por_categoria' => Repuesto::where('estado', 'activo')
                    ->groupBy('categoria')
                    ->selectRaw('categoria, count(*) as total, SUM(stock_actual * precio_unitario) as valor')
                    ->get(),
                'movimientos_recientes' => RepuestoMovimiento::with(['repuesto:id,nombre', 'usuario:id,nombre,apellido'])
                    ->orderBy('fecha', 'desc')
                    ->limit(10)
                    ->get(),
                'top_mas_utilizados' => RepuestoMovimiento::join('repuestos', 'repuesto_movimientos.repuesto_id', '=', 'repuestos.id')
                    ->where('repuesto_movimientos.tipo', 'salida')
                    ->where('repuesto_movimientos.fecha', '>=', now()->subMonths(3))
                    ->groupBy('repuestos.id', 'repuestos.nombre')
                    ->selectRaw('repuestos.id, repuestos.nombre, SUM(repuesto_movimientos.cantidad) as total_utilizado')
                    ->orderBy('total_utilizado', 'desc')
                    ->limit(10)
                    ->get()
            ];

            return ResponseFormatter::success($stats, 'Estadísticas de repuestos obtenidas');

        } catch (\Exception $e) {
            return ResponseFormatter::error('Error al obtener estadísticas: ' . $e->getMessage(), 500);
        }
    }
}
