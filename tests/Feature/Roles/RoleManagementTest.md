# RoleManagementTest

- **What:** Feature tests for role CRUD guards and user-role assignment.
- **Where:** `tests/Feature/Roles/RoleManagementTest.php`; role web routes and role controllers.
- **When:** Run after role hierarchy, validation, assignment, or deletion behavior changes.
- **Who:** Backend and security engineers.
- **Why:** Protect role authorization and prevent deletion or modification of protected role states.
- **How:** Uses `DatabaseTruncation`, named-route request helpers, factory-created users and roles, authenticated requests, and JSON/database assertions.
- **Happy paths:** Create, delete unassigned, and synchronize assigned roles.
- **Negative paths:** Guest creation, duplicate names, system-role deletion, assigned-role deletion.
- **Edge cases:** Disabling system status and invalid assigned role IDs.
- **Future tests:** Add hierarchy matrix, cross-user assignment, mail invitation confirmation, and self-invite cases as separate methods or a dedicated role invitation test class.
