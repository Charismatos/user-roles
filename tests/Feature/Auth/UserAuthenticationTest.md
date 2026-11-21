# UserAuthenticationTest

- **What:** Feature tests for registration, login, logout, dashboard access, profile updates, and profile setup.
- **Where:** `tests/Feature/Auth/UserAuthenticationTest.php`; application endpoints in `routes/web.php` and auth controllers.
- **When:** Run after auth controller, form request, route, or user model changes.
- **Who:** Feature test owner: application/backend engineers.
- **Why:** Prevent account creation, authentication, authorization, and profile-data regressions.
- **How:** Uses `DatabaseTruncation`, Laravel request helpers with named routes, session assertions, and database assertions.
- **Happy paths:** Registration/login/logout, dashboard rendering, and profile updates.
- **Negative paths:** Duplicate email, short passwords, invalid credentials, and guest dashboard access.
- **Edge cases:** Unique username profile setup and route-key username updates.
- **Future tests:** Add password-reset, email-verification, concurrent-same-user updates, and malformed payload cases by adding methods to this class and a matching Browser test class block if UI behavior changes.
