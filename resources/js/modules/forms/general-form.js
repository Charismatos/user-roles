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
 * - config: Configuration settings object
 * =============================================================================
 */

/**
 * @typedef {Object} UniversalFormConfig
 * @property {string} [formSelector] - CSS selector for target forms.
 * @property {string} [fieldSelector] - CSS selector for managed form fields.
 * @property {boolean} [autoValidate] - Whether to trigger validation on blur.
 * @property {Object.<string, function(HTMLElement, any): boolean>} [customValidators] - Map of custom validation rules.
 * @property {Object} [lifecycleHooks] - Custom event lifecycle interceptors.
 * @property {function(NodeListOf<HTMLElement>): void} [lifecycleHooks.onInit] - Init hook.
 * @property {function(HTMLElement, string): void} [lifecycleHooks.onInput] - Input hook.
 */

/**
 * @class UniversalFormController
 * @classdesc Enterprise-grade, project-agnostic client-side orchestration engine
 * designed to manage dynamic form states, event lifecycles, and validation rules
 * across 10,000+ independent web applications.
 */
export class UniversalFormController {
    /**
     * Initializes the form controller instance with defensive configuration defaults.
     *
     * @param {UniversalFormConfig} [userConfig={}] - Custom project configuration overrides.
     */
    constructor(userConfig = {}) {
        /**
         * @type {Required<UniversalFormConfig>}
         */
        this.config = Object.assign(
            {
                formSelector: "form",
                fieldSelector:
                    ".form-field-wrapper input, .form-field-wrapper select, .form-field-wrapper textarea",
                autoValidate: true,
                customValidators: {},
                lifecycleHooks: {},
            },
            userConfig,
        );

        /** @type {NodeListOf<HTMLElement>|[]} */
        this.fields = [];

        this.init();
    }

    /**
     * =========================================================================
     * WHAT: Core Initialization Lifecycle
     * WHEN: Executes immediately upon class instantiation.
     * WHY:  Discovers DOM nodes and binds event listeners safely without memory leaks.
     * =========================================================================
     */
    init() {
        if (typeof document === "undefined") {
            return; // Safe guard for non-browser environments (SSR / Node.js)
        }

        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", () =>
                this.bindEvents(),
            );
        } else {
            this.bindEvents();
        }
    }

    /**
     * Binds native DOM event listeners across all matching form elements.
     */
    bindEvents() {
        this.fields = document.querySelectorAll(this.config.fieldSelector);

        this.fields.forEach((field) => {
            // Input change listener for state synchronization
            field.addEventListener("input", (event) =>
                this.handleFieldInput(event),
            );

            // Blur listener for real-time validation if enabled
            if (this.config.autoValidate) {
                field.addEventListener("blur", (event) =>
                    this.handleFieldBlur(event),
                );
            }
        });

        // Trigger custom initialization lifecycle hook safely
        if (typeof this.config.lifecycleHooks?.onInit === "function") {
            this.config.lifecycleHooks.onInit(this.fields);
        }
    }

    /**
     * Handles real-time input events on form controls.
     *
     * @param {InputEvent} event - The native input DOM event.
     */
    handleFieldInput(event) {
        /** @type {HTMLElement} */
        const target = /** @type {HTMLElement} */ (event.target);
        const fieldName = target.getAttribute("name") || target.id;

        // FUTURE MODIFICATION POINT: Insert global input sanitization or masking logic here.

        if (typeof this.config.lifecycleHooks?.onInput === "function") {
            this.config.lifecycleHooks.onInput(target, fieldName);
        }
    }

    /**
     * Handles validation checks when focus leaves a form field.
     *
     * @param {FocusEvent} event - The native blur DOM event.
     */
    handleFieldBlur(event) {
        /** @type {HTMLElement} */
        const target = /** @type {HTMLElement} */ (event.target);

        // Example validation check
        if (
            target.hasAttribute("required") &&
            !(/** @type {HTMLInputElement} */ (target).value)
        ) {
            target.classList.add("is-invalid");
        } else {
            target.classList.remove("is-invalid");
        }

        // Execute custom validator if registered safely
        const validationType = target.dataset.validator;
        if (validationType && this.config.customValidators?.[validationType]) {
            const isValid = this.config.customValidators[validationType](
                target,
                /** @type {HTMLInputElement} */ (target).value,
            );
            target.classList.toggle("is-invalid", !isValid);
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
     * 3. Call your new method inside `bindEvents()` or expose it to consuming
     *    projects via the configuration options object.
     * =========================================================================
     */

    /**
     * Public method to programmatically reset form fields and clear error states.
     *
     * @param {string} formId - The HTML ID of the form to reset.
     */
    resetFormState(formId) {
        const formElement = document.getElementById(formId);
        if (formElement instanceof HTMLFormElement) {
            formElement.reset();
            formElement
                .querySelectorAll(".is-invalid")
                .forEach((el) => el.classList.remove("is-invalid"));
        }
    }
}

/**
 * =============================================================================
 * SECTION 2: HOW CONSUMING PROJECTS REFERENCE AND CUSTOMIZE THE MODULE
 * =============================================================================
 * Because your 10,000+ projects may use different build tools (Vite, Webpack,
 * Laravel Mix, or vanilla script tags), the module supports multiple consumption patterns.
 *
 * -----------------------------------------------------------------------------
 * PATTERN A: Modern ES Modules (import in Vite / Webpack / Laravel Mix)
 * -----------------------------------------------------------------------------
 * In your project's main application script (e.g., resources/js/app.js), you
 * import the class and initialize it with custom parameters, validators, or hooks:
 *
 * import { UniversalFormController } from './UniversalFormController.js';
 *
 * const myAppFormController = new UniversalFormController({
 *     formSelector: '#checkout-form',
 *     autoValidate: true,
 *
 *     // Injecting custom project-specific validators
 *     customValidators: {
 *         'uganda-phone': (element, value) => {
 *             // Example: Validate MTN/Airtel phone prefix for Ugandan projects
 *             const ugPhoneRegex = /^(?:\+256|0)(7[0,1,2,5,7,8]\d{7})$/;
 *             return ugPhoneRegex.test(value);
 *         }
 *     },
 *
 *     // Injecting lifecycle hooks without modifying core source code
 *     lifecycleHooks: {
 *         onInit: (fields) => {
 *             console.log(`Successfully hydrated ${fields.length} dynamic form fields across project.`);
 *         },
 *         onInput: (field, name) => {
 *             // Custom analytics or auto-save triggers for this specific project
 *         }
 *     }
 * });
 *
 * // Expose globally if needed by legacy inline scripts
 * window.myAppFormController = myAppFormController;
 *
 * -----------------------------------------------------------------------------
 * PATTERN B: CDN / Direct Browser Script Tag (Zero Build Tools)
 * -----------------------------------------------------------------------------
 * If a specific project doesn't use a bundler, compile the module as an ES module
 * or global script and reference it directly in your Blade layout
 * (resources/views/layouts/app.blade.php):
 *
 * <script type="module">
 *     import { UniversalFormController } from "{{ asset('js/UniversalFormController.js') }}";
 *
 *     document.addEventListener('DOMContentLoaded', () => {
 *         window.formController = new UniversalFormController({
 *             formSelector: '.dynamic-enterprise-form'
 *         });
 *     });
 * </script>
 *
 * =============================================================================
 * SECTION 3: GUIDE TO FUTURE MODIFICATIONS (WHERE AND HOW TO ADD CODE)
 * =============================================================================
 * When scaling across 10,000 projects, you will inevitably need to introduce new
 * features (e.g., automatic Ajax submission, input masking, or error telemetry).
 * Follow these exact boundaries to prevent regressions:
 *
 * 1. Adding Custom Validators: Do not modify UniversalFormController.js core methods.
 *    Instead, pass your custom validation rules dynamically from the consuming project's
 *    initialization script into the customValidators configuration object.
 *
 * 2. Adding New Event Listeners / Interceptors: If a new project requires an extra
 *    DOM event (such as change or focus), go to UniversalFormController.js, locate
 *    the bindEvents() method, and add your listener alongside input and blur.
 *
 * 3. Adding Transformation Helpers: Place data formatting or sanitizing utility
 *    functions inside a dedicated helper file (e.g., formatters.js), import them
 *    into UniversalFormController.js, and invoke them inside handleFieldInput().
 * =============================================================================
 */
