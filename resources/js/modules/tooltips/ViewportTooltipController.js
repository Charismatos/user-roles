/**
 * =============================================================================
 * GLOSSARY OF ABBREVIATIONS USED WITHIN THIS FILE & COMMENTS:
 * -----------------------------------------------------------------------------
 * - DOM   : Document Object Model
 * - CSS   : Cascading Style Sheets
 * - HTML  : HyperText Markup Language
 * - UI    : User Interface
 * - JSDoc : JavaScript Documentation syntax
 * - ESM   : ECMAScript Module
 * - CB    : Callback function
 * - IIFE  : Immediately Invoked Function Expression
 * - ARIA  : Accessible Rich Internet Applications
 * - SSR   : Server-Side Rendering
 * - SVG   : Scalable Vector Graphics
 * =============================================================================
 */

/**
 * @typedef {Object} TooltipPositionConfig
 * @property {number} [margin=12] - Minimum viewport edge margin in pixels.
 * @property {number} [gap=8] - Vertical gap in pixels between trigger element and tooltip.
 * @property {number} [estimatedHeight=36] - Estimated tooltip bubble height in pixels for viewport flip calculations.
 * @property {number} [charWidthEstimate=7] - Estimated character width in pixels for width clamping.
 * @property {number} [horizontalPaddingEstimate=24] - Estimated horizontal padding/border allowance in pixels.
 * @property {string} [selector='[data-hint]'] - CSS selector matching any tooltip-enabled trigger element (buttons, links, inputs, badges, icons, etc.).
 * @property {string} [hintAttribute='data-hint'] - Attribute containing tooltip hint text.
 */

/**
 * @class ViewportTooltipController
 * @classdesc Enterprise-grade, project-agnostic ES module class controlling dynamic viewport-clamped
 * CSS custom property tooltips (`--tooltip-tip-*`, `--tooltip-arrow-*`) for ANY HTML or SVG element
 * (`button`, `a`, `span`, `input`, `div`, `svg`, etc.) across 10,000+ independent web applications
 * spanning diverse industry verticals (agriculture, defense, education, energy, minerals, finance, health,
 * justice, security, real estate, government, labour, science, tech, environment, water, transport,
 * sports, construction, trade & commerce, tourism).
 */
export class ViewportTooltipController {
    /**
     * Creates a new element-agnostic tooltip controller instance with safe defaults and `"checkJs": true` compatibility.
     *
     * @param {TooltipPositionConfig} [options={}] - Optional configuration overrides for positioning, target elements, and selectors.
     */
    constructor(options = {}) {
        /** @type {TooltipPositionConfig} */
        const safeOptions =
            options && typeof options === "object" ? options : {};

        /** @type {number} */
        this.margin =
            typeof safeOptions.margin === "number" &&
            Number.isFinite(safeOptions.margin)
                ? safeOptions.margin
                : 12;

        /** @type {number} */
        this.gap =
            typeof safeOptions.gap === "number" &&
            Number.isFinite(safeOptions.gap)
                ? safeOptions.gap
                : 8;

        /** @type {number} */
        this.estimatedHeight =
            typeof safeOptions.estimatedHeight === "number" &&
            Number.isFinite(safeOptions.estimatedHeight)
                ? safeOptions.estimatedHeight
                : 36;

        /** @type {number} */
        this.charWidthEstimate =
            typeof safeOptions.charWidthEstimate === "number" &&
            Number.isFinite(safeOptions.charWidthEstimate)
                ? safeOptions.charWidthEstimate
                : 7;

        /** @type {number} */
        this.horizontalPaddingEstimate =
            typeof safeOptions.horizontalPaddingEstimate === "number" &&
            Number.isFinite(safeOptions.horizontalPaddingEstimate)
                ? safeOptions.horizontalPaddingEstimate
                : 24;

        /** @type {string} */
        this.hintAttribute =
            typeof safeOptions.hintAttribute === "string" &&
            safeOptions.hintAttribute.trim() !== ""
                ? safeOptions.hintAttribute.trim()
                : "data-hint";

        /** @type {string} */
        this.selector =
            typeof safeOptions.selector === "string" &&
            safeOptions.selector.trim() !== ""
                ? safeOptions.selector.trim()
                : `[${this.hintAttribute}]`;

        /** @type {HTMLElement | Document | null} */
        this._boundRoot = null;

        /** @type {(event: PointerEvent) => void} */
        this._handlePointerMove = (event) => {
            /** @type {Element | null} */
            const targetEl =
                event.target instanceof Element ? event.target : null;
            /** @type {HTMLElement | SVGElement | null} */
            const trigger = targetEl
                ? /** @type {HTMLElement | SVGElement | null} */ (
                      targetEl.closest(this.selector)
                  )
                : null;

            if (trigger) {
                /** @type {number | null} */
                const clientX =
                    typeof event.clientX === "number" ? event.clientX : null;
                this.positionTooltip(trigger, clientX);
            }
        };

        /** @type {(event: FocusEvent) => void} */
        this._handleFocusIn = (event) => {
            /** @type {Element | null} */
            const targetEl =
                event.target instanceof Element ? event.target : null;
            /** @type {HTMLElement | SVGElement | null} */
            const trigger = targetEl
                ? /** @type {HTMLElement | SVGElement | null} */ (
                      targetEl.closest(this.selector)
                  )
                : null;

            if (trigger) {
                this.positionTooltip(trigger, null);
            }
        };
    }

    /**
     * Computes viewport-clamped coordinates and writes CSS custom properties (`--tooltip-tip-*` and
     * `--tooltip-arrow-*`) onto any target element (`button`, `a`, `span`, `input`, `div`, `svg`, etc.)
     * so `@layer pb-components` pseudo-elements (`::after` and `::before`) render cleanly without
     * viewport overflow clipping.
     *
     * @param {HTMLElement | SVGElement | Element | null} element - Any DOM element carrying the hint attribute.
     * @param {number | null} [clientX=null] - Optional pointer X coordinate in viewport space.
     * @returns {void}
     */
    positionTooltip(element, clientX = null) {
        if (
            !element ||
            typeof element.getAttribute !== "function" ||
            !("style" in element)
        ) {
            return;
        }

        /** @type {HTMLElement | SVGElement} */
        const styledElement = /** @type {HTMLElement | SVGElement} */ (element);

        /** @type {string | null} */
        const rawHint = styledElement.getAttribute(this.hintAttribute);
        /** @type {string} */
        const hint = typeof rawHint === "string" ? rawHint.trim() : "";
        if (!hint) {
            return;
        }

        /** @type {DOMRect} */
        const rect = styledElement.getBoundingClientRect();
        /** @type {number} */
        const vw =
            typeof window.innerWidth === "number"
                ? window.innerWidth
                : document.documentElement.clientWidth;
        /** @type {number} */
        const vh =
            typeof window.innerHeight === "number"
                ? window.innerHeight
                : document.documentElement.clientHeight;

        /** @type {number} */
        const estWidth = Math.min(
            hint.length * this.charWidthEstimate +
                this.horizontalPaddingEstimate,
            Math.max(vw - this.margin * 2, 0),
        );
        /** @type {number} */
        const estHeight = this.estimatedHeight;

        /** @type {number} */
        const anchorX =
            typeof clientX === "number" &&
            Number.isFinite(clientX) &&
            clientX > 0
                ? clientX
                : rect.left + rect.width / 2;

        /** @type {number} */
        const halfW = estWidth / 2;
        /** @type {number} */
        const minCenterX = this.margin + halfW;
        /** @type {number} */
        const maxCenterX = Math.max(vw - this.margin - halfW, minCenterX);
        /** @type {number} */
        const clampedX = Math.min(Math.max(anchorX, minCenterX), maxCenterX);

        /** @type {number} */
        const spaceBelow = vh - rect.bottom;
        /** @type {boolean} */
        const placeAbove =
            spaceBelow < estHeight + this.gap + this.margin &&
            rect.top > estHeight + this.gap + this.margin;

        /** @type {Record<string, string>} */
        const cssVars = {};

        if (placeAbove) {
            /** @type {number} */
            const tipBottomY = rect.top - this.gap;
            cssVars["--tooltip-tip-x"] = `${clampedX}px`;
            cssVars["--tooltip-tip-y"] = `${tipBottomY}px`;
            cssVars["--tooltip-tip-tx"] = "-50%";
            cssVars["--tooltip-tip-ty"] = "-100%";

            cssVars["--tooltip-arrow-x"] = `${anchorX}px`;
            cssVars["--tooltip-arrow-y"] = `${rect.top - this.gap}px`;
            cssVars["--tooltip-arrow-ty"] = "0px";
            cssVars["--tooltip-arrow-rotate"] = "180deg";
        } else {
            /** @type {number} */
            const tipTopY = rect.bottom + this.gap;
            cssVars["--tooltip-tip-x"] = `${clampedX}px`;
            cssVars["--tooltip-tip-y"] = `${tipTopY}px`;
            cssVars["--tooltip-tip-tx"] = "-50%";
            cssVars["--tooltip-tip-ty"] = "0px";

            cssVars["--tooltip-arrow-x"] = `${anchorX}px`;
            cssVars["--tooltip-arrow-y"] = `${rect.bottom + 1}px`;
            cssVars["--tooltip-arrow-ty"] = "0px";
            cssVars["--tooltip-arrow-rotate"] = "0deg";
        }

        Object.keys(cssVars).forEach((varName) => {
            styledElement.style.setProperty(varName, cssVars[varName] ?? "");
        });
    }

    /**
     * Attaches delegated `pointermove` and `focusin` listeners to the specified root container or `document`.
     *
     * @param {HTMLElement | Document | null} [root=document] - Event delegation scope.
     * @returns {this} Returns `this` for fluent chaining.
     */
    mount(root = document) {
        this.unmount();

        /** @type {HTMLElement | Document} */
        const targetRoot = root || document;
        this._boundRoot = targetRoot;

        targetRoot.addEventListener(
            "pointermove",
            /** @type {EventListener} */ (this._handlePointerMove),
            {
                passive: true,
            },
        );
        targetRoot.addEventListener(
            "focusin",
            /** @type {EventListener} */ (this._handleFocusIn),
        );

        return this;
    }

    /**
     * Removes previously attached event listeners cleanly to prevent duplicate handlers or memory leaks.
     *
     * @returns {this} Returns `this` for fluent chaining.
     */
    unmount() {
        if (this._boundRoot) {
            this._boundRoot.removeEventListener(
                "pointermove",
                /** @type {EventListener} */ (this._handlePointerMove),
            );
            this._boundRoot.removeEventListener(
                "focusin",
                /** @type {EventListener} */ (this._handleFocusIn),
            );
            this._boundRoot = null;
        }
        return this;
    }
}

/**
 * =============================================================================
 * ALIGNED COMPANION CSS REFERENCE (@layer pb-tokens & @layer pb-components):
 * -----------------------------------------------------------------------------
 * Ensure your stylesheet defines the `--tooltip-*` custom properties and targets
 * `[data-hint]` so buttons, links, spans, inputs, badges, and icons all work:
 *
 * @layer pb-tokens {
 *     :root {
 *         --tooltip-bg: #111827;
 *         --tooltip-text: #ffffff;
 *         --tooltip-font-size: 0.75rem;
 *         --tooltip-radius: 0.375rem;
 *         --tooltip-max-width: min(18rem, calc(100vw - 1.5rem));
 *
 *         --tooltip-tip-x: 50%;
 *         --tooltip-tip-y: 50%;
 *         --tooltip-tip-tx: -50%;
 *         --tooltip-tip-ty: 0px;
 *         --tooltip-arrow-x: 50%;
 *         --tooltip-arrow-y: 50%;
 *         --tooltip-arrow-ty: 0px;
 *         --tooltip-arrow-rotate: 0deg;
 *     }
 * }
 * =============================================================================
 */

/**
 * =============================================================================
 * REAL-WORLD USAGE, CUSTOMIZATION & RE-REFERENCE GUIDE (10,000+ PROJECTS):
 * =============================================================================
 *
 * 1. HOW TO IMPORT, PASS VALUES & CALL IN AN ATTACHED HTML / ENTRY JS SCRIPT:
 *    ```javascript
 *    import { ViewportTooltipController } from './ViewportTooltipController.js';
 *
 *    document.addEventListener('DOMContentLoaded', () => {
 *        // Universal mode: works on <button>, <a>, <span>, <input>, <div>, <svg>, etc.
 *        const tooltipController = new ViewportTooltipController({
 *            margin: 12,
 *            gap: 8,
 *            selector: '[data-hint]',
 *            hintAttribute: 'data-hint',
 *        });
 *        tooltipController.mount(document);
 *
 *        // Optional manual positioning on any element (e.g., an anchor link or button):
 *        /** @type {HTMLElement | null} *\/
 *        const navLink = document.getElementById('audit-report-link');
 *        tooltipController.positionTooltip(navLink, 240);
 *    });
 *    ```
 *
 * 2. CUSTOM PROPS / CONFIGURATION OPTIONS USAGE SEPARATELY BY ANOTHER FILE:
 *    - `margin`: `new ViewportTooltipController({ margin: 16 }).mount()`
 *    - `gap`: `new ViewportTooltipController({ gap: 10 }).mount()`
 *    - `estimatedHeight`: `new ViewportTooltipController({ estimatedHeight: 44 }).mount()`
 *    - `charWidthEstimate`: `new ViewportTooltipController({ charWidthEstimate: 8 }).mount()`
 *    - `horizontalPaddingEstimate`: `new ViewportTooltipController({ horizontalPaddingEstimate: 28 }).mount()`
 *    - `selector` (Any element): `new ViewportTooltipController({ selector: '[data-hint], a[title], button[data-tip]' }).mount()`
 *    - `hintAttribute`: `new ViewportTooltipController({ hintAttribute: 'data-tooltip-hint' }).mount()`
 *
 * 3. DOMAIN-SPECIFIC EXAMPLES ACROSS ALL 21 SECTORS (BUTTONS, LINKS, BADGES & INPUTS):
 *    - Agriculture: `<a href="/sensors" data-hint="Inspect soil moisture sensor telemetry">Soil Telemetry</a>`
 *    - Defense: `<button type="button" data-hint="Verify tactical supply manifest">Verify Manifest</button>`
 *    - Education: `<a href="/rubrics" data-hint="Publish semester grading rubric">Grading Rubric</a>`
 *    - Energy: `<span tabindex="0" data-hint="Feeder line breaker isolated">Status: Isolated</span>`
 *    - Minerals: `<button type="button" data-hint="Log core sample assay result">Log Assay</button>`
 *    - Finance: `<a href="/reconcile" data-hint="Reconcile settlement clearing batch">Settlements</a>`
 *    - Health: `<button type="button" data-hint="Confirm patient triage priority">Confirm Triage</button>`
 *    - Justice: `<a href="/docket" data-hint="Assign case to appellate docket">Appellate Docket</a>`
 *    - Security: `<span tabindex="0" data-hint="Escalate access anomaly alert">Anomaly Alert</span>`
 *    - Real Estate: `<a href="/leases" data-hint="Generate lease valuation summary">Lease Summary</a>`
 *    - Government: `<button type="button" data-hint="Submit public procurement notice">Submit Notice</button>`
 *    - Labour: `<a href="/shifts" data-hint="Audit shift compliance log">Shift Logs</a>`
 *    - Science: `<button type="button" data-hint="Archive raw spectral dataset">Archive Data</button>`
 *    - Tech: `<a href="/deploy" data-hint="Trigger staging deployment pipeline">Staging Pipeline</a>`
 *    - Environment: `<span tabindex="0" data-hint="Watershed turbidity within safe threshold">Turbidity OK</span>`
 *    - Water: `<button type="button" data-hint="Open main reservoir valve status">Valve Status</button>`
 *    - Transport: `<a href="/routes" data-hint="Dispatch fleet route schedule">Fleet Routes</a>`
 *    - Sports: `<button type="button" data-hint="Finalize match officiating sheet">Finalize Sheet</button>`
 *    - Construction: `<a href="/inspections" data-hint="Approve structural pour checklist">Pour Checklist</a>`
 *    - Trade & Commerce: `<input type="text" data-hint="Enter 8-digit HS customs tariff code" />`
 *    - Tourism: `<a href="/tours" data-hint="Update guided tour availability">Guided Tours</a>`
 *
 * 4. FUTURE MODIFICATIONS - PINPOINTING WHERE & HOW TO ADD CODE:
 *    To add custom logic (such as disabling tooltips on touch-only devices, skipping disabled inputs,
 *    or logging focus events) across any of the 21 sectors, locate `positionTooltip()` and add your
 *    guard right after extracting `styledElement`:
 *    ```javascript
 *    // Inside ViewportTooltipController.positionTooltip(element, clientX = null):
 *    /** \@type {HTMLElement | SVGElement} *\/
 *    const styledElement = /** \@type {HTMLElement | SVGElement} *\/ (element);
 *
 *    // [FUTURE MODIFICATION POINT]: Add custom element filter or telemetry hook here
 *    if (styledElement.hasAttribute("data-hint-disabled")) {
 *        return;
 *    }
 *    ```
 * =============================================================================
 */
