<?php

namespace Tests\Feature\Categories;

use App\Models\Category;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTruncation;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CategoryApiTest extends TestCase
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

    // Happy path: public child lookup returns only direct children.
    public function test_children_endpoint_returns_direct_children(): void
    {
        $root = Category::factory()->create(['name' => 'Technology']);
        Category::factory()->create(['name' => 'Software', 'parent_id' => $root->id, 'sort_order' => 1]);
        Category::factory()->create(['name' => 'Hardware', 'parent_id' => $root->id, 'sort_order' => 2]);

        $this->getJson(route('api.v1.categories.children', ['category' => $root->slug]))
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('data.0.name', 'Software');
    }

    // Negative: unauthenticated API writes are rejected.
    public function test_unauthenticated_store_returns_401(): void
    {
        $this->postJson(route('api.v1.categories.store'), ['name' => 'Unauthorized'])
            ->assertUnauthorized();
    }

    // Happy path: an editor can create a category.
    public function test_editor_can_create_category(): void
    {
        $editor = $this->editor();
        Sanctum::actingAs($editor);

        $this->postJson(route('api.v1.categories.store'), [
            'name' => 'Finance',
            'sort_order' => 5,
        ])->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.name', 'Finance');
        $this->assertDatabaseHas('categories', ['name' => 'Finance', 'sort_order' => 5]);
    }

    // Negative: missing category name is rejected.
    public function test_store_rejects_missing_name(): void
    {
        $editor = $this->editor();
        Sanctum::actingAs($editor);

        $this->postJson(route('api.v1.categories.store'), [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('name');
    }

    // Negative: duplicate category names are rejected.
    public function test_store_rejects_duplicate_name(): void
    {
        $editor = $this->editor();
        Sanctum::actingAs($editor);
        Category::factory()->create(['name' => 'Duplicate']);

        $this->postJson(route('api.v1.categories.store'), ['name' => 'Duplicate'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('name');
    }

    // Happy path: editor can update a category.
    public function test_editor_can_update_category(): void
    {
        $editor = $this->editor();
        Sanctum::actingAs($editor);
        $category = Category::factory()->create(['name' => 'Before']);

        $this->patchJson(route('api.v1.categories.update', ['category' => $category->slug]), [
            'name' => 'After',
            'sort_order' => 8,
        ])->assertOk()
            ->assertJsonPath('data.name', 'After');
        $this->assertDatabaseHas('categories', ['id' => $category->id, 'name' => 'After', 'sort_order' => 8]);
    }

    // Edge: a category cannot be assigned as its own parent.
    public function test_update_rejects_category_as_its_own_parent(): void
    {
        $editor = $this->editor();
        Sanctum::actingAs($editor);
        $category = Category::factory()->create(['name' => 'Self']);

        $this->patchJson(route('api.v1.categories.update', ['category' => $category->slug]), [
            'name' => 'Self',
            'parent_id' => $category->id,
        ])->assertUnprocessable()
            ->assertJsonValidationErrors('parent_id');
    }

    // Happy path: editor can delete a category.
    public function test_editor_can_delete_category(): void
    {
        $editor = $this->editor();
        Sanctum::actingAs($editor);
        $category = Category::factory()->create(['name' => 'Delete Me']);

        $this->deleteJson(route('api.v1.categories.destroy', ['category' => $category->slug]))
            ->assertOk()
            ->assertJson(['success' => true]);
        $this->assertDatabaseMissing('categories', ['id' => $category->id]);
    }
}
