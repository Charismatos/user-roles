<?php

namespace Tests\Browser;

use Illuminate\Foundation\Testing\DatabaseTruncation;
use Laravel\Dusk\Browser;
use Tests\Browser\Pages\HomeDuskPage;
use Tests\DuskTestCase;

class ExampleDuskTest extends DuskTestCase
{
    use DatabaseTruncation;

    /**
     * A basic browser test example.
     */
    public function test_basic_example(): void
    {
        $this->browse(function (Browser $browser) {
            $browser->visit(new HomeDuskPage)
                ->assertSee('User Roles');
        });
    }
}
