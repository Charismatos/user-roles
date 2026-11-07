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
 * - ISO   : International Organization for Standardization
 * =============================================================================
 */

/**
 * @typedef {Object} DynamicDateTimeManagerConfig
 * @property {string} [inputSelector] - CSS selector for target date/datetime inputs. Default: 'input[type="date"], input[type="datetime-local"]'
 * @property {boolean} [enforceMinMax] - Whether to dynamically enforce minimum and maximum boundary validation. Default: true
 * @property {string} [minDate] - Dynamic minimum ISO date string boundary (e.g., '2020-01-01').
 * @property {string} [maxDate] - Dynamic maximum ISO date string boundary (e.g., '2030-12-31').
 * @property {Object} [lifecycleHooks] - Custom event lifecycle interceptors.
 * @property {function(NodeListOf<HTMLInputElement>): void} [lifecycleHooks.onInit] - Initialization hook.
 * @property {function(HTMLInputElement, Event): void} [lifecycleHooks.onChange] - Value change intercept hook.
 */

/**
 * @class DynamicDateTimeManager
 * @classdesc Enterprise-grade, project-agnostic client-side orchestration engine
 * designed to manage dynamic date and datetime-local picker inputs, format validation,
 * boundary constraint enforcement, and value synchronization across 10,000+ independent web applications.
 */
export class DynamicDateTimeManager {
    /**
     * Initializes the date/datetime manager instance with defensive configuration defaults.
     *
     * @param {DynamicDateTimeManagerConfig} [userConfig={}] - Custom project configuration overrides.
     */
    constructor(userConfig = {}) {
        /**
         * @type {Required<DynamicDateTimeManagerConfig>}
         */
        this.config = Object.assign(
            {
                inputSelector:
                    'input[type="date"], input[type="datetime-local"]',
                enforceMinMax: true,
                minDate: "",
                maxDate: "",
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
     * WHY:  Discovers DOM nodes and binds change/input event listeners safely.
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
     * Scans date and datetime-local inputs and applies validation rules based on configuration.
     */
    processInputs() {
        this.inputs = document.querySelectorAll(this.config.inputSelector);

        this.inputs.forEach((input) => {
            if (this.config.enforceMinMax) {
                if (this.config.minDate && !input.hasAttribute("min")) {
                    input.setAttribute("min", this.config.minDate);
                }
                if (this.config.maxDate && !input.hasAttribute("max")) {
                    input.setAttribute("max", this.config.maxDate);
                }
            }

            input.addEventListener("change", (event) =>
                this.handleInputChange(event),
            );
        });

        // Trigger custom initialization lifecycle hook safely
        if (typeof this.config.lifecycleHooks?.onInit === "function") {
            this.config.lifecycleHooks.onInit(this.inputs);
        }
    }

    /**
     * Handles change events across managed date and datetime input elements.
     *
     * @param {Event} event - The native change DOM event.
     */
    handleInputChange(event) {
        /** @type {HTMLInputElement} */
        const inputTarget = /** @type {HTMLInputElement} */ (event.target);
        const rawValue = inputTarget.value;
        const inputType = inputTarget.type;

        if (rawValue && this.config.enforceMinMax) {
            const minBoundary = inputTarget.getAttribute("min");
            const maxBoundary = inputTarget.getAttribute("max");

            if (minBoundary && rawValue < minBoundary) {
                inputTarget.classList.add("is-invalid");
            } else if (maxBoundary && rawValue > maxBoundary) {
                inputTarget.classList.add("is-invalid");
            } else {
                inputTarget.classList.remove("is-invalid");
            }
        }

        // FUTURE MODIFICATION POINT: Insert custom Flatpickr/Pikaday library bindings, timezone transformations, or ISO string conversion here.

        if (typeof this.config.lifecycleHooks?.onChange === "function") {
            this.config.lifecycleHooks.onChange(inputTarget, event);
        }
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
     * Public method to programmatically reset date inputs.
     *
     * @param {string} inputId - The HTML ID of the date input to reset.
     */
    resetDateTimeInput(inputId) {
        const targetInput = document.getElementById(inputId);
        if (targetInput instanceof HTMLInputElement) {
            targetInput.value = "";
            targetInput.classList.remove("is-invalid");
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
 * import { DynamicDateTimeManager } from './DynamicDateTimeManager.js';
 *
 * const myDateTimeManager = new DynamicDateTimeManager({
 *     inputSelector: 'input[type="date"].enterprise-date-picker, input[type="datetime-local"].enterprise-datetime-picker',
 *     enforceMinMax: true,
 *     minDate: '2026-01-01',
 *     maxDate: '2030-12-31',
 *
 *     // Injecting lifecycle hooks without modifying core source code
 *     lifecycleHooks: {
 *         onInit: (inputs) => {
 *             console.log(`DateTime picker manager active across ${inputs.length} fields.`);
 *         },
 *         onChange: (input, event) => {
 *             // Custom timezone conversion or telemetry trigger for this project
 *         }
 *     }
 * });
 *
 * // Expose globally if needed by legacy inline scripts
 * window.myDateTimeManager = myDateTimeManager;
 *
 * -----------------------------------------------------------------------------
 * PATTERN B: CDN / Direct Browser Script Tag (Zero Build Tools)
 * -----------------------------------------------------------------------------
 * If a specific project doesn't use a bundler, compile the module as an ES module
 * or global script and reference it directly in your Blade layout
 * (resources/views/layouts/app.blade.php):
 *
 * <script type="module">
 *     import { DynamicDateTimeManager } from "{{ asset('js/DynamicDateTimeManager.js') }}";
 *
 *     document.addEventListener('DOMContentLoaded', () => {
 *         window.dateTimeManager = new DynamicDateTimeManager({
 *             inputSelector: '#appointment-date-picker'
 *         });
 *     });
 * </script>
 *
 * =============================================================================
 * SECTION 3: GUIDE TO FUTURE MODIFICATIONS (WHERE AND HOW TO ADD CODE)
 * =============================================================================
 * When scaling across 10,000 projects, you will inevitably need to introduce new
 * features (e.g., custom UI datepicker library wrappers or localized date formatting).
 * Follow these exact boundaries to prevent regressions:
 *
 * 1. Adding Configurations: Do not modify DynamicDateTimeManager.js core methods.
 *    Instead, pass your custom date limits or format strings dynamically from the consuming
 *    project's initialization script into the configuration object.
 *
 * 2. Adding New Event Listeners: If a new project requires handling additional
 *    events (such as 'focus' or 'blur'), go to DynamicDateTimeManager.js, locate
 *    the processInputs() method, and add your listeners alongside the 'change' event.
 *
 * 3. Adding Formatting Helpers: Place custom ISO string conversion or locale formatting
 *    utility functions inside a dedicated helper file (e.g., dateTimeFormatters.js), import them
 *    into DynamicDateTimeManager.js, and invoke them inside handleInputChange().
 * =============================================================================
 */
