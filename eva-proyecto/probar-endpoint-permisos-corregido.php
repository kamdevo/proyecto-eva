<?php
echo "🔧 PROBANDO ENDPOINT DE PERMISOS CORREGIDO\n";
echo "=" . str_repeat("=", 50) . "\n\n";

try {
    $userId = 237;
    $url = "http://localhost:8001/api/v1/usuarios/$userId/permissions";
    
    echo "1️⃣ PROBANDO NUEVO ENDPOINT...\n";
    echo "🔗 URL: $url\n";
    echo "👤 Usuario ID: $userId\n\n";

    $context = stream_context_create([
        'http' => [
            'method' => 'GET',
            'header' => [
                'Accept: application/json',
                'Content-Type: application/json'
            ],
            'timeout' => 10
        ]
    ]);

    echo "⏳ Enviando petición...\n";
    
    $response = file_get_contents($url, false, $context);
    
    if ($response !== false) {
        $data = json_decode($response, true);
        
        echo "✅ RESPUESTA EXITOSA:\n";
        echo json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n\n";
        
        if (isset($data['success']) && $data['success'] && isset($data['data'])) {
            $permissions = $data['data'];
            echo "📊 ANÁLISIS DE PERMISOS:\n";
            echo "   📂 Total de permisos: " . count($permissions) . "\n\n";
            
            if (count($permissions) > 0) {
                echo "🎯 PERMISOS IMPORTANTES:\n";
                
                $modulosImportantes = ['equipos', 'tickets propios', 'correctivos', 'servicios', 'areas'];
                foreach ($modulosImportantes as $modulo) {
                    $permiso = array_filter($permissions, function($p) use ($modulo) {
                        return $p['modulo_name'] === $modulo;
                    });
                    
                    if (!empty($permiso)) {
                        $p = array_values($permiso)[0];
                        $acciones = [];
                        if ($p['leer']) $acciones[] = 'Leer';
                        if ($p['insertar']) $acciones[] = 'Crear';
                        if ($p['editar']) $acciones[] = 'Editar';
                        if ($p['eliminar']) $acciones[] = 'Eliminar';
                        
                        $accionesStr = empty($acciones) ? 'Sin acceso' : implode(', ', $acciones);
                        echo "   ✅ $modulo: $accionesStr\n";
                    } else {
                        echo "   ❌ $modulo: No configurado\n";
                    }
                }
                
                echo "\n📋 TODOS LOS MÓDULOS CON ACCESO:\n";
                $modulosConAcceso = array_filter($permissions, function($p) {
                    return $p['leer'] == 1;
                });
                
                foreach ($modulosConAcceso as $modulo) {
                    $acciones = [];
                    if ($modulo['leer']) $acciones[] = '👁️';
                    if ($modulo['insertar']) $acciones[] = '➕';
                    if ($modulo['editar']) $acciones[] = '✏️';
                    if ($modulo['eliminar']) $acciones[] = '🗑️';
                    
                    echo "   🔹 {$modulo['modulo_name']}: " . implode('', $acciones) . "\n";
                }
                
                echo "\n🎉 ¡PERMISOS CARGADOS CORRECTAMENTE!\n";
                echo "💡 Ahora el sidebar debería mostrar " . count($modulosConAcceso) . " módulos\n";
                
            } else {
                echo "❌ Array de permisos vacío\n";
                echo "💡 El usuario no tiene permisos asignados\n";
            }
            
        } else {
            echo "❌ Respuesta sin éxito o sin datos\n";
            echo "Mensaje: " . ($data['message'] ?? 'Sin mensaje') . "\n";
        }
        
    } else {
        echo "❌ Error en la petición HTTP\n";
        $error = error_get_last();
        if ($error) {
            echo "Error: " . $error['message'] . "\n";
        }
    }

    echo "\n2️⃣ PROBANDO TAMBIÉN EL ENDPOINT ADMIN...\n";
    
    $adminUrl = "http://localhost:8001/api/v1/admin/users/$userId/permissions";
    echo "🔗 Admin URL: $adminUrl\n";
    
    $adminResponse = @file_get_contents($adminUrl, false, $context);
    
    if ($adminResponse !== false) {
        $adminData = json_decode($adminResponse, true);
        if (isset($adminData['success']) && $adminData['success']) {
            echo "✅ Admin endpoint también funciona (" . count($adminData['data']) . " permisos)\n";
        }
    } else {
        echo "⚠️ Admin endpoint no respondió\n";
    }

    echo "\n3️⃣ RESULTADO FINAL:\n";
    if ($response !== false) {
        $data = json_decode($response, true);
        if (isset($data['success']) && $data['success'] && count($data['data']) > 0) {
            echo "🎉 ¡PROBLEMA RESUELTO!\n";
            echo "   ✅ Endpoint funciona correctamente\n";
            echo "   ✅ Permisos se cargan desde BD\n";
            echo "   ✅ Frontend debería mostrar sidebar\n";
            echo "   ✅ Usuario 237 tiene " . count($data['data']) . " permisos configurados\n";
        } else {
            echo "⚠️ Endpoint funciona pero sin permisos\n";
            echo "💡 Verificar que el usuario tenga permisos en la tabla acciones\n";
        }
    } else {
        echo "❌ Endpoint no funciona\n";
        echo "💡 Verificar configuración del servidor Laravel\n";
    }

} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
}

echo "\n🏁 FIN DE LA PRUEBA\n";
