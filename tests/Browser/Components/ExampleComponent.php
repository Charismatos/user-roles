<?php

namespace Tests\Browser\Components;

use Laravel\Dusk\Browser;
use Laravel\Dusk\Component as BaseComponent;

class ExampleComponent extends BaseComponent
{
    public function selector(): string
    {
        return 'body';
    }

    public function assert(Browser $browser): void
    {
        $browser->assertVisible($this->selector());
    }

    public function elements(): array
    {
        return [];
    }
}
