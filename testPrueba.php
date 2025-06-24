<?php
/**
 * ARCHIVO DE PRUEBAS COMPLETO PARA EL SISTEMA EVA
 *
 * Este archivo contiene todas las pruebas necesarias para verificar
 * el funcionamiento completo del backend de Laravel con la base de datos real.
 *
 * Ejecutar desde: C:\Users\kevin\Desktop\EVA\proyecto-eva\testPrueba.php
 *
 * @author Sistema EVA
 * @version 1.0
 * @date 2024
 */

// Configuración de errores para debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "=== INICIANDO PRUEBAS DEL SISTEMA EVA ===\n\n";

/**
 * PRUEBA 1: CONEXIÓN A LA BASE DE DATOS
 */
function probarConexionBaseDatos() {
    echo "🔍 PRUEBA 1: Conexión a Base de Datos\n";
    echo "=====================================\n";

    try {
        $host = 'localhost';
        $dbname = 'gestionthuv';
        $username = 'root';
        $password = '';

        $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        echo "✅ Conexión exitosa a la base de datos '$dbname'\n";

        // Verificar tablas principales
        $stmt = $pdo->query("SHOW TABLES");
        $tablas = $stmt->fetchAll(PDO::FETCH_COLUMN);

        echo "📊 Total de tablas encontradas: " . count($tablas) . "\n";

        $tablasImportantes = [
            'equipos', 'usuarios', 'servicios', 'areas', 'mantenimiento',
            'contingencias', 'calibracion', 'correctivos_generales', 'observaciones',
            'archivos', 'manuales', 'fuenteal', 'tecnologiap', 'frecuenciam',
            'cbiomedica', 'criesgo', 'tadquisicion', 'estadoequipos', 'propietarios'
        ];

        echo "\n🔍 Verificando tablas importantes:\n";
        foreach ($tablasImportantes as $tabla) {
            if (in_array($tabla, $tablas)) {
                // Contar registros
                $stmt = $pdo->query("SELECT COUNT(*) FROM $tabla");
                $count = $stmt->fetchColumn();
                echo "  ✅ $tabla: $count registros\n";
            } else {
                echo "  ❌ $tabla: NO ENCONTRADA\n";
            }
        }

        return $pdo;

    } catch (PDOException $e) {
        echo "❌ Error de conexión: " . $e->getMessage() . "\n";
        return false;
    }

    echo "\n";
}

/**
 * PRUEBA 2: ESTRUCTURA DE TABLAS
 */
function probarEstructuraTablas($pdo) {
    echo "🔍 PRUEBA 2: Estructura de Tablas\n";
    echo "=================================\n";

    $tablasEstructura = [
        'equipos' => [
            'campos_requeridos' => ['id', 'name', 'code', 'servicio_id', 'area_id', 'created_at'],
            'campos_opcionales' => ['image', 'marca', 'modelo', 'serial', 'descripcion', 'costo']
        ],
        'usuarios' => [
            'campos_requeridos' => ['id', 'nombre', 'apellido', 'email', 'username'],
            'campos_opcionales' => ['telefono', 'rol_id', 'servicio_id', 'centro_id']
        ],
        'mantenimiento' => [
            'campos_requeridos' => ['id', 'equipo_id', 'description', 'created_at'],
            'campos_opcionales' => ['status', 'fecha_programada', 'tecnico_id', 'file']
        ]
    ];

    foreach ($tablasEstructura as $tabla => $estructura) {
        echo "\n📋 Analizando tabla: $tabla\n";

        try {
            $stmt = $pdo->query("DESCRIBE $tabla");
            $campos = $stmt->fetchAll(PDO::FETCH_ASSOC);

            $camposEncontrados = array_column($campos, 'Field');

            echo "  📊 Total campos: " . count($camposEncontrados) . "\n";

            // Verificar campos requeridos
            echo "  🔍 Campos requeridos:\n";
            foreach ($estructura['campos_requeridos'] as $campo) {
                if (in_array($campo, $camposEncontrados)) {
                    echo "    ✅ $campo\n";
                } else {
                    echo "    ❌ $campo (FALTANTE)\n";
                }
            }

            // Verificar campos opcionales
            echo "  🔍 Campos opcionales:\n";
            foreach ($estructura['campos_opcionales'] as $campo) {
                if (in_array($campo, $camposEncontrados)) {
                    echo "    ✅ $campo\n";
                } else {
                    echo "    ⚠️  $campo (no encontrado)\n";
                }
            }

        } catch (PDOException $e) {
            echo "  ❌ Error al analizar $tabla: " . $e->getMessage() . "\n";
        }
    }

    echo "\n";
}

/**
 * PRUEBA 3: DATOS DE PRUEBA
 */
function probarDatosPrueba($pdo) {
    echo "🔍 PRUEBA 3: Datos de Prueba\n";
    echo "============================\n";

    // Verificar datos existentes
    $consultas = [
        'Servicios activos' => "SELECT COUNT(*) FROM servicios WHERE status = 1",
        'Áreas activas' => "SELECT COUNT(*) FROM areas WHERE status = 1",
        'Equipos activos' => "SELECT COUNT(*) FROM equipos WHERE status = 1",
        'Usuarios activos' => "SELECT COUNT(*) FROM usuarios WHERE estado = 1",
        'Mantenimientos programados' => "SELECT COUNT(*) FROM mantenimiento WHERE status = 'programado'",
        'Contingencias activas' => "SELECT COUNT(*) FROM contingencias WHERE estado != 'Cerrado'",
        'Archivos disponibles' => "SELECT COUNT(*) FROM archivos",
        'Manuales disponibles' => "SELECT COUNT(*) FROM manuales WHERE status = 1"
    ];

    foreach ($consultas as $descripcion => $sql) {
        try {
            $stmt = $pdo->query($sql);
            $count = $stmt->fetchColumn();
            echo "  📊 $descripcion: $count\n";
        } catch (PDOException $e) {
            echo "  ❌ Error en '$descripcion': " . $e->getMessage() . "\n";
        }
    }

    echo "\n";
}

/**
 * PRUEBA 4: ENDPOINTS DE LA API
 */
function probarEndpointsAPI() {
    echo "🔍 PRUEBA 4: Endpoints de la API\n";
    echo "================================\n";

    $baseUrl = 'http://localhost:8000/api';

    $endpoints = [
        'GET /equipos' => '/equipos',
        'GET /usuarios' => '/usuarios',
        'GET /servicios' => '/servicios',
        'GET /areas' => '/areas',
        'GET /mantenimientos' => '/mantenimientos',
        'GET /modal/add-equipment-data' => '/modal/add-equipment-data',
        'GET /database/dashboard-stats' => '/database/dashboard-stats'
    ];

    foreach ($endpoints as $descripcion => $endpoint) {
        $url = $baseUrl . $endpoint;
        echo "  🌐 Probando: $descripcion\n";
        echo "     URL: $url\n";

        // Usar cURL para probar el endpoint
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Accept: application/json',
            'Content-Type: application/json'
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode === 200) {
            $data = json_decode($response, true);
            if ($data && isset($data['status'])) {
                echo "     ✅ Respuesta exitosa (HTTP $httpCode)\n";
                echo "     📊 Status: " . $data['status'] . "\n";
                if (isset($data['message'])) {
                    echo "     💬 Mensaje: " . $data['message'] . "\n";
                }
            } else {
                echo "     ⚠️  Respuesta recibida pero formato inesperado\n";
            }
        } else {
            echo "     ❌ Error HTTP: $httpCode\n";
            if ($response) {
                echo "     📝 Respuesta: " . substr($response, 0, 100) . "...\n";
            }
        }
        echo "\n";
    }
}

/**
 * PRUEBA 5: MODELOS DE LARAVEL
 */
function probarModelosLaravel() {
    echo "🔍 PRUEBA 5: Modelos de Laravel\n";
    echo "===============================\n";

    $modelos = [
        'Equipo' => 'Equipo.php',
        'Usuario' => 'Usuario.php',
        'Servicio' => 'Servicio.php',
        'Area' => 'Area.php',
        'Mantenimiento' => 'Mantenimiento.php',
        'Contingencia' => 'Contingencia.php',
        'FuenteAlimentacion' => 'FuenteAlimentacion.php',
        'Tecnologia' => 'Tecnologia.php',
        'ClasificacionRiesgo' => 'ClasificacionRiesgo.php'
    ];

    $laravelPath = 'C:\\Users\\kevin\\Desktop\\EVA\\proyecto-eva\\eva-proyecto\\eva-backend';

    foreach ($modelos as $nombre => $archivo) {
        $rutaArchivo = $laravelPath . '\\app\\Models\\' . $archivo;

        echo "  📁 Verificando modelo: $nombre\n";
        echo "     Archivo: $archivo\n";

        if (file_exists($rutaArchivo)) {
            echo "     ✅ Archivo existe\n";

            // Verificar contenido básico del modelo
            $contenido = file_get_contents($rutaArchivo);

            if (strpos($contenido, "class $nombre") !== false) {
                echo "     ✅ Clase definida correctamente\n";
            } else {
                echo "     ⚠️  Clase no encontrada en el archivo\n";
            }

            if (strpos($contenido, 'protected $fillable') !== false) {
                echo "     ✅ Campos fillable definidos\n";
            } else {
                echo "     ⚠️  Campos fillable no definidos\n";
            }

            if (strpos($contenido, 'public function') !== false) {
                echo "     ✅ Métodos/relaciones definidos\n";
            } else {
                echo "     ⚠️  No se encontraron métodos\n";
            }

        } else {
            echo "     ❌ Archivo no existe\n";
        }
        echo "\n";
    }
}

/**
 * PRUEBA 6: CONTROLADORES
 */
function probarControladores() {
    echo "🔍 PRUEBA 6: Controladores\n";
    echo "==========================\n";

    $controladores = [
        'ControladorEquipos' => 'ControladorEquipos.php',
        'ControladorMantenimiento' => 'ControladorMantenimiento.php',
        'ModalController' => 'ModalController.php',
        'FileController' => 'FileController.php',
        'ExportController' => 'ExportController.php'
    ];

    $laravelPath = 'C:\\Users\\kevin\\Desktop\\EVA\\proyecto-eva\\eva-proyecto\\eva-backend';

    foreach ($controladores as $nombre => $archivo) {
        $rutaArchivo = $laravelPath . '\\app\\Http\\Controllers\\Api\\' . $archivo;

        echo "  🎮 Verificando controlador: $nombre\n";
        echo "     Archivo: $archivo\n";

        if (file_exists($rutaArchivo)) {
            echo "     ✅ Archivo existe\n";

            $contenido = file_get_contents($rutaArchivo);

            // Verificar métodos básicos
            $metodos = ['index', 'store', 'show', 'update', 'destroy'];
            $metodosEncontrados = 0;

            foreach ($metodos as $metodo) {
                if (strpos($contenido, "public function $metodo") !== false) {
                    $metodosEncontrados++;
                }
            }

            echo "     📊 Métodos CRUD encontrados: $metodosEncontrados/5\n";

            if (strpos($contenido, 'ResponseFormatter::success') !== false) {
                echo "     ✅ Usa ResponseFormatter\n";
            } else {
                echo "     ⚠️  No usa ResponseFormatter\n";
            }

            if (strpos($contenido, 'Validator::make') !== false) {
                echo "     ✅ Incluye validaciones\n";
            } else {
                echo "     ⚠️  No incluye validaciones\n";
            }

        } else {
            echo "     ❌ Archivo no existe\n";
        }
        echo "\n";
    }
}

// EJECUTAR TODAS LAS PRUEBAS
echo "🚀 Iniciando batería de pruebas...\n\n";

$pdo = probarConexionBaseDatos();

if ($pdo) {
    probarEstructuraTablas($pdo);
    probarDatosPrueba($pdo);
}

probarEndpointsAPI();
probarModelosLaravel();
probarControladores();

echo "=== PRUEBAS COMPLETADAS ===\n";
echo "📊 Resumen: Todas las pruebas han sido ejecutadas\n";
echo "📝 Revisa los resultados arriba para identificar cualquier problema\n";
echo "🔧 Corrige los errores encontrados y vuelve a ejecutar las pruebas\n\n";

?>