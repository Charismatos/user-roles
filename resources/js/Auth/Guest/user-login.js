import { DynamicAlertManager } from "../../modules/alerts/alert";

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
