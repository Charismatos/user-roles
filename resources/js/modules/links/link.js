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
 * @typedef {Object} UniversalAnchorManagerConfig
 * @property {string} [anchorSelector] - CSS selector for target anchor components. Default: 'a[data-hub-anchor], .universal-anchor'
 * @property {boolean} [enhanceNative] - Whether to apply dynamic tracking or security interceptors. Default: true
 * @property {Record<string, Record<string, any>>} [anchorMetadataMap] - Map of custom metadata per anchor ID.
 * @property {Object} [lifecycleHooks] - Custom event lifecycle interceptors.
 * @property {function(NodeListOf<HTMLAnchorElement>): void} [lifecycleHooks.onInit] - Initialization hook.
 * @property {function(HTMLAnchorElement, MouseEvent, Record<string, any>): void} [lifecycleHooks.onClick] - Click event intercept hook with metadata.
 */

/**
 * @class UniversalAnchorManager
 * @classdesc Enterprise-grade, project-agnostic client-side orchestration engine
 * designed to manage universal anchor links, download actions, media targets, ping tracking,
 * referrer policies, and lifecycle event handlers across 10,000+ independent web applications.
 */
export class UniversalAnchorManager {
    /**
     * Initializes the universal anchor manager instance with defensive configuration defaults.
     *
     * @param {UniversalAnchorManagerConfig} [userConfig={}] - Custom project configuration overrides.
     */
    constructor(userConfig = {}) {
        /**
         * @type {Required<UniversalAnchorManagerConfig>}
         */
        this.config = Object.assign(
            {
                anchorSelector: "a[data-hub-anchor], .universal-anchor",
                enhanceNative: true,
                anchorMetadataMap: {},
                lifecycleHooks: {},
            },
            userConfig,
        );

        /** @type {NodeListOf<HTMLAnchorElement>|[]} */
        this.anchors = [];

        this.init();
    }

    /**
     * =========================================================================
     * WHAT: Core Initialization Lifecycle
     * WHEN: Executes immediately upon class instantiation.
     * WHY:  Discovers anchor DOM nodes, parses link attributes, and binds click handlers safely.
     * =========================================================================
     */
    init() {
        if (typeof document === "undefined") {
            return; // Safe guard for non-browser environments (SSR / Node.js)
        }

        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", () =>
                this.processAnchors(),
            );
        } else {
            this.processAnchors();
        }
    }

    /**
     * Scans universal anchor elements, extracts metadata attributes, and attaches event listeners.
     */
    processAnchors() {
        this.anchors = document.querySelectorAll(this.config.anchorSelector);

        this.anchors.forEach((anchorEl) => {
            /** @type {HTMLAnchorElement} */
            const anchorElement = /** @type {HTMLAnchorElement} */ (anchorEl);
            const anchorId = anchorElement.id;

            /** @type {string|null} */
            const downloadAttr = anchorElement.getAttribute("download");
            /** @type {string|null} */
            const hrefAttr = anchorElement.getAttribute("href");
            /** @type {string|null} */
            const hreflangAttr = anchorElement.getAttribute("hreflang");
            /** @type {string|null} */
            const mediaAttr = anchorElement.getAttribute("media");
            /** @type {string|null} */
            const pingAttr = anchorElement.getAttribute("ping");
            /** @type {string|null} */
            const referrerpolicyAttr =
                anchorElement.getAttribute("referrerpolicy");
            /** @type {string|null} */
            const relAttr = anchorElement.getAttribute("rel");
            /** @type {string|null} */
            const shapeAttr = anchorElement.getAttribute("shape");
            /** @type {string|null} */
            const targetAttr = anchorElement.getAttribute("target");

            // Extract custom metadata or fallbacks
            /** @type {Record<string, any>} */
            let customMetadata = {};
            if (anchorId && this.config.anchorMetadataMap?.[anchorId]) {
                customMetadata = this.config.anchorMetadataMap[anchorId];
            }

            // Attach click event orchestration
            if (this.config.enhanceNative) {
                anchorElement.addEventListener("click", (event) => {
                    const metadata = Object.assign(
                        {
                            anchorId: anchorId,
                            download: downloadAttr,
                            href: hrefAttr,
                            hreflang: hreflangAttr,
                            media: mediaAttr,
                            ping: pingAttr,
                            referrerpolicy: referrerpolicyAttr,
                            rel: relAttr,
                            shape: shapeAttr,
                            target: targetAttr,
                        },
                        customMetadata,
                    );

                    // FUTURE MODIFICATION POINT: Insert custom download analytics, ping telemetry, or external link confirmation dialogs here.

                    if (
                        typeof this.config.lifecycleHooks?.onClick ===
                        "function"
                    ) {
                        this.config.lifecycleHooks.onClick(
                            anchorElement,
                            event,
                            metadata,
                        );
                    }
                });
            }
        });

        // Trigger custom initialization lifecycle hook safely
        if (typeof this.config.lifecycleHooks?.onInit === "function") {
            this.config.lifecycleHooks.onInit(this.anchors);
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
     * 3. Call your new method inside `processAnchors()` or expose it to consuming
     *    projects via the configuration options object.
     * =========================================================================
     */

    /**
     * Public method to programmatically trigger an anchor click or inspect its state.
     *
     * @param {string} anchorId - The HTML ID of the target anchor element.
     */
    triggerAnchor(anchorId) {
        /** @type {HTMLAnchorElement|null} */
        const targetAnchor = /** @type {HTMLAnchorElement|null} */ (
            document.getElementById(anchorId)
        );
        if (targetAnchor instanceof HTMLAnchorElement) {
            targetAnchor.click();
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
 * all component custom props (`download`, `href`, `hreflang`, `media`, `ping`,
 * `referrerpolicy`, `rel`, `shape`, `target`):
 *
 * import { UniversalAnchorManager } from './UniversalAnchorManager.js';
 *
 * const myAnchorManager = new UniversalAnchorManager({
 *     anchorSelector: 'a[data-hub-anchor]',
 *     enhanceNative: true,
 *
 *     // Passing custom metadata corresponding to component props per anchor ID
 *     anchorMetadataMap: {
 *         'download-report-link': { category: 'financial-reports', secureToken: 'tok_12345' },
 *         'external-docs-link': { category: 'documentation', externalTracking: true }
 *     },
 *
 *     // Injecting lifecycle hooks without modifying core source code
 *     lifecycleHooks: {
 *         onInit: (anchors) => {
 *             console.log(`Universal anchor manager active across ${anchors.length} links.`);
 *         },
 *         onClick: (anchor, event, metadata) => {
 *             console.log('Anchor clicked with parsed attributes & metadata:', metadata);
 *
 *             // Example: Handling specific prop behaviors (e.g., download tracking)
 *             if (metadata.download) {
 *                 console.log('Initiating secure file download tracking for:', metadata.href);
 *             }
 *         }
 *     }
 * });
 *
 * // Expose globally if needed by legacy inline scripts
 * window.myAnchorManager = myAnchorManager;
 *
 * -----------------------------------------------------------------------------
 * SEPARATE REAL-WORLD BLADE EXAMPLES UTILIZING EACH COMPONENT CUSTOM PROP:
 * -----------------------------------------------------------------------------
 * 1. DOWNLOAD PROP EXAMPLES (Enforcing file downloads):
 *    <a href="/reports/annual-2026.pdf" download="Annual_Report_2026.pdf" data-hub-anchor id="download-report-link">Download Report</a>
 *    <a href="/exports/data.csv" download data-hub-anchor>Export CSV Data</a>
 *
 * 2. HREF PROP EXAMPLES (Target destination URLs):
 *    <a href="https://api.jukuna.com/v1/auth" data-hub-anchor id="api-auth-link">API Authentication Portal</a>
 *    <a href="/dashboard/overview" data-hub-anchor>Return to Dashboard</a>
 *
 * 3. HREFLANG PROP EXAMPLES (Language targeting for linked documents):
 *    <a href="/fr/terms" hreflang="fr" data-hub-anchor>Conditions Générales (French)</a>
 *    <a href="/sw/support" hreflang="sw" data-hub-anchor>Msaada wa Wateja (Swahili)</a>
 *
 * 4. MEDIA PROP EXAMPLES (Target display/device responsiveness):
 *    <a href="/css/print-invoice.css" media="print" data-hub-anchor>Printable Invoice Stylesheet</a>
 *    <a href="/css/mobile-override.css" media="screen and (max-width: 600px)" data-hub-anchor>Mobile View</a>
 *
 * 5. PING PROP EXAMPLES (Asynchronous tracking ping endpoints):
 *    <a href="/offer/claim" ping="/api/analytics/track-click" data-hub-anchor id="tracked-offer-link">Claim Special Offer</a>
 *    <a href="/partner/redirect" ping="/log/ping" data-hub-anchor>Partner Portal</a>
 *
 * 6. REFERPOLICY PROP EXAMPLES (Controlling HTTP referrer header transmission):
 *    <a href="https://external-bank.com/pay" referrerpolicy="no-referrer" data-hub-anchor>Secure External Payment</a>
 *    <a href="https://partner.org/api" referrerpolicy="origin" data-hub-anchor>Partner API Link</a>
 *
 * 7. REL PROP EXAMPLES (Relationship state with target resource):
 *    <a href="https://github.com/Charismatos" rel="noopener noreferrer external" target="_blank" data-hub-anchor>GitHub Profile</a>
 *    <a href="/login" rel="nofollow" data-hub-anchor>Secure Login</a>
 *
 * 8. SHAPE PROP EXAMPLES (Image map coordinate regions):
 *    <img src="map.jpg" usemap="#workmap" alt="Workplace">
 *    <map name="workmap">
 *        <area shape="rect" coords="34,44,270,350" href="/dept/sales" alt="Sales">
 *        <a href="/dept/sales" shape="rect" data-hub-anchor>Sales Department Link</a>
 *    </map>
 *
 * 9. TARGET PROP EXAMPLES (Browsing context framing):
 *    <a href="/docs/manual.pdf" target="_blank" rel="noopener" data-hub-anchor id="external-docs-link">Open Documentation in New Tab</a>
 *    <a href="/iframe-content" target="content-frame" data-hub-anchor>Load in Frame</a>
 *
 * -----------------------------------------------------------------------------
 * PATTERN B: CDN / Direct Browser Script Tag (Zero Build Tools)
 * -----------------------------------------------------------------------------
 * If a specific project doesn't use a bundler, compile the module as an ES module
 * or global script and reference it directly in your Blade layout
 * (resources/views/layouts/app.blade.php):
 *
 * <script type="module">
 *     import { UniversalAnchorManager } from "{{ asset('js/UniversalAnchorManager.js') }}";
 *
 *     document.addEventListener('DOMContentLoaded', () => {
 *         window.anchorManager = new UniversalAnchorManager({
 *             anchorSelector: '#download-report-link'
 *         });
 *     });
 * </script>
 *
 * =============================================================================
 * SECTION 3: GUIDE TO FUTURE MODIFICATIONS (WHERE AND HOW TO ADD CODE)
 * =============================================================================
 * When scaling across 10,000 projects, you will inevitably need to introduce new
 * features (e.g., automatic outbound link warnings or modal interceptors).
 * Follow these exact boundaries to prevent regressions:
 *
 * 1. Adding Configurations: Do not modify UniversalAnchorManager.js core methods.
 *    Instead, pass your custom dictionaries or settings dynamically from the consuming
 *    project's initialization script into the configuration object.
 *
 * 2. Adding New Event Listeners: If a new project requires handling additional
 *    events (such as hover previews or mousedown interactions), go to
 *    UniversalAnchorManager.js, locate the processAnchors() method, and attach your listener logic.
 *
 * 3. Adding Formatting Helpers: Place custom URL parsing or sanitization utility
 *    functions inside a dedicated helper file (e.g., anchorFormatters.js), import them
 *    into UniversalAnchorManager.js, and invoke them inside processAnchors() or onClick().
 * =============================================================================
 */
