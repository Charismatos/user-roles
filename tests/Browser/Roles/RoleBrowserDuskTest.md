# RoleBrowserDuskTest

- **What:** Dusk browser tests for role index visibility and access protection.
- **Where:** `tests/Browser/Roles/RoleBrowserDuskTest.php`, `tests/Browser/Pages/RoleDuskPage.php`, and `tests/Browser/Components/RoleComponent.php`.
- **When:** Run after role index Blade, navigation, middleware, or table behavior changes.
- **Who:** Full-stack/security engineers.
- **Why:** Ensure administrators can view roles and guests cannot access management UI.
- **How:** Uses `DatabaseTruncation`, named route URLs, Dusk login setup, page/component objects, and visible-text/table assertions.
- **Happy path:** Administrator sees the role table.
- **Negative path:** Guest is redirected to login.
- **Edge case:** Empty role collection displays the no-roles state.
- **Future tests:** Add create/edit/delete browser flows and role-assignment confirmation flows by extending `RoleDuskPage` and `RoleComponent`.
