{{--
  =============================================================================
  WHAT: Enterprise Registration View Template (Class-Free Universal Component Usage)
  WHEN: Loaded when users visit the registration endpoint in any Laravel project.
  WHY:  Leverages the universal anonymous component without enforcing any hardcoded styles.
  WHO:  Full-stack developers and Laravel package maintainers.
  WHERE: Saved as resources/views/auth/guest/register.blade.php
  HOW:  Renders layout containers and calls <x-forms.form-field> with empty class attributes.
  -----------------------------------------------------------------------------
  FUTURE MODIFICATIONS & CUSTOMIZATION GUIDE:
  - ADDING NEW FIELDS: Call another instance of <x-forms.form-field> passing
    the respective 'type', 'name', 'label', and your external stylesheet classes if desired.
  =============================================================================
--}}

  @vite(['resources/css/Auth/Guest/user-register.css', 'resources/js/Auth/Guest/user-register.js'])

<div class="pf-screen-center">
    <div class="pf-card-bounding-box">

        {{-- Success Flash Notification Display --}}
        @if(session('delete_success'))
        <div role="alert">
            <p>Deleted Successfully</p>
        </div>
        @endif





        <form action="{{ route('register.store') }}" method="POST" class="pf-card pf-centered" novalidate>
            {{--
              =============================================================================
              WHAT: CSRF Token Injection
              WHEN: Automatically included in all Laravel forms to prevent cross-site request forgery.
              WHY:  Ensures that form submissions are secure and originate from the application.
              WHO:  Backend developers and security-conscious full-stack engineers.
              WHERE: Included in the form via @csrf directive.
              HOW:  Renders a hidden input field with a unique token for each session.
              -----------------------------------------------------------------------------
              FUTURE MODIFICATIONS:
              If you need to customize the CSRF token behavior, refer to Laravel's documentation on CSRF protection.
              =============================================================================
            --}}
            <h1 class="pf-centered">REGISTER</h1>
            {{-- Tells the FormRequest which error bag to flash validation failures into --}}
            {{-- <inputtype="hidden"name="error_bag"value="user-register"> --}}
            <x-forms.top-errors wrapperClass="user-register-errors pfe-alert-box"/>
            {{-- @if ($errors->any())
            <div class="user-errrors">
                <ul>
                    @foreach ($errors->all() as $error)
                        <li>{{ $error }}</li>
                    @endforeach
                </ul>

            </div>
            @endif --}}
            @csrf

            {{-- Name Field Component Reference --}}
            <x-forms.form-field
                type="text"
                name="name"
                label="Name"
                placeholder="Enter full name"
                wrapperClass="user-register-name"
                inputClass=""
                required
                autocomplete="name"
            />

            {{-- Username Field Component Reference --}}
            <x-forms.form-field
                type="text"
                name="username"
                label="Username"
                placeholder="Choose a unique username"
                wrapperClass=""
                inputClass=""
                autocomplete="username"
            />

            {{-- Email Field Component Reference --}}
            <x-forms.form-field
                type="email"
                name="email"
                label="Email"
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
                placeholder="Minimum 8 characters"
                wrapperClass=""
                inputClass=""
                required
            />

            {{-- Submit Action Component Reference --}}
            <div class="pf-actions">
                 <x-buttons.button
                    id="save-user-btn"
                    type="submit"
                    variant="primary"
                    label="Save Changes"
                    icon="💾"
                    buttonRole="Click here to securely save your profile updates and sync changes"
                    class="pb-btn pb-primary"
                />
        </form>
    </div>
</div>

{{--
  =============================================================================
  HOW TO MAKE FUTURE MODIFICATIONS TO THE UNIVERSAL COMPONENT ITSELF:
  -----------------------------------------------------------------------------
  If you need to add brand new functionality or field types to your universal
  component (resources/views/components/form/form-field.blade.php):

  1. PROPS: Add your new variable definition to the @props array at the top of the file.
  2. ATTRIBUTE SANITIZATION: Add your new prop name to the $excludedAttributes array.
  3. RENDERING LOGIC: Locate the @switch($type) block and insert your new `@case`.
  =============================================================================
--}}