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
 * @typedef {Object} DynamicButtonManagerConfig
 * @property {string} [buttonSelector] - CSS selector for target button, submit, and reset elements. Default: 'button[type="button"], button[type="submit"], button[type="reset"]'
 * @property {boolean} [enhanceNative] - Whether to apply dynamic click behavior and ripple/loading states. Default: true
 * @property {Object} [lifecycleHooks] - Custom event lifecycle interceptors.
 * @property {function(NodeListOf<HTMLButtonElement>): void} [lifecycleHooks.onInit] - Initialization hook.
 * @property {function(HTMLButtonElement, MouseEvent): void} [lifecycleHooks.onClick] - Click event intercept hook.
 */

/**
 * @class DynamicButtonManager
 * @classdesc Enterprise-grade, project-agnostic client-side orchestration engine
 * designed to manage dynamic button states, action triggers, submission loading states,
 * and reset handlers across 10,000+ independent web applications.
 */
export class DynamicButtonManager {
    /**
     * Initializes the button manager instance with defensive configuration defaults.
     *
     * @param {DynamicButtonManagerConfig} [userConfig={}] - Custom project configuration overrides.
     */
    constructor(userConfig = {}) {
        /**
         * @type {Required<DynamicButtonManagerConfig>}
         */
        this.config = Object.assign(
            {
                buttonSelector:
                    'button[type="button"], button[type="submit"], button[type="reset"]',
                enhanceNative: true,
                lifecycleHooks: {},
            },
            userConfig,
        );

        /** @type {NodeListOf<HTMLButtonElement>|[]} */
        this.buttons = [];

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
                this.processButtons(),
            );
        } else {
            this.processButtons();
        }
    }

    /**
     * Scans button elements and applies initialization rules based on configuration.
     */
    processButtons() {
        this.buttons = document.querySelectorAll(this.config.buttonSelector);

        this.buttons.forEach((button) => {
            if (this.config.enhanceNative) {
                button.addEventListener("click", (event) =>
                    this.handleButtonClick(event),
                );
            }
        });

        // Trigger custom initialization lifecycle hook safely
        if (typeof this.config.lifecycleHooks?.onInit === "function") {
            this.config.lifecycleHooks.onInit(this.buttons);
        }
    }

    /**
     * Handles click events across managed button elements.
     *
     * @param {MouseEvent} event - The native click mouse event.
     */
    handleButtonClick(event) {
        /** @type {HTMLButtonElement} */
        const buttonTarget = /** @type {HTMLButtonElement} */ (
            event.currentTarget || event.target
        );
        const buttonType = buttonTarget.type;

        // FUTURE MODIFICATION POINT: Insert custom loading spinners, debounce throttling, or telemetry logging here.

        if (typeof this.config.lifecycleHooks?.onClick === "function") {
            this.config.lifecycleHooks.onClick(buttonTarget, event);
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
     * 3. Call your new method inside `processButtons()` or expose it to consuming
     *    projects via the configuration options object.
     * =========================================================================
     */

    /**
     * Public method to programmatically set a button into a loading or disabled state.
     *
     * @param {string} buttonId - The HTML ID of the button element.
     * @param {boolean} isLoading - Desired loading state.
     * @param {string} [loadingText] - Optional temporary loading text.
     */
    setButtonLoading(buttonId, isLoading, loadingText = "Processing...") {
        const targetButton = document.getElementById(buttonId);
        if (targetButton instanceof HTMLButtonElement) {
            targetButton.disabled = isLoading;
            if (isLoading) {
                targetButton.dataset.originalText =
                    targetButton.textContent || "";
                targetButton.textContent = loadingText;
                targetButton.classList.add("btn-loading");
            } else {
                targetButton.textContent =
                    targetButton.dataset.originalText ||
                    targetButton.textContent;
                targetButton.classList.remove("btn-loading");
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
 * import { DynamicButtonManager } from './DynamicButtonManager.js';
 *
 * const myButtonManager = new DynamicButtonManager({
 *     buttonSelector: 'button.enterprise-action-btn',
 *     enhanceNative: true,
 *
 *     // Injecting lifecycle hooks without modifying core source code
 *     lifecycleHooks: {
 *         onInit: (buttons) => {
 *             console.log(`Button manager active across ${buttons.length} elements.`);
 *         },
 *         onClick: (button, event) => {
 *             // Custom click analytics or confirmation dialogs for this project
 *         }
 *     }
 * });
 *
 * // Expose globally if needed by legacy inline scripts
 * window.myButtonManager = myButtonManager;
 *
 * -----------------------------------------------------------------------------
 * PATTERN B: CDN / Direct Browser Script Tag (Zero Build Tools)
 * -----------------------------------------------------------------------------
 * If a specific project doesn't use a bundler, compile the module as an ES module
 * or global script and reference it directly in your Blade layout
 * (resources/views/layouts/app.blade.php):
 *
 * <script type="module">
 *     import { DynamicButtonManager } from "{{ asset('js/DynamicButtonManager.js') }}";
 *
 *     document.addEventListener('DOMContentLoaded', () => {
 *         window.buttonManager = new DynamicButtonManager({
 *             buttonSelector: '#submit-payment-btn'
 *         });
 *     });
 * </script>
 *
 * =============================================================================
 * SECTION 3: GUIDE TO FUTURE MODIFICATIONS (WHERE AND HOW TO ADD CODE)
 * =============================================================================
 * When scaling across 10,000 projects, you will inevitably need to introduce new
 * features (e.g., automatic double-click prevention or ripple click animation effects).
 * Follow these exact boundaries to prevent regressions:
 *
 * 1. Adding Configurations: Do not modify DynamicButtonManager.js core methods.
 *    Instead, pass your custom flags or thresholds dynamically from the consuming
 *    project's initialization script into the configuration object.
 *
 * 2. Adding New Event Listeners: If a new project requires handling additional
 *    events (such as 'mousedown' or 'dblclick'), go to DynamicButtonManager.js, locate
 *    the processButtons() method, and add your listeners alongside the 'click' event.
 *
 * 3. Adding Animation Helpers: Place custom ripple generation or state formatting
 *    utility functions inside a dedicated helper file (e.g., buttonFormatters.js), import them
 *    into DynamicButtonManager.js, and invoke them inside handleButtonClick().
 * =============================================================================
 */
