import { DynamicAlertManager } from "../../modules/alerts/alert";

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
