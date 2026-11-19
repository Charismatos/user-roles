/**
 * =============================================================================
 * GLOSSARY OF ABBREVIATIONS USED WITHIN THIS FILE & COMMENTS:
 * -----------------------------------------------------------------------------
 * - DOM   : Document Object Model
 * - API   : Application Programming Interface
 * - JSON  : JavaScript Object Notation
 * - UI    : User Interface
 * - SDK   : Software Development Kit
 * - ESM   : ECMAScript Module
 * - CB    : Callback function
 * - HTML  : HyperText Markup Language
 * - SSR   : Server-Side Rendering
 * - CSS   : Cascading Style Sheets
 * - JSDoc : JavaScript Documentation syntax
 * - i18n  : Internationalization
 * =============================================================================
 */

/**
 * @typedef {Record<string, string>} ObjectOfLabels
 */

/**
 * @typedef {Record<string, string>} ObjectOfDescriptions
 */

/**
 * @class UiLabelsRegistry
 * @classdesc Enterprise-grade, project-agnostic internationalization and UI label registry module
 * designed to generate dynamic component tokens, form headers, action descriptions, and accessibility hints
 * across 10,000+ independent Laravel web applications spanning diverse industry verticals
 * (agriculture, defense, education, energy, minerals, finance, health, justice, security,
 * real estate, government, labour, science, tech, environment, water, transport, sports,
 * construction, trade & commerce, tourism).
 */
export class UiLabelsRegistry {
    /**
     * Generates a fully typed, secure record of user interface label tokens for a given resource grouping
     * with robust string sanitization and fallback boundaries.
     *
     * @param {string} [capitalized="Group"] - The capitalized name of the UI entity or taxonomy tier (e.g., 'Category', 'Geography', 'Asset', 'Account').
     * @returns {ObjectOfLabels} An object containing localized label strings for dropdowns and buttons.
     */
    static getLabels(capitalized = "Group") {
        /** @type {string} */
        const sanitizedCapitalized =
            typeof capitalized === "string" && capitalized.trim() !== ""
                ? capitalized.trim()
                : "Group";

        return {
            /** Label for root cascading selection dropdowns */
            choose_grouping_level_label: `Choose ${sanitizedCapitalized} Level`,
            /** Label for triggers opening missing item drawers */
            add_missing_grouping_label: `+ New Missing ${sanitizedCapitalized}`,
            /** Label for removal buttons */
            remove_selected_grouping_label: `✕ Remove Selected`,
        };
    }

    /**
     * Generates a fully typed, secure record of interactive element hover descriptions, tooltips,
     * and ARIA roles for accessibility support across enterprise forms.
     *
     * @param {string} [capitalized="Group"] - The capitalized name of the UI entity or taxonomy tier.
     * @returns {ObjectOfDescriptions} An object mapping action descriptions to localized tooltips.
     */
    static getHoverRoles(capitalized = "Group") {
        /** @type {string} */
        const sanitizedCapitalized =
            typeof capitalized === "string" && capitalized.trim() !== ""
                ? capitalized.trim()
                : "Group";

        return {
            /** Hover description for adding a new grouping entity */
            add_new_grouping_btn_role: `Open form field drawer to add a new ${sanitizedCapitalized}`,
            /** Hover description for deleting a selected entity */
            remove_selected_grouping_btn_role: `Remove the selected ${sanitizedCapitalized}`,
            /** Hover description for persisting a new entity */
            save_new_grouping_btn_role: `Save the new ${sanitizedCapitalized} item`,
            /** Hover description for editing/renaming an existing tier */
            rename_selected_grouping_field_role: `Rename the selected ${sanitizedCapitalized} tier`,
        };
    }
}

/**
 * =============================================================================
 * REAL-WORLD USAGE, CUSTOMIZATION & RE-REFERENCE GUIDE (10,000+ PROJECTS):
 * =============================================================================
 *
 * 1. HOW TO IMPORT AND REFERENCE THIS MODULE IN AN ENTRY SCRIPT / BLADE VIEW:
 *    ```javascript
 *    import { UiLabelsRegistry } from './sub-modules/UiLabelsRegistry.js';
 *
 *    // Generating labels for a Finance Sector application
 *    const financeLabels = UiLabelsRegistry.getLabels('Denomination');
 *    console.log(financeLabels.choose_grouping_level_label);
 *    // Outputs: "Choose Denomination Level"
 *
 *    // Generating hover tooltips for a Health Sector application
 *    const healthTooltips = UiLabelsRegistry.getHoverRoles('MedicalWard');
 *    console.log(healthTooltips.add_new_grouping_btn_role);
 *    // Outputs: "Open form field drawer to add a new MedicalWard"
 *    ```
 *
 * 2. SECTOR-SPECIFIC CUSTOMIZATION EXAMPLES (MAPPED TO 21 SECTORS):
 *    - FINANCE: `UiLabelsRegistry.getLabels('AssetClass')`
 *    - HEALTH: `UiLabelsRegistry.getLabels('Specialization')`
 *    - AGRICULTURE: `UiLabelsRegistry.getLabels('CropCategory')`
 *    - ENERGY: `UiLabelsRegistry.getLabels('VoltageTier')`
 *    - EDUCATION: `UiLabelsRegistry.getLabels('Faculty')`
 *    - DEFENSE: `UiLabelsRegistry.getLabels('CommandRank')`
 *    - MINING: `UiLabelsRegistry.getLabels('MineralOre')`
 *    - JUSTICE: `UiLabelsRegistry.getLabels('CaseType')`
 *    - SECURITY: `UiLabelsRegistry.getLabels('ClearanceLevel')`
 *    - REAL ESTATE: `UiLabelsRegistry.getLabels('PropertyType')`
 *    - GOVERNMENT: `UiLabelsRegistry.getLabels('MinistryDepartment')`
 *    - LABOUR: `UiLabelsRegistry.getLabels('UnionSector')`
 *    - SCIENCE: `UiLabelsRegistry.getLabels('ResearchDomain')`
 *    - TECH: `UiLabelsRegistry.getLabels('SoftwareModule')`
 *    - ENVIRONMENT: `UiLabelsRegistry.getLabels('EcosystemType')`
 *    - WATER: `UiLabelsRegistry.getLabels('CatchmentArea')`
 *    - TRANSPORT: `UiLabelsRegistry.getLabels('TransitHub')`
 *    - SPORTS: `UiLabelsRegistry.getLabels('LeagueDivision')`
 *    - CONSTRUCTION: `UiLabelsRegistry.getLabels('BuildingPhase')`
 *    - TRADE & COMMERCE: `UiLabelsRegistry.getLabels('CommodityGroup')`
 *    - TOURISM: `UiLabelsRegistry.getLabels('DestinationZone')`
 *
 * 3. FUTURE MODIFICATIONS - PINPOINTING WHERE & HOW TO ADD CODE:
 *    If your enterprise project architecture requires supporting a new UI action token or
 *    localization string (e.g., an audit log or export prompt description) across any of
 *    the 21 sectors, navigate directly to `UiLabelsRegistry.getLabels()` or
 *    `UiLabelsRegistry.getHoverRoles()`, and inject your token safely:
 *    ```javascript
 *    return {
 *        choose_grouping_level_label: `Choose ${sanitizedCapitalized} Level`,
 *        add_missing_grouping_label: `+ New Missing ${sanitizedCapitalized}`,
 *        remove_selected_grouping_label: `✕ Remove Selected`,
 *        // [FUTURE MODIFICATION POINT]: Add custom UI state token below
 *        export_selected_grouping_label: `Export ${sanitizedCapitalized} Report`,
 *    };
 *    ```
 * =============================================================================
 */
