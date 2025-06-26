<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

/**
 * Test unitario para modelo User
 * 
 * Valida funcionalidad básica del modelo User
 * con tests empresariales completos.
 */
class UserTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test de creación de modelo
     */
    public function test_puede_crear_User()
    {
        $modelo = User::factory()->create();
        
        $this->assertInstanceOf(User::class, $modelo);
        $this->assertDatabaseHas('users', [
            'id' => $modelo->id
        ]);
    }

    /**
     * Test de validación de integridad
     */
    public function test_validacion_integridad_User()
    {
        $modelo = User::factory()->create();
        
        $errores = $modelo->validarIntegridad();
        
        $this->assertIsArray($errores);
    }

    /**
     * Test de obtener estadísticas
     */
    public function test_obtener_estadisticas_User()
    {
        $modelo = User::factory()->create();
        
        $estadisticas = $modelo->obtenerEstadisticas();
        
        $this->assertIsArray($estadisticas);
        $this->assertArrayHasKey('id', $estadisticas);
    }

    /**
     * Test de limpiar cache
     */
    public function test_limpiar_cache_User()
    {
        $modelo = User::factory()->create();
        
        $resultado = $modelo->limpiarCache();
        
        $this->assertNull($resultado);
    }
}
