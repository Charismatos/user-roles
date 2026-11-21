<?php

namespace Tests\Browser\Components;

use Laravel\Dusk\Browser;
use Laravel\Dusk\Component as BaseComponent;

class RoleComponent extends BaseComponent
{
    public function selector(): string
    {
        return 'table';
    }

    public function assert(Browser $browser): void
    {
        $browser->assertVisible('@rows')
            ->assertSee('System Roles');
    }

    public function elements(): array
    {
        return [
            '@rows' => 'tbody tr',
        ];
    }
}
