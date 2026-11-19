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
 * - CRUD  : Create, Read, Update, Delete
 * =============================================================================
 */

import { BinderConfigResolver } from "./BinderConfigResolver.js";
import { GroupingItemCreator } from "./GroupingItemCreator.js";
import { GroupingItemRemover } from "./GroupingItemRemover.js";
import { GroupingItemRenamer } from "./GroupingItemRenamer.js";
import { HierarchyLevelRenderer } from "./HierarchyLevelRenderer.js";

/**
 * @class DomEventBinder
 * @classdesc Enterprise-grade, project-agnostic DOM event delegation and asynchronous action handler module
 * designed to manage change events, click triggers, inline item persistence, and tier renaming operations
 * across 10,000+ independent Laravel web applications spanning diverse industry verticals
 * (agriculture, defense, education, energy, minerals, finance, health, justice, security,
 * real estate, government, labour, science, tech, environment, water, transport, sports,
 * construction, trade & commerce, tourism).
 */

export class DomEventBinder {
    /**
     * Resolves the select element associated with the clicked control within a level row.
     *
     * @param {HTMLElement | null} levelDiv
     * @param {string | null} dataLevel
     * @param {string} selectPrimary
     * @param {string} levelAttr
     * @returns {HTMLSelectElement | null}
     */
    static #resolveLevelSelect(levelDiv, dataLevel, selectPrimary, levelAttr) {
        /** @type {HTMLSelectElement | null} */
        let selectEl = /** @type {HTMLSelectElement | null} */ (
            levelDiv ? levelDiv.querySelector(`.${selectPrimary}`) : null
        );

        if (!selectEl && levelDiv && dataLevel) {
            selectEl = /** @type {HTMLSelectElement | null} */ (
                levelDiv.querySelector(`select[${levelAttr}="${dataLevel}"]`)
            );
        }

        return selectEl;
    }

    /**
     * Binds event delegation listeners (`change` and `click`) to the outermost
     * container element and delegates actions to specialized handler classes.
     *
     * @param {import('../NestedDropdownManager.js').NestedDropdownManager | null} [manager=null]
     * @returns {void}
     */
    static bindEvents(manager = null) {
        if (
            !manager ||
            !manager.outermostDivContainerForAll_SelectsLabelsInputsAndButtons
        ) {
            return;
        }

        /** @type {HTMLElement} */
        const container =
            manager.outermostDivContainerForAll_SelectsLabelsInputsAndButtons;
        const cfg = BinderConfigResolver.resolve(manager);
        const { hiddenClass, primary, attrs } = cfg;

        // 1. Change listener: sync hidden field and render next cascade level
        container.addEventListener("change", async (event) => {
            /** @type {HTMLSelectElement | null} */
            const target = /** @type {HTMLSelectElement | null} */ (
                event.target
            );

            if (
                !target ||
                typeof target.classList?.contains !== "function" ||
                !target.classList.contains(primary.select)
            ) {
                return;
            }

            manager.updateTheHiddenInputDataValueWithDbIdOfSelectedGroupingOptionInTheGivenSelectElement(
                target,
            );

            const currentLevel = parseInt(
                target.getAttribute(attrs.level) || "1",
                10,
            );

            HierarchyLevelRenderer.pruneDeeperLevels(
                container,
                currentLevel,
                primary.levelRow,
                attrs.levelRow,
            );

            const selectedOption = target.selectedOptions[0];
            const selectedSlug = selectedOption
                ? selectedOption.getAttribute(attrs.slug) ||
                  selectedOption.value
                : null;

            if (!selectedSlug) return;

            await HierarchyLevelRenderer.renderNextLevel(
                manager,
                container,
                selectedSlug,
                currentLevel,
                cfg,
            );
        });

        // 2. Click listener: delegate drawer toggle, save, rename, and remove actions
        container.addEventListener("click", async (event) => {
            /** @type {HTMLElement | null} */
            const target = /** @type {HTMLElement | null} */ (event.target);
            if (!target || typeof target.classList?.contains !== "function") {
                return;
            }

            const dataLevel = target.getAttribute(attrs.level);
            /** @type {HTMLElement | null} */
            const levelDiv = /** @type {HTMLElement | null} */ (
                target.closest(`.${primary.levelRow}`)
            );
            const selectEl = DomEventBinder.#resolveLevelSelect(
                levelDiv,
                dataLevel,
                primary.select,
                attrs.level,
            );

            if (target.classList.contains(primary.addBtn)) {
                /** @type {HTMLElement | null} */
                const addContainer = /** @type {HTMLElement | null} */ (
                    levelDiv?.querySelector(`.${primary.inlineAdd}`)
                );
                addContainer?.classList.toggle(hiddenClass);
                return;
            }

            if (target.classList.contains(primary.saveItemBtn)) {
                await GroupingItemCreator.saveItem(
                    manager,
                    container,
                    levelDiv,
                    selectEl,
                    dataLevel,
                    cfg,
                );
                return;
            }

            if (target.classList.contains(primary.renameBtn)) {
                await GroupingItemRenamer.renameItem(
                    manager,
                    container,
                    levelDiv,
                    selectEl,
                    cfg,
                );
                return;
            }

            if (target.classList.contains(primary.removeBtn)) {
                await GroupingItemRemover.removeItem(
                    manager,
                    container,
                    selectEl,
                    cfg,
                );
            }
        });
    }
}

/**
 * =============================================================================
 * REAL-WORLD USAGE, CUSTOMIZATION & RE-REFERENCE GUIDE (10,000+ PROJECTS):
 * =============================================================================
 *
 * 1. HOW TO IMPORT AND REFERENCE THIS MODULE IN AN ENTRY SCRIPT / BLADE VIEW:
 *    ```javascript
 *    import { DomEventBinder } from './sub-modules/DomEventBinder.js';
 *    import { NestedDropdownManager } from './NestedDropdownManager.js';
 *
 *    const managerInstance = new NestedDropdownManager('category');
 *    managerInstance.listenToDispatchedEventsAboutGroupingsWithInTheGivenElements(
 *        document.getElementById('category_cascading_hub'),
 *        document.getElementById('final_category_target'),
 *        []
 *    );
 *    // DomEventBinder is called internally, or can be invoked directly:
 *    DomEventBinder.bindEvents(managerInstance);
 *    ```
 *
 * 2. COMPONENT CUSTOM PROPS MAPPING (@props([]) equivalent in Blade / JS):
 *    When integrating this event binder across the 21 enterprise sectors, customizable selectors
 *    and component attributes passed via configuration include:
 *    - `formSelector`: (string) CSS selector for parent form wrappers.
 *    - `selectElement_ClassName`: (string) CSS class identifying taxonomy select dropdowns.
 *    - `originalGroupingNameInput_ClassName`: (string) CSS class for inline tier renaming inputs.
 *    - `addMissingGroupingBtn_ClassName`: (string) CSS class triggering inline creation drawers.
 *    - `removeExistsingGroupingBtn_ClassName`: (string) CSS class triggering record deletion.
 *
 * 3. SECTOR-SPECIFIC CUSTOMIZATION EXAMPLES (MAPPED TO 21 SECTORS):
 *    - FINANCE: Delegating clicks and saves for multi-tier banking ledger categories.
 *    - HEALTH: Handling AJAX creation and deletion of hospital departments and ward tiers.
 *    - AGRICULTURE: Managing crop variety hierarchies and regional farming zone entries.
 *    - ENERGY: Delegating substation grid node creation and transformer rename events.
 *    - EDUCATION: Managing university faculty, department, and course semester trees.
 *    - DEFENSE: Handling command tier updates, operational unit additions, and sync events.
 *    - MINING: Delegating mineral ore site selections, assay labs, and extraction tiers.
 *    - JUSTICE: Managing court jurisdiction nodes, docket sub-branches, and record deletions.
 *    - SECURITY: Handling clearance level updates and operational response unit assignments.
 *    - REAL ESTATE: Delegating property region selections and building block creations.
 *    - GOVERNMENT: Managing ministry department structures and directorate renaming events.
 *    - LABOUR: Handling union sector classifications and worker category updates.
 *    - SCIENCE: Delegating research domain node creation and laboratory division mappings.
 *    - TECH: Managing software module hierarchies, API microservices, and feature tiers.
 *    - ENVIRONMENT: Handling ecosystem conservation zone additions and habitat tiers.
 *    - WATER: Delegating catchment area selections, distribution reservoirs, and treatment nodes.
 *    - TRANSPORT: Managing transit hub terminals, route networks, and station branches.
 *    - SPORTS: Handling league division brackets, tournament tiers, and club node creations.
 *    - CONSTRUCTION: Delegating building phase tracking, architectural zones, and contractor levels.
 *    - TRADE & COMMERCE: Managing commodity markets, export categories, and tariff tiers.
 *    - TOURISM: Handling destination zone node creations, resort regions, and excursion branches.
 *
 * 4. FUTURE MODIFICATIONS - PINPOINTING WHERE & HOW TO ADD CODE:
 *    If your enterprise project architecture requires adding custom telemetry or auditing triggers
 *    whenever an inline item is successfully saved or deleted across any of the 21 sectors,
 *    navigate directly to `DomEventBinder.bindEvents()` under the respective `btn-save-item`
 *    or deletion block and inject your code safely:
 *    ```javascript
 *    // Inside 'btn-save-item' click handler after successful fetch:
 *    const newItem = await res.json();
 *
 *    // [FUTURE MODIFICATION POINT]: Add custom telemetry or analytics hook below
 *    console.log("Successfully recorded new taxonomy entity in database:", newItem);
 *    ```
 * =============================================================================
 */
