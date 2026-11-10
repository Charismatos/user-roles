{{--
  =============================================================================
  WHAT: Per-Field Validation Error Display Component
  WHEN: Placed directly below or beside individual form fields to render field-specific error messages.
  WHY:  Automatically checks Laravel's $errors bag using the provided field name attribute.
  WHO:  Frontend and backend developers building resilient form layouts.
  WHERE: Saved as resources/views/components/form/form-error.blade.php
  HOW:  Called in views via <x-form.form-error name="email" /> right next to your form fields.
  -----------------------------------------------------------------------------
  FUTURE MODIFICATIONS & CUSTOMIZATION GUIDE:
  - ADDING NEW VALIDATION FORMATS: To support custom text styling transformations
    or multi-error arrays per field, modify the $errorMessage handling logic below.
  - ADDING CODE: To prepend an inline validation icon or tooltip symbol, insert
    your markup inside the conditional span block.

  -----------------------------------------------------------------------------
  EXAMPLE: HOW TO REFERENCE AND COMBINE IN YOUR FORM FILES:
  -----------------------------------------------------------------------------
  <form action="{{ route('register.store') }}" method="POST">
      @csrf

      <x-form.form-field
          type="email"
          name="email"
          label="Email Address"
      />

      // Place immediately following the corresponding input field
      <x-form.infield-errors name="email" wrapperClass="" />
  </form>
  =============================================================================
--}}

@props([
    'name' => '',
    'wrapperClass' => '',
])

@php
/*
  =============================================================================
  WHAT: Field-Specific Error State Inspection
  WHEN: Runs when the component is rendered for a given field name key.
  WHY:  Safely extracts the first validation error message associated with the field.
  -----------------------------------------------------------------------------
  FUTURE MODIFICATIONS:
  If handling array inputs (e.g., roles.*), ensure dot-to-array wildcard translation
  is processed here if needed.
  =============================================================================
*/
$hasError = $name && $errors->has($name);
$errorMessage = $hasError ? $errors->first($name) : null;
@endphp

@if ($errorMessage)
<div {{ $attributes->merge(['class' => trim($wrapperClass)]) }}>
    <span>{{ $errorMessage }}</span>
    {{ $slot ?? '' }}
</div>
@endif