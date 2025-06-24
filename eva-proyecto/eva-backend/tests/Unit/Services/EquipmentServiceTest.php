<?php

namespace Tests\Unit\Services;

use Tests\TestCase;
use App\Services\EquipmentService;
use App\Models\Equipo;
use App\Models\Servicio;
use App\Models\Area;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class EquipmentServiceTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected EquipmentService $equipmentService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->equipmentService = new EquipmentService();
        Storage::fake('public');
    }

    /** @test */
    public function it_can_get_equipments_with_pagination(): void
    {
        // Arrange
        Equipo::factory()->count(25)->create();

        // Act
        $result = $this->equipmentService->getEquipments([], 10);

        // Assert
        $this->assertInstanceOf(\Illuminate\Contracts\Pagination\LengthAwarePaginator::class, $result);
        $this->assertEquals(10, $result->perPage());
        $this->assertEquals(25, $result->total());
    }

    /** @test */
    public function it_can_filter_equipments_by_search(): void
    {
        // Arrange
        $equipo1 = Equipo::factory()->create(['name' => 'Equipo Test 1', 'code' => 'TEST001']);
        $equipo2 = Equipo::factory()->create(['name' => 'Otro Equipo', 'code' => 'OTHER001']);

        // Act
        $result = $this->equipmentService->getEquipments(['search' => 'Test']);

        // Assert
        $this->assertEquals(1, $result->total());
        $this->assertEquals($equipo1->id, $result->first()->id);
    }

    /** @test */
    public function it_can_create_equipment(): void
    {
        // Arrange
        $servicio = Servicio::factory()->create();
        $area = Area::factory()->create();
        
        $data = [
            'name' => 'Nuevo Equipo',
            'code' => 'NEW001',
            'servicio_id' => $servicio->id,
            'area_id' => $area->id,
            'marca' => 'Test Brand',
            'modelo' => 'Test Model'
        ];

        // Act
        $result = $this->equipmentService->createEquipment($data);

        // Assert
        $this->assertInstanceOf(Equipo::class, $result);
        $this->assertEquals('Nuevo Equipo', $result->name);
        $this->assertEquals('NEW001', $result->code);
        $this->assertTrue($result->status);
        $this->assertDatabaseHas('equipos', [
            'name' => 'Nuevo Equipo',
            'code' => 'NEW001'
        ]);
    }

    /** @test */
    public function it_can_update_equipment(): void
    {
        // Arrange
        $equipo = Equipo::factory()->create(['name' => 'Original Name']);
        $data = ['name' => 'Updated Name'];

        // Act
        $result = $this->equipmentService->updateEquipment($equipo->id, $data);

        // Assert
        $this->assertInstanceOf(Equipo::class, $result);
        $this->assertEquals('Updated Name', $result->name);
        $this->assertDatabaseHas('equipos', [
            'id' => $equipo->id,
            'name' => 'Updated Name'
        ]);
    }

    /** @test */
    public function it_can_delete_equipment(): void
    {
        // Arrange
        $equipo = Equipo::factory()->create();

        // Act
        $result = $this->equipmentService->deleteEquipment($equipo->id);

        // Assert
        $this->assertTrue($result);
        $this->assertDatabaseMissing('equipos', ['id' => $equipo->id]);
    }

    /** @test */
    public function it_cannot_delete_equipment_with_active_maintenances(): void
    {
        // Arrange
        $equipo = Equipo::factory()->create();
        $equipo->mantenimientos()->create([
            'status' => 'programado',
            'fecha_programada' => now()->addDays(1),
            'tipo' => 'preventivo'
        ]);

        // Act & Assert
        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('No se puede eliminar el equipo porque tiene mantenimientos activos');
        
        $this->equipmentService->deleteEquipment($equipo->id);
    }

    /** @test */
    public function it_can_search_equipment_by_code(): void
    {
        // Arrange
        $equipo1 = Equipo::factory()->create(['code' => 'ABC123']);
        $equipo2 = Equipo::factory()->create(['code' => 'XYZ789']);

        // Act
        $result = $this->equipmentService->searchByCode('ABC');

        // Assert
        $this->assertCount(1, $result);
        $this->assertEquals($equipo1->id, $result->first()->id);
    }

    /** @test */
    public function it_can_duplicate_equipment(): void
    {
        // Arrange
        $originalEquipo = Equipo::factory()->create([
            'name' => 'Original Equipment',
            'code' => 'ORIG001'
        ]);

        // Act
        $result = $this->equipmentService->duplicateEquipment($originalEquipo->id);

        // Assert
        $this->assertInstanceOf(Equipo::class, $result);
        $this->assertEquals('Original Equipment (Copia)', $result->name);
        $this->assertEquals('ORIG001-COPY', $result->code);
        $this->assertNotEquals($originalEquipo->id, $result->id);
    }

    /** @test */
    public function it_can_get_equipment_stats(): void
    {
        // Arrange
        Equipo::factory()->count(10)->create(['status' => true]);
        Equipo::factory()->count(5)->create(['status' => false]);

        // Act
        $result = $this->equipmentService->getEquipmentStats();

        // Assert
        $this->assertIsArray($result);
        $this->assertArrayHasKey('total', $result);
        $this->assertArrayHasKey('activos', $result);
        $this->assertArrayHasKey('inactivos', $result);
        $this->assertEquals(15, $result['total']);
        $this->assertEquals(10, $result['activos']);
        $this->assertEquals(5, $result['inactivos']);
    }

    /** @test */
    public function it_handles_image_upload_during_creation(): void
    {
        // Arrange
        $servicio = Servicio::factory()->create();
        $area = Area::factory()->create();
        $image = UploadedFile::fake()->image('test.jpg', 100, 100);
        
        $data = [
            'name' => 'Equipo con Imagen',
            'code' => 'IMG001',
            'servicio_id' => $servicio->id,
            'area_id' => $area->id,
            'image' => $image
        ];

        // Act
        $result = $this->equipmentService->createEquipment($data);

        // Assert
        $this->assertNotNull($result->image);
        $this->assertStringContains('equipos/', $result->image);
        Storage::disk('public')->assertExists($result->image);
    }

    /** @test */
    public function it_generates_unique_code_when_duplicating(): void
    {
        // Arrange
        $originalEquipo = Equipo::factory()->create(['code' => 'TEST001']);
        
        // Create equipment with the expected duplicate code
        Equipo::factory()->create(['code' => 'TEST001-COPY']);

        // Act
        $result = $this->equipmentService->duplicateEquipment($originalEquipo->id);

        // Assert
        $this->assertEquals('TEST001-COPY-1', $result->code);
    }
}
