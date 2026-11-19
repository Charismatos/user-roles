import { AjaxErrorDisplay } from "./AjaxErrorDisplay.js";
import { AjaxSuccessAlert } from "./AjaxSuccessAlert.js";
import { CookieHelper } from "./CookieHelper.js";

export class GroupingItemRenamer {
    /**
     * Renames the currently selected grouping option via PATCH (or locally for `tmp-` items).
     *
     * @param {import('../NestedDropdownManager.js').NestedDropdownManager} manager
     * @param {HTMLElement} container
     * @param {HTMLElement | null} levelDiv
     * @param {HTMLSelectElement | null} selectEl
     * @param {import('./BinderConfigResolver.js').ResolvedBinderConfig} cfg
     * @returns {Promise<void>}
     */
    static async renameItem(manager, container, levelDiv, selectEl, cfg) {
        const { groupingName, capitalizedName, primary, attrs, fields } = cfg;

        if (!selectEl || selectEl.selectedIndex === -1) return;

        /** @type {HTMLInputElement | null} */
        const inputField = /** @type {HTMLInputElement | null} */ (
            levelDiv?.querySelector(`.${primary.renameInput}`)
        );
        const newVal =
            inputField && typeof inputField.value === "string"
                ? inputField.value.trim()
                : "";

        if (!newVal) {
            AjaxErrorDisplay.show(manager, container, [
                `Please enter a new name to rename the ${groupingName} tier.`,
            ]);
            return;
        }

        const selectedOption = selectEl.options[selectEl.selectedIndex];
        const categorySlug = selectedOption
            ? selectedOption.getAttribute(attrs.slug) || selectedOption.value
            : selectEl.value;

        if (!categorySlug) return;

        if (
            categorySlug.startsWith("tmp-") ||
            selectEl.value.startsWith("tmp-")
        ) {
            AjaxErrorDisplay.clear(manager, container);
            AjaxSuccessAlert.clear(manager, container);
            if (selectedOption) {
                selectedOption.text = newVal;
            }
            if (inputField) inputField.value = "";
            AjaxSuccessAlert.show(
                manager,
                container,
                "update",
                `${capitalizedName} Updated Successfuly`,
            );
            return;
        }

        /** @type {Record<string, any>} */
        const formData = {};
        formData[fields.name] = newVal;

        try {
            AjaxErrorDisplay.clear(manager, container);
            AjaxSuccessAlert.clear(manager, container);

            const patchRoute =
                typeof manager.apiCRUDRoutes_ToGroupingDb?.patch === "function"
                    ? manager.apiCRUDRoutes_ToGroupingDb.patch(categorySlug)
                    : `${manager.apiCRUDRoutes_ToGroupingDb?.patch}/${categorySlug}`;

            const res = await fetch(patchRoute, {
                method: "PATCH",
                headers: CookieHelper.jsonHeaders(true),
                credentials: "include",
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                const messages = await AjaxErrorDisplay.extractMessages(res);
                AjaxErrorDisplay.show(manager, container, messages);
                return;
            }

            const responseJson = await res.json();
            const updatedItem = responseJson.data || responseJson;
            const updatedSlug = updatedItem.slug || categorySlug;

            if (selectedOption) {
                selectedOption.text = newVal;
                selectedOption.value = updatedSlug;
                selectedOption.setAttribute(attrs.slug, updatedSlug);
            }
            if (inputField) {
                inputField.value = "";
            }

            const successMsg =
                responseJson?.message ||
                `${capitalizedName} Updated Successfuly`;
            AjaxSuccessAlert.show(manager, container, "update", successMsg);
        } catch (e) {
            AjaxErrorDisplay.show(manager, container, [
                `Network error while updating ${groupingName}.`,
            ]);
        }
    }
}
