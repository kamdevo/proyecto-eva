<?php
/**
 * Script de verificación de base de datos para el sistema de equipos biomédicos
 * Verifica que los equipos y datos relacionados se agreguen correctamente a la BD
 */

require_once __DIR__ . '/eva-backend/vendor/autoload.php';

use Illuminate\Database\Capsule\Manager as Capsule;
use Illuminate\Database\Schema\Blueprint;

// Configuración de la base de datos
$capsule = new Capsule;
$capsule->addConnection([
    'driver' => 'mysql',
    'host' => env('DB_HOST', 'localhost'),
    'database' => env('DB_DATABASE', 'eva_huv'),
    'username' => env('DB_USERNAME', 'root'),
    'password' => env('DB_PASSWORD', ''),
    'charset' => 'utf8mb4',
    'collation' => 'utf8mb4_unicode_ci',
    'prefix' => '',
]);

$capsule->setAsGlobal();
$capsule->bootEloquent();

class DatabaseVerification
{
    private $results = [];
    private $errors = [];

    public function runAllTests()
    {
        echo "🔍 Iniciando verificación de base de datos...\n\n";

        $this->testDatabaseConnection();
        $this->verifyTableStructures();
        $this->verifyRelationships();
        $this->verifyConstraints();
        $this->testEquipmentInsertion();
        $this->verifyDataIntegrity();

        $this->printResults();
    }

    private function testDatabaseConnection()
    {
        echo "📡 Probando conexión a la base de datos...\n";
        
        try {
            $result = Capsule::select('SELECT 1 as test');
            if ($result[0]->test == 1) {
                $this->results['connection'] = '✅ Conexión exitosa';
            }
        } catch (Exception $e) {
            $this->errors['connection'] = '❌ Error de conexión: ' . $e->getMessage();
        }
    }

    private function verifyTableStructures()
    {
        echo "🏗️ Verificando estructura de tablas...\n";

        $requiredTables = [
            'equipos' => [
                'id', 'name', 'serial', 'code', 'marca', 'modelo', 'descripcion',
                'codigo_antiguo', 'codigo_inventario', 'centro_costo', 'pais_origen',
                'servicio_id', 'area_id', 'sede_id', 'localizacion_actual',
                'tadquisicion_id', 'garantia', 'activo_comodato',
                'fecha_adquisicion', 'fecha_instalacion', 'fecha_recepcion_almacen',
                'fecha_acta_recibo', 'fecha_inicio_operacion', 'fecha_fabricacion',
                'costo', 'vida_util', 'fuente_id', 'tecnologia_id',
                'evaluacion_desempeno', 'calibracion', 'periodicidad_calibracion',
                'frecuencia_id', 'funcionalidad', 'disponibilidad_id', 'estadoequipo_id',
                'manual_operacion', 'manual_mantenimiento', 'manual_partes', 'manual_otros',
                'plano_electrico', 'plano_electronico', 'plano_neumatico', 'plano_mecanico',
                'cbiomedica_id', 'criesgo_id', 'componentes', 'propietario_id',
                'verificacion_fisica', 'observaciones', 'image', 'archivo_hoja_vida',
                'invima', 'tipo_id', 'usuario_id', 'status', 'created_at', 'updated_at'
            ],
            'servicios' => ['id', 'name', 'status', 'created_at', 'updated_at'],
            'areas' => ['id', 'name', 'servicio_id', 'status', 'created_at', 'updated_at'],
            'propietarios' => ['id', 'name', 'status', 'created_at', 'updated_at'],
            'fuentes_alimentacion' => ['id', 'name', 'status', 'created_at', 'updated_at'],
            'tecnologias' => ['id', 'name', 'status', 'created_at', 'updated_at'],
            'frecuencias_mantenimiento' => ['id', 'name', 'status', 'created_at', 'updated_at'],
            'clasificaciones_biomedicas' => ['id', 'name', 'status', 'created_at', 'updated_at'],
            'clasificaciones_riesgo' => ['id', 'name', 'status', 'created_at', 'updated_at'],
            'tipos_adquisicion' => ['id', 'name', 'status', 'created_at', 'updated_at'],
            'estados_equipo' => ['id', 'name', 'status', 'created_at', 'updated_at'],
            'disponibilidad' => ['id', 'name', 'status', 'created_at', 'updated_at'],
            'sedes' => ['id', 'name', 'status', 'created_at', 'updated_at']
        ];

        foreach ($requiredTables as $table => $columns) {
            try {
                $tableColumns = Capsule::getSchemaBuilder()->getColumnListing($table);
                $missingColumns = array_diff($columns, $tableColumns);
                
                if (empty($missingColumns)) {
                    $this->results["table_$table"] = "✅ Tabla $table: estructura correcta";
                } else {
                    $this->errors["table_$table"] = "❌ Tabla $table: faltan columnas: " . implode(', ', $missingColumns);
                }
            } catch (Exception $e) {
                $this->errors["table_$table"] = "❌ Tabla $table: no existe o error: " . $e->getMessage();
            }
        }
    }

    private function verifyRelationships()
    {
        echo "🔗 Verificando relaciones entre tablas...\n";

        $relationships = [
            'equipos.servicio_id -> servicios.id',
            'equipos.area_id -> areas.id',
            'equipos.propietario_id -> propietarios.id',
            'equipos.fuente_id -> fuentes_alimentacion.id',
            'equipos.tecnologia_id -> tecnologias.id',
            'equipos.frecuencia_id -> frecuencias_mantenimiento.id',
            'equipos.cbiomedica_id -> clasificaciones_biomedicas.id',
            'equipos.criesgo_id -> clasificaciones_riesgo.id',
            'equipos.tadquisicion_id -> tipos_adquisicion.id',
            'equipos.estadoequipo_id -> estados_equipo.id',
            'equipos.disponibilidad_id -> disponibilidad.id',
            'areas.servicio_id -> servicios.id'
        ];

        foreach ($relationships as $relationship) {
            try {
                // Verificar que existan datos en las tablas relacionadas
                list($source, $target) = explode(' -> ', $relationship);
                list($sourceTable, $sourceColumn) = explode('.', $source);
                list($targetTable, $targetColumn) = explode('.', $target);

                $targetCount = Capsule::table($targetTable)->count();
                
                if ($targetCount > 0) {
                    $this->results["relation_$sourceTable"] = "✅ Relación $relationship: datos disponibles ($targetCount registros)";
                } else {
                    $this->errors["relation_$sourceTable"] = "⚠️ Relación $relationship: tabla destino vacía";
                }
            } catch (Exception $e) {
                $this->errors["relation_$sourceTable"] = "❌ Relación $relationship: error - " . $e->getMessage();
            }
        }
    }

    private function verifyConstraints()
    {
        echo "🔒 Verificando restricciones y índices...\n";

        try {
            // Verificar índices únicos
            $uniqueFields = ['code', 'serial', 'codigo_antiguo'];
            foreach ($uniqueFields as $field) {
                $duplicates = Capsule::table('equipos')
                    ->select($field)
                    ->whereNotNull($field)
                    ->where($field, '!=', '')
                    ->groupBy($field)
                    ->havingRaw('COUNT(*) > 1')
                    ->count();

                if ($duplicates == 0) {
                    $this->results["unique_$field"] = "✅ Campo $field: unicidad mantenida";
                } else {
                    $this->errors["unique_$field"] = "❌ Campo $field: $duplicates duplicados encontrados";
                }
            }
        } catch (Exception $e) {
            $this->errors['constraints'] = "❌ Error verificando restricciones: " . $e->getMessage();
        }
    }

    private function testEquipmentInsertion()
    {
        echo "💾 Probando inserción de equipo de prueba...\n";

        try {
            $testData = [
                'name' => 'Equipo Test Verificación ' . time(),
                'serial' => 'TEST-SERIAL-' . time(),
                'code' => 'TEST-CODE-' . time(),
                'marca' => 'MARCA TEST',
                'modelo' => 'MODELO TEST',
                'descripcion' => 'Equipo de prueba para verificación de BD',
                'codigo_antiguo' => 'OLD-TEST-' . time(),
                'codigo_inventario' => 'INV-TEST-' . time(),
                'centro_costo' => 'CC-TEST',
                'pais_origen' => 'Colombia',
                'servicio_id' => 1,
                'area_id' => 1,
                'sede_id' => 1,
                'localizacion_actual' => 'Sala de pruebas',
                'tadquisicion_id' => 1,
                'garantia' => '2 años',
                'fecha_adquisicion' => '2023-01-15',
                'fecha_instalacion' => '2023-02-01',
                'fecha_recepcion_almacen' => '2023-01-10',
                'fecha_acta_recibo' => '2023-01-20',
                'fecha_inicio_operacion' => '2023-02-05',
                'fecha_fabricacion' => '2022-12-01',
                'costo' => 50000000,
                'vida_util' => 10,
                'fuente_id' => 1,
                'tecnologia_id' => 1,
                'evaluacion_desempeno' => 'excelente',
                'calibracion' => true,
                'periodicidad_calibracion' => '12 meses',
                'frecuencia_id' => 1,
                'funcionalidad' => 'optima',
                'disponibilidad_id' => 1,
                'estadoequipo_id' => 1,
                'manual_operacion' => true,
                'manual_mantenimiento' => true,
                'manual_partes' => false,
                'manual_otros' => false,
                'plano_electrico' => true,
                'plano_electronico' => false,
                'plano_neumatico' => false,
                'plano_mecanico' => true,
                'cbiomedica_id' => 1,
                'criesgo_id' => 1,
                'componentes' => 'Componentes de prueba',
                'propietario_id' => 1,
                'verificacion_fisica' => 'realizada',
                'observaciones' => 'Equipo de prueba para verificación',
                'invima' => 'REG-TEST-001',
                'tipo_id' => 1,
                'usuario_id' => 1,
                'status' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ];

            $equipmentId = Capsule::table('equipos')->insertGetId($testData);
            
            if ($equipmentId) {
                $this->results['insertion'] = "✅ Inserción exitosa: Equipo ID $equipmentId creado";
                
                // Verificar que se insertó correctamente
                $inserted = Capsule::table('equipos')->find($equipmentId);
                if ($inserted && $inserted->name === $testData['name']) {
                    $this->results['insertion_verify'] = "✅ Verificación: Datos insertados correctamente";
                    
                    // Limpiar datos de prueba
                    Capsule::table('equipos')->where('id', $equipmentId)->delete();
                    $this->results['cleanup'] = "✅ Limpieza: Datos de prueba eliminados";
                } else {
                    $this->errors['insertion_verify'] = "❌ Verificación: Datos no coinciden";
                }
            } else {
                $this->errors['insertion'] = "❌ Error en inserción: No se obtuvo ID";
            }
        } catch (Exception $e) {
            $this->errors['insertion'] = "❌ Error en inserción: " . $e->getMessage();
        }
    }

    private function verifyDataIntegrity()
    {
        echo "🔍 Verificando integridad de datos existentes...\n";

        try {
            // Verificar equipos con relaciones válidas
            $invalidRelations = Capsule::table('equipos as e')
                ->leftJoin('servicios as s', 'e.servicio_id', '=', 's.id')
                ->leftJoin('areas as a', 'e.area_id', '=', 'a.id')
                ->leftJoin('propietarios as p', 'e.propietario_id', '=', 'p.id')
                ->whereNull('s.id')
                ->orWhereNull('a.id')
                ->orWhereNull('p.id')
                ->count();

            if ($invalidRelations == 0) {
                $this->results['data_integrity'] = "✅ Integridad: Todas las relaciones son válidas";
            } else {
                $this->errors['data_integrity'] = "❌ Integridad: $invalidRelations equipos con relaciones inválidas";
            }

            // Verificar campos obligatorios
            $missingRequired = Capsule::table('equipos')
                ->where(function($query) {
                    $query->whereNull('name')
                          ->orWhereNull('serial')
                          ->orWhereNull('code')
                          ->orWhere('name', '')
                          ->orWhere('serial', '')
                          ->orWhere('code', '');
                })
                ->count();

            if ($missingRequired == 0) {
                $this->results['required_fields'] = "✅ Campos obligatorios: Todos completos";
            } else {
                $this->errors['required_fields'] = "❌ Campos obligatorios: $missingRequired equipos con campos vacíos";
            }

        } catch (Exception $e) {
            $this->errors['data_integrity'] = "❌ Error verificando integridad: " . $e->getMessage();
        }
    }

    private function printResults()
    {
        echo "\n" . str_repeat("=", 60) . "\n";
        echo "📊 RESULTADOS DE VERIFICACIÓN DE BASE DE DATOS\n";
        echo str_repeat("=", 60) . "\n\n";

        if (!empty($this->results)) {
            echo "✅ PRUEBAS EXITOSAS:\n";
            foreach ($this->results as $test => $result) {
                echo "   $result\n";
            }
            echo "\n";
        }

        if (!empty($this->errors)) {
            echo "❌ ERRORES ENCONTRADOS:\n";
            foreach ($this->errors as $test => $error) {
                echo "   $error\n";
            }
            echo "\n";
        }

        $totalTests = count($this->results) + count($this->errors);
        $passedTests = count($this->results);
        $failedTests = count($this->errors);

        echo "📈 RESUMEN:\n";
        echo "   Total de pruebas: $totalTests\n";
        echo "   Exitosas: $passedTests\n";
        echo "   Fallidas: $failedTests\n";
        echo "   Porcentaje de éxito: " . round(($passedTests / $totalTests) * 100, 2) . "%\n\n";

        if ($failedTests == 0) {
            echo "🎉 ¡TODAS LAS VERIFICACIONES PASARON! La base de datos está correctamente configurada.\n";
        } else {
            echo "⚠️  Se encontraron $failedTests errores que deben ser corregidos.\n";
        }
    }
}

// Ejecutar verificación
if (php_sapi_name() === 'cli') {
    $verification = new DatabaseVerification();
    $verification->runAllTests();
}
?>
