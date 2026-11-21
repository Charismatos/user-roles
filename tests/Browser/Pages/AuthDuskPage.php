<?php

namespace Tests\Browser\Pages;

use Laravel\Dusk\Browser;

class AuthDuskPage extends BaseDuskPage
{
    public function url(): string
    {
        return route('login', [], false);
    }

    public function assert(Browser $browser): void
    {
        $browser->assertSee('LOGIN');
    }

    public function elements(): array
    {
        return [
            '@name' => 'input[name="name"]',
            '@username' => 'input[name="username"]',
            '@email' => 'input[name="email"]',
            '@password' => 'input[name="password"]',
            '@submit' => 'button[type="submit"]',
        ];
    }
}
