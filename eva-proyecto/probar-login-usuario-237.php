<?php
echo "🔐 PROBANDO LOGIN DEL USUARIO 237\n";
echo "=" . str_repeat("=", 50) . "\n\n";

try {
    echo "1️⃣ SIMULANDO LOGIN CON USUARIO ACTIVADO...\n";
    
    $loginData = [
        'email' => 'bancodelechehumana.1@huv.go.com',
        'password' => '123456'  // Asumiendo contraseña por defecto
    ];
    
    $url = 'http://localhost:8001/api/login';
    $postData = json_encode($loginData);

    echo "🔗 URL: $url\n";
    echo "📧 Email: {$loginData['email']}\n";
    echo "📋 Método: POST\n\n";

    $context = stream_context_create([
        'http' => [
            'method' => 'POST',
            'header' => [
                'Content-Type: application/json',
                'Accept: application/json'
            ],
            'content' => $postData,
            'timeout' => 15
        ]
    ]);

    echo "⏳ Enviando petición de login...\n";
    
    $response = file_get_contents($url, false, $context);
    
    if ($response === false) {
        echo "❌ Error en la petición de login\n";
        
        // Probar endpoint alternativo
        echo "\n2️⃣ PROBANDO ENDPOINT ALTERNATIVO...\n";
        $url = 'http://localhost:8001/test-login';
        echo "🔗 URL alternativa: $url\n";
        
        $context = stream_context_create([
            'http' => [
                'method' => 'POST',
                'header' => [
                    'Content-Type: application/json',
                    'Accept: application/json'
                ],
                'content' => $postData,
                'timeout' => 15
            ]
        ]);
        
        $response = file_get_contents($url, false, $context);
    }
    
    if ($response !== false) {
        $data = json_decode($response, true);
        
        echo "✅ RESPUESTA DEL LOGIN:\n";
        echo json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n\n";
        
        if (isset($data['success']) && $data['success']) {
            echo "3️⃣ ANÁLISIS DE LA RESPUESTA:\n";
            
            // Verificar token
            if (isset($data['token']) || isset($data['data']['token'])) {
                $token = $data['token'] ?? $data['data']['token'];
                echo "✅ Token generado: " . substr($token, 0, 20) . "...\n";
            } else {
                echo "❌ No se generó token\n";
            }
            
            // Verificar información del usuario
            $userData = $data['user'] ?? $data['data']['user'] ?? $data['data'] ?? null;
            if ($userData) {
                echo "✅ Datos del usuario:\n";
                echo "   👤 ID: " . ($userData['id'] ?? 'N/A') . "\n";
                echo "   📧 Email: " . ($userData['email'] ?? 'N/A') . "\n";
                echo "   🎭 Rol: " . ($userData['rol_nombre'] ?? $userData['role'] ?? 'N/A') . "\n";
            }
            
            // Verificar permisos (LO MÁS IMPORTANTE)
            $permissions = $data['permissions'] ?? $data['data']['permissions'] ?? null;
            if ($permissions) {
                echo "✅ PERMISOS INCLUIDOS EN LA RESPUESTA:\n";
                $modulosConAcceso = 0;
                
                foreach ($permissions as $modulo => $permisos) {
                    if ($permisos['leer']) {
                        $modulosConAcceso++;
                        $acciones = [];
                        if ($permisos['leer']) $acciones[] = 'Leer';
                        if ($permisos['insertar']) $acciones[] = 'Crear';
                        
                        echo "   🔹 $modulo: " . implode(', ', $acciones) . "\n";
                        
                        if ($modulosConAcceso >= 10) {
                            $total = count(array_filter($permissions, function($p) { return $p['leer']; }));
                            echo "   ... y " . ($total - 10) . " módulos más\n";
                            break;
                        }
                    }
                }
                
                echo "\n📊 RESUMEN DE PERMISOS:\n";
                echo "   📂 Total módulos con acceso: $modulosConAcceso\n";
                
                // Verificar módulos específicos importantes
                $modulosImportantes = ['equipos', 'tickets propios', 'correctivos'];
                echo "   🎯 Módulos importantes:\n";
                foreach ($modulosImportantes as $modulo) {
                    if (isset($permissions[$modulo])) {
                        $acceso = $permissions[$modulo]['leer'] ? '✅' : '❌';
                        $crear = $permissions[$modulo]['insertar'] ? ' + Crear' : '';
                        echo "      $acceso $modulo$crear\n";
                    } else {
                        echo "      ❌ $modulo (No encontrado)\n";
                    }
                }
                
            } else {
                echo "❌ NO SE ENCONTRARON PERMISOS EN LA RESPUESTA\n";
                echo "💡 Esto explica por qué el sidebar está vacío\n";
            }
            
        } else {
            echo "❌ LOGIN FALLIDO:\n";
            echo "Mensaje: " . ($data['message'] ?? 'Error desconocido') . "\n";
        }
        
    } else {
        echo "❌ Ambos endpoints de login fallaron\n";
        
        echo "\n3️⃣ VERIFICANDO CONTRASEÑA DIRECTAMENTE EN BD...\n";
        
        $pdo = new PDO("mysql:host=127.0.0.1;port=3306;dbname=gestionthuv;charset=utf8mb4", 'root', '');
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        
        $stmt = $pdo->prepare("SELECT id, email, password FROM usuarios WHERE email = ?");
        $stmt->execute([$loginData['email']]);
        $usuario = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($usuario) {
            echo "✅ Usuario encontrado en BD\n";
            echo "   🆔 ID: {$usuario['id']}\n";
            echo "   📧 Email: {$usuario['email']}\n";
            echo "   🔐 Hash: " . substr($usuario['password'], 0, 20) . "...\n";
            
            // Generar hash de la contraseña para comparar
            $passwordHash = password_hash($loginData['password'], PASSWORD_DEFAULT);
            echo "\n💡 La contraseña puede estar hasheada diferente\n";
            echo "   📝 Prueba con diferentes contraseñas comunes\n";
        } else {
            echo "❌ Usuario no encontrado con ese email\n";
        }
    }

    echo "\n4️⃣ PRÓXIMOS PASOS:\n";
    if ($response !== false) {
        $data = json_decode($response, true);
        if (isset($data['success']) && $data['success'] && isset($data['permissions'])) {
            echo "✅ Login funciona y devuelve permisos\n";
            echo "🔍 Siguiente: Verificar componente sidebar en frontend\n";
        } else if (isset($data['success']) && $data['success']) {
            echo "⚠️ Login funciona pero no devuelve permisos\n";
            echo "🔧 Siguiente: Arreglar respuesta del login para incluir permisos\n";
        } else {
            echo "❌ Login no funciona\n";
            echo "🔧 Siguiente: Arreglar autenticación\n";
        }
    } else {
        echo "❌ Servidor no responde\n";
        echo "🔧 Siguiente: Verificar que el servidor esté corriendo\n";
    }

} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
}

echo "\n🏁 FIN DE LA PRUEBA DE LOGIN\n";
