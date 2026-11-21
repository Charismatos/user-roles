<?php

namespace Tests\Browser\Components;

use Laravel\Dusk\Browser;
use Laravel\Dusk\Component as BaseComponent;

class CategoryComponent extends BaseComponent
{
    public function selector(): string
    {
        return '#category_cascading_hub';
    }

    public function assert(Browser $browser): void
    {
        $browser->assertVisible($this->selector())
            ->assertSee('Category Pathway Branch');
    }

    public function elements(): array
    {
        return [
            '@root-select' => 'select.category-select',
            '@add-button' => 'button.btn-add-tier',
            '@new-name' => 'input.new-item-input',
        ];
    }
}
