<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

/**
 * Seeder para Correctivos Generales - Datos de Ejemplo
 * 
 * Seeder para poblar la tabla correctivos_generales con datos
 * de ejemplo que demuestren todas las funcionalidades del sistema.
 * 
 * @package Database\Seeders
 * @author Sistema EVA
 * @version 1.0.0
 */
class CorrectivoGeneralSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Verificar que existan equipos primero
        $equipos = DB::table('equipos')->take(10)->get();
        
        if ($equipos->isEmpty()) {
            $this->command->warn('No hay equipos disponibles. Se crearán equipos de ejemplo...');
            
            // Crear equipos de ejemplo si no existen
            $equiposEjemplo = [
                [
                    'name' => 'Monitor de Signos Vitales PHILIPS MP60',
                    'code' => 'MSV001',
                    'marca' => 'PHILIPS',
                    'modelo' => 'MP60',
                    'serie' => 'PHI2024001',
                    'sede' => 'Hospital Central',
                    'servicio' => 'UCI',
                    'area' => 'Cuidados Intensivos',
                    'estado_actual' => 'Operativo',
                    'servicio_id' => 1,
                    'status' => 1,
                    'created_at' => now()
                ],
                [
                    'name' => 'Ventilador Mecánico DRAGER Evita V500',
                    'code' => 'VME002',
                    'marca' => 'DRAGER',
                    'modelo' => 'Evita V500',
                    'serie' => 'DRA2024002',
                    'sede' => 'Hospital Central',
                    'servicio' => 'UCI',
                    'area' => 'Terapia Respiratoria',
                    'estado_actual' => 'En Mantenimiento',
                    'servicio_id' => 1,
                    'status' => 1,
                    'created_at' => now()
                ],
                [
                    'name' => 'Desfibrilador ZOLL X-Series',
                    'code' => 'DEF003',
                    'marca' => 'ZOLL',
                    'modelo' => 'X-Series',
                    'serie' => 'ZOL2024003',
                    'sede' => 'Hospital Auxiliar',
                    'servicio' => 'Urgencias',
                    'area' => 'Emergencias',
                    'estado_actual' => 'Operativo',
                    'servicio_id' => 2,
                    'status' => 1,
                    'created_at' => now()
                ]
            ];

            foreach ($equiposEjemplo as $equipo) {
                DB::table('equipos')->insert(array_merge($equipo, [
                    'fuente_id' => 1,
                    'tecnologia_id' => 1,
                    'frecuencia_id' => 1,
                    'cbiomedica_id' => 1,
                    'criesgo_id' => 1,
                    'tadquisicion_id' => 1,
                    'invima_id' => 1,
                    'orden_compra_id' => 1,
                    'baja_id' => 1,
                    'estadoequipo_id' => 1,
                    'tipo_id' => 1,
                    'guia_id' => 1,
                    'manual_id' => 1,
                    'disponibilidad_id' => 1,
                    'area_id' => 1,
                    'propietario_id' => 1
                ]));
            }

            $equipos = DB::table('equipos')->take(3)->get();
        }

        // Datos de ejemplo para correctivos generales (textos cortos para campos limitados)
        $correctivos = [
            [
                'equipo_id' => $equipos[0]->id ?? 1,
                'fecha_inicio' => Carbon::now()->subDays(15),
                'code_orden' => 'COR202400001',
                'description' => 'Monitor presenta intermitencia en pantalla y alarmas falsas',
                'diagnostico' => 'Falla en tarjeta principal',
                'code_diagnostico' => 'DIAG001',
                'fecha_diagnostico' => Carbon::now()->subDays(12),
                'code' => 'COR001',
                'fecha_mantenimiento' => Carbon::now()->subDays(2),
                'repuesto_pendiente' => 'TJ01',
                'status' => 1
            ],
            [
                'equipo_id' => $equipos[1]->id ?? 2,
                'fecha_inicio' => Carbon::now()->subDays(8),
                'code_orden' => 'COR202400002',
                'description' => 'Ventilador falla en humidificación y alarma presión',
                'diagnostico' => 'Obstrucción válvulas',
                'code_diagnostico' => 'DIAG002',
                'fecha_diagnostico' => Carbon::now()->subDays(6),
                'code' => 'COR002',
                'fecha_mantenimiento' => null,
                'repuesto_pendiente' => 'FT02',
                'status' => 1
            ],
            [
                'equipo_id' => $equipos[2]->id ?? 3,
                'fecha_inicio' => Carbon::now()->subDays(25),
                'code_orden' => 'COR202400003',
                'description' => 'Desfibrilador no enciende - falla alimentación',
                'diagnostico' => 'Falla fuente poder',
                'code_diagnostico' => 'DIAG003',
                'fecha_diagnostico' => Carbon::now()->subDays(22),
                'code' => 'COR003',
                'fecha_mantenimiento' => Carbon::now()->subDays(12),
                'repuesto_pendiente' => 'CP03',
                'status' => 1
            ],
            [
                'equipo_id' => $equipos[0]->id ?? 1,
                'fecha_inicio' => Carbon::now()->subDays(3),
                'code_orden' => 'COR202400004',
                'description' => 'Monitor ruido excesivo en ECG',
                'diagnostico' => 'Pendiente',
                'code_diagnostico' => '',
                'fecha_diagnostico' => null,
                'code' => 'COR004',
                'fecha_mantenimiento' => null,
                'repuesto_pendiente' => '',
                'status' => 1
            ],
            [
                'equipo_id' => $equipos[1]->id ?? 2,
                'fecha_inicio' => Carbon::now()->subDays(30),
                'code_orden' => 'COR202400005',
                'description' => 'Ventilador fuga aire circuito paciente',
                'diagnostico' => 'Fugas múltiples',
                'code_diagnostico' => 'DIAG005',
                'fecha_diagnostico' => Carbon::now()->subDays(28),
                'code' => 'COR005',
                'fecha_mantenimiento' => Carbon::now()->subDays(20),
                'repuesto_pendiente' => 'CR05',
                'status' => 1
            ]
        ];

        foreach ($correctivos as $correctivo) {
            DB::table('correctivos_generales')->insert($correctivo);
        }

        $this->command->info('Se han creado ' . count($correctivos) . ' registros de correctivos generales de ejemplo.');
    }
}
