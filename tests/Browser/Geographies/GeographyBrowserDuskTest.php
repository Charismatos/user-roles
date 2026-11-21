<?php

namespace Tests\Browser\Geographies;

use App\Models\Geography;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTruncation;
use Laravel\Dusk\Browser;
use Tests\Browser\Components\GeographyComponent;
use Tests\Browser\Pages\GeographyDuskPage;
use Tests\DuskTestCase;

class GeographyBrowserDuskTest extends DuskTestCase
{
    use DatabaseTruncation;

    private function loginAsEditor(Browser $browser): void
    {
        $role = Role::factory()->create(['name' => 'Editor', 'level' => 10]);
        $user = User::factory()->create(['email' => 'geography@example.com', 'password' => bcrypt('password'), 'username' => 'geography']);
        $user->assignRole($role);

        $browser->loginAs($user);
    }

    // Happy path: geography management renders its cascading component.
    public function test_geography_management_renders_cascading_component(): void
    {
        Geography::factory()->create(['name' => 'Continent']);

        $this->browse(function (Browser $browser) {
            $this->loginAsEditor($browser);
            $browser->visit(new GeographyDuskPage)
                ->on(new GeographyDuskPage)
                ->within(new GeographyComponent, function (Browser $component) {
                    $component->assertVisible('#geography_cascading_hub');
                });
        });
    }

    // Negative: unauthenticated users cannot open geography management.
    public function test_guest_is_redirected_from_geography_management(): void
    {
        $this->browse(function (Browser $browser) {
            $browser->visit(route('groupings.geographies.modify', [], false))
                ->waitForLocation(route('login', [], false));
        });
    }

    // Edge: geography page renders safely when no records exist.
    public function test_empty_geography_page_renders_without_root_options(): void
    {
        $this->browse(function (Browser $browser) {
            $this->loginAsEditor($browser);
            Geography::query()->delete();
            $this->assertDatabaseCount('geographies', 0);

            $browser->visit(new GeographyDuskPage)
                ->on(new GeographyDuskPage)
                ->within(new GeographyComponent, function (Browser $component) {
                    $component->assertSee('Choose Broad Geography');
                });
        });
    }
}
