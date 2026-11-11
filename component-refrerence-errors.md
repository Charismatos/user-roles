# Blade component reference error: `$linkAttributeBag`

## Error and root cause

The login page renders `<x-links.link>` from
[`resources/views/Auth/Guest/user-login.blade.php`](resources/views/Auth/Guest/user-login.blade.php)
near its footer. That call is valid. The component source in
[`resources/views/components/links/link.blade.php`](resources/views/components/links/link.blade.php)
also assigns `$linkAttributeBag` before rendering the anchor.

The error is caused by Blade compiling the component incorrectly. The opening
Blade documentation comment in `link.blade.php` literally mentioned `@php`.
Laravel 13's Blade compiler extracts raw `@php ... @endphp` blocks before it
removes Blade comments. It therefore treated the `@php` mention in the comment
as the start of a PHP block and consumed the component's real `@props` and
initialization block through the real `@endphp`. When the comment was removed,
that captured content disappeared too. The generated view then contained the
anchor's reference to `$linkAttributeBag`, but no assignment for the variable.

This is not a missing login-view prop, route, authentication value, or database
value. Clearing the view cache alone does not solve it; recompiling the
unchanged source reproduces the same broken view.

The same directive-in-comment pattern existed in the button component used by
the login page and the reusable body component. The steps below correct all
three affected sources.

## Permanent source corrections

Make these wording-only edits in the opening Blade documentation comments.
Do not move the PHP initialization blocks or add `$linkAttributeBag` to the
login view.

1. In `resources/views/components/links/link.blade.php`, replace the text on
   the `ATTRIBUTE PARSING` comment line (currently line 12):

   ```text
   2. ATTRIBUTE PARSING: Add your property mapping logic inside the $dynamicAttributes array within the @php block.
   ```

   with:

   ```text
   2. ATTRIBUTE PARSING: Add your property mapping logic inside the $dynamicAttributes array within the PHP initialization block.
   ```

   Also replace the `@php` wording in the later `FUTURE MODIFICATION NOTE`
   comment (near the end of the file, currently line 250) with
   `PHP initialization block`. Keep the actual `@php`/`@endphp` directives and
   the `$linkAttributeBag = ...` assignment in the initialization block.

2. In `resources/views/components/buttons/button.blade.php`, replace the
   `ATTRIBUTE PARSING` comment line in the opening comment (currently line 12):

   ```text
   2. ATTRIBUTE PARSING: Add your property mapping logic inside the @php block.
   ```

   with:

   ```text
   2. ATTRIBUTE PARSING: Add your property mapping logic inside the PHP initialization block.
   ```

3. In `resources/views/components/documents/body.blade.php`, replace the
   `ATTRIBUTE PARSING` comment line in the opening comment (currently line 12)
   and the `FUTURE MODIFICATION NOTE` comment near the end (currently line 197)
   so both say `PHP initialization block` instead of `@php block`. Keep the
   actual PHP directives and body attribute assignment unchanged.

These are documentation-comment edits only; they prevent the compiler from
mistaking prose for a Blade directive. Do not apply this replacement to actual
`@php` or `@endphp` directives.

## Rebuild and verify compiled views

After changing any Blade component source, rebuild the compiled views in the
same Laravel runtime/container that serves the application. From the project
root for this Docker Compose setup, run:

```sh
docker compose exec laravel.test php artisan view:cache
```

`view:cache` clears the previous compiled views and recompiles the templates.
In a deployment process, run this command after the updated Blade files have
been installed and before sending traffic to the new release. For a non-Docker
runtime, run `php artisan view:cache` from the Laravel application root under
the application's PHP environment.

Then request `/login` and confirm it returns successfully. If the compiled
template still contains only the `<a>` output and no component setup, first
confirm that the command ran in the same container/release serving the request
and that its mounted/deployed `resources/views/components/links/link.blade.php`
contains the corrected comment.

## Files that do not need login-specific changes

- `resources/views/Auth/Guest/user-login.blade.php`: keep the existing
  `<x-links.link href="{{ route('register') }}" ... />` call.
- `app/Http/Controllers/Auth/Auth/AuthenticatedSessionController.php` and
  `routes/web.php`: the route correctly returns the login view; no changes are
  required there.
- `docker/8.5/start-container`: no startup-script modification is required.
  Rebuild the view cache as a deployment step after source files are updated,
  rather than recompiling every time the application container starts.
