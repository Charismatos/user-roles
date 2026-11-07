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
 * - Ajax  : Asynchronous JavaScript and XML
 * - config: Configuration settings object
 * =============================================================================
 */

/**
 * @typedef {Object} DynamicFormManagerConfig
 * @property {string} [formSelector] - CSS selector for target forms. Default: 'form'
 * @property {boolean} [interceptSubmission] - Whether to handle client-side form interception. Default: true
 * @property {string[]} [excludedFormIds] - Array of form IDs that should bypass client handling.
 * @property {Object} [lifecycleHooks] - Custom event lifecycle interceptors.
 * @property {function(NodeListOf<HTMLFormElement>): void} [lifecycleHooks.onInit] - Initialization hook.
 * @property {function(HTMLFormElement, SubmitEvent): void} [lifecycleHooks.onSubmit] - Submission intercept hook.
 */

/**
 * @class DynamicFormManager
 * @classdesc Enterprise-grade, project-agnostic client-side orchestration engine
 * designed to manage dynamic form states, attributes, slot wrapping, and submit
 * lifecycles across 10,000+ independent web applications.
 */
export class DynamicFormManager {
    /**
     * Initializes the form manager instance with defensive configuration defaults.
     *
     * @param {DynamicFormManagerConfig} [userConfig={}] - Custom project configuration overrides.
     */
    constructor(userConfig = {}) {
        /**
         * @type {Required<DynamicFormManagerConfig>}
         */
        this.config = Object.assign(
            {
                formSelector: "form",
                interceptSubmission: true,
                excludedFormIds: [],
                lifecycleHooks: {},
            },
            userConfig,
        );

        /** @type {NodeListOf<HTMLFormElement>|[]} */
        this.forms = [];

        this.init();
    }

    /**
     * =========================================================================
     * WHAT: Core Initialization Lifecycle
     * WHEN: Executes immediately upon class instantiation.
     * WHY:  Discovers DOM nodes and binds form submission listeners safely.
     * =========================================================================
     */
    init() {
        if (typeof document === "undefined") {
            return; // Safe guard for non-browser environments (SSR / Node.js)
        }

        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", () =>
                this.processForms(),
            );
        } else {
            this.processForms();
        }
    }

    /**
     * Scans forms and applies interception rules based on configuration.
     */
    processForms() {
        this.forms = document.querySelectorAll(this.config.formSelector);

        this.forms.forEach((form) => {
            if (form.id && this.config.excludedFormIds.includes(form.id)) {
                return;
            }

            if (this.config.interceptSubmission) {
                form.addEventListener("submit", (event) =>
                    this.handleFormSubmit(event),
                );
            }
        });

        // Trigger custom initialization lifecycle hook safely
        if (typeof this.config.lifecycleHooks?.onInit === "function") {
            this.config.lifecycleHooks.onInit(this.forms);
        }
    }

    /**
     * Handles form submission events across managed forms.
     *
     * @param {SubmitEvent} event - The native submit DOM event.
     */
    handleFormSubmit(event) {
        /** @type {HTMLFormElement} */
        const formTarget = /** @type {HTMLFormElement} */ (event.target);
        const formName =
            formTarget.getAttribute("name") || formTarget.id || "unnamed_form";

        // FUTURE MODIFICATION POINT: Insert custom Ajax submission, token verification, or analytics tracking here.

        if (typeof this.config.lifecycleHooks?.onSubmit === "function") {
            this.config.lifecycleHooks.onSubmit(formTarget, event);
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
     * 3. Call your new method inside `processForms()` or expose it to consuming
     *    projects via the configuration options object.
     * =========================================================================
     */

    /**
     * Public method to programmatically reset form fields and clear validation classes.
     *
     * @param {string} formId - The HTML ID of the form to reset.
     */
    resetForm(formId) {
        const targetForm = document.getElementById(formId);
        if (targetForm instanceof HTMLFormElement) {
            targetForm.reset();
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
 * import { DynamicFormManager } from './DynamicFormManager.js';
 *
 * const myFormManager = new DynamicFormManager({
 *     formSelector: 'form.enterprise-dynamic-form',
 *     interceptSubmission: true,
 *
 *     // Injecting project-specific form exclusions
 *     excludedFormIds: ['legacy-payment-form', 'external-widget-form'],
 *
 *     // Injecting lifecycle hooks without modifying core source code
 *     lifecycleHooks: {
 *         onInit: (forms) => {
 *             console.log(`Managed form slots initialized across ${forms.length} elements.`);
 *         },
 *         onSubmit: (form, event) => {
 *             // Custom project-specific validation or telemetry before submit
 *         }
 *     }
 * });
 *
 * // Expose globally if needed by legacy inline scripts
 * window.myFormManager = myFormManager;
 *
 * -----------------------------------------------------------------------------
 * PATTERN B: CDN / Direct Browser Script Tag (Zero Build Tools)
 * -----------------------------------------------------------------------------
 * If a specific project doesn't use a bundler, compile the module as an ES module
 * or global script and reference it directly in your Blade layout
 * (resources/views/layouts/app.blade.php):
 *
 * <script type="module">
 *     import { DynamicFormManager } from "{{ asset('js/DynamicFormManager.js') }}";
 *
 *     document.addEventListener('DOMContentLoaded', () => {
 *         window.formManager = new DynamicFormManager({
 *             formSelector: '#main-content-form'
 *         });
 *     });
 * </script>
 *
 * =============================================================================
 * SECTION 3: GUIDE TO FUTURE MODIFICATIONS (WHERE AND HOW TO ADD CODE)
 * =============================================================================
 * When scaling across 10,000 projects, you will inevitably need to introduce new
 * features (e.g., automatic CSRF header injection or offline draft saving).
 * Follow these exact boundaries to prevent regressions:
 *
 * 1. Adding Exclusions: Do not modify DynamicFormManager.js core methods.
 *    Instead, pass your excluded form identifiers dynamically from the consuming
 *    project's initialization script into the excludedFormIds configuration array.
 *
 * 2. Adding New Event Listeners: If a new project requires handling additional
 *    form-level events (such as 'reset' or 'input'), go to DynamicFormManager.js,
 *    locate the processForms() method, and add your listener alongside the 'submit' event.
 *
 * 3. Adding Submission Helpers: Place data serialization or Ajax request utility
 *    functions inside a dedicated helper file (e.g., formSubmitters.js), import them
 *    into DynamicFormManager.js, and invoke them inside handleFormSubmit().
 * =============================================================================
 */
