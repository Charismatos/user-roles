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
 * - JSDoc : JavaScript Documentation syntax
 * - AJAX  : Asynchronous JavaScript and XML
 * - URL   : Uniform Resource Locator
 * =============================================================================
 */

/**
 * @class CascadingTreeSync
 * @classdesc Enterprise-grade, project-agnostic state synchronization and DOM hydration module
 * designed to manage hierarchical taxonomy trees, hidden form input values, and event broadcasting
 * across 10,000+ independent Laravel web applications spanning diverse industry verticals
 * (agriculture, defense, education, energy, minerals, finance, health, justice, security,
 * real estate, government, labour, science, tech, environment, water, transport, sports,
 * construction, trade & commerce, tourism).
 */
export class CascadingTreeSync {
    /**
     * Executes the initial system framework boot sequence, checking for pre-selected level-1
     * taxonomy nodes and synchronizing initial database identifiers safely.
     *
     * @param {import('../NestedDropdownManager.js').NestedDropdownManager | null} [manager=null] - The parent dropdown manager instance.
     * @returns {void}
     */
    static bootSystem(manager = null) {
        if (
            !manager ||
            !manager.outermostDivContainerForAll_SelectsLabelsInputsAndButtons
        ) {
            return;
        }

        /** @type {HTMLSelectElement | null} */
        const level1Select = /** @type {HTMLSelectElement | null} */ (
            manager.outermostDivContainerForAll_SelectsLabelsInputsAndButtons.querySelector(
                `select[data-level="1"]`,
            )
        );

        if (
            level1Select &&
            typeof level1Select.value === "string" &&
            level1Select.value.trim() !== ""
        ) {
            manager.updateTheHiddenInputDataValueWithDbIdOfSelectedGroupingOptionInTheGivenSelectElement(
                level1Select,
                Array.isArray(manager.selectedGroupingTreePath_IdsArray)
                    ? manager.selectedGroupingTreePath_IdsArray
                    : [],
            );
        }
    }

    /**
     * Updates the hidden form submission input value with the database identifier of the currently
     * selected cascading dropdown option and triggers synchronization events.
     *
     * @param {import('../NestedDropdownManager.js').NestedDropdownManager | null} [manager=null] - The parent dropdown manager instance.
     * @param {HTMLSelectElement | null} [selectElement=null] - The target dropdown select element.
     * @returns {Promise<void>}
     */
    static async updateHiddenInput(manager = null, selectElement = null) {
        if (
            !manager ||
            !manager.hiddenInputField_ForLastSelectedGrouping ||
            !selectElement
        ) {
            return;
        }

        /** @type {string} */
        const selectedValue =
            typeof selectElement.value === "string" ? selectElement.value : "";
        manager.hiddenInputField_ForLastSelectedGrouping.value = selectedValue;

        CascadingTreeSync.dispatchSyncEvents(manager);
    }

    /**
     * Dispatches native input/change events on the hidden input and broadcasts custom `cascade:sync`
     * events across the outermost container for dependent listeners.
     *
     * @param {import('../NestedDropdownManager.js').NestedDropdownManager | null} [manager=null] - The parent dropdown manager instance.
     * @returns {void}
     */
    static dispatchSyncEvents(manager = null) {
        if (
            !manager ||
            !manager.hiddenInputField_ForLastSelectedGrouping ||
            !manager.outermostDivContainerForAll_SelectsLabelsInputsAndButtons
        ) {
            return;
        }

        /** @type {Array<string>} */
        const acceptableEventNamesToDispatch = ["input", "change"];

        acceptableEventNamesToDispatch.forEach((eventName) => {
            if (manager.hiddenInputField_ForLastSelectedGrouping) {
                manager.hiddenInputField_ForLastSelectedGrouping.dispatchEvent(
                    new CustomEvent(eventName, { bubbles: true }),
                );
            }
        });

        if (manager.outermostDivContainerForAll_SelectsLabelsInputsAndButtons) {
            manager.outermostDivContainerForAll_SelectsLabelsInputsAndButtons.dispatchEvent(
                new CustomEvent("cascade:sync", {
                    detail: {
                        value: manager.hiddenInputField_ForLastSelectedGrouping
                            .value,
                    },
                    bubbles: true,
                }),
            );
        }
    }
}

/**
 * =============================================================================
 * REAL-WORLD USAGE, CUSTOMIZATION & RE-REFERENCE GUIDE (10,000+ PROJECTS):
 * =============================================================================
 *
 * 1. HOW TO IMPORT AND REFERENCE THIS MODULE IN AN ENTRY SCRIPT / BLADE VIEW:
 *    ```javascript
 *    import { CascadingTreeSync } from './sub-modules/CascadingTreeSync.js';
 *    import { NestedDropdownManager } from './NestedDropdownManager.js';
 *
 *    const managerInstance = new NestedDropdownManager('category');
 *    // Boot system synchronization manually if required:
 *    CascadingTreeSync.bootSystem(managerInstance);
 *    ```
 *
 * 2. COMPONENT CUSTOM PROPS MAPPING (@props([]) equivalent in Blade / JS):
 *    When integrating this module with Blade components or reactive front-end wrappers,
 *    the following props are handled across the 21 enterprise sectors:
 *    - `groupingName`: (string) Defines the taxonomy domain ('category', 'geography', 'account', 'ward').
 *    - `activePath`: (Array<string|number>) Pre-loaded tree path IDs for SSR hydration.
 *    - `targetId`: (string) DOM identifier for the hidden form input holding the final database ID.
 *    - `containerId`: (string) DOM identifier for the outermost cascading hub container.
 *
 * 3. SECTOR-SPECIFIC CUSTOMIZATION EXAMPLES (MAPPED TO 21 SECTORS):
 *    - FINANCE: Hydrating multi-tier bank account ledgers or currency denomination trees.
 *    - HEALTH: Synchronizing hospital ward, department, and specialist room selections.
 *    - AGRICULTURE: Managing crop classification, soil type, and regional farming zones.
 *    - ENERGY: Tracking electrical substation grids, feeder lines, and transformer tiers.
 *    - EDUCATION: Organizing university faculties, departments, and course semesters.
 *    - DEFENSE: Managing military command hierarchies, divisions, and operational units.
 *    - MINING: Tracing mineral extraction sites, ore types, and assay laboratories.
 *    - JUSTICE: Categorizing court jurisdictions, case types, and docket sub-branches.
 *    - SECURITY: Regulating clearance levels, operational sectors, and response units.
 *    - REAL ESTATE: Mapping property regions, building blocks, and unit hierarchies.
 *    - GOVERNMENT: Structuring ministry departments, directorates, and regional offices.
 *    - LABOUR: Managing union sectors, trade branches, and worker classifications.
 *    - SCIENCE: Organizing research domains, laboratory divisions, and experiment nodes.
 *    - TECH: Structuring software modules, API microservices, and feature tiers.
 *    - ENVIRONMENT: Classifying ecosystem types, conservation zones, and wildlife habitats.
 *    - WATER: Managing catchment areas, distribution reservoirs, and treatment plants.
 *    - TRANSPORT: Coordinating transit hubs, route networks, and terminal branches.
 *    - SPORTS: Organizing league divisions, tournament brackets, and club tiers.
 *    - CONSTRUCTION: Tracking building phases, architectural zones, and contractor levels.
 *    - TRADE & COMMERCE: Grouping commodity markets, export categories, and tariff tiers.
 *    - TOURISM: Structuring destination zones, resort regions, and excursion branches.
 *
 * 4. FUTURE MODIFICATIONS - PINPOINTING WHERE & HOW TO ADD CODE:
 *    If your enterprise project architecture requires adding custom validation or telemetry logging
 *    whenever a tree node syncs across any of the 21 sectors, navigate directly to
 *    `CascadingTreeSync.updateHiddenInput()` and inject your code safely:
 *    ```javascript
 *    static async updateHiddenInput(manager = null, selectElement = null) {
 *        if (!manager || !manager.hiddenInputField_ForLastSelectedGrouping || !selectElement) {
 *            return;
 *        }
 *        const selectedValue = typeof selectElement.value === "string" ? selectElement.value : "";
 *        manager.hiddenInputField_ForLastSelectedGrouping.value = selectedValue;
 *
 *        // [FUTURE MODIFICATION POINT]: Add custom telemetry or validation hook below
 *        console.log("Taxonomy node synchronized to DB ID:", selectedValue);
 *
 *        CascadingTreeSync.dispatchSyncEvents(manager);
 *    }
 *    ```
 * =============================================================================
 */
