<?php

namespace Tests\Browser\Pages;

use Laravel\Dusk\Browser;

class CategoryDuskPage extends BaseDuskPage
{
    public function url(): string
    {
        return route('groupings.categories.modify', [], false);
    }

    public function assert(Browser $browser): void
    {
        $browser->assertSee('Category Focus');
    }

    public function elements(): array
    {
        return [
            '@category-level' => '#category_cascading_hub',
            '@category-select' => 'select.category-select',
            '@new-category' => 'input.new-item-input',
        ];
    }
}
