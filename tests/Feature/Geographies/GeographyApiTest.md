# GeographyApiTest

- **What:** Feature/API tests for geography children, create, update, and delete behavior.
- **Where:** `tests/Feature/Geographies/GeographyApiTest.php`; the `api.v1.geographies.*` named routes and geography API controller.
- **When:** Run after geography validation, DTO, hierarchy, model, or API changes.
- **Who:** Backend/API engineers.
- **Why:** Verify geography records persist and invalid parent relationships are blocked.
- **How:** Uses `DatabaseTruncation`, named-route URL generation, Sanctum authentication, JSON assertions, and database assertions.
- **Happy paths:** Child lookup, create, update, and delete.
- **Negative paths:** Unauthenticated write and missing name.
- **Edge cases:** Assigning a geography to itself as parent.
- **Future tests:** Add duplicate slug/name, descendant, cascade, search, and pagination cases as separate test methods.
