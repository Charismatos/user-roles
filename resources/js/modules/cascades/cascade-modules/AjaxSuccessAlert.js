import { BinderConfigResolver } from "./BinderConfigResolver.js";

export class AjaxSuccessAlert {
    /**
     * Escapes HTML special characters to prevent XSS when injecting alert messages.
     *
     * @param {string} str
     * @returns {string}
     */
    static #escapeHtml(str) {
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }

    /**
     * Resolves the success alert container scoped to the card/form/container.
     * Matches action-specific classes (e.g. `.category_store_success_alert`) first,
     * with a fallback to a generic `.cascading-ajax-success` or `.pa-alert.pa-success` element.
     *
     * @param {HTMLElement} container
     * @param {"store" | "update" | "delete"} action
     * @param {string} groupingName
     * @param {boolean} [createIfMissing=true]
     * @returns {HTMLElement | null}
     */
    static #resolveAlertBox(
        container,
        action,
        groupingName,
        createIfMissing = true,
    ) {
        const scope =
            container.closest(".pf-card-bounding-box") ||
            container.closest("form") ||
            container.parentElement ||
            container;

        const actionSelector = `.${groupingName}_${action}_success_alert`;
        /** @type {HTMLElement | null} */
        let alertBox = scope.querySelector(actionSelector);

        if (!alertBox) {
            alertBox = scope.querySelector(".cascading-ajax-success");
        }

        if (!alertBox && createIfMissing) {
            alertBox = document.createElement("div");
            alertBox.className = `pa-alert pa-success cascading-ajax-success ${groupingName}_${action}_success_alert hidden`;
            alertBox.setAttribute("role", "alert");
            alertBox.setAttribute("data-auto-dismiss", "true");

            const cardBox = container.closest(".pf-card-bounding-box");
            if (cardBox) {
                cardBox.prepend(alertBox);
            } else {
                container.prepend(alertBox);
            }
        }

        return alertBox;
    }

    /**
     * Extracts a success message from a `fetch` JSON response, falling back to a default
     * message matching your Blade `<x-alerts.alert>` copy.
     *
     * @param {Response} res
     * @param {"store" | "update" | "delete"} action
     * @param {string} capitalizedName
     * @returns {Promise<string>}
     */
    static async extractMessage(res, action, capitalizedName) {
        const defaults = {
            store: `${capitalizedName} Added Successfuly`,
            update: `${capitalizedName} Updated Successfuly`,
            delete: `${capitalizedName} Deleted Successfuly`,
        };

        try {
            const data = await res.json();
            if (
                data &&
                typeof data.message === "string" &&
                data.message.trim() !== ""
            ) {
                return data.message.trim();
            }
            return (
                defaults[action] ||
                `${capitalizedName} Action Completed Successfuly`
            );
        } catch {
            return (
                defaults[action] ||
                `${capitalizedName} Action Completed Successfuly`
            );
        }
    }

    /**
     * Displays the success alert message and optionally schedules auto-dismissal.
     *
     * @param {import('../NestedDropdownManager.js').NestedDropdownManager} manager
     * @param {HTMLElement} container
     * @param {"store" | "update" | "delete"} action
     * @param {string} message
     * @param {number} [autoDismissMs=4000]
     * @returns {void}
     */
    static show(manager, container, action, message, autoDismissMs = 4000) {
        const cfg = BinderConfigResolver.resolve(manager);
        const alertBox = AjaxSuccessAlert.#resolveAlertBox(
            container,
            action,
            cfg.groupingName,
            true,
        );
        if (!alertBox) return;

        /** @type {HTMLElement | null} */
        let msgEl = alertBox.querySelector(".pa-msg");
        if (!msgEl) {
            msgEl = document.createElement("span");
            msgEl.className = "pa-msg";
            alertBox.appendChild(msgEl);
        }

        msgEl.innerHTML = AjaxSuccessAlert.#escapeHtml(
            message || `${cfg.capitalizedName} Completed Successfuly`,
        );
        alertBox.classList.remove(cfg.hiddenClass);

        if (alertBox.dataset.dismissTimer) {
            window.clearTimeout(Number(alertBox.dataset.dismissTimer));
        }

        if (
            alertBox.getAttribute("data-auto-dismiss") === "true" &&
            autoDismissMs > 0
        ) {
            const timerId = window.setTimeout(() => {
                AjaxSuccessAlert.clear(manager, container, action);
            }, autoDismissMs);
            alertBox.dataset.dismissTimer = String(timerId);
        }
    }

    /**
     * Clears and hides success alert boxes.
     *
     * @param {import('../NestedDropdownManager.js').NestedDropdownManager} manager
     * @param {HTMLElement} container
     * @param {"store" | "update" | "delete" | null} [action=null]
     * @returns {void}
     */
    static clear(manager, container, action = null) {
        const cfg = BinderConfigResolver.resolve(manager);
        const scope =
            container.closest(".pf-card-bounding-box") ||
            container.closest("form") ||
            container.parentElement ||
            container;

        const targets = action
            ? scope.querySelectorAll(
                  `.${cfg.groupingName}_${action}_success_alert, .cascading-ajax-success`,
              )
            : scope.querySelectorAll(
                  `.pa-alert.pa-success[class*="_success_alert"], .cascading-ajax-success`,
              );

        targets.forEach((el) => {
            const htmlEl = /** @type {HTMLElement} */ (el);
            if (htmlEl.dataset.dismissTimer) {
                window.clearTimeout(Number(htmlEl.dataset.dismissTimer));
                delete htmlEl.dataset.dismissTimer;
            }
            const msgEl = htmlEl.querySelector(".pa-msg");
            if (msgEl) {
                msgEl.innerHTML = "";
            }
            htmlEl.classList.add(cfg.hiddenClass);
        });
    }
}
