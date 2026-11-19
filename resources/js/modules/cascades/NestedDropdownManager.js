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

import { ApiRoutesConfig } from "./cascade-modules/ApiRoutesConfig";
import { UiLabelsRegistry } from "./cascade-modules/UiLabelsRegistry";
import { CascadingTreeSync } from "./cascade-modules/CascadingTreeSync";
import { DomEventBinder } from "./cascade-modules/DomEventBinder";

/**
 * @typedef {string | ((id: string | number) => string)} ApiRouteHandler
 */
/**
 * @typedef {Record<string, ApiRouteHandler>} ObjectOfApiRoutes
 */
/**
 * @typedef {Record<string, string>} ObjectOfLabels
 */
/**
 * @typedef {Record<string, string>} ObjectOfDescriptions
 */
/**
 * @typedef {Record<string, string>} ObjectOfFieldNames
 */

/**
 * @class NestedDropdownManager
 * @classdesc Enterprise-grade, project-agnostic polymorphic N-level cascading taxonomy orchestration engine
 * designed to manage hierarchical relational dynamic structural dropdowns, form bindings, and synchronization
 * across 10,000+ independent Laravel web applications spanning diverse industry verticals
 * (agriculture, defense, education, energy, minerals, finance, health, justice, security,
 * real estate, government, labour, science, tech, environment, water, transport, sports,
 * construction, trade & commerce, tourism).
 */

/**
 * @typedef {Object} CascadingClassSelectors
 * @property {string} [levelRow]
 * @property {string} [select]
 * @property {string} [renameInput]
 * @property {string} [renameBtn]
 * @property {string} [addBtn]
 * @property {string} [removeBtn]
 * @property {string} [inlineAddContainer]
 * @property {string} [newItemInput]
 * @property {string} [saveItemBtn]
 * @property {string} [hiddenClass]
 */

/**
 * @typedef {Object} CascadingAttributeConfig
 * @property {string} [levelAttr]
 * @property {string} [levelRowAttr]
 * @property {string} [slugAttr]
 * @property {string} [hintAttr]
 */

/**
 * @typedef {Object} CascadingFieldNames
 * @property {string} [name]
 * @property {string} [parentId]
 * @property {string} [parentSlug]
 */
export class NestedDropdownManager {
    /**
     * Initializes the nested dropdown orchestration engine with robust type safety and fallback boundaries.
     *
     * @param {string} [groupingName="group"] - The target resource grouping name (e.g., 'category', 'geography', 'account').
     */
    constructor(groupingName = "group") {
        /** @type {string} */
        this.groupingName =
            typeof groupingName === "string" && groupingName.trim() !== ""
                ? groupingName.trim()
                : "group";

        /** @type {string} */
        const capitalized =
            this.groupingName.charAt(0).toUpperCase() +
            this.groupingName.slice(1);

        /** @type {string} */
        this.selectElement_ClassName = `${this.groupingName}-select`;
        /** @type {string} */
        this.originalGroupingNameInput_ClassName = "tier-name-input";
        /** @type {string} */
        this.renameGroupingBtn_ClassName = "btn-rename-tier";
        /** @type {string} */
        this.addMissingGroupingBtn_ClassName = "btn-add-tier";
        /** @type {string} */
        this.removeExistsingGroupingBtn_ClassName = "btn-remove-tier";

        /** @type {Required<CascadingClassSelectors>} */
        this.classSelectors = {
            levelRow: "cascading-level-div",
            select: this.selectElement_ClassName,
            renameInput: this.originalGroupingNameInput_ClassName,
            renameBtn: this.renameGroupingBtn_ClassName,
            addBtn: this.addMissingGroupingBtn_ClassName,
            removeBtn: this.removeExistsingGroupingBtn_ClassName,
            inlineAddContainer: "inline-add-container",
            newItemInput: "new-item-input",
            saveItemBtn: "btn-save-item",
            hiddenClass: "hidden",
        };

        /** @type {Required<CascadingAttributeConfig>} */
        this.attributeConfig = {
            levelAttr: "data-level",
            levelRowAttr: "data-level-row",
            slugAttr: "data-slug",
            hintAttr: "data-hint",
        };

        /** @type {ObjectOfApiRoutes} */
        this.apiCRUDRoutes_ToGroupingDb = ApiRoutesConfig.getRoutes(
            this.groupingName,
        );

        /** @type {ObjectOfLabels} */
        this.selectAndButtonsLabels = UiLabelsRegistry.getLabels(capitalized);

        /** @type {ObjectOfLabels} */
        this.formButtonsLabels = UiLabelsRegistry.getLabels(capitalized);

        /** @type {ObjectOfDescriptions} */
        this.buttonRolesOnHoverDecriptions =
            UiLabelsRegistry.getHoverRoles(capitalized);

        /** @type {Required<CascadingFieldNames>} */
        this.formFieldNames = {
            name: "name",
            parentId: "parent_id",
            parentSlug: "parent_slug",
        };

        /** @type {HTMLElement | null} */
        this.outermostDivContainerForAll_SelectsLabelsInputsAndButtons = null;
        /** @type {HTMLInputElement | null} */
        this.hiddenInputField_ForLastSelectedGrouping = null;
        /** @type {Array<string | number>} */
        this.selectedGroupingTreePath_IdsArray = [];
    }

    /**
     * Explicitly synchronizes professional CSS class selector tokens and optional attribute names.
     *
     * @param {string | null} [given_originalGroupingNameInput_ClassName=null] - CSS class for tier rename inputs.
     * @param {string | null} [given_addMissingGroupingBtn_ClassName=null] - CSS class for add missing triggers.
     * @param {string | null} [given_removeExistsingGroupingBtn_ClassName=null] - CSS class for remove triggers.
     * @param {string | null} [given_selectElement_ClassName=null] - CSS class for select dropdowns.
     * @param {CascadingClassSelectors} [extraSelectors={}] - Additional class tokens for buttons, containers, and inputs.
     * @param {CascadingAttributeConfig} [extraAttributes={}] - Data attribute names for level tracking and slugs.
     * @returns {this} The manager instance for method chaining.
     */
    formElementsSelectors(
        given_originalGroupingNameInput_ClassName = null,
        given_addMissingGroupingBtn_ClassName = null,
        given_removeExistsingGroupingBtn_ClassName = null,
        given_selectElement_ClassName = null,
        extraSelectors = {},
        extraAttributes = {},
    ) {
        /**
         * @param {string | undefined | null} val
         * @param {string} fallback
         * @returns {string}
         */
        const clean = (val, fallback) =>
            typeof val === "string" && val.trim() !== ""
                ? val.trim()
                : fallback;

        this.originalGroupingNameInput_ClassName = clean(
            given_originalGroupingNameInput_ClassName,
            this.originalGroupingNameInput_ClassName,
        );
        this.addMissingGroupingBtn_ClassName = clean(
            given_addMissingGroupingBtn_ClassName,
            this.addMissingGroupingBtn_ClassName,
        );
        this.removeExistsingGroupingBtn_ClassName = clean(
            given_removeExistsingGroupingBtn_ClassName,
            this.removeExistsingGroupingBtn_ClassName,
        );
        this.selectElement_ClassName = clean(
            given_selectElement_ClassName,
            this.selectElement_ClassName,
        );

        const mergedClasses = {
            ...this.classSelectors,
            renameInput: this.originalGroupingNameInput_ClassName,
            addBtn: this.addMissingGroupingBtn_ClassName,
            removeBtn: this.removeExistsingGroupingBtn_ClassName,
            select: this.selectElement_ClassName,
            ...(extraSelectors || {}),
        };

        this.classSelectors = {
            levelRow: clean(mergedClasses.levelRow, "cascading-level-div"),
            select: clean(mergedClasses.select, this.selectElement_ClassName),
            renameInput: clean(
                mergedClasses.renameInput,
                this.originalGroupingNameInput_ClassName,
            ),
            renameBtn: clean(
                mergedClasses.renameBtn,
                this.renameGroupingBtn_ClassName,
            ),
            addBtn: clean(
                mergedClasses.addBtn,
                this.addMissingGroupingBtn_ClassName,
            ),
            removeBtn: clean(
                mergedClasses.removeBtn,
                this.removeExistsingGroupingBtn_ClassName,
            ),
            inlineAddContainer: clean(
                mergedClasses.inlineAddContainer,
                "inline-add-container",
            ),
            newItemInput: clean(mergedClasses.newItemInput, "new-item-input"),
            saveItemBtn: clean(mergedClasses.saveItemBtn, "btn-save-item"),
            hiddenClass: clean(mergedClasses.hiddenClass, "hidden"),
        };

        this.renameGroupingBtn_ClassName = this.classSelectors.renameBtn;

        const mergedAttrs = {
            ...this.attributeConfig,
            ...(extraAttributes || {}),
        };

        this.attributeConfig = {
            levelAttr: clean(mergedAttrs.levelAttr, "data-level"),
            levelRowAttr: clean(mergedAttrs.levelRowAttr, "data-level-row"),
            slugAttr: clean(mergedAttrs.slugAttr, "data-slug"),
            hintAttr: clean(mergedAttrs.hintAttr, "data-hint"),
        };

        return this;
    }

    /**
     * Explicitly overrides default API CRUD routing paths and callback handlers.
     *
     * @param {ObjectOfApiRoutes} [given_apiCRUD_Url_Paths={}] - Custom route overrides.
     * @returns {this} The manager instance for method chaining.
     */
    apiEndpointsForGroupings(given_apiCRUD_Url_Paths = {}) {
        this.apiCRUDRoutes_ToGroupingDb = {
            ...this.apiCRUDRoutes_ToGroupingDb,
            ...(given_apiCRUD_Url_Paths || {}),
        };
        return this;
    }

    /**
     * Explicitly declares custom UI string token descriptors and labels.
     *
     * @param {ObjectOfLabels} [given_selectAndButtonsLabels={}] - Custom label overrides.
     * @returns {this} The manager instance for method chaining.
     */
    inputFieldLabels(given_selectAndButtonsLabels = {}) {
        this.selectAndButtonsLabels = {
            ...this.selectAndButtonsLabels,
            ...(given_selectAndButtonsLabels || {}),
        };
        return this;
    }

    /**
     * Explicitly declares custom UI string token descriptors and labels.
     *
     * @param {ObjectOfLabels} [given_formButtonsLabels={}] - Custom label overrides.
     * @returns {this} The manager instance for method chaining.
     */
    formButtonLabelsGet(given_formButtonsLabels = {}) {
        this.formButtonsLabels = {
            ...this.formButtonsLabels,
            ...(given_formButtonsLabels || {}),
        };
        return this;
    }

    /**
     * Explicitly maps operational database schema column parameters for entity payloads.
     *
     * @param {string} [given_formFieldNameForNameValue="name"] - Form field key for entity name.
     * @param {string} [given_formFieldNameForParentIdValue="parent_id"] - Form field key for parent foreign key.
     * @param {CascadingFieldNames} [extraFieldNames={}] - Additional payload keys such as `parentSlug`.
     * @returns {this} The manager instance for method chaining.
     */
    inputFieldNames(
        given_formFieldNameForNameValue = "name",
        given_formFieldNameForParentIdValue = "parent_id",
        extraFieldNames = {},
    ) {
        if (
            typeof given_formFieldNameForNameValue === "string" &&
            given_formFieldNameForNameValue.trim() !== ""
        ) {
            this.formFieldNames.name = given_formFieldNameForNameValue.trim();
        }
        if (
            typeof given_formFieldNameForParentIdValue === "string" &&
            given_formFieldNameForParentIdValue.trim() !== ""
        ) {
            this.formFieldNames.parentId =
                given_formFieldNameForParentIdValue.trim();
        }
        if (
            typeof extraFieldNames?.parentSlug === "string" &&
            extraFieldNames.parentSlug.trim() !== ""
        ) {
            this.formFieldNames.parentSlug = extraFieldNames.parentSlug.trim();
        }
        return this;
    }

    /**
     * Mounts the engine to the DOM container elements, binds event delegations, and executes initial framework boot sequences.
     *
     * @param {HTMLElement | null} [given_PageTopMostContainerDiv_For_AllSelectsLabelsInputsAndButtons=null] - Outermost cascading hub element.
     * @param {HTMLInputElement | null} [given_HiddenInputField_ForLastSelectedGrouping=null] - Hidden form input target.
     * @param {Array<string | number>} [selectedGroupingTreePath_IdsArray=[]] - Initial tree path identifiers.
     * @returns {this} The manager instance for method chaining.
     */
    listenToDispatchedEventsAboutGroupingsWithInTheGivenElements(
        given_PageTopMostContainerDiv_For_AllSelectsLabelsInputsAndButtons = null,
        given_HiddenInputField_ForLastSelectedGrouping = null,
        selectedGroupingTreePath_IdsArray = [],
    ) {
        this.outermostDivContainerForAll_SelectsLabelsInputsAndButtons =
            given_PageTopMostContainerDiv_For_AllSelectsLabelsInputsAndButtons;
        this.hiddenInputField_ForLastSelectedGrouping =
            given_HiddenInputField_ForLastSelectedGrouping;
        this.selectedGroupingTreePath_IdsArray = Array.isArray(
            selectedGroupingTreePath_IdsArray,
        )
            ? selectedGroupingTreePath_IdsArray
            : [];

        if (
            !this.outermostDivContainerForAll_SelectsLabelsInputsAndButtons ||
            !this.hiddenInputField_ForLastSelectedGrouping
        ) {
            console.warn(
                `Aborting initialization: Engine targets missing for resource: ${this.groupingName}`,
            );
            return this;
        }

        DomEventBinder.bindEvents(this);
        CascadingTreeSync.bootSystem(this);
        return this;
    }

    /**
     * Asynchronously updates the hidden form input data value with the database identifier of the selected grouping option.
     *
     * @param {HTMLSelectElement | null} [selectElement=null] - The target dropdown select element.
     * @param {Array<string | number>} [treePathIds=[]] - Optional tree path identifiers.
     * @returns {Promise<void>}
     */
    async updateTheHiddenInputDataValueWithDbIdOfSelectedGroupingOptionInTheGivenSelectElement(
        selectElement = null,
        treePathIds = [],
    ) {
        if (!selectElement) return;
        await CascadingTreeSync.updateHiddenInput(this, selectElement);
    }
}

/**
 * =============================================================================
 * REAL-WORLD USAGE, CUSTOMIZATION & RE-REFERENCE GUIDE (10,000+ PROJECTS):
 * =============================================================================
 *
 * 1. HOW TO IMPORT AND REFERENCE THIS MODULE IN AN ENTRY SCRIPT / BLADE VIEW:
 *    ```javascript
 *    import { NestedDropdownManager } from './NestedDropdownManager.js';
 *
 *    document.addEventListener('DOMContentLoaded', () => {
 *        const categoryHub = document.getElementById('category_cascading_hub');
 *        /** @type {HTMLInputElement | null} *\/
 *        const categoryTarget = /** \@type {HTMLInputElement | null} *\/ (
 *            document.getElementById('final_category_target')
 *        );
 *
 *        if (categoryHub && categoryTarget) {
 *            const manager = new NestedDropdownManager('category');
 *            manager.listenToDispatchedEventsAboutGroupingsWithInTheGivenElements(
 *                categoryHub,
 *                categoryTarget,
 *                [1, 5, 12] // Pre-loaded tree path IDs for SSR hydration
 *            );
 *        }
 *    });
 *    ```
 *
 * 2. COMPONENT CUSTOM PROPS MAPPING (@props([]) equivalent in Blade / JS):
 *    When passing custom properties from parent Blade components or initialization wrappers across
 *    the 21 enterprise sectors, the configurable props include:
 *    - `groupingName`: (string) Entity domain name ('category', 'geography', 'account', 'ward').
 *    - `activePath`: (Array<string|number>) Server-rendered active ID path.
 *    - `formElementsSelectors`: Customizing CSS class hooks.
 *    - `apiEndpointsForGroupings`: Customizing backend REST endpoints.
 *    - `inputFieldNames`: Customizing database column mapping keys (`name`, `parent_id`).
 *
 * 3. SECTOR-SPECIFIC CUSTOMIZATION EXAMPLES (MAPPED TO 21 SECTORS):
 *    - FINANCE: `new NestedDropdownManager('bank_ledger')`
 *    - HEALTH: `new NestedDropdownManager('medical_ward')`
 *    - AGRICULTURE: `new NestedDropdownManager('crop_variety')`
 *    - ENERGY: `new NestedDropdownManager('substation_grid')`
 *    - EDUCATION: `new NestedDropdownManager('faculty_department')`
 *    - DEFENSE: `new NestedDropdownManager('command_tier')`
 *    - MINING: `new NestedDropdownManager('mineral_ore')`
 *    - JUSTICE: `new NestedDropdownManager('court_jurisdiction')`
 *    - SECURITY: `new NestedDropdownManager('clearance_level')`
 *    - REAL ESTATE: `new NestedDropdownManager('property_region')`
 *    - GOVERNMENT: `new NestedDropdownManager('ministry_department')`
 *    - LABOUR: `new NestedDropdownManager('union_sector')`
 *    - SCIENCE: `new NestedDropdownManager('research_domain')`
 *    - TECH: `new NestedDropdownManager('software_module')`
 *    - ENVIRONMENT: `new NestedDropdownManager('ecosystem_zone')`
 *    - WATER: `new NestedDropdownManager('catchment_area')`
 *    - TRANSPORT: `new NestedDropdownManager('transit_hub')`
 *    - SPORTS: `new NestedDropdownManager('league_division')`
 *    - CONSTRUCTION: `new NestedDropdownManager('building_phase')`
 *    - TRADE & COMMERCE: `new NestedDropdownManager('commodity_market')`
 *    - TOURISM: `new NestedDropdownManager('destination_zone')`
 *
 * 4. FUTURE MODIFICATIONS - PINPOINTING WHERE & HOW TO ADD CODE:
 *    If your enterprise project architecture requires adding custom middleware interception or global event listeners
 *    whenever a dropdown manager boots across any of the 21 sectors, navigate directly to
 *    `NestedDropdownManager.listenToDispatchedEventsAboutGroupingsWithInTheGivenElements()` and inject your code safely:
 *    ```javascript
 *    listenToDispatchedEventsAboutGroupingsWithInTheGivenElements(
 *        given_PageTopMostContainerDiv_For_AllSelectsLabelsInputsAndButtons = null,
 *        given_HiddenInputField_ForLastSelectedGrouping = null,
 *        selectedGroupingTreePath_IdsArray = [],
 *    ) {
 *        this.outermostDivContainerForAll_SelectsLabelsInputsAndButtons = given_PageTopMostContainerDiv_For_AllSelectsLabelsInputsAndButtons;
 *        this.hiddenInputField_ForLastSelectedGrouping = given_HiddenInputField_ForLastSelectedGrouping;
 *        this.selectedGroupingTreePath_IdsArray = Array.isArray(selectedGroupingTreePath_IdsArray) ? selectedGroupingTreePath_IdsArray : [];
 *
 *        if (!this.outermostDivContainerForAll_SelectsLabelsInputsAndButtons || !this.hiddenInputField_ForLastSelectedGrouping) {
 *            console.warn(`Aborting initialization: Engine targets missing for resource: ${this.groupingName}`);
 *            return this;
 *        }
 *
 *        // [FUTURE MODIFICATION POINT]: Add custom global telemetry or analytics hook below
 *        console.log(`Initializing NestedDropdownManager for domain: ${this.groupingName}`);
 *
 *        DomEventBinder.bindEvents(this);
 *        CascadingTreeSync.bootSystem(this);
 *        return this;
 *    }
 *    ```
 * =============================================================================
 */
