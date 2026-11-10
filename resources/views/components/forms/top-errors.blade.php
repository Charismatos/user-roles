{{--
  =============================================================================
  WHAT: Top-of-Form Validation Errors Container Component
  WHEN: Used at the top of any form across 10,000+ projects to display aggregated validation failures.
  WHY:  Provides a centralized block for displaying global validation errors without hardcoded styles.
  WHO:  Full-stack developers and package architects.
  WHERE: Saved as resources/views/components/forms/top-errors.blade.php
  HOW:  Called in views via <x-forms.top-errors /> or with a custom error bag <x-forms.top-errors bag="login" />
  -----------------------------------------------------------------------------
  FUTURE MODIFICATIONS & CUSTOMIZATION GUIDE:
  - ADDING NEW BEHAVIORS: To support custom error bag checking or multi-bag merging,
    modify the $errorBag resolution logic inside the @php block below.
  - ADDING CODE: To include an alert icon, SVG, or custom heading, insert it directly
    above or within the $errors->any() check. --}}


@props([
    'bag' => 'default',
    'wrapperClass' => '',
    'listClass' => '',
    'itemClass' => '',
])



@if ($errors->any())
<div {{ $attributes->merge(['class' => trim($wrapperClass)]) }}>
    <ul {{ $attributes->has('list-class') ? '' : '' }}>
        @foreach ($errors->all() as $error)
            <li>{{ $error }}</li>
        @endforeach
    </ul>
    {{ $slot ?? '' }}
</div>
@endif

{{--
  -----------------------------------------------------------------------------
  EXAMPLE: HOW TO REFERENCE AND COMBINE IN YOUR FORM FILES:
  -----------------------------------------------------------------------------
  <form action="{{ route('register.store') }}" method="POST">
      @csrf

      // Standard usage at the top of the form
      <x-forms.top-errors wrapperClass="" listClass="" itemClass="" />

      // Usage with a named validation error bag
      // <x-forms.top-errors bag="login" wrapperClass="" />
  </form>
  =============================================================================
--}}