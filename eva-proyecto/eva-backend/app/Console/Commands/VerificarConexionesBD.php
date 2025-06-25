<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
// Importaciones de modelos se harán dinámicamente para evitar errores
use Exception;

class VerificarConexionesBD extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'db:verificar-conexiones {--tabla=} {--detallado}';

    /**
     * The console command description.
     */
    protected $description = 'Verifica todas las conexiones a la base de datos y valida la integridad de tablas y modelos';

    /**
     * Lista de tablas principales del sistema
     */
    protected $tablasPrincipales = [
        'equipos',
        'usuarios', 
        'areas',
        'servicios',
        'propietarios',
        'contingencias',
        'mantenimiento',
        'calibracion',
        'roles',
        'empresas',
        'archivos',
        'observaciones'
    ];

    /**
     * Lista de modelos principales con sus tablas correspondientes
     */
    protected $modelosTablas = [
        'Equipo' => 'equipos',
        'Usuario' => 'usuarios',
        'Area' => 'areas', 
        'Servicio' => 'servicios',
        'Propietario' => 'propietarios',
        'Contingencia' => 'contingencias',
        'Mantenimiento' => 'mantenimiento',
        'Calibracion' => 'calibracion'
    ];

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🔍 INICIANDO VERIFICACIÓN DE CONEXIONES A BASE DE DATOS');
        $this->info('================================================');
        
        $tabla = $this->option('tabla');
        $detallado = $this->option('detallado');
        
        try {
            // 1. Verificar conexión general
            $this->verificarConexionGeneral();
            
            // 2. Verificar tablas específicas o todas
            if ($tabla) {
                $this->verificarTablaEspecifica($tabla, $detallado);
            } else {
                $this->verificarTodasLasTablas($detallado);
            }
            
            // 3. Verificar modelos y relaciones
            $this->verificarModelosYRelaciones();
            
            // 4. Verificar integridad referencial
            $this->verificarIntegridadReferencial();
            
            // 5. Generar resumen final
            $this->generarResumenFinal();
            
        } catch (Exception $e) {
            $this->error('❌ Error durante la verificación: ' . $e->getMessage());
            return 1;
        }
        
        return 0;
    }

    /**
     * Verificar conexión general a la base de datos
     */
    protected function verificarConexionGeneral()
    {
        $this->info('1. VERIFICANDO CONEXIÓN GENERAL...');
        
        try {
            $connection = DB::connection();
            $databaseName = $connection->getDatabaseName();
            
            // Probar conexión básica
            DB::select('SELECT 1');
            
            $this->line("✅ Conexión exitosa a la base de datos: <fg=green>{$databaseName}</fg=green>");
            $this->line("📊 Driver: " . config('database.default'));
            $this->line("🏠 Host: " . config('database.connections.mysql.host'));
            $this->line("🔌 Puerto: " . config('database.connections.mysql.port'));
            
        } catch (Exception $e) {
            $this->error('❌ Error de conexión: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Verificar tabla específica
     */
    protected function verificarTablaEspecifica($tabla, $detallado = false)
    {
        $this->info("2. VERIFICANDO TABLA ESPECÍFICA: {$tabla}");
        
        if (!Schema::hasTable($tabla)) {
            $this->error("❌ La tabla '{$tabla}' no existe");
            return;
        }
        
        $this->verificarEstructuraTabla($tabla, $detallado);
        $this->verificarDatosTabla($tabla, $detallado);
    }

    /**
     * Verificar todas las tablas del sistema
     */
    protected function verificarTodasLasTablas($detallado = false)
    {
        $this->info('2. VERIFICANDO TODAS LAS TABLAS DEL SISTEMA...');
        
        $tablasExistentes = [];
        $tablasNoExistentes = [];
        
        foreach ($this->tablasPrincipales as $tabla) {
            if (Schema::hasTable($tabla)) {
                $tablasExistentes[] = $tabla;
                $this->line("✅ Tabla '{$tabla}' existe");
                
                if ($detallado) {
                    $this->verificarEstructuraTabla($tabla, true);
                    $this->verificarDatosTabla($tabla, true);
                }
            } else {
                $tablasNoExistentes[] = $tabla;
                $this->error("❌ Tabla '{$tabla}' NO existe");
            }
        }
        
        $this->newLine();
        $this->info("📊 RESUMEN DE TABLAS:");
        $this->line("✅ Existentes: " . count($tablasExistentes) . " tablas");
        $this->line("❌ No existentes: " . count($tablasNoExistentes) . " tablas");
        
        if (!empty($tablasNoExistentes)) {
            $this->warn("⚠️  Tablas faltantes: " . implode(', ', $tablasNoExistentes));
        }
    }

    /**
     * Verificar estructura de una tabla
     */
    protected function verificarEstructuraTabla($tabla, $detallado = false)
    {
        try {
            $columnas = Schema::getColumnListing($tabla);
            $this->line("  📋 Columnas en '{$tabla}': " . count($columnas));
            
            if ($detallado) {
                foreach ($columnas as $columna) {
                    $this->line("    - {$columna}");
                }
            }
            
        } catch (Exception $e) {
            $this->error("  ❌ Error al obtener estructura de '{$tabla}': " . $e->getMessage());
        }
    }

    /**
     * Verificar datos de una tabla
     */
    protected function verificarDatosTabla($tabla, $detallado = false)
    {
        try {
            $count = DB::table($tabla)->count();
            $this->line("  📊 Registros en '{$tabla}': {$count}");
            
            if ($detallado && $count > 0) {
                $sample = DB::table($tabla)->limit(3)->get();
                $this->line("  📝 Muestra de datos:");
                foreach ($sample as $index => $row) {
                    $this->line("    Registro " . ($index + 1) . ": " . json_encode((array)$row, JSON_UNESCAPED_UNICODE));
                }
            }
            
        } catch (Exception $e) {
            $this->error("  ❌ Error al consultar datos de '{$tabla}': " . $e->getMessage());
        }
    }

    /**
     * Verificar modelos y sus relaciones
     */
    protected function verificarModelosYRelaciones()
    {
        $this->info('3. VERIFICANDO MODELOS Y RELACIONES...');
        
        foreach ($this->modelosTablas as $modelo => $tabla) {
            $this->verificarModelo($modelo, $tabla);
        }
    }

    /**
     * Verificar un modelo específico
     */
    protected function verificarModelo($modelo, $tabla)
    {
        try {
            $modelClass = "App\\Models\\{$modelo}";

            if (!class_exists($modelClass)) {
                $this->error("❌ Modelo '{$modelo}' no existe");
                return;
            }

            // Usar reflexión para evitar problemas de importación
            $reflection = new \ReflectionClass($modelClass);
            if (!$reflection->isInstantiable()) {
                $this->error("❌ Modelo '{$modelo}' no es instanciable");
                return;
            }

            $instance = $reflection->newInstance();
            $modelTable = $instance->getTable();

            if ($modelTable !== $tabla) {
                $this->warn("⚠️  Modelo '{$modelo}' apunta a tabla '{$modelTable}', esperada '{$tabla}'");
            } else {
                $this->line("✅ Modelo '{$modelo}' correctamente configurado para tabla '{$tabla}'");
            }

            // Verificar que se puede consultar
            $count = $modelClass::count();
            $this->line("  📊 Registros via modelo: {$count}");

        } catch (Exception $e) {
            $this->error("❌ Error con modelo '{$modelo}': " . $e->getMessage());
        }
    }

    /**
     * Verificar integridad referencial básica
     */
    protected function verificarIntegridadReferencial()
    {
        $this->info('4. VERIFICANDO INTEGRIDAD REFERENCIAL...');
        
        // Verificar relaciones críticas
        $this->verificarRelacion('equipos', 'servicio_id', 'servicios', 'id');
        $this->verificarRelacion('equipos', 'area_id', 'areas', 'id');
        $this->verificarRelacion('contingencias', 'equipo_id', 'equipos', 'id');
        $this->verificarRelacion('contingencias', 'usuario_id', 'usuarios', 'id');
        $this->verificarRelacion('mantenimiento', 'equipo_id', 'equipos', 'id');
    }

    /**
     * Verificar una relación específica
     */
    protected function verificarRelacion($tablaOrigen, $campoOrigen, $tablaDestino, $campoDestino)
    {
        try {
            if (!Schema::hasTable($tablaOrigen) || !Schema::hasTable($tablaDestino)) {
                $this->warn("⚠️  No se puede verificar relación: tabla faltante");
                return;
            }
            
            $query = "
                SELECT COUNT(*) as huerfanos 
                FROM {$tablaOrigen} o 
                WHERE o.{$campoOrigen} IS NOT NULL 
                AND NOT EXISTS (
                    SELECT 1 FROM {$tablaDestino} d 
                    WHERE d.{$campoDestino} = o.{$campoOrigen}
                )
            ";
            
            $result = DB::select($query);
            $huerfanos = $result[0]->huerfanos;
            
            if ($huerfanos > 0) {
                $this->warn("⚠️  {$huerfanos} registros huérfanos en {$tablaOrigen}.{$campoOrigen} -> {$tablaDestino}.{$campoDestino}");
            } else {
                $this->line("✅ Integridad OK: {$tablaOrigen}.{$campoOrigen} -> {$tablaDestino}.{$campoDestino}");
            }
            
        } catch (Exception $e) {
            $this->error("❌ Error verificando relación: " . $e->getMessage());
        }
    }

    /**
     * Generar resumen final
     */
    protected function generarResumenFinal()
    {
        $this->info('5. RESUMEN FINAL DE VERIFICACIÓN');
        $this->info('================================');
        
        $this->line('✅ Verificación de conexiones completada');
        $this->line('📊 Para más detalles, ejecute con --detallado');
        $this->line('🔍 Para tabla específica, use --tabla=nombre_tabla');
        
        $this->newLine();
        $this->info('🎯 RECOMENDACIONES:');
        $this->line('- Ejecutar migraciones si hay tablas faltantes');
        $this->line('- Revisar seeders para poblar datos de prueba');
        $this->line('- Verificar configuración de claves foráneas');
    }
}
