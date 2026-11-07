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
 * @typedef {Object} DynamicTextareaManagerConfig
 * @property {string} [textareaSelector] - CSS selector for target textareas. Default: 'textarea'
 * @property {boolean} [autoResize] - Whether to automatically adjust textarea height on input. Default: true
 * @property {number} [maxRows] - Maximum row limit for auto-resizing. Default: 10
 * @property {Object} [lifecycleHooks] - Custom event lifecycle interceptors.
 * @property {function(NodeListOf<HTMLTextAreaElement>): void} [lifecycleHooks.onInit] - Initialization hook.
 * @property {function(HTMLTextAreaElement, InputEvent): void} [lifecycleHooks.onInput] - Input change intercept hook.
 */

/**
 * @class DynamicTextareaManager
 * @classdesc Enterprise-grade, project-agnostic client-side orchestration engine
 * designed to manage dynamic textarea states, character limits, auto-resizing,
 * and value synchronization across 10,000+ independent web applications.
 */
export class DynamicTextareaManager {
    /**
     * Initializes the textarea manager instance with defensive configuration defaults.
     *
     * @param {DynamicTextareaManagerConfig} [userConfig={}] - Custom project configuration overrides.
     */
    constructor(userConfig = {}) {
        /**
         * @type {Required<DynamicTextareaManagerConfig>}
         */
        this.config = Object.assign(
            {
                textareaSelector: "textarea",
                autoResize: true,
                maxRows: 10,
                lifecycleHooks: {},
            },
            userConfig,
        );

        /** @type {NodeListOf<HTMLTextAreaElement>|[]} */
        this.textareas = [];

        this.init();
    }

    /**
     * =========================================================================
     * WHAT: Core Initialization Lifecycle
     * WHEN: Executes immediately upon class instantiation.
     * WHY:  Discovers DOM nodes and binds resize and input listeners safely.
     * =========================================================================
     */
    init() {
        if (typeof document === "undefined") {
            return; // Safe guard for non-browser environments (SSR / Node.js)
        }

        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", () =>
                this.processTextareas(),
            );
        } else {
            this.processTextareas();
        }
    }

    /**
     * Scans textareas and attaches event listeners according to configuration rules.
     */
    processTextareas() {
        this.textareas = document.querySelectorAll(
            this.config.textareaSelector,
        );

        this.textareas.forEach((textarea) => {
            if (this.config.autoResize) {
                // Initial resize calculation on load
                this.adjustHeight(textarea);
                textarea.addEventListener("input", (event) =>
                    this.handleTextareaInput(event),
                );
            }
        });

        // Trigger custom initialization lifecycle hook safely
        if (typeof this.config.lifecycleHooks?.onInit === "function") {
            this.config.lifecycleHooks.onInit(this.textareas);
        }
    }

    /**
     * Handles input events across managed textareas.
     *
     * @param {InputEvent} event - The native input DOM event.
     */
    handleTextareaInput(event) {
        /** @type {HTMLTextAreaElement} */
        const textareaTarget = /** @type {HTMLTextAreaElement} */ (
            event.target
        );

        if (this.config.autoResize) {
            this.adjustHeight(textareaTarget);
        }

        // FUTURE MODIFICATION POINT: Insert character counting, live markdown preview, or auto-save logging here.

        if (typeof this.config.lifecycleHooks?.onInput === "function") {
            this.config.lifecycleHooks.onInput(textareaTarget, event);
        }
    }

    /**
     * Dynamically adjusts the height of a textarea based on its scroll height.
     *
     * @param {HTMLTextAreaElement} textarea - The target textarea element.
     */
    adjustHeight(textarea) {
        textarea.style.height = "auto";
        textarea.style.height = `${textarea.scrollHeight}px`;
    }

    /**
     * =========================================================================
     * FUTURE MODIFICATIONS & EXTENSIBILITY GUIDE:
     * -------------------------------------------------------------------------
     * TO ADD A NEW METHOD OR BEHAVIOR:
     * 1. Declare your new public or private method right here inside this class block.
     * 2. Ensure all parameters and return types are fully documented using JSDoc
     *    syntax to satisfy strict type checking when "checkJs": true is enabled.
     * 3. Call your new method inside `processTextareas()` or expose it to consuming
     *    projects via the configuration options object.
     * =========================================================================
     */

    /**
     * Public method to programmatically reset textarea content and height.
     *
     * @param {string} textareaId - The HTML ID of the textarea to reset.
     */
    resetTextarea(textareaId) {
        const targetTextarea = document.getElementById(textareaId);
        if (targetTextarea instanceof HTMLTextAreaElement) {
            targetTextarea.value = "";
            this.adjustHeight(targetTextarea);
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
 * import { DynamicTextareaManager } from './DynamicTextareaManager.js';
 *
 * const myTextareaManager = new DynamicTextareaManager({
 *     textareaSelector: 'textarea.enterprise-auto-resize',
 *     autoResize: true,
 *     maxRows: 15,
 *
 *     // Injecting lifecycle hooks without modifying core source code
 *     lifecycleHooks: {
 *         onInit: (textareas) => {
 *             console.log(`Auto-resize initialized across ${textareas.length} textareas.`);
 *         },
 *         onInput: (textarea, event) => {
 *             // Custom character tracking or draft saving for this project
 *         }
 *     }
 * });
 *
 * // Expose globally if needed by legacy inline scripts
 * window.myTextareaManager = myTextareaManager;
 *
 * -----------------------------------------------------------------------------
 * PATTERN B: CDN / Direct Browser Script Tag (Zero Build Tools)
 * -----------------------------------------------------------------------------
 * If a specific project doesn't use a bundler, compile the module as an ES module
 * or global script and reference it directly in your Blade layout
 * (resources/views/layouts/app.blade.php):
 *
 * <script type="module">
 *     import { DynamicTextareaManager } from "{{ asset('js/DynamicTextareaManager.js') }}";
 *
 *     document.addEventListener('DOMContentLoaded', () => {
 *         window.textareaManager = new DynamicTextareaManager({
 *             textareaSelector: '#bio-textarea'
 *         });
 *     });
 * </script>
 *
 * =============================================================================
 * SECTION 3: GUIDE TO FUTURE MODIFICATIONS (WHERE AND HOW TO ADD CODE)
 * =============================================================================
 * When scaling across 10,000 projects, you will inevitably need to introduce new
 * features (e.g., maximum character countdowns or rich text editor bindings).
 * Follow these exact boundaries to prevent regressions:
 *
 * 1. Adding Configurations: Do not modify DynamicTextareaManager.js core methods.
 *    Instead, pass your custom thresholds or parameters dynamically from the consuming
 *    project's initialization script into the configuration object.
 *
 * 2. Adding New Event Listeners: If a new project requires handling additional
 *    events (such as 'focus' or 'blur'), go to DynamicTextareaManager.js, locate
 *    the processTextareas() method, and add your listener alongside the 'input' event.
 *
 * 3. Adding Transformation Helpers: Place text sanitization or markdown parsing utility
 *    functions inside a dedicated helper file (e.g., textFormatters.js), import them
 *    into DynamicTextareaManager.js, and invoke them inside handleTextareaInput().
 * =============================================================================
 */
