import { NestedDropdownManager } from "../../modules/cascades/NestedDropdownManager";
import { ViewportTooltipController } from "../../modules/tooltips/ViewportTooltipController";

document.addEventListener("DOMContentLoaded", () => {
    // 1. Initialize Category Dropdown Manager
    const categoryHub = document.getElementById("category_cascading_hub");
    /** @type {HTMLInputElement | null} */
    const categoryTarget = /** @type {HTMLInputElement | null} */ (
        document.getElementById("final_category_target")
    );

    if (categoryHub && categoryTarget) {
        const categoryManager = new NestedDropdownManager("category")
            .formElementsSelectors(
                "tier-name-input",
                "btn-add-tier pl-green",
                "btn-remove-tier pl-red",
                "category-select",
                {
                    levelRow: "cascading-level-div",
                    renameBtn: "btn-rename-tier pl-purple",
                    inlineAddContainer: "inline-add-container",
                    newItemInput: "new-item-input",
                    saveItemBtn: "btn-save-item pl-blue",
                    hiddenClass: "hidden",
                },
                {
                    levelAttr: "data-level",
                    levelRowAttr: "data-level-row",
                    slugAttr: "data-slug",
                    hintAttr: "data-hint", // if a future page/sector ever needs a different hint attribute name (such as data-tooltip or data-role-hint) on the buttons while ViewportTooltipController is configured to read that same attribute.
                },
            )
            .inputFieldNames("name", "parent_id", {
                parentSlug: "parent_slug",
            });

        categoryManager.buttonRolesOnHoverDecriptions = {
            ...categoryManager.buttonRolesOnHoverDecriptions,
            rename: "Submit Renamed Category",
            add: "Generate Form Field To Add New Category",
            remove: "Delete Selected Category",
            save: "Store Entered Category",
        };

        categoryManager.formButtonLabelsGet({
            rename: "Rename Category",
            add: "+ New Missing Category",
            remove: "✕ Remove Selected",
            save: "Save",
        });

        const activePath = JSON.parse(categoryHub.dataset.activePath || "[]");
        categoryManager.listenToDispatchedEventsAboutGroupingsWithInTheGivenElements(
            categoryHub,
            categoryTarget,
            activePath,
        );
    }
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
