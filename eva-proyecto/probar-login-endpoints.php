<?php
echo "🔐 PROBANDO TODOS LOS ENDPOINTS DE LOGIN\n";
echo "=" . str_repeat("=", 50) . "\n\n";

try {
    $loginData = [
        'email' => 'bancodelechehumana.1@huv.go.com',
        'password' => '123456'
    ];
    
    $endpoints = [
        'http://localhost:8001/api/v1/login' => 'Login principal v1',
        'http://localhost:8001/auth/login' => 'Login robusto auth',
        'http://localhost:8001/api/login-working' => 'Login working', 
        'http://localhost:8001/api/test-login' => 'Test login',
        'http://localhost:8001/api/debug-login' => 'Debug login',
        'http://localhost:8001/api/v1/login-direct' => 'Login directo v1'
    ];
    
    $postData = json_encode($loginData);
    
    foreach ($endpoints as $url => $descripcion) {
        echo "🔍 Probando: $descripcion\n";
        echo "🔗 URL: $url\n";
        
        $context = stream_context_create([
            'http' => [
                'method' => 'POST',
                'header' => [
                    'Content-Type: application/json',
                    'Accept: application/json'
                ],
                'content' => $postData,
                'timeout' => 10
            ]
        ]);
        
        $response = @file_get_contents($url, false, $context);
        
        if ($response !== false) {
            $data = json_decode($response, true);
            
            if (isset($data['success']) && $data['success']) {
                echo "✅ ÉXITO!\n";
                
                // Verificar permisos
                $permissions = $data['permissions'] ?? $data['data']['permissions'] ?? null;
                if ($permissions) {
                    $modulosConAcceso = count(array_filter($permissions, function($p) { return $p['leer']; }));
                    echo "🎯 Permisos incluidos: $modulosConAcceso módulos\n";
                    
                    // Verificar módulos críticos
                    $criticos = ['equipos', 'tickets propios', 'correctivos'];
                    foreach ($criticos as $modulo) {
                        if (isset($permissions[$modulo]) && $permissions[$modulo]['leer']) {
                            $crear = $permissions[$modulo]['insertar'] ? ' + Crear' : '';
                            echo "   ✅ $modulo$crear\n";
                        }
                    }
                } else {
                    echo "⚠️ Sin permisos en respuesta\n";
                }
                
                echo "📋 Respuesta completa:\n";
                echo json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n";
                echo "\n" . str_repeat("=", 50) . "\n\n";
                break; // Salir al encontrar el primer login exitoso
                
            } else {
                echo "❌ Falló: " . ($data['message'] ?? 'Error desconocido') . "\n";
            }
        } else {
            $error = error_get_last();
            if (strpos($error['message'], '404') !== false) {
                echo "❌ 404 - Endpoint no encontrado\n";
            } else if (strpos($error['message'], '500') !== false) {
                echo "❌ 500 - Error interno del servidor\n";
            } else {
                echo "❌ Error de conexión\n";
            }
        }
        echo "\n";
    }
    
    echo "🔧 VERIFICANDO HASH DE CONTRASEÑA...\n";
    
    $pdo = new PDO("mysql:host=127.0.0.1;port=3306;dbname=gestionthuv;charset=utf8mb4", 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    $stmt = $pdo->prepare("SELECT password FROM usuarios WHERE email = ?");
    $stmt->execute([$loginData['email']]);
    $hashAlmacenado = $stmt->fetchColumn();
    
    if ($hashAlmacenado) {
        echo "🔐 Hash almacenado: " . substr($hashAlmacenado, 0, 30) . "...\n";
        
        // Probar contraseñas comunes
        $passwordsPosibles = ['123456', 'password', '12345678', 'admin', '1234', 'gloria', 'vargas'];
        
        echo "\n🎯 Probando contraseñas comunes...\n";
        foreach ($passwordsPosibles as $testPassword) {
            if (password_verify($testPassword, $hashAlmacenado)) {
                echo "✅ Contraseña encontrada: '$testPassword'\n";
                
                // Probar login con contraseña correcta
                echo "\n🔄 Reintentando login con contraseña correcta...\n";
                $correctLoginData = json_encode([
                    'email' => $loginData['email'],
                    'password' => $testPassword
                ]);
                
                // Probar con el endpoint más prometedor
                $bestUrl = 'http://localhost:8001/auth/login';
                $context = stream_context_create([
                    'http' => [
                        'method' => 'POST',
                        'header' => [
                            'Content-Type: application/json',
                            'Accept: application/json'
                        ],
                        'content' => $correctLoginData,
                        'timeout' => 10
                    ]
                ]);
                
                $response = @file_get_contents($bestUrl, false, $context);
                if ($response !== false) {
                    $data = json_decode($response, true);
                    if (isset($data['success']) && $data['success']) {
                        echo "🎉 ¡LOGIN EXITOSO CON CONTRASEÑA CORRECTA!\n";
                        
                        $permissions = $data['permissions'] ?? null;
                        if ($permissions) {
                            $modulosConAcceso = count(array_filter($permissions, function($p) { return $p['leer']; }));
                            echo "🎯 ¡PERMISOS CARGADOS CORRECTAMENTE: $modulosConAcceso módulos!\n";
                        } else {
                            echo "⚠️ Permisos no incluidos en respuesta\n";
                        }
                    }
                }
                break;
            }
        }
        
        if (!password_verify($testPassword ?? '', $hashAlmacenado)) {
            echo "❌ Ninguna contraseña común funciona\n";
            echo "💡 Puede necesitar resetear la contraseña del usuario\n";
        }
    }

} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
}

echo "\n🏁 FIN DE PRUEBAS DE LOGIN\n";
