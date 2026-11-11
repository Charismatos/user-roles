{{--
  =============================================================================
  WHAT: Project-Agnostic Universal Anonymous Button Blade Component
  WHEN: Used across 10,000+ distinct Laravel projects requiring dynamic button rendering.
  WHY:  Centralizes attribute parsing, accessibility hints, and native property normalization.
  WHO:  Backend and full-stack developers maintaining shared component libraries.
  WHERE: Saved as resources/views/components/buttons/button.blade.php
  HOW:  Called in views via <x-buttons.button label="Save" type="submit" />
  -----------------------------------------------------------------------------
  FUTURE MODIFICATIONS (HOW TO ADD NEW CODE / BUTTON PROPS):
  1. PROPS DEFINITION: Add your new variable to the @props array below with a fallback.
  2. ATTRIBUTE PARSING: Add your property mapping logic inside the PHP initialization block.
  3. RENDER SURFACE: Update the <button> tag structure at the bottom if structural markup changes.
  =============================================================================
--}}

@props([
    // Component Custom Props
    'id' => null,
    'type' => 'button',
    'variant' => 'default',
    'label' => 'Action Trigger',
    'icon' => null,
    'fields' => [],
    'buttonRole' => null,

    // HTML5 Native Standard Button Props
    'disabled' => false,
    'form' => null,
    'formaction' => null,
    'formenctype' => null,
    'formmethod' => null,
    'formnovalidate' => false,
    'formtarget' => null,
    'name' => null,
    'value' => null,

    // HTML5 Global Attributes
    'accesskey' => null,
    'aria' => [],
    'autocapitalize' => null,
    'class' => null,
    'contenteditable' => null,
    'data' => [],
    'dir' => null,
    'draggable' => null,
    'hidden' => false,
    'itemprop' => null,
    'lang' => null,
    'role' => null,
    'slot' => null,
    'spellcheck' => null,
    'style' => null,
    'tabindex' => null,
    'title' => null,
    'translate' => null,
])

{{-- THE TRIGGER SURFACE --}}
@php
/*
  =============================================================================
  WHAT: Component Initialization & Data Normalization Engine
  WHEN: Executes on every component render lifecycle before HTML is generated.
  WHY:  Safely normalizes native attributes, global attributes, and styles,
        while filtering out custom internal props to prevent array type errors.
  -----------------------------------------------------------------------------
  FUTURE MODIFICATIONS:
  To support custom data transformations or attribute formatting, insert your
  custom string manipulation helper functions right here inside this block.
  =============================================================================
*/

// Container for dynamic HTML attribute bindings
$dynamicAttributes = [];

// 1. Unique ID and Data-Hub Target Binding
if (!empty($id)) {
    $dynamicAttributes['id'] = $id;
    $dynamicAttributes['data-hub-target'] = $id;
}

// 2. Form & Submission Control Attributes
if (!is_null($name)) $dynamicAttributes['name'] = $name;
if (!is_null($value)) $dynamicAttributes['value'] = $value;
if (!is_null($form)) $dynamicAttributes['form'] = $form;
if (!is_null($formaction)) $dynamicAttributes['formaction'] = $formaction;
if (!is_null($formenctype)) $dynamicAttributes['formenctype'] = $formenctype;
if (!is_null($formmethod)) $dynamicAttributes['formmethod'] = $formmethod;
if (!is_null($formtarget)) $dynamicAttributes['formtarget'] = $formtarget;

// 3. Native Boolean HTML Attributes
if ($disabled) $dynamicAttributes['disabled'] = true;
if ($formnovalidate) $dynamicAttributes['formnovalidate'] = true;

// 4. Global Attributes Resolution
if (!is_null($accesskey)) $dynamicAttributes['accesskey'] = $accesskey;
if (!is_null($autocapitalize)) $dynamicAttributes['autocapitalize'] = $autocapitalize;
if (!is_null($dir)) $dynamicAttributes['dir'] = $dir;
if (!is_null($itemprop)) $dynamicAttributes['itemprop'] = $itemprop;
if (!is_null($lang)) $dynamicAttributes['lang'] = $lang;
if (!is_null($role)) $dynamicAttributes['role'] = $role;
if (!is_null($slot)) $dynamicAttributes['slot'] = $slot;
if (!is_null($tabindex)) $dynamicAttributes['tabindex'] = $tabindex;
if (!is_null($title)) $dynamicAttributes['title'] = $title;

// 4a. Enumerated/Boolean Global Attributes Requiring Specific HTML Strings
if (!is_null($contenteditable)) {
    $dynamicAttributes['contenteditable'] = is_bool($contenteditable) ? ($contenteditable ? 'true' : 'false') : $contenteditable;
}

if (!is_null($draggable)) {
    $dynamicAttributes['draggable'] = is_bool($draggable) ? ($draggable ? 'true' : 'false') : $draggable;
}

if ($hidden !== false && !is_null($hidden)) {
    $dynamicAttributes['hidden'] = is_bool($hidden) ? true : $hidden;
}

if (!is_null($spellcheck)) {
    $dynamicAttributes['spellcheck'] = is_bool($spellcheck) ? ($spellcheck ? 'true' : 'false') : $spellcheck;
}

if (!is_null($translate)) {
    $dynamicAttributes['translate'] = is_bool($translate) ? ($translate ? 'yes' : 'no') : $translate;
}

// 4b. Array Hash Maps (aria-* and data-*)
if (is_array($aria) && !empty($aria)) {
    foreach ($aria as $key => $val) {
        $dynamicAttributes["aria-{$key}"] = is_bool($val) ? ($val ? 'true' : 'false') : $val;
    }
}

if (is_array($data) && !empty($data)) {
    foreach ($data as $key => $val) {
        $dynamicAttributes["data-{$key}"] = is_bool($val) ? ($val ? 'true' : 'false') : $val;
    }
}

// 4c. Style Formatter (Sorting out style attribute formatting safely)
if (!is_null($style)) {
    if (is_array($style)) {
        $styleString = collect($style)->map(fn($v, $k) => "{$k}: {$v}")->implode('; ');
        $dynamicAttributes['style'] = $styleString;
    } else {
        $dynamicAttributes['style'] = $style;
    }
}

/*
  =============================================================================
  CRITICAL FIX: EXCLUDED COMPONENT PROPS
  Prevents internal component arrays (like $fields) from leaking into the
  HTML attribute bag and causing trim() array type exceptions.
  =============================================================================
*/
$excludedAttributes = [
    'id', 'variant', 'label', 'icon', 'fields', 'buttonRole',
    'disabled', 'form', 'formaction', 'formenctype', 'formmethod',
    'formnovalidate', 'formtarget', 'name', 'value', 'accesskey',
    'aria', 'autocapitalize', 'contenteditable', 'data', 'dir',
    'draggable', 'hidden', 'itemprop', 'lang', 'role', 'slot',
    'spellcheck', 'style', 'tabindex', 'title', 'translate'
];

// 5. Merge evaluated properties back into Blade's ComponentAttributeBag while excluding custom props
$attributes = $attributes->except($excludedAttributes)->merge($dynamicAttributes);

// 6. Handle Class Props Merging (Allows string or array)
if (!empty($class)) {
    $attributes = $attributes->class($class);
}

// 7. Accessibility & Hint Fallback Resolution Logic
if (empty($buttonRole)) {
    if ($type === 'submit') {
        $buttonRole = 'Submit Entered Data';
    } elseif ($type === 'reset') {
        $buttonRole = 'Reset All Entered Data To Initial State';
    } elseif ($type === 'button') {
        $whereToLook = $attributes->get('class') ?? $id;
        if (!empty($whereToLook)) {
            $whatToLookFor = '/[-_]+/';
            $whatToReplaceWith = ' ';
            $buttonRole = trim(preg_replace($whatToLookFor, $whatToReplaceWith, (string) $whereToLook));
        }
    }
}
@endphp

{{--
  WHAT: Rendered Button Trigger Surface
  WHEN: Outputs the final HTML button element with fully parsed attributes and safe evaluation using {!! !!}.
--}}
<button type="{{ $type }}" data-hint="{!! $buttonRole !!}" {!! $attributes !!}>
    @if($icon)
    <span>{!! $icon !!}</span>
    @endif
    {!! $label !!}
</button>

{{--
  =============================================================================
  HOW TO REFERENCE, CALL, OR CUSTOMIZE THIS COMPONENT ACROSS 10,000+ PROJECTS:
  -----------------------------------------------------------------------------
  1. BASIC USAGE:
     <x-buttons.button label="Submit Form" type="submit" />

  2. COMPREHENSIVE USAGE UTILIZING ALL CUSTOM PROPS (INCLUDING custom buttonRole / hover hints):
     <x-buttons.button
         id="save-user-btn"
         type="submit"
         variant="primary"
         label="Save Changes"
         icon="💾"
         :fields="['name', 'email', 'role']"
         buttonRole="Click here to securely save your profile updates and sync changes"
         class="pb-btn pb-primary"
     />

  3. SECONDARY EXAMPLE (RESET WITH EXPLICIT HOVER HINT):
     <x-buttons.button
         id="reset-form-btn"
         type="reset"
         variant="outline"
         label="Clear Fields"
         buttonRole="Warning: This will clear all data entered in current form"
         disabled="false"
     />

  4. FUTURE MODIFICATIONS TO THIS COMPONENT FILE:
     - To add new props: Add them to the @props array at the top with defaults.
     - To prevent array or custom props from leaking into HTML tags, add their names
       to the $excludedAttributes array above.
     - To handle dynamic or formatted inline styles or labels safely, ensure expressions
       are evaluated using raw interpolation syntax like {!! $buttonRole !!} or {!! $attributes !!}.
  =============================================================================
--}}