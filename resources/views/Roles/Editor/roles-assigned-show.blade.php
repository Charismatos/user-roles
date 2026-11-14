{{--
  =============================================================================
  WHAT: Enterprise User Role Assignment Details View Template (Class-Free Universal Component Usage)
  WHEN: Loaded when authorized users access the specific user role assignment detail view across 10,000+ Laravel projects.
  WHY:  Leverages universal anonymous Blade components and structured design system tokens, applying rigorous layout, link, alert, and card grid variants entirely tied to external Vite bundles.
  WHO:  Backend engineers, full-stack developers, and package maintainers managing scalable Laravel instances across diverse domains (e.g., agriculture, defense, education, energy, minerals, finance, health, justice, security, real estate, government, labour, science, tech, environment, water, transport, sports, construction, trade & commerce, tourism).
  WHERE: Saved as resources/views/Roles/Editor/role-assigned-show.blade.php
  HOW:  Integrates Vite asset hooks, project link components, iteration loops for assigned roles, and secure route parameter bindings.
  -----------------------------------------------------------------------------
  FUTURE MODIFICATIONS & CUSTOMIZATION GUIDE:
  - ADDING NEW ATTRIBUTES: Insert additional metadata rows or component references inside the user profile summary panel or role cards.
  - MODIFYING ROUTE BINDINGS: Update route parameters inside `href` attributes to match project routing specifications.
  - PINPOINTING CODE ADDITIONS: To add secondary management actions (e.g., audit log triggers or export report buttons), insert your component wrappers directly inside the main container before the action button.
  =============================================================================
--}}

@vite(['resources/css/Roles/Editor/roles-assigned-show.css', 'resources/js/Roles/Editor/roles-assigned-show.js'])

<main class="ra-container">
    <div class="ra-card">

        <x-alerts.alert sessionKey="roles_assigned_agreed_success"
            wrapperClass=" roles_assigned_agreed_success_alert pa-alert pa-success" messageClass="pa-msg" role="alert"
            data-auto-dismiss="true" />

        {{-- User Profile Summary Information Panel --}}
        <div style="background-color: #f9fafb; padding: 1.25rem; border-radius: 0.375rem; margin-bottom: 1.5rem;">
            <h3 style="margin: 0 0 0.5rem 0;">{{ $user->name }}</h3>
            <p style="margin: 0; color: #4b5563; font-size: 0.875rem;">
                <strong>Username:</strong> &#64;{{ $user->username }} |
                <strong>Email:</strong> {{ $user->email }} |
                <strong>Highest Authority Level:</strong> Level {{ $user->getHighestRoleLevel() ?? 99 }}
            </p>
        </div>

        {{-- Assigned Active Roles Listing Section --}}
        <h3 style="margin-bottom: 0.75rem;">Assigned Active Roles</h3>
        <div style="display: grid; gap: 0.75rem;">
            @forelse ($user->roles as $role)
                <div style="border: 1px solid #e5e7eb; border-radius: 0.375rem; padding: 1rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <strong>{{ $role->name }} ({{ $role->slug }})</strong>
                        <span
                            style="background-color: #dbeafe; color: #1e40af; padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.75rem;">Level
                            {{ $role->level }}</span>
                    </div>
                    <p style="margin: 0.5rem 0 0 0; color: #6b7280; font-size: 0.875rem;">
                        {{ $role->description ?? 'No description provided.' }}</p>
                </div>
            @empty
                <p style="color: #6b7280;">No functional roles assigned to this user.</p>
            @endforelse
        </div>

        {{-- Action Trigger Section --}}
        <div style="margin-top: 1.5rem; text-align: right;">
            <x-links.link href="{{ route('dashboard') }}" label="Go To Your Dashboard" class="pl-green-trpt" />
        </div>

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
     - If you need to add custom properties or new attributes (such as domain-specific indicators for finance, health, energy, or government compliance modules), inspect target component files, add your variables to `@props([])` arrays, update attribute filtering arrays, and include rendering logic.
  =============================================================================
--}}
