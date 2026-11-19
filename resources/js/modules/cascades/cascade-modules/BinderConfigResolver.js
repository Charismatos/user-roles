/**
 * @typedef {Object} ResolvedBinderConfig
 * @property {string} groupingName
 * @property {string} capitalizedName
 * @property {string} hiddenClass
 * @property {{
 *   levelRow: string,
 *   select: string,
 *   renameInput: string,
 *   renameBtn: string,
 *   addBtn: string,
 *   removeBtn: string,
 *   inlineAdd: string,
 *   newItemInput: string,
 *   saveItemBtn: string,
 * }} classes
 * @property {{
 *   levelRow: string,
 *   select: string,
 *   renameInput: string,
 *   renameBtn: string,
 *   addBtn: string,
 *   removeBtn: string,
 *   inlineAdd: string,
 *   newItemInput: string,
 *   saveItemBtn: string,
 * }} primary
 * @property {{
 *   level: string,
 *   levelRow: string,
 *   slug: string,
 *   hint: string,
 * }} attrs
 * @property {{
 *   name: string,
 *   parentId: string,
 *   parentSlug: string,
 * }} fields
 * @property {{
 *   rename: string,
 *   add: string,
 *   remove: string,
 *   save: string,
 * }} hints
 * @property {{
 *   rename: string,
 *   add: string,
 *   remove: string,
 *   save: string,
 * }} buttonLabels
 */

export class BinderConfigResolver {
    /**
     * Extracts the primary (first) CSS class token from a class list string for single-class queries/checks.
     *
     * @param {string | undefined} classString
     * @param {string} fallback
     * @returns {string}
     */
    static primaryClass(classString, fallback) {
        const raw =
            typeof classString === "string" && classString.trim() !== ""
                ? classString.trim()
                : fallback;
        return raw.split(/\s+/)[0] || fallback;
    }

    /**
     * Resolves normalized grouping names, CSS class lists/primary tokens, DOM attribute names,
     * and form payload field names from a `NestedDropdownManager` instance with safe defaults.
     *
     * @param {import('../NestedDropdownManager.js').NestedDropdownManager} manager
     * @returns {ResolvedBinderConfig}
     */
    static resolve(manager) {
        const groupingName =
            typeof manager.groupingName === "string" &&
            manager.groupingName.trim() !== ""
                ? manager.groupingName.trim()
                : "group";
        const capitalizedName =
            groupingName.charAt(0).toUpperCase() + groupingName.slice(1);

        const cls = manager.classSelectors || {};
        const levelRowClasses = cls.levelRow || "cascading-level-div";
        const selectClasses =
            cls.select ||
            manager.selectElement_ClassName ||
            `${groupingName}-select`;
        const renameInputClasses =
            cls.renameInput ||
            manager.originalGroupingNameInput_ClassName ||
            "tier-name-input";
        const renameBtnClasses =
            cls.renameBtn ||
            manager.renameGroupingBtn_ClassName ||
            "btn-rename-tier";
        const addBtnClasses =
            cls.addBtn ||
            manager.addMissingGroupingBtn_ClassName ||
            "btn-add-tier";
        const removeBtnClasses =
            cls.removeBtn ||
            manager.removeExistsingGroupingBtn_ClassName ||
            "btn-remove-tier";
        const inlineAddClasses =
            cls.inlineAddContainer || "inline-add-container";
        const newItemInputClasses = cls.newItemInput || "new-item-input";
        const saveItemBtnClasses = cls.saveItemBtn || "btn-save-item";
        const hiddenClass = BinderConfigResolver.primaryClass(
            cls.hiddenClass,
            "hidden",
        );

        const attrs = manager.attributeConfig || {};
        const fields = manager.formFieldNames || {};
        const hoverRoles = manager.buttonRolesOnHoverDecriptions || {};
        const buttonLabels = manager.formButtonsLabels || {};

        return {
            groupingName,
            capitalizedName,
            hiddenClass,
            classes: {
                levelRow: levelRowClasses,
                select: selectClasses,
                renameInput: renameInputClasses,
                renameBtn: renameBtnClasses,
                addBtn: addBtnClasses,
                removeBtn: removeBtnClasses,
                inlineAdd: inlineAddClasses,
                newItemInput: newItemInputClasses,
                saveItemBtn: saveItemBtnClasses,
            },
            primary: {
                levelRow: BinderConfigResolver.primaryClass(
                    levelRowClasses,
                    "cascading-level-div",
                ),
                select: BinderConfigResolver.primaryClass(
                    selectClasses,
                    `${groupingName}-select`,
                ),
                renameInput: BinderConfigResolver.primaryClass(
                    renameInputClasses,
                    "tier-name-input",
                ),
                renameBtn: BinderConfigResolver.primaryClass(
                    renameBtnClasses,
                    "btn-rename-tier",
                ),
                addBtn: BinderConfigResolver.primaryClass(
                    addBtnClasses,
                    "btn-add-tier",
                ),
                removeBtn: BinderConfigResolver.primaryClass(
                    removeBtnClasses,
                    "btn-remove-tier",
                ),
                inlineAdd: BinderConfigResolver.primaryClass(
                    inlineAddClasses,
                    "inline-add-container",
                ),
                newItemInput: BinderConfigResolver.primaryClass(
                    newItemInputClasses,
                    "new-item-input",
                ),
                saveItemBtn: BinderConfigResolver.primaryClass(
                    saveItemBtnClasses,
                    "btn-save-item",
                ),
            },
            attrs: {
                level: attrs.levelAttr || "data-level",
                levelRow: attrs.levelRowAttr || "data-level-row",
                slug: attrs.slugAttr || "data-slug",
                hint: attrs.hintAttr || "data-hint",
            },
            fields: {
                name: fields.name || "name",
                parentId: fields.parentId || "parent_id",
                parentSlug: fields.parentSlug || "parent_slug",
            },
            hints: {
                rename:
                    hoverRoles.rename || `Submit Renamed ${capitalizedName}`,
                add:
                    hoverRoles.add ||
                    `Generate Form Field To Add New ${capitalizedName}`,
                remove:
                    hoverRoles.remove || `Delete Selected ${capitalizedName}`,
                save: hoverRoles.save || `Store Entered ${capitalizedName}`,
            },
            buttonLabels: {
                rename: buttonLabels.rename || `Rename ${capitalizedName}`,
                add: buttonLabels.add || `+ New Missing ${capitalizedName}`,
                remove: buttonLabels.remove || "✕ Remove Selected",
                save: buttonLabels.save || "Save",
            },
        };
    }
}
