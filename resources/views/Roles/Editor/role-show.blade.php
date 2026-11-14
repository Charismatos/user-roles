{{--
  =============================================================================
  WHAT: Enterprise Role Details View Template (Class-Free Universal Component Usage)
  WHEN: Loaded when authorized users access the specific role details endpoint (`roles.show`) across 10,000+ Laravel projects.
  WHY:  Leverages universal anonymous Blade components and model attributes while removing hardcoded styles, deferring visual presentation entirely to external Vite bundles.
  WHO:  Backend engineers, full-stack developers, and package maintainers managing scalable Laravel instances.
  WHERE: Saved as resources/views/Roles/Editor/role-show.blade.php
  HOW:  Integrates Vite asset hooks, flash alert components, link components, model property bindings, and routing parameters.
  -----------------------------------------------------------------------------
  FUTURE MODIFICATIONS & CUSTOMIZATION GUIDE:
  - ADDING NEW ATTRIBUTES: Insert a new detail row block or component reference inside the main display container.
  - MODIFYING ROUTE BINDINGS: Update the route parameters inside `href` attributes to match your project routing specifications.
  - PINPOINTING CODE ADDITIONS: To add secondary management actions (e.g., duplicate role trigger), insert your action components inside the header action group container.
  =============================================================================
--}}

@vite(['resources/css/Roles/Editor/role-show.css', 'resources/js/Roles/Editor/role-show.js'])

<div>
    <div>

        {{--
          =============================================================================
          WHAT: Success Flash Notification Display Component
          WHEN: Renders success feedback when the session contains a role creation or update success key.
          WHY:  Provides immediate feedback to users following asynchronous or redirected lifecycle events.
          WHO:  Backend developers and UX engineers ensuring consistent feedback loops.
          WHERE: Included at the top of the card bounding container.
          HOW:  Utilizes the universal alert component with specified session keys and class hooks.
          -----------------------------------------------------------------------------
          FUTURE MODIFICATIONS:
          - To change session keys, adjust the 'sessionKey' prop string value.
          =============================================================================
        --}}
        {{--
          =============================================================================
          WHAT: Success Flash Notification Display Component
          WHEN: Renders success feedback when the session contains a success flash key.
          WHY:  Provides immediate feedback to users following asynchronous or redirected lifecycle events.
          WHO:  Backend developers and UX engineers ensuring consistent feedback loops.
          WHERE: Included at the top of the card bounding container.
          HOW:  Utilizes the universal alert component with specified session keys and class hooks.
          -----------------------------------------------------------------------------
          FUTURE MODIFICATIONS:
          - To change session keys, adjust the 'sessionKey' prop string value.
          =============================================================================
        --}}
        <x-alerts.alert sessionKey="role_create_success" message="Role created successfully."
            wrapperClass="pa-alert pa-success" messageClass="pa-msg" role="alert" data-auto-dismiss="true" />

        <x-alerts.alert sessionKey="role_update_success" message="Role updated successfully."
            wrapperClass="pa-alert pa-success" messageClass="pa-msg" role="alert" data-auto-dismiss="true" />

        {{-- Role Management Header Section --}}
        <header>
            <div>
                <h1 class="pf-centered">Role Details</h1>
                <p>System overview for role entity ID #{{ $role->id }}.</p>
            </div>
            <div>
                <x-links.link href="{{ route('roles.edit', ['role' => $role->slug]) }}" label="Edit Role"
                    class="pl-blue" />
                <x-links.link href="{{ route('roles.index') }}" label="View List" class="pl-yellow-trpt" />
            </div>
        </header>

        {{--
          =============================================================================
          WHAT: Role Attributes Metadata Display Container
          WHEN: Renders detailed database properties associated with the requested role instance.
          WHY:  Provides clear inspection capabilities for system administrators.
          =============================================================================
        --}}
        <div>
            <div>
                <span>Role Name</span>
                <span>{{ $role->name }}</span>
            </div>
            <div>
                <span>System Slug</span>
                <span><code>{{ $role->slug }}</code></span>
            </div>
            <div>
                <span>Hierarchy Level</span>
                <span><code>Level {{ $role->level }}</code></span>
            </div>
            <div>
                <span>System Protected</span>
                <span>{{ $role->is_system ? 'Yes (Protected System Role)' : 'No (User Defined)' }}</span>
            </div>
            <div>
                <span>Description</span>
                <span>{{ $role->description ?? 'No description provided for this role.' }}</span>
            </div>
            <div>
                <span>Created At</span>
                <span>{{ $role->created_at ? $role->created_at->format('Y-m-d H:i:s') : 'N/A' }}</span>
            </div>
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
     - If you need to add custom properties or new attributes, inspect the target component file, add your variable to the `@props([])` array, update attribute filtering arrays, and include your rendering logic.
  =============================================================================
--}}
