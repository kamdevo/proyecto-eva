<?php
/**
 * VERIFICACIÓN COMPLETA DE DATOS EN BASE DE DATOS
 * Script para verificar que los datos de equipos se están registrando correctamente
 */

require_once __DIR__ . '/vendor/autoload.php';

use Illuminate\Database\Capsule\Manager as Capsule;
use Illuminate\Database\Schema\Blueprint;

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

echo "🔍 VERIFICACIÓN COMPLETA DE DATOS EN BASE DE DATOS\n";
echo "=" . str_repeat("=", 60) . "\n\n";

/**
 * Verificar estructura de la tabla equipos
 */
function verificarEstructuraTabla() {
    echo "📋 VERIFICANDO ESTRUCTURA DE LA TABLA EQUIPOS\n";
    echo "-" . str_repeat("-", 50) . "\n";
    
    try {
        $columns = Capsule::select("SHOW COLUMNS FROM equipos");
        
        echo "✅ Tabla 'equipos' encontrada con " . count($columns) . " columnas:\n\n";
        
        $requiredFields = [
            'id', 'name', 'descripcion', 'serial', 'code', 'marca', 'modelo',
            'servicio_id', 'area_id', 'propietario_id', 'cbiomedica_id', 'criesgo_id',
            'fuente_id', 'tecnologia_id', 'frecuencia_id', 'estadoequipo_id',
            'fecha_fabricacion', 'fecha_instalacion', 'fecha_ad', 'vida_util',
            'costo', 'calibracion', 'observacion', 'image', 'invima'
        ];
        
        $foundFields = [];
        foreach ($columns as $column) {
            $foundFields[] = $column->Field;
            if (in_array($column->Field, $requiredFields)) {
                echo "✅ {$column->Field} ({$column->Type}) - " . 
                     ($column->Null === 'YES' ? 'NULLABLE' : 'NOT NULL') . "\n";
            }
        }
        
        $missingFields = array_diff($requiredFields, $foundFields);
        if (!empty($missingFields)) {
            echo "\n❌ CAMPOS FALTANTES:\n";
            foreach ($missingFields as $field) {
                echo "   - $field\n";
            }
        } else {
            echo "\n✅ Todos los campos requeridos están presentes\n";
        }
        
        return true;
    } catch (Exception $e) {
        echo "❌ Error verificando estructura: " . $e->getMessage() . "\n";
        return false;
    }
}

/**
 * Verificar datos de equipos existentes
 */
function verificarDatosEquipos() {
    echo "\n📊 VERIFICANDO DATOS DE EQUIPOS EXISTENTES\n";
    echo "-" . str_repeat("-", 50) . "\n";
    
    try {
        $totalEquipos = Capsule::table('equipos')->count();
        echo "📈 Total de equipos en la base de datos: $totalEquipos\n\n";
        
        if ($totalEquipos === 0) {
            echo "⚠️  No hay equipos en la base de datos para verificar\n";
            return false;
        }
        
        // Obtener una muestra de equipos
        $equipos = Capsule::table('equipos')
            ->limit(5)
            ->get();
        
        echo "🔍 MUESTRA DE EQUIPOS (primeros 5):\n\n";
        
        foreach ($equipos as $equipo) {
            echo "📋 EQUIPO ID: {$equipo->id}\n";
            echo "   Nombre: " . ($equipo->name ?: 'NO DEFINIDO') . "\n";
            echo "   Código: " . ($equipo->code ?: 'NO DEFINIDO') . "\n";
            echo "   Serie: " . ($equipo->serial ?: 'NO DEFINIDO') . "\n";
            echo "   Marca: " . ($equipo->marca ?: 'NO DEFINIDO') . "\n";
            echo "   Modelo: " . ($equipo->modelo ?: 'NO DEFINIDO') . "\n";
            echo "   Servicio ID: " . ($equipo->servicio_id ?: 'NO DEFINIDO') . "\n";
            echo "   Propietario ID: " . ($equipo->propietario_id ?: 'NO DEFINIDO') . "\n";
            echo "   Estado Equipo ID: " . ($equipo->estadoequipo_id ?: 'NO DEFINIDO') . "\n";
            echo "   Clasificación Biomédica ID: " . ($equipo->cbiomedica_id ?: 'NO DEFINIDO') . "\n";
            echo "   Clasificación Riesgo ID: " . ($equipo->criesgo_id ?: 'NO DEFINIDO') . "\n";
            echo "   Calibración: " . ($equipo->calibracion ?: 'NO DEFINIDO') . "\n";
            echo "   Fecha Fabricación: " . ($equipo->fecha_fabricacion ?: 'NO DEFINIDO') . "\n";
            echo "   Observación: " . (substr($equipo->observacion ?: 'NO DEFINIDO', 0, 50)) . "\n";
            echo "   " . str_repeat("-", 40) . "\n\n";
        }
        
        return true;
    } catch (Exception $e) {
        echo "❌ Error verificando datos: " . $e->getMessage() . "\n";
        return false;
    }
}

/**
 * Verificar tablas relacionadas
 */
function verificarTablasRelacionadas() {
    echo "🔗 VERIFICANDO TABLAS RELACIONADAS\n";
    echo "-" . str_repeat("-", 50) . "\n";
    
    $tablas = [
        'servicios' => 'Servicios',
        'areas' => 'Áreas',
        'propietarios' => 'Propietarios',
        'estadoequipos' => 'Estados de Equipo',
        'cbiomedicas' => 'Clasificaciones Biomédicas',
        'criesgos' => 'Clasificaciones de Riesgo',
        'fuentes' => 'Fuentes de Alimentación',
        'tecnologias' => 'Tecnologías',
        'frecuencias' => 'Frecuencias de Mantenimiento'
    ];
    
    foreach ($tablas as $tabla => $descripcion) {
        try {
            $count = Capsule::table($tabla)->count();
            echo "✅ $descripcion ($tabla): $count registros\n";
            
            if ($count > 0) {
                $sample = Capsule::table($tabla)->first();
                $nameField = isset($sample->name) ? $sample->name : 
                           (isset($sample->nombre) ? $sample->nombre : 'N/A');
                echo "   Ejemplo: ID {$sample->id} - $nameField\n";
            }
        } catch (Exception $e) {
            echo "❌ $descripcion ($tabla): Error - " . $e->getMessage() . "\n";
        }
    }
    
    return true;
}

/**
 * Verificar un equipo específico con todas sus relaciones
 */
function verificarEquipoCompleto($equipoId = null) {
    echo "\n🔍 VERIFICACIÓN DETALLADA DE EQUIPO ESPECÍFICO\n";
    echo "-" . str_repeat("-", 50) . "\n";
    
    if (!$equipoId) {
        $equipoId = Capsule::table('equipos')->value('id');
        if (!$equipoId) {
            echo "❌ No hay equipos disponibles para verificar\n";
            return false;
        }
    }
    
    echo "📋 Verificando equipo ID: $equipoId\n\n";
    
    try {
        $equipo = Capsule::table('equipos')
            ->leftJoin('servicios', 'equipos.servicio_id', '=', 'servicios.id')
            ->leftJoin('areas', 'equipos.area_id', '=', 'areas.id')
            ->leftJoin('propietarios', 'equipos.propietario_id', '=', 'propietarios.id')
            ->leftJoin('estadoequipos', 'equipos.estadoequipo_id', '=', 'estadoequipos.id')
            ->leftJoin('cbiomedicas', 'equipos.cbiomedica_id', '=', 'cbiomedicas.id')
            ->leftJoin('criesgos', 'equipos.criesgo_id', '=', 'criesgos.id')
            ->select(
                'equipos.*',
                'servicios.name as servicio_nombre',
                'areas.name as area_nombre',
                'propietarios.nombre as propietario_nombre',
                'estadoequipos.name as estado_nombre',
                'cbiomedicas.name as clasificacion_biomedica',
                'criesgos.name as clasificacion_riesgo'
            )
            ->where('equipos.id', $equipoId)
            ->first();
        
        if (!$equipo) {
            echo "❌ Equipo no encontrado\n";
            return false;
        }
        
        echo "✅ DATOS COMPLETOS DEL EQUIPO:\n\n";
        
        // Información básica
        echo "📌 INFORMACIÓN BÁSICA:\n";
        echo "   ID: {$equipo->id}\n";
        echo "   Nombre: " . ($equipo->name ?: '❌ VACÍO') . "\n";
        echo "   Código: " . ($equipo->code ?: '❌ VACÍO') . "\n";
        echo "   Serie: " . ($equipo->serial ?: '❌ VACÍO') . "\n";
        echo "   Marca: " . ($equipo->marca ?: '❌ VACÍO') . "\n";
        echo "   Modelo: " . ($equipo->modelo ?: '❌ VACÍO') . "\n";
        echo "   INVIMA: " . ($equipo->invima ?: '❌ VACÍO') . "\n";
        
        // Relaciones
        echo "\n🔗 RELACIONES:\n";
        echo "   Servicio: " . ($equipo->servicio_nombre ?: '❌ NO RELACIONADO') . " (ID: {$equipo->servicio_id})\n";
        echo "   Área: " . ($equipo->area_nombre ?: '❌ NO RELACIONADO') . " (ID: {$equipo->area_id})\n";
        echo "   Propietario: " . ($equipo->propietario_nombre ?: '❌ NO RELACIONADO') . " (ID: {$equipo->propietario_id})\n";
        echo "   Estado: " . ($equipo->estado_nombre ?: '❌ NO RELACIONADO') . " (ID: {$equipo->estadoequipo_id})\n";
        echo "   Clasificación Biomédica: " . ($equipo->clasificacion_biomedica ?: '❌ NO RELACIONADO') . " (ID: {$equipo->cbiomedica_id})\n";
        echo "   Clasificación Riesgo: " . ($equipo->clasificacion_riesgo ?: '❌ NO RELACIONADO') . " (ID: {$equipo->criesgo_id})\n";
        
        // Fechas
        echo "\n📅 FECHAS:\n";
        echo "   Fabricación: " . ($equipo->fecha_fabricacion ?: '❌ VACÍO') . "\n";
        echo "   Instalación: " . ($equipo->fecha_instalacion ?: '❌ VACÍO') . "\n";
        echo "   Adquisición: " . ($equipo->fecha_ad ?: '❌ VACÍO') . "\n";
        
        // Otros campos importantes
        echo "\n⚙️ CONFIGURACIÓN TÉCNICA:\n";
        echo "   Vida Útil: " . ($equipo->vida_util ?: '❌ VACÍO') . "\n";
        echo "   Costo: " . ($equipo->costo ?: '❌ VACÍO') . "\n";
        echo "   Calibración: " . ($equipo->calibracion ?: '❌ VACÍO') . "\n";
        echo "   Movilidad: " . ($equipo->movilidad ?: '❌ VACÍO') . "\n";
        
        echo "\n📝 OBSERVACIONES:\n";
        echo "   " . ($equipo->observacion ?: '❌ VACÍO') . "\n";
        
        return true;
    } catch (Exception $e) {
        echo "❌ Error verificando equipo: " . $e->getMessage() . "\n";
        return false;
    }
}

/**
 * Generar reporte de campos vacíos
 */
function generarReporteCamposVacios() {
    echo "\n📊 REPORTE DE CAMPOS VACÍOS\n";
    echo "-" . str_repeat("-", 50) . "\n";
    
    try {
        $totalEquipos = Capsule::table('equipos')->count();
        
        if ($totalEquipos === 0) {
            echo "❌ No hay equipos para analizar\n";
            return false;
        }
        
        $camposImportantes = [
            'name' => 'Nombre',
            'code' => 'Código',
            'serial' => 'Serie',
            'marca' => 'Marca',
            'modelo' => 'Modelo',
            'servicio_id' => 'Servicio',
            'propietario_id' => 'Propietario',
            'estadoequipo_id' => 'Estado',
            'cbiomedica_id' => 'Clasificación Biomédica',
            'criesgo_id' => 'Clasificación Riesgo'
        ];
        
        echo "📈 Análisis de completitud de datos ($totalEquipos equipos):\n\n";
        
        foreach ($camposImportantes as $campo => $descripcion) {
            $vacios = Capsule::table('equipos')
                ->where(function($query) use ($campo) {
                    $query->whereNull($campo)
                          ->orWhere($campo, '')
                          ->orWhere($campo, '0');
                })
                ->count();
            
            $completos = $totalEquipos - $vacios;
            $porcentaje = round(($completos / $totalEquipos) * 100, 1);
            
            $status = $porcentaje >= 80 ? '✅' : ($porcentaje >= 50 ? '⚠️' : '❌');
            
            echo "$status $descripcion: $completos/$totalEquipos ($porcentaje%)\n";
        }
        
        return true;
    } catch (Exception $e) {
        echo "❌ Error generando reporte: " . $e->getMessage() . "\n";
        return false;
    }
}

// Ejecutar todas las verificaciones
echo "🚀 INICIANDO VERIFICACIÓN COMPLETA...\n\n";

$resultados = [
    'estructura' => verificarEstructuraTabla(),
    'datos' => verificarDatosEquipos(),
    'relaciones' => verificarTablasRelacionadas(),
    'equipo_completo' => verificarEquipoCompleto(),
    'campos_vacios' => generarReporteCamposVacios()
];

echo "\n" . str_repeat("=", 60) . "\n";
echo "📊 RESUMEN DE VERIFICACIÓN:\n";

$exitosos = 0;
foreach ($resultados as $prueba => $resultado) {
    $status = $resultado ? '✅' : '❌';
    echo "$status " . ucfirst(str_replace('_', ' ', $prueba)) . "\n";
    if ($resultado) $exitosos++;
}

echo "\n🎯 RESULTADO FINAL: $exitosos/" . count($resultados) . " verificaciones exitosas\n";

if ($exitosos === count($resultados)) {
    echo "🎉 ¡Todos los datos están correctamente registrados en la base de datos!\n";
} else {
    echo "⚠️  Se encontraron problemas en la base de datos que deben ser corregidos.\n";
}

echo "\n💡 PRÓXIMOS PASOS:\n";
echo "1. Revisar los resultados de la verificación\n";
echo "2. Corregir cualquier problema encontrado\n";
echo "3. Verificar que el endpoint /v1/equipos/{id}/complete-info funcione correctamente\n";
echo "4. Probar el modal de edición con datos reales\n";

?>
