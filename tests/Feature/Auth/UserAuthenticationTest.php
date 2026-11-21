<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTruncation;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class UserAuthenticationTest extends TestCase
{
    use DatabaseTruncation;
    use RefreshDatabase;

    // Happy path: public registration creates and authenticates a user.
    public function test_registration_creates_user_and_redirects_to_dashboard(): void
    {
        $response = $this->post(route('register.store'), [
            'name' => 'Ada Lovelace',
            'username' => 'ada',
            'email' => 'ada@example.com',
            'password' => 'strong-password',
        ]);

        $response->assertRedirect(route('dashboard'));
        $this->assertAuthenticated();
        $this->assertDatabaseHas('users', ['name' => 'Ada Lovelace', 'username' => 'ada', 'email' => 'ada@example.com']);
        $this->assertTrue(Hash::check('strong-password', User::where('email', 'ada@example.com')->firstOrFail()->password));
    }

    // Negative: duplicate email is rejected with a validation error.
    public function test_registration_rejects_duplicate_email(): void
    {
        User::factory()->create(['email' => 'duplicate@example.com']);

        $this->from(route('register'))
            ->post(route('register.store'), [
                'name' => 'Duplicate',
                'username' => 'duplicate',
                'email' => 'duplicate@example.com',
                'password' => 'strong-password',
            ])
            ->assertRedirect(route('register'))
            ->assertSessionHasErrors('email');
    }

    // Edge: password shorter than eight characters is rejected.
    public function test_registration_rejects_password_shorter_than_eight_characters(): void
    {
        $this->from(route('register'))
            ->post(route('register.store'), [
                'name' => 'Short Password',
                'username' => 'short',
                'email' => 'short@example.com',
                'password' => 'short',
            ])
            ->assertRedirect(route('register'))
            ->assertSessionHasErrors('password');
        $this->assertDatabaseMissing('users', ['email' => 'short@example.com']);
    }

    // Happy path: valid credentials authenticate and regenerate the session.
    public function test_login_accepts_valid_credentials(): void
    {
        $user = User::factory()->create(['email' => 'login@example.com', 'password' => Hash::make('password')]);

        $this->post(route('login.store'), ['email' => $user->email, 'password' => 'password'])
            ->assertRedirect(route('dashboard'));
        $this->assertAuthenticatedAs($user);
    }

    // Negative: invalid credentials do not authenticate.
    public function test_login_rejects_invalid_credentials(): void
    {
        User::factory()->create(['email' => 'login@example.com', 'password' => Hash::make('password')]);

        $this->from(route('login'))
            ->post(route('login.store'), ['email' => 'login@example.com', 'password' => 'incorrect'])
            ->assertRedirect(route('login'))
            ->assertSessionHasErrors('email');
        $this->assertGuest();
    }

    // Happy path: authenticated dashboard displays the current user.
    public function test_dashboard_displays_authenticated_user(): void
    {
        $user = User::factory()->create(['name' => 'Dashboard User']);

        $this->actingAs($user)->get(route('dashboard'))
            ->assertOk()
            ->assertSee('Dashboard User');
    }

    // Negative: guests cannot access the dashboard.
    public function test_dashboard_redirects_guest_to_login(): void
    {
        $this->get(route('dashboard'))->assertRedirect(route('login'));
    }

    // Happy path: a user can update their own profile.
    public function test_user_can_update_their_profile(): void
    {
        $user = User::factory()->create(['name' => 'Before', 'username' => 'before']);

        $this->actingAs($user)
            ->patch(route('users.update', ['user' => 'before']), ['name' => 'After', 'username' => 'after', 'email' => $user->email])
            ->assertRedirect(route('dashboard'));

        $this->assertDatabaseHas('users', ['id' => $user->id, 'name' => 'After', 'username' => 'after']);
    }

    // Negative: profile update rejects an email owned by another user.
    public function test_profile_update_rejects_duplicate_email(): void
    {
        $user = User::factory()->create(['username' => 'owner']);
        User::factory()->create(['email' => 'taken@example.com']);

        $this->actingAs($user)
            ->from(route('users.edit', ['user' => 'owner']))
            ->patch(route('users.update', ['user' => 'owner']), [
                'name' => $user->name,
                'username' => 'owner',
                'email' => 'taken@example.com',
            ])
            ->assertRedirect(route('users.edit', ['user' => 'owner']))
            ->assertSessionHasErrors('email');
    }

    // Happy path: logout invalidates authentication.
    public function test_logout_ends_authenticated_session(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->post(route('logout'))
            ->assertRedirect(route('login'));
        $this->assertGuest();
    }

    // Edge: profile setup accepts unique username and name updates.
    public function test_profile_setup_updates_unique_username(): void
    {
        $user = User::factory()->create(['username' => 'oldname']);

        $this->actingAs($user)
            ->post(route('profile-setup'), ['username' => 'newname', 'name' => 'Updated Name'])
            ->assertRedirect(route('dashboard'));
        $this->assertDatabaseHas('users', ['id' => $user->id, 'username' => 'newname', 'name' => 'Updated Name']);
    }
}
