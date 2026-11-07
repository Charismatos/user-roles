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
 * @typedef {Object} DynamicDatalistManagerConfig
 * @property {string} [inputSelector] - CSS selector for target datalist input elements. Default: 'input[list]'
 * @property {boolean} [enhanceNative] - Whether to apply dynamic behavior enhancement. Default: true
 * @property {Object.<string, Array<Object|string>>} [remoteDatasets] - Map of dataset dictionaries for dynamic option hydration.
 * @property {Object} [lifecycleHooks] - Custom event lifecycle interceptors.
 * @property {function(NodeListOf<HTMLInputElement>): void} [lifecycleHooks.onInit] - Initialization hook.
 * @property {function(HTMLInputElement, Event): void} [lifecycleHooks.onInput] - Input change intercept hook.
 */

/**
 * @class DynamicDatalistManager
 * @classdesc Enterprise-grade, project-agnostic client-side orchestration engine
 * designed to manage dynamic datalist input states, autocomplete values, fallback lists,
 * and dataset hydration across 10,000+ independent web applications.
 */
export class DynamicDatalistManager {
    /**
     * Initializes the datalist manager instance with defensive configuration defaults.
     *
     * @param {DynamicDatalistManagerConfig} [userConfig={}] - Custom project configuration overrides.
     */
    constructor(userConfig = {}) {
        /**
         * @type {Required<DynamicDatalistManagerConfig>}
         */
        this.config = Object.assign(
            {
                inputSelector: "input[list]",
                enhanceNative: true,
                remoteDatasets: {},
                lifecycleHooks: {},
            },
            userConfig,
        );

        /** @type {NodeListOf<HTMLInputElement>|[]} */
        this.inputs = [];

        this.init();
    }

    /**
     * =========================================================================
     * WHAT: Core Initialization Lifecycle
     * WHEN: Executes immediately upon class instantiation.
     * WHY:  Discovers DOM nodes and binds input event listeners safely.
     * =========================================================================
     */
    init() {
        if (typeof document === "undefined") {
            return; // Safe guard for non-browser environments (SSR / Node.js)
        }

        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", () =>
                this.processInputs(),
            );
        } else {
            this.processInputs();
        }
    }

    /**
     * Scans datalist input elements and attaches listeners or hydrates options.
     */
    processInputs() {
        this.inputs = document.querySelectorAll(this.config.inputSelector);

        this.inputs.forEach((input) => {
            if (this.config.enhanceNative) {
                input.addEventListener("input", (event) =>
                    this.handleInput(event),
                );
            }

            // Check if input requests dataset hydration via data attributes
            const datasetKey = input.dataset.sourceKey;
            if (datasetKey && this.config.remoteDatasets?.[datasetKey]) {
                this.hydrateDatalist(
                    input,
                    this.config.remoteDatasets[datasetKey],
                );
            }
        });

        // Trigger custom initialization lifecycle hook safely
        if (typeof this.config.lifecycleHooks?.onInit === "function") {
            this.config.lifecycleHooks.onInit(this.inputs);
        }
    }

    /**
     * Handles input events across managed datalist fields.
     *
     * @param {Event} event - The native input DOM event.
     */
    handleInput(event) {
        /** @type {HTMLInputElement} */
        const inputTarget = /** @type {HTMLInputElement} */ (event.target);
        const currentValue = inputTarget.value;
        const datalistId = inputTarget.getAttribute("list");

        // FUTURE MODIFICATION POINT: Insert custom autocomplete filtering, remote search queries, or analytics logging here.

        if (typeof this.config.lifecycleHooks?.onInput === "function") {
            this.config.lifecycleHooks.onInput(inputTarget, event);
        }
    }

    /**
     * Dynamically populates option items into a linked datalist element.
     *
     * @param {HTMLInputElement} inputElement - The target input element with a 'list' attribute.
     * @param {Array<Object|string>} optionsData - Array of option objects or strings.
     */
    hydrateDatalist(inputElement, optionsData) {
        const datalistId = inputElement.getAttribute("list");
        if (!datalistId) {
            return;
        }

        let datalistElement = document.getElementById(datalistId);
        if (!datalistElement) {
            datalistElement = document.createElement("datalist");
            datalistElement.id = datalistId;
            inputElement.parentNode?.appendChild(datalistElement);
        }

        datalistElement.innerHTML = "";

        optionsData.forEach((optLabel, optVal) => {
            const optionEl = document.createElement("option");

            if (typeof optLabel === "object" && optLabel !== null) {
                const valAttr = String(
                    /** @type {Record<string, any>} */ (optLabel).value ??
                        optVal,
                );
                const lblAttr = String(
                    /** @type {Record<string, any>} */ (optLabel).label ?? "",
                );

                optionEl.value = valAttr;
                if (lblAttr) {
                    optionEl.label = lblAttr;
                }
            } else {
                const isNumericKey = !isNaN(Number(optVal));
                const valAttr = isNumericKey
                    ? String(optLabel)
                    : String(optVal);
                const lblAttr = isNumericKey ? "" : String(optLabel);

                optionEl.value = valAttr;
                if (lblAttr) {
                    optionEl.label = lblAttr;
                }
            }

            datalistElement.appendChild(optionEl);
        });
    }

    /**
     * =========================================================================
     * FUTURE MODIFICATIONS & EXTENSIBILITY GUIDE:
     * -------------------------------------------------------------------------
     * TO ADD A NEW METHOD OR BEHAVIOR:
     * 1. Declare your new public or private method right here inside this class block.
     * 2. Ensure all parameters and return types are fully documented using JSDoc
     *    syntax to satisfy strict type checking when "checkJs": true is enabled.
     * 3. Call your new method inside `processInputs()` or expose it to consuming
     *    projects via the configuration options object.
     * =========================================================================
     */

    /**
     * Public method to programmatically reset datalist input value.
     *
     * @param {string} inputId - The HTML ID of the datalist input to reset.
     */
    resetDatalistInput(inputId) {
        const targetInput = document.getElementById(inputId);
        if (targetInput instanceof HTMLInputElement) {
            targetInput.value = "";
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
 * import { DynamicDatalistManager } from './DynamicDatalistManager.js';
 *
 * const myDatalistManager = new DynamicDatalistManager({
 *     inputSelector: 'input[list].enterprise-datalist-input',
 *     enhanceNative: true,
 *
 *     // Injecting project-specific lookup datasets for dynamic hydration
 *     remoteDatasets: {
 *         'currencies-list': [
 *             { value: 'USD', label: 'United States Dollar' },
 *             { value: 'EUR', label: 'Euro' },
 *             { value: 'UGX', label: 'Ugandan Shilling' }
 *         ]
 *     },
 *
 *     // Injecting lifecycle hooks without modifying core source code
 *     lifecycleHooks: {
 *         onInit: (inputs) => {
 *             console.log(`Datalist manager active across ${inputs.length} elements.`);
 *         },
 *         onInput: (input, event) => {
 *             // Custom autocomplete or telemetry logic for this project
 *         }
 *     }
 * });
 *
 * // Expose globally if needed by legacy inline scripts
 * window.myDatalistManager = myDatalistManager;
 *
 * -----------------------------------------------------------------------------
 * PATTERN B: CDN / Direct Browser Script Tag (Zero Build Tools)
 * -----------------------------------------------------------------------------
 * If a specific project doesn't use a bundler, compile the module as an ES module
 * or global script and reference it directly in your Blade layout
 * (resources/views/layouts/app.blade.php):
 *
 * <script type="module">
 *     import { DynamicDatalistManager } from "{{ asset('js/DynamicDatalistManager.js') }}";
 *
 *     document.addEventListener('DOMContentLoaded', () => {
 *         window.datalistManager = new DynamicDatalistManager({
 *             inputSelector: '#search-autocomplete-input'
 *         });
 *     });
 * </script>
 *
 * =============================================================================
 * SECTION 3: GUIDE TO FUTURE MODIFICATIONS (WHERE AND HOW TO ADD CODE)
 * =============================================================================
 * When scaling across 10,000 projects, you will inevitably need to introduce new
 * features (e.g., asynchronous server fetching for autocomplete suggestions).
 * Follow these exact boundaries to prevent regressions:
 *
 * 1. Adding Remote Datasets: Do not modify DynamicDatalistManager.js core methods.
 *    Instead, pass your dataset dictionaries dynamically from the consuming
 *    project's initialization script into the remoteDatasets configuration object.
 *
 * 2. Adding New Event Listeners: If a new project requires handling additional
 *    events (such as 'focus' or 'change'), go to DynamicDatalistManager.js, locate
 *    the processInputs() method, and add your listeners alongside the 'input' event.
 *
 * 3. Adding Formatting Helpers: Place custom option parsing or filtering utility
 *    functions inside a dedicated helper file (e.g., datalistFormatters.js), import them
 *    into DynamicDatalistManager.js, and invoke them inside hydrateDatalist().
 * =============================================================================
 */
