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
 * @typedef {Object} UniversalButtonManagerConfig
 * @property {string} [buttonSelector] - CSS selector for target universal button components. Default: 'button[data-hub-target], .universal-btn'
 * @property {boolean} [enableTooltips] - Whether to initialize data-hint tooltips or accessibility descriptions. Default: true
 * @property {Record<string, Array<string>>} [fieldDependencies] - Map of custom field array bindings per button ID.
 * @property {Object} [lifecycleHooks] - Custom event lifecycle interceptors.
 * @property {function(NodeListOf<HTMLButtonElement>): void} [lifecycleHooks.onInit] - Initialization hook.
 * @property {function(HTMLButtonElement, MouseEvent, Record<string, any>): void} [lifecycleHooks.onClick] - Click event intercept hook with metadata.
 */

/**
 * @class UniversalButtonManager
 * @classdesc Enterprise-grade, project-agnostic client-side orchestration engine
 * designed to manage universal buttons, tooltips/hints, field dependencies, variants,
 * and lifecycle event handlers across 10,000+ independent web applications.
 */
export class UniversalButtonManager {
    /**
     * Initializes the universal button manager instance with defensive configuration defaults.
     *
     * @param {UniversalButtonManagerConfig} [userConfig={}] - Custom project configuration overrides.
     */
    constructor(userConfig = {}) {
        /**
         * @type {Required<UniversalButtonManagerConfig>}
         */
        this.config = Object.assign(
            {
                buttonSelector: "button[data-hub-target], .universal-btn",
                enableTooltips: true,
                fieldDependencies: {},
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
     * WHY:  Discovers button DOM nodes, parses custom metadata, and binds click handlers safely.
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
     * Scans universal button elements, extracts custom data properties, and attaches event listeners.
     */
    processButtons() {
        this.buttons = document.querySelectorAll(this.config.buttonSelector);

        this.buttons.forEach((btnEl) => {
            /** @type {HTMLButtonElement} */
            const buttonElement = /** @type {HTMLButtonElement} */ (btnEl);
            const buttonId = buttonElement.id;
            const buttonType = buttonElement.type;
            const hintText = buttonElement.getAttribute("data-hint");

            // Handle tooltip/hint enhancement if enabled
            if (
                this.config.enableTooltips &&
                hintText &&
                !buttonElement.getAttribute("title")
            ) {
                buttonElement.setAttribute("title", hintText);
            }

            // Extract associated fields if defined via dataset or global config
            const datasetFields = buttonElement.getAttribute("data-fields");

            /** @type {string[]|any[]} */
            let fieldsList = [];

            if (datasetFields) {
                try {
                    fieldsList = /** @type {any[]} */ (
                        JSON.parse(datasetFields)
                    );
                } catch (e) {
                    fieldsList = datasetFields.split(",").map((f) => f.trim());
                }
            } else if (buttonId && this.config.fieldDependencies?.[buttonId]) {
                fieldsList = this.config.fieldDependencies[buttonId];
            }

            // Attach click event orchestration
            buttonElement.addEventListener("click", (event) => {
                const metadata = {
                    buttonId: buttonId,
                    buttonType: buttonType,
                    variant:
                        buttonElement.getAttribute("data-variant") || "default",
                    fields: fieldsList,
                    hint: hintText,
                };

                // FUTURE MODIFICATION POINT: Insert custom form validation, field dependency checks, or telemetry logging here.

                if (typeof this.config.lifecycleHooks?.onClick === "function") {
                    this.config.lifecycleHooks.onClick(
                        buttonElement,
                        event,
                        metadata,
                    );
                }
            });
        });

        // Trigger custom initialization lifecycle hook safely
        if (typeof this.config.lifecycleHooks?.onInit === "function") {
            this.config.lifecycleHooks.onInit(this.buttons);
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
     * Public method to programmatically trigger a button click or inspect its configuration state.
     *
     * @param {string} buttonId - The HTML ID of the target button element.
     */
    triggerButton(buttonId) {
        /** @type {HTMLButtonElement|null} */
        const targetButton = /** @type {HTMLButtonElement|null} */ (
            document.getElementById(buttonId)
        );
        if (targetButton instanceof HTMLButtonElement) {
            targetButton.click();
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
 * import the class and initialize it with custom parameters or hooks handling
 * all component custom props (`id`, `type`, `variant`, `label`, `icon`, `fields`, `buttonRole`):
 *
 * import { UniversalButtonManager } from './UniversalButtonManager.js';
 *
 * const myButtonManager = new UniversalButtonManager({
 *     buttonSelector: 'button[data-hub-target]',
 *     enableTooltips: true,
 *
 *     // Passing custom field dependencies corresponding to component props
 *     fieldDependencies: {
 *         'save-user-btn': ['name', 'email', 'role']
 *     },
 *
 *     // Injecting lifecycle hooks without modifying core source code
 *     lifecycleHooks: {
 *         onInit: (buttons) => {
 *             console.log(`Universal button manager active across ${buttons.length} elements.`);
 *         },
 *         onClick: (button, event, metadata) => {
 *             console.log('Button clicked with metadata:', metadata);
 *
 *             // Example: Inspecting associated fields passed via :fields prop
 *             if (metadata.fields && metadata.fields.length > 0) {
 *                 console.log('Validating dependent form fields:', metadata.fields);
 *             }
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
 *     import { UniversalButtonManager } from "{{ asset('js/UniversalButtonManager.js') }}";
 *
 *     document.addEventListener('DOMContentLoaded', () => {
 *         window.buttonManager = new UniversalButtonManager({
 *             buttonSelector: '#save-user-btn'
 *         });
 *     });
 * </script>
 *
 * =============================================================================
 * SECTION 3: GUIDE TO FUTURE MODIFICATIONS (WHERE AND HOW TO ADD CODE)
 * =============================================================================
 * When scaling across 10,000 projects, you will inevitably need to introduce new
 * features (e.g., automated loading spinners based on button variants or AJAX dispatch).
 * Follow these exact boundaries to prevent regressions:
 *
 * 1. Adding Configurations: Do not modify UniversalButtonManager.js core methods.
 *    Instead, pass your custom dictionaries or settings dynamically from the consuming
 *    project's initialization script into the configuration object.
 *
 * 2. Adding New Event Listeners: If a new project requires handling additional
 *    events (such as hover state animations or mousedown triggers), go to
 *    UniversalButtonManager.js, locate the processButtons() method, and attach your listener logic.
 *
 * 3. Adding Formatting Helpers: Place custom metadata parsing or validation utility
 *    functions inside a dedicated helper file (e.g., buttonFormatters.js), import them
 *    into UniversalButtonManager.js, and invoke them inside processButtons() or onClick().
 * =============================================================================
 */
