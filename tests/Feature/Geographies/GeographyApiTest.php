<?php

namespace Tests\Feature\Geographies;

use App\Models\Geography;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTruncation;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class GeographyApiTest extends TestCase
{
    use DatabaseTruncation;
    use RefreshDatabase;

    private function editor(): User
    {
        $role = Role::factory()->create(['name' => 'Editor', 'level' => 10]);
        $user = User::factory()->create();
        $user->assignRole($role);

        return $user;
    }

    // Happy path: public child lookup returns direct geography children.
    public function test_children_endpoint_returns_direct_children(): void
    {
        $root = Geography::factory()->create(['name' => 'Continent']);
        Geography::factory()->create(['name' => 'Country A', 'parent_id' => $root->id]);
        Geography::factory()->create(['name' => 'Country B', 'parent_id' => $root->id]);

        $this->getJson(route('api.v1.geographies.children', ['geography' => $root->slug]))
            ->assertOk()
            ->assertJsonCount(2, 'data');
    }

    // Negative: unauthenticated writes are rejected.
    public function test_unauthenticated_store_returns_401(): void
    {
        $this->postJson(route('api.v1.geographies.store'), ['name' => 'Unauthorized'])
            ->assertUnauthorized();
    }

    // Happy path: editor can create a geography.
    public function test_editor_can_create_geography(): void
    {
        $editor = $this->editor();
        Sanctum::actingAs($editor);

        $this->postJson(route('api.v1.geographies.store'), [
            'name' => 'Region',
            'sort_order' => 3,
        ])->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.name', 'Region');
        $this->assertDatabaseHas('geographies', ['name' => 'Region', 'sort_order' => 3]);
    }

    // Negative: missing geography name is rejected.
    public function test_store_rejects_missing_name(): void
    {
        $editor = $this->editor();
        Sanctum::actingAs($editor);

        $this->postJson(route('api.v1.geographies.store'), [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('name');
    }

    // Edge: geography cannot be its own parent.
    public function test_update_rejects_geography_as_its_own_parent(): void
    {
        $editor = $this->editor();
        Sanctum::actingAs($editor);
        $geography = Geography::factory()->create(['name' => 'Self']);

        $this->patchJson(route('api.v1.geographies.update', ['geography' => $geography->slug]), [
            'name' => 'Self',
            'parent_id' => $geography->id,
        ])->assertUnprocessable()
            ->assertJsonValidationErrors('parent_id');
    }

    // Happy path: editor can update and delete a geography.
    public function test_editor_can_update_and_delete_geography(): void
    {
        $editor = $this->editor();
        Sanctum::actingAs($editor);
        $geography = Geography::factory()->create(['name' => 'Before']);

        $this->patchJson(route('api.v1.geographies.update', ['geography' => $geography->slug]), [
            'name' => 'After',
            'sort_order' => 9,
        ])->assertOk()
            ->assertJsonPath('data.name', 'After');
        $this->assertDatabaseHas('geographies', ['id' => $geography->id, 'name' => 'After', 'sort_order' => 9]);

        $this->deleteJson(route('api.v1.geographies.destroy', ['geography' => 'after']))
            ->assertOk();
        $this->assertDatabaseMissing('geographies', ['id' => $geography->id]);
    }
}
