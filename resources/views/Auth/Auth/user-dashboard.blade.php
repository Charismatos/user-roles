{{--
  =============================================================================
  WHAT: Enterprise Authenticated User Dashboard View Template
  WHEN: Rendered when authenticated users access their dashboard via UserDashboardController.
  WHY:  Utilizes universal modular Blade components and model attributes while enforcing standardized design-system classes.
  WHO:  Backend engineers and full-stack maintainers managing 10,000+ Laravel instances.
  WHERE: Saved as resources/views/Auth/Auth/user-dashboard.blade.php
  HOW:  Integrates Vite asset hooks, flash alerts via components, sidebar layouts, and dynamic routing bindings.
  -----------------------------------------------------------------------------
  FUTURE MODIFICATIONS & CUSTOMIZATION GUIDE:
  - ADDING NAVIGATION ITEMS: Insert a new <x-links.link> or anchor inside the nav container.
  - MODIFYING PROFILE DATA: Access properties directly via the injected $user model instance.
  =============================================================================
--}}

@vite(['resources/css/Auth/Auth/user-dashboard.css', 'resources/js/Auth/Auth/user-dashboard.js'])

<div class="ud-app-shell">
    {{-- Top Bar visible only on Mobile/Tablet viewports --}}
    <header>
        <x-buttons.button type="button" variant="ghost" label="" icon="☰"
            buttonRole="Toggle mobile navigation menu" class="pb-btn pb-outline" aria-label="Toggle Navigation"
            data-sidebar-toggle />
        <span>Menu</span>
    </header>

    <div>
        {{-- Sidebar Navigation Component Area --}}
        <aside id="asideSidebar" aria-label="Main Navigation" class="sidebar-widget ud-sidebar">
            <div>
                <h2>Menu</h2>
                <x-buttons.button type="button" variant="ghost" label="" icon="✕"
                    buttonRole="Close mobile navigation menu" class="pb-btn pb-outline" aria-label="Toggle Navigation"
                    data-sidebar-toggle />
            </div>

            <nav>
                {{-- Only show to users who possess the 'administrator' or 'super-administrator' role --}}
                @if ($user->hasAnyRole(['administrator', 'analyst', 'researcher']))
                    <x-links.link href="{{ route('roles.create') }}" label="Create User Roles"
                        class="pl-link pl-default" />
                    <x-links.link href="{{ route('users.roles.assign') }}" label="Assign User Roles"
                        class="pl-link pl-default" />
                    <x-links.link href="{{ route('users.roles.show', $user) }}" label="View Your Roles"
                        class="pl-link pl-default" />
                @endif

                @if ($user->hasAnyRole(['administrator']))
                    <x-links.link href="{{ route('roles.index') }}" label="View All Roles" class="pl-link pl-default" />
                    <x-links.link href="{{ route('roles.assigned.index') }}" label="View All Assigned Roles"
                        class="pl-link pl-default" />
                @endif
                {{-- Alternatively, restrict by your hierarchy level weight (e.g. level 1 or 2 up to a threshold) --}}
                {{-- @if ($user->hasLevelAtOrAbove(2)) --}}
                {{-- Management links here --}}
                {{-- @endif --}}

                {{-- Visible to all authenticated users --}}
                <x-links.link href="{{ route('home') }}" label="Go To Home Page" class="pl-link pl-primary" />

            </nav>
        </aside>

        {{-- Main Dashboard Content Area --}}
        <main class="ud-main-content">
            {{-- Login Success Flash Notification Display --}}
            <x-alerts.alert sessionKey="user_register_success" message="You have registered successfully."
                wrapperClass="pa-alert pa-success user_registration_success_alert" messageClass="pa-msg" role="alert"
                data-auto-dismiss="true" />

            <x-alerts.alert sessionKey="user_login_success" message="You Logged In Successfully."
                wrapperClass="pa-alert pa-success user_login_success_alert" messageClass="pa-msg" role="alert"
                data-auto-dismiss="true" />

            <x-alerts.alert sessionKey="roles_assigned_sent_email_success"
                wrapperClass="pa-alert pa-success roles_assigned_sent_email_success_alert" messageClass="pa-msg"
                role="alert" data-auto-dismiss="true" />

            {{--
          =============================================================================
          WHAT: Success Flash Notification Display
          WHEN: Renders a success message when the session contains a 'success' key.
          WHY:  Provides immediate feedback to users after successful updates.
          =============================================================================
        --}}
            <x-alerts.alert sessionKey="user_update_success" message="Your profile has been updated successfully."
                wrapperClass="pa-alert pa-success user_update_success_alert" messageClass="pa-msg" role="alert"
                data-auto-dismiss="true" />

            <header>
                <h1>DASHBOARD</h1>
                <h2>
                    Welcome, <span>{{ $user->name }}!</span>
                </h2>
            </header>

            <section>
                <h3>User Details</h3>
                <div>
                    <div>
                        <span>Name:</span>
                        <span>{{ $user->name }}</span>
                    </div>
                    <div>
                        <span>Email:</span>
                        <span>{{ $user->email }}</span>
                    </div>
                </div>
            </section>

            <div>
                <x-links.link href="{{ route('users.edit', ['user' => $user->username]) }}" label="Edit Profile"
                    class="pl-link pl-primary" />
                <x-links.link href="{{ route('users.delete-confirm', ['user' => $user->username]) }}"
                    label="Delete Account" class="pl-link pl-muted" />

                <form id="logout-form" action="{{ route('logout') }}" method="POST">
                    @csrf
                    <x-buttons.button type="submit" variant="outline" label="Logout"
                        buttonRole="Click here to securely terminate your authenticated user session"
                        class="pb-btn pb-outline pb-pill" />
                </form>
            </div>
        </main>
    </div>
</div>

{{--
  =============================================================================
  HOW TO REFERENCE, CALL, OR CUSTOMIZE THIS COMPONENT-DRIVEN VIEW ACROSS 10,000+ PROJECTS:
  -----------------------------------------------------------------------------
  1. COMPONENT PROPS & ATTRIBUTES USAGE EXAMPLES:
     - Alerts: <x-alerts.alert sessionKey="status" message="Default Status" wrapperClass="pa-alert pa-info" messageClass="pa-msg" />
     - Links: <x-links.link href="{{ route('profile') }}" label="Profile" class="pl-link pl-primary" target="_blank" />
     - Buttons: <x-buttons.button type="submit" variant="primary" label="Save" icon="💾" buttonRole="Save data" class="pb-btn pb-primary pb-pill" />

  2. FUTURE MODIFICATIONS TO THIS VIEW FILE:
     - To inject new dashboard cards or statistics widgets, add a new <section> block
       inside the main <main> element.
     - To modify stylesheets or behavior scripts, adjust references in the top @vite directive.
  =============================================================================
--}}
