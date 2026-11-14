{{--
  =============================================================================
  WHAT: Enterprise Role Creation View Template (Class-Free Universal Component Usage)
  WHEN: Loaded when authorized users access the role creation endpoint across 10,000+ Laravel projects.
  WHY:  Leverages universal anonymous Blade components and model attributes while removing hardcoded styles, deferring visual presentation entirely to external Vite bundles.
  WHO:  Backend engineers, full-stack developers, and package maintainers managing scalable Laravel instances.
  WHERE: Saved as resources/views/Roles/Editor/role-create.blade.php
  HOW:  Integrates Vite asset hooks, flash alert components, form-field components, top-error containers, and secure POST routing bindings.
  -----------------------------------------------------------------------------
  FUTURE MODIFICATIONS & CUSTOMIZATION GUIDE:
  - ADDING NEW FIELDS: Call another instance of <x-forms.form-field> passing the respective 'type', 'name', 'label', and custom attribute parameters.
  - MODIFYING FORM ACTION: Update the route parameter inside the form 'action' attribute to align with your project routing specs.
  - PINPOINTING CODE ADDITIONS: To add secondary fields or multi-select dropdown components, insert them directly inside the form tag before the submit button container.
  =============================================================================
--}}

@vite(['resources/css/Roles/Editor/role-create.css', 'resources/js/Roles/Editor/role-create.js'])

<div class="pf-screen-center">
    <div class="pf-card-bounding-box">


        {{-- Role Management Header Section --}}
        <header>
            <h1 class="pf-centered">Create Role</h1>
            <p>Add a new authorization tier to the application.</p>
            <x-links.link href="{{ route('roles.index') }}" label="Back to List" class="pl-link pl-muted" />
        </header>

        {{--
          =============================================================================
          WHAT: Role Creation Form Wrapper
          WHEN: Encapsulates creation inputs, security tokens, and validation handling.
          WHY:  Enforces request validation and secure POST submission.
          =============================================================================
        --}}
        <form action="{{ route('roles.store') }}" method="POST" class="pf-card pf-centered" novalidate>
            @csrf

            {{-- Top-Level Validation Error Bag Component Reference --}}
            <x-forms.top-errors wrapperClass="pfe-alert-box" />

            {{-- Role Name Field Component Reference --}}
            <x-forms.form-field type="text" name="name" label="Role Name" value="{{ old('name') }}"
                placeholder="Enter role name (e.g., Administrator)" wrapperClass="" inputClass="" required
                autocomplete="off" />

            {{-- Role Slug Field Component Reference --}}
            <x-forms.form-field type="text" name="slug" label="Role Slug" value="{{ old('slug') }}"
                placeholder="Leave blank to auto-generate from name" wrapperClass="" inputClass=""
                autocomplete="off" />

            {{-- Hierarchy Level Field Component Reference --}}
            <x-forms.form-field type="number" name="level" label="Hierarchy Level Weight"
                value="{{ old('level', 99) }}" placeholder="99" wrapperClass="" inputClass="" min="0"
                max="999" required />

            {{-- Description Field Component Reference --}}
            <x-forms.form-field type="textarea" name="description" label="Description" value="{{ old('description') }}"
                placeholder="Describe role scope and responsibilities..." wrapperClass="" inputClass="" />

            {{-- System Flag Hidden Fallback & Checkbox Component Reference --}}
            <input type="hidden" name="is_system" value="0">
            <x-forms.form-field type="checkbox" name="is_system" id="is_system" label="System Protected Role"
                value="1" :checked="old('is_system') ? true : false" wrapperClass="" inputClass="" />

            {{-- Submit Action Component Reference --}}
            <div class="pf-actions">
                <x-buttons.button id="save-role-btn" type="submit" variant="primary" label="Save Role" icon="💾"
                    buttonRole="Click here to securely save the new role and sync permissions"
                    class="pb-btn pb-primary" />
            </div>
        </form>
    </div>
</div>

{{--
  =============================================================================
  HOW TO REFERENCE, CALL, OR CUSTOMIZE THIS COMPONENT-DRIVEN VIEW ACROSS 10,000+ PROJECTS:
  -----------------------------------------------------------------------------
  1. COMPONENT PROPS & ATTRIBUTES USAGE EXAMPLES:
     - Alerts: <x-alerts.alert sessionKey="custom_key" message="Notice text" wrapperClass="pa-alert pa-info" messageClass="pa-msg" role="alert" />
     - Form Fields: <x-forms.form-field type="text" name="custom" label="Label" value="" placeholder="Placeholder" wrapperClass="" inputClass="" required autocomplete="off" />
     - Buttons: <x-buttons.button id="btn-id" type="submit" variant="primary" label="Submit" icon="💾" buttonRole="Role description" class="pb-btn pb-primary" />
     - Links: <x-links.link href="{{ route('home') }}" label="Home" class="pl-link pl-primary" />

  2. FUTURE MODIFICATIONS TO THE UNIVERSAL COMPONENT ITSELF:
     - If you need to add custom properties or new input variants, inspect the target component file (e.g., resources/views/components/form/form-field.blade.php), add your variable to the `@props([])` array, update attribute filtering arrays, and include your rendering logic inside the `@switch($type)` block.
  =============================================================================
--}}
