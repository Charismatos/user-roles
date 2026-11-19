import { BinderConfigResolver } from "./BinderConfigResolver.js";

export class AjaxErrorDisplay {
    /**
     * Escapes HTML special characters to prevent XSS when injecting error messages.
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
     * Resolves the error container element scoped to the form/card/container.
     *
     * @param {HTMLElement} container
     * @param {string} [errorBoxSelector=".cascading-ajax-errors, .pfe-alert-box"]
     * @param {boolean} [createIfMissing=true]
     * @returns {HTMLElement | null}
     */
    static #resolveErrorBox(
        container,
        errorBoxSelector = ".cascading-ajax-errors, .pfe-alert-box",
        createIfMissing = true,
    ) {
        const scope =
            container.closest("form") ||
            container.closest(".pf-card-bounding-box") ||
            container.parentElement ||
            container;

        /** @type {HTMLElement | null} */
        let errorBox = scope.querySelector(errorBoxSelector);

        if (!errorBox && createIfMissing) {
            errorBox = document.createElement("div");
            errorBox.className = "pfe-alert-box cascading-ajax-errors";
            errorBox.setAttribute("role", "alert");
            errorBox.setAttribute("aria-live", "polite");
            container.prepend(errorBox);
        }

        return errorBox;
    }

    /**
     * Extracts readable error messages from a failed `fetch` Response object.
     *
     * @param {Response} res
     * @returns {Promise<string[]>}
     */
    static async extractMessages(res) {
        try {
            const data = await res.json();
            /** @type {string[]} */
            const messages = [];

            if (data?.errors && typeof data.errors === "object") {
                Object.values(data.errors).forEach((fieldErrors) => {
                    if (Array.isArray(fieldErrors)) {
                        fieldErrors.forEach((err) =>
                            messages.push(String(err)),
                        );
                    } else if (fieldErrors) {
                        messages.push(String(fieldErrors));
                    }
                });
            }

            if (messages.length === 0 && data?.message) {
                messages.push(String(data.message));
            }

            if (messages.length === 0) {
                messages.push(`Request failed with status ${res.status}.`);
            }

            return messages;
        } catch {
            return [`Request failed with status ${res.status}.`];
        }
    }

    /**
     * Renders validation/API error messages into the resolved error container.
     *
     * @param {import('../NestedDropdownManager.js').NestedDropdownManager} manager
     * @param {HTMLElement} container
     * @param {string[]} messages
     * @returns {void}
     */
    static show(manager, container, messages) {
        const cfg = BinderConfigResolver.resolve(manager);
        const errorBox = AjaxErrorDisplay.#resolveErrorBox(
            container,
            ".cascading-ajax-errors, .pfe-alert-box",
            true,
        );
        if (!errorBox) return;

        const safeMessages = Array.isArray(messages)
            ? messages.filter(Boolean)
            : [];
        const fallbackMsg = `Unable to complete ${cfg.groupingName} request.`;
        const itemsToRender =
            safeMessages.length > 0 ? safeMessages : [fallbackMsg];

        const listItems = itemsToRender
            .map((msg) => `<li>${AjaxErrorDisplay.#escapeHtml(msg)}</li>`)
            .join("");

        errorBox.innerHTML = `<ul>${listItems}</ul>`;
        errorBox.classList.remove(cfg.hiddenClass);
    }

    /**
     * Clears and hides previously rendered AJAX error messages.
     *
     * @param {import('../NestedDropdownManager.js').NestedDropdownManager} manager
     * @param {HTMLElement} container
     * @returns {void}
     */
    static clear(manager, container) {
        const cfg = BinderConfigResolver.resolve(manager);
        const errorBox = AjaxErrorDisplay.#resolveErrorBox(
            container,
            ".cascading-ajax-errors",
            false,
        );
        if (errorBox) {
            errorBox.innerHTML = "";
            errorBox.classList.add(cfg.hiddenClass);
        }
    }
}
