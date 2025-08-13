<?php
/**
 * SCRIPT PARA POBLAR DATOS BÁSICOS EN TABLAS DE RELACIONES
 * Este script inserta datos mínimos necesarios para que el modal funcione
 */

require_once __DIR__ . '/vendor/autoload.php';

use Illuminate\Database\Capsule\Manager as Capsule;

// Configuración de la base de datos
$capsule = new Capsule;
$capsule->addConnection([
    'driver' => 'mysql',
    'host' => 'localhost',
    'database' => 'eva_db',
    'username' => 'root',
    'password' => '',
    'charset' => 'utf8mb4',
    'collation' => 'utf8mb4_unicode_ci',
    'prefix' => '',
]);

$capsule->setAsGlobal();
$capsule->bootEloquent();

echo "🌱 POBLANDO DATOS BÁSICOS EN TABLAS DE RELACIONES\n";
echo "=" . str_repeat("=", 60) . "\n\n";

/**
 * Función helper para insertar datos si no existen
 */
function insertIfNotExists($table, $data, $checkField = 'id') {
    try {
        if (!Schema::hasTable($table)) {
            echo "❌ Tabla '$table' no existe\n";
            return false;
        }
        
        $exists = false;
        if (isset($data[$checkField])) {
            $exists = Capsule::table($table)->where($checkField, $data[$checkField])->exists();
        }
        
        if (!$exists) {
            Capsule::table($table)->insert($data);
            echo "✅ Insertado en '$table': " . json_encode($data) . "\n";
            return true;
        } else {
            echo "⚪ Ya existe en '$table': $checkField = " . $data[$checkField] . "\n";
            return false;
        }
    } catch (Exception $e) {
        echo "❌ Error insertando en '$table': " . $e->getMessage() . "\n";
        return false;
    }
}

// 1. PROPIETARIOS
echo "👥 POBLANDO PROPIETARIOS...\n";
echo "-" . str_repeat("-", 40) . "\n";

$propietarios = [
    ['id' => 1, 'nombre' => 'Hospital San José', 'estado' => 1],
    ['id' => 2, 'nombre' => 'Clínica Santa María', 'estado' => 1],
    ['id' => 3, 'nombre' => 'Centro Médico Los Andes', 'estado' => 1],
];

foreach ($propietarios as $propietario) {
    insertIfNotExists('propietarios', $propietario);
}

// 2. ESTADOS DE EQUIPOS
echo "\n🔧 POBLANDO ESTADOS DE EQUIPOS...\n";
echo "-" . str_repeat("-", 40) . "\n";

$estados = [
    ['id' => 1, 'name' => 'Operativo', 'status' => 1, 'tipoestado_id' => 1, 'color' => 'green'],
    ['id' => 2, 'name' => 'En Mantenimiento', 'status' => 1, 'tipoestado_id' => 2, 'color' => 'yellow'],
    ['id' => 3, 'name' => 'Fuera de Servicio', 'status' => 1, 'tipoestado_id' => 3, 'color' => 'red'],
    ['id' => 4, 'name' => 'En Reparación', 'status' => 1, 'tipoestado_id' => 4, 'color' => 'orange'],
];

foreach ($estados as $estado) {
    insertIfNotExists('estadoequipos', $estado);
}

// 3. CLASIFICACIONES BIOMÉDICAS
echo "\n🏥 POBLANDO CLASIFICACIONES BIOMÉDICAS...\n";
echo "-" . str_repeat("-", 40) . "\n";

$clasificacionesBiomedicas = [
    ['id' => 1, 'name' => 'Clase I', 'status' => 1],
    ['id' => 2, 'name' => 'Clase IIa', 'status' => 1],
    ['id' => 3, 'name' => 'Clase IIb', 'status' => 1],
    ['id' => 4, 'name' => 'Clase III', 'status' => 1],
];

foreach ($clasificacionesBiomedicas as $clasificacion) {
    insertIfNotExists('cbiomedicas', $clasificacion);
}

// 4. CLASIFICACIONES DE RIESGO
echo "\n⚠️ POBLANDO CLASIFICACIONES DE RIESGO...\n";
echo "-" . str_repeat("-", 40) . "\n";

$clasificacionesRiesgo = [
    ['id' => 1, 'name' => 'Bajo', 'status' => 1],
    ['id' => 2, 'name' => 'Medio', 'status' => 1],
    ['id' => 3, 'name' => 'Alto', 'status' => 1],
    ['id' => 4, 'name' => 'Crítico', 'status' => 1],
];

foreach ($clasificacionesRiesgo as $riesgo) {
    insertIfNotExists('criesgos', $riesgo);
}

// 5. FUENTES DE ALIMENTACIÓN
echo "\n⚡ POBLANDO FUENTES DE ALIMENTACIÓN...\n";
echo "-" . str_repeat("-", 40) . "\n";

$fuentes = [
    ['id' => 1, 'name' => 'Eléctrica 110V', 'status' => 1],
    ['id' => 2, 'name' => 'Eléctrica 220V', 'status' => 1],
    ['id' => 3, 'name' => 'Batería', 'status' => 1],
    ['id' => 4, 'name' => 'Neumática', 'status' => 1],
];

foreach ($fuentes as $fuente) {
    insertIfNotExists('fuentes', $fuente);
}

// 6. TECNOLOGÍAS
echo "\n💻 POBLANDO TECNOLOGÍAS...\n";
echo "-" . str_repeat("-", 40) . "\n";

$tecnologias = [
    ['id' => 1, 'name' => 'Digital', 'status' => 1],
    ['id' => 2, 'name' => 'Analógica', 'status' => 1],
    ['id' => 3, 'name' => 'Híbrida', 'status' => 1],
    ['id' => 4, 'name' => 'Mecánica', 'status' => 1],
];

foreach ($tecnologias as $tecnologia) {
    insertIfNotExists('tecnologias', $tecnologia);
}

// 7. FRECUENCIAS DE MANTENIMIENTO
echo "\n🔄 POBLANDO FRECUENCIAS DE MANTENIMIENTO...\n";
echo "-" . str_repeat("-", 40) . "\n";

$frecuencias = [
    ['id' => 1, 'name' => 'Mensual', 'status' => 1],
    ['id' => 2, 'name' => 'Trimestral', 'status' => 1],
    ['id' => 3, 'name' => 'Semestral', 'status' => 1],
    ['id' => 4, 'name' => 'Anual', 'status' => 1],
];

foreach ($frecuencias as $frecuencia) {
    insertIfNotExists('frecuencias', $frecuencia);
}

// 8. TIPOS DE ADQUISICIÓN
echo "\n💰 POBLANDO TIPOS DE ADQUISICIÓN...\n";
echo "-" . str_repeat("-", 40) . "\n";

$tiposAdquisicion = [
    ['id' => 1, 'name' => 'Compra Directa', 'status' => 1],
    ['id' => 2, 'name' => 'Licitación', 'status' => 1],
    ['id' => 3, 'name' => 'Donación', 'status' => 1],
    ['id' => 4, 'name' => 'Comodato', 'status' => 1],
];

foreach ($tiposAdquisicion as $tipo) {
    insertIfNotExists('tadquisiciones', $tipo);
}

// 9. DISPONIBILIDADES
echo "\n📊 POBLANDO DISPONIBILIDADES...\n";
echo "-" . str_repeat("-", 40) . "\n";

$disponibilidades = [
    ['id' => 1, 'name' => 'Disponible', 'status' => 1],
    ['id' => 2, 'name' => 'En Uso', 'status' => 1],
    ['id' => 3, 'name' => 'No Disponible', 'status' => 1],
    ['id' => 4, 'name' => 'En Mantenimiento', 'status' => 1],
];

foreach ($disponibilidades as $disponibilidad) {
    insertIfNotExists('disponibilidades', $disponibilidad);
}

// VERIFICACIÓN FINAL
echo "\n" . str_repeat("=", 60) . "\n";
echo "📊 VERIFICACIÓN FINAL DE DATOS POBLADOS:\n\n";

$tablas = [
    'propietarios' => 'Propietarios',
    'estadoequipos' => 'Estados de Equipos',
    'cbiomedicas' => 'Clasificaciones Biomédicas',
    'criesgos' => 'Clasificaciones de Riesgo',
    'fuentes' => 'Fuentes de Alimentación',
    'tecnologias' => 'Tecnologías',
    'frecuencias' => 'Frecuencias de Mantenimiento',
    'tadquisiciones' => 'Tipos de Adquisición',
    'disponibilidades' => 'Disponibilidades'
];

$totalTablas = 0;
$tablasConDatos = 0;

foreach ($tablas as $tabla => $descripcion) {
    $totalTablas++;
    try {
        if (Schema::hasTable($tabla)) {
            $count = Capsule::table($tabla)->count();
            if ($count > 0) {
                $tablasConDatos++;
                echo "✅ $descripcion: $count registros\n";
            } else {
                echo "❌ $descripcion: 0 registros\n";
            }
        } else {
            echo "❌ $descripcion: Tabla no existe\n";
        }
    } catch (Exception $e) {
        echo "❌ $descripcion: Error - " . $e->getMessage() . "\n";
    }
}

echo "\n🎯 RESUMEN:\n";
echo "   📊 Tablas procesadas: $totalTablas\n";
echo "   ✅ Tablas con datos: $tablasConDatos\n";
echo "   📈 Éxito: " . round(($tablasConDatos / $totalTablas) * 100, 1) . "%\n";

if ($tablasConDatos === $totalTablas) {
    echo "\n🎉 ¡DATOS BÁSICOS POBLADOS EXITOSAMENTE!\n";
    echo "✅ El modal de edición ahora debería funcionar correctamente\n";
    echo "✅ Todas las opciones de dropdown tendrán datos disponibles\n";
} else {
    echo "\n⚠️  Algunas tablas no pudieron ser pobladas\n";
    echo "🔧 Revisa los errores anteriores y corrige los problemas\n";
}

echo "\n💡 PRÓXIMOS PASOS:\n";
echo "1. Probar el endpoint de verificación nuevamente\n";
echo "2. Verificar que las opciones de dropdown tengan datos\n";
echo "3. Probar el modal de edición en el frontend\n";
echo "4. Verificar que todos los campos se pre-populen correctamente\n";

?>
