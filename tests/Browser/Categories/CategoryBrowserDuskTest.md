# CategoryBrowserDuskTest

- **What:** Dusk browser tests for category management page rendering and access protection.
- **Where:** `tests/Browser/Categories/CategoryBrowserDuskTest.php`, `tests/Browser/Pages/CategoryDuskPage.php`, and `tests/Browser/Components/CategoryComponent.php`.
- **When:** Run after category Blade, JavaScript cascading, middleware, or root listing behavior changes.
- **Who:** Full-stack engineers.
- **Why:** Verify that category UI appears and is protected.
- **How:** Uses `DatabaseTruncation`, named route URLs, Dusk page/component objects, authenticated setup, and visible-text assertions.
- **Happy path:** Editor sees the cascading category component.
- **Negative path:** Guest is redirected to login.
- **Edge case:** Empty database renders without root options.
- **Future tests:** Add AJAX add/rename/delete flows and deep-level selection flows through `CategoryComponent`.
