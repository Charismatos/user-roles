<?php

namespace Tests\Browser\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTruncation;
use Laravel\Dusk\Browser;
use Tests\Browser\Components\AuthComponent;
use Tests\Browser\Pages\AuthDuskPage;
use Tests\DuskTestCase;

class UserAuthenticationBrowserDuskTest extends DuskTestCase
{
    use DatabaseTruncation;

    // Happy path: a visitor can open the login page and submit valid credentials.
    public function test_login_page_accepts_valid_credentials(): void
    {
        $user = User::factory()->create([
            'email' => 'browser@example.com',
            'password' => bcrypt('password'),
            'username' => 'browser',
        ]);

        $this->browse(function (Browser $browser) use ($user) {
            $browser->visit(new AuthDuskPage)
                ->within(new AuthComponent, function (Browser $form) use ($user) {
                    $form->type('@email', $user->email)
                        ->type('@password', 'password')
                        ->press('LogIn');
                })
                ->waitForLocation(route('dashboard', [], false))
                ->assertSee('DASHBOARD');
        });
    }

    // Negative: invalid credentials remain on the login page.
    public function test_login_page_rejects_invalid_credentials(): void
    {
        $this->browse(function (Browser $browser) {
            $browser->visit(route('login', [], false))
                ->within(new AuthComponent, function (Browser $form) {
                    $form->type('@email', 'missing@example.com')
                        ->type('@password', 'incorrect')
                        ->press('LogIn');
                })
                ->waitForText('These credentials do not match our records.');
        });
    }

    // Edge: unauthenticated dashboard navigation redirects to login.
    public function test_guest_is_redirected_from_dashboard_to_login(): void
    {
        $this->browse(function (Browser $browser) {
            $browser->visit(route('dashboard', [], false))
                ->waitForLocation(route('login', [], false))
                ->assertSee('LOGIN');
        });
    }
}
