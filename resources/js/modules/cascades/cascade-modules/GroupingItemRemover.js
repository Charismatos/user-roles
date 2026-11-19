import { AjaxErrorDisplay } from "./AjaxErrorDisplay.js";
import { AjaxSuccessAlert } from "./AjaxSuccessAlert.js";
import { CookieHelper } from "./CookieHelper.js";

export class GroupingItemRemover {
    /**
     * Deletes the currently selected grouping option after confirmation via DELETE
     * (or removes `tmp-` items locally), then updates the hidden target.
     *
     * @param {import('../NestedDropdownManager.js').NestedDropdownManager} manager
     * @param {HTMLElement} container
     * @param {HTMLSelectElement | null} selectEl
     * @param {import('./BinderConfigResolver.js').ResolvedBinderConfig} cfg
     * @returns {Promise<void>}
     */
    static async removeItem(manager, container, selectEl, cfg) {
        const { groupingName, capitalizedName, attrs } = cfg;

        if (!selectEl || selectEl.selectedIndex === -1) return;

        const selectedOption = selectEl.options[selectEl.selectedIndex];
        const slugToDelete = selectedOption
            ? selectedOption.getAttribute(attrs.slug) || selectedOption.value
            : selectEl.value;

        const currentlySelectedItem = selectedOption
            ? selectedOption.text
            : `this ${groupingName}`;

        if (!slugToDelete) return;

        if (
            !window.confirm(
                `Are you sure you want to remove ${currentlySelectedItem}?`,
            )
        ) {
            return;
        }

        if (
            slugToDelete.startsWith("tmp-") ||
            selectEl.value.startsWith("tmp-")
        ) {
            AjaxErrorDisplay.clear(manager, container);
            AjaxSuccessAlert.clear(manager, container);
            selectEl.remove(selectEl.selectedIndex);
            selectEl.value = "";
            manager.updateTheHiddenInputDataValueWithDbIdOfSelectedGroupingOptionInTheGivenSelectElement(
                selectEl,
            );
            AjaxSuccessAlert.show(
                manager,
                container,
                "delete",
                `${capitalizedName} Deleted Successfuly`,
            );
            return;
        }

        try {
            AjaxErrorDisplay.clear(manager, container);
            AjaxSuccessAlert.clear(manager, container);

            const deleteRoute =
                typeof manager.apiCRUDRoutes_ToGroupingDb?.delete === "function"
                    ? manager.apiCRUDRoutes_ToGroupingDb.delete(slugToDelete)
                    : `${manager.apiCRUDRoutes_ToGroupingDb?.delete}/${slugToDelete}`;

            const res = await fetch(deleteRoute, {
                method: "DELETE",
                headers: CookieHelper.jsonHeaders(false),
                credentials: "include",
            });

            if (!res.ok) {
                const messages = await AjaxErrorDisplay.extractMessages(res);
                AjaxErrorDisplay.show(manager, container, messages);
                return;
            }

            selectEl.remove(selectEl.selectedIndex);
            selectEl.value = "";

            manager.updateTheHiddenInputDataValueWithDbIdOfSelectedGroupingOptionInTheGivenSelectElement(
                selectEl,
            );

            const successMsg = await AjaxSuccessAlert.extractMessage(
                res,
                "delete",
                capitalizedName,
            );
            AjaxSuccessAlert.show(manager, container, "delete", successMsg);
        } catch (e) {
            AjaxErrorDisplay.show(manager, container, [
                `Network error while deleting ${groupingName}.`,
            ]);
        }
    }
}
