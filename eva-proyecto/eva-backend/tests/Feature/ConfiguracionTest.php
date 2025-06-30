<?php

namespace Tests\Feature;

use Tests\TestCase;

/**
 * Test de configuración del sistema
 * 
 * Valida que la configuración del sistema EVA
 * esté correctamente establecida.
 */
class ConfiguracionTest extends TestCase
{
    /**
     * Test de configuración de base de datos
     */
    public function test_configuracion_base_datos()
    {
        $this->assertNotNull(config('database.default'));
        $this->assertNotNull(config('database.connections.mysql'));
    }

    /**
     * Test de configuración de autenticación
     */
    public function test_configuracion_autenticacion()
    {
        $this->assertNotNull(config('auth.defaults.guard'));
        $this->assertNotNull(config('sanctum'));
    }

    /**
     * Test de variables de entorno
     */
    public function test_variables_entorno()
    {
        $this->assertNotNull(env('APP_NAME'));
        $this->assertNotNull(env('DB_DATABASE'));
    }
}
