<?php

namespace Tests\Browser\Components;

use Laravel\Dusk\Browser;
use Laravel\Dusk\Component as BaseComponent;

class AuthComponent extends BaseComponent
{
    public function selector(): string
    {
        return 'form';
    }

    public function assert(Browser $browser): void
    {
        $browser->assertVisible($this->selector());
    }

    public function elements(): array
    {
        return [
            '@email' => 'input[name="email"]',
            '@password' => 'input[name="password"]',
            '@submit' => 'button[type="submit"]',
        ];
    }
}
