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
 * - URL   : Uniform Resource Locator
 * =============================================================================
 */

/**
 * @typedef {Object} UniversalBodyManagerConfig
 * @property {string} [bodySelector] - CSS selector for target body elements. Default: 'body[data-hub-target], body.universal-body, body'
 * @property {boolean} [enhanceNative] - Whether to apply dynamic background styling or observation handlers. Default: true
 * @property {Record<string, Record<string, any>>} [bodyMetadataMap] - Map of custom metadata per body element ID.
 * @property {Object} [lifecycleHooks] - Custom event lifecycle interceptors.
 * @property {function(NodeListOf<HTMLBodyElement>): void} [lifecycleHooks.onInit] - Initialization hook.
 * @property {function(HTMLBodyElement, Record<string, any>): void} [lifecycleHooks.onRender] - Render intercept hook with metadata.
 */

/**
 * @class UniversalBodyManager
 * @classdesc Enterprise-grade, project-agnostic client-side orchestration engine
 * designed to manage universal document body background attributes, fallback colors,
 * metadata inspection, and lifecycle event handlers across 10,000+ independent web applications.
 */
export class UniversalBodyManager {
    /**
     * Initializes the universal body manager instance with defensive configuration defaults.
     *
     * @param {UniversalBodyManagerConfig} [userConfig={}] - Custom project configuration overrides.
     */
    constructor(userConfig = {}) {
        /**
         * @type {Required<UniversalBodyManagerConfig>}
         */
        this.config = Object.assign(
            {
                bodySelector:
                    "body[data-hub-target], body.universal-body, body",
                enhanceNative: true,
                bodyMetadataMap: {},
                lifecycleHooks: {},
            },
            userConfig,
        );

        /** @type {NodeListOf<HTMLBodyElement>|[]} */
        this.bodies = [];

        this.init();
    }

    /**
     * =========================================================================
     * WHAT: Core Initialization Lifecycle
     * WHEN: Executes immediately upon class instantiation.
     * WHY:  Discovers document body DOM nodes, parses background attributes, and binds handlers safely.
     * =========================================================================
     */
    init() {
        if (typeof document === "undefined") {
            return; // Safe guard for non-browser environments (SSR / Node.js)
        }

        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", () =>
                this.processBodies(),
            );
        } else {
            this.processBodies();
        }
    }

    /**
     * Scans universal body elements, extracts background properties, and triggers lifecycle callbacks.
     */
    processBodies() {
        this.bodies = document.querySelectorAll(this.config.bodySelector);

        this.bodies.forEach((bodyEl) => {
            /** @type {HTMLBodyElement} */
            const bodyElement = /** @type {HTMLBodyElement} */ (bodyEl);
            const bodyId = bodyElement.id;

            /** @type {string|null} */
            const backgroundAttr = bodyElement.getAttribute("background");
            /** @type {string|null} */
            const bgcolorAttr = bodyElement.getAttribute("bgcolor");

            // Extract custom metadata or fallbacks
            /** @type {Record<string, any>} */
            let customMetadata = {};
            if (bodyId && this.config.bodyMetadataMap?.[bodyId]) {
                customMetadata = this.config.bodyMetadataMap[bodyId];
            }

            // Apply background property mapping if enhanceNative is true
            if (this.config.enhanceNative) {
                if (
                    backgroundAttr &&
                    !bodyElement.style.backgroundImage &&
                    !bodyElement.style.background
                ) {
                    if (
                        backgroundAttr.includes("url(") ||
                        backgroundAttr.includes("gradient(")
                    ) {
                        bodyElement.style.background = backgroundAttr;
                    } else {
                        bodyElement.style.backgroundColor = backgroundAttr;
                    }
                }
                if (bgcolorAttr && !bodyElement.style.backgroundColor) {
                    bodyElement.style.backgroundColor = bgcolorAttr;
                }
            }

            const metadata = Object.assign(
                {
                    bodyId: bodyId,
                    background: backgroundAttr,
                    bgcolor: bgcolorAttr,
                },
                customMetadata,
            );

            // FUTURE MODIFICATION POINT: Insert custom theme observers, background transition animations, or telemetry logging here.

            if (typeof this.config.lifecycleHooks?.onRender === "function") {
                this.config.lifecycleHooks.onRender(bodyElement, metadata);
            }
        });

        // Trigger custom initialization lifecycle hook safely
        if (typeof this.config.lifecycleHooks?.onInit === "function") {
            this.config.lifecycleHooks.onInit(this.bodies);
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
     * 3. Call your new method inside `processBodies()` or expose it to consuming
     *    projects via the configuration options object.
     * =========================================================================
     */

    /**
     * Public method to programmatically update a document body's background properties.
     *
     * @param {string} bodyId - The HTML ID of the target body element.
     * @param {string} newBackground - The new background value (color, gradient, or image URL).
     */
    updateBodyBackground(bodyId, newBackground) {
        /** @type {HTMLBodyElement|null} */
        const targetBody = /** @type {HTMLBodyElement|null} */ (
            document.getElementById(bodyId)
        );
        if (targetBody instanceof HTMLBodyElement) {
            targetBody.setAttribute("background", newBackground);
            if (
                newBackground.includes("url(") ||
                newBackground.includes("gradient(")
            ) {
                targetBody.style.background = newBackground;
            } else {
                targetBody.style.backgroundColor = newBackground;
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
 * import the class and initialize it with custom parameters or hooks handling
 * all component custom props (`background`, `bgcolor`):
 *
 * import { UniversalBodyManager } from './UniversalBodyManager.js';
 *
 * const myBodyManager = new UniversalBodyManager({
 *     bodySelector: 'body[data-hub-target]',
 *     enhanceNative: true,
 *
 *     // Passing custom metadata corresponding to component props per body ID
 *     bodyMetadataMap: {
 *         'app-root-body': { theme: 'light', env: 'production' }
 *     },
 *
 *     // Injecting lifecycle hooks without modifying core source code
 *     lifecycleHooks: {
 *         onInit: (bodies) => {
 *             console.log(`Universal body manager active across ${bodies.length} document bodies.`);
 *         },
 *         onRender: (body, metadata) => {
 *             console.log('Document body rendered with background attributes:', metadata);
 *
 *             // Example: Handling specific prop behaviors (e.g., background styling checks)
 *             if (metadata.background) {
 *                 console.log('Applied active body background property:', metadata.background);
 *             }
 *         }
 *     }
 * });
 *
 * // Expose globally if needed by legacy inline scripts
 * window.myBodyManager = myBodyManager;
 *
 * -----------------------------------------------------------------------------
 * SEPARATE REAL-WORLD BLADE EXAMPLES UTILIZING EACH COMPONENT CUSTOM PROP:
 * -----------------------------------------------------------------------------
 * 1. BACKGROUND PROP EXAMPLES (For defining background imagery, patterns, or gradients on the body):
 *    <x-documents.body background="url('/images/auth-bg-pattern.png')" class="login-layout" id="auth-body">
 *        <div class="login-wrapper">Login Form Content</div>
 *    </x-layouts.body>
 *
 *    <x-documents.body background="radial-gradient(circle, #ffffff, #f1f5f9)" class="app-layout">
 *        <main>Main Content</main>
 *    </x-layouts.body>
 *
 * 2. BGCOLOR PROP EXAMPLES (For setting solid background colors or legacy fallback values on the body):
 *    <x-documents.body bgcolor="#0f172a" class="dark-theme-body" id="dark-dashboard-body">
 *        <div class="dashboard-wrapper">Dark Dashboard Content</div>
 *    </x-layouts.body>
 *
 *    <x-documents.body bgcolor="#f8fafc" class="light-theme-body">
 *        <span>Light Theme Body Content</span>
 *    </x-documents.body>
 *
 * -----------------------------------------------------------------------------
 * PATTERN B: CDN / Direct Browser Script Tag (Zero Build Tools)
 * -----------------------------------------------------------------------------
 * If a specific project doesn't use a bundler, compile the module as an ES module
 * or global script and reference it directly in your Blade layout
 * (resources/views/layouts/app.blade.php):
 *
 * <script type="module">
 *     import { UniversalBodyManager } from "{{ asset('js/UniversalBodyManager.js') }}";
 *
 *     document.addEventListener('DOMContentLoaded', () => {
 *         window.bodyManager = new UniversalBodyManager({
 *             bodySelector: '#app-root-body'
 *         });
 *     });
 * </script>
 *
 * =============================================================================
 * SECTION 3: GUIDE TO FUTURE MODIFICATIONS (WHERE AND HOW TO ADD CODE)
 * =============================================================================
 * When scaling across 10,000 projects, you will inevitably need to introduce new
 * features (e.g., dynamic color contrast checking or theme switching).
 * Follow these exact boundaries to prevent regressions:
 *
 * 1. Adding Configurations: Do not modify UniversalBodyManager.js core methods.
 *    Instead, pass your custom dictionaries or settings dynamically from the consuming
 *    project's initialization script into the configuration object.
 *
 * 2. Adding New Event Listeners: If a new project requires handling additional
 *    events (such as window resize or scroll tracking), go to
 *    UniversalBodyManager.js, locate the processBodies() method, and attach your listener logic.
 *
 * 3. Adding Formatting Helpers: Place custom color transformation or styling utility
 *    functions inside a dedicated helper file (e.g., bodyFormatters.js), import them
 *    into UniversalBodyManager.js, and invoke them inside processBodies() or onRender().
 * =============================================================================
 */
