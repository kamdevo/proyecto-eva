<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

/**
 * Seeder específico para equipos médicos
 * Datos completos y realistas para el sistema EVA
 */
class EquiposSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('🏥 Sembrando equipos médicos completos...');
        
        // Primero crear las tablas de clasificación necesarias
        $this->seedTablasClasificacion();
        
        // Luego crear equipos médicos realistas
        $equipos = [
            // EQUIPOS DE UCI
            [
                'id' => 4,
                'name' => 'Bomba de Infusión Fresenius Kabi Agilia',
                'code' => 'BI-004',
                'descripcion' => 'Bomba de infusión volumétrica para medicamentos',
                'marca' => 'Fresenius Kabi',
                'modelo' => 'Agilia',
                'serial' => 'FK2024004',
                'servicio_id' => 3,
                'area_id' => 5,
                'propietario_id' => 1,
                'fuente_id' => 1,
                'tecnologia_id' => 1,
                'frecuencia_id' => 1,
                'cbiomedica_id' => 3,
                'criesgo_id' => 2,
                'tadquisicion_id' => 1,
                'estadoequipo_id' => 1,
                'tipo_id' => 4,
                'disponibilidad_id' => 1,
                'fecha_instalacion' => '2024-03-01',
                'fecha_fabricacion' => '2023-12-15',
                'vida_util' => 8,
                'costo' => 12000000.00,
                'status' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'id' => 5,
                'name' => 'Cama UCI Stryker InTouch',
                'code' => 'CAMA-005',
                'descripcion' => 'Cama eléctrica para cuidados intensivos',
                'marca' => 'Stryker',
                'modelo' => 'InTouch',
                'serial' => 'ST2024005',
                'servicio_id' => 3,
                'area_id' => 5,
                'propietario_id' => 1,
                'fuente_id' => 1,
                'tecnologia_id' => 2,
                'frecuencia_id' => 3,
                'cbiomedica_id' => 4,
                'criesgo_id' => 1,
                'tadquisicion_id' => 1,
                'estadoequipo_id' => 1,
                'tipo_id' => 5,
                'disponibilidad_id' => 1,
                'fecha_instalacion' => '2024-02-15',
                'fecha_fabricacion' => '2023-11-01',
                'vida_util' => 15,
                'costo' => 18000000.00,
                'status' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            
            // EQUIPOS DE CIRUGÍA
            [
                'id' => 6,
                'name' => 'Electrobisturí Valleylab FT10',
                'code' => 'EB-006',
                'descripcion' => 'Unidad electroquirúrgica para cirugía',
                'marca' => 'Medtronic',
                'modelo' => 'Valleylab FT10',
                'serial' => 'MD2024006',
                'servicio_id' => 2,
                'area_id' => 3,
                'propietario_id' => 1,
                'fuente_id' => 1,
                'tecnologia_id' => 1,
                'frecuencia_id' => 2,
                'cbiomedica_id' => 3,
                'criesgo_id' => 2,
                'tadquisicion_id' => 1,
                'estadoequipo_id' => 1,
                'tipo_id' => 6,
                'disponibilidad_id' => 1,
                'fecha_instalacion' => '2024-01-10',
                'fecha_fabricacion' => '2023-10-20',
                'vida_util' => 10,
                'costo' => 35000000.00,
                'status' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'id' => 7,
                'name' => 'Mesa Quirúrgica Maquet Alphastar',
                'code' => 'MQ-007',
                'descripcion' => 'Mesa quirúrgica universal con control eléctrico',
                'marca' => 'Maquet',
                'modelo' => 'Alphastar',
                'serial' => 'MQ2024007',
                'servicio_id' => 2,
                'area_id' => 3,
                'propietario_id' => 1,
                'fuente_id' => 1,
                'tecnologia_id' => 2,
                'frecuencia_id' => 3,
                'cbiomedica_id' => 4,
                'criesgo_id' => 1,
                'tadquisicion_id' => 1,
                'estadoequipo_id' => 1,
                'tipo_id' => 7,
                'disponibilidad_id' => 1,
                'fecha_instalacion' => '2024-01-05',
                'fecha_fabricacion' => '2023-09-15',
                'vida_util' => 20,
                'costo' => 28000000.00,
                'status' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            
            // EQUIPOS DE URGENCIAS
            [
                'id' => 8,
                'name' => 'Electrocardiógrafo Schiller AT-10 plus',
                'code' => 'ECG-008',
                'descripcion' => 'Electrocardiógrafo de 12 derivaciones',
                'marca' => 'Schiller',
                'modelo' => 'AT-10 plus',
                'serial' => 'SC2024008',
                'servicio_id' => 1,
                'area_id' => 1,
                'propietario_id' => 1,
                'fuente_id' => 2,
                'tecnologia_id' => 1,
                'frecuencia_id' => 2,
                'cbiomedica_id' => 2,
                'criesgo_id' => 1,
                'tadquisicion_id' => 1,
                'estadoequipo_id' => 1,
                'tipo_id' => 8,
                'disponibilidad_id' => 1,
                'fecha_instalacion' => '2024-02-20',
                'fecha_fabricacion' => '2023-12-10',
                'vida_util' => 8,
                'costo' => 8500000.00,
                'status' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'id' => 9,
                'name' => 'Oxímetro de Pulso Masimo Radical-7',
                'code' => 'OX-009',
                'descripcion' => 'Monitor de oximetría de pulso portátil',
                'marca' => 'Masimo',
                'modelo' => 'Radical-7',
                'serial' => 'MS2024009',
                'servicio_id' => 1,
                'area_id' => 1,
                'propietario_id' => 1,
                'fuente_id' => 2,
                'tecnologia_id' => 1,
                'frecuencia_id' => 2,
                'cbiomedica_id' => 2,
                'criesgo_id' => 1,
                'tadquisicion_id' => 1,
                'estadoequipo_id' => 1,
                'tipo_id' => 9,
                'disponibilidad_id' => 1,
                'fecha_instalacion' => '2024-03-10',
                'fecha_fabricacion' => '2024-01-05',
                'vida_util' => 6,
                'costo' => 4200000.00,
                'status' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            
            // EQUIPOS DE LABORATORIO
            [
                'id' => 10,
                'name' => 'Analizador Hematológico Sysmex XN-1000',
                'code' => 'AH-010',
                'descripcion' => 'Analizador automático de hematología',
                'marca' => 'Sysmex',
                'modelo' => 'XN-1000',
                'serial' => 'SX2024010',
                'servicio_id' => 6,
                'area_id' => 6,
                'propietario_id' => 1,
                'fuente_id' => 1,
                'tecnologia_id' => 1,
                'frecuencia_id' => 1,
                'cbiomedica_id' => 2,
                'criesgo_id' => 2,
                'tadquisicion_id' => 1,
                'estadoequipo_id' => 1,
                'tipo_id' => 10,
                'disponibilidad_id' => 1,
                'fecha_instalacion' => '2024-01-25',
                'fecha_fabricacion' => '2023-11-20',
                'vida_util' => 12,
                'costo' => 120000000.00,
                'status' => true,
                'created_at' => now(),
                'updated_at' => now()
            ]
        ];
        
        foreach ($equipos as $equipo) {
            DB::table('equipos')->updateOrInsert(['id' => $equipo['id']], $equipo);
        }
        
        $this->command->info('✅ Equipos médicos sembrados: ' . count($equipos));
    }
    
    private function seedTablasClasificacion(): void
    {
        // Frecuencias de mantenimiento
        $frecuencias = [
            ['id' => 1, 'nombre' => 'Mensual', 'dias' => 30],
            ['id' => 2, 'nombre' => 'Trimestral', 'dias' => 90],
            ['id' => 3, 'nombre' => 'Semestral', 'dias' => 180],
            ['id' => 4, 'nombre' => 'Anual', 'dias' => 365],
        ];
        
        foreach ($frecuencias as $frecuencia) {
            DB::table('frecuenciam')->updateOrInsert(['id' => $frecuencia['id']], $frecuencia);
        }
        
        // Tipos de adquisición
        $adquisiciones = [
            ['id' => 1, 'nombre' => 'Compra', 'descripcion' => 'Adquisición por compra directa'],
            ['id' => 2, 'nombre' => 'Donación', 'descripcion' => 'Equipo donado'],
            ['id' => 3, 'nombre' => 'Comodato', 'descripcion' => 'Equipo en comodato'],
            ['id' => 4, 'nombre' => 'Leasing', 'descripcion' => 'Equipo en leasing'],
        ];
        
        foreach ($adquisiciones as $adquisicion) {
            DB::table('tadquisicion')->updateOrInsert(['id' => $adquisicion['id']], $adquisicion);
        }
        
        // Estados de equipos
        $estados = [
            ['id' => 1, 'nombre' => 'Operativo', 'descripcion' => 'Equipo en funcionamiento normal'],
            ['id' => 2, 'nombre' => 'Mantenimiento', 'descripcion' => 'Equipo en mantenimiento'],
            ['id' => 3, 'nombre' => 'Fuera de Servicio', 'descripcion' => 'Equipo no operativo'],
            ['id' => 4, 'nombre' => 'Baja', 'descripcion' => 'Equipo dado de baja'],
        ];
        
        foreach ($estados as $estado) {
            DB::table('estadoequipos')->updateOrInsert(['id' => $estado['id']], $estado);
        }
        
        // Tipos de equipos
        $tipos = [
            ['id' => 1, 'nombre' => 'Monitor', 'descripcion' => 'Equipos de monitoreo'],
            ['id' => 2, 'nombre' => 'Ventilador', 'descripcion' => 'Equipos de ventilación'],
            ['id' => 3, 'nombre' => 'Desfibrilador', 'descripcion' => 'Equipos de desfibrilación'],
            ['id' => 4, 'nombre' => 'Bomba', 'descripcion' => 'Bombas de infusión'],
            ['id' => 5, 'nombre' => 'Cama', 'descripcion' => 'Camas hospitalarias'],
            ['id' => 6, 'nombre' => 'Electrobisturí', 'descripcion' => 'Equipos electroquirúrgicos'],
            ['id' => 7, 'nombre' => 'Mesa', 'descripcion' => 'Mesas quirúrgicas'],
            ['id' => 8, 'nombre' => 'Electrocardiógrafo', 'descripcion' => 'Equipos de electrocardiografía'],
            ['id' => 9, 'nombre' => 'Oxímetro', 'descripcion' => 'Equipos de oximetría'],
            ['id' => 10, 'nombre' => 'Analizador', 'descripcion' => 'Equipos de análisis clínico'],
        ];
        
        foreach ($tipos as $tipo) {
            DB::table('tipos')->updateOrInsert(['id' => $tipo['id']], $tipo);
        }
        
        // Disponibilidad
        $disponibilidades = [
            ['id' => 1, 'nombre' => 'Disponible', 'descripcion' => 'Equipo disponible para uso'],
            ['id' => 2, 'nombre' => 'En Uso', 'descripcion' => 'Equipo actualmente en uso'],
            ['id' => 3, 'nombre' => 'No Disponible', 'descripcion' => 'Equipo no disponible'],
        ];
        
        foreach ($disponibilidades as $disponibilidad) {
            DB::table('disponibilidad')->updateOrInsert(['id' => $disponibilidad['id']], $disponibilidad);
        }
    }
}
