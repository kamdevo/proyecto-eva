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
 * PRUEBA 4: ENDPOINTS DE LA API COMPLETOS
 */
function probarEndpointsAPI() {
    echo "🔍 PRUEBA 4: Endpoints de la API Completos\n";
    echo "==========================================\n";

    $baseUrl = 'http://localhost:8000/api';

    $endpoints = [
        // APIs principales existentes
        'GET /equipos' => '/equipos',
        'GET /usuarios' => '/usuarios',
        'GET /servicios' => '/servicios',
        'GET /areas' => '/areas',
        'GET /mantenimientos' => '/mantenimientos',
        'GET /contingencias' => '/contingencias',
        'GET /calibraciones' => '/calibraciones',

        // APIs nuevas implementadas
        'GET /archivos' => '/archivos',
        'GET /tickets' => '/tickets',
        'GET /capacitaciones' => '/capacitaciones',
        'GET /repuestos' => '/repuestos',
        'GET /correctivos' => '/correctivos',

        // APIs de estadísticas
        'GET /equipos/estadisticas' => '/equipos/estadisticas',
        'GET /mantenimientos/estadisticas' => '/mantenimientos/estadisticas',
        'GET /tickets/estadisticas' => '/tickets/estadisticas',
        'GET /archivos/estadisticas' => '/archivos/estadisticas',

        // APIs especiales
        'GET /modal/add-equipment-data' => '/modal/add-equipment-data',
        'GET /database/dashboard-stats' => '/database/dashboard-stats',
        'GET /files/statistics' => '/files/statistics'
    ];

    $exitosos = 0;
    $fallidos = 0;

    foreach ($endpoints as $descripcion => $endpoint) {
        $url = $baseUrl . $endpoint;
        echo "  🌐 Probando: $descripcion\n";

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
        $error = curl_error($ch);
        curl_close($ch);

        if ($error) {
            echo "     ❌ Error cURL: $error\n";
            $fallidos++;
        } elseif ($httpCode === 200) {
            $data = json_decode($response, true);
            if ($data && isset($data['status'])) {
                echo "     ✅ Respuesta exitosa (HTTP $httpCode)\n";
                echo "     📊 Status: " . $data['status'] . "\n";
                $exitosos++;
            } else {
                echo "     ⚠️  Respuesta recibida pero formato inesperado\n";
                $fallidos++;
            }
        } elseif ($httpCode === 405) {
            echo "     ⚠️  Método no permitido (POST requerido) - Ruta existe\n";
            $exitosos++;
        } elseif ($httpCode === 404) {
            echo "     ❌ Endpoint no encontrado (HTTP $httpCode)\n";
            $fallidos++;
        } else {
            echo "     ❌ Error HTTP: $httpCode\n";
            $fallidos++;
        }
    }

    echo "\n  📊 RESUMEN APIs:\n";
    echo "     ✅ Exitosas: $exitosos\n";
    echo "     ❌ Fallidas: $fallidos\n";
    echo "     📈 Porcentaje éxito: " . round(($exitosos / count($endpoints)) * 100, 2) . "%\n\n";
}

/**
 * PRUEBA 5: MODELOS DE LARAVEL
 */
function probarModelosLaravel() {
    echo "🔍 PRUEBA 5: Modelos de Laravel\n";
    echo "===============================\n";

    $modelos = [
        // Modelos existentes
        'Equipo' => 'Equipo.php',
        'Usuario' => 'Usuario.php',
        'Servicio' => 'Servicio.php',
        'Area' => 'Area.php',
        'Mantenimiento' => 'Mantenimiento.php',
        'Contingencia' => 'Contingencia.php',
        'FuenteAlimentacion' => 'FuenteAlimentacion.php',
        'Tecnologia' => 'Tecnologia.php',
        'ClasificacionRiesgo' => 'ClasificacionRiesgo.php',

        // Modelos nuevos implementados
        'Archivo' => 'Archivo.php',
        'Ticket' => 'Ticket.php',
        'Capacitacion' => 'Capacitacion.php',
        'Repuesto' => 'Repuesto.php',
        'CorrectivoGeneral' => 'CorrectivoGeneral.php',
        'Calibracion' => 'Calibracion.php'
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
        // Controladores existentes
        'ControladorEquipos' => 'ControladorEquipos.php',
        'ControladorMantenimiento' => 'ControladorMantenimiento.php',
        'ModalController' => 'ModalController.php',
        'FileController' => 'FileController.php',
        'ExportController' => 'ExportController.php',

        // Controladores nuevos implementados
        'ArchivosController' => 'ArchivosController.php',
        'TicketController' => 'TicketController.php',
        'CapacitacionController' => 'CapacitacionController.php',
        'RepuestosController' => 'RepuestosController.php',
        'CorrectivoController' => 'CorrectivoController.php',
        'CalibracionController' => 'CalibracionController.php',
        'AreaController' => 'AreaController.php',
        'ServicioController' => 'ServicioController.php',
        'ContingenciaController' => 'ContingenciaController.php'
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

/**
 * PRUEBA 7: CLASES DE INTERACCIÓN
 */
function probarInteracciones() {
    echo "🔍 PRUEBA 7: Clases de Interacción\n";
    echo "==================================\n";

    $interacciones = [
        'InteraccionArchivos' => 'InteraccionArchivos.php',
        'InteraccionMantenimiento' => 'InteraccionMantenimiento.php',
        'InteraccionEquipos' => 'InteraccionEquipos.php',
        'InteraccionTickets' => 'InteraccionTickets.php'
    ];

    $laravelPath = 'C:\\Users\\kevin\\Desktop\\EVA\\proyecto-eva\\eva-proyecto\\eva-backend';

    foreach ($interacciones as $nombre => $archivo) {
        $rutaArchivo = $laravelPath . '\\app\\Interactions\\' . $archivo;

        echo "  🔧 Verificando interacción: $nombre\n";
        echo "     Archivo: $archivo\n";

        if (file_exists($rutaArchivo)) {
            echo "     ✅ Archivo existe\n";

            $contenido = file_get_contents($rutaArchivo);

            if (strpos($contenido, "class $nombre") !== false) {
                echo "     ✅ Clase definida correctamente\n";
            } else {
                echo "     ⚠️  Clase no encontrada en el archivo\n";
            }

            // Contar métodos estáticos
            $metodosEstaticos = substr_count($contenido, 'public static function');
            echo "     📊 Métodos estáticos: $metodosEstaticos\n";

            if (strpos($contenido, 'ResponseFormatter::') !== false) {
                echo "     ✅ Usa ResponseFormatter\n";
            } else {
                echo "     ⚠️  No usa ResponseFormatter\n";
            }

        } else {
            echo "     ❌ Archivo no existe\n";
        }
        echo "\n";
    }
}

/**
 * PRUEBA 8: MIGRACIONES
 */
function probarMigraciones() {
    echo "🔍 PRUEBA 8: Migraciones\n";
    echo "========================\n";

    $laravelPath = 'C:\\Users\\kevin\\Desktop\\EVA\\proyecto-eva\\eva-proyecto\\eva-backend';
    $migrationsPath = $laravelPath . '\\database\\migrations';

    $migracionesNuevas = [
        '2024_12_24_000001_add_missing_fields_to_mantenimiento.php',
        '2024_12_24_000002_add_missing_fields_to_areas.php',
        '2024_12_24_000003_add_missing_fields_to_contingencias.php',
        '2024_12_24_000004_create_tickets_table.php',
        '2024_12_24_000005_create_capacitaciones_table.php',
        '2024_12_24_000006_create_repuestos_table.php',
        '2024_12_24_000007_improve_archivos_table.php'
    ];

    foreach ($migracionesNuevas as $migracion) {
        $rutaArchivo = $migrationsPath . '\\' . $migracion;

        echo "  📄 Verificando migración: $migracion\n";

        if (file_exists($rutaArchivo)) {
            echo "     ✅ Archivo existe\n";

            $contenido = file_get_contents($rutaArchivo);

            if (strpos($contenido, 'public function up()') !== false) {
                echo "     ✅ Método up() definido\n";
            }

            if (strpos($contenido, 'public function down()') !== false) {
                echo "     ✅ Método down() definido\n";
            }

        } else {
            echo "     ❌ Archivo no existe\n";
        }
        echo "\n";
    }
}

// EJECUTAR TODAS LAS PRUEBAS
echo "🚀 Iniciando batería de pruebas completas del sistema EVA...\n\n";

$pdo = probarConexionBaseDatos();

if ($pdo) {
    probarEstructuraTablas($pdo);
    probarDatosPrueba($pdo);
}

probarEndpointsAPI();
probarModelosLaravel();
probarControladores();
probarInteracciones();
probarMigraciones();

echo "=== PRUEBAS COMPLETADAS ===\n";
echo "🎉 Sistema EVA - Batería de pruebas completa ejecutada\n";
echo "📊 Resumen: Todas las pruebas han sido ejecutadas\n";
echo "📝 Revisa los resultados arriba para identificar cualquier problema\n";
echo "🔧 Corrige los errores encontrados y vuelve a ejecutar las pruebas\n";
echo "✨ El sistema EVA está listo para producción una vez que todas las pruebas pasen\n\n";

?>