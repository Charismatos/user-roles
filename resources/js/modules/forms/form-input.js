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
 * @typedef {Object} DynamicInputManagerConfig
 * @property {string} [inputSelector] - CSS selector for target generic input elements. Default: 'input:not([type]), input[type="text"], input[type="password"], input[type="search"], input[type="tel"], input[type="url"], input[type="number"]'
 * @property {boolean} [enhanceNative] - Whether to apply dynamic behavior enhancement. Default: true
 * @property {Object.<string, string>} [defaultValues] - Map of default value overrides for specific input IDs or names.
 * @property {Object} [lifecycleHooks] - Custom event lifecycle interceptors.
 * @property {function(NodeListOf<HTMLInputElement>): void} [lifecycleHooks.onInit] - Initialization hook.
 * @property {function(HTMLInputElement, Event): void} [lifecycleHooks.onInput] - Input change intercept hook.
 */

/**
 * @class DynamicInputManager
 * @classdesc Enterprise-grade, project-agnostic client-side orchestration engine
 * designed to manage generic text/number input states, mask formatting,
 * value bindings, and event handling across 10,000+ independent web applications.
 */
export class DynamicInputManager {
    /**
     * Initializes the input manager instance with defensive configuration defaults.
     *
     * @param {DynamicInputManagerConfig} [userConfig={}] - Custom project configuration overrides.
     */
    constructor(userConfig = {}) {
        /**
         * @type {Required<DynamicInputManagerConfig>}
         */
        this.config = Object.assign(
            {
                inputSelector:
                    'input:not([type]), input[type="text"], input[type="password"], input[type="search"], input[type="tel"], input[type="url"], input[type="number"]',
                enhanceNative: true,
                defaultValues: {},
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
     * Scans generic input elements and attaches event listeners or applies default overrides.
     */
    processInputs() {
        this.inputs = document.querySelectorAll(this.config.inputSelector);

        this.inputs.forEach((input) => {
            const inputId = input.id;
            const inputName = input.name;

            if (this.config.enhanceNative) {
                // Apply default value overrides if configured
                const overrideValue =
                    (inputId && this.config.defaultValues?.[inputId]) ||
                    (inputName && this.config.defaultValues?.[inputName]);

                if (overrideValue !== undefined) {
                    input.value = overrideValue;
                }

                input.addEventListener("input", (event) =>
                    this.handleInputEvent(event),
                );
            }
        });

        // Trigger custom initialization lifecycle hook safely
        if (typeof this.config.lifecycleHooks?.onInit === "function") {
            this.config.lifecycleHooks.onInit(this.inputs);
        }
    }

    /**
     * Handles input events across managed generic text and number input elements.
     *
     * @param {Event} event - The native input DOM event.
     */
    handleInputEvent(event) {
        /** @type {HTMLInputElement} */
        const inputTarget = /** @type {HTMLInputElement} */ (event.target);
        const currentValue = inputTarget.value;
        const inputType = inputTarget.type;

        // FUTURE MODIFICATION POINT: Insert custom input masking, real-time sanitization, or analytics logging here.

        if (typeof this.config.lifecycleHooks?.onInput === "function") {
            this.config.lifecycleHooks.onInput(inputTarget, event);
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
     * Public method to programmatically reset an input's value.
     *
     * @param {string} inputId - The HTML ID of the input element.
     */
    resetInput(inputId) {
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
 * import the class and initialize it with custom parameters or default values:
 *
 * import { DynamicInputManager } from './DynamicInputManager.js';
 *
 * const myInputManager = new DynamicInputManager({
 *     inputSelector: 'input[type="text"].enterprise-text-field',
 *     enhanceNative: true,
 *
 *     // Injecting project-specific default values or pre-filled states
 *     defaultValues: {
 *         'user_first_name': 'Guest User',
 *         'search_query_box': ''
 *     },
 *
 *     // Injecting lifecycle hooks without modifying core source code
 *     lifecycleHooks: {
 *         onInit: (inputs) => {
 *             console.log(`Generic input manager active across ${inputs.length} elements.`);
 *         },
 *         onInput: (input, event) => {
 *             // Custom telemetry or formatting trigger for this project
 *         }
 *     }
 * });
 *
 * // Expose globally if needed by legacy inline scripts
 * window.myInputManager = myInputManager;
 *
 * -----------------------------------------------------------------------------
 * PATTERN B: CDN / Direct Browser Script Tag (Zero Build Tools)
 * -----------------------------------------------------------------------------
 * If a specific project doesn't use a bundler, compile the module as an ES module
 * or global script and reference it directly in your Blade layout
 * (resources/views/layouts/app.blade.php):
 *
 * <script type="module">
 *     import { DynamicInputManager } from "{{ asset('js/DynamicInputManager.js') }}";
 *
 *     document.addEventListener('DOMContentLoaded', () => {
 *         window.inputManager = new DynamicInputManager({
 *             inputSelector: '#custom-text-input'
 *         });
 *     });
 * </script>
 *
 * =============================================================================
 * SECTION 3: GUIDE TO FUTURE MODIFICATIONS (WHERE AND HOW TO ADD CODE)
 * =============================================================================
 * When scaling across 10,000 projects, you will inevitably need to introduce new
 * features (e.g., automatic input sanitization or character counters).
 * Follow these exact boundaries to prevent regressions:
 *
 * 1. Adding Default Values: Do not modify DynamicInputManager.js core methods.
 *    Instead, pass your custom value dictionaries dynamically from the consuming
 *    project's initialization script into the defaultValues configuration object.
 *
 * 2. Adding New Event Listeners: If a new project requires handling additional
 *    events (such as 'focus' or 'blur'), go to DynamicInputManager.js, locate
 *    the processInputs() method, and add your listeners alongside the 'input' event.
 *
 * 3. Adding Formatting Helpers: Place custom string formatting or masking utility
 *    functions inside a dedicated helper file (e.g., inputFormatters.js), import them
 *    into DynamicInputManager.js, and invoke them inside handleInputEvent().
 * =============================================================================
 */
