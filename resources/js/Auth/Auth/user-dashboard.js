import { DynamicAlertManager } from "../../modules/alerts/alert";
import { UniversalAsideManager } from "../../modules/documents/aside";
import { UniversalDashboardNavigationManager } from "./UniversalDashboardNavigationManager";

// 1. Initialize Dashboard Navigation Shell Manager
const myDashboardNav = new UniversalDashboardNavigationManager({
    toggleSelector: "[data-sidebar-toggle]",
    sidebarSelector: "#asideSidebar",
    activeBodyClass: "sidebar-active",
    lifecycleHooks: {
        onInit: (sidebar, toggles) => {
            console.log(
                `Dashboard navigation initialized with ${toggles.length} toggle triggers.`,
            );
        },
        onToggle: (isOpen) => {
            console.log(
                `Mobile off-canvas sidebar state changed: isOpen = ${isOpen}`,
            );
        },
    },
});

// 2. Initialize Flash Notifications Alert Manager with Custom Dismiss Button Classes
const myAlertManager = new DynamicAlertManager({
    alertSelector:
        ".user_registration_success_alert, .user_update_success_alert, .user_login_success_alert, .pa-alert",
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

// 3. Initialize Universal Aside Manager
const myAsideManager = new UniversalAsideManager({
    asideSelector: "aside[data-hub-target], .sidebar-widget",
    enhanceNative: true,
    asideMetadataMap: {
        "user-bio-sidebar": {
            widgetType: "user-bio",
            userHandle: "charismadev",
        },
    },
    lifecycleHooks: {
        onInit: (asides) => {
            console.log(
                `Universal aside manager active across ${asides.length} elements.`,
            );
        },
        onRender: (aside, metadata) => {
            console.log(
                "Aside structural element rendered with metadata:",
                metadata,
            );
        },
    },
});
