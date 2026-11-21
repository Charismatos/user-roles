# UserAuthenticationBrowserDuskTest

- **What:** Dusk browser tests for login success, login failure, and guest dashboard protection.
- **Where:** `tests/Browser/Auth/UserAuthenticationBrowserDuskTest.php`, with `tests/Browser/Pages/AuthDuskPage.php` and `tests/Browser/Components/AuthComponent.php`.
- **When:** Run after login Blade, auth JavaScript, route, or session behavior changes.
- **Who:** Full-stack engineers and browser test maintainers.
- **Why:** Confirm user-visible authentication behavior in a real browser.
- **How:** Uses `DatabaseTruncation`, named route URLs, Dusk page/component objects, browser typing, pressing, location waits, and visible-text assertions.
- **Happy path:** Valid credentials reach the dashboard.
- **Negative path:** Invalid credentials remain on login and display an error.
- **Edge case:** Guest dashboard access redirects to login.
- **Future tests:** Add registration, logout, profile edit, remember-me, validation-attribute, and JavaScript-disabled cases as separate browser methods and reusable page/component actions.
