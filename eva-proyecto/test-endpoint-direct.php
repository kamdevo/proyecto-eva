<?php

// Script para probar directamente el endpoint de planes_mantenimientos

require_once 'eva-backend/vendor/autoload.php';

// Cargar configuración de Laravel
$app = require_once 'eva-backend/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;

try {
    echo "🔍 Probando endpoint GET planes-mantenimientos...\n";
    
    // Simular los mismos parámetros que envía el frontend
    $page = 1;
    $perPage = 10;
    $search = '';
    $equipoId = null;
    $status = null;
    
    echo "📋 Parámetros: page=$page, per_page=$perPage\n";
    
    // Ejecutar la misma consulta que el endpoint
    $query = DB::table('planes_mantenimientos')
        ->select('planes_mantenimientos.*')
        ->leftJoin('equipos', 'planes_mantenimientos.equipo_id', '=', 'equipos.id')
        ->selectRaw('equipos.name as equipo_name, equipos.code as equipo_code');
    
    if ($equipoId) {
        $query->where('planes_mantenimientos.equipo_id', $equipoId);
    }
    
    if ($search) {
        $query->where(function($q) use ($search) {
            $q->where('planes_mantenimientos.descripcion', 'LIKE', "%{$search}%")
              ->orWhere('planes_mantenimientos.tipo_mantenimiento', 'LIKE', "%{$search}%")
              ->orWhere('planes_mantenimientos.responsable', 'LIKE', "%{$search}%")
              ->orWhere('equipos.name', 'LIKE', "%{$search}%")
              ->orWhere('equipos.code', 'LIKE', "%{$search}%");
        });
    }
    
    if ($status && $status !== 'all') {
        switch ($status) {
            case 'programado':
                $query->where('planes_mantenimientos.estado', 'programado');
                break;
            case 'en_progreso':
                $query->where('planes_mantenimientos.estado', 'en_progreso');
                break;
            case 'completado':
                $query->where('planes_mantenimientos.estado', 'completado');
                break;
            case 'cancelado':
                $query->where('planes_mantenimientos.estado', 'cancelado');
                break;
            case 'reprogramado':
                $query->where('planes_mantenimientos.estado', 'reprogramado');
                break;
        }
    }
    
    $total = $query->count();
    echo "📊 Total de registros encontrados: $total\n";
    
    $preventivos = $query->orderBy('planes_mantenimientos.fecha_programada', 'desc')
                        ->offset(($page - 1) * $perPage)
                        ->limit($perPage)
                        ->get();
    
    echo "📊 Registros en esta página: " . $preventivos->count() . "\n";
    
    if ($preventivos->count() > 0) {
        echo "✅ Datos encontrados:\n";
        
        foreach ($preventivos as $index => $item) {
            echo "   Registro " . ($index + 1) . ":\n";
            echo "     - ID: {$item->id}\n";
            echo "     - Equipo ID: {$item->equipo_id}\n";
            echo "     - Tipo: " . ($item->tipo_mantenimiento ?? 'NULL') . "\n";
            echo "     - Descripción: " . substr($item->descripcion ?? 'NULL', 0, 50) . "...\n";
            echo "     - Estado: " . ($item->estado ?? 'NULL') . "\n";
            echo "     - Fecha programada: " . ($item->fecha_programada ?? 'NULL') . "\n";
            echo "     - Responsable: " . ($item->responsable ?? 'NULL') . "\n";
            echo "     - Equipo nombre: " . ($item->equipo_name ?? 'NULL') . "\n";
            echo "     - Equipo código: " . ($item->equipo_code ?? 'NULL') . "\n";
            echo "\n";
        }
        
        // Formatear datos como lo hace el endpoint
        $formattedData = $preventivos->map(function($item) {
            return [
                'id' => $item->id,
                'tipo_mantenimiento' => $item->tipo_mantenimiento ?? '',
                'descripcion' => $item->descripcion ?? '',
                'fecha_programada' => $item->fecha_programada ?? '',
                'fecha_mantenimiento' => $item->fecha_mantenimiento ?? null,
                'responsable' => $item->responsable ?? '',
                'estado' => $item->estado ?? 'programado',
                'observaciones' => $item->observaciones ?? '',
                'costo_estimado' => $item->costo_estimado ?? 0,
                'repuestos_necesarios' => $item->repuestos_necesarios ?? '',
                'frecuencia_dias' => $item->frecuencia_dias ?? null,
                'equipo_id' => $item->equipo_id,
                'equipo' => [
                    'name' => $item->equipo_name ?? '',
                    'code' => $item->equipo_code ?? ''
                ],
                'created_at' => $item->created_at ?? null,
                'updated_at' => $item->updated_at ?? null
            ];
        });
        
        $response = [
            'success' => true,
            'data' => [
                'data' => $formattedData,
                'current_page' => (int)$page,
                'per_page' => (int)$perPage,
                'total' => $total,
                'last_page' => ceil($total / $perPage)
            ]
        ];
        
        echo "📤 Respuesta JSON simulada:\n";
        echo json_encode($response, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n";
        
    } else {
        echo "⚠️  No se encontraron registros\n";
        
        // Verificar si hay registros en la tabla
        $totalInTable = DB::table('planes_mantenimientos')->count();
        echo "📊 Total de registros en la tabla: $totalInTable\n";
        
        if ($totalInTable > 0) {
            echo "🔍 Primeros 3 registros sin filtros:\n";
            $rawRecords = DB::table('planes_mantenimientos')->limit(3)->get();
            foreach ($rawRecords as $record) {
                echo "   - ID: {$record->id}, Equipo ID: {$record->equipo_id}\n";
            }
        }
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "📍 Línea: " . $e->getLine() . "\n";
}
