<?php

namespace Tests\Browser\Categories;

use App\Models\Category;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTruncation;
use Laravel\Dusk\Browser;
use Tests\Browser\Components\CategoryComponent;
use Tests\Browser\Pages\CategoryDuskPage;
use Tests\DuskTestCase;

class CategoryBrowserDuskTest extends DuskTestCase
{
    use DatabaseTruncation;

    private function loginAsEditor(Browser $browser): void
    {
        $role = Role::factory()->create(['name' => 'Editor', 'level' => 10]);
        $user = User::factory()->create(['email' => 'category@example.com', 'password' => bcrypt('password'), 'username' => 'category']);
        $user->assignRole($role);

        $browser->loginAs($user);
    }

    // Happy path: category management renders its cascading component.
    public function test_category_management_renders_cascading_component(): void
    {
        Category::factory()->create(['name' => 'Technology']);

        $this->browse(function (Browser $browser) {
            $this->loginAsEditor($browser);
            $browser->visit(new CategoryDuskPage)
                ->on(new CategoryDuskPage)
                ->within(new CategoryComponent, function (Browser $component) {
                    $component->assertSee('Choose Broad Category');
                });
        });
    }

    // Negative: unauthenticated users cannot open category management.
    public function test_guest_is_redirected_from_category_management(): void
    {
        $this->browse(function (Browser $browser) {
            $browser->visit(route('groupings.categories.modify', [], false))
                ->waitForLocation(route('login', [], false));
        });
    }

    // Edge: category page renders safely when no categories exist.
    public function test_empty_category_page_renders_without_root_options(): void
    {
        $this->browse(function (Browser $browser) {
            $this->loginAsEditor($browser);
            Category::query()->delete();
            $this->assertDatabaseCount('categories', 0);

            $browser->visit(new CategoryDuskPage)
                ->on(new CategoryDuskPage)
                ->within(new CategoryComponent, function (Browser $component) {
                    $component->assertSee('Choose Broad Category');
                });
        });
    }
}
