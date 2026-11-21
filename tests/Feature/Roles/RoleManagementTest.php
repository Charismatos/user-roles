<?php

namespace Tests\Feature\Roles;

use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTruncation;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RoleManagementTest extends TestCase
{
    use DatabaseTruncation;
    use RefreshDatabase;

    private function admin(): User
    {
        $adminRole = Role::factory()->create(['name' => 'Admin', 'level' => 1, 'is_system' => true]);
        $admin = User::factory()->create(['username' => 'admin']);
        $admin->assignRole($adminRole);

        return $admin;
    }

    // Happy path: an authorized administrator can create a role.
    public function test_authorized_admin_can_create_role(): void
    {
        $admin = $this->admin();

        $this->actingAs($admin)->post(route('roles.store'), [
            'name' => 'Auditor',
            'description' => 'Read-only reviewer',
            'level' => 20,
            'is_system' => false,
        ])->assertRedirect();

        $this->assertDatabaseHas('roles', ['name' => 'Auditor', 'slug' => 'auditor', 'level' => 20]);
    }

    // Negative: an unauthenticated request cannot create a role.
    public function test_guest_cannot_create_role(): void
    {
        $this->post(route('roles.store'), ['name' => 'Guest Role', 'level' => 20])
            ->assertRedirect(route('login'));
    }

    // Negative: duplicate role names are rejected.
    public function test_create_role_rejects_duplicate_name(): void
    {
        $admin = $this->admin();
        Role::factory()->create(['name' => 'Existing']);

        $this->actingAs($admin)
            ->from(route('roles.create'))
            ->post(route('roles.store'), ['name' => 'Existing', 'level' => 20])
            ->assertRedirect(route('roles.create'))
            ->assertSessionHasErrors('name');
    }

    // Happy path: unassigned role can be deleted.
    public function test_unassigned_role_can_be_deleted(): void
    {
        $admin = $this->admin();
        $role = Role::factory()->create(['name' => 'Disposable', 'is_system' => false]);

        $this->actingAs($admin)->deleteJson(route('roles.destroy', ['role' => $role->slug]))
            ->assertOk()
            ->assertJson(['success' => true]);
        $this->assertDatabaseMissing('roles', ['id' => $role->id]);
    }

    // Negative: protected system role cannot be deleted.
    public function test_system_role_cannot_be_deleted(): void
    {
        $admin = $this->admin();
        $systemRole = Role::factory()->create(['name' => 'Protected', 'is_system' => true]);

        $this->actingAs($admin)->deleteJson(route('roles.destroy', ['role' => $systemRole->slug]))
            ->assertForbidden()
            ->assertJson(['success' => false]);
    }

    // Negative: role assigned to a user cannot be deleted.
    public function test_assigned_role_cannot_be_deleted(): void
    {
        $admin = $this->admin();
        $role = Role::factory()->create(['name' => 'Assigned']);
        $user = User::factory()->create();
        $user->assignRole($role);

        $this->actingAs($admin)->deleteJson(route('roles.destroy', ['role' => $role->slug]))
            ->assertStatus(422)
            ->assertJson(['success' => false]);
    }

    // Edge: protected system role cannot have is_system disabled.
    public function test_system_role_status_cannot_be_disabled(): void
    {
        $admin = $this->admin();
        $role = Role::factory()->create(['name' => 'Protected Update', 'is_system' => true, 'level' => 10]);

        $this->actingAs($admin)->patchJson(route('roles.update', ['role' => $role->slug]), [
            'name' => 'Protected Update',
            'description' => null,
            'level' => 10,
            'is_system' => false,
        ])->assertStatus(422);
    }

    // Happy path: admin can synchronize roles for a target user.
    public function test_admin_can_update_roles_assigned_to_target_user(): void
    {
        $admin = $this->admin();
        $target = User::factory()->create(['username' => 'target']);
        $role = Role::factory()->create(['name' => 'Reviewer', 'level' => 10]);

        $this->actingAs($admin)
            ->patchJson(route('users.roles.update', ['user' => $target->username]), ['roles' => [$role->id]])
            ->assertOk()
            ->assertJson(['success' => true]);
        $this->assertTrue($target->fresh()->hasRole('reviewer'));
    }

    // Edge: invalid role IDs are rejected by assignment validation.
    public function test_role_assignment_rejects_invalid_role_id(): void
    {
        $admin = $this->admin();
        $target = User::factory()->create(['username' => 'target']);

        $this->actingAs($admin)
            ->patch(route('users.roles.update', ['user' => $target->username]), ['roles' => [999999]])
            ->assertSessionHasErrors('roles.0');
    }
}
