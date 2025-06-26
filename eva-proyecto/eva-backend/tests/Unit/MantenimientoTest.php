<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\Mantenimiento;
use Illuminate\Foundation\Testing\RefreshDatabase;

/**
 * Test unitario para modelo Mantenimiento
 * 
 * Valida funcionalidad básica del modelo Mantenimiento
 * con tests empresariales completos.
 */
class MantenimientoTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test de creación de modelo
     */
    public function test_puede_crear_Mantenimiento()
    {
        $modelo = Mantenimiento::factory()->create();
        
        $this->assertInstanceOf(Mantenimiento::class, $modelo);
        $this->assertDatabaseHas('mantenimientos', [
            'id' => $modelo->id
        ]);
    }

    /**
     * Test de validación de integridad
     */
    public function test_validacion_integridad_Mantenimiento()
    {
        $modelo = Mantenimiento::factory()->create();
        
        $errores = $modelo->validarIntegridad();
        
        $this->assertIsArray($errores);
    }

    /**
     * Test de obtener estadísticas
     */
    public function test_obtener_estadisticas_Mantenimiento()
    {
        $modelo = Mantenimiento::factory()->create();
        
        $estadisticas = $modelo->obtenerEstadisticas();
        
        $this->assertIsArray($estadisticas);
        $this->assertArrayHasKey('id', $estadisticas);
    }

    /**
     * Test de limpiar cache
     */
    public function test_limpiar_cache_Mantenimiento()
    {
        $modelo = Mantenimiento::factory()->create();
        
        $resultado = $modelo->limpiarCache();
        
        $this->assertNull($resultado);
    }
}
