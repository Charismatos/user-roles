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
 * @typedef {Object} UniversalTableManagerConfig
 * @property {string} [tableSelector] - CSS selector for target polymorphic table elements. Default: 'table[data-hub-target], .universal-table'
 * @property {boolean} [enhanceNative] - Whether to apply dynamic alignment, background colors, or sortable enhancements. Default: true
 * @property {Record<string, Record<string, any>>} [tableMetadataMap] - Map of custom metadata per table element ID.
 * @property {Object} [lifecycleHooks] - Custom event lifecycle interceptors.
 * @property {function(NodeListOf<HTMLElement>): void} [lifecycleHooks.onInit] - Initialization hook.
 * @property {function(HTMLElement, Record<string, any>): void} [lifecycleHooks.onRender] - Render intercept hook with metadata.
 */

/**
 * @class UniversalTableManager
 * @classdesc Enterprise-grade, project-agnostic client-side orchestration engine
 * designed to manage universal polymorphic tables, structural elements (caption, col, colgroup, thead, tbody, tfoot, tr, th, td),
 * attributes (align, bgcolor, border, summary, span, colspan, rowspan, headers, scope), metadata inspection,
 * and lifecycle event handlers across 10,000+ independent web applications.
 */
export class UniversalTableManager {
    /**
     * Initializes the universal table manager instance with defensive configuration defaults.
     *
     * @param {UniversalTableManagerConfig} [userConfig={}] - Custom project configuration overrides.
     */
    constructor(userConfig = {}) {
        /**
         * @type {Required<UniversalTableManagerConfig>}
         */
        this.config = Object.assign(
            {
                tableSelector: "table[data-hub-target], .universal-table",
                enhanceNative: true,
                tableMetadataMap: {},
                lifecycleHooks: {},
            },
            userConfig,
        );

        /** @type {NodeListOf<HTMLElement>|[]} */
        this.tables = [];

        this.init();
    }

    /**
     * =========================================================================
     * WHAT: Core Initialization Lifecycle
     * WHEN: Executes immediately upon class instantiation.
     * WHY:  Discovers polymorphic table DOM nodes, parses structural attributes, and binds handlers safely.
     * =========================================================================
     */
    init() {
        if (typeof document === "undefined") {
            return; // Safe guard for non-browser environments (SSR / Node.js)
        }

        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", () =>
                this.processTables(),
            );
        } else {
            this.processTables();
        }
    }

    /**
     * Scans universal table elements, extracts custom table prop attributes, and triggers lifecycle callbacks.
     */
    processTables() {
        this.tables = document.querySelectorAll(this.config.tableSelector);

        this.tables.forEach((tableEl) => {
            /** @type {HTMLElement} */
            const tableElement = /** @type {HTMLElement} */ (tableEl);
            const tableId = tableElement.id;

            /** @type {string|null} */
            const alignAttr = tableElement.getAttribute("align");
            /** @type {string|null} */
            const bgcolorAttr = tableElement.getAttribute("bgcolor");
            /** @type {string|null} */
            const borderAttr = tableElement.getAttribute("border");
            /** @type {string|null} */
            const summaryAttr = tableElement.getAttribute("summary");
            /** @type {string|null} */
            const spanAttr = tableElement.getAttribute("span");
            /** @type {string|null} */
            const colspanAttr = tableElement.getAttribute("colspan");
            /** @type {string|null} */
            const rowspanAttr = tableElement.getAttribute("rowspan");
            /** @type {string|null} */
            const headersAttr = tableElement.getAttribute("headers");
            /** @type {string|null} */
            const scopeAttr = tableElement.getAttribute("scope");

            // Extract custom metadata or fallbacks
            /** @type {Record<string, any>} */
            let customMetadata = {};
            if (tableId && this.config.tableMetadataMap?.[tableId]) {
                customMetadata = this.config.tableMetadataMap[tableId];
            }

            // Apply style enhancements if enhanceNative is true
            if (this.config.enhanceNative) {
                if (alignAttr && !tableElement.style.textAlign) {
                    tableElement.style.textAlign = alignAttr;
                }
                if (bgcolorAttr && !tableElement.style.backgroundColor) {
                    tableElement.style.backgroundColor = bgcolorAttr;
                }
                if (
                    borderAttr !== null &&
                    tableElement.tagName === "TABLE" &&
                    !tableElement.style.border
                ) {
                    tableElement.style.border = `${borderAttr}px solid currentColor`;
                }
            }

            const metadata = Object.assign(
                {
                    tableId: tableId,
                    align: alignAttr,
                    bgcolor: bgcolorAttr,
                    border: borderAttr,
                    summary: summaryAttr,
                    span: spanAttr,
                    colspan: colspanAttr,
                    rowspan: rowspanAttr,
                    headers: headersAttr,
                    scope: scopeAttr,
                },
                customMetadata,
            );

            // FUTURE MODIFICATION POINT: Insert custom table sorting, pagination, or telemetry logging here.

            if (typeof this.config.lifecycleHooks?.onRender === "function") {
                this.config.lifecycleHooks.onRender(tableElement, metadata);
            }
        });

        // Trigger custom initialization lifecycle hook safely
        if (typeof this.config.lifecycleHooks?.onInit === "function") {
            this.config.lifecycleHooks.onInit(this.tables);
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
     * 3. Call your new method inside `processTables()` or expose it to consuming
     *    projects via the configuration options object.
     * =========================================================================
     */

    /**
     * Public method to programmatically update a table element's structural attributes.
     *
     * @param {string} elementId - The HTML ID of the target table element.
     * @param {string} propertyName - The attribute name to update (e.g., 'bgcolor', 'align').
     * @param {string} propertyValue - The new attribute value.
     */
    updateTableElementProperty(elementId, propertyName, propertyValue) {
        /** @type {HTMLElement|null} */
        const targetElement = /** @type {HTMLElement|null} */ (
            document.getElementById(elementId)
        );
        if (targetElement instanceof HTMLElement) {
            targetElement.setAttribute(propertyName, propertyValue);
            if (propertyName === "bgcolor") {
                targetElement.style.backgroundColor = propertyValue;
            } else if (propertyName === "align") {
                targetElement.style.textAlign = propertyValue;
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
 * all structural element custom props (`align`, `bgcolor`, `border`, `summary`,
 * `span`, `colspan`, `rowspan`, `headers`, `scope`):
 *
 * import { UniversalTableManager } from './UniversalTableManager.js';
 *
 * const myTableManager = new UniversalTableManager({
 *     tableSelector: 'table[data-hub-target], .universal-table',
 *     enhanceNative: true,
 *
 *     // Passing custom metadata corresponding to component props per element ID
 *     tableMetadataMap: {
 *         'financial-ledger-table': { sortable: true, exportable: true },
 *         'caption-element': { position: 'bottom' }
 *     },
 *
 *     // Injecting lifecycle hooks without modifying core source code
 *     lifecycleHooks: {
 *         onInit: (tables) => {
 *             console.log(`Universal table manager active across ${tables.length} elements.`);
 *         },
 *         onRender: (element, metadata) => {
 *             console.log('Table structural element rendered with metadata:', metadata);
 *
 *             // Example: Handling specific prop behaviors
 *             if (metadata.summary) {
 *                 console.log('Table accessibility summary registered:', metadata.summary);
 *             }
 *         }
 *     }
 * });
 *
 * // Expose globally if needed by legacy inline scripts
 * window.myTableManager = myTableManager;
 *
 * -----------------------------------------------------------------------------
 * SEPARATE REAL-WORLD BLADE EXAMPLES UTILIZING EACH COMPONENT CUSTOM PROP:
 * -----------------------------------------------------------------------------
 * 1. CAPTION ELEMENT EXAMPLES (align):
 *    <x-tables.table type="caption" align="bottom" id="caption-element">
 *        Table 1.1: Comprehensive Financial Transactions Ledger
 *    </x-tables.table>
 *
 *    <x-tables.table type="caption" align="top">
 *        Quarterly Revenue Summary
 *    </x-tables.table>
 *
 * 2. COL ELEMENT EXAMPLES (align, bgcolor, span):
 *    <x-tables.table type="col" span="2" bgcolor="#f8fafc" align="center" />
 *    <x-tables.table type="col" span="1" bgcolor="#eff6ff" />
 *
 * 3. COLGROUP ELEMENT EXAMPLES (align, bgcolor, span):
 *    <x-tables.table type="colgroup" span="3" align="left" bgcolor="#f1f5f9" />
 *    <x-tables.table type="colgroup" span="2" align="right" />
 *
 * 4. TABLE ELEMENT EXAMPLES (align, bgcolor, border, summary):
 *    <x-tables.table type="table" border="1" summary="User list table containing roles and statuses" bgcolor="#ffffff" align="center" id="financial-ledger-table">
 *        <!-- Table contents -->
 *    </x-tables.table>
 *
 * 5. TBODY ELEMENT EXAMPLES (align, bgcolor):
 *    <x-tables.table type="tbody" align="left" bgcolor="#f8fafc">
 *        <!-- Table body rows -->
 *    </x-tables.table>
 *
 * 6. TD ELEMENT EXAMPLES (align, bgcolor, colspan, headers, rowspan):
 *    <x-tables.table type="td" colspan="2" rowspan="1" headers="col-name col-email" align="right" bgcolor="#ffffff">
 *        $4,500.00
 *    </x-tables.table>
 *
 * 7. TFOOT ELEMENT EXAMPLES (align, bgcolor):
 *    <x-tables.table type="tfoot" align="right" bgcolor="#e2e8f0">
 *        <!-- Footer summary row -->
 *    </x-tables.table>
 *
 * 8. TH ELEMENT EXAMPLES (align, bgcolor, colspan, headers, rowspan, scope):
 *    <x-tables.table type="th" scope="col" colspan="1" rowspan="1" headers="col-name" align="left" bgcolor="#1e293b" :style="['color' => '#ffffff']">
 *        Account Holder Name
 *    </x-tables.table>
 *
 * 9. THEAD ELEMENT EXAMPLES (align):
 *    <x-tables.table type="thead" align="center" id="main-thead">
 *        <!-- Header rows -->
 *    </x-tables.table>
 *
 * 10. TR ELEMENT EXAMPLES (align, bgcolor):
 *     <x-tables.table type="tr" align="left" bgcolor="#eff6ff" id="highlighted-row">
 *         <!-- Row cells -->
 *     </x-tables.table>
 *
 * -----------------------------------------------------------------------------
 * PATTERN B: CDN / Direct Browser Script Tag (Zero Build Tools)
 * -----------------------------------------------------------------------------
 * If a specific project doesn't use a bundler, compile the module as an ES module
 * or global script and reference it directly in your Blade layout
 * (resources/views/layouts/app.blade.php):
 *
 * <script type="module">
 *     import { UniversalTableManager } from "{{ asset('js/UniversalTableManager.js') }}";
 *
 *     document.addEventListener('DOMContentLoaded', () => {
 *         window.tableManager = new UniversalTableManager({
 *             tableSelector: '#financial-ledger-table'
 *         });
 *     });
 * </script>
 *
 * =============================================================================
 * SECTION 3: GUIDE TO FUTURE MODIFICATIONS (WHERE AND HOW TO ADD CODE)
 * =============================================================================
 * When scaling across 10,000 projects, you will inevitably need to introduce new
 * features (e.g., column reordering or dynamic search filtering).
 * Follow these exact boundaries to prevent regressions:
 *
 * 1. Adding Configurations: Do not modify UniversalTableManager.js core methods.
 *    Instead, pass your custom dictionaries or settings dynamically from the consuming
 *    project's initialization script into the configuration object.
 *
 * 2. Adding New Event Listeners: If a new project requires handling additional
 *    events (such as row click selection or cell editing), go to
 *    UniversalTableManager.js, locate the processTables() method, and attach your listener logic.
 *
 * 3. Adding Formatting Helpers: Place custom table serialization or rendering utility
 *    functions inside a dedicated helper file (e.g., tableFormatters.js), import them
 *    into UniversalTableManager.js, and invoke them inside processTables() or onRender().
 * =============================================================================
 */
