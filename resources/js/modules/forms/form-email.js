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
 * @typedef {Object} DynamicEmailManagerConfig
 * @property {string} [emailSelector] - CSS selector for target email inputs. Default: 'input[type="email"]'
 * @property {boolean} [validateFormat] - Whether to enforce client-side regex email validation. Default: true
 * @property {string[]} [blockedDomains] - Array of prohibited email domains (e.g., disposable domains).
 * @property {Object} [lifecycleHooks] - Custom event lifecycle interceptors.
 * @property {function(NodeListOf<HTMLInputElement>): void} [lifecycleHooks.onInit] - Initialization hook.
 * @property {function(HTMLInputElement, Event): void} [lifecycleHooks.onInput] - Email input change intercept hook.
 */

/**
 * @class DynamicEmailManager
 * @classdesc Enterprise-grade, project-agnostic client-side orchestration engine
 * designed to manage dynamic email input states, multi-value comma separation,
 * regex validation, and blocked domain filtering across 10,000+ independent web applications.
 */
export class DynamicEmailManager {
    /**
     * Initializes the email manager instance with defensive configuration defaults.
     *
     * @param {DynamicEmailManagerConfig} [userConfig={}] - Custom project configuration overrides.
     */
    constructor(userConfig = {}) {
        /**
         * @type {Required<DynamicEmailManagerConfig>}
         */
        this.config = Object.assign(
            {
                emailSelector: 'input[type="email"]',
                validateFormat: true,
                blockedDomains: [],
                lifecycleHooks: {},
            },
            userConfig,
        );

        /** @type {NodeListOf<HTMLInputElement>|[]} */
        this.emailInputs = [];

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
                this.processEmailInputs(),
            );
        } else {
            this.processEmailInputs();
        }
    }

    /**
     * Scans email input elements and attaches listeners for real-time validation.
     */
    processEmailInputs() {
        this.emailInputs = document.querySelectorAll(this.config.emailSelector);

        this.emailInputs.forEach((input) => {
            input.addEventListener("input", (event) =>
                this.handleEmailInput(event),
            );
            input.addEventListener("blur", (event) =>
                this.handleEmailBlur(event),
            );
        });

        // Trigger custom initialization lifecycle hook safely
        if (typeof this.config.lifecycleHooks?.onInit === "function") {
            this.config.lifecycleHooks.onInit(this.emailInputs);
        }
    }

    /**
     * Handles real-time input events across managed email fields.
     *
     * @param {InputEvent} event - The native input DOM event.
     */
    handleEmailInput(event) {
        /** @type {HTMLInputElement} */
        const inputTarget = /** @type {HTMLInputElement} */ (event.target);

        // FUTURE MODIFICATION POINT: Insert live autocomplete suggestions or email normalization logic here.

        if (typeof this.config.lifecycleHooks?.onInput === "function") {
            this.config.lifecycleHooks.onInput(inputTarget, event);
        }
    }

    /**
     * Handles blur events to validate email formatting and domain restrictions.
     *
     * @param {FocusEvent} event - The native blur DOM event.
     */
    handleEmailBlur(event) {
        /** @type {HTMLInputElement} */
        const inputTarget = /** @type {HTMLInputElement} */ (event.target);
        const rawValue = inputTarget.value.trim();

        if (!rawValue) {
            inputTarget.classList.remove("is-invalid");
            return;
        }

        if (this.config.validateFormat) {
            const isValid = inputTarget.multiple
                ? this.validateMultipleEmails(rawValue)
                : this.validateSingleEmail(rawValue);

            inputTarget.classList.toggle("is-invalid", !isValid);
        }
    }

    /**
     * Validates a single email string against standard regex.
     *
     * @param {string} email - Email address string.
     * @returns {boolean} True if valid.
     */
    validateSingleEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return false;
        }

        if (this.config.blockedDomains.length > 0) {
            const domain = email.split("@")[1]?.toLowerCase() || "";
            if (this.config.blockedDomains.includes(domain)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Validates comma-separated multiple email addresses.
     *
     * @param {string} commaSeparatedEmails - Comma-delimited email string.
     * @returns {boolean} True if all emails are valid.
     */
    validateMultipleEmails(commaSeparatedEmails) {
        const emails = commaSeparatedEmails.split(",").map((e) => e.trim());
        return emails.every(
            (email) => email.length > 0 && this.validateSingleEmail(email),
        );
    }

    /**
     * =========================================================================
     * FUTURE MODIFICATIONS & EXTENSIBILITY GUIDE:
     * -------------------------------------------------------------------------
     * TO ADD A NEW METHOD OR BEHAVIOR:
     * 1. Declare your new public or private method right here inside this class block.
     * 2. Ensure all parameters and return types are fully documented using JSDoc
     *    syntax to satisfy strict type checking when "checkJs": true is enabled.
     * 3. Call your new method inside `processEmailInputs()` or expose it to consuming
     *    projects via the configuration options object.
     * =========================================================================
     */

    /**
     * Public method to programmatically reset email inputs.
     *
     * @param {string} inputId - The HTML ID of the email input to reset.
     */
    resetEmailInput(inputId) {
        const targetInput = document.getElementById(inputId);
        if (targetInput instanceof HTMLInputElement) {
            targetInput.value = "";
            targetInput.classList.remove("is-invalid");
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
 * import the class and initialize it with custom parameters or blocked domains:
 *
 * import { DynamicEmailManager } from './DynamicEmailManager.js';
 *
 * const myEmailManager = new DynamicEmailManager({
 *     emailSelector: 'input[type="email"].enterprise-email-field',
 *     validateFormat: true,
 *
 *     // Injecting project-specific blocked disposable email domains
 *     blockedDomains: ['tempmail.com', 'mailinator.com', '10minutemail.com'],
 *
 *     // Injecting lifecycle hooks without modifying core source code
 *     lifecycleHooks: {
 *         onInit: (inputs) => {
 *             console.log(`Email validation manager active across ${inputs.length} fields.`);
 *         },
 *         onInput: (input, event) => {
 *             // Custom analytics or formatting trigger for this project
 *         }
 *     }
 * });
 *
 * // Expose globally if needed by legacy inline scripts
 * window.myEmailManager = myEmailManager;
 *
 * -----------------------------------------------------------------------------
 * PATTERN B: CDN / Direct Browser Script Tag (Zero Build Tools)
 * -----------------------------------------------------------------------------
 * If a specific project doesn't use a bundler, compile the module as an ES module
 * or global script and reference it directly in your Blade layout
 * (resources/views/layouts/app.blade.php):
 *
 * <script type="module">
 *     import { DynamicEmailManager } from "{{ asset('js/DynamicEmailManager.js') }}";
 *
 *     document.addEventListener('DOMContentLoaded', () => {
 *         window.emailManager = new DynamicEmailManager({
 *             emailSelector: '#contact-email'
 *         });
 *     });
 * </script>
 *
 * =============================================================================
 * SECTION 3: GUIDE TO FUTURE MODIFICATIONS (WHERE AND HOW TO ADD CODE)
 * =============================================================================
 * When scaling across 10,000 projects, you will inevitably need to introduce new
 * features (e.g., MX record lookups or gravatar preview integration).
 * Follow these exact boundaries to prevent regressions:
 *
 * 1. Adding Configurations: Do not modify DynamicEmailManager.js core methods.
 *    Instead, pass your custom validation rules or domain blocklists dynamically
 *    from the consuming project's initialization script into the configuration object.
 *
 * 2. Adding New Event Listeners: If a new project requires handling additional
 *    events (such as 'focus' or 'change'), go to DynamicEmailManager.js, locate
 *    the processEmailInputs() method, and add your listeners alongside existing events.
 *
 * 3. Adding Validation Helpers: Place advanced regex or third-party verification utility
 *    functions inside a dedicated helper file (e.g., emailValidators.js), import them
 *    into DynamicEmailManager.js, and invoke them inside handleEmailBlur() or validateSingleEmail().
 * =============================================================================
 */
