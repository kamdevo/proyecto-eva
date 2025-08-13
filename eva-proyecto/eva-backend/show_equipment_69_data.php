<?php

/**
 * Mostrar datos completos del equipo ID 69 para confirmación
 */

require_once __DIR__ . '/vendor/autoload.php';
use Illuminate\Support\Facades\DB;

echo "📋 DATOS COMPLETOS DEL EQUIPO ID 69\n";
echo "===================================\n\n";

try {
    $app = require_once __DIR__ . '/bootstrap/app.php';
    $app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();
    
    $equipo = DB::table('equipos')->where('id', 69)->first();
    
    if (!$equipo) {
        echo "❌ Equipo ID 69 no encontrado\n";
        exit(1);
    }
    
    echo "✅ INFORMACIÓN BÁSICA:\n";
    echo "=====================\n";
    echo "ID: {$equipo->id}\n";
    echo "Nombre: {$equipo->name}\n";
    echo "Código: {$equipo->code}\n";
    echo "Serial: {$equipo->serial}\n";
    echo "Marca: {$equipo->marca}\n";
    echo "Modelo: {$equipo->modelo}\n";
    echo "Descripción: {$equipo->descripcion}\n";
    echo "Status: {$equipo->status}\n\n";
    
    echo "✅ IDs DE RELACIONES:\n";
    echo "====================\n";
    echo "servicio_id: {$equipo->servicio_id}\n";
    echo "area_id: {$equipo->area_id}\n";
    echo "propietario_id: {$equipo->propietario_id}\n";
    echo "estadoequipo_id: {$equipo->estadoequipo_id}\n";
    echo "sede_id: " . ($equipo->sede_id ?? 'NULL (se obtiene desde servicios)') . "\n";
    echo "tipo_id: {$equipo->tipo_id}\n";
    echo "cbiomedica_id: {$equipo->cbiomedica_id}\n";
    echo "criesgo_id: {$equipo->criesgo_id}\n";
    echo "fuente_id: {$equipo->fuente_id}\n";
    echo "tecnologia_id: {$equipo->tecnologia_id}\n";
    echo "frecuencia_id: {$equipo->frecuencia_id}\n";
    echo "tadquisicion_id: {$equipo->tadquisicion_id}\n";
    echo "invima_id: {$equipo->invima_id}\n";
    echo "orden_compra_id: {$equipo->orden_compra_id}\n";
    echo "baja_id: {$equipo->baja_id}\n";
    echo "guia_id: {$equipo->guia_id}\n";
    echo "manual_id: {$equipo->manual_id}\n";
    echo "necesidad_id: {$equipo->necesidad_id}\n";
    echo "disponibilidad_id: {$equipo->disponibilidad_id}\n\n";
    
    echo "✅ DATOS JSON (CHECKBOXES):\n";
    echo "===========================\n";
    echo "Manual JSON: {$equipo->manual}\n";
    echo "Plano JSON: {$equipo->plano}\n\n";
    
    // Parsear JSON para mostrar checkboxes
    if ($equipo->manual) {
        $manuales = json_decode($equipo->manual, true);
        echo "MANUALES (checkboxes):\n";
        foreach ($manuales as $key => $value) {
            $status = $value ? 'MARCADO ✓' : 'DESMARCADO ○';
            echo "   {$key}: {$status}\n";
        }
        echo "\n";
    }
    
    if ($equipo->plano) {
        $planos = json_decode($equipo->plano, true);
        echo "PLANOS (checkboxes):\n";
        foreach ($planos as $key => $value) {
            $status = $value ? 'MARCADO ✓' : 'DESMARCADO ○';
            echo "   {$key}: {$status}\n";
        }
        echo "\n";
    }
    
    echo "✅ NOMBRES DE LAS RELACIONES:\n";
    echo "============================\n";
    
    // Obtener nombres de las relaciones
    $servicio = DB::table('servicios')->where('id', $equipo->servicio_id)->first();
    echo "Servicio: " . ($servicio ? $servicio->name : 'NO ENCONTRADO') . "\n";
    
    $area = DB::table('areas')->where('id', $equipo->area_id)->first();
    echo "Área: " . ($area ? $area->name : 'NO ENCONTRADO') . "\n";
    
    $propietario = DB::table('propietarios')->where('id', $equipo->propietario_id)->first();
    echo "Propietario: " . ($propietario ? $propietario->nombre : 'NO ENCONTRADO') . "\n";
    
    $estado = DB::table('estadoequipos')->where('id', $equipo->estadoequipo_id)->first();
    echo "Estado: " . ($estado ? $estado->name : 'NO ENCONTRADO') . "\n";
    
    // Obtener sede desde servicios
    if ($servicio) {
        $sede = DB::table('sedes')->where('id', $servicio->sede_id)->first();
        echo "Sede: " . ($sede ? $sede->name : 'NO ENCONTRADO') . "\n";
    }
    
    echo "\n✅ FECHAS Y OTROS DATOS:\n";
    echo "=======================\n";
    echo "Fecha de creación: " . ($equipo->created_at ?? 'NULL') . "\n";
    echo "Fecha de cambio: " . ($equipo->fecha_cambio ?? 'NULL') . "\n";
    echo "Costo: " . ($equipo->costo ?? 'NULL') . "\n";
    echo "Vida útil: " . ($equipo->vida_util ?? 'NULL') . "\n";
    echo "Observación: " . ($equipo->observacion ?? 'NULL') . "\n";
    echo "Localización actual: " . ($equipo->localizacion_actual ?? 'NULL') . "\n";
    echo "Propiedad: " . ($equipo->propiedad ?? 'NULL') . "\n";
    echo "Invima: " . ($equipo->invima ?? 'NULL') . "\n";
    echo "Calibración: " . ($equipo->calibracion ?? 'NULL') . "\n";
    echo "Periodicidad: " . ($equipo->periodicidad ?? 'NULL') . "\n";
    echo "Verificación inventario: " . ($equipo->verificacion_inventario ?? 'NULL') . "\n";
    echo "Repuesto pendiente: " . ($equipo->repuesto_pendiente ?? 'NULL') . "\n";
    
    echo "\n🎯 RESUMEN PARA EL MODAL DE EDICIÓN:\n";
    echo "====================================\n";
    echo "Cuando abras el modal de edición, deberías ver:\n\n";
    
    echo "📝 CAMPOS DE TEXTO:\n";
    echo "   • Nombre: '{$equipo->name}'\n";
    echo "   • Serial: '{$equipo->serial}'\n";
    echo "   • Código: '{$equipo->code}'\n";
    echo "   • Marca: '{$equipo->marca}'\n";
    echo "   • Modelo: '{$equipo->modelo}'\n";
    echo "   • Descripción: '{$equipo->descripcion}'\n\n";
    
    echo "📋 DROPDOWNS (valores seleccionados, NO placeholders):\n";
    echo "   • Sede: '" . ($sede->name ?? 'ERROR') . "'\n";
    echo "   • Servicio: '" . ($servicio->name ?? 'ERROR') . "'\n";
    echo "   • Área: '" . ($area->name ?? 'ERROR') . "'\n";
    echo "   • Propietario: '" . ($propietario->nombre ?? 'ERROR') . "'\n";
    echo "   • Estado: '" . ($estado->name ?? 'ERROR') . "'\n\n";
    
    if ($equipo->manual) {
        $manuales = json_decode($equipo->manual, true);
        echo "☑️ CHECKBOXES MANUALES:\n";
        foreach ($manuales as $key => $value) {
            $status = $value ? 'MARCADO ✓' : 'DESMARCADO ○';
            echo "   • " . ucfirst($key) . ": {$status}\n";
        }
        echo "\n";
    }
    
    if ($equipo->plano) {
        $planos = json_decode($equipo->plano, true);
        echo "☑️ CHECKBOXES PLANOS:\n";
        foreach ($planos as $key => $value) {
            $status = $value ? 'MARCADO ✓' : 'DESMARCADO ○';
            echo "   • " . ucfirst($key) . ": {$status}\n";
        }
        echo "\n";
    }
    
    echo "🚀 INSTRUCCIONES DE VERIFICACIÓN:\n";
    echo "=================================\n";
    echo "1. Busca 'Test Registration Flow - EDITADO' en la lista de equipos\n";
    echo "2. Haz clic en el botón de editar (icono azul)\n";
    echo "3. Verifica que TODOS los campos muestren los valores listados arriba\n";
    echo "4. Los dropdowns NO deben mostrar '--SELECCIONE--' o 'Seleccione...'\n";
    echo "5. Los checkboxes deben estar en los estados exactos mostrados arriba\n";
    echo "6. Si todo coincide, ¡el modal de edición está funcionando perfectamente!\n";
    
} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
}

echo "\n📋 Consulta de datos del equipo ID 69 completada.\n";
