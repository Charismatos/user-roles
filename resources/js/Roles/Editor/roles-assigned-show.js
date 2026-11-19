import { DynamicAlertManager } from "../../modules/alerts/alert";
import { ViewportTooltipController } from "../../modules/tooltips/ViewportTooltipController";

// 1. Initialize Flash Notifications Alert Manager with Custom Dismiss Button Classes
const myAlertManager = new DynamicAlertManager({
    alertSelector: ".roles_assigned_agreed_success_alert, .pa-alert",
    autoDismiss: true,
    dismissTimeout: 4000,
    dismissible: true,

    // Inject custom design system classes here!
    dismissButtonClass: "alert-dismiss-btn pb-btn pb-outline",

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
