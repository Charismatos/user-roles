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
 * @typedef {Object} DynamicImageInputManagerConfig
 * @property {string} [imageInputSelector] - CSS selector for target image input elements. Default: 'input[type="image"]'
 * @property {boolean} [trackCoordinates] - Whether to capture click coordinate offsets (`clientX`/`clientY`). Default: true
 * @property {Object} [lifecycleHooks] - Custom event lifecycle interceptors.
 * @property {function(NodeListOf<HTMLInputElement>): void} [lifecycleHooks.onInit] - Initialization hook.
 * @property {function(HTMLInputElement, MouseEvent): void} [lifecycleHooks.onClick] - Click coordinate intercept hook.
 */

/**
 * @class DynamicImageInputManager
 * @classdesc Enterprise-grade, project-agnostic client-side orchestration engine
 * designed to manage dynamic image input states, click coordinate tracking, and
 * submission bindings across 10,000+ independent web applications.
 */
export class DynamicImageInputManager {
    /**
     * Initializes the image input manager instance with defensive configuration defaults.
     *
     * @param {DynamicImageInputManagerConfig} [userConfig={}] - Custom project configuration overrides.
     */
    constructor(userConfig = {}) {
        /**
         * @type {Required<DynamicImageInputManagerConfig>}
         */
        this.config = Object.assign(
            {
                imageInputSelector: 'input[type="image"]',
                trackCoordinates: true,
                lifecycleHooks: {},
            },
            userConfig,
        );

        /** @type {NodeListOf<HTMLInputElement>|[]} */
        this.imageInputs = [];

        this.init();
    }

    /**
     * =========================================================================
     * WHAT: Core Initialization Lifecycle
     * WHEN: Executes immediately upon class instantiation.
     * WHY:  Discovers DOM nodes and binds click event listeners safely.
     * =========================================================================
     */
    init() {
        if (typeof document === "undefined") {
            return; // Safe guard for non-browser environments (SSR / Node.js)
        }

        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", () =>
                this.processImageInputs(),
            );
        } else {
            this.processImageInputs();
        }
    }

    /**
     * Scans image input elements and attaches click listeners for coordinate capture.
     */
    processImageInputs() {
        this.imageInputs = document.querySelectorAll(
            this.config.imageInputSelector,
        );

        this.imageInputs.forEach((input) => {
            if (this.config.trackCoordinates) {
                input.addEventListener("click", (event) =>
                    this.handleImageClick(event),
                );
            }
        });

        // Trigger custom initialization lifecycle hook safely
        if (typeof this.config.lifecycleHooks?.onInit === "function") {
            this.config.lifecycleHooks.onInit(this.imageInputs);
        }
    }

    /**
     * Handles click events across managed image input elements.
     *
     * @param {MouseEvent} event - The native click mouse event.
     */
    handleImageClick(event) {
        /** @type {HTMLInputElement} */
        const inputTarget = /** @type {HTMLInputElement} */ (event.target);
        const offsetX = event.offsetX;
        const offsetY = event.offsetY;

        // FUTURE MODIFICATION POINT: Insert custom heat-mapping telemetry, image button analytics, or position validation here.

        if (typeof this.config.lifecycleHooks?.onClick === "function") {
            this.config.lifecycleHooks.onClick(inputTarget, event);
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
     * 3. Call your new method inside `processImageInputs()` or expose it to consuming
     *    projects via the configuration options object.
     * =========================================================================
     */

    /**
     * Public method to programmatically trigger click simulation on an image input.
     *
     * @param {string} inputId - The HTML ID of the image input element.
     */
    clickImageInput(inputId) {
        const targetInput = document.getElementById(inputId);
        if (targetInput instanceof HTMLInputElement) {
            targetInput.click();
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
 * import { DynamicImageInputManager } from './DynamicImageInputManager.js';
 *
 * const myImageInputManager = new DynamicImageInputManager({
 *     imageInputSelector: 'input[type="image"].enterprise-image-btn',
 *     trackCoordinates: true,
 *
 *     // Injecting lifecycle hooks without modifying core source code
 *     lifecycleHooks: {
 *         onInit: (inputs) => {
 *             console.log(`Image input manager active across ${inputs.length} elements.`);
 *         },
 *         onClick: (input, event) => {
 *             // Custom click position telemetry or analytics for this project
 *         }
 *     }
 * });
 *
 * // Expose globally if needed by legacy inline scripts
 * window.myImageInputManager = myImageInputManager;
 *
 * -----------------------------------------------------------------------------
 * PATTERN B: CDN / Direct Browser Script Tag (Zero Build Tools)
 * -----------------------------------------------------------------------------
 * If a specific project doesn't use a bundler, compile the module as an ES module
 * or global script and reference it directly in your Blade layout
 * (resources/views/layouts/app.blade.php):
 *
 * <script type="module">
 *     import { DynamicImageInputManager } from "{{ asset('js/DynamicImageInputManager.js') }}";
 *
 *     document.addEventListener('DOMContentLoaded', () => {
 *         window.imageInputManager = new DynamicImageInputManager({
 *             imageInputSelector: '#submit-image-button'
 *         });
 *     });
 * </script>
 *
 * =============================================================================
 * SECTION 3: GUIDE TO FUTURE MODIFICATIONS (WHERE AND HOW TO ADD CODE)
 * =============================================================================
 * When scaling across 10,000 projects, you will inevitably need to introduce new
 * features (e.g., image source fallback handling or hover state enhancements).
 * Follow these exact boundaries to prevent regressions:
 *
 * 1. Adding Configurations: Do not modify DynamicImageInputManager.js core methods.
 *    Instead, pass your custom flags or thresholds dynamically from the consuming
 *    project's initialization script into the configuration object.
 *
 * 2. Adding New Event Listeners: If a new project requires handling additional
 *    events (such as 'mouseenter' or 'error'), go to DynamicImageInputManager.js, locate
 *    the processImageInputs() method, and add your listeners alongside the 'click' event.
 *
 * 3. Adding Formatting Helpers: Place custom coordinate parsing or logging utility
 *    functions inside a dedicated helper file (e.g., imageFormatters.js), import them
 *    into DynamicImageInputManager.js, and invoke them inside handleImageClick().
 * =============================================================================
 */
