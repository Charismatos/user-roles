{{--
  =============================================================================
  WHAT: Enterprise Batch User Role Assignment & Invitation View Template (Class-Free Universal Component Usage)
  WHEN: Loaded when authorized users access the unified role assignment and invitation interface (`users.roles.assign`) across 10,000+ Laravel projects.
  WHY:  Enables batch dispatching of emails with associated role allocations and tracking metadata (`invited_by`) in a single streamlined submission workflow.
  WHO:  Backend engineers, full-stack developers, and package maintainers managing scalable Laravel instances across diverse domains (e.g., agriculture, defense, education, energy, minerals, finance, health, justice, security, real estate, government, labour, science, tech, environment, water, transport, sports, construction, trade & commerce, tourism).
  WHERE: Saved as resources/views/Roles/Editor/roles-assignment.blade.php
  HOW:  Integrates Vite asset hooks, project alert components, dynamic role checkbox rendering via RoleLevelManager, and unified form actions.
  -----------------------------------------------------------------------------
  FUTURE MODIFICATIONS & CUSTOMIZATION GUIDE:
  - ADDING NEW BATCH FIELDS: Insert additional input controls inside the unified form wrapper before the submission footer.
  - MODIFYING ROUTE BINDINGS: Update the route parameters inside `action` attributes to match your project routing specifications.
  =============================================================================
--}}

@vite(['resources/css/Roles/Editor/roles-assign.css', 'resources/js/Roles/Editor/roles-assign.js'])

<main class="plb-screen-center" data-assigner-level="{{ $minUserLevel }}">
    <div class="pf-card">

        {{-- Header Section --}}
        <header>
            <h1>Batch Role Assignment & Candidate Invitations</h1>
            <p>Select role levels, choose target roles, and dispatch invitations with pre-assigned permissions.</p>
        </header>

        {{-- Dynamic Alert Message Component Reference --}}
        <div id="ra-alert-message" class="pa-alert" style="display: none; margin-bottom: 1.5rem;"></div>

        {{-- Authenticated Administrator Banner --}}
        <div class="pa-alert pa-info"
            style="margin-bottom: 1.5rem; padding: 0.75rem 1rem; border-left: 4px solid #2563eb;">
            <p style="margin: 0; font-size: 0.875rem;">
                <strong>Logged In Administrator (Assigner):</strong>
                {{ Auth::user()->name }} (@<span>{{ Auth::user()->username }}</span>)
                &mdash; <span style="color: #2563eb; font-weight: 600;">Authority Rank: Level {{ $minUserLevel }}</span>
            </p>
        </div>

        {{--
          =============================================================================
          WHAT: Unified Batch Role Assignment and Invitation Form
          WHEN: Encapsulates recipient entry, level threshold filtering, role checkboxes, and dispatch triggers.
          WHY:  Submits batch payloads containing recipients, selected roles, and the assigner identifier.
          =============================================================================
        --}}
        <form id="ra-role-assignment-form" class="pf-grid-2col" action="{{ route('users.roles.send-invites') }}"
            method="POST" novalidate>
            @csrf

            {{-- Top-Level Validation Error Bag Component Reference --}}
            <x-forms.top-errors wrapperClass="pfe-alert-box" />

            {{-- Hidden Assigner Metadata for Batch Payload Tracking --}}
            <input type="hidden" name="invited_by_username" value="{{ Auth::user()->username }}">

            {{-- Step 1: Recipients Input Textarea --}}
            <div style="grid-column: span 2; margin-bottom: 1.5rem;">
                <label for="recipients" class="pl-required">Target Recipient Emails</label>
                <p style="font-size: 0.8125rem; color: #6b7280; margin-top: 0.25rem; margin-bottom: 0.5rem;">
                    Enter multiple emails separated by commas or newlines.
                </p>
                <textarea id="recipients" name="recipients" rows="3" class="pt-textarea pt-resize-none"
                    style="width: 100%; padding: 0.75rem;" placeholder="user1@example.com, user2@example.com, user3@example.com"
                    required></textarea>
            </div>

            {{-- Step 2: Level Threshold Filter Dropdown --}}
            <div style="grid-column: span 2; margin-bottom: 1rem;">
                <label for="assigner_user_level" class="pl-required">Filter Roles by Target Level Threshold</label>
                <select id="assigner_user_level" name="user_level" class="pdef-pill"
                    style="width: 100%; padding: 0.5rem;">
                    <option value="" disabled selected>-- Select Level Threshold --</option>
                    @for ($i = $minUserLevel + 1; $i <= 99; $i++)
                        <option value="{{ $i }}">Level {{ $i }} and Above</option>
                    @endfor
                </select>
            </div>

            {{-- Step 3: Dynamic Role Checkbox Selection Container (AJAX Powered) --}}
            <div style="grid-column: span 2; margin-bottom: 1.5rem;">
                <label class="pl-required">Select Roles to Attach to Batch Recipients</label>
                <div id="ra-role-selection-box"
                    style="border: 1px solid #d1d5db; border-radius: 6px; padding: 1rem; min-height: 140px; background: #f9fafb;">
                    <p class="ra-placeholder-text" style="color: #6b7280; margin: 0;">Please select a level threshold
                        above to load and display eligible roles for batch assignment.</p>
                </div>
            </div>

            {{-- Form Action Footer (Single Submit Button) --}}
            <div
                style="grid-column: span 2; margin-top: 1rem; display: flex; justify-content: flex-end; align-items: center;">
                <x-buttons.button id="send-links-btn" type="submit" variant="primary"
                    label="Request Assigned Confirmation" icon="✉️"
                    buttonRole="Dispatch invitation links and batch role assignments"
                    class="pb-btn pb-primary pb-pill" />
            </div>
        </form>

    </div>
</main>

{{--
  =============================================================================
  HOW TO REFERENCE, CALL, OR CUSTOMIZE THIS COMPONENT-DRIVEN VIEW ACROSS 10,000+ PROJECTS:
  -----------------------------------------------------------------------------
  1. COMPONENT PROPS & ATTRIBUTES USAGE EXAMPLES:
     - Alerts: <x-alerts.alert sessionKey="custom_key" message="Notice text" wrapperClass="pa-alert pa-info" messageClass="pa-msg" role="alert" />
     - Links: <x-links.link href="{{ route('home') }}" label="Home" class="pl-link pl-primary" />
     - Buttons: <x-buttons.button id="btn-id" type="submit" variant="primary" label="Submit" icon="💾" buttonRole="Role description" class="pb-btn pb-primary pb-pill" />

  2. FUTURE MODIFICATIONS TO THE UNIVERSAL COMPONENT ITSELF:
     - If you need to add custom properties or new attributes (such as domain-specific filters for finance, health, energy, or government compliance modules), inspect target component files, add variables to `@props([])` arrays, update attribute filtering arrays, and include rendering logic.
  =============================================================================
--}}
