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
 * @typedef {Object} DynamicFieldErrorManagerConfig
 * @property {string} [errorSelector] - CSS selector for target per-field error containers. Default: '.field-error, [data-field-error]'
 * @property {boolean} [highlightInputs] - Whether to automatically toggle invalid border classes on associated form controls. Default: true
 * @property {Object} [lifecycleHooks] - Custom event lifecycle interceptors.
 * @property {function(NodeListOf<HTMLElement>): void} [lifecycleHooks.onInit] - Initialization hook.
 * @property {function(HTMLElement, string): void} [lifecycleHooks.onDisplay] - Error display intercept hook.
 */

/**
 * @class DynamicFieldErrorManager
 * @classdesc Enterprise-grade, project-agnostic client-side orchestration engine
 * designed to manage per-field inline validation error states, associated input highlighting,
 * and dynamic error message injections across 10,000+ independent web applications.
 */
export class DynamicFieldErrorManager {
    /**
     * Initializes the field error manager instance with defensive configuration defaults.
     *
     * @param {DynamicFieldErrorManagerConfig} [userConfig={}] - Custom project configuration overrides.
     */
    constructor(userConfig = {}) {
        /**
         * @type {Required<DynamicFieldErrorManagerConfig>}
         */
        this.config = Object.assign(
            {
                errorSelector: ".field-error, [data-field-error]",
                highlightInputs: true,
                lifecycleHooks: {},
            },
            userConfig,
        );

        /** @type {NodeListOf<HTMLElement>|[]} */
        this.errorElements = [];

        this.init();
    }

    /**
     * =========================================================================
     * WHAT: Core Initialization Lifecycle
     * WHEN: Executes immediately upon class instantiation.
     * WHY:  Discovers inline error DOM nodes and syncs field states safely.
     * =========================================================================
     */
    init() {
        if (typeof document === "undefined") {
            return; // Safe guard for non-browser environments (SSR / Node.js)
        }

        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", () =>
                this.processFieldErrors(),
            );
        } else {
            this.processFieldErrors();
        }
    }

    /**
     * Scans per-field error elements and highlights corresponding input fields if configured.
     */
    processFieldErrors() {
        this.errorElements = document.querySelectorAll(
            this.config.errorSelector,
        );

        if (this.config.highlightInputs) {
            this.errorElements.forEach((errorEl) => {
                const fieldName =
                    errorEl.getAttribute("data-field-name") ||
                    errorEl.id?.replace("_error", "");
                if (fieldName) {
                    const targetInput = document.querySelector(
                        `[name="${fieldName}"], #${fieldName}`,
                    );
                    if (targetInput) {
                        targetInput.classList.add("is-invalid");
                    }
                }
            });
        }

        // Trigger custom initialization lifecycle hook safely
        if (typeof this.config.lifecycleHooks?.onInit === "function") {
            this.config.lifecycleHooks.onInit(this.errorElements);
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
     * 3. Call your new method inside `processFieldErrors()` or expose it to consuming
     *    projects via the configuration options object.
     * =========================================================================
     */

    /**
     * Public method to programmatically display or update an inline validation error for a specific field.
     *
     * @param {string} fieldName - The name or ID of the form field.
     * @param {string} errorMessage - The error message string to display.
     */
    setFieldError(fieldName, errorMessage) {
        /** @type {HTMLElement|null} */
        let errorContainer = /** @type {HTMLElement|null} */ (
            document.querySelector(`[data-field-name="${fieldName}"]`) ||
                document.getElementById(`${fieldName}_error`)
        );

        /** @type {HTMLInputElement|null} */
        const targetInput = /** @type {HTMLInputElement|null} */ (
            document.querySelector(`[name="${fieldName}"], #${fieldName}`)
        );

        if (errorMessage) {
            if (!errorContainer && targetInput && targetInput.parentNode) {
                errorContainer = document.createElement("div");
                errorContainer.className = "field-error text-danger small mt-1";
                errorContainer.setAttribute("data-field-name", fieldName);
                targetInput.parentNode.appendChild(errorContainer);
            }

            if (errorContainer) {
                errorContainer.textContent = errorMessage;
                errorContainer.style.display = "block"; // Safe: errorContainer is strictly HTMLElement
            }

            if (targetInput) {
                targetInput.classList.add("is-invalid");
            }

            // FUTURE MODIFICATION POINT: Insert custom shake animations, tooltip popups, or telemetry logging here.

            if (
                typeof this.config.lifecycleHooks?.onDisplay === "function" &&
                errorContainer
            ) {
                this.config.lifecycleHooks.onDisplay(
                    errorContainer,
                    errorMessage,
                ); // Safe: matches HTMLElement parameter
            }
        } else {
            if (errorContainer) {
                errorContainer.textContent = "";
                errorContainer.style.display = "none"; // Safe: errorContainer is strictly HTMLElement
            }
            if (targetInput) {
                targetInput.classList.remove("is-invalid");
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
 * import { DynamicFieldErrorManager } from './DynamicFieldErrorManager.js';
 *
 * const myFieldErrorManager = new DynamicFieldErrorManager({
 *     errorSelector: '.enterprise-field-error',
 *     highlightInputs: true,
 *
 *     // Injecting lifecycle hooks without modifying core source code
 *     lifecycleHooks: {
 *         onInit: (errors) => {
 *             console.log(`Field error manager active across ${errors.length} inline errors.`);
 *         },
 *         onDisplay: (container, message) => {
 *             // Custom analytics or tooltip trigger for this project
 *         }
 *     }
 * });
 *
 * // Expose globally if needed by legacy inline scripts
 * window.myFieldErrorManager = myFieldErrorManager;
 *
 * -----------------------------------------------------------------------------
 * PATTERN B: CDN / Direct Browser Script Tag (Zero Build Tools)
 * -----------------------------------------------------------------------------
 * If a specific project doesn't use a bundler, compile the module as an ES module
 * or global script and reference it directly in your Blade layout
 * (resources/views/layouts/app.blade.php):
 *
 * <script type="module">
 *     import { DynamicFieldErrorManager } from "{{ asset('js/DynamicFieldErrorManager.js') }}";
 *
 *     document.addEventListener('DOMContentLoaded', () => {
 *         window.fieldErrorManager = new DynamicFieldErrorManager({
 *             errorSelector: '#email-error-container'
 *         });
 *     });
 * </script>
 *
 * =============================================================================
 * SECTION 3: GUIDE TO FUTURE MODIFICATIONS (WHERE AND HOW TO ADD CODE)
 * =============================================================================
 * When scaling across 10,000 projects, you will inevitably need to introduce new
 * features (e.g., real-time AJAX blur validation error rendering).
 * Follow these exact boundaries to prevent regressions:
 *
 * 1. Adding Configurations: Do not modify DynamicFieldErrorManager.js core methods.
 *    Instead, pass your custom flags or selectors dynamically from the consuming
 *    project's initialization script into the configuration object.
 *
 * 2. Adding New Event Listeners: If a new project requires handling additional
 *    events (such as input focus clearing errors), go to DynamicFieldErrorManager.js,
 *    locate the processFieldErrors() method, and attach your listener logic to inputs.
 *
 * 3. Adding Formatting Helpers: Place custom message formatting or translation utility
 *    functions inside a dedicated helper file (e.g., errorFormatters.js), import them
 *    into DynamicFieldErrorManager.js, and invoke them inside processFieldErrors() or setFieldError().
 * =============================================================================
 */
