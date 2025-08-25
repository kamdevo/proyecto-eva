<?php

// Debug the controller issue
require_once 'eva-backend/vendor/autoload.php';
$app = require_once 'eva-backend/bootstrap/app.php';

use Illuminate\Support\Facades\DB;
use App\Models\OrdenCompra;
use App\Models\TipoCompra;
use App\Models\ProveedorMantenimiento;

echo "🔍 DEBUGGING CONTROLLER ISSUES\n";
echo "=" . str_repeat("=", 50) . "\n\n";

try {
    echo "1. Testing basic database connection...\n";
    $count = DB::table('ordenes_compra')->count();
    echo "✅ Database connection OK - {$count} purchase orders found\n\n";

    echo "2. Testing OrdenCompra model...\n";
    try {
        $orden = OrdenCompra::first();
        if ($orden) {
            echo "✅ OrdenCompra model works - ID: {$orden->id}\n";
            echo "   Orden: {$orden->orden}\n";
            echo "   Fecha: {$orden->fecha}\n";
            echo "   Status: {$orden->status}\n";
        } else {
            echo "❌ No purchase orders found\n";
        }
    } catch (Exception $e) {
        echo "❌ OrdenCompra model error: " . $e->getMessage() . "\n";
    }

    echo "\n3. Testing relationships...\n";
    try {
        $orden = OrdenCompra::with(['proveedor', 'tipoCompra'])->first();
        if ($orden) {
            echo "✅ Relationships loaded\n";
            echo "   Proveedor: " . ($orden->proveedor ? $orden->proveedor->name : 'NULL') . "\n";
            echo "   Tipo Compra: " . ($orden->tipoCompra ? $orden->tipoCompra->tipo_compra : 'NULL') . "\n";
        }
    } catch (Exception $e) {
        echo "❌ Relationship error: " . $e->getMessage() . "\n";
    }

    echo "\n4. Testing ProveedorMantenimiento model...\n";
    try {
        $proveedor = ProveedorMantenimiento::first();
        if ($proveedor) {
            echo "✅ ProveedorMantenimiento model works - ID: {$proveedor->id}\n";
            echo "   Name: {$proveedor->name}\n";
        } else {
            echo "❌ No providers found\n";
        }
    } catch (Exception $e) {
        echo "❌ ProveedorMantenimiento model error: " . $e->getMessage() . "\n";
    }

    echo "\n5. Testing TipoCompra model...\n";
    try {
        $tipo = TipoCompra::first();
        if ($tipo) {
            echo "✅ TipoCompra model works - ID: {$tipo->id}\n";
            echo "   Tipo: {$tipo->tipo_compra}\n";
        } else {
            echo "❌ No purchase types found\n";
        }
    } catch (Exception $e) {
        echo "❌ TipoCompra model error: " . $e->getMessage() . "\n";
    }

    echo "\n6. Testing controller query simulation...\n";
    try {
        $query = OrdenCompra::with(['proveedor', 'tipoCompra'])
            ->select(['ordenes_compra.*']);
        
        $data = $query->orderBy('fecha', 'desc')
                      ->orderBy('created_at', 'desc')
                      ->limit(5)
                      ->get();
        
        echo "✅ Controller query works - " . count($data) . " records found\n";
        
        foreach ($data as $orden) {
            echo "   ID: {$orden->id} | Orden: {$orden->orden} | Status: {$orden->status}\n";
        }
        
    } catch (Exception $e) {
        echo "❌ Controller query error: " . $e->getMessage() . "\n";
        echo "   Stack trace: " . $e->getTraceAsString() . "\n";
    }

} catch (Exception $e) {
    echo "❌ FATAL ERROR: " . $e->getMessage() . "\n";
    echo "Stack trace: " . $e->getTraceAsString() . "\n";
}

echo "\n🔚 Debug complete\n";
