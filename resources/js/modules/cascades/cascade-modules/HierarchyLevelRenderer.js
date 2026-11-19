import { AjaxErrorDisplay } from "./AjaxErrorDisplay.js";

export class HierarchyLevelRenderer {
    /**
     * Removes any rendered level rows deeper than `currentLevel`.
     *
     * @param {HTMLElement} container
     * @param {number} currentLevel
     * @param {string} levelRowPrimary
     * @param {string} levelRowAttr
     * @returns {void}
     */
    static pruneDeeperLevels(
        container,
        currentLevel,
        levelRowPrimary,
        levelRowAttr,
    ) {
        const existingLevels = container.querySelectorAll(
            `.${levelRowPrimary}`,
        );
        existingLevels.forEach((div) => {
            const levelNum = parseInt(
                div.getAttribute(levelRowAttr) || "0",
                10,
            );
            if (levelNum > currentLevel) {
                div.remove();
            }
        });
    }

    /**
     * Fetches children for `selectedSlug` and appends the next cascading level row.
     *
     * @param {import('../NestedDropdownManager.js').NestedDropdownManager} manager
     * @param {HTMLElement} container
     * @param {string} selectedSlug
     * @param {number} currentLevel
     * @param {import('./BinderConfigResolver.js').ResolvedBinderConfig} cfg
     * @returns {Promise<void>}
     */
    static async renderNextLevel(
        manager,
        container,
        selectedSlug,
        currentLevel,
        cfg,
    ) {
        const {
            groupingName,
            capitalizedName,
            hiddenClass,
            classes,
            attrs,
            hints,
            buttonLabels,
        } = cfg;

        try {
            const fetchRoute =
                typeof manager.apiCRUDRoutes_ToGroupingDb?.fetchChildren ===
                "function"
                    ? manager.apiCRUDRoutes_ToGroupingDb.fetchChildren(
                          selectedSlug,
                      )
                    : `/api/v1/${groupingName}s/${selectedSlug}/children`;

            const res = await fetch(fetchRoute, {
                method: "GET",
                headers: { Accept: "application/json" },
                credentials: "include",
            });

            if (!res.ok) {
                const messages = await AjaxErrorDisplay.extractMessages(res);
                AjaxErrorDisplay.show(manager, container, messages);
                return;
            }

            AjaxErrorDisplay.clear(manager, container);

            const json = await res.json();
            const children = json.data || [];

            const nextLevel = currentLevel + 1;
            const newLevelDiv = document.createElement("div");
            newLevelDiv.className = classes.levelRow;
            newLevelDiv.setAttribute(attrs.levelRow, String(nextLevel));

            newLevelDiv.innerHTML = `
                <select class="${classes.select}" ${attrs.level}="${nextLevel}">
                    <option value="">Choose ${capitalizedName} Level ${nextLevel}</option>
                    ${children
                        .map(
                            (/** @type {any} */ child) =>
                                `<option value="${child.slug}" ${attrs.slug}="${child.slug}">${child.name}</option>`,
                        )
                        .join("")}
                </select>
                <input type="text" class="${classes.renameInput}" ${attrs.level}="${nextLevel}" placeholder="Rename tier...">
                <button type="button" class="${classes.renameBtn}" ${attrs.level}="${nextLevel}" ${attrs.hint}="${hints.rename}">${buttonLabels.rename}</button>
                <button type="button" class="${classes.addBtn}" ${attrs.level}="${nextLevel}" ${attrs.hint}="${hints.add}">${buttonLabels.add}</button>
                <button type="button" class="${classes.removeBtn}" ${attrs.level}="${nextLevel}" ${attrs.hint}="${hints.remove}">${buttonLabels.remove}</button>
                <div class="${classes.inlineAdd} ${hiddenClass}" ${attrs.level}="${nextLevel}">
                    <input type="text" class="${classes.newItemInput}" ${attrs.level}="${nextLevel}" placeholder="New ${groupingName} name...">
                    <button type="button" class="${classes.saveItemBtn}" ${attrs.level}="${nextLevel}" ${attrs.hint}="${hints.save}">${buttonLabels.save}</button>
                </div>
            `;

            container.appendChild(newLevelDiv);
        } catch (e) {
            AjaxErrorDisplay.show(manager, container, [
                `Failed to load child ${groupingName} hierarchy levels.`,
            ]);
        }
    }
}
