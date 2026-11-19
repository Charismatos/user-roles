import { AjaxErrorDisplay } from "./AjaxErrorDisplay.js";
import { AjaxSuccessAlert } from "./AjaxSuccessAlert.js";
import { CookieHelper } from "./CookieHelper.js";

export class GroupingItemCreator {
    /**
     * Persists a new inline grouping item via POST, updates the select & hidden target,
     * and triggers success/error alerts.
     *
     * @param {import('../NestedDropdownManager.js').NestedDropdownManager} manager
     * @param {HTMLElement} container
     * @param {HTMLElement | null} levelDiv
     * @param {HTMLSelectElement | null} selectEl
     * @param {string | null} dataLevel
     * @param {import('./BinderConfigResolver.js').ResolvedBinderConfig} cfg
     * @returns {Promise<void>}
     */
    static async saveItem(
        manager,
        container,
        levelDiv,
        selectEl,
        dataLevel,
        cfg,
    ) {
        const {
            groupingName,
            capitalizedName,
            hiddenClass,
            primary,
            attrs,
            fields,
        } = cfg;

        /** @type {HTMLInputElement | null} */
        const inputField = /** @type {HTMLInputElement | null} */ (
            levelDiv?.querySelector(`.${primary.newItemInput}`)
        );
        const value =
            inputField && typeof inputField.value === "string"
                ? inputField.value.trim()
                : "";

        if (!value) {
            AjaxErrorDisplay.show(manager, container, [
                `Please enter a ${groupingName} name before saving.`,
            ]);
            return;
        }

        const parentLevel = dataLevel ? parseInt(dataLevel, 10) - 1 : 0;
        /** @type {HTMLSelectElement | null} */
        const parentSelect = /** @type {HTMLSelectElement | null} */ (
            container.querySelector(`select[${attrs.level}="${parentLevel}"]`)
        );
        const parentSlug =
            dataLevel && parseInt(dataLevel, 10) === 1
                ? ""
                : parentSelect?.selectedOptions[0]?.getAttribute(attrs.slug) ||
                  parentSelect?.value ||
                  "";

        /** @type {Record<string, any>} */
        const formData = {};
        formData[fields.name] = value;
        if (parentSlug) {
            formData[fields.parentSlug] = parentSlug;
        }
        if (fields.parentId && fields.parentId !== fields.parentSlug) {
            formData[fields.parentId] = null;
        }

        const storeUrl =
            typeof manager.apiCRUDRoutes_ToGroupingDb?.store === "string"
                ? manager.apiCRUDRoutes_ToGroupingDb.store
                : "";

        try {
            AjaxErrorDisplay.clear(manager, container);
            AjaxSuccessAlert.clear(manager, container);

            const res = await fetch(storeUrl, {
                method: "POST",
                headers: CookieHelper.jsonHeaders(true),
                credentials: "include",
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                const messages = await AjaxErrorDisplay.extractMessages(res);
                AjaxErrorDisplay.show(manager, container, messages);
                return;
            }

            /** @type {Record<string, any>} */
            const responseJson = await res.json();
            const newItem = responseJson.data || responseJson;

            const itemName = newItem[fields.name] || newItem.name || value;
            const itemSlug = newItem.slug || `tmp-${Date.now()}`;

            const newOption = new Option(
                itemName,
                String(itemSlug),
                true,
                true,
            );
            newOption.setAttribute(attrs.slug, itemSlug);

            selectEl?.add(newOption);
            if (inputField) {
                inputField.value = "";
            }

            levelDiv
                ?.querySelector(`.${primary.inlineAdd}`)
                ?.classList.add(hiddenClass);

            if (selectEl) {
                await manager.updateTheHiddenInputDataValueWithDbIdOfSelectedGroupingOptionInTheGivenSelectElement(
                    selectEl,
                );
            }

            const successMsg =
                responseJson?.message || `${capitalizedName} Added Successfuly`;
            AjaxSuccessAlert.show(manager, container, "store", successMsg);
        } catch (e) {
            AjaxErrorDisplay.show(manager, container, [
                `Network error while saving ${groupingName}.`,
            ]);
        }
    }
}
