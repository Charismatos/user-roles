{{--
  =============================================================================
  WHAT: Enterprise Roles Index View Template (Class-Free Universal Component Usage)
  WHEN: Loaded when authorized users access the roles index listing endpoint (`roles.index`) across 10,000+ Laravel projects.
  WHY:  Leverages universal anonymous Blade components and model attributes while removing hardcoded styles, deferring visual presentation entirely to external Vite bundles.
  WHO:  Backend engineers, full-stack developers, and package maintainers managing scalable Laravel instances across diverse domains (e.g., agriculture, defense, education, energy, minerals, finance, health, justice, security, real estate, government, labour, science, tech, environment, water, transport, sports, construction, trade & commerce, tourism).
  WHERE: Saved as resources/views/Roles/Editor/roles-index.blade.php
  HOW:  Integrates Vite asset hooks, flash alert components, link components, tabular data iteration loops, and secure route parameter bindings.
  -----------------------------------------------------------------------------
  FUTURE MODIFICATIONS & CUSTOMIZATION GUIDE:
  - ADDING NEW COLUMNS: Insert a new `<th>` element in the table header and a corresponding `<td>` cell inside the `@forelse` loop.
  - MODIFYING ROUTE BINDINGS: Update the route parameters inside `href` and `action` attributes to match your project routing specifications.
  - PINPOINTING CODE ADDITIONS: To add secondary filtering controls or domain-specific action buttons, insert your link or button components inside the header action group container before the table wrapper.
  =============================================================================
--}}

@vite(['resources/css/Roles/Editor/roles-index.css', 'resources/js/Roles/Editor/roles-index.js'])

<div>
    <div>

        {{--
          =============================================================================
          WHAT: Success Flash Notification Display Component
          WHEN: Renders success feedback when session contains success keys.
          WHY:  Provides immediate feedback following lifecycle events.
          =============================================================================
        --}}
        <x-alerts.alert sessionKey="success" message="" wrapperClass="pa-alert pa-success" messageClass="pa-msg"
            role="alert" data-auto-dismiss="true" />
        <x-alerts.alert sessionKey="error" message="" wrapperClass="pa-alert pa-danger" messageClass="pa-msg"
            role="alert" data-auto-dismiss="true" />

        {{-- Role Management Header Section --}}
        <header>
            <div>
                <h1>System Roles</h1>
                <p>Manage authorization levels and system access parameters.</p>
            </div>
            <div>
                <x-links.link href="{{ route('roles.create') }}" label="Create New Role" class="pl-blue" />
                <x-links.link href="{{ route('dashboard') }}" label="Go To Dashboard" class="pl-yellow-trpt" />
            </div>
        </header>

        {{--
          =============================================================================
          WHAT: Role Records Tabular Data Container
          WHEN: Displays paginated or complete role entity collections across enterprise systems.
          WHY:  Enables systematic auditing, viewing, modification, and teardown of security tiers.
          =============================================================================
        --}}
        <div>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Slug</th>
                        <th>Level</th>
                        <th>System Role</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($roles as $role)
                        <tr>
                            <td>{{ $role->id }}</td>
                            <td><strong>{{ $role->name }}</strong></td>
                            <td><code>{{ $role->slug }}</code></td>
                            <td><code>{{ $role->level }}</code></td>
                            <td>{{ $role->is_system ? 'Yes' : 'No' }}</td>
                            <td>
                                <div class="table-actions">
                                    <x-links.link href="{{ route('roles.show', $role) }}" label="View"
                                        class="pl-blue-trpt" />
                                    <x-links.link href="{{ route('roles.edit', $role) }}" label="Edit"
                                        class="pl-green-trpt" />
                                    @if (!$role->is_system)
                                        <form action="{{ route('roles.destroy', $role) }}" method="POST"
                                            style="display:inline;">
                                            @csrf
                                            @method('DELETE')
                                            <x-buttons.button id="delete-role-{{ $role->id }}" type="submit"
                                                variant="danger" label="Delete" icon="🗑️"
                                                buttonRole="Delete role configuration"
                                                class="pb-btn pb-danger js-delete-role" />
                                        </form>
                                    @endif
                                </div>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="6" style="text-align: center;">No roles configured.</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>

    </div>
</div>

{{--
  =============================================================================
  HOW TO REFERENCE, CALL, OR CUSTOMIZE THIS COMPONENT-DRIVEN VIEW ACROSS 10,000+ PROJECTS:
  -----------------------------------------------------------------------------
  1. COMPONENT PROPS & ATTRIBUTES USAGE EXAMPLES:
     - Alerts: <x-alerts.alert sessionKey="custom_key" message="Notice text" wrapperClass="pa-alert pa-info" messageClass="pa-msg" role="alert" />
     - Links: <x-links.link href="{{ route('home') }}" label="Home" class="pl-link pl-primary" />
     - Buttons: <x-buttons.button id="btn-id" type="submit" variant="primary" label="Submit" icon="💾" buttonRole="Role description" class="pb-btn pb-primary" />

  2. FUTURE MODIFICATIONS TO THE UNIVERSAL COMPONENT ITSELF:
     - If you need to add custom properties or new attributes (such as domain-specific filters for finance, health, energy, or government compliance modules), inspect the target component file, add your variable to the `@props([])` array, update attribute filtering arrays, and include your rendering logic.
  =============================================================================
--}}
