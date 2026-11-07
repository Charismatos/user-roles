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
 * @typedef {Object} DynamicOutputManagerConfig
 * @property {string} [outputSelector] - CSS selector for target output elements. Default: 'output'
 * @property {boolean} [enhanceNative] - Whether to apply dynamic calculation or update tracking. Default: true
 * @property {Object} [lifecycleHooks] - Custom event lifecycle interceptors.
 * @property {function(NodeListOf<HTMLOutputElement>): void} [lifecycleHooks.onInit] - Initialization hook.
 * @property {function(HTMLOutputElement, string): void} [lifecycleHooks.onUpdate] - Value update intercept hook.
 */

/**
 * @class DynamicOutputManager
 * @classdesc Enterprise-grade, project-agnostic client-side orchestration engine
 * designed to manage dynamic HTML output calculation states, value bindings,
 * and result updates across 10,000+ independent web applications.
 */
export class DynamicOutputManager {
    /**
     * Initializes the output manager instance with defensive configuration defaults.
     *
     * @param {DynamicOutputManagerConfig} [userConfig={}] - Custom project configuration overrides.
     */
    constructor(userConfig = {}) {
        /**
         * @type {Required<DynamicOutputManagerConfig>}
         */
        this.config = Object.assign(
            {
                outputSelector: "output",
                enhanceNative: true,
                lifecycleHooks: {},
            },
            userConfig,
        );

        /** @type {NodeListOf<HTMLOutputElement>|[]} */
        this.outputElements = [];

        this.init();
    }

    /**
     * =========================================================================
     * WHAT: Core Initialization Lifecycle
     * WHEN: Executes immediately upon class instantiation.
     * WHY:  Discovers DOM nodes and evaluates initial output states safely.
     * =========================================================================
     */
    init() {
        if (typeof document === "undefined") {
            return; // Safe guard for non-browser environments (SSR / Node.js)
        }

        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", () =>
                this.processOutputElements(),
            );
        } else {
            this.processOutputElements();
        }
    }

    /**
     * Scans output elements and applies initialization rules based on configuration.
     */
    processOutputElements() {
        this.outputElements = document.querySelectorAll(
            this.config.outputSelector,
        );

        this.outputElements.forEach((output) => {
            // Ensure fallback text representation matches initial value if empty
            if (!output.textContent && output.hasAttribute("value")) {
                output.textContent = output.value;
            }
        });

        // Trigger custom initialization lifecycle hook safely
        if (typeof this.config.lifecycleHooks?.onInit === "function") {
            this.config.lifecycleHooks.onInit(this.outputElements);
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
     * 3. Call your new method inside `processOutputElements()` or expose it to consuming
     *    projects via the configuration options object.
     * =========================================================================
     */

    /**
     * Public method to programmatically update an output element's value.
     *
     * @param {string} outputId - The HTML ID of the output element.
     * @param {string} newValue - The new calculated string value.
     */
    updateOutputValue(outputId, newValue) {
        const targetOutput = document.getElementById(outputId);
        if (targetOutput instanceof HTMLOutputElement) {
            targetOutput.value = newValue;
            targetOutput.textContent = newValue;

            // FUTURE MODIFICATION POINT: Insert custom highlight animations, formatting rules, or telemetry logging here.

            if (typeof this.config.lifecycleHooks?.onUpdate === "function") {
                this.config.lifecycleHooks.onUpdate(targetOutput, newValue);
            }
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
 * import { DynamicOutputManager } from './DynamicOutputManager.js';
 *
 * const myOutputManager = new DynamicOutputManager({
 *     outputSelector: 'output.enterprise-calculation-result',
 *     enhanceNative: true,
 *
 *     // Injecting lifecycle hooks without modifying core source code
 *     lifecycleHooks: {
 *         onInit: (elements) => {
 *             console.log(`Output manager active across ${elements.length} elements.`);
 *         },
 *         onUpdate: (output, value) => {
 *             // Custom analytics or formatting trigger for this project
 *         }
 *     }
 * });
 *
 * // Expose globally if needed by legacy inline scripts
 * window.myOutputManager = myOutputManager;
 *
 * -----------------------------------------------------------------------------
 * PATTERN B: CDN / Direct Browser Script Tag (Zero Build Tools)
 * -----------------------------------------------------------------------------
 * If a specific project doesn't use a bundler, compile the module as an ES module
 * or global script and reference it directly in your Blade layout
 * (resources/views/layouts/app.blade.php):
 *
 * <script type="module">
 *     import { DynamicOutputManager } from "{{ asset('js/DynamicOutputManager.js') }}";
 *
 *     document.addEventListener('DOMContentLoaded', () => {
 *         window.outputManager = new DynamicOutputManager({
 *             outputSelector: '#total-amount-output'
 *         });
 *     });
 * </script>
 *
 * =============================================================================
 * SECTION 3: GUIDE TO FUTURE MODIFICATIONS (WHERE AND HOW TO ADD CODE)
 * =============================================================================
 * When scaling across 10,000 projects, you will inevitably need to introduce new
 * features (e.g., real-time currency formatting or calculation dependency bindings).
 * Follow these exact boundaries to prevent regressions:
 *
 * 1. Adding Configurations: Do not modify DynamicOutputManager.js core methods.
 *    Instead, pass your custom flags or thresholds dynamically from the consuming
 *    project's initialization script into the configuration object.
 *
 * 2. Adding New Event Listeners: If a new project requires handling additional
 *    events or input form mutations, go to DynamicOutputManager.js, locate
 *    the processOutputElements() method, and add your observer or listener logic.
 *
 * 3. Adding Formatting Helpers: Place custom currency or number formatting utility
 *    functions inside a dedicated helper file (e.g., outputFormatters.js), import them
 *    into DynamicOutputManager.js, and invoke them inside updateOutputValue().
 * =============================================================================
 */
