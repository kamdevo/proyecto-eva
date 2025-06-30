<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\Equipo;
use Illuminate\Foundation\Testing\RefreshDatabase;

/**
 * Test unitario para modelo Equipo
 * 
 * Valida funcionalidad básica del modelo Equipo
 * con tests empresariales completos.
 */
class EquipoTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test de creación de modelo
     */
    public function test_puede_crear_Equipo()
    {
        $modelo = Equipo::factory()->create();
        
        $this->assertInstanceOf(Equipo::class, $modelo);
        $this->assertDatabaseHas('equipos', [
            'id' => $modelo->id
        ]);
    }

    /**
     * Test de validación de integridad
     */
    public function test_validacion_integridad_Equipo()
    {
        $modelo = Equipo::factory()->create();
        
        $errores = $modelo->validarIntegridad();
        
        $this->assertIsArray($errores);
    }

    /**
     * Test de obtener estadísticas
     */
    public function test_obtener_estadisticas_Equipo()
    {
        $modelo = Equipo::factory()->create();
        
        $estadisticas = $modelo->obtenerEstadisticas();
        
        $this->assertIsArray($estadisticas);
        $this->assertArrayHasKey('id', $estadisticas);
    }

    /**
     * Test de limpiar cache
     */
    public function test_limpiar_cache_Equipo()
    {
        $modelo = Equipo::factory()->create();
        
        $resultado = $modelo->limpiarCache();
        
        $this->assertNull($resultado);
    }
}
