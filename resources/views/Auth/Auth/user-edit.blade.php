{{--
  =============================================================================
  WHAT: Enterprise User Edit Profile View Template (Class-Free Universal Component Usage)
  WHEN: Loaded when authorized users access the profile update endpoint across 10,000+ Laravel projects.
  WHY:  Leverages universal modular Blade components and model attributes while enforcing design-system hooks (`pf-*`, `pb-*`, `pa-*`).
  WHO:  Backend engineers and full-stack maintainers managing 10,000+ Laravel instances.
  WHERE: Saved as resources/views/Auth/Auth/user-edit.blade.php
  HOW:  Integrates Vite asset hooks, flash alerts via components, form-field components, and PATCH routing bindings.
  -----------------------------------------------------------------------------
  FUTURE MODIFICATIONS & CUSTOMIZATION GUIDE:
  - ADDING NEW FIELDS: Call another instance of <x-forms.form-field> passing the respective 'type', 'name', 'label', and custom class attributes.
  - MODIFYING PROFILE DATA: Access properties directly via the injected $user model instance.
  =============================================================================
--}}

@vite(['resources/css/Auth/Auth/user-edit.css', 'resources/js/Auth/Auth/user-edit.js'])

<div class="pf-screen-center">
    <div class="pf-card-bounding-box">



        {{--
          =============================================================================
          WHAT: User Edit Form Wrapper
          WHEN: Encapsulates profile update inputs, method spoofing, and security tokens.
          WHY:  Enforces request validation and secure PATCH submission.
          =============================================================================
        --}}
        <form action="{{ route('users.update', ['user' => $user->username]) }}" method="POST" class="pf-card pf-centered" novalidate>
            @csrf
            @method('PATCH')

            <h1 class="pf-centered">EDIT PROFILE</h1>

            {{-- Top-Level Validation Error Bag Component --}}
            <x-forms.top-errors wrapperClass="pfe-alert-box"/>

            {{-- Name Field Component Reference --}}
            <x-forms.form-field
                type="text"
                name="name"
                label="Name"
                value="{{ old('name', $user->name) }}"
                placeholder="Enter full name"
                wrapperClass=""
                inputClass=""
                required
                autocomplete="name"
            />

            {{-- Email Field Component Reference --}}
            <x-forms.form-field
                type="email"
                name="email"
                label="Email"
                value="{{ old('email', $user->email) }}"
                placeholder="user@example.com"
                wrapperClass=""
                inputClass=""
                required
                autocomplete="email"
            />

            {{-- Password Field Component Reference --}}
            <x-forms.form-field
                type="password"
                name="password"
                label="Password"
                placeholder="Leave blank to keep current password"
                wrapperClass=""
                inputClass=""
            />

            {{-- Submit Action Component Reference --}}
            <div class="pf-actions">
                <x-buttons.button
                    id="update-user-btn"
                    type="submit"
                    variant="primary"
                    label="Update"
                    icon="📝"
                    buttonRole="Click here to securely save your profile updates and sync changes"
                    class="pb-btn pb-primary"
                />
            </div>
        </form>
    </div>
</div>

{{--
  =============================================================================
  HOW TO REFERENCE, CALL, OR CUSTOMIZE THIS COMPONENT-DRIVEN VIEW ACROSS 10,000+ PROJECTS:
  -----------------------------------------------------------------------------
  1. COMPONENT PROPS & ATTRIBUTES USAGE EXAMPLES:
     - Alerts: <x-alerts.alert sessionKey="custom_key" message="Notice" wrapperClass="pa-alert pa-info" messageClass="pa-msg" />
     - Form Fields: <x-forms.form-field type="text" name="custom" label="Custom Label" placeholder="Placeholder" wrapperClass="" inputClass="" required />
     - Buttons: <x-buttons.button id="btn" type="submit" variant="primary" label="Submit" icon="💾" buttonRole="Action" class="pb-btn pb-primary" />

  2. FUTURE MODIFICATIONS TO THE UNIVERSAL COMPONENT ITSELF (resources/views/components/form/form-field.blade.php):
     - PROPS: Add your new variable definition to the @props array at the top of the component file.
     - ATTRIBUTE SANITIZATION: Add your new prop name to the $excludedAttributes array.
     - RENDERING LOGIC: Locate the @switch($type) block and insert your new `@case` block.
  =============================================================================
--}}