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
 * - AJAX  : Asynchronous JavaScript and XML
 * =============================================================================
 */

/**
 * @typedef {Object} DynamicFormErrorsManagerConfig
 * @property {string} [errorsSelector] - CSS selector for target validation error containers. Default: '.form-errors, [data-form-errors]'
 * @property {boolean} [autoScroll] - Whether to automatically scroll the window into view when errors are present. Default: true
 * @property {boolean} [dismissible] - Whether to append close/dismiss buttons to error containers. Default: false
 * @property {Object} [lifecycleHooks] - Custom event lifecycle interceptors.
 * @property {function(NodeListOf<HTMLElement>): void} [lifecycleHooks.onInit] - Initialization hook.
 * @property {function(HTMLElement): void} [lifecycleHooks.onDismiss] - Error container dismissal intercept hook.
 */

/**
 * @class DynamicFormErrorsManager
 * @classdesc Enterprise-grade, project-agnostic client-side orchestration engine
 * designed to manage dynamic validation error alert containers, auto-scrolling,
 * asynchronous error banner injections, and dismissal states across 10,000+ independent web applications.
 */
export class DynamicFormErrorsManager {
    /**
     * Initializes the form errors manager instance with defensive configuration defaults.
     *
     * @param {DynamicFormErrorsManagerConfig} [userConfig={}] - Custom project configuration overrides.
     */
    constructor(userConfig = {}) {
        /**
         * @type {Required<DynamicFormErrorsManagerConfig>}
         */
        this.config = Object.assign(
            {
                errorsSelector: ".form-errors, [data-form-errors]",
                autoScroll: true,
                dismissible: false,
                lifecycleHooks: {},
            },
            userConfig,
        );

        /** @type {NodeListOf<HTMLElement>|[]} */
        this.errorContainers = [];

        this.init();
    }

    /**
     * =========================================================================
     * WHAT: Core Initialization Lifecycle
     * WHEN: Executes immediately upon class instantiation.
     * WHY:  Discovers error container DOM nodes and manages visibility/scrolling safely.
     * =========================================================================
     */
    init() {
        if (typeof document === "undefined") {
            return; // Safe guard for non-browser environments (SSR / Node.js)
        }

        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", () =>
                this.processErrorContainers(),
            );
        } else {
            this.processErrorContainers();
        }
    }

    /**
     * Scans error container elements and applies auto-scrolling or dismissal enhancements.
     */
    processErrorContainers() {
        this.errorContainers = document.querySelectorAll(
            this.config.errorsSelector,
        );

        if (this.errorContainers.length > 0) {
            const firstContainer = /** @type {HTMLElement} */ (
                this.errorContainers[0]
            );

            if (this.config.autoScroll && firstContainer) {
                firstContainer.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                });
            }

            this.errorContainers.forEach((container) => {
                if (
                    this.config.dismissible &&
                    !container.querySelector(".error-dismiss-btn")
                ) {
                    const dismissBtn = document.createElement("button");
                    dismissBtn.type = "button";
                    dismissBtn.className = "error-dismiss-btn";
                    dismissBtn.textContent = "×";
                    dismissBtn.setAttribute("aria-label", "Dismiss errors");
                    dismissBtn.addEventListener("click", () => {
                        container.style.display = "none";
                        if (
                            typeof this.config.lifecycleHooks?.onDismiss ===
                            "function"
                        ) {
                            this.config.lifecycleHooks.onDismiss(container);
                        }
                    });
                    container.prepend(dismissBtn);
                }
            });
        }

        // Trigger custom initialization lifecycle hook safely
        if (typeof this.config.lifecycleHooks?.onInit === "function") {
            this.config.lifecycleHooks.onInit(this.errorContainers);
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
     * 3. Call your new method inside `processErrorContainers()` or expose it to consuming
     *    projects via the configuration options object.
     * =========================================================================
     */

    /**
     * Public method to programmatically inject and display asynchronous validation errors.
     *
     * @param {string} containerId - The HTML ID of the target wrapper element.
     * @param {string[]} errorMessages - Array of error strings to render.
     */
    displayErrors(containerId, errorMessages) {
        const targetContainer = document.getElementById(containerId);
        if (targetContainer && errorMessages.length > 0) {
            targetContainer.innerHTML = "";

            const ul = document.createElement("ul");
            errorMessages.forEach((msg) => {
                const li = document.createElement("li");
                li.textContent = msg;
                ul.appendChild(li);
            });

            targetContainer.appendChild(ul);
            targetContainer.style.display = "block";

            if (this.config.autoScroll) {
                targetContainer.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                });
            }

            // FUTURE MODIFICATION POINT: Insert custom animation keyframes, sound alerts, or telemetry logging here.
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
 * import { DynamicFormErrorsManager } from './DynamicFormErrorsManager.js';
 *
 * const myFormErrorsManager = new DynamicFormErrorsManager({
 *     errorsSelector: '.enterprise-form-errors',
 *     autoScroll: true,
 *     dismissible: true,
 *
 *     // Injecting lifecycle hooks without modifying core source code
 *     lifecycleHooks: {
 *         onInit: (containers) => {
 *             console.log(`Form errors manager active across ${containers.length} containers.`);
 *         },
 *         onDismiss: (container) => {
 *             // Custom analytics or cleanup when errors are dismissed
 *         }
 *     }
 * });
 *
 * // Expose globally if needed by legacy inline scripts
 * window.myFormErrorsManager = myFormErrorsManager;
 *
 * -----------------------------------------------------------------------------
 * PATTERN B: CDN / Direct Browser Script Tag (Zero Build Tools)
 * -----------------------------------------------------------------------------
 * If a specific project doesn't use a bundler, compile the module as an ES module
 * or global script and reference it directly in your Blade layout
 * (resources/views/layouts/app.blade.php):
 *
 * <script type="module">
 *     import { DynamicFormErrorsManager } from "{{ asset('js/DynamicFormErrorsManager.js') }}";
 *
 *     document.addEventListener('DOMContentLoaded', () => {
 *         window.formErrorsManager = new DynamicFormErrorsManager({
 *             errorsSelector: '#global-form-errors'
 *         });
 *     });
 * </script>
 *
 * =============================================================================
 * SECTION 3: GUIDE TO FUTURE MODIFICATIONS (WHERE AND HOW TO ADD CODE)
 * =============================================================================
 * When scaling across 10,000 projects, you will inevitably need to introduce new
 * features (e.g., AJAX form submission error interception or toast notifications).
 * Follow these exact boundaries to prevent regressions:
 *
 * 1. Adding Configurations: Do not modify DynamicFormErrorsManager.js core methods.
 *    Instead, pass your custom flags or selectors dynamically from the consuming
 *    project's initialization script into the configuration object.
 *
 * 2. Adding New Event Listeners: If a new project requires handling additional
 *    events (such as click trackers or live validation watchers), go to DynamicFormErrorsManager.js,
 *    locate the processErrorContainers() method, and attach your listener logic.
 *
 * 3. Adding Formatting Helpers: Place custom error formatting or translation utility
 *    functions inside a dedicated helper file (e.g., errorFormatters.js), import them
 *    into DynamicFormErrorsManager.js, and invoke them inside processErrorContainers() or displayErrors().
 * =============================================================================
 */
