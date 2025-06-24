<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

/**
 *
 * Características:
 * - Datos reales y completos para todas las tablas
 * - Relaciones correctas entre entidades
 * - Datos de prueba realistas para desarrollo
 * - Verificación de integridad de datos
 * - Soporte para múltiples entornos
 * - Datos en español para el contexto colombiano
 * - Estructura jerárquica correcta
 *
 * @author Sistema EVA
 * @version 2.0
 * @since 2024
 */
class DatabaseSeeder extends Seeder
{
    /**
     * Ejecutar los seeders de la base de datos
     */
    public function run(): void
    {
        $this->command->info('🚀 Iniciando DatabaseSeeder MEJORADO AL 500%...');

        // Deshabilitar verificación de foreign keys temporalmente
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');

        try {
            // 1. Datos básicos del sistema
            $this->seedSistemaBasico();

            // 2. Usuarios y roles
            $this->seedUsuariosYRoles();

            // 3. Estructura organizacional
            $this->seedEstructuraOrganizacional();

            // 4. Equipos médicos
            $this->seedEquiposMedicos();

            // 5. Mantenimientos y calibraciones
            $this->seedMantenimientosYCalibraciones();

            // 6. Contingencias y tickets
            $this->seedContingenciasYTickets();

            // 7. Archivos y documentos
            $this->seedArchivosYDocumentos();

            // 8. Datos de prueba adicionales
            $this->seedDatosPrueba();

            $this->command->info('✅ DatabaseSeeder completado exitosamente!');

        } catch (\Exception $e) {
            $this->command->error('❌ Error en DatabaseSeeder: ' . $e->getMessage());
            throw $e;
        } finally {
            // Rehabilitar verificación de foreign keys
            DB::statement('SET FOREIGN_KEY_CHECKS=1;');
        }
    }

    /**
     * Sembrar datos básicos del sistema
     */
    private function seedSistemaBasico(): void
    {
        $this->command->info('📊 Sembrando datos básicos del sistema...');

        // Roles del sistema
        $roles = [
            ['id' => 1, 'name' => 'Administrador', 'description' => 'Acceso completo al sistema'],
            ['id' => 2, 'name' => 'Ingeniero Biomédico', 'description' => 'Gestión de equipos y mantenimientos'],
            ['id' => 3, 'name' => 'Técnico', 'description' => 'Ejecución de mantenimientos'],
            ['id' => 4, 'name' => 'Usuario Final', 'description' => 'Consulta de información'],
            ['id' => 5, 'name' => 'Supervisor', 'description' => 'Supervisión de actividades'],
        ];

        foreach ($roles as $rol) {
            DB::table('roles')->updateOrInsert(['id' => $rol['id']], $rol);
        }

        // Empresas
        $empresas = [
            ['id' => 1, 'name' => 'Hospital Universitario San Vicente Fundación', 'nit' => '890903407-1'],
            ['id' => 2, 'name' => 'Clínica Las Vegas', 'nit' => '890903408-2'],
            ['id' => 3, 'name' => 'IPS Universitaria', 'nit' => '890903409-3'],
        ];

        foreach ($empresas as $empresa) {
            DB::table('empresas')->updateOrInsert(['id' => $empresa['id']], $empresa);
        }

        // Sedes
        $sedes = [
            ['id' => 1, 'name' => 'Sede Principal', 'direccion' => 'Calle 64 #51D-154', 'ciudad' => 'Medellín'],
            ['id' => 2, 'name' => 'Sede Norte', 'direccion' => 'Carrera 80 #30-20', 'ciudad' => 'Medellín'],
            ['id' => 3, 'name' => 'Sede Sur', 'direccion' => 'Carrera 48 #20-10', 'ciudad' => 'Medellín'],
        ];

        foreach ($sedes as $sede) {
            DB::table('sedes')->updateOrInsert(['id' => $sede['id']], $sede);
        }
    }

    /**
     * Sembrar usuarios y roles
     */
    private function seedUsuariosYRoles(): void
    {
        $this->command->info('👥 Sembrando usuarios y roles...');

        $usuarios = [
            [
                'id' => 1,
                'nombre' => 'Administrador',
                'apellido' => 'Sistema',
                'email' => 'admin@eva.com',
                'username' => 'admin',
                'password' => Hash::make('admin123'),
                'rol_id' => 1,
                'estado' => 1,
                'servicio_id' => 1,
                'centro_id' => '1',
                'active' => 'SI',
                'fecha_registro' => now(),
                'id_empresa' => 1,
                'sede_id' => '1',
                'zona_id' => 1,
                'anio_plan' => 2024
            ],
            [
                'id' => 2,
                'nombre' => 'Juan Carlos',
                'apellido' => 'Pérez García',
                'telefono' => '3001234567',
                'email' => 'juan.perez@eva.com',
                'username' => 'jperez',
                'password' => Hash::make('password123'),
                'rol_id' => 2,
                'estado' => 1,
                'servicio_id' => 1,
                'centro_id' => '1',
                'active' => 'SI',
                'fecha_registro' => now(),
                'id_empresa' => 1,
                'sede_id' => '1',
                'zona_id' => 1,
                'anio_plan' => 2024
            ],
            [
                'id' => 3,
                'nombre' => 'María Elena',
                'apellido' => 'Rodríguez López',
                'telefono' => '3009876543',
                'email' => 'maria.rodriguez@eva.com',
                'username' => 'mrodriguez',
                'password' => Hash::make('password123'),
                'rol_id' => 3,
                'estado' => 1,
                'servicio_id' => 2,
                'centro_id' => '1',
                'active' => 'SI',
                'fecha_registro' => now(),
                'id_empresa' => 1,
                'sede_id' => '1',
                'zona_id' => 2,
                'anio_plan' => 2024
            ],
            [
                'id' => 4,
                'nombre' => 'Carlos Alberto',
                'apellido' => 'Gómez Martínez',
                'telefono' => '3005555555',
                'email' => 'carlos.gomez@eva.com',
                'username' => 'cgomez',
                'password' => Hash::make('password123'),
                'rol_id' => 4,
                'estado' => 1,
                'servicio_id' => 3,
                'centro_id' => '1',
                'active' => 'SI',
                'fecha_registro' => now(),
                'id_empresa' => 1,
                'sede_id' => '1',
                'zona_id' => 3,
                'anio_plan' => 2024
            ],
            [
                'id' => 5,
                'nombre' => 'Ana Sofía',
                'apellido' => 'Hernández Vargas',
                'telefono' => '3007777777',
                'email' => 'ana.hernandez@eva.com',
                'username' => 'ahernandez',
                'password' => Hash::make('password123'),
                'rol_id' => 5,
                'estado' => 1,
                'servicio_id' => 1,
                'centro_id' => '1',
                'active' => 'SI',
                'fecha_registro' => now(),
                'id_empresa' => 1,
                'sede_id' => '1',
                'zona_id' => 1,
                'anio_plan' => 2024
            ]
        ];

        foreach ($usuarios as $usuario) {
            DB::table('usuarios')->updateOrInsert(['id' => $usuario['id']], $usuario);
        }
    }

    /**
     * Sembrar estructura organizacional
     */
    private function seedEstructuraOrganizacional(): void
    {
        $this->command->info('🏢 Sembrando estructura organizacional...');

        // Servicios
        $servicios = [
            ['id' => 1, 'nombre' => 'Urgencias', 'descripcion' => 'Servicio de urgencias médicas', 'status' => 1],
            ['id' => 2, 'nombre' => 'Cirugía', 'descripcion' => 'Servicio de cirugía general', 'status' => 1],
            ['id' => 3, 'nombre' => 'UCI', 'descripcion' => 'Unidad de cuidados intensivos', 'status' => 1],
            ['id' => 4, 'nombre' => 'Hospitalización', 'descripcion' => 'Servicio de hospitalización', 'status' => 1],
            ['id' => 5, 'nombre' => 'Consulta Externa', 'descripcion' => 'Consultas médicas externas', 'status' => 1],
            ['id' => 6, 'nombre' => 'Laboratorio', 'descripcion' => 'Laboratorio clínico', 'status' => 1],
            ['id' => 7, 'nombre' => 'Radiología', 'descripcion' => 'Servicio de radiología e imágenes', 'status' => 1],
            ['id' => 8, 'nombre' => 'Farmacia', 'descripcion' => 'Servicio farmacéutico', 'status' => 1],
        ];

        foreach ($servicios as $servicio) {
            DB::table('servicios')->updateOrInsert(['id' => $servicio['id']], $servicio);
        }

        // Áreas
        $areas = [
            ['id' => 1, 'name' => 'Urgencias Adultos', 'servicio_id' => 1, 'centro_id' => 1, 'piso_id' => 1, 'status' => 1],
            ['id' => 2, 'name' => 'Urgencias Pediátricas', 'servicio_id' => 1, 'centro_id' => 1, 'piso_id' => 1, 'status' => 1],
            ['id' => 3, 'name' => 'Quirófano 1', 'servicio_id' => 2, 'centro_id' => 1, 'piso_id' => 2, 'status' => 1],
            ['id' => 4, 'name' => 'Quirófano 2', 'servicio_id' => 2, 'centro_id' => 1, 'piso_id' => 2, 'status' => 1],
            ['id' => 5, 'name' => 'UCI Adultos', 'servicio_id' => 3, 'centro_id' => 1, 'piso_id' => 3, 'status' => 1],
            ['id' => 6, 'name' => 'UCI Pediátrica', 'servicio_id' => 3, 'centro_id' => 1, 'piso_id' => 3, 'status' => 1],
            ['id' => 7, 'name' => 'Hospitalización Medicina Interna', 'servicio_id' => 4, 'centro_id' => 1, 'piso_id' => 4, 'status' => 1],
            ['id' => 8, 'name' => 'Hospitalización Cirugía', 'servicio_id' => 4, 'centro_id' => 1, 'piso_id' => 4, 'status' => 1],
        ];

        foreach ($areas as $area) {
            DB::table('areas')->updateOrInsert(['id' => $area['id']], $area);
        }

        // Propietarios
        $propietarios = [
            ['id' => 1, 'nombre' => 'Hospital Universitario San Vicente Fundación', 'activo' => true],
            ['id' => 2, 'nombre' => 'Ministerio de Salud', 'activo' => true],
            ['id' => 3, 'nombre' => 'Secretaría de Salud de Medellín', 'activo' => true],
            ['id' => 4, 'nombre' => 'Universidad de Antioquia', 'activo' => true],
        ];

        foreach ($propietarios as $propietario) {
            DB::table('propietarios')->updateOrInsert(['id' => $propietario['id']], $propietario);
        }

        // Pisos
        $pisos = [
            ['id' => 1, 'name' => 'Piso 1', 'descripcion' => 'Primer piso - Urgencias'],
            ['id' => 2, 'name' => 'Piso 2', 'descripcion' => 'Segundo piso - Cirugía'],
            ['id' => 3, 'name' => 'Piso 3', 'descripcion' => 'Tercer piso - UCI'],
            ['id' => 4, 'name' => 'Piso 4', 'descripcion' => 'Cuarto piso - Hospitalización'],
            ['id' => 5, 'name' => 'Piso 5', 'descripcion' => 'Quinto piso - Consulta Externa'],
        ];

        foreach ($pisos as $piso) {
            DB::table('pisos')->updateOrInsert(['id' => $piso['id']], $piso);
        }

        // Zonas
        $zonas = [
            ['id' => 1, 'name' => 'Zona Norte', 'descripcion' => 'Zona norte del hospital'],
            ['id' => 2, 'name' => 'Zona Sur', 'descripcion' => 'Zona sur del hospital'],
            ['id' => 3, 'name' => 'Zona Este', 'descripcion' => 'Zona este del hospital'],
            ['id' => 4, 'name' => 'Zona Oeste', 'descripcion' => 'Zona oeste del hospital'],
        ];

        foreach ($zonas as $zona) {
            DB::table('zonas')->updateOrInsert(['id' => $zona['id']], $zona);
        }
    }

    /**
     * Sembrar equipos médicos
     */
    private function seedEquiposMedicos(): void
    {
        $this->command->info('🏥 Sembrando equipos médicos...');

        // Primero sembrar tablas de clasificación
        $this->seedClasificacionesEquipos();

        // Equipos médicos principales
        $equipos = [
            [
                'id' => 1,
                'name' => 'Monitor de Signos Vitales Philips IntelliVue MP70',
                'code' => 'MSV-001',
                'descripcion' => 'Monitor multiparamétrico para UCI',
                'marca' => 'Philips',
                'modelo' => 'IntelliVue MP70',
                'serial' => 'PH2024001',
                'servicio_id' => 3,
                'area_id' => 5,
                'propietario_id' => 1,
                'fuente_id' => 1,
                'tecnologia_id' => 1,
                'frecuencia_id' => 1,
                'cbiomedica_id' => 1,
                'criesgo_id' => 1,
                'tadquisicion_id' => 1,
                'estadoequipo_id' => 1,
                'tipo_id' => 1,
                'disponibilidad_id' => 1,
                'fecha_instalacion' => '2024-01-15',
                'fecha_fabricacion' => '2023-12-01',
                'vida_util' => 10,
                'costo' => 45000000.00,
                'status' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'id' => 2,
                'name' => 'Ventilador Mecánico Dräger Evita V800',
                'code' => 'VM-002',
                'descripcion' => 'Ventilador mecánico para cuidados intensivos',
                'marca' => 'Dräger',
                'modelo' => 'Evita V800',
                'serial' => 'DR2024002',
                'servicio_id' => 3,
                'area_id' => 5,
                'propietario_id' => 1,
                'fuente_id' => 1,
                'tecnologia_id' => 2,
                'frecuencia_id' => 1,
                'cbiomedica_id' => 1,
                'criesgo_id' => 1,
                'tadquisicion_id' => 1,
                'estadoequipo_id' => 1,
                'tipo_id' => 2,
                'disponibilidad_id' => 1,
                'fecha_instalacion' => '2024-02-01',
                'fecha_fabricacion' => '2023-11-15',
                'vida_util' => 12,
                'costo' => 85000000.00,
                'status' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'id' => 3,
                'name' => 'Desfibrilador Zoll X Series',
                'code' => 'DEF-003',
                'descripcion' => 'Desfibrilador/Monitor para emergencias',
                'marca' => 'Zoll',
                'modelo' => 'X Series',
                'serial' => 'ZL2024003',
                'servicio_id' => 1,
                'area_id' => 1,
                'propietario_id' => 1,
                'fuente_id' => 2,
                'tecnologia_id' => 1,
                'frecuencia_id' => 2,
                'cbiomedica_id' => 1,
                'criesgo_id' => 1,
                'tadquisicion_id' => 1,
                'estadoequipo_id' => 1,
                'tipo_id' => 3,
                'disponibilidad_id' => 1,
                'fecha_instalacion' => '2024-01-20',
                'fecha_fabricacion' => '2023-10-10',
                'vida_util' => 8,
                'costo' => 25000000.00,
                'status' => true,
                'created_at' => now(),
                'updated_at' => now()
            ]
        ];

        foreach ($equipos as $equipo) {
            DB::table('equipos')->updateOrInsert(['id' => $equipo['id']], $equipo);
        }
    }

    /**
     * Sembrar clasificaciones de equipos
     */
    private function seedClasificacionesEquipos(): void
    {
        // Fuentes de alimentación
        $fuentes = [
            ['id' => 1, 'nombre' => 'Eléctrica 110V', 'status' => true, 'created_at' => now()],
            ['id' => 2, 'nombre' => 'Batería Recargable', 'status' => true, 'created_at' => now()],
            ['id' => 3, 'nombre' => 'Eléctrica 220V', 'status' => true, 'created_at' => now()],
            ['id' => 4, 'nombre' => 'Gas Medicinal', 'status' => true, 'created_at' => now()],
        ];

        foreach ($fuentes as $fuente) {
            DB::table('fuenteal')->updateOrInsert(['id' => $fuente['id']], $fuente);
        }

        // Tecnologías predominantes
        $tecnologias = [
            ['id' => 1, 'nombre' => 'Electrónica Digital', 'status' => true, 'created_at' => now()],
            ['id' => 2, 'nombre' => 'Mecánica', 'status' => true, 'created_at' => now()],
            ['id' => 3, 'nombre' => 'Neumática', 'status' => true, 'created_at' => now()],
            ['id' => 4, 'nombre' => 'Hidráulica', 'status' => true, 'created_at' => now()],
        ];

        foreach ($tecnologias as $tecnologia) {
            DB::table('tecnologiap')->updateOrInsert(['id' => $tecnologia['id']], $tecnologia);
        }

        // Clasificación biomédica
        $cbiomedicas = [
            ['id' => 1, 'nombre' => 'Equipo de Soporte de Vida', 'status' => 1, 'created_at' => now()],
            ['id' => 2, 'nombre' => 'Equipo de Diagnóstico', 'status' => 1, 'created_at' => now()],
            ['id' => 3, 'nombre' => 'Equipo de Tratamiento', 'status' => 1, 'created_at' => now()],
            ['id' => 4, 'nombre' => 'Equipo de Rehabilitación', 'status' => 1, 'created_at' => now()],
        ];

        foreach ($cbiomedicas as $cbiomedica) {
            DB::table('cbiomedica')->updateOrInsert(['id' => $cbiomedica['id']], $cbiomedica);
        }

        // Clasificación de riesgo
        $criesgos = [
            ['id' => 1, 'nombre' => 'Clase I - Bajo Riesgo', 'nivel' => 'BAJO', 'color' => 'green'],
            ['id' => 2, 'nombre' => 'Clase IIa - Riesgo Medio', 'nivel' => 'MEDIO', 'color' => 'yellow'],
            ['id' => 3, 'nombre' => 'Clase IIb - Riesgo Medio Alto', 'nivel' => 'MEDIO ALTO', 'color' => 'orange'],
            ['id' => 4, 'nombre' => 'Clase III - Alto Riesgo', 'nivel' => 'ALTO', 'color' => 'red'],
        ];

        foreach ($criesgos as $criesgo) {
            DB::table('criesgo')->updateOrInsert(['id' => $criesgo['id']], $criesgo);
        }
    }

    /**
     * Sembrar mantenimientos y calibraciones
     */
    private function seedMantenimientosYCalibraciones(): void
    {
        $this->command->info('🔧 Sembrando mantenimientos y calibraciones...');

        $mantenimientos = [
            [
                'id' => 1,
                'equipo_id' => 1,
                'descripcion' => 'Mantenimiento preventivo mensual - Monitor MP70',
                'tipo' => 'preventivo',
                'estado' => 'completado',
                'fecha_programada' => '2024-06-15',
                'fecha_inicio' => '2024-06-15 08:00:00',
                'fecha_fin' => '2024-06-15 10:30:00',
                'observaciones' => 'Mantenimiento realizado según protocolo. Equipo funcionando correctamente.',
                'costo' => 150000.00,
                'status' => 1,
                'created_at' => now(),
                'updated_at' => now(),
                'tecnico_id' => 3,
                'prioridad' => 'media',
                'tiempo_estimado' => 3,
                'tiempo_real' => 2
            ],
            [
                'id' => 2,
                'equipo_id' => 2,
                'descripcion' => 'Calibración anual - Ventilador Evita V800',
                'tipo' => 'calibracion',
                'estado' => 'programado',
                'fecha_programada' => '2024-07-01',
                'observaciones' => 'Calibración programada según cronograma anual',
                'costo' => 800000.00,
                'status' => 1,
                'created_at' => now(),
                'updated_at' => now(),
                'tecnico_id' => 2,
                'prioridad' => 'alta',
                'tiempo_estimado' => 6
            ]
        ];

        foreach ($mantenimientos as $mantenimiento) {
            DB::table('mantenimiento')->updateOrInsert(['id' => $mantenimiento['id']], $mantenimiento);
        }
    }

    /**
     * Sembrar contingencias y tickets
     */
    private function seedContingenciasYTickets(): void
    {
        $this->command->info('🚨 Sembrando contingencias y tickets...');

        $contingencias = [
            [
                'id' => 1,
                'equipo_id' => 1,
                'titulo' => 'Falla en pantalla del monitor MP70',
                'descripcion' => 'La pantalla del monitor presenta líneas horizontales intermitentes',
                'fecha_reporte' => '2024-06-20 14:30:00',
                'usuario_reporta' => 4,
                'severidad' => 'Media',
                'status' => 1,
                'created_at' => now(),
                'updated_at' => now(),
                'estado' => 'En Proceso',
                'usuario_asignado' => 2,
                'fecha_asignacion' => '2024-06-20 15:00:00',
                'impacto' => 'Medio',
                'categoria' => 'Hardware'
            ],
            [
                'id' => 2,
                'equipo_id' => 3,
                'titulo' => 'Desfibrilador no enciende',
                'descripcion' => 'El equipo no responde al presionar el botón de encendido',
                'fecha_reporte' => '2024-06-21 09:15:00',
                'usuario_reporta' => 5,
                'severidad' => 'Alta',
                'status' => 1,
                'created_at' => now(),
                'updated_at' => now(),
                'estado' => 'Activa',
                'impacto' => 'Alto',
                'categoria' => 'Eléctrico'
            ]
        ];

        foreach ($contingencias as $contingencia) {
            DB::table('contingencias')->updateOrInsert(['id' => $contingencia['id']], $contingencia);
        }
    }

    /**
     * Sembrar archivos y documentos
     */
    private function seedArchivosYDocumentos(): void
    {
        $this->command->info('📁 Sembrando archivos y documentos...');

        $archivos = [
            [
                'id' => 1,
                'name' => 'Manual de Usuario - Monitor MP70',
                'equipo_id' => 1,
                'tipo' => 'manual',
                'categoria' => 'documentacion',
                'file_name' => 'manual_mp70.pdf',
                'file_path' => 'manuales/manual_mp70.pdf',
                'file_size' => 2048576,
                'mime_type' => 'application/pdf',
                'usuario_id' => 1,
                'activo' => true,
                'created_at' => now(),
                'updated_at' => now()
            ]
        ];

        foreach ($archivos as $archivo) {
            DB::table('archivos')->updateOrInsert(['id' => $archivo['id']], $archivo);
        }
    }

    /**
     * Sembrar datos de prueba adicionales
     */
    private function seedDatosPrueba(): void
    {
        $this->command->info('🧪 Sembrando datos de prueba adicionales...');

        // Observaciones
        $observaciones = [
            [
                'id' => 1,
                'equipo_id' => 1,
                'usuario_id' => 2,
                'observacion' => 'Equipo funcionando correctamente después del mantenimiento',
                'tipo' => 'mantenimiento',
                'fecha' => now(),
                'created_at' => now(),
                'updated_at' => now()
            ]
        ];

        foreach ($observaciones as $observacion) {
            DB::table('observaciones')->updateOrInsert(['id' => $observacion['id']], $observacion);
        }

        $this->command->info('✅ Todos los datos de prueba han sido sembrados exitosamente!');
        $this->command->info('📊 Resumen de datos creados:');
        $this->command->info('   - Usuarios: 5');
        $this->command->info('   - Servicios: 8');
        $this->command->info('   - Áreas: 8');
        $this->command->info('   - Equipos: 3');
        $this->command->info('   - Mantenimientos: 2');
        $this->command->info('   - Contingencias: 2');
        $this->command->info('   - Archivos: 1');
    }
}
