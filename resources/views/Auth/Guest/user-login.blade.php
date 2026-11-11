{{--
  =============================================================================
  WHAT: Enterprise Universal Component Login View Template
  WHEN: Loaded when users visit the login endpoint across 10,000+ Laravel projects.
  WHY:  Leverages universal modular Blade components cleanly while enforcing standard design-system layout hooks (`pf-*`) and utility classes (`p*`).
  WHO:  Backend and full-stack developers maintaining shared component packages.
  WHERE: Saved as resources/views/Auth/Guest/user-login.blade.php
  HOW:  Renders layout containers with design system hooks, flash alerts, and component references.
  -----------------------------------------------------------------------------
  FUTURE MODIFICATIONS & CUSTOMIZATION GUIDE:
  - ADDING NEW FIELDS: Call another instance of <x-forms.form-field> passing
    the respective 'type', 'name', 'label', and custom class attributes.
  - MODIFYING ALERTS: Update sessionKey or message props on <x-alerts.alert>.
  =============================================================================
--}}

@vite(['resources/css/Auth/Guest/user-login.css', 'resources/js/Auth/Guest/user-login.js'])

<div class="pf-screen-center">
    <div class="pf-card-bounding-box">

        {{--
          =============================================================================
          WHAT: Registration Success Flash Notification Display
          WHEN: Triggered when an account registration flash key is present in the session.
          WHY:  Delivers immediate status feedback to the user.
          =============================================================================
        --}}
        <x-alerts.alert sessionKey="user_register_success" message="You have registered successfully."
            wrapperClass="pa-alert pa-success user_registration_success_alert" messageClass="pa-msg" role="alert"
            data-auto-dismiss="true" />

        <x-alerts.alert sessionKey="user_logout_success" message="You have logged out successfully."
            wrapperClass="pa-alert pa-success user_logout_success_alert" messageClass="pa-msg" role="alert"
            data-auto-dismiss="true" />

        {{--
          =============================================================================
          WHAT: Profile Update Success Flash Notification Display
          WHEN: Triggered when a profile update flash key is present in the session.
          WHY:  Delivers feedback on background changes.
          =============================================================================
        --}}
        <x-alerts.alert sessionKey="user_update_success" message="Your profile has been updated successfully."
            wrapperClass="pa-alert pa-success user_update_success_alert" messageClass="pa-msg" role="alert"
            data-auto-dismiss="true" />

        {{--
          =============================================================================
          WHAT: Authentication Form Wrapper
          WHEN: Encapsulates login submission controls and security tokens.
          WHY:  Enforces request validation and CSRF protection within structural UI classes.
          =============================================================================
        --}}
        <form action="{{ route('login.store') }}" method="POST" class="pf-card pf-centered" novalidate data-auth-form>
            @csrf

            <h1 class="pf-centered">LOGIN</h1>

            {{-- Top-Level Validation Error Bag Component --}}
            <x-forms.top-errors wrapperClass="pfe-alert-box" />

            {{-- Email Field Component Reference --}}
            <x-forms.form-field type="email" name="email" label="Email" placeholder="user@example.com"
                wrapperClass="user-login-email" inputClass="" required autocomplete="email" />

            {{-- Password Field Component Reference --}}
            <x-forms.form-field type="password" name="password" label="Password" placeholder="Enter your password"
                wrapperClass="user-login-password" inputClass="" required />

            {{-- Remember Me Checkbox Component Reference --}}
            <x-forms.form-field type="checkbox" name="remember" id="remember" label="Remember Me"
                wrapperClass="user-login-remember" inputClass="" />

            {{-- Submit Action Component Reference --}}
            <div class="pf-actions">
                <x-buttons.button id="login-submit-btn" type="submit" variant="primary" label="LogIn" icon="🔑"
                    :fields="['email', 'password', 'remember']" buttonRole="Click here to authenticate and access your secure user dashboard"
                    class="pb-btn pb-primary pb-full" />
            </div>
        </form>

        {{--
          =============================================================================
          WHAT: Authentication Card Footer & Navigation Links
          WHEN: Rendered below the main form container.
          WHY:  Provides quick secondary routing options like account creation.
          =============================================================================
        --}}
        <div class="login-footer">
            <span>Dont have an account?</span>
            <x-links.link href="{{ route('register') }}" label="Create Account" class="link-margin-top" />

        </div>
    </div>
</div>

{{--
  =============================================================================
  HOW TO REFERENCE, CALL, OR CUSTOMIZE THIS COMPONENT-DRIVEN VIEW ACROSS 10,000+ PROJECTS:
  -----------------------------------------------------------------------------
  1. COMPONENT CALL EXAMPLES & CUSTOMIZATION PROPS:
     - Alerts: <x-alerts.alert sessionKey="custom_key" message="Notice" type="success" wrapperClass="" messageClass="" />
     - Form Fields: <x-forms.form-field type="text" name="custom" label="Custom" placeholder="Text" wrapperClass="" inputClass="" required />
     - Buttons: <x-buttons.button id="btn" type="submit" variant="primary" label="Submit" icon="🔑" :fields="[]" buttonRole="Action" class="" />
     - Links: <x-links.link href="{{ route('home') }}" label="Home" class="" />

  2. FUTURE MODIFICATIONS TO THIS FILE:
     - To add a new input control, insert a new <x-forms.form-field> component reference inside the <form> block.
     - To introduce extra actions, append a new button or link instance with corresponding attributes.
  =============================================================================
--}}
