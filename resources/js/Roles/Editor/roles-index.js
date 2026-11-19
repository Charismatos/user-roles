import { ViewportTooltipController } from "../../modules/tooltips/ViewportTooltipController";

document.addEventListener("DOMContentLoaded", () => {
    // Universal mode: works on <button>, <a>, <span>, <input>, <div>, <svg>, etc.
    const tooltipController = new ViewportTooltipController({
        margin: 12,
        gap: 8,
        selector: "[data-hint]",
        hintAttribute: "data-hint",
    });
    tooltipController.mount(document);

    // Optional manual positioning on any element (e.g., an anchor link or button):
    /** @type {HTMLElement | null} *\/
        const navLink = document.getElementById('audit-report-link');
        tooltipController.positionTooltip(navLink, 240); **/
});
