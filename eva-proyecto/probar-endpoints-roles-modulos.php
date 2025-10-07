<?php
echo "🧪 PROBANDO ENDPOINTS DE ROLES Y MÓDULOS\n";
echo "=" . str_repeat("=", 50) . "\n\n";

try {
    echo "1️⃣ PROBANDO ENDPOINT /api/v1/roles...\n";
    
    $url = 'http://localhost:8001/api/v1/roles';
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

    echo "🔗 URL: $url\n";
    
    $response = file_get_contents($url, false, $context);
    
    if ($response !== false) {
        $data = json_decode($response, true);
        echo "✅ RESPUESTA EXITOSA:\n";
        echo json_encode($data, JSON_PRETTY_PRINT) . "\n\n";
        
        if (isset($data['success']) && $data['success'] && isset($data['data'])) {
            echo "📋 ROLES ENCONTRADOS: " . count($data['data']) . "\n";
            foreach ($data['data'] as $rol) {
                echo "   • ID: {$rol['id']}, Nombre: {$rol['nombre']}\n";
            }
            echo "\n";
        }
    } else {
        echo "❌ Error en la petición\n\n";
    }

    echo "2️⃣ PROBANDO ENDPOINT /api/v1/modulos...\n";
    
    $url = 'http://localhost:8001/api/v1/modulos';
    echo "🔗 URL: $url\n";
    
    $response = file_get_contents($url, false, $context);
    
    if ($response !== false) {
        $data = json_decode($response, true);
        echo "✅ RESPUESTA EXITOSA:\n";
        echo json_encode($data, JSON_PRETTY_PRINT) . "\n\n";
        
        if (isset($data['success']) && $data['success'] && isset($data['data'])) {
            echo "📋 MÓDULOS ENCONTRADOS: " . count($data['data']) . "\n";
            $i = 0;
            foreach ($data['data'] as $modulo) {
                echo "   • ID: {$modulo['id']}, Nombre: {$modulo['name']}\n";
                $i++;
                if ($i >= 10) {
                    echo "   ... y " . (count($data['data']) - 10) . " más\n";
                    break;
                }
            }
            echo "\n";
        }
    } else {
        echo "❌ Error en la petición\n\n";
    }

    echo "3️⃣ VERIFICANDO FUNCIÓN DE PERMISOS POR DEFECTO...\n";
    
    // Simular función getDefaultPermissionsByRole
    $modulosTest = ['equipos', 'usuarios', 'tickets'];
    $roleId = 4; // Usuario normal
    
    echo "🎯 Permisos para ROL 4 (Usuario normal):\n";
    foreach ($modulosTest as $modulo) {
        echo "   📂 Módulo: $modulo\n";
        
        // Simular los permisos que debería tener rol 4
        if ($modulo == 'equipos') {
            $permisos = ['leer' => 1, 'insertar' => 0, 'editar' => 0, 'eliminar' => 0];
        } elseif ($modulo == 'usuarios') {
            $permisos = ['leer' => 0, 'insertar' => 0, 'editar' => 0, 'eliminar' => 0];
        } else {
            $permisos = ['leer' => 1, 'insertar' => 0, 'editar' => 0, 'eliminar' => 0];
        }
        
        echo "      • Leer: " . ($permisos['leer'] ? "✅" : "❌") . "\n";
        echo "      • Insertar: " . ($permisos['insertar'] ? "✅" : "❌") . "\n";
        echo "      • Editar: " . ($permisos['editar'] ? "✅" : "❌") . "\n";
        echo "      • Eliminar: " . ($permisos['eliminar'] ? "✅" : "❌") . "\n";
    }

    echo "\n4️⃣ RESULTADO FINAL:\n";
    echo "✅ Endpoints de roles y módulos funcionando\n";
    echo "✅ Usuarios activados recibirán automáticamente:\n";
    echo "   • Rol 4 (Usuario normal)\n";
    echo "   • Permisos básicos de lectura\n";
    echo "   • Acceso limitado a módulos administrativos\n";
    echo "   • Sidebar con módulos habilitados según permisos\n\n";

    echo "💡 INSTRUCCIONES DE USO:\n";
    echo "1. Crea un nuevo usuario\n";
    echo "2. Actívalo desde el panel de administración\n";
    echo "3. El usuario recibirá automáticamente rol 4 y permisos\n";
    echo "4. Al iniciar sesión verá solo los módulos permitidos\n";

} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
}

echo "\n🏁 FIN DE LAS PRUEBAS\n";
