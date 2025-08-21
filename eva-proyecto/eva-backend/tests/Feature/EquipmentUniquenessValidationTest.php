<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;
use App\Models\Equipo;
use Illuminate\Support\Facades\DB;

class EquipmentUniquenessValidationTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test that equipment code must be unique when creating new equipment
     */
    public function test_equipment_code_must_be_unique_on_create()
    {
        // Create an equipment with a specific code
        $existingEquipment = Equipo::create([
            'name' => 'Test Equipment 1',
            'code' => 'TEST001',
            'servicio_id' => 1,
            'area_id' => 1,
            'marca' => 'Test Brand',
            'modelo' => 'Test Model',
            'serial' => 'SERIAL001'
        ]);

        // Try to create another equipment with the same code
        $response = $this->postJson('/api/v1/equipos', [
            'name' => 'Test Equipment 2',
            'code' => 'TEST001', // Same code
            'servicio_id' => 1,
            'area_id' => 1,
            'marca' => 'Test Brand 2',
            'modelo' => 'Test Model 2',
            'serial' => 'SERIAL002'
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['code']);
    }

    /**
     * Test that equipment serial must be unique when creating new equipment
     */
    public function test_equipment_serial_must_be_unique_on_create()
    {
        // Create an equipment with a specific serial
        $existingEquipment = Equipo::create([
            'name' => 'Test Equipment 1',
            'code' => 'TEST001',
            'servicio_id' => 1,
            'area_id' => 1,
            'marca' => 'Test Brand',
            'modelo' => 'Test Model',
            'serial' => 'SERIAL001'
        ]);

        // Try to create another equipment with the same serial
        $response = $this->postJson('/api/v1/equipos', [
            'name' => 'Test Equipment 2',
            'code' => 'TEST002',
            'servicio_id' => 1,
            'area_id' => 1,
            'marca' => 'Test Brand 2',
            'modelo' => 'Test Model 2',
            'serial' => 'SERIAL001' // Same serial
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['serial']);
    }

    /**
     * Test that codigo_antiguo must be unique when creating new equipment
     */
    public function test_equipment_codigo_antiguo_must_be_unique_on_create()
    {
        // Create an equipment with a specific codigo_antiguo
        $existingEquipment = Equipo::create([
            'name' => 'Test Equipment 1',
            'code' => 'TEST001',
            'servicio_id' => 1,
            'area_id' => 1,
            'marca' => 'Test Brand',
            'modelo' => 'Test Model',
            'serial' => 'SERIAL001',
            'codigo_antiguo' => 'OLD001'
        ]);

        // Try to create another equipment with the same codigo_antiguo
        $response = $this->postJson('/api/v1/equipos', [
            'name' => 'Test Equipment 2',
            'code' => 'TEST002',
            'servicio_id' => 1,
            'area_id' => 1,
            'marca' => 'Test Brand 2',
            'modelo' => 'Test Model 2',
            'serial' => 'SERIAL002',
            'codigo_antiguo' => 'OLD001' // Same codigo_antiguo
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['codigo_antiguo']);
    }

    /**
     * Test validation endpoint for uniqueness checking
     */
    public function test_validate_unique_endpoint()
    {
        // Create an equipment
        $equipment = Equipo::create([
            'name' => 'Test Equipment',
            'code' => 'TEST001',
            'servicio_id' => 1,
            'area_id' => 1,
            'marca' => 'Test Brand',
            'modelo' => 'Test Model',
            'serial' => 'SERIAL001',
            'codigo_antiguo' => 'OLD001'
        ]);

        // Test existing code
        $response = $this->getJson('/api/v1/equipos/validate-unique?field=code&value=TEST001');
        $response->assertStatus(200);
        $response->assertJson(['unique' => false]);

        // Test non-existing code
        $response = $this->getJson('/api/v1/equipos/validate-unique?field=code&value=TEST999');
        $response->assertStatus(200);
        $response->assertJson(['unique' => true]);

        // Test existing serial
        $response = $this->getJson('/api/v1/equipos/validate-unique?field=serial&value=SERIAL001');
        $response->assertStatus(200);
        $response->assertJson(['unique' => false]);

        // Test existing codigo_antiguo
        $response = $this->getJson('/api/v1/equipos/validate-unique?field=codigo_antiguo&value=OLD001');
        $response->assertStatus(200);
        $response->assertJson(['unique' => false]);
    }

    /**
     * Test validation endpoint with invalid field
     */
    public function test_validate_unique_endpoint_with_invalid_field()
    {
        $response = $this->getJson('/api/v1/equipos/validate-unique?field=invalid_field&value=test');
        $response->assertStatus(400);
        $response->assertJson(['success' => false]);
    }

    /**
     * Test validation endpoint without required parameters
     */
    public function test_validate_unique_endpoint_without_parameters()
    {
        $response = $this->getJson('/api/v1/equipos/validate-unique');
        $response->assertStatus(400);
        $response->assertJson(['success' => false]);
    }

    /**
     * Test that equipment can be updated with same values (ignore self)
     */
    public function test_equipment_can_be_updated_with_same_values()
    {
        // Create an equipment
        $equipment = Equipo::create([
            'name' => 'Test Equipment',
            'code' => 'TEST001',
            'servicio_id' => 1,
            'area_id' => 1,
            'marca' => 'Test Brand',
            'modelo' => 'Test Model',
            'serial' => 'SERIAL001',
            'codigo_antiguo' => 'OLD001'
        ]);

        // Test validation endpoint excluding self
        $response = $this->getJson("/api/v1/equipos/validate-unique?field=code&value=TEST001&equipo_id={$equipment->id}");
        $response->assertStatus(200);
        $response->assertJson(['unique' => true]); // Should be unique when excluding self
    }
}
