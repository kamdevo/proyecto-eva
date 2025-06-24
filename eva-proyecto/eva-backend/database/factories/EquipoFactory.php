<?php

namespace Database\Factories;

use App\Models\Equipo;
use App\Models\Servicio;
use App\Models\Area;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Equipo>
 */
class EquipoFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Equipo::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->words(3, true),
            'code' => strtoupper($this->faker->unique()->bothify('EQ-###-???')),
            'servicio_id' => Servicio::factory(),
            'area_id' => Area::factory(),
            'marca' => $this->faker->company(),
            'modelo' => $this->faker->bothify('Model-###'),
            'serial' => strtoupper($this->faker->unique()->bothify('SN###???###')),
            'descripcion' => $this->faker->sentence(),
            'costo' => $this->faker->randomFloat(2, 1000, 100000),
            'fecha_fabricacion' => $this->faker->dateTimeBetween('-10 years', '-1 year'),
            'fecha_instalacion' => $this->faker->dateTimeBetween('-5 years', 'now'),
            'fecha_inicio_operacion' => $this->faker->dateTimeBetween('-5 years', 'now'),
            'fecha_acta_recibo' => $this->faker->dateTimeBetween('-5 years', 'now'),
            'fecha_vencimiento_garantia' => $this->faker->dateTimeBetween('now', '+3 years'),
            'vida_util' => $this->faker->numberBetween(5, 20),
            'invima' => $this->faker->optional()->bothify('INV-###-???'),
            'garantia' => $this->faker->optional()->sentence(),
            'accesorios' => $this->faker->optional()->sentence(),
            'localizacion_actual' => $this->faker->optional()->words(2, true),
            'calibracion' => $this->faker->boolean(30), // 30% probabilidad de requerir calibración
            'repuesto_pendiente' => $this->faker->boolean(10), // 10% probabilidad de tener repuesto pendiente
            'movilidad' => $this->faker->randomElement(['Fijo', 'Móvil', 'Portátil']),
            'propiedad' => $this->faker->randomElement(['Propio', 'Comodato', 'Alquiler']),
            'evaluacion_desempenio' => $this->faker->randomElement(['Excelente', 'Bueno', 'Regular', 'Deficiente']),
            'periodicidad' => $this->faker->randomElement(['Mensual', 'Trimestral', 'Semestral', 'Anual']),
            'status' => $this->faker->boolean(90), // 90% probabilidad de estar activo
            'created_at' => $this->faker->dateTimeBetween('-2 years', 'now'),
            'updated_at' => now(),
        ];
    }

    /**
     * Indicate that the equipment is active.
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => true,
        ]);
    }

    /**
     * Indicate that the equipment is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => false,
        ]);
    }

    /**
     * Indicate that the equipment requires calibration.
     */
    public function requiresCalibration(): static
    {
        return $this->state(fn (array $attributes) => [
            'calibracion' => true,
        ]);
    }

    /**
     * Indicate that the equipment has pending spare parts.
     */
    public function hasPendingSpares(): static
    {
        return $this->state(fn (array $attributes) => [
            'repuesto_pendiente' => true,
        ]);
    }

    /**
     * Indicate that the equipment is critical (high risk).
     */
    public function critical(): static
    {
        return $this->state(fn (array $attributes) => [
            'criesgo_id' => 1, // Asumiendo que 1 = Alto riesgo
        ]);
    }

    /**
     * Indicate that the equipment is expensive.
     */
    public function expensive(): static
    {
        return $this->state(fn (array $attributes) => [
            'costo' => $this->faker->randomFloat(2, 50000, 500000),
        ]);
    }

    /**
     * Indicate that the equipment is new.
     */
    public function new(): static
    {
        return $this->state(fn (array $attributes) => [
            'fecha_fabricacion' => $this->faker->dateTimeBetween('-1 year', 'now'),
            'fecha_instalacion' => $this->faker->dateTimeBetween('-6 months', 'now'),
            'fecha_inicio_operacion' => $this->faker->dateTimeBetween('-6 months', 'now'),
        ]);
    }

    /**
     * Indicate that the equipment is old.
     */
    public function old(): static
    {
        return $this->state(fn (array $attributes) => [
            'fecha_fabricacion' => $this->faker->dateTimeBetween('-20 years', '-10 years'),
            'fecha_instalacion' => $this->faker->dateTimeBetween('-15 years', '-5 years'),
            'fecha_inicio_operacion' => $this->faker->dateTimeBetween('-15 years', '-5 years'),
        ]);
    }

    /**
     * Indicate that the equipment warranty is expired.
     */
    public function warrantyExpired(): static
    {
        return $this->state(fn (array $attributes) => [
            'fecha_vencimiento_garantia' => $this->faker->dateTimeBetween('-2 years', '-1 day'),
        ]);
    }

    /**
     * Indicate that the equipment warranty is about to expire.
     */
    public function warrantyExpiringSoon(): static
    {
        return $this->state(fn (array $attributes) => [
            'fecha_vencimiento_garantia' => $this->faker->dateTimeBetween('now', '+30 days'),
        ]);
    }

    /**
     * Create equipment with specific brand.
     */
    public function brand(string $brand): static
    {
        return $this->state(fn (array $attributes) => [
            'marca' => $brand,
        ]);
    }

    /**
     * Create equipment with specific model.
     */
    public function model(string $model): static
    {
        return $this->state(fn (array $attributes) => [
            'modelo' => $model,
        ]);
    }

    /**
     * Create equipment with image.
     */
    public function withImage(): static
    {
        return $this->state(fn (array $attributes) => [
            'image' => 'equipos/test-image.jpg',
        ]);
    }
}
