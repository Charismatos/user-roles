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
 * @typedef {Object} DynamicAlertManagerConfig
 * @property {string} [alertSelector] - CSS selector for target alert components. Default: '.alert, [role="alert"], [data-alert]'
 * @property {boolean} [autoDismiss] - Whether to automatically dismiss alerts after a specified timeout. Default: false
 * @property {number} [dismissTimeout] - Timeout duration in milliseconds before auto-dismissal. Default: 5000
 * @property {boolean} [dismissible] - Whether to automatically append a close/dismiss button to alerts. Default: true
 * @property {string} [dismissButtonClass] - CSS classes assigned to the dynamically injected dismiss button. Default: 'alert-dismiss-btn pb-btn pb-outline'
 * @property {Object} [lifecycleHooks] - Custom event lifecycle interceptors.
 * @property {function(NodeListOf<HTMLElement>): void} [lifecycleHooks.onInit] - Initialization hook.
 * @property {function(HTMLElement): void} [lifecycleHooks.onDismiss] - Alert dismissal intercept hook.
 */

/**
 * @class DynamicAlertManager
 * @classdesc Enterprise-grade, project-agnostic client-side orchestration engine
 * designed to manage dynamic flash alerts, auto-dismissal timers, dismiss buttons,
 * and notification animations across 10,000+ independent web applications.
 */
export class DynamicAlertManager {
    /**
     * Initializes the alert manager instance with defensive configuration defaults.
     *
     * @param {DynamicAlertManagerConfig} [userConfig={}] - Custom project configuration overrides.
     */
    constructor(userConfig = {}) {
        /**
         * @type {Required<DynamicAlertManagerConfig>}
         */
        this.config = Object.assign(
            {
                alertSelector: '.alert, [role="alert"], [data-alert]',
                autoDismiss: false,
                dismissTimeout: 5000,
                dismissible: true,
                dismissButtonClass: "alert-dismiss-btn pb-btn pb-outline",
                lifecycleHooks: {},
            },
            userConfig,
        );

        /** @type {NodeListOf<HTMLElement>|[]} */
        this.alertElements = [];

        this.init();
    }

    /**
     * =========================================================================
     * WHAT: Core Initialization Lifecycle
     * WHEN: Executes immediately upon class instantiation.
     * WHY:  Discovers alert DOM nodes, binds dismiss handlers, and sets timers safely.
     * =========================================================================
     */
    init() {
        if (typeof document === "undefined") {
            return; // Safe guard for non-browser environments (SSR / Node.js)
        }

        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", () =>
                this.processAlerts(),
            );
        } else {
            this.processAlerts();
        }
    }

    /**
     * Scans alert elements, appends close buttons if configured, and manages auto-dismissal timers.
     */
    processAlerts() {
        this.alertElements = document.querySelectorAll(
            this.config.alertSelector,
        );

        this.alertElements.forEach((alertEl) => {
            /** @type {HTMLElement} */
            const alertContainer = /** @type {HTMLElement} */ (alertEl);

            // Append dismiss button if enabled and not already present
            if (
                this.config.dismissible &&
                !alertContainer.querySelector(".alert-dismiss-btn")
            ) {
                const dismissBtn = document.createElement("button");
                dismissBtn.type = "button";
                dismissBtn.className = this.config.dismissButtonClass;
                dismissBtn.textContent = "×";
                dismissBtn.setAttribute("aria-label", "Close alert");

                dismissBtn.addEventListener("click", () => {
                    this.dismissAlert(alertContainer);
                });

                alertContainer.appendChild(dismissBtn);
            }

            // Handle auto-dismissal if configured globally or via data attributes
            const autoDismissAttr =
                alertContainer.getAttribute("data-auto-dismiss");
            const timeoutAttr = alertContainer.getAttribute(
                "data-dismiss-timeout",
            );

            const shouldDismiss =
                autoDismissAttr !== null
                    ? autoDismissAttr === "true"
                    : this.config.autoDismiss;
            const timeoutValue =
                timeoutAttr !== null
                    ? Number(timeoutAttr)
                    : this.config.dismissTimeout;

            if (shouldDismiss) {
                window.setTimeout(
                    () => {
                        this.dismissAlert(alertContainer);
                    },
                    isNaN(timeoutValue) ? 5000 : timeoutValue,
                );
            }
        });

        // Trigger custom initialization lifecycle hook safely
        if (typeof this.config.lifecycleHooks?.onInit === "function") {
            this.config.lifecycleHooks.onInit(this.alertElements);
        }
    }

    /**
     * Programmatically dismisses and hides a target alert element.
     *
     * @param {HTMLElement} alertContainer - The alert element to remove or hide.
     */
    dismissAlert(alertContainer) {
        if (alertContainer && alertContainer.style.display !== "none") {
            alertContainer.style.opacity = "0";
            alertContainer.style.transition = "opacity 0.3s ease-in-out";

            window.setTimeout(() => {
                alertContainer.style.display = "none";

                // FUTURE MODIFICATION POINT: Insert custom DOM removal, fade-out classes, or telemetry logging here.

                if (
                    typeof this.config.lifecycleHooks?.onDismiss === "function"
                ) {
                    this.config.lifecycleHooks.onDismiss(alertContainer);
                }
            }, 300);
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
     * 3. Call your new method inside `processAlerts()` or expose it to consuming
     *    projects via the configuration options object.
     * =========================================================================
     */

    /**
     * Public method to dynamically inject and display a new alert notification banner.
     *
     * @param {string} message - The notification message content.
     * @param {string} [type='success'] - The alert variant type ('success', 'danger', 'warning', 'info').
     * @param {string} [containerSelector='body'] - Target parent selector to append the alert into.
     */
    showFlashAlert(message, type = "success", containerSelector = "body") {
        const parentContainer = document.querySelector(containerSelector);
        if (parentContainer && message) {
            /** @type {HTMLElement} */
            const newAlert = /** @type {HTMLElement} */ (
                document.createElement("div")
            );
            newAlert.className = `alert alert-${type} dynamic-flash-alert`;
            newAlert.setAttribute("role", "alert");
            newAlert.style.opacity = "0";

            const p = document.createElement("p");
            p.textContent = message;
            newAlert.appendChild(p);

            if (this.config.dismissible) {
                const dismissBtn = document.createElement("button");
                dismissBtn.type = "button";
                dismissBtn.className = this.config.dismissButtonClass;
                dismissBtn.textContent = "×";
                dismissBtn.setAttribute("aria-label", "Close alert");
                dismissBtn.addEventListener("click", () => {
                    this.dismissAlert(newAlert);
                });
                newAlert.appendChild(dismissBtn);
            }

            parentContainer.prepend(newAlert);

            // Fade in animation
            window.setTimeout(() => {
                newAlert.style.transition = "opacity 0.3s ease-in-out";
                newAlert.style.opacity = "1";
            }, 10);

            if (this.config.autoDismiss) {
                window.setTimeout(() => {
                    this.dismissAlert(newAlert);
                }, this.config.dismissTimeout);
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
 * import the class and initialize it with custom parameters or hooks:
 *
 * import { DynamicAlertManager } from './DynamicAlertManager.js';
 *
 * const myAlertManager = new DynamicAlertManager({
 *     alertSelector: '.enterprise-alert',
 *     autoDismiss: true,
 *     dismissTimeout: 4000,
 *     dismissible: true,
 *
 *     // Injecting lifecycle hooks without modifying core source code
 *     lifecycleHooks: {
 *         onInit: (alerts) => {
 *             console.log(`Alert manager active across ${alerts.length} notifications.`);
 *         },
 *         onDismiss: (alert) => {
 *             // Custom analytics or cleanup when an alert is closed
 *         }
 *     }
 * });
 *
 * // Expose globally if needed by legacy inline scripts
 * window.myAlertManager = myAlertManager;
 *
 * -----------------------------------------------------------------------------
 * PATTERN B: CDN / Direct Browser Script Tag (Zero Build Tools)
 * -----------------------------------------------------------------------------
 * If a specific project doesn't use a bundler, compile the module as an ES module
 * or global script and reference it directly in your Blade layout
 * (resources/views/layouts/app.blade.php):
 *
 * <script type="module">
 *     import { DynamicAlertManager } from "{{ asset('js/DynamicAlertManager.js') }}";
 *
 *     document.addEventListener('DOMContentLoaded', () => {
 *         window.alertManager = new DynamicAlertManager({
 *             alertSelector: '#session-flash-alert'
 *         });
 *     });
 * </script>
 *
 * =============================================================================
 * SECTION 3: GUIDE TO FUTURE MODIFICATIONS (WHERE AND HOW TO ADD CODE)
 * =============================================================================
 * When scaling across 10,000 projects, you will inevitably need to introduce new
 * features (e.g., sound effects on alert display or WebSocket notification streaming).
 * Follow these exact boundaries to prevent regressions:
 *
 * 1. Adding Configurations: Do not modify DynamicAlertManager.js core methods.
 *    Instead, pass your custom timers or flags dynamically from the consuming
 *    project's initialization script into the configuration object.
 *
 * 2. Adding New Event Listeners: If a new project requires handling additional
 *    events (such as pause on hover), go to DynamicAlertManager.js,
 *    locate the processAlerts() method, and attach your listener logic.
 *
 * 3. Adding Formatting Helpers: Place custom message sanitization or translation utility
 *    functions inside a dedicated helper file (e.g., alertFormatters.js), import them
 *    into DynamicAlertManager.js, and invoke them inside processAlerts() or showFlashAlert().
 * =============================================================================
 */
