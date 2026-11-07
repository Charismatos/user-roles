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
 * @typedef {Object} DynamicFieldsetManagerConfig
 * @property {string} [fieldsetSelector] - CSS selector for target fieldset elements. Default: 'fieldset'
 * @property {boolean} [enhanceNative] - Whether to apply dynamic grouping and legend state management. Default: true
 * @property {Object} [lifecycleHooks] - Custom event lifecycle interceptors.
 * @property {function(NodeListOf<HTMLFieldSetElement>): void} [lifecycleHooks.onInit] - Initialization hook.
 * @property {function(HTMLFieldSetElement, Event): void} [lifecycleHooks.onToggle] - Fieldset interaction intercept hook.
 */

/**
 * @class DynamicFieldsetManager
 * @classdesc Enterprise-grade, project-agnostic client-side orchestration engine
 * designed to manage dynamic HTML fieldset grouping states, legends, slot containers,
 * and interactive behaviors across 10,000+ independent web applications.
 */
export class DynamicFieldsetManager {
    /**
     * Initializes the fieldset manager instance with defensive configuration defaults.
     *
     * @param {DynamicFieldsetManagerConfig} [userConfig={}] - Custom project configuration overrides.
     */
    constructor(userConfig = {}) {
        /**
         * @type {Required<DynamicFieldsetManagerConfig>}
         */
        this.config = Object.assign(
            {
                fieldsetSelector: "fieldset",
                enhanceNative: true,
                lifecycleHooks: {},
            },
            userConfig,
        );

        /** @type {NodeListOf<HTMLFieldSetElement>|[]} */
        this.fieldsets = [];

        this.init();
    }

    /**
     * =========================================================================
     * WHAT: Core Initialization Lifecycle
     * WHEN: Executes immediately upon class instantiation.
     * WHY:  Discovers DOM nodes and evaluates initial fieldset states safely.
     * =========================================================================
     */
    init() {
        if (typeof document === "undefined") {
            return; // Safe guard for non-browser environments (SSR / Node.js)
        }

        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", () =>
                this.processFieldsets(),
            );
        } else {
            this.processFieldsets();
        }
    }

    /**
     * Scans fieldset elements and applies initialization rules based on configuration.
     */
    processFieldsets() {
        this.fieldsets = document.querySelectorAll(
            this.config.fieldsetSelector,
        );

        this.fieldsets.forEach((fieldset) => {
            if (this.config.enhanceNative) {
                // Ensure accessibility relationship between legend and fieldset if applicable
                const legend = fieldset.querySelector("legend");
                if (legend && !legend.id) {
                    legend.id = `legend_${Math.random().toString(36).substring(2, 9)}`;
                }
            }
        });

        // Trigger custom initialization lifecycle hook safely
        if (typeof this.config.lifecycleHooks?.onInit === "function") {
            this.config.lifecycleHooks.onInit(this.fieldsets);
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
     * 3. Call your new method inside `processFieldsets()` or expose it to consuming
     *    projects via the configuration options object.
     * =========================================================================
     */

    /**
     * Public method to programmatically enable or disable a fieldset and its inner controls.
     *
     * @param {string} fieldsetId - The HTML ID of the fieldset element.
     * @param {boolean} isDisabled - Desired disabled state.
     */
    setFieldsetState(fieldsetId, isDisabled) {
        const targetFieldset = document.getElementById(fieldsetId);
        if (targetFieldset instanceof HTMLFieldSetElement) {
            targetFieldset.disabled = isDisabled;

            // FUTURE MODIFICATION POINT: Insert custom visual dimming classes, aria attribute updates, or analytics logging here.

            if (typeof this.config.lifecycleHooks?.onToggle === "function") {
                // Casting Event as a generic custom event fallback
                this.config.lifecycleHooks.onToggle(
                    targetFieldset,
                    new Event("toggle"),
                );
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
 * import { DynamicFieldsetManager } from './DynamicFieldsetManager.js';
 *
 * const myFieldsetManager = new DynamicFieldsetManager({
 *     fieldsetSelector: 'fieldset.enterprise-fieldset',
 *     enhanceNative: true,
 *
 *     // Injecting lifecycle hooks without modifying core source code
 *     lifecycleHooks: {
 *         onInit: (fieldsets) => {
 *             console.log(`Fieldset manager active across ${fieldsets.length} elements.`);
 *         },
 *         onToggle: (fieldset, event) => {
 *             // Custom state change analytics or telemetry for this project
 *         }
 *     }
 * });
 *
 * // Expose globally if needed by legacy inline scripts
 * window.myFieldsetManager = myFieldsetManager;
 *
 * -----------------------------------------------------------------------------
 * PATTERN B: CDN / Direct Browser Script Tag (Zero Build Tools)
 * -----------------------------------------------------------------------------
 * If a specific project doesn't use a bundler, compile the module as an ES module
 * or global script and reference it directly in your Blade layout
 * (resources/views/layouts/app.blade.php):
 *
 * <script type="module">
 *     import { DynamicFieldsetManager } from "{{ asset('js/DynamicFieldsetManager.js') }}";
 *
 *     document.addEventListener('DOMContentLoaded', () => {
 *         window.fieldsetManager = new DynamicFieldsetManager({
 *             fieldsetSelector: '#shipping-address-fieldset'
 *         });
 *     });
 * </script>
 *
 * =============================================================================
 * SECTION 3: GUIDE TO FUTURE MODIFICATIONS (WHERE AND HOW TO ADD CODE)
 * =============================================================================
 * When scaling across 10,000 projects, you will inevitably need to introduce new
 * features (e.g., collapsible accordion fieldsets or multi-step wizard step gating).
 * Follow these exact boundaries to prevent regressions:
 *
 * 1. Adding Configurations: Do not modify DynamicFieldsetManager.js core methods.
 *    Instead, pass your custom configuration flags dynamically from the consuming
 *    project's initialization script into the configuration object.
 *
 * 2. Adding New Event Listeners: If a new project requires handling additional
 *    events (such as legend clicks for collapsing), go to DynamicFieldsetManager.js,
 *    locate the processFieldsets() method, and attach your listener to the legend elements.
 *
 * 3. Adding Formatting Helpers: Place custom accessibility or layout utility
 *    functions inside a dedicated helper file (e.g., fieldsetFormatters.js), import them
 *    into DynamicFieldsetManager.js, and invoke them inside processFieldsets() or setFieldsetState().
 * =============================================================================
 */
