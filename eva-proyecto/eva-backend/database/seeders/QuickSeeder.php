<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class QuickSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('🚀 Iniciando QuickSeeder...');

        // Deshabilitar verificación de foreign keys
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');

        try {
            // Roles básicos
            $this->seedRoles();
            
            // Usuario administrador
            $this->seedUsuarioAdmin();
            
            $this->command->info('✅ QuickSeeder completado exitosamente!');
            
        } catch (\Exception $e) {
            $this->command->error('❌ Error en QuickSeeder: ' . $e->getMessage());
            throw $e;
        } finally {
            DB::statement('SET FOREIGN_KEY_CHECKS=1;');
        }
    }

    private function seedRoles(): void
    {
        $this->command->info('📊 Creando roles...');
        
        $roles = [
            ['id' => 1, 'nombre' => 'Administrador', 'descripcion' => 'Acceso completo al sistema'],
            ['id' => 2, 'nombre' => 'Ingeniero Biomédico', 'descripcion' => 'Gestión de equipos y mantenimientos'],
            ['id' => 3, 'nombre' => 'Técnico', 'descripcion' => 'Ejecución de mantenimientos'],
            ['id' => 4, 'nombre' => 'Usuario Final', 'descripcion' => 'Consulta de información'],
        ];

        foreach ($roles as $rol) {
            DB::table('roles')->updateOrInsert(['id' => $rol['id']], $rol);
        }
    }

    private function seedUsuarioAdmin(): void
    {
        $this->command->info('👤 Creando usuario administrador...');
        
        $usuario = [
            'id' => 1,
            'nombre' => 'Administrador',
            'apellido' => 'Sistema',
            'telefono' => '3001234567',
            'email' => 'admin@eva.com',
            'username' => 'admin',
            'password' => Hash::make('admin123'),
            'rol_id' => 1,
            'estado' => 1,
            'servicio_id' => 1,
            'centro_id' => '1',
            'code' => null,
            'active' => 'SI',
            'fecha_registro' => now(),
            'id_empresa' => 1,
            'sede_id' => '1',
            'zona_id' => 1,
            'anio_plan' => 2024
        ];

        DB::table('usuarios')->updateOrInsert(['id' => $usuario['id']], $usuario);
        
        $this->command->info('✅ Usuario admin creado: admin@eva.com / admin123');
    }
}
