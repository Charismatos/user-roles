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
 * - IIFE  : Immediately Invoked Function Expression
 * - CB    : Callback function
 * - HTML  : HyperText Markup Language
 * - SSR   : Server-Side Rendering
 * - CSS   : Cascading Style Sheets
 * - config: Configuration settings object
 * =============================================================================
 */

/**
 * @typedef {Object} DynamicSelectManagerConfig
 * @property {string} [selectSelector] - CSS selector for target select elements. Default: 'select'
 * @property {boolean} [enhanceNative] - Whether to apply dynamic behavior enhancement. Default: true
 * @property {Object.<string, Array<Object|string>>} [remoteDatasets] - Map of dataset dictionaries for dynamic hydration.
 * @property {Object} [lifecycleHooks] - Custom event lifecycle interceptors.
 * @property {function(NodeListOf<HTMLSelectElement>): void} [lifecycleHooks.onInit] - Initialization hook.
 * @property {function(HTMLSelectElement, Event): void} [lifecycleHooks.onChange] - Change event intercept hook.
 */

/**
 * @class DynamicSelectManager
 * @classdesc Enterprise-grade, project-agnostic client-side orchestration engine
 * designed to manage dynamic select dropdown states, optgroups, placeholders,
 * multi-select arrays, and option hydration across 10,000+ independent web applications.
 */
export class DynamicSelectManager {
    /**
     * Initializes the select manager instance with defensive configuration defaults.
     *
     * @param {DynamicSelectManagerConfig} [userConfig={}] - Custom project configuration overrides.
     */
    constructor(userConfig = {}) {
        /**
         * @type {Required<DynamicSelectManagerConfig>}
         */
        this.config = Object.assign(
            {
                selectSelector: "select",
                enhanceNative: true,
                remoteDatasets: {},
                lifecycleHooks: {},
            },
            userConfig,
        );

        /** @type {NodeListOf<HTMLSelectElement>|[]} */
        this.selects = [];

        this.init();
    }

    /**
     * =========================================================================
     * WHAT: Core Initialization Lifecycle
     * WHEN: Executes immediately upon class instantiation.
     * WHY:  Discovers DOM nodes and binds change event listeners safely.
     * =========================================================================
     */
    init() {
        if (typeof document === "undefined") {
            return; // Safe guard for non-browser environments (SSR / Node.js)
        }

        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", () =>
                this.processSelects(),
            );
        } else {
            this.processSelects();
        }
    }

    /**
     * Scans select elements and attaches change listeners or hydrates options.
     */
    processSelects() {
        this.selects = document.querySelectorAll(this.config.selectSelector);

        this.selects.forEach((select) => {
            if (this.config.enhanceNative) {
                select.addEventListener("change", (event) =>
                    this.handleSelectChange(event),
                );
            }

            // Check if select requests dataset hydration via data attributes
            const datasetKey = select.dataset.sourceKey;
            if (datasetKey && this.config.remoteDatasets?.[datasetKey]) {
                this.hydrateOptions(
                    select,
                    this.config.remoteDatasets[datasetKey],
                );
            }
        });

        // Trigger custom initialization lifecycle hook safely
        if (typeof this.config.lifecycleHooks?.onInit === "function") {
            this.config.lifecycleHooks.onInit(this.selects);
        }
    }

    /**
     * Handles change events across managed select dropdowns.
     *
     * @param {Event} event - The native change DOM event.
     */
    handleSelectChange(event) {
        /** @type {HTMLSelectElement} */
        const selectTarget = /** @type {HTMLSelectElement} */ (event.target);
        const selectedValues = Array.from(selectTarget.selectedOptions).map(
            (opt) => opt.value,
        );

        // FUTURE MODIFICATION POINT: Insert custom dependent dropdown fetching, cascading filters, or analytics logging here.

        if (typeof this.config.lifecycleHooks?.onChange === "function") {
            this.config.lifecycleHooks.onChange(selectTarget, event);
        }
    }

    /**
     * Dynamically populates option items and optgroups into a select element.
     *
     * @param {HTMLSelectElement} selectElement - The target select element.
     * @param {Array<Object|string>} optionsData - Array of option objects or strings.
     */
    hydrateOptions(selectElement, optionsData) {
        // Retain existing placeholder if present
        const placeholderOption =
            selectElement.querySelector('option[value=""]');
        selectElement.innerHTML = "";

        if (placeholderOption) {
            selectElement.appendChild(placeholderOption);
        }

        optionsData.forEach((item) => {
            if (
                typeof item === "object" &&
                item !== null &&
                "options" in item
            ) {
                // Handle Optgroup structure
                const optGroup = document.createElement("optgroup");
                optGroup.label = String(
                    /** @type {Record<string, any>} */ (item).label || "",
                );
                if (/** @type {Record<string, any>} */ (item).disabled) {
                    optGroup.disabled = true;
                }

                const subOptions = /** @type {Array<any>} */ (
                    /** @type {Record<string, any>} */ (item).options || []
                );
                subOptions.forEach((subItem) => {
                    const optionEl = this.createOptionElement(subItem);
                    optGroup.appendChild(optionEl);
                });
                selectElement.appendChild(optGroup);
            } else {
                // Handle standard option
                const optionEl = this.createOptionElement(item);
                selectElement.appendChild(optionEl);
            }
        });
    }

    /**
     * Creates an individual option element from raw data.
     *
     * @param {Object|string} optionData - Option data representation.
     * @returns {HTMLOptionElement} The constructed option element.
     */
    createOptionElement(optionData) {
        const option = document.createElement("option");

        if (typeof optionData === "object" && optionData !== null) {
            option.value = String(
                /** @type {Record<string, any>} */ (optionData).value ?? "",
            );
            option.textContent = String(
                /** @type {Record<string, any>} */ (optionData).label ??
                    option.value,
            );
            if (/** @type {Record<string, any>} */ (optionData).disabled) {
                option.disabled = true;
            }
        } else {
            option.value = String(optionData);
            option.textContent = String(optionData);
        }

        return option;
    }

    /**
     * =========================================================================
     * FUTURE MODIFICATIONS & EXTENSIBILITY GUIDE:
     * -------------------------------------------------------------------------
     * TO ADD A NEW METHOD OR BEHAVIOR:
     * 1. Declare your new public or private method right here inside this class block.
     * 2. Ensure all parameters and return types are fully documented using JSDoc
     *    syntax to satisfy strict type checking when "checkJs": true is enabled.
     * 3. Call your new method inside `processSelects()` or expose it to consuming
     *    projects via the configuration options object.
     * =========================================================================
     */

    /**
     * Public method to programmatically reset select values.
     *
     * @param {string} selectId - The HTML ID of the select element to reset.
     */
    resetSelect(selectId) {
        const targetSelect = document.getElementById(selectId);
        if (targetSelect instanceof HTMLSelectElement) {
            targetSelect.selectedIndex = 0;
        }
    }
}

/**
 * =============================================================================
 * MULTI-PROJECT INTEGRATION AND LIFECYCLE GOVERNANCE GUIDE
 * =============================================================================
 * Because your 10,000+ projects may use different build tools (Vite, Webpack,
 * Laravel Mix, or vanilla script tags), the module supports multiple consumption patterns.
 *
 * -----------------------------------------------------------------------------
 * PATTERN A: Modern ES Modules (import in Vite / Webpack / Laravel Mix)
 * -----------------------------------------------------------------------------
 * In your project's main application script (e.g., resources/js/app.js), you
 * import the class and initialize it with custom parameters or remote datasets:
 *
 * import { DynamicSelectManager } from './DynamicSelectManager.js';
 *
 * const mySelectManager = new DynamicSelectManager({
 *     selectSelector: 'select.enterprise-dropdown',
 *     enhanceNative: true,
 *
 *     // Injecting project-specific lookup datasets for dynamic hydration
 *     remoteDatasets: {
 *         'ugandan-districts': [
 *             { value: 'kla', label: 'Kampala' },
 *             { value: 'ent', label: 'Entebbe', disabled: true },
 *             {
 *                 label: 'Central Region',
 *                 options: [
 *                     { value: 'muk', label: 'Mukono' },
 *                     { value: 'wak', label: 'Wakiso' }
 *                 ]
 *             }
 *         ]
 *     },
 *
 *     // Injecting lifecycle hooks without modifying core source code
 *     lifecycleHooks: {
 *         onInit: (selects) => {
 *             console.log(`Select dropdown manager active across ${selects.length} elements.`);
 *         },
 *         onChange: (select, event) => {
 *             // Custom cascading dropdown logic or analytics for this project
 *         }
 *     }
 * });
 *
 * // Expose globally if needed by legacy inline scripts
 * window.mySelectManager = mySelectManager;
 *
 * -----------------------------------------------------------------------------
 * PATTERN B: CDN / Direct Browser Script Tag (Zero Build Tools)
 * -----------------------------------------------------------------------------
 * If a specific project doesn't use a bundler, compile the module as an ES module
 * or global script and reference it directly in your Blade layout
 * (resources/views/layouts/app.blade.php):
 *
 * <script type="module">
 *     import { DynamicSelectManager } from "{{ asset('js/DynamicSelectManager.js') }}";
 *
 *     document.addEventListener('DOMContentLoaded', () => {
 *         window.selectManager = new DynamicSelectManager({
 *             selectSelector: '#country-select'
 *         });
 *     });
 * </script>
 *
 * =============================================================================
 * SECTION 3: GUIDE TO FUTURE MODIFICATIONS (WHERE AND HOW TO ADD CODE)
 * =============================================================================
 * When scaling across 10,000 projects, you will inevitably need to introduce new
 * features (e.g., search filtering, searchable select boxes, or AJAX autocomplete).
 * Follow these exact boundaries to prevent regressions:
 *
 * 1. Adding Remote Datasets: Do not modify DynamicSelectManager.js core methods.
 *    Instead, pass your dataset dictionaries dynamically from the consuming
 *    project's initialization script into the remoteDatasets configuration object.
 *
 * 2. Adding New Event Listeners: If a new project requires handling additional
 *    events (such as 'focus' or 'blur'), go to DynamicSelectManager.js, locate
 *    the processSelects() method, and add your listener alongside the 'change' event.
 *
 * 3. Adding Option Formatters: Place custom option parsing or filtering utility
 *    functions inside a dedicated helper file (e.g., selectFormatters.js), import them
 *    into DynamicSelectManager.js, and invoke them inside hydrateOptions() or createOptionElement().
 * =============================================================================
 */
