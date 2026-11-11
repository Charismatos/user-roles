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
 * @typedef {Object} UniversalDashboardNavigationManagerConfig
 * @property {string} [toggleSelector] - CSS selector for sidebar toggle buttons. Default: '[data-sidebar-toggle]'
 * @property {string} [sidebarSelector] - CSS selector for the sidebar container. Default: '#asideSidebar'
 * @property {string} [activeBodyClass] - Class name toggled on document body for off-canvas state. Default: 'sidebar-active'
 * @property {Object} [lifecycleHooks] - Custom event lifecycle interceptors.
 * @property {function((HTMLElement|null), HTMLElement[]): void} [lifecycleHooks.onInit] - Initialization hook.
 * @property {function(boolean): void} [lifecycleHooks.onToggle] - Toggle event intercept hook.
 */

/**
 * @class UniversalDashboardNavigationManager
 * @classdesc Enterprise-grade, project-agnostic client-side orchestration engine
 * designed to manage responsive dashboard navigation shells, mobile off-canvas drawer toggles,
 * backdrop states, and accessibility bindings across 10,000+ independent web applications.
 */
export class UniversalDashboardNavigationManager {
    /**
     * Initializes the dashboard navigation manager instance with defensive configuration defaults.
     *
     * @param {UniversalDashboardNavigationManagerConfig} [userConfig={}] - Custom project configuration overrides.
     */
    constructor(userConfig = {}) {
        /**
         * @type {Required<UniversalDashboardNavigationManagerConfig>}
         */
        this.config = Object.assign(
            {
                toggleSelector: "[data-sidebar-toggle]",
                sidebarSelector: "#asideSidebar",
                activeBodyClass: "sidebar-active",
                lifecycleHooks: {},
            },
            userConfig,
        );

        /** @type {NodeListOf<HTMLElement>|[]} */
        this.toggles = [];
        /** @type {HTMLElement|null} */
        this.sidebar = null;
        /** @type {boolean} */
        this.isOpen = false;

        this.init();
    }

    /**
     * =========================================================================
     * WHAT: Core Initialization Lifecycle
     * WHEN: Executes immediately upon class instantiation.
     * WHY:  Discovers navigation DOM nodes, binds toggle event listeners, and sets ARIA states safely.
     * =========================================================================
     */
    init() {
        if (typeof document === "undefined") {
            return; // Safe guard for non-browser environments (SSR / Node.js)
        }

        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", () =>
                this.setupNavigation(),
            );
        } else {
            this.setupNavigation();
        }
    }

    /**
     * Discovers toggle buttons and sidebar elements, then establishes event wiring.
     */
    setupNavigation() {
        this.toggles = document.querySelectorAll(this.config.toggleSelector);
        this.sidebar = /** @type {HTMLElement|null} */ (
            document.querySelector(this.config.sidebarSelector)
        );

        if (this.sidebar && this.toggles.length > 0) {
            this.toggles.forEach((toggleEl) => {
                /** @type {HTMLElement} */
                const toggleButton = /** @type {HTMLElement} */ (toggleEl);

                toggleButton.addEventListener("click", (event) => {
                    event.preventDefault();
                    this.toggleSidebar();
                });
            });

            // Close sidebar when clicking outside on mobile viewports
            document.addEventListener("click", (event) => {
                const target = /** @type {HTMLElement} */ (event.target);
                if (
                    this.isOpen &&
                    window.innerWidth < 1024 &&
                    this.sidebar &&
                    !this.sidebar.contains(target) &&
                    !Array.from(this.toggles).some((btn) =>
                        btn.contains(target),
                    )
                ) {
                    this.setSidebarState(false);
                }
            });

            // Handle window resizing across breakpoints to clear conflicting mobile states
            window.addEventListener("resize", () => {
                if (window.innerWidth >= 1024 && this.isOpen) {
                    this.setSidebarState(false);
                }
            });
        }

        // Trigger custom initialization lifecycle hook safely
        if (typeof this.config.lifecycleHooks?.onInit === "function") {
            this.config.lifecycleHooks.onInit(
                this.sidebar,
                Array.from(this.toggles),
            );
        }
    }

    /**
     * Toggles the current open/closed state of the dashboard off-canvas sidebar.
     */
    toggleSidebar() {
        this.setSidebarState(!this.isOpen);
    }

    /**
     * Explicitly sets the sidebar visibility state and updates ARIA attributes / body classes.
     *
     * @param {boolean} open - True to open the sidebar, false to close it.
     */
    setSidebarState(open) {
        this.isOpen = open;

        if (this.sidebar) {
            if (open) {
                this.sidebar.classList.add("is-open");
                document.body.classList.add(this.config.activeBodyClass);
                this.sidebar.setAttribute("aria-hidden", "false");
            } else {
                this.sidebar.classList.remove("is-open");
                document.body.classList.remove(this.config.activeBodyClass);
                this.sidebar.setAttribute("aria-hidden", "true");
            }
        }

        this.toggles.forEach((toggleEl) => {
            toggleEl.setAttribute("aria-expanded", open ? "true" : "false");
        });

        // FUTURE MODIFICATION POINT: Insert custom focus trap routines, backdrop overlay creation, or telemetry logging here.

        if (typeof this.config.lifecycleHooks?.onToggle === "function") {
            this.config.lifecycleHooks.onToggle(open);
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
 * PATTERN A: Modern ES Modules (import in Vite / Webpack / Laravel Mix alongside alerts and asides)
 * -----------------------------------------------------------------------------
 * In your project's main application or dashboard script (e.g., resources/js/Auth/Guest/user-dashboard.js),
 * you import and initialize all managers together cleanly without naming collisions or scope conflicts:
 *
 * import { DynamicAlertManager } from "../../modules/alerts/alert";
 * import { UniversalAsideManager } from "../../modules/documents/aside";
 * import { UniversalDashboardNavigationManager } from "./UniversalDashboardNavigationManager.js";
 *
 * // 1. Initialize Dashboard Navigation Shell Manager
 * const myDashboardNav = new UniversalDashboardNavigationManager({
 *     toggleSelector: '[data-sidebar-toggle]',
 *     sidebarSelector: '#asideSidebar',
 *     activeBodyClass: 'sidebar-active',
 *     lifecycleHooks: {
 *         onInit: (sidebar, toggles) => {
 *             console.log(`Dashboard navigation initialized with ${toggles.length} toggle triggers.`);
 *         },
 *         onToggle: (isOpen) => {
 *             console.log(`Mobile off-canvas sidebar state changed: isOpen = ${isOpen}`);
 *         }
 *     }
 * });
 *
 * // 2. Initialize Flash Notifications Alert Manager
 * const myAlertManager = new DynamicAlertManager({
 *     alertSelector: ".registration_success_alert, .update_success_alert",
 *     autoDismiss: true,
 *     dismissTimeout: 4000,
 *     dismissible: true,
 *     lifecycleHooks: {
 *         onInit: (alerts) => {
 *             console.log(`Alert manager active across ${alerts.length} notifications.`);
 *         }
 *     }
 * });
 *
 * // 3. Initialize Universal Aside Manager for Sidebar Widgets
 * const myAsideManager = new UniversalAsideManager({
 *     asideSelector: "aside[data-hub-target], .sidebar-widget",
 *     enhanceNative: true,
 *     asideMetadataMap: {
 *         "asideSidebar": {
 *             widgetType: "dashboard-navigation",
 *             role: "main-navigation"
 *         }
 *     },
 *     lifecycleHooks: {
 *         onInit: (asides) => {
 *             console.log(`Universal aside manager active across ${asides.length} elements.`);
 *         }
 *     }
 * });
 *
 * // Expose globally if needed by legacy inline scripts
 * window.myDashboardNav = myDashboardNav;
 * window.myAlertManager = myAlertManager;
 * window.myAsideManager = myAsideManager;
 *
 * -----------------------------------------------------------------------------
 * PATTERN B: CDN / Direct Browser Script Tag (Zero Build Tools)
 * -----------------------------------------------------------------------------
 * If a specific project doesn't use a bundler, compile the module as an ES module
 * or global script and reference it directly in your Blade layout:
 *
 * <script type="module">
 *     import { UniversalDashboardNavigationManager } from "{{ asset('js/UniversalDashboardNavigationManager.js') }}";
 *
 *     document.addEventListener('DOMContentLoaded', () => {
 *         window.dashboardNav = new UniversalDashboardNavigationManager();
 *     });
 * </script>
 *
 * =============================================================================
 * SECTION 3: GUIDE TO FUTURE MODIFICATIONS (WHERE AND HOW TO ADD CODE)
 * =============================================================================
 * When scaling across 10,000 projects, you will inevitably need to introduce new
 * features (e.g., keyboard escape key listeners or focus traps for accessibility).
 * Follow these exact boundaries to prevent regressions:
 *
 * 1. Adding Configurations: Do not modify UniversalDashboardNavigationManager.js core methods.
 *    Instead, pass your custom selectors or classes dynamically from the consuming
 *    project's initialization script into the configuration object.
 *
 * 2. Adding New Event Listeners: If a new project requires handling additional
 *    events (such as pressing the Escape key to close the drawer), go to
 *    UniversalDashboardNavigationManager.js, locate the setupNavigation() method, and attach your listener logic.
 *
 * 3. Adding Formatting Helpers: Place custom animation or accessibility helper utility
 *    functions inside a dedicated helper file (e.g., navFormatters.js), import them
 *    into UniversalDashboardNavigationManager.js, and invoke them inside toggleSidebar() or setSidebarState().
 * =============================================================================
 */
