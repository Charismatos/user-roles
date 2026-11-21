# ExampleTest

- **What:** Minimal smoke test for public home-page availability.
- **Where:** `tests/Feature/ExampleTest.php`.
- **When:** Run for a quick application boot and route smoke check.
- **Who:** All contributors.
- **Why:** Detect catastrophic route, view, or application boot failures.
- **How:** Uses `DatabaseTruncation` and a GET request generated from the `home` named route.
- **Happy path:** Home page returns HTTP 200.
- **Negative/edge paths:** Not applicable to the current smoke test.
- **Future tests:** Replace or supplement this scaffold with domain-specific home-page content and guest navigation assertions.
