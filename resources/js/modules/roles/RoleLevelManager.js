/**
 * =============================================================================
 * GLOSSARY OF ABBREVIATIONS USED WITHIN THIS FILE & COMMENTS:
 * -----------------------------------------------------------------------------
 * - DOM   : Document Object Model
 * - API   : Application Programming Interface
 * - JSON   : JavaScript Object Notation
 * - UI    : User Interface
 * - SDK   : Software Development Kit
 * - ESM   : ECMAScript Module
 * - CB    : Callback function
 * - HTML   : HyperText Markup Language
 * - SSR   : Server-Side Rendering
 * - CSS   : Cascading Style Sheets
 * - config: Configuration settings object
 * - AJAX   : Asynchronous JavaScript and XML
 * - URL   : Uniform Resource Locator
 * - CSRF   : Cross-Site Request Forgery
 * =============================================================================
 */

/**
 * @typedef {Object} RoleItem
 * @property {number|string} id - Unique identifier for the role.
 * @property {string} name - Human-readable name of the role.
 * @property {string} slug - Machine-readable slug of the role.
 * @property {number} level - Hierarchy authority level of the role.
 * @property {string} [description] - Detailed summary of role privileges.
 */

/**
 * @typedef {Object} RoleLevelManagerConfig
 * @property {string} [formSelector] - CSS selector for target role assignment form. Default: '#ra-role-assignment-form'
 * @property {string} [createLevelSelectSelector] - CSS selector for Create level filter dropdown. Default: '#user_level'
 * @property {string} [updateLevelSelectSelector] - CSS selector for Update level filter dropdown. Default: '#user_level'
 * @property {string} [roleContainerSelector] - CSS selector for role selection checkbox container. Default: '#ra-role-selection-box'
 * @property {string} [alertSelector] - CSS selector for feedback alert message box. Default: '#ra-alert-message'
 * @property {number} [assignerLevel] - Minimum hierarchy authority rank level of the current administrator. Default: 99
 * @property {Array<number|string>} [assignedRoleIds] - Pre-selected or old input role IDs. Default: []
 * @property {string} [csrfToken] - Cross-Site Request Forgery validation token. Default: ''
 * @property {Object} [lifecycleHooks] - Custom event lifecycle interceptors.
 * @property {function(HTMLFormElement): void} [lifecycleHooks.onInit] - Initialization hook.
 * @property {function(string, string): void} [lifecycleHooks.onAlert] - Alert message display intercept hook.
 */

export class RoleLevelManager {
    /**
     * Initializes the role level manager instance with defensive configuration defaults and strict type safety.
     *
     * @param {RoleLevelManagerConfig} [userConfig={}] - Custom project configuration overrides.
     */
    constructor(userConfig = {}) {
        /** @type {HTMLElement|null} */
        const container = document.querySelector(".plb-screen-center");
        const datasetAssignerLevel = container?.dataset.assignerLevel
            ? parseInt(container.dataset.assignerLevel, 10)
            : undefined;
        /** @type {string|undefined} */
        this.username = container?.dataset.userUsername; // Store as class property

        /**
         * @type {Required<RoleLevelManagerConfig>}
         */
        this.config = Object.assign(
            {
                formSelector: "#ra-role-assignment-form",
                createLevelSelectSelector: "#user_level_create",
                updateLevelSelectSelector: "#user_level_update",
                roleContainerSelector: "#ra-role-selection-box",
                alertSelector: "#ra-alert-message",
                assignerLevel: datasetAssignerLevel ?? 99,
                assignedRoleIds: [],
                csrfToken: "",
                lifecycleHooks: {},
            },
            userConfig,
        );

        /** @type {HTMLFormElement|null} */
        this.form = /** @type {HTMLFormElement|null} */ (
            document.querySelector(this.config.formSelector)
        );
        /** @type {HTMLSelectElement|null} */
        this.levelCreateSelect = /** @type {HTMLSelectElement|null} */ (
            document.querySelector(this.config.createLevelSelectSelector)
        );
        /** @type {HTMLSelectElement|null} */
        this.levelUpdateSelect = /** @type {HTMLSelectElement|null} */ (
            document.querySelector(this.config.updateLevelSelectSelector)
        );
        /** @type {HTMLElement|null} */
        this.roleContainer = /** @type {HTMLElement|null} */ (
            document.querySelector(this.config.roleContainerSelector)
        );
        /** @type {HTMLElement|null} */
        this.alertBox = /** @type {HTMLElement|null} */ (
            document.querySelector(this.config.alertSelector)
        );

        if (this.form) {
            this.init();
        }
    }

    /**
     * =========================================================================
     * WHAT: Core Initialization Lifecycle
     * WHEN: Executes immediately upon class instantiation if form exists.
     * WHY:  Binds change event listeners securely to the level filter selector.
     * =========================================================================
     */
    init() {
        if (this.levelCreateSelect) {
            this.levelCreateSelect.addEventListener("change", () =>
                this.renderCreateRolesForSelectedLevel(),
            );
        }
        if (this.levelUpdateSelect) {
            this.levelUpdateSelect.addEventListener("change", () => {
                this.captureCurrentSelections(); // Save current checkbox states before switching view
                this.renderUpdateRolesForSelectedLevel();
            });
        }

        if (
            typeof this.config.lifecycleHooks?.onInit === "function" &&
            this.form
        ) {
            this.config.lifecycleHooks.onInit(this.form);
        }
    }

    /**
     * Executes an AJAX fetch request to retrieve roles from the database
     * that match or exceed the selected level threshold.
     */
    async renderCreateRolesForSelectedLevel() {
        const targetLevel = parseInt(this.levelCreateSelect?.value || "0", 10);

        if (!targetLevel || !this.roleContainer) return;

        // Security check: Target level must be strictly greater than assigner authority rank
        if (targetLevel <= this.config.assignerLevel) {
            this.roleContainer.innerHTML = `<p class="ra-placeholder-text" style="color: #dc2626;">Authority restriction: Selected level threshold must be higher than your rank (${this.config.assignerLevel}).</p>`;
            return;
        }

        this.roleContainer.classList.add("is-loading");
        this.roleContainer.innerHTML =
            '<p class="ra-placeholder-text">Loading assignable roles from database...</p>';

        try {
            const response = await fetch(
                `/roles/by-level/create?target_level=${targetLevel}`,
                {
                    headers: {
                        Accept: "application/json",
                        "X-CSRF-TOKEN": this.config.csrfToken,
                    },
                },
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            /** @type {RoleItem[]} */
            const roles = await response.json();

            this.roleContainer.classList.remove("is-loading");
            this.roleContainer.innerHTML = "";

            if (!roles || roles.length === 0) {
                this.roleContainer.innerHTML = `<p class="ra-placeholder-text">No roles available at or below level ${targetLevel}.</p>`;
                return;
            }

            roles.forEach((role) => {
                const isChecked = this.config.assignedRoleIds.includes(
                    Number(role.id),
                )
                    ? "checked"
                    : "";

                const roleLabel = document.createElement("label");
                roleLabel.className = "ra-checkbox-item";
                roleLabel.style.display = "flex";
                roleLabel.style.alignItems = "flex-start";
                roleLabel.style.gap = "0.5rem";
                roleLabel.style.marginBottom = "0.5rem";
                roleLabel.innerHTML = `
                    <input type="checkbox" name="roles[]" value="${role.id}" ${isChecked} style="margin-top: 0.25rem;">
                    <div class="ra-role-details">
                        <span class="ra-role-name" style="font-weight: 600;">${role.name} (${role.slug}) - Level ${role.level}</span>
                        <span class="ra-role-desc" style="display: block; font-size: 0.85rem; color: #4b5563;">${role.description || "No description provided."}</span>
                    </div>
                `;
                this.roleContainer?.appendChild(roleLabel);
            });
        } catch (error) {
            if (this.roleContainer) {
                this.roleContainer.classList.remove("is-loading");
                this.roleContainer.innerHTML =
                    '<p class="ra-placeholder-text" style="color: red;">Failed to load roles from database.</p>';
            }
        }
    }

    /**
     * Scrapes currently checked checkboxes from the DOM and syncs them into internal state array
     */
    captureCurrentSelections() {
        if (!this.roleContainer) return;
        const checkboxes = this.roleContainer.querySelectorAll(
            'input[name="roles[]"]:checked',
        );
        checkboxes.forEach((cb) => {
            const val = Number(/** @type {HTMLInputElement} */ (cb).value);
            if (!this.config.assignedRoleIds.includes(val)) {
                this.config.assignedRoleIds.push(val);
            }
        });

        // Also remove unchecked ones that belong to the currently rendered list if needed,
        // or keep them so memory accumulates checked roles across thresholds.
    }

    /**
     * Executes an AJAX fetch request to retrieve roles from the database
     * that match or exceed the selected level threshold.
     */
    async renderUpdateRolesForSelectedLevel() {
        // First capture any active ticks on the screen
        this.captureCurrentSelections();

        const targetLevel = parseInt(this.levelUpdateSelect?.value || "0", 10);

        if (!targetLevel || !this.roleContainer) return;

        if (targetLevel <= this.config.assignerLevel) {
            this.roleContainer.innerHTML = `<p class="ra-placeholder-text" style="color: #dc2626;">Authority restriction: Selected level threshold must be higher than your rank (${this.config.assignerLevel}).</p>`;
            return;
        }

        this.roleContainer.classList.add("is-loading");
        this.roleContainer.innerHTML =
            '<p class="ra-placeholder-text">Loading assignable roles from database...</p>';

        try {
            const response = await fetch(
                `/users/${this.username}/roles/by-level/update?target_level=${targetLevel}`,
                {
                    headers: {
                        Accept: "application/json",
                        "X-CSRF-TOKEN": this.config.csrfToken,
                    },
                },
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            /** @type {RoleItem[]} */
            const roles = await response.json();

            this.roleContainer.classList.remove("is-loading");
            this.roleContainer.innerHTML = "";

            if (!roles || roles.length === 0) {
                this.roleContainer.innerHTML = `<p class="ra-placeholder-text">No roles available at or below level ${targetLevel}.</p>`;
                return;
            }

            roles.forEach((role) => {
                const isChecked = this.config.assignedRoleIds.includes(
                    Number(role.id),
                )
                    ? "checked"
                    : "";

                const roleLabel = document.createElement("div");
                roleLabel.className = "ra-checkbox-item";
                roleLabel.style.display = "flex";
                roleLabel.style.alignItems = "flex-start";
                roleLabel.style.gap = "0.5rem";
                roleLabel.style.marginBottom = "0.75rem";
                roleLabel.innerHTML = `
                    <input type="checkbox" name="roles[]" value="${role.id}" id="role_${role.id}" ${isChecked} style="margin-top: 0.25rem; width: 1rem; height: 1rem;">
                    <div class="ra-role-details">
                        <label for="role_${role.id}" style="cursor: pointer; font-weight: 600; font-size: 0.875rem; color: #111827;">
                            ${role.name} (${role.slug}) - Level ${role.level}
                        </label>
                        <span style="display: block; color: #6b7280; font-size: 0.75rem;">${role.description || "No description provided."}</span>
                    </div>
                `;
                this.roleContainer?.appendChild(roleLabel);
            });
        } catch (error) {
            if (this.roleContainer) {
                this.roleContainer.classList.remove("is-loading");
                this.roleContainer.innerHTML =
                    '<p class="ra-placeholder-text" style="color: red;">Failed to load roles from database.</p>';
            }
        }
    }

    /**
     * Renders feedback notification messages in the alert container.
     *
     * @param {string} message - Notification message.
     * @param {string} type - Notification type ('success' or 'error').
     */
    showAlert(message, type) {
        if (!this.alertBox) return;
        this.alertBox.textContent = message;
        this.alertBox.className = `pa-alert pa-${type === "success" ? "success" : "error"}`;
        this.alertBox.style.display = "block";

        if (typeof this.config.lifecycleHooks?.onAlert === "function") {
            this.config.lifecycleHooks.onAlert(message, type);
        }

        window.setTimeout(() => {
            if (this.alertBox) {
                this.alertBox.style.display = "none";
            }
        }, 5000);
    }
}
