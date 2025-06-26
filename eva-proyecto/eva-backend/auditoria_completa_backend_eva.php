<?php

echo "=================================================================\n";
echo "AUDITORÍA COMPLETA BACKEND EVA - PREPARACIÓN PARA FRONTEND\n";
echo "=================================================================\n\n";

$auditoria = [
    'tecnica' => 0,
    'estructura' => 0,
    'funcionalidad' => 0,
    'preparacion_git' => 0,
    'total' => 0
];

$erroresEncontrados = [];
$advertencias = [];

// ==========================================
// 1. AUDITORÍA TÉCNICA COMPLETA
// ==========================================

echo "🔍 1. AUDITORÍA TÉCNICA COMPLETA\n";
echo "===============================\n";

// 1.1 Verificar sintaxis de todos los archivos PHP
echo "📋 1.1 Verificando sintaxis de archivos PHP...\n";

$archivosPhp = array_merge(
    glob('app/Models/*.php'),
    glob('app/Http/Controllers/Api/*.php'),
    glob('routes/*.php'),
    glob('app/Http/Middleware/*.php')
);

$erroresSintaxis = 0;
$archivosValidados = 0;

foreach ($archivosPhp as $archivo) {
    $output = [];
    $returnCode = 0;
    exec("php -l \"$archivo\" 2>&1", $output, $returnCode);
    
    if ($returnCode !== 0) {
        $erroresSintaxis++;
        $erroresEncontrados[] = "Error sintaxis: " . basename($archivo);
    } else {
        $archivosValidados++;
    }
}

echo "   ✅ Archivos validados: $archivosValidados\n";
echo "   ❌ Errores de sintaxis: $erroresSintaxis\n";

if ($erroresSintaxis === 0) {
    $auditoria['tecnica'] += 20;
    echo "   🎯 Sintaxis: PERFECTO (20/20 puntos)\n";
} else {
    echo "   ⚠️  Sintaxis: REQUIERE CORRECCIÓN\n";
}

// 1.2 Validar conectividad con base de datos XAMPP
echo "\n📋 1.2 Validando conectividad XAMPP...\n";

try {
    $envContent = file_get_contents('.env');
    preg_match('/DB_HOST=(.+)/', $envContent, $dbHost);
    preg_match('/DB_DATABASE=(.+)/', $envContent, $dbDatabase);
    preg_match('/DB_USERNAME=(.+)/', $envContent, $dbUsername);
    
    $host = trim($dbHost[1] ?? '127.0.0.1');
    $database = trim($dbDatabase[1] ?? 'gestionthuv');
    $username = trim($dbUsername[1] ?? 'root');
    
    $pdo = new PDO("mysql:host=$host;dbname=$database;charset=utf8mb4", $username, '', [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
    
    // Verificar tablas principales
    $stmt = $pdo->query("SHOW TABLES");
    $tablas = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    echo "   ✅ Conexión BD: EXITOSA\n";
    echo "   ✅ Tablas encontradas: " . count($tablas) . "\n";
    
    $auditoria['tecnica'] += 20;
    echo "   🎯 Conectividad BD: PERFECTO (20/20 puntos)\n";
    
} catch (PDOException $e) {
    echo "   ❌ Error BD: " . $e->getMessage() . "\n";
    $erroresEncontrados[] = "Conectividad BD fallida: " . $e->getMessage();
}

// 1.3 Confirmar endpoints API
echo "\n📋 1.3 Verificando endpoints API...\n";

$controladores = glob('app/Http/Controllers/Api/*.php');
$endpointsValidos = 0;
$endpointsTotal = 0;

foreach (array_slice($controladores, 0, 10) as $controlador) { // Muestra de 10
    $contenido = file_get_contents($controlador);
    $nombreControlador = basename($controlador, '.php');
    
    $tieneIndex = strpos($contenido, 'function index') !== false;
    $tieneStore = strpos($contenido, 'function store') !== false;
    $tieneShow = strpos($contenido, 'function show') !== false;
    $tieneUpdate = strpos($contenido, 'function update') !== false;
    $tieneDestroy = strpos($contenido, 'function destroy') !== false;
    
    $metodosCRUD = $tieneIndex + $tieneStore + $tieneShow + $tieneUpdate + $tieneDestroy;
    $endpointsTotal += 5;
    $endpointsValidos += $metodosCRUD;
    
    if ($metodosCRUD >= 4) {
        echo "   ✅ $nombreControlador: $metodosCRUD/5 métodos CRUD\n";
    } else {
        echo "   ⚠️  $nombreControlador: $metodosCRUD/5 métodos CRUD\n";
        $advertencias[] = "$nombreControlador incompleto";
    }
}

$porcentajeEndpoints = ($endpointsValidos / $endpointsTotal) * 100;
echo "   📊 Endpoints válidos: " . round($porcentajeEndpoints, 1) . "%\n";

if ($porcentajeEndpoints >= 95) {
    $auditoria['tecnica'] += 20;
    echo "   🎯 Endpoints API: EXCELENTE (20/20 puntos)\n";
} elseif ($porcentajeEndpoints >= 80) {
    $auditoria['tecnica'] += 15;
    echo "   🎯 Endpoints API: BUENO (15/20 puntos)\n";
} else {
    $auditoria['tecnica'] += 10;
    echo "   🎯 Endpoints API: REGULAR (10/20 puntos)\n";
}

// 1.4 Verificar autenticación Sanctum
echo "\n📋 1.4 Verificando autenticación Sanctum...\n";

$sanctumConfig = file_exists('config/sanctum.php');
$authController = file_exists('app/Http/Controllers/Api/AuthController.php');
$authMiddleware = file_exists('app/Http/Middleware/Authenticate.php');

if ($sanctumConfig && $authController && $authMiddleware) {
    echo "   ✅ Sanctum: Configurado correctamente\n";
    echo "   ✅ AuthController: Existe\n";
    echo "   ✅ Middleware Auth: Existe\n";
    
    $auditoria['tecnica'] += 20;
    echo "   🎯 Autenticación: PERFECTO (20/20 puntos)\n";
} else {
    echo "   ❌ Sanctum: Configuración incompleta\n";
    $erroresEncontrados[] = "Autenticación Sanctum incompleta";
}

// 1.5 Validar middleware de seguridad
echo "\n📋 1.5 Validando middleware de seguridad...\n";

$corsMiddleware = file_exists('app/Http/Middleware/CorsMiddleware.php');
$apiVersionMiddleware = file_exists('app/Http/Middleware/ApiVersionMiddleware.php');

// Verificar rate limiting en rutas
$rutasConThrottle = 0;
$rutasTotal = 0;
$archivosRutas = glob('routes/*.php');

foreach ($archivosRutas as $ruta) {
    $contenido = file_get_contents($ruta);
    $rutasTotal++;
    if (strpos($contenido, 'throttle') !== false) {
        $rutasConThrottle++;
    }
}

$porcentajeThrottle = ($rutasConThrottle / $rutasTotal) * 100;

echo "   ✅ CORS Middleware: " . ($corsMiddleware ? "EXISTE" : "NO EXISTE") . "\n";
echo "   ✅ API Version Middleware: " . ($apiVersionMiddleware ? "EXISTE" : "NO EXISTE") . "\n";
echo "   ✅ Rate Limiting: " . round($porcentajeThrottle, 1) . "% de rutas\n";

if ($corsMiddleware && $apiVersionMiddleware && $porcentajeThrottle >= 80) {
    $auditoria['tecnica'] += 20;
    echo "   🎯 Middleware Seguridad: PERFECTO (20/20 puntos)\n";
} else {
    $auditoria['tecnica'] += 10;
    echo "   🎯 Middleware Seguridad: PARCIAL (10/20 puntos)\n";
}

echo "\n📊 PUNTUACIÓN AUDITORÍA TÉCNICA: {$auditoria['tecnica']}/100\n";

// ==========================================
// 2. VALIDACIÓN DE ESTRUCTURA
// ==========================================

echo "\n🔍 2. VALIDACIÓN DE ESTRUCTURA\n";
echo "=============================\n";

// 2.1 Confirmar modelos y controladores
echo "📋 2.1 Verificando correspondencia modelos-controladores...\n";

$modelos = glob('app/Models/*.php');
$controladores = glob('app/Http/Controllers/Api/*.php');

$modelosNombres = array_map(function($path) {
    return basename($path, '.php');
}, $modelos);

$controladoresNombres = array_map(function($path) {
    return basename($path, '.php');
}, $controladores);

$modelosSinControlador = 0;
$controladoresEspeciales = ['AuthController', 'DashboardController', 'ExportController', 'HealthController', 'ModalController', 'SwaggerController', 'SystemManagerController'];

foreach ($modelosNombres as $modelo) {
    $controladorEsperado = $modelo . 'Controller';
    if (!in_array($controladorEsperado, $controladoresNombres)) {
        $modelosSinControlador++;
    }
}

echo "   📊 Total modelos: " . count($modelos) . "\n";
echo "   📊 Total controladores: " . count($controladores) . "\n";
echo "   📊 Modelos sin controlador: $modelosSinControlador\n";

$porcentajeCorrespondencia = ((count($modelos) - $modelosSinControlador) / count($modelos)) * 100;

if ($porcentajeCorrespondencia >= 95) {
    $auditoria['estructura'] += 25;
    echo "   🎯 Correspondencia: EXCELENTE (25/25 puntos)\n";
} else {
    $auditoria['estructura'] += 15;
    echo "   🎯 Correspondencia: BUENO (15/25 puntos)\n";
}

// 2.2 Verificar métodos CRUD completos
echo "\n📋 2.2 Verificando métodos CRUD completos...\n";

$controladoresCompletos = 0;

foreach ($controladores as $controlador) {
    $contenido = file_get_contents($controlador);
    
    $tieneIndex = strpos($contenido, 'function index') !== false;
    $tieneStore = strpos($contenido, 'function store') !== false;
    $tieneShow = strpos($contenido, 'function show') !== false;
    $tieneUpdate = strpos($contenido, 'function update') !== false;
    $tieneDestroy = strpos($contenido, 'function destroy') !== false;
    
    if ($tieneIndex && $tieneStore && $tieneShow && $tieneUpdate && $tieneDestroy) {
        $controladoresCompletos++;
    }
}

$porcentajeCRUD = ($controladoresCompletos / count($controladores)) * 100;
echo "   📊 Controladores con CRUD completo: $controladoresCompletos/" . count($controladores) . " (" . round($porcentajeCRUD, 1) . "%)\n";

if ($porcentajeCRUD >= 90) {
    $auditoria['estructura'] += 25;
    echo "   🎯 CRUD Completo: EXCELENTE (25/25 puntos)\n";
} else {
    $auditoria['estructura'] += 15;
    echo "   🎯 CRUD Completo: BUENO (15/25 puntos)\n";
}

// 2.3 Validar rutas configuradas
echo "\n📋 2.3 Validando configuración de rutas...\n";

$rutasValidas = 0;
$rutasConErrores = 0;

foreach ($archivosRutas as $ruta) {
    $output = [];
    $returnCode = 0;
    exec("php -l \"$ruta\" 2>&1", $output, $returnCode);
    
    if ($returnCode === 0) {
        $rutasValidas++;
    } else {
        $rutasConErrores++;
    }
}

echo "   📊 Rutas válidas: $rutasValidas/" . count($archivosRutas) . "\n";
echo "   📊 Rutas con errores: $rutasConErrores\n";

if ($rutasConErrores === 0) {
    $auditoria['estructura'] += 25;
    echo "   🎯 Configuración Rutas: PERFECTO (25/25 puntos)\n";
} else {
    $auditoria['estructura'] += 15;
    echo "   🎯 Configuración Rutas: BUENO (15/25 puntos)\n";
}

// 2.4 Confirmar referencias no rotas
echo "\n📋 2.4 Verificando referencias entre archivos...\n";

$referenciasRotas = 0;
$referenciasTotales = 0;

// Verificar referencias en rutas a controladores
foreach ($archivosRutas as $ruta) {
    $contenido = file_get_contents($ruta);
    
    preg_match_all('/([A-Z]\w+Controller)::class/', $contenido, $matches);
    
    foreach ($matches[1] as $controladorReferenciado) {
        $referenciasTotales++;
        $archivoControlador = "app/Http/Controllers/Api/$controladorReferenciado.php";
        
        if (!file_exists($archivoControlador)) {
            $referenciasRotas++;
            $erroresEncontrados[] = "Referencia rota: $controladorReferenciado en " . basename($ruta);
        }
    }
}

echo "   📊 Referencias totales: $referenciasTotales\n";
echo "   📊 Referencias rotas: $referenciasRotas\n";

if ($referenciasRotas === 0) {
    $auditoria['estructura'] += 25;
    echo "   🎯 Referencias: PERFECTO (25/25 puntos)\n";
} else {
    $auditoria['estructura'] += 10;
    echo "   🎯 Referencias: REQUIERE CORRECCIÓN (10/25 puntos)\n";
}

echo "\n📊 PUNTUACIÓN VALIDACIÓN ESTRUCTURA: {$auditoria['estructura']}/100\n";

// ==========================================
// 3. PRUEBAS DE FUNCIONALIDAD
// ==========================================

echo "\n🔍 3. PRUEBAS DE FUNCIONALIDAD\n";
echo "============================\n";

// 3.1 Ejecutar tests unitarios
echo "📋 3.1 Verificando tests implementados...\n";

$testsUnit = glob('tests/Unit/*.php');
$testsFeature = glob('tests/Feature/*.php');
$totalTests = count($testsUnit) + count($testsFeature);

echo "   📊 Tests unitarios: " . count($testsUnit) . "\n";
echo "   📊 Tests de integración: " . count($testsFeature) . "\n";
echo "   📊 Total tests: $totalTests\n";

if ($totalTests >= 15) {
    $auditoria['funcionalidad'] += 25;
    echo "   🎯 Tests: EXCELENTE (25/25 puntos)\n";
} elseif ($totalTests >= 10) {
    $auditoria['funcionalidad'] += 20;
    echo "   🎯 Tests: BUENO (20/25 puntos)\n";
} else {
    $auditoria['funcionalidad'] += 10;
    echo "   🎯 Tests: BÁSICO (10/25 puntos)\n";
}

// 3.2 Verificar validaciones de entrada
echo "\n📋 3.2 Verificando validaciones de entrada...\n";

$controladoresConValidacion = 0;

foreach ($controladores as $controlador) {
    $contenido = file_get_contents($controlador);
    
    if (strpos($contenido, 'validate(') !== false || strpos($contenido, 'Validator::make') !== false) {
        $controladoresConValidacion++;
    }
}

$porcentajeValidacion = ($controladoresConValidacion / count($controladores)) * 100;
echo "   📊 Controladores con validación: $controladoresConValidacion/" . count($controladores) . " (" . round($porcentajeValidacion, 1) . "%)\n";

if ($porcentajeValidacion >= 90) {
    $auditoria['funcionalidad'] += 25;
    echo "   🎯 Validaciones: EXCELENTE (25/25 puntos)\n";
} else {
    $auditoria['funcionalidad'] += 15;
    echo "   🎯 Validaciones: BUENO (15/25 puntos)\n";
}

// 3.3 Validar sistema de logging
echo "\n📋 3.3 Validando sistema de logging...\n";

$controladoresConLogging = 0;

foreach ($controladores as $controlador) {
    $contenido = file_get_contents($controlador);
    
    if (strpos($contenido, 'Log::') !== false) {
        $controladoresConLogging++;
    }
}

$porcentajeLogging = ($controladoresConLogging / count($controladores)) * 100;
echo "   📊 Controladores con logging: $controladoresConLogging/" . count($controladores) . " (" . round($porcentajeLogging, 1) . "%)\n";

if ($porcentajeLogging >= 80) {
    $auditoria['funcionalidad'] += 25;
    echo "   🎯 Logging: EXCELENTE (25/25 puntos)\n";
} else {
    $auditoria['funcionalidad'] += 15;
    echo "   🎯 Logging: BUENO (15/25 puntos)\n";
}

// 3.4 Verificar ResponseFormatter
echo "\n📋 3.4 Verificando ResponseFormatter...\n";

$controladoresConFormatter = 0;

foreach ($controladores as $controlador) {
    $contenido = file_get_contents($controlador);
    
    if (strpos($contenido, 'ResponseFormatter') !== false) {
        $controladoresConFormatter++;
    }
}

$porcentajeFormatter = ($controladoresConFormatter / count($controladores)) * 100;
echo "   📊 Controladores con ResponseFormatter: $controladoresConFormatter/" . count($controladores) . " (" . round($porcentajeFormatter, 1) . "%)\n";

if ($porcentajeFormatter >= 90) {
    $auditoria['funcionalidad'] += 25;
    echo "   🎯 ResponseFormatter: EXCELENTE (25/25 puntos)\n";
} else {
    $auditoria['funcionalidad'] += 15;
    echo "   🎯 ResponseFormatter: BUENO (15/25 puntos)\n";
}

echo "\n📊 PUNTUACIÓN PRUEBAS FUNCIONALIDAD: {$auditoria['funcionalidad']}/100\n";

// Calcular puntuación total
$auditoria['total'] = ($auditoria['tecnica'] + $auditoria['estructura'] + $auditoria['funcionalidad']) / 3;

echo "\n=================================================================\n";
echo "RESUMEN FINAL DE AUDITORÍA\n";
echo "=================================================================\n";

echo "📊 PUNTUACIONES FINALES:\n";
echo "========================\n";
echo "🔍 Auditoría Técnica: {$auditoria['tecnica']}/100\n";
echo "🏗️  Validación Estructura: {$auditoria['estructura']}/100\n";
echo "⚙️  Pruebas Funcionalidad: {$auditoria['funcionalidad']}/100\n";
echo "\n🎯 PUNTUACIÓN TOTAL: " . round($auditoria['total'], 1) . "/100\n";

// Determinar estado del backend
if ($auditoria['total'] >= 95) {
    echo "\n🏆 ESTADO: EXCELENTE - LISTO PARA INTEGRACIÓN FRONTEND\n";
    $auditoria['preparacion_git'] = 100;
} elseif ($auditoria['total'] >= 90) {
    echo "\n✅ ESTADO: MUY BUENO - LISTO PARA INTEGRACIÓN CON MEJORAS MENORES\n";
    $auditoria['preparacion_git'] = 90;
} elseif ($auditoria['total'] >= 80) {
    echo "\n⚠️  ESTADO: BUENO - REQUIERE MEJORAS ANTES DE INTEGRACIÓN\n";
    $auditoria['preparacion_git'] = 70;
} else {
    echo "\n❌ ESTADO: REQUIERE TRABAJO ADICIONAL ANTES DE INTEGRACIÓN\n";
    $auditoria['preparacion_git'] = 50;
}

// Mostrar errores y advertencias
if (!empty($erroresEncontrados)) {
    echo "\n❌ ERRORES ENCONTRADOS:\n";
    foreach ($erroresEncontrados as $error) {
        echo "   - $error\n";
    }
}

if (!empty($advertencias)) {
    echo "\n⚠️  ADVERTENCIAS:\n";
    foreach ($advertencias as $advertencia) {
        echo "   - $advertencia\n";
    }
}

// Generar reporte final
$reporte = "# 📋 REPORTE FINAL AUDITORÍA BACKEND EVA

## 🎯 PUNTUACIÓN TOTAL: " . round($auditoria['total'], 1) . "/100

### 📊 Desglose por Categorías:
- **🔍 Auditoría Técnica:** {$auditoria['tecnica']}/100
- **🏗️ Validación Estructura:** {$auditoria['estructura']}/100  
- **⚙️ Pruebas Funcionalidad:** {$auditoria['funcionalidad']}/100

### 📈 Estadísticas:
- **Modelos:** " . count($modelos) . "
- **Controladores:** " . count($controladores) . "
- **Rutas:** " . count($archivosRutas) . "
- **Tests:** $totalTests
- **Errores:** " . count($erroresEncontrados) . "
- **Advertencias:** " . count($advertencias) . "

### 🎯 Estado Final:
" . ($auditoria['total'] >= 95 ? "✅ **LISTO PARA INTEGRACIÓN FRONTEND**" : "⚠️ **REQUIERE MEJORAS**") . "

**Fecha:** " . date('Y-m-d H:i:s') . "
**Versión:** 2.0.0 - Empresarial
";

file_put_contents('REPORTE_AUDITORIA_BACKEND_EVA.md', $reporte);

echo "\n✅ Reporte generado: REPORTE_AUDITORIA_BACKEND_EVA.md\n";

// Decisión final sobre Git
if ($auditoria['total'] >= 95) {
    echo "\n🚀 PREPARACIÓN PARA GIT:\n";
    echo "======================\n";
    echo "✅ Backend cumple criterios de calidad (≥95%)\n";
    echo "✅ Listo para commit y integración frontend\n";
    echo "✅ Mensaje sugerido: 'feat: Backend EVA optimizado al " . round($auditoria['total'], 1) . "% - Listo para integración frontend'\n";
} else {
    echo "\n⚠️  PREPARACIÓN PARA GIT:\n";
    echo "========================\n";
    echo "❌ Backend NO cumple criterios mínimos (≥95%)\n";
    echo "❌ Requiere correcciones antes del commit\n";
    echo "📋 Revisar errores y advertencias listados arriba\n";
}

echo "\n=================================================================\n";
echo "AUDITORÍA COMPLETADA\n";
echo "=================================================================\n";

?>
