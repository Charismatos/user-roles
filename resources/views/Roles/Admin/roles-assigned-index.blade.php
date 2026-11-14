{{--
  =============================================================================
  WHAT: Enterprise User Role Assignments Directory View Template (Class-Free Universal Component Usage)
  WHEN: Loaded when authorized users access the user role assignments directory index across 10,000+ Laravel projects.
  WHY:  Leverages universal anonymous Blade components and structured design system tokens, applying rigorous layout, link, alert, and tabular data variants entirely tied to external Vite bundles.
  WHO:  Backend engineers, full-stack developers, and package maintainers managing scalable Laravel instances across diverse domains (e.g., agriculture, defense, education, energy, minerals, finance, health, justice, security, real estate, government, labour, science, tech, environment, water, transport, sports, construction, trade & commerce, tourism).
  WHERE: Saved as resources/views/Roles/Editor/roles-assigned-index.blade.php
  HOW:  Integrates Vite asset hooks, project alert components, link components, tabular data iteration loops, and secure route parameter bindings.
  -----------------------------------------------------------------------------
  FUTURE MODIFICATIONS & CUSTOMIZATION GUIDE:
  - ADDING NEW COLUMNS: Insert a new `<th>` element in the table header and a corresponding `<td>` cell inside the `@foreach` user iteration loop.
  - MODIFYING ROUTE BINDINGS: Update route parameters inside `href` attributes to match project routing specifications.
  - PINPOINTING CODE ADDITIONS: To add secondary filtering controls or sector-specific action buttons, insert your link or button components inside the header action group container before the table wrapper.
  =============================================================================
--}}

@vite(['resources/css/Roles/Editor/roles-assigned-index.css', 'resources/js/Roles/Editor/roles-assigned-index.js'])

<main class="ra-container">
    <div class="ra-card">

        <x-alerts.alert sessionKey="confirmed_assigned_update_success"
            wrapperClass="pa-alert pa-success roles_assigned_sent_email_success_alert" messageClass="pa-msg" role="alert"
            data-auto-dismiss="true" />

        {{-- Role Management Header Section --}}
        <div class="ra-card-header" style="display: flex; justify-content: space-between; align-items: center;">
            <div>
                <h1 class="ra-card-title">User Role Assignments Directory</h1>
                <p class="ra-card-subtitle">Overview of current roles assigned across system users.</p>
            </div>
            <x-links.link href="{{ route('users.roles.assign') }}" label="Assign Roles" class="ra-button" />
        </div>

        {{--
          =============================================================================
          WHAT: User Role Records Tabular Data Container
          WHEN: Displays comprehensive lists of system users, rank hierarchies, and attached roles.
          WHY:  Enables systematic auditing and management of cross-sector user permissions.
          =============================================================================
        --}}
        <table style="width: 100%; border-collapse: collapse; margin-top: 1.5rem;">
            <thead>
                <tr style="border-bottom: 2px solid #e5e7eb; text-align: left;">
                    <th style="padding: 0.75rem;">User</th>
                    <th style="padding: 0.75rem;">Highest Rank</th>
                    <th style="padding: 0.75rem;">Attached Roles</th>
                    <th style="padding: 0.75rem; text-align: right;">Actions</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($users as $user)
                    <tr style="border-bottom: 1px solid #f3f4f6;">
                        <td style="padding: 0.75rem;">
                            <strong>{{ $user->name }}</strong><br>
                            <span style="font-size: 0.8125rem; color: #6b7280;">&#64;{{ $user->username }}</span>
                        </td>
                        <td style="padding: 0.75rem;">
                            <span
                                style="background: #eff6ff; color: #1d4ed8; padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.8125rem;">
                                Level {{ $user->getHighestRoleLevel() ?? 99 }}
                            </span>
                        </td>
                        <td style="padding: 0.75rem;">
                            @forelse ($user->roles as $role)
                                <span
                                    style="background: #f3f4f6; color: #374151; padding: 0.2rem 0.4rem; border-radius: 0.2rem; font-size: 0.75rem; margin-right: 0.25rem;">
                                    {{ $role->name }} (L{{ $role->level }})
                                </span>
                            @empty
                                <span style="color: #9ca3af; font-size: 0.8125rem;">No roles assigned</span>
                            @endforelse
                        </td>
                        <td style="padding: 0.75rem; text-align: right;">
                            <x-links.link href="{{ route('users.roles.show', $user) }}" label="View Details &rarr;"
                                class="pl-green-trpt" />
                        </td>
                        <td style="padding: 0.75rem; text-align: right;">
                            <x-links.link href="{{ route('users.roles.edit', $user) }}" label="Modify Assignments"
                                class="pl-orange-trpt" />
                        </td>
                    </tr>
                @endforeach
            </tbody>
        </table>

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
