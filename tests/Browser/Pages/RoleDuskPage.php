<?php

namespace Tests\Browser\Pages;

use Laravel\Dusk\Browser;

class RoleDuskPage extends BaseDuskPage
{
    public function url(): string
    {
        return route('roles.index', [], false);
    }

    public function assert(Browser $browser): void
    {
        $browser->assertSee('System Roles');
    }

    public function elements(): array
    {
        return [
            '@create-role' => 'a',
            '@role-table' => 'table',
        ];
    }
}
