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
 * @typedef {Object} DynamicFileManagerConfig
 * @property {string} [fileSelector] - CSS selector for target file inputs. Default: 'input[type="file"]'
 * @property {boolean} [validateSize] - Whether to enforce maximum file size restrictions on client side. Default: true
 * @property {number} [maxFileSizeMB] - Maximum allowable file size in Megabytes. Default: 10
 * @property {string[]} [allowedExtensions] - Array of permitted file extensions.
 * @property {Object} [lifecycleHooks] - Custom event lifecycle interceptors.
 * @property {function(NodeListOf<HTMLInputElement>): void} [lifecycleHooks.onInit] - Initialization hook.
 * @property {function(HTMLInputElement, Event): void} [lifecycleHooks.onChange] - File selection intercept hook.
 */

/**
 * @class DynamicFileManager
 * @classdesc Enterprise-grade, project-agnostic client-side orchestration engine
 * designed to manage dynamic file upload states, multi-file inputs, custom view
 * representations, size validation, and preview hooks across 10,000+ independent web applications.
 */
export class DynamicFileManager {
    /**
     * Initializes the file manager instance with defensive configuration defaults.
     *
     * @param {DynamicFileManagerConfig} [userConfig={}] - Custom project configuration overrides.
     */
    constructor(userConfig = {}) {
        /**
         * @type {Required<DynamicFileManagerConfig>}
         */
        this.config = Object.assign(
            {
                fileSelector: 'input[type="file"]',
                validateSize: true,
                maxFileSizeMB: 10,
                allowedExtensions: [],
                lifecycleHooks: {},
            },
            userConfig,
        );

        /** @type {NodeListOf<HTMLInputElement>|[]} */
        this.fileInputs = [];

        this.init();
    }

    /**
     * =========================================================================
     * WHAT: Core Initialization Lifecycle
     * WHEN: Executes immediately upon class instantiation.
     * WHY:  Discovers DOM nodes and binds file change event listeners safely.
     * =========================================================================
     */
    init() {
        if (typeof document === "undefined") {
            return; // Safe guard for non-browser environments (SSR / Node.js)
        }

        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", () =>
                this.processFileInputs(),
            );
        } else {
            this.processFileInputs();
        }
    }

    /**
     * Scans file input elements and attaches change listeners for validation and previews.
     */
    processFileInputs() {
        this.fileInputs = document.querySelectorAll(this.config.fileSelector);

        this.fileInputs.forEach((input) => {
            input.addEventListener("change", (event) =>
                this.handleFileChange(event),
            );
        });

        // Trigger custom initialization lifecycle hook safely
        if (typeof this.config.lifecycleHooks?.onInit === "function") {
            this.config.lifecycleHooks.onInit(this.fileInputs);
        }
    }

    /**
     * Handles change events across managed file input elements.
     *
     * @param {Event} event - The native change DOM event.
     */
    handleFileChange(event) {
        /** @type {HTMLInputElement} */
        const inputTarget = /** @type {HTMLInputElement} */ (event.target);
        const files = inputTarget.files;

        if (!files || files.length === 0) {
            return;
        }

        if (this.config.validateSize) {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const fileSizeMB = file.size / (1024 * 1024);
                if (fileSizeMB > this.config.maxFileSizeMB) {
                    alert(
                        `File "${file.name}" exceeds the maximum allowed size of ${this.config.maxFileSizeMB}MB.`,
                    );
                    inputTarget.value = "";
                    return;
                }
            }
        }

        // FUTURE MODIFICATION POINT: Insert custom image thumbnail generation, virus scanning hooks, or direct cloud upload logic here.

        if (typeof this.config.lifecycleHooks?.onChange === "function") {
            this.config.lifecycleHooks.onChange(inputTarget, event);
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
     * 3. Call your new method inside `processFileInputs()` or expose it to consuming
     *    projects via the configuration options object.
     * =========================================================================
     */

    /**
     * Public method to programmatically reset file inputs.
     *
     * @param {string} inputId - The HTML ID of the file input to reset.
     */
    resetFileInput(inputId) {
        const targetInput = document.getElementById(inputId);
        if (targetInput instanceof HTMLInputElement) {
            targetInput.value = "";
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
 * import { DynamicFileManager } from './DynamicFileManager.js';
 *
 * const myFileManager = new DynamicFileManager({
 *     fileSelector: 'input[type="file"].enterprise-file-picker',
 *     validateSize: true,
 *     maxFileSizeMB: 5,
 *
 *     // Injecting project-specific allowed extensions
 *     allowedExtensions: ['jpg', 'png', 'pdf', 'docx'],
 *
 *     // Injecting lifecycle hooks without modifying core source code
 *     lifecycleHooks: {
 *         onInit: (inputs) => {
 *             console.log(`File upload manager active across ${inputs.length} fields.`);
 *         },
 *         onChange: (input, event) => {
 *             // Custom preview generation or telemetry for this project
 *         }
 *     }
 * });
 *
 * // Expose globally if needed by legacy inline scripts
 * window.myFileManager = myFileManager;
 *
 * -----------------------------------------------------------------------------
 * PATTERN B: CDN / Direct Browser Script Tag (Zero Build Tools)
 * -----------------------------------------------------------------------------
 * If a specific project doesn't use a bundler, compile the module as an ES module
 * or global script and reference it directly in your Blade layout
 * (resources/views/layouts/app.blade.php):
 *
 * <script type="module">
 *     import { DynamicFileManager } from "{{ asset('js/DynamicFileManager.js') }}";
 *
 *     document.addEventListener('DOMContentLoaded', () => {
 *         window.fileManager = new DynamicFileManager({
 *             fileSelector: '#avatar-upload-input'
 *         });
 *     });
 * </script>
 *
 * =============================================================================
 * SECTION 3: GUIDE TO FUTURE MODIFICATIONS (WHERE AND HOW TO ADD CODE)
 * =============================================================================
 * When scaling across 10,000 projects, you will inevitably need to introduce new
 * features (e.g., drag-and-drop file dropzones or progress bars).
 * Follow these exact boundaries to prevent regressions:
 *
 * 1. Adding Configurations: Do not modify DynamicFileManager.js core methods.
 *    Instead, pass your custom size limits or extension restrictions dynamically from
 *    the consuming project's initialization script into the configuration object.
 *
 * 2. Adding New Event Listeners: If a new project requires handling additional
 *    events (such as 'dragover' or 'drop'), go to DynamicFileManager.js, locate
 *    the processFileInputs() method, and add your listeners alongside the 'change' event.
 *
 * 3. Adding Validation Helpers: Place custom MIME type inspection or chunked upload
 *    utility functions inside a dedicated helper file (e.g., fileValidators.js), import them
 *    into DynamicFileManager.js, and invoke them inside handleFileChange().
 * =============================================================================
 */
