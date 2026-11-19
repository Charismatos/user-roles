/**
 * =============================================================================
 * GLOSSARY OF ABBREVIATIONS USED WITHIN THIS FILE & COMMENTS:
 * -----------------------------------------------------------------------------
 * - DOM   : Document Object Model
 * - API   : Application Programming Interface
 * - JSON  : JavaScript Object Notation
 * - UI    : User Interface
 * - SDK   : Software Development Kit
 * - ESM   : ECMAScript Module
 * - CB    : Callback function
 * - HTML  : HyperText Markup Language
 * - SSR   : Server-Side Rendering
 * - CSS   : Cascading Style Sheets
 * - AJAX  : Asynchronous JavaScript and XML
 * - URL   : Uniform Resource Locator
 * - REST  : Representational State Transfer
 * =============================================================================
 */

/**
 * @typedef {string | ((id: string | number) => string)} ApiRouteHandler
 */

/**
 * @typedef {Record<string, ApiRouteHandler>} ObjectOfApiRoutes
 */

/**
 * @class ApiRoutesConfig
 * @classdesc Enterprise-grade, project-agnostic configuration module designed to
 * generate dynamic, polymorphic CRUD endpoint URL maps with built-in versioning (`v1`)
 * and intelligent pluralization for cascading taxonomy engines across 10,000+ independent
 * Laravel web applications spanning diverse industry verticals (agriculture, defense, education,
 * energy, minerals, finance, health, justice, security, real estate, government, labour,
 * science, tech, environment, water, transport, sports, construction, trade & commerce, tourism).
 */
export class ApiRoutesConfig {
    /**
     * Converts a singular or base grouping name into its correct grammatical plural form
     * to match Laravel REST resource routing conventions (e.g., category -> categories).
     *
     * @param {string} word - The base singular or input grouping string.
     * @returns {string} The correctly pluralized resource name.
     */
    static pluralize(word) {
        if (!word || typeof word !== "string") return "groups";
        const trimmed = word.trim().toLowerCase();

        // Handle common enterprise sector irregularities
        /** @type {Record<string, string>} */
        const irregulars = {
            category: "categories",
            geography: "geographies",
            subsidiary: "subsidiaries",
            inventory: "inventories",
            facility: "facilities",
            currency: "currencies",
            activity: "activities",
        };

        if (irregulars[trimmed]) {
            return irregulars[trimmed];
        }

        // Standard English pluralization rules for database tables
        if (trimmed.endsWith("y") && !/[aeiou]y$/.test(trimmed)) {
            return trimmed.slice(0, -1) + "ies";
        }
        if (
            trimmed.endsWith("s") ||
            trimmed.endsWith("x") ||
            trimmed.endsWith("z") ||
            trimmed.endsWith("ch") ||
            trimmed.endsWith("sh")
        ) {
            return trimmed + "es";
        }

        return trimmed + "s";
    }

    /**
     * Generates a fully typed, secure set of versioned (`v1`) default API route URL strings
     * and callback handlers matching Laravel RESTful resource routing rules.
     *
     * @param {string} [groupingName="group"] - The target database resource grouping name (e.g., 'category', 'geography', 'account').
     * @returns {ObjectOfApiRoutes} An object mapping CRUD actions to versioned URL strings or parameter-based builder functions.
     */
    static getRoutes(groupingName = "group") {
        /** @type {string} */
        const sanitizedGroupingName =
            typeof groupingName === "string" && groupingName.trim() !== ""
                ? groupingName.trim()
                : "group";

        // Automatically resolve correct plural form (e.g., category -> categories)
        const pluralName = ApiRoutesConfig.pluralize(sanitizedGroupingName);

        return {
            /**
             * Generates the versioned endpoint URL to fetch child entries for a given parent record ID.
             * @type {ApiRouteHandler}
             * @param {string | number} slug - Parent record identifier.
             * @returns {string} Fully formatted API endpoint URL.
             */
            fetchChildren: (slug) => `/api/v1/${pluralName}/${slug}/children`,

            /**
             * Represents the versioned REST storage endpoint URL for creating a new grouping record.
             * @type {string}
             */
            store: `/api/v1/${pluralName}`,

            /**
             * Generates the versioned deletion endpoint URL for a specific record ID.
             * @type {ApiRouteHandler}
             * @param {string | number} slug - Record identifier to delete.
             * @returns {string} Fully formatted API endpoint URL.
             */
            delete: (slug) => `/api/v1/${pluralName}/${slug}`,

            /**
             * Generates the versioned update (patch) endpoint URL for a specific record ID.
             * @type {ApiRouteHandler}
             * @param {string | number} slug - Record identifier to update.
             * @returns {string} Fully formatted API endpoint URL.
             */
            patch: (slug) => `/api/v1/${pluralName}/${slug}`,
        };
    }
}

/**
 * =============================================================================
 * REAL-WORLD USAGE, CUSTOMIZATION & RE-REFERENCE GUIDE (10,000+ PROJECTS):
 * =============================================================================
 *
 * 1. HOW TO IMPORT AND REFERENCE THIS MODULE IN AN ENTRY SCRIPT:
 *    ```javascript
 *    import { ApiRoutesConfig } from './sub-modules/ApiRoutesConfig.js';
 *    const categoryRoutes = ApiRoutesConfig.getRoutes('category');
 *    console.log(categoryRoutes.store); // Outputs: "/api/v1/categories"
 *    console.log(categoryRoutes.fetchChildren(5)); // Outputs: "/api/v1/categories/5/children"
 *    console.log(categoryRoutes.delete(42)); // Outputs: "/api/v1/categories/42"
 *    ```
 *
 * 2. DOMAIN-SPECIFIC CUSTOMIZATION EXAMPLES (MAPPED TO 21 SECTORS):
 *    - FINANCE / BANKING: `ApiRoutesConfig.getRoutes('currency_denomination')` -> `/api/v1/currency_denominations`
 *    - HEALTH / MEDICAL: `ApiRoutesConfig.getRoutes('medical_ward')` -> `/api/v1/medical_wards`
 *    - AGRICULTURE / AGRIBUSINESS: `ApiRoutesConfig.getRoutes('crop_variety')` -> `/api/v1/crop_varieties`
 *    - ENERGY / POWER: `ApiRoutesConfig.getRoutes('substation_grid')` -> `/api/v1/substation_grids`
 *    - EDUCATION / ACADEMIC: `ApiRoutesConfig.getRoutes('faculty_department')` -> `/api/v1/faculty_departments`
 *
 * 3. FUTURE MODIFICATIONS - PINPOINTING WHERE & HOW TO ADD CODE:
 *    If your project architecture requires adding a new API route (e.g., a batch import or
 *    archive endpoint across any of the 21 enterprise sectors), navigate directly to
 *    `ApiRoutesConfig.getRoutes()`, locate the returned object literal, and inject your
 *    new route mapping safely:
 *    ```javascript
 *    return {
 *        fetchChildren: (id) => `/api/v1/${pluralName}/${id}/children`,
 *        store: `/api/v1/${pluralName}`,
 *        delete: (id) => `/api/v1/${pluralName}/${id}`,
 *        patch: (id) => `/api/v1/${pluralName}/${id}`,
 *        // [FUTURE MODIFICATION POINT]: Add custom sector route below
 *        archive: (id) => `/api/v1/${pluralName}/${id}/archive`,
 *    };
 *    ```
 * =============================================================================
 */
