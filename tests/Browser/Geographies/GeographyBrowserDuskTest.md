# GeographyBrowserDuskTest

- **What:** Dusk browser tests for geography management rendering and access protection.
- **Where:** `tests/Browser/Geographies/GeographyBrowserDuskTest.php`, `tests/Browser/Pages/GeographyDuskPage.php`, and `tests/Browser/Components/GeographyComponent.php`.
- **When:** Run after geography Blade, JavaScript cascading, middleware, or root listing behavior changes.
- **Who:** Full-stack engineers.
- **Why:** Verify geography UI rendering and guest protection.
- **How:** Uses `DatabaseTruncation`, named route URLs, Dusk page/component objects, authenticated setup, and visible-text assertions.
- **Happy path:** Editor sees the cascading geography component.
- **Negative path:** Guest is redirected to login.
- **Edge case:** Empty database renders without root options.
- **Future tests:** Add AJAX add/rename/delete and deep-level selection flows through `GeographyComponent`.
