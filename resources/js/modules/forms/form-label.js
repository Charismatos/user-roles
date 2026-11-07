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
 * @typedef {Object} FieldLabelConfig
 * @property {string} [containerSelector] - CSS selector for field wrapper elements. Default: '.form-field-wrapper'
 * @property {string} [inputSelector] - CSS selector for inner input controls. Default: 'input, select, textarea'
 * @property {string[]} [excludedTypes] - Field types that should omit automatic label generation.
 * @property {boolean} [autoGenerateLabels] - Whether to dynamically inject missing labels on client-side render. Default: true
 * @property {Object} [lifecycleHooks] - Custom event lifecycle interceptors.
 * @property {function(NodeListOf<HTMLElement>): void} [lifecycleHooks.onInit] - Initialization hook.
 * @property {function(HTMLElement, string): void} [lifecycleHooks.onLabelInjected] - Label injection hook.
 */

/**
 * @class DynamicFieldLabelManager
 * @classdesc Enterprise-grade, project-agnostic client-side orchestration engine
 * designed to manage dynamic form field label hydration, type exclusions, and
 * accessibility rules across 10,000+ independent web applications.
 */
export class DynamicFieldLabelManager {
    /**
     * Initializes the label manager instance with defensive configuration defaults.
     *
     * @param {FieldLabelConfig} [userConfig={}] - Custom project configuration overrides.
     */
    constructor(userConfig = {}) {
        /**
         * @type {Required<FieldLabelConfig>}
         */
        this.config = Object.assign(
            {
                containerSelector: ".form-field-wrapper",
                inputSelector: "input, select, textarea",
                excludedTypes: [
                    "hidden",
                    "checkbox",
                    "radio",
                    "button",
                    "submit",
                    "reset",
                    "fieldset",
                    "form",
                    "image",
                ],
                autoGenerateLabels: true,
                lifecycleHooks: {},
            },
            userConfig,
        );

        /** @type {NodeListOf<HTMLElement>|[]} */
        this.containers = [];

        this.init();
    }

    /**
     * =========================================================================
     * WHAT: Core Initialization Lifecycle
     * WHEN: Executes immediately upon class instantiation.
     * WHY:  Discovers DOM nodes and evaluates label rendering logic safely.
     * =========================================================================
     */
    init() {
        if (typeof document === "undefined") {
            return; // Safe guard for non-browser environments (SSR / Node.js)
        }

        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", () =>
                this.processContainers(),
            );
        } else {
            this.processContainers();
        }
    }

    /**
     * Scans containers and handles label rendering rules based on field types.
     */
    processContainers() {
        this.containers = document.querySelectorAll(
            this.config.containerSelector,
        );

        this.containers.forEach((container) => {
            /** @type {HTMLElement|null} */
            const inputElement = container.querySelector(
                this.config.inputSelector,
            );

            if (!inputElement) {
                return;
            }

            const fieldType =
                inputElement.getAttribute("type") ||
                inputElement.tagName.toLowerCase();
            const hasExistingLabel = container.querySelector("label");

            // Enforce exclusion rules matching server-side Blade logic
            if (
                this.config.autoGenerateLabels &&
                !hasExistingLabel &&
                !this.isExcludedType(fieldType)
            ) {
                this.injectLabel(container, inputElement);
            }
        });

        // Trigger custom initialization lifecycle hook safely
        if (typeof this.config.lifecycleHooks?.onInit === "function") {
            this.config.lifecycleHooks.onInit(this.containers);
        }
    }

    /**
     * Checks if a field type matches the server-side exclusion criteria.
     *
     * @param {string} type - The HTML element type or tag name.
     * @returns {boolean} True if the type should omit a label.
     */
    isExcludedType(type) {
        return this.config.excludedTypes.includes(type.toLowerCase());
    }

    /**
     * Dynamically injects a accessible label element into the container.
     *
     * @param {HTMLElement} container - The wrapper DOM element.
     * @param {HTMLElement} inputElement - The target input control.
     */
    injectLabel(container, inputElement) {
        const fieldName =
            inputElement.getAttribute("name") || inputElement.id || "field";
        const formattedLabelText = this.formatLabelText(fieldName);
        const targetId =
            inputElement.id ||
            `field_${Math.random().toString(36).substring(2, 9)}`;

        if (!inputElement.id) {
            inputElement.id = targetId;
        }

        const labelElement = document.createElement("label");
        labelElement.setAttribute("for", targetId);
        labelElement.textContent = formattedLabelText;

        // Prepend label inside the container wrapper
        container.prepend(labelElement);

        // FUTURE MODIFICATION POINT: Insert custom wrapper class additions or telemetry tracking here.

        if (typeof this.config.lifecycleHooks?.onLabelInjected === "function") {
            this.config.lifecycleHooks.onLabelInjected(labelElement, fieldName);
        }
    }

    /**
     * Converts a raw field name string into a human-readable title case label.
     *
     * @param {string} name - The raw attribute name (e.g., 'user_email').
     * @returns {string} Formatted label text (e.g., 'User Email').
     */
    formatLabelText(name) {
        return name
            .replace(/([-_\[\]])+/g, " ")
            .replace(/([a-z])([A-Z])/g, "$1 $2")
            .replace(/^./, (str) => str.toUpperCase())
            .trim();
    }

    /**
     * =========================================================================
     * FUTURE MODIFICATIONS & EXTENSIBILITY GUIDE:
     * -------------------------------------------------------------------------
     * TO ADD A NEW METHOD OR BEHAVIOR:
     * 1. Declare your new public or private method right here inside this class block.
     * 2. Ensure all parameters and return types are fully documented using JSDoc
     *    syntax to satisfy strict type checking when "checkJs": true is enabled.
     * 3. Call your new method inside `processContainers()` or expose it to consuming
     *    projects via the configuration options object.
     * =========================================================================
     */

    /**
     * Public method to programmatically re-scan and hydrate container labels.
     */
    refreshLabels() {
        this.processContainers();
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
 * import the class and initialize it with custom parameters, validators, or hooks:
 *
 * import { DynamicFieldLabelManager } from './DynamicFieldLabelManager.js';
 *
 * const myLabelManager = new DynamicFieldLabelManager({
 *     containerSelector: '.form-field-wrapper',
 *     autoGenerateLabels: true,
 *
 *     // Injecting custom excluded types specific to this project
 *     excludedTypes: ['hidden', 'checkbox', 'radio', 'button', 'submit', 'reset', 'fieldset', 'form', 'image', 'custom-slider'],
 *
 *     // Injecting lifecycle hooks without modifying core source code
 *     lifecycleHooks: {
 *         onInit: (containers) => {
 *             console.log(`Successfully managed labels across ${containers.length} containers.`);
 *         },
 *         onLabelInjected: (label, name) => {
 *             label.classList.add('dynamic-hydrated-label');
 *         }
 *     }
 * });
 *
 * // Expose globally if needed by legacy inline scripts
 * window.myLabelManager = myLabelManager;
 *
 * -----------------------------------------------------------------------------
 * PATTERN B: CDN / Direct Browser Script Tag (Zero Build Tools)
 * -----------------------------------------------------------------------------
 * If a specific project doesn't use a bundler, compile the module as an ES module
 * or global script and reference it directly in your Blade layout
 * (resources/views/layouts/app.blade.php):
 *
 * <script type="module">
 *     import { DynamicFieldLabelManager } from "{{ asset('js/DynamicFieldLabelManager.js') }}";
 *
 *     document.addEventListener('DOMContentLoaded', () => {
 *         window.labelManager = new DynamicFieldLabelManager({
 *             containerSelector: '.custom-form-wrapper'
 *         });
 *     });
 * </script>
 *
 * =============================================================================
 * SECTION 3: GUIDE TO FUTURE MODIFICATIONS (WHERE AND HOW TO ADD CODE)
 * =============================================================================
 * When scaling across 10,000 projects, you will inevitably need to introduce new
 * features (e.g., custom tooltip generation or internationalization support).
 * Follow these exact boundaries to prevent regressions:
 *
 * 1. Adding Exclusions: Do not modify DynamicFieldLabelManager.js core methods.
 *    Instead, pass your custom exclusions dynamically from the consuming project's
 *    initialization script into the excludedTypes configuration array.
 *
 * 2. Adding New DOM Inspection Rules: If a new project requires inspecting additional
 *    attributes before label generation, go to DynamicFieldLabelManager.js, locate
 *    the processContainers() method, and insert your conditional checks alongside
 *    existing validation logic.
 *
 * 3. Adding Text Formatters: Place localization or string transformation utility
 *    functions inside a dedicated helper file (e.g., labelFormatters.js), import them
 *    into DynamicFieldLabelManager.js, and invoke them inside formatLabelText().
 * =============================================================================
 */
