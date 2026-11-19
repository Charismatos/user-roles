import { DynamicAlertManager } from "../../modules/alerts/alert";
import { ViewportTooltipController } from "../../modules/tooltips/ViewportTooltipController";

const myAlertManager = new DynamicAlertManager({
    alertSelector: ".user_logout_success_alert, .pa-alert", // OR alertSelector:".pa-alert" for all alerts
    autoDismiss: true,
    dismissTimeout: 4000,
    dismissible: true,

    // Injecting lifecycle hooks without modifying core source code
    lifecycleHooks: {
        onInit: (alerts) => {
            console.log(
                `Alert manager active across ${alerts.length} notifications.`,
            );
        },
        onDismiss: (alert) => {
            // Custom analytics or cleanup when an alert is closed
        },
    },
});

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
