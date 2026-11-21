# ExampleDuskTest

- **What:** Minimal Dusk smoke test for the public home page.
- **Where:** `tests/Browser/ExampleDuskTest.php`, `tests/Browser/Pages/HomeDuskPage.php`, and `tests/Browser/Components/ExampleComponent.php`.
- **When:** Run for browser boot and public navigation smoke checking.
- **Who:** All contributors.
- **Why:** Detect browser-driver, web-server, or home-view failures.
- **How:** Uses `DatabaseTruncation`, named route URLs, and Dusk page navigation plus visible text.
- **Happy path:** Home page shows `User Roles`.
- **Negative/edge paths:** Not applicable to the current scaffold.
- **Future tests:** Add navigation, viewport, and guest/registered-user home-state cases through `HomeDuskPage` and `ExampleComponent`.
