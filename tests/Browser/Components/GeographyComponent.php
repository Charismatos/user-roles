<?php

namespace Tests\Browser\Components;

use Laravel\Dusk\Browser;
use Laravel\Dusk\Component as BaseComponent;

class GeographyComponent extends BaseComponent
{
    public function selector(): string
    {
        return '#geography_cascading_hub';
    }

    public function assert(Browser $browser): void
    {
        $browser->assertVisible($this->selector());
    }

    public function elements(): array
    {
        return [
            '@root-select' => 'select.geography-select',
            '@add-button' => 'button.btn-add-tier',
        ];
    }
}
