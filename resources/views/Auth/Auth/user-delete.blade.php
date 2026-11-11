{{--
  =============================================================================
  WHAT: Enterprise User Profile Deletion View Template (Design System Class Integration)
  WHEN: Loaded when authorized users access the account deletion confirmation endpoint across 10,000+ Laravel projects.
  WHY:  Leverages universal anonymous Blade components, model attributes, and the official project design system classes (`pf-*`, `pb-*`, `pa-*`, `pl-*`) for consistent UI presentation.
  WHO:  Backend engineers, full-stack developers, and package maintainers managing scalable Laravel instances.
  WHERE: Saved as resources/views/Auth/Auth/user-delete.blade.php
  HOW:  Integrates Vite asset hooks, flash alert components with `.pa-alert` classes, form components with `.pf-card`, links with `.pl-link`, and buttons with `.pb-btn`.
  -----------------------------------------------------------------------------
  FUTURE MODIFICATIONS & CUSTOMIZATION GUIDE:
  - ADDING EXTRA CONFIRMATION FIELDS: Call an instance of <x-forms.form-field> or insert native inputs directly inside the deletion form tag below the warning text.
  - MODIFYING PROFILE DATA: Access model attributes directly via the injected $user instance.
  - PINPOINTING CODE ADDITIONS: To add secondary confirmation logic, place custom validation blocks immediately before the action button group.
  =============================================================================
--}}

@vite(['resources/css/Auth/Auth/user-delete.css', 'resources/js/Auth/Auth/user-delete.js'])

<div>
    <div>

        {{--
          =============================================================================
          WHAT: Flash Notification / Alert Display Component
          WHEN: Renders success feedback when the session contains a 'user_delete_success' or general success key.
          WHY:  Provides immediate feedback to users following asynchronous or redirected lifecycle events.
          WHO:  Backend developers and UX engineers ensuring consistent feedback loops.
          WHERE: Included at the top of the card bounding container.
          HOW:  Utilizes the universal alert component with design system alert classes (`pa-alert pa-success pa-msg`).
          -----------------------------------------------------------------------------
          FUTURE MODIFICATIONS:
          - To change session keys, adjust the 'sessionKey' prop string value.
          =============================================================================
        --}}

        {{-- Section Header Title --}}
        <h1>DELETE PROFILE</h1>

        {{--
          =============================================================================
          WHAT: User Verification Metadata Display
          WHEN: Renders current account identifiers to provide context before destruction.
          WHY:  Prevents user error by confirming the exact account target instance.
          =============================================================================
        --}}
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

        {{-- Destructive Warning Notice --}}
        <p>Are You Sure You Want To Delete This Account?</p>

        {{--
          =============================================================================
          WHAT: Account Destruction Form and Navigation Actions
          WHEN: Renders the negative dismissal link alongside the secure DELETE submission form.
          WHY:  Isolates destructive actions behind explicit CSRF and method-spoofed requests.
          =============================================================================
        --}}
        <div>
            {{-- Navigation escape link back to dashboard utilizing design system link classes --}}
            <a href="{{ route('dashboard') }}" class="pl-link pl-success">No</a>

            {{-- Secure Deletion Form Wrapper utilizing design system card form class --}}
            <form action="{{ route('users.destroy', ['user' => $user->username]) }}" method="POST" class="pf-card">
                @csrf
                @method('DELETE')

                {{--
                  =============================================================================
                  WHAT: Universal Button Component (Destructive Action Trigger)
                  WHEN: Rendered inside the deletion form to execute the account termination request.
                  WHY:  Standardizes button behaviors across 10,000+ projects via design system button classes (`pb-btn pb-secondary`).
                  =============================================================================
                --}}
                <x-buttons.button id="delete-account-btn" type="submit" variant="danger" label="Yes, Delete Account"
                    icon="⚠️" buttonRole="Click here to permanently purge and delete this user account profile"
                    class="pb-btn pb-danger" />
            </form>
        </div>

    </div>
</div>

{{--
  =============================================================================
  HOW TO REFERENCE, CALL, OR CUSTOMIZE THIS COMPONENT-DRIVEN VIEW ACROSS 10,000+ PROJECTS:
  -----------------------------------------------------------------------------
  1. COMPONENT PROPS & ATTRIBUTES USAGE EXAMPLES:
     - Alerts: <x-alerts.alert sessionKey="custom_key" message="Notice text" wrapperClass="pa-alert pa-info" messageClass="pa-msg" />
     - Links: <a href="{{ route('route.name') }}" class="pl-link pl-primary">Link Label</a>
     - Buttons: <x-buttons.button id="btn-id" type="submit" variant="danger" label="Action" icon="🔥" buttonRole="Role description" class="pb-btn pb-primary" />
     - Forms: <form action="..." method="POST" class="pf-card">...</form>

  2. FUTURE MODIFICATIONS TO THE UNIVERSAL COMPONENTS ITSELF:
     - If you need to add custom properties, inspect the target component file (e.g., resources/views/components/buttons/button.blade.php), add your variable to the `@props([])` array, update attribute filtering arrays, and include your rendering logic.
  =============================================================================
--}}
