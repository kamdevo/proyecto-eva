<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\Usuario;
use Illuminate\Foundation\Testing\RefreshDatabase;

/**
 * Test unitario para modelo Usuario
 * 
 * Valida funcionalidad básica del modelo Usuario
 * con tests empresariales completos.
 */
class UsuarioTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test de creación de modelo
     */
    public function test_puede_crear_Usuario()
    {
        $modelo = Usuario::factory()->create();
        
        $this->assertInstanceOf(Usuario::class, $modelo);
        $this->assertDatabaseHas('usuarios', [
            'id' => $modelo->id
        ]);
    }

    /**
     * Test de validación de integridad
     */
    public function test_validacion_integridad_Usuario()
    {
        $modelo = Usuario::factory()->create();
        
        $errores = $modelo->validarIntegridad();
        
        $this->assertIsArray($errores);
    }

    /**
     * Test de obtener estadísticas
     */
    public function test_obtener_estadisticas_Usuario()
    {
        $modelo = Usuario::factory()->create();
        
        $estadisticas = $modelo->obtenerEstadisticas();
        
        $this->assertIsArray($estadisticas);
        $this->assertArrayHasKey('id', $estadisticas);
    }

    /**
     * Test de limpiar cache
     */
    public function test_limpiar_cache_Usuario()
    {
        $modelo = Usuario::factory()->create();
        
        $resultado = $modelo->limpiarCache();
        
        $this->assertNull($resultado);
    }
}
