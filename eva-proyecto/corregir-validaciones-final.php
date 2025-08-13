<?php
/**
 * Script de corrección final de validaciones
 */

echo "🔧 CORRECCIÓN FINAL - CAMPOS REQUERIDOS\n";
echo str_repeat("=", 50) . "\n\n";

echo "⚙️  Actualizando endpoint con todos los campos requeridos...\n";

// Leer archivo actual
$rutasFile = 'eva-backend/routes/api.php';
$contenido = file_get_contents($rutasFile);

// Crear endpoint corregido
$endpointCorregido = '
// ENDPOINT FINAL CORREGIDO PARA CREAR EQUIPOS
Route::post("v1/equipos-final", function(Request $request) {
    header("Access-Control-Allow-Origin: *");
    
    try {
        $validator = Validator::make($request->all(), [
            "name" => "required|string|max:255",
            "code" => "required|string|max:100|unique:equipos,code",
            "servicio_id" => "required|exists:servicios,id",
        ], [
            "name.required" => "El nombre del equipo es obligatorio.",
            "code.required" => "El código del equipo es obligatorio.", 
            "code.unique" => "Ya existe un equipo con este código.",
            "servicio_id.required" => "Debe seleccionar un servicio.",
            "servicio_id.exists" => "El servicio seleccionado no existe.",
        ]);

        if ($validator->fails()) {
            return response()->json([
                "success" => false,
                "message" => "Errores de validación",
                "errors" => $validator->errors()
            ], 422);
        }

        $equipo = Equipo::create([
            "name" => $request->name,
            "code" => $request->code,
            "servicio_id" => $request->servicio_id,
            "status" => 1,
            "fuente_id" => 1,
            "tecnologia_id" => 1,
            "frecuencia_id" => 1,
            "cbiomedica_id" => 1,
            "criesgo_id" => 1,
            "tadquisicion_id" => 1,
            "invima_id" => 1,
            "orden_compra_id" => 1,
            "baja_id" => 1,
            "estadoequipo_id" => 1,
            "propietario_id" => 1,
            "area_id" => 1,
            "tipo_id" => 1,
            "guia_id" => 1,
            "manual_id" => 1,
            "disponibilidad_id" => 1,
        ]);

        return response()->json([
            "success" => true,
            "message" => "Equipo creado exitosamente",
            "data" => $equipo,
            "codigo_creado" => $equipo->code
        ], 201);

    } catch (Exception $e) {
        return response()->json([
            "success" => false,
            "message" => "Error: " . $e->getMessage()
        ], 500);
    }
});

';

// Buscar donde insertar (después de los imports)
$posicion = strpos($contenido, 'use App\Models\Equipo;');
if ($posicion !== false) {
    $posicion = strpos($contenido, "\n", $posicion) + 1;
    $nuevoContenido = substr($contenido, 0, $posicion) . $endpointCorregido . substr($contenido, $posicion);
    file_put_contents($rutasFile, $nuevoContenido);
    echo "✅ Endpoint final agregado correctamente\n";
} else {
    echo "❌ No se pudo agregar el endpoint\n";
}

echo "\n🔍 Creando script de verificación final...\n";

$scriptTestFinal = '<?php
echo "🔍 VERIFICACIÓN FINAL DE VALIDACIONES\n";
echo str_repeat("=", 50) . "\n\n";

// Test 1: Crear equipo exitoso
echo "Test 1: Crear equipo válido...\n";
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "http://localhost:8000/api/v1/equipos-final");
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    "name" => "Test Equipment " . time(),
    "code" => "TEST" . time(),
    "servicio_id" => 1
]));
curl_setopt($ch, CURLOPT_HTTPHEADER, ["Content-Type: application/json"]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "Código HTTP: {$httpCode}\n";
$data = json_decode($response, true);
if ($data && isset($data[\"codigo_creado\"])) {
    echo "✅ Código creado: " . $data[\"codigo_creado\"] . "\n";
}
echo "Respuesta: {$response}\n\n";

// Test 2: Validar campos requeridos
echo "Test 2: Campos faltantes (debe fallar)...\n";
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "http://localhost:8000/api/v1/equipos-final");
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    "name" => "",
    "code" => "",
    "servicio_id" => ""
]));
curl_setopt($ch, CURLOPT_HTTPHEADER, ["Content-Type: application/json"]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "Código HTTP: {$httpCode}\n";
echo "Respuesta: {$response}\n\n";

// Test 3: Código duplicado
echo "Test 3: Código duplicado (debe fallar)...\n";
$testCode = "DUP" . time();

// Primer equipo
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "http://localhost:8000/api/v1/equipos-final");
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    "name" => "Equipo 1",
    "code" => $testCode,
    "servicio_id" => 1
]));
curl_setopt($ch, CURLOPT_HTTPHEADER, ["Content-Type: application/json"]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response1 = curl_exec($ch);
$httpCode1 = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "Primer equipo - Código: {$httpCode1}\n";

// Segundo equipo (debe fallar)
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "http://localhost:8000/api/v1/equipos-final");
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    "name" => "Equipo 2",
    "code" => $testCode,
    "servicio_id" => 1
]));
curl_setopt($ch, CURLOPT_HTTPHEADER, ["Content-Type: application/json"]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response2 = curl_exec($ch);
$httpCode2 = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "Segundo equipo - Código: {$httpCode2}\n";
echo "Respuesta: {$response2}\n\n";

// Análisis final
echo "📊 ANÁLISIS DE RESULTADOS:\n";
echo str_repeat("-", 30) . "\n";

if ($httpCode == 201) {
    echo "✅ Test 1: CORRECTO - Equipo creado exitosamente\n";
} else {
    echo "❌ Test 1: FALLÓ - Código: {$httpCode}\n";
}

if ($httpCode == 422) {
    echo "✅ Test 2: CORRECTO - Validación de campos requeridos funciona\n";
} else {
    echo "❌ Test 2: FALLÓ - Código: {$httpCode}\n";
}

if ($httpCode1 == 201 && $httpCode2 == 422) {
    echo "✅ Test 3: CORRECTO - Validación de código único funciona\n";
} else {
    echo "❌ Test 3: FALLÓ - Códigos: {$httpCode1}, {$httpCode2}\n";
}

echo "\n🎯 RESUMEN:\n";
if ($httpCode == 201 && $httpCode == 422 && $httpCode1 == 201 && $httpCode2 == 422) {
    echo "🎉 ¡TODAS LAS VALIDACIONES FUNCIONAN CORRECTAMENTE!\n";
    echo "📝 El endpoint /api/v1/equipos-final está listo para usar\n";
} else {
    echo "⚠️  Algunas validaciones necesitan ajustes\n";
}

echo "\n" . str_repeat("=", 50) . "\n";
';

file_put_contents('test-validaciones-final.php', $scriptTestFinal);

echo "✅ Script de verificación final creado: test-validaciones-final.php\n\n";

echo "🚀 EJECUTAR: php test-validaciones-final.php\n";
echo str_repeat("=", 50) . "\n";
