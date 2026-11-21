<?php

namespace Tests\Browser\Roles;

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTruncation;
use Laravel\Dusk\Browser;
use Tests\Browser\Components\RoleComponent;
use Tests\Browser\Pages\RoleDuskPage;
use Tests\DuskTestCase;

class RoleBrowserDuskTest extends DuskTestCase
{
    use DatabaseTruncation;

    private function loginAsAdmin(Browser $browser): void
    {
        $adminRole = Role::factory()->create(['name' => 'Admin', 'level' => 1, 'is_system' => true]);
        $admin = User::factory()->create(['email' => 'admin@example.com', 'password' => bcrypt('password'), 'username' => 'admin']);
        $admin->assignRole($adminRole);

        $browser->loginAs($admin);
    }

    // Happy path: role index renders the role table for an admin.
    public function test_role_index_displays_role_table(): void
    {
        $this->browse(function (Browser $browser) {
            $this->loginAsAdmin($browser);
            $browser->visit(new RoleDuskPage)
                ->on(new RoleDuskPage)
                ->within(new RoleComponent, function (Browser $component) {
                    $component->assertVisible('@rows')
                        ->assertSee('Admin');
                });
        });
    }

    // Negative: unauthenticated users cannot view role management.
    public function test_guest_is_redirected_from_role_index(): void
    {
        $this->browse(function (Browser $browser) {
            $browser->visit(route('roles.index', [], false))
                ->waitForLocation(route('login', [], false))
                ->assertSee('LOGIN');
        });
    }

    // Edge: role table safely renders when only the administrator role exists.
    public function test_role_index_handles_single_role_state(): void
    {
        $this->browse(function (Browser $browser) {
            $this->loginAsAdmin($browser);
            $browser->visit(new RoleDuskPage)
                ->assertSee('Admin');
        });
    }
}
