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
 * @typedef {Object} DynamicMeterManagerConfig
 * @property {string} [meterSelector] - CSS selector for target meter elements. Default: 'meter'
 * @property {boolean} [enhanceNative] - Whether to apply dynamic value thresholds and color states. Default: true
 * @property {Object.<string, Object>} [thresholdRules] - Map of threshold configurations for meter color states.
 * @property {Object} [lifecycleHooks] - Custom event lifecycle interceptors.
 * @property {function(NodeListOf<HTMLMeterElement>): void} [lifecycleHooks.onInit] - Initialization hook.
 * @property {function(HTMLMeterElement, number): void} [lifecycleHooks.onUpdate] - Value update intercept hook.
 */

/**
 * @class DynamicMeterManager
 * @classdesc Enterprise-grade, project-agnostic client-side orchestration engine
 * designed to manage dynamic HTML meter gauge states, scalar measurements,
 * threshold styling rules, and updates across 10,000+ independent web applications.
 */
export class DynamicMeterManager {
    /**
     * Initializes the meter manager instance with defensive configuration defaults.
     *
     * @param {DynamicMeterManagerConfig} [userConfig={}] - Custom project configuration overrides.
     */
    constructor(userConfig = {}) {
        /**
         * @type {Required<DynamicMeterManagerConfig>}
         */
        this.config = Object.assign(
            {
                meterSelector: "meter",
                enhanceNative: true,
                thresholdRules: {},
                lifecycleHooks: {},
            },
            userConfig,
        );

        /** @type {NodeListOf<HTMLMeterElement>|[]} */
        this.meters = [];

        this.init();
    }

    /**
     * =========================================================================
     * WHAT: Core Initialization Lifecycle
     * WHEN: Executes immediately upon class instantiation.
     * WHY:  Discovers DOM nodes and evaluates initial gauge states safely.
     * =========================================================================
     */
    init() {
        if (typeof document === "undefined") {
            return; // Safe guard for non-browser environments (SSR / Node.js)
        }

        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", () =>
                this.processMeters(),
            );
        } else {
            this.processMeters();
        }
    }

    /**
     * Scans meter elements and applies threshold color classes based on configuration rules.
     */
    processMeters() {
        this.meters = document.querySelectorAll(this.config.meterSelector);

        this.meters.forEach((meter) => {
            if (this.config.enhanceNative) {
                this.evaluateThresholds(meter);
            }
        });

        // Trigger custom initialization lifecycle hook safely
        if (typeof this.config.lifecycleHooks?.onInit === "function") {
            this.config.lifecycleHooks.onInit(this.meters);
        }
    }

    /**
     * Evaluates meter value against configured thresholds and applies status modifier classes.
     *
     * @param {HTMLMeterElement} meterElement - The target meter element.
     */
    evaluateThresholds(meterElement) {
        const meterId = meterElement.id;
        const currentValue = meterElement.value;
        const low = meterElement.low;
        const high = meterElement.high;
        const optimum = meterElement.optimum;

        // Remove existing state classes
        meterElement.classList.remove(
            "meter-optimal",
            "meter-suboptimal",
            "meter-critical",
        );

        // Check custom threshold rules if provided for this specific meter ID or general rules
        const rule =
            meterId && this.config.thresholdRules?.[meterId]
                ? this.config.thresholdRules[meterId]
                : null;

        if (rule) {
            const warningThreshold = Number(
                /** @type {Record<string, any>} */ (rule).warning ?? 50,
            );
            const dangerThreshold = Number(
                /** @type {Record<string, any>} */ (rule).danger ?? 80,
            );

            if (currentValue >= dangerThreshold) {
                meterElement.classList.add("meter-critical");
            } else if (currentValue >= warningThreshold) {
                meterElement.classList.add("meter-suboptimal");
            } else {
                meterElement.classList.add("meter-optimal");
            }
        }

        // FUTURE MODIFICATION POINT: Insert custom SVG gauge overlays, telemetry reporting, or animation triggers here.
    }

    /**
     * =========================================================================
     * FUTURE MODIFICATIONS & EXTENSIBILITY GUIDE:
     * -------------------------------------------------------------------------
     * TO ADD A NEW METHOD OR BEHAVIOR:
     * 1. Declare your new public or private method right here inside this class block.
     * 2. Ensure all parameters and return types are fully documented using JSDoc
     *    syntax to satisfy strict type checking when "checkJs": true is enabled.
     * 3. Call your new method inside `processMeters()` or expose it to consuming
     *    projects via the configuration options object.
     * =========================================================================
     */

    /**
     * Public method to programmatically update a meter's value and refresh its state.
     *
     * @param {string} meterId - The HTML ID of the meter element.
     * @param {number} newValue - The new numeric scalar value.
     */
    updateMeterValue(meterId, newValue) {
        const targetMeter = document.getElementById(meterId);
        if (targetMeter instanceof HTMLMeterElement) {
            targetMeter.value = newValue;
            targetMeter.textContent = String(newValue);
            this.evaluateThresholds(targetMeter);

            if (typeof this.config.lifecycleHooks?.onUpdate === "function") {
                this.config.lifecycleHooks.onUpdate(targetMeter, newValue);
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
 * import the class and initialize it with custom parameters or threshold rules:
 *
 * import { DynamicMeterManager } from './DynamicMeterManager.js';
 *
 * const myMeterManager = new DynamicMeterManager({
 *     meterSelector: 'meter.enterprise-gauge',
 *     enhanceNative: true,
 *
 *     // Injecting project-specific threshold rules for gauge indicators
 *     thresholdRules: {
 *         'storage-disk-meter': { warning: 60, danger: 85 },
 *         'cpu-load-meter': { warning: 70, danger: 90 }
 *     },
 *
 *     // Injecting lifecycle hooks without modifying core source code
 *     lifecycleHooks: {
 *         onInit: (meters) => {
 *             console.log(`Meter gauge manager active across ${meters.length} elements.`);
 *         },
 *         onUpdate: (meter, value) => {
 *             // Custom telemetry or logging for this project
 *         }
 *     }
 * });
 *
 * // Expose globally if needed by legacy inline scripts
 * window.myMeterManager = myMeterManager;
 *
 * -----------------------------------------------------------------------------
 * PATTERN B: CDN / Direct Browser Script Tag (Zero Build Tools)
 * -----------------------------------------------------------------------------
 * If a specific project doesn't use a bundler, compile the module as an ES module
 * or global script and reference it directly in your Blade layout
 * (resources/views/layouts/app.blade.php):
 *
 * <script type="module">
 *     import { DynamicMeterManager } from "{{ asset('js/DynamicMeterManager.js') }}";
 *
 *     document.addEventListener('DOMContentLoaded', () => {
 *         window.meterManager = new DynamicMeterManager({
 *             meterSelector: '#performance-meter'
 *         });
 *     });
 * </script>
 *
 * =============================================================================
 * SECTION 3: GUIDE TO FUTURE MODIFICATIONS (WHERE AND HOW TO ADD CODE)
 * =============================================================================
 * When scaling across 10,000 projects, you will inevitably need to introduce new
 * features (e.g., animated scalar transitions or WebSocket metric streaming).
 * Follow these exact boundaries to prevent regressions:
 *
 * 1. Adding Threshold Rules: Do not modify DynamicMeterManager.js core methods.
 *    Instead, pass your custom limits dynamically from the consuming project's
 *    initialization script into the thresholdRules configuration object.
 *
 * 2. Adding New Event Listeners: If a new project requires handling additional
 *    events or mutations, go to DynamicMeterManager.js, locate the processMeters()
 *    method, and add your observer or listener logic.
 *
 * 3. Adding Formatting Helpers: Place custom percentage calculation or unit formatting
 *    utility functions inside a dedicated helper file (e.g., meterFormatters.js), import them
 *    into DynamicMeterManager.js, and invoke them inside evaluateThresholds() or updateMeterValue().
 * =============================================================================
 */
