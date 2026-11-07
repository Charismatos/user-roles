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
 * @typedef {Object} DynamicCheckableManagerConfig
 * @property {string} [inputSelector] - CSS selector for target checkbox and radio inputs. Default: 'input[type="checkbox"], input[type="radio"]'
 * @property {boolean} [enhanceNative] - Whether to apply dynamic state management enhancement. Default: true
 * @property {Object.<string, Array<Object|string>>} [remoteDatasets] - Map of dataset dictionaries for dynamic option hydration.
 * @property {Object} [lifecycleHooks] - Custom event lifecycle interceptors.
 * @property {function(NodeListOf<HTMLInputElement>): void} [lifecycleHooks.onInit] - Initialization hook.
 * @property {function(HTMLInputElement, Event): void} [lifecycleHooks.onChange] - Change event intercept hook.
 */

/**
 * @class DynamicCheckableManager
 * @classdesc Enterprise-grade, project-agnostic client-side orchestration engine
 * designed to manage dynamic checkbox and radio button states, grouped options,
 * single toggle elements, and hydration across 10,000+ independent web applications.
 */
export class DynamicCheckableManager {
    /**
     * Initializes the checkable manager instance with defensive configuration defaults.
     *
     * @param {DynamicCheckableManagerConfig} [userConfig={}] - Custom project configuration overrides.
     */
    constructor(userConfig = {}) {
        /**
         * @type {Required<DynamicCheckableManagerConfig>}
         */
        this.config = Object.assign(
            {
                inputSelector: 'input[type="checkbox"], input[type="radio"]',
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
     * WHY:  Discovers DOM nodes and binds change event listeners safely.
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
     * Scans checkbox and radio elements and attaches change listeners or hydrates groups.
     */
    processInputs() {
        this.inputs = document.querySelectorAll(this.config.inputSelector);

        this.inputs.forEach((input) => {
            if (this.config.enhanceNative) {
                input.addEventListener("change", (event) =>
                    this.handleInputChange(event),
                );
            }
        });

        // Trigger custom initialization lifecycle hook safely
        if (typeof this.config.lifecycleHooks?.onInit === "function") {
            this.config.lifecycleHooks.onInit(this.inputs);
        }
    }

    /**
     * Handles change events across managed checkable inputs.
     *
     * @param {Event} event - The native change DOM event.
     */
    handleInputChange(event) {
        /** @type {HTMLInputElement} */
        const inputTarget = /** @type {HTMLInputElement} */ (event.target);
        const inputType = inputTarget.type;
        const inputName = inputTarget.name;
        const isChecked = inputTarget.checked;

        // FUTURE MODIFICATION POINT: Insert custom toggle switch telemetry, group validation, or analytics logging here.

        if (typeof this.config.lifecycleHooks?.onChange === "function") {
            this.config.lifecycleHooks.onChange(inputTarget, event);
        }
    }

    /**
     * Dynamically populates option groups for checkboxes or radios into a target container.
     *
     * @param {HTMLElement} containerElement - The parent wrapper element.
     * @param {string} type - 'checkbox' or 'radio'.
     * @param {string} baseName - The base name attribute for the group.
     * @param {Array<Object|string>} optionsData - Array of option objects or strings.
     */
    hydrateCheckableGroup(containerElement, type, baseName, optionsData) {
        containerElement.innerHTML = "";

        optionsData.forEach((item) => {
            const optValue =
                typeof item === "object" && item !== null
                    ? String(
                          /** @type {Record<string, any>} */ (item).value ?? "",
                      )
                    : String(item);
            const optLabel =
                typeof item === "object" && item !== null
                    ? String(
                          /** @type {Record<string, any>} */ (item).label ??
                              optValue,
                      )
                    : String(item);
            const isDisabled =
                typeof item === "object" && item !== null
                    ? Boolean(
                          /** @type {Record<string, any>} */ (item).disabled,
                      )
                    : false;

            const uniqueId = `${baseName}_${optValue.toLowerCase().replace(/[^a-z0-9]+/g, "_")}`;

            const wrapperDiv = document.createElement("div");

            const inputEl = document.createElement("input");
            inputEl.type = type;
            inputEl.name =
                type === "checkbox" && !baseName.endsWith("[]")
                    ? `${baseName}[]`
                    : baseName;
            inputEl.id = uniqueId;
            inputEl.value = optValue;
            if (isDisabled) {
                inputEl.disabled = true;
            }

            const labelEl = document.createElement("label");
            labelEl.setAttribute("for", uniqueId);
            labelEl.textContent = optLabel;

            wrapperDiv.appendChild(inputEl);
            wrapperDiv.appendChild(labelEl);
            containerElement.appendChild(wrapperDiv);
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
     * Public method to programmatically check or uncheck an input by ID.
     *
     * @param {string} inputId - The HTML ID of the input element.
     * @param {boolean} checkedState - Desired checked state.
     */
    setInputState(inputId, checkedState) {
        const targetInput = document.getElementById(inputId);
        if (targetInput instanceof HTMLInputElement) {
            targetInput.checked = checkedState;
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
 * import the class and initialize it with custom parameters or hooks:
 *
 * import { DynamicCheckableManager } from './DynamicCheckableManager.js';
 *
 * const myCheckableManager = new DynamicCheckableManager({
 *     inputSelector: 'input[type="checkbox"].enterprise-checkbox, input[type="radio"].enterprise-radio',
 *     enhanceNative: true,
 *
 *     // Injecting lifecycle hooks without modifying core source code
 *     lifecycleHooks: {
 *         onInit: (inputs) => {
 *             console.log(`Checkable manager active across ${inputs.length} elements.`);
 *         },
 *         onChange: (input, event) => {
 *             // Custom state change logic or analytics for this project
 *         }
 *     }
 * });
 *
 * // Expose globally if needed by legacy inline scripts
 * window.myCheckableManager = myCheckableManager;
 *
 * -----------------------------------------------------------------------------
 * PATTERN B: CDN / Direct Browser Script Tag (Zero Build Tools)
 * -----------------------------------------------------------------------------
 * If a specific project doesn't use a bundler, compile the module as an ES module
 * or global script and reference it directly in your Blade layout
 * (resources/views/layouts/app.blade.php):
 *
 * <script type="module">
 *     import { DynamicCheckableManager } from "{{ asset('js/DynamicCheckableManager.js') }}";
 *
 *     document.addEventListener('DOMContentLoaded', () => {
 *         window.checkableManager = new DynamicCheckableManager({
 *             inputSelector: '#newsletter-checkbox'
 *         });
 *     });
 * </script>
 *
 * =============================================================================
 * SECTION 3: GUIDE TO FUTURE MODIFICATIONS (WHERE AND HOW TO ADD CODE)
 * =============================================================================
 * When scaling across 10,000 projects, you will inevitably need to introduce new
 * features (e.g., custom toggle animations or indeterminate checkbox states).
 * Follow these exact boundaries to prevent regressions:
 *
 * 1. Adding Configurations: Do not modify DynamicCheckableManager.js core methods.
 *    Instead, pass your custom flags or thresholds dynamically from the consuming
 *    project's initialization script into the configuration object.
 *
 * 2. Adding New Event Listeners: If a new project requires handling additional
 *    events (such as 'focus' or 'click'), go to DynamicCheckableManager.js, locate
 *    the processInputs() method, and add your listeners alongside the 'change' event.
 *
 * 3. Adding Formatting Helpers: Place custom label generation or value parsing utility
 *    functions inside a dedicated helper file (e.g., checkableFormatters.js), import them
 *    into DynamicCheckableManager.js, and invoke them inside hydrateCheckableGroup().
 * =============================================================================
 */
