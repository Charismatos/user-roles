<?php

namespace Tests\Browser\Pages;

use Laravel\Dusk\Browser;

class GeographyDuskPage extends BaseDuskPage
{
    public function url(): string
    {
        return route('groupings.geographies.modify', [], false);
    }

    public function assert(Browser $browser): void
    {
        $browser->assertSee('Geography');
    }

    public function elements(): array
    {
        return [
            '@geography-level' => '#geography_cascading_hub',
            '@geography-select' => 'select.geography-select',
        ];
    }
}
