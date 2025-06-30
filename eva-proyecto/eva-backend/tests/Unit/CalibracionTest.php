<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\Calibracion;
use Illuminate\Foundation\Testing\RefreshDatabase;

/**
 * Test unitario para modelo Calibracion
 * 
 * Valida funcionalidad básica del modelo Calibracion
 * con tests empresariales completos.
 */
class CalibracionTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test de creación de modelo
     */
    public function test_puede_crear_Calibracion()
    {
        $modelo = Calibracion::factory()->create();
        
        $this->assertInstanceOf(Calibracion::class, $modelo);
        $this->assertDatabaseHas('calibracions', [
            'id' => $modelo->id
        ]);
    }

    /**
     * Test de validación de integridad
     */
    public function test_validacion_integridad_Calibracion()
    {
        $modelo = Calibracion::factory()->create();
        
        $errores = $modelo->validarIntegridad();
        
        $this->assertIsArray($errores);
    }

    /**
     * Test de obtener estadísticas
     */
    public function test_obtener_estadisticas_Calibracion()
    {
        $modelo = Calibracion::factory()->create();
        
        $estadisticas = $modelo->obtenerEstadisticas();
        
        $this->assertIsArray($estadisticas);
        $this->assertArrayHasKey('id', $estadisticas);
    }

    /**
     * Test de limpiar cache
     */
    public function test_limpiar_cache_Calibracion()
    {
        $modelo = Calibracion::factory()->create();
        
        $resultado = $modelo->limpiarCache();
        
        $this->assertNull($resultado);
    }
}
