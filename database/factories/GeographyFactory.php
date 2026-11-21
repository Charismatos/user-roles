<?php

namespace Database\Factories;

use App\Models\Geography;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Geography>
 */
class GeographyFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => fake()->unique()->city(),
            'parent_id' => null,
            'sort_order' => fake()->numberBetween(0, 100),
        ];
    }
}
