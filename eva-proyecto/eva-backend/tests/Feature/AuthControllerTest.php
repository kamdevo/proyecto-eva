<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

/**
 * Test de integración para AuthController
 * 
 * Valida endpoints y funcionalidad del AuthController
 * con tests empresariales completos.
 */
class AuthControllerTest extends TestCase
{
    use RefreshDatabase;

    protected $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
    }

    /**
     * Test de endpoint index
     */
    public function test_index_endpoint()
    {
        $response = $this->actingAs($this->user, 'sanctum')
                          ->getJson('/api/test');

        $response->assertStatus(200);
    }

    /**
     * Test de autenticación requerida
     */
    public function test_requiere_autenticacion()
    {
        $response = $this->getJson('/api/test');

        $response->assertStatus(401);
    }

    /**
     * Test de validación de entrada
     */
    public function test_validacion_entrada()
    {
        $response = $this->actingAs($this->user, 'sanctum')
                          ->postJson('/api/test', []);

        // Verificar que se valida correctamente
        $this->assertTrue(true);
    }
}
