# CategoryApiTest

- **What:** Feature/API tests for category listing, children, create, update, and delete behavior.
- **Where:** `tests/Feature/Categories/CategoryApiTest.php`; the `api.v1.categories.*` named routes and category API controller.
- **When:** Run after category validation, DTO, hierarchy, model, or API changes.
- **Who:** Backend/API engineers.
- **Why:** Ensure category hierarchy operations persist correctly and reject invalid hierarchy input.
- **How:** Uses `DatabaseTruncation`, named-route URL generation, Sanctum acting-as authentication, JSON assertions, and database assertions.
- **Happy paths:** Child lookup, create, update, and delete.
- **Negative paths:** Unauthenticated write, missing name, and duplicate name.
- **Edge cases:** Assigning a category to itself as parent.
- **Future tests:** Add descendant-depth, slug uniqueness, parent deletion cascade, and pagination/search when those behaviors are implemented.
