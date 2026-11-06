{{--
  =============================================================================
  WHAT: Project-Agnostic Universal Anonymous Blade Component
  WHEN: Used across 10,000+ distinct Laravel projects requiring dynamic form rendering.
  WHY:  Centralizes data hydration, old state recovery, and attribute parsing.
  WHO:  Backend and full-stack developers maintaining shared component libraries.
  WHERE: Saved as resources/views/components/form/form-field.blade.php
  HOW:  Called in views via <x-form.form-field type="text" name="email" label="Email" />
  -----------------------------------------------------------------------------
  FUTURE MODIFICATIONS (HOW TO ADD NEW CODE / FIELD TYPES):
  1. PROPS DEFINITION: Add your new variable to the @props array below with a fallback.
  2. ATTRIBUTE FILTERING: Add any custom prop name to the $excludedAttributes array
     so it doesn't get awkwardly double-rendered onto the underlying HTML tag.
  3. SWITCH CASE: Go to the @switch($type) block and add your new @case('your-type')
     handling markup, binding attributes via {{ $inputAttributeBag }}.
  =============================================================================
--}}

@props([
    'type' => 'text',
    'name' => '',
    'id' => null,
    'label' => null,
    'value' => '',
    'placeholder' => '',
    'options' => [],
    'rows' => 4,
    'inputClass' => '',
    'wrapperClass' => '',
    'legend' => null,
    'multiple' => false,
    'checked' => false,
    'dataHint' => null,

    {{-- Global HTML Attributes Supported Across All 10,000+ Projects --}}
    'accesskey' => null,
    'autocapitalize' => null,
    'contenteditable' => null,
    'dir' => null,
    'draggable' => null,
    'hidden' => false,
    'itemprop' => null,
    'lang' => null,
    'role' => null,
    'spellcheck' => null,
    'style' => null,
    'tabindex' => null,
    'title' => null,
    'translate' => null,
])

@php
/*
  =============================================================================
  WHAT: Component Initialization & Data Normalization Engine
  WHEN: Executes on every component render lifecycle before HTML is generated.
  WHY:  Normalizes names, IDs, array states, and legacy old() form inputs safely.
  -----------------------------------------------------------------------------
  FUTURE MODIFICATIONS:
  To support custom data transformations (e.g., encryption, formatting), insert
  your custom string manipulation helper functions right here inside this block.
  =============================================================================
*/
$id = $id ?? ($name ? Str::slug($name) : 'field_' . Str::random(8));
$formattedName = ($multiple && $name && !str_ends_with($name, '[]')) ? $name . '[]' : $name;

if (($type === 'checkbox' || $type === 'radio') && empty($options)) {
    $formattedName = $name;
}

if (($type === 'date' || $type === 'datetime-local') && $value) {
    try {
        $dateInstance = is_string($value) ? new \DateTime($value) : $value;
        $value = ($type === 'date') ? $dateInstance->format('Y-m-d') : $dateInstance->format('Y-m-d\TH:i');
    } catch (\Exception $e) {}
}

$valueArray = is_array($value) ? $value : (is_object($value) ? (array) $value : [$value]);
$oldValues = $name ? old($name, $valueArray) : $valueArray;
if (!is_array($oldValues)) {
    $oldValues = [$oldValues];
}

$checkboxCheckedState = $checked;
if (!$checkboxCheckedState && $name) {
    $legacyOldValue = old($name);
    if ($legacyOldValue !== null) {
        $legacyOldValues = is_array($legacyOldValue) ? $legacyOldValue : [$legacyOldValue];
        $checkboxCheckedState = in_array((string)($value ?: '1'), array_map('strval', $legacyOldValues), true);
    }
}

$globalAttributes = array_filter([
    'accesskey' => $accesskey,
    'autocapitalize' => $autocapitalize,
    'contenteditable'=> is_bool($contenteditable) ? ($contenteditable ? 'true' : 'false') : $contenteditable,
    'dir' => $dir,
    'draggable' => is_bool($draggable) ? ($draggable ? 'true' : 'false') : $draggable,
    'hidden' => is_bool($hidden) ? ($hidden ? 'hidden' : null) : $hidden,
    'itemprop' => $itemprop,
    'lang' => $lang,
    'role' => $role,
    'spellcheck' => is_bool($spellcheck) ? ($spellcheck ? 'true' : 'false') : $spellcheck,
    'style' => $style,
    'tabindex' => $tabindex !== null ? (string)$tabindex : null,
    'title' => $title,
    'translate' => is_bool($translate) ? ($translate ? 'yes' : 'no') : $translate,
    'data-hint' => $dataHint,
], fn($val) => $val !== null && $val !== false && $val !== '');

/*
  FUTURE MODIFICATION NOTE:
  If you add a new prop above, ensure you add its name to this $excludedAttributes
  array to prevent it from leaking as an unhandled HTML attribute on the rendered tag.
*/
$excludedAttributes = [
    'class', 'label', 'options', 'rows', 'multiple', 'data-hint', 'dataHint',
    'inputClass', 'wrapperClass', 'legend', 'checked', 'accesskey', 'autocapitalize',
    'contenteditable', 'dir', 'draggable', 'hidden', 'itemprop', 'lang', 'role',
    'spellcheck', 'style', 'tabindex', 'title', 'translate'
];

$inputAttributeBag = $attributes->except($excludedAttributes)->merge($globalAttributes);
@endphp

{{--
  WHAT: Wrapper Container Block
  WHEN: Always wraps the label and control element.
  FUTURE MODIFICATIONS: Pass wrapper classes entirely via 'wrapperClass' attribute from caller.
--}}
<div {{ $attributes->only(['class', 'style'])->merge(['class' => trim($wrapperClass . ($type === 'hidden' ? ' hidden' : ''))]) }}>

    {{--
      WHAT: Conditional Field Label
      WHEN: Rendered for all standard interactive fields (omitted for hidden/buttons/fieldsets).
    --}}
    @if($label && !in_array($type, ['hidden', 'checkbox', 'radio', 'button', 'submit', 'reset', 'fieldset', 'form', 'image']))
    <label for="{{ $attributes->get('for', $id) }}">{{ $label }}</label>
    @endif

    {{--
      WHAT: Polymorphic Element Switcher
      WHEN: Determines which HTML control to render based on the passed 'type' prop.
    --}}
    @switch($type)

    @case('form')
    <form @if($name) name="{{ $name }}" @endif id="{{ $id }}" class="{{ $inputClass }}" {{ $inputAttributeBag }}>
        {{ $slot ?? '' }}
    </form>
    @break

    @case('textarea')
    <textarea @if($formattedName) name="{{ $formattedName }}" @endif id="{{ $id }}" rows="{{ $rows }}" placeholder="{{ $placeholder }}" class="{{ $inputClass }}" {{ $inputAttributeBag }}>{{ $name ? old($name, is_array($value) ? implode("\n", $value) : $value) : $value }}</textarea>
    @break

    @case('select')
    <select @if($formattedName) name="{{ $formattedName }}" @endif id="{{ $id }}" class="{{ $inputClass }}" {{ $multiple ? 'multiple' : '' }} {{ $inputAttributeBag }}>
        @if($placeholder && !$multiple)
        <option value="">{{ $placeholder }}</option>
        @endif
        @foreach($options as $val => $txt)
            @if(is_array($txt) && isset($txt['options']))
            <optgroup label="{{ $txt['label'] ?? $val }}" {{ !empty($txt['disabled']) ? 'disabled' : '' }}>
                @foreach($txt['options'] as $optVal => $optTxt)
                    @php
                    $optionValue = is_array($optTxt) ? ($optTxt['value'] ?? $optVal) : $optVal;
                    $optionLabel = is_array($optTxt) ? ($optTxt['label'] ?? $optionValue) : $optTxt;
                    $optionDisabled = is_array($optTxt) && !empty($optTxt['disabled']);
                    $isSelected = in_array((string)$optionValue, array_map('strval', $oldValues), true);
                    @endphp
                    <option value="{{ $optionValue }}" {{ $isSelected ? 'selected' : '' }} {{ $optionDisabled ? 'disabled' : '' }}>{{ $optionLabel }}</option>
                @endforeach
            </optgroup>
            @else
            @php
            $optionValue = is_array($txt) ? ($txt['value'] ?? $val) : $val;
            $optionLabel = is_array($txt) ? ($txt['label'] ?? $optionValue) : $txt;
            $optionDisabled = is_array($txt) && !empty($txt['disabled']);
            $isSelected = in_array((string)$optionValue, array_map('strval', $oldValues), true);
            @endphp
            <option value="{{ $optionValue }}" {{ $isSelected ? 'selected' : '' }} {{ $optionDisabled ? 'disabled' : '' }}>{{ $optionLabel }}</option>
            @endif
        @endforeach
    </select>
    @break

    @case('file')
    @if(isset($customChooseFileRepresentation))
    <div>{{ $customChooseFileRepresentation }}</div>
    @else
    <div>
        <input type="file" @if($formattedName) name="{{ $formattedName }}" @endif id="{{ $id }}" {{ $multiple ? 'multiple' : '' }} class="{{ $inputClass }}" {{ $inputAttributeBag }}>
    </div>
    @endif
    @break

    @case('email')
    <input type="email" @if($formattedName) name="{{ $formattedName }}" @endif id="{{ $id }}" {{ $multiple ? 'multiple' : '' }} value="{{ $name ? old($name, is_array($value) ? implode(', ', $value) : $value) : $value }}" placeholder="{{ $placeholder }}" class="{{ $inputClass }}" {{ $inputAttributeBag }}>
    @break

    @case('checkbox')
    @case('radio')
        @if(count($options) > 0)
        <div>
            @foreach($options as $val => $txt)
                @php
                $optionValue = is_array($txt) ? ($txt['value'] ?? $val) : $val;
                $optionLabel = is_array($txt) ? ($txt['label'] ?? $optionValue) : $txt;
                $uniqueOptionId = $id . '_' . Str::slug($optionValue);
                $isChecked = in_array((string)$optionValue, array_map('strval', $oldValues), true);
                @endphp
                <div>
                    <input type="{{ $type }}" name="{{ $type === 'checkbox' ? $formattedName : $name }}" id="{{ $uniqueOptionId }}" value="{{ $optionValue }}" class="{{ $inputClass }}" {{ $isChecked ? 'checked' : '' }} {{ $inputAttributeBag }}>
                    <label for="{{ $uniqueOptionId }}">{{ $optionLabel }}</label>
                </div>
            @endforeach
        </div>
        @else
        <div>
            <input type="{{ $type }}" @if($formattedName) name="{{ $formattedName }}" @endif id="{{ $id }}" value="{{ $value ?: '1' }}" class="{{ $inputClass }}" {{ $checkboxCheckedState ? 'checked' : '' }} {{ $inputAttributeBag }}>
            @if($label)
            <label for="{{ $id }}">{{ $label }}</label>
            @endif
        </div>
        @endif
    @break

    @case('image')
    <input type="image" @if($name) name="{{ $name }}" @endif id="{{ $id }}" class="{{ $inputClass }}" {{ $inputAttributeBag }}>
    @break

    @case('datalist')
    @php $datalistId = $attributes->get('list', 'list_' . $id); @endphp
    <input list="{{ $datalistId }}" @if($formattedName) name="{{ $formattedName }}" @endif id="{{ $id }}" value="{{ $name ? old($name, is_array($value) ? reset($value) : $value) : $value }}" placeholder="{{ $placeholder }}" class="{{ $inputClass }}" {{ $inputAttributeBag->except(['list']) }}>
    <datalist id="{{ $datalistId }}">
        @foreach($options as $optVal => $optLabel)
            @php
            $valAttr = is_array($optLabel) ? ($optLabel['value'] ?? $optVal) : (is_numeric($optVal) ? $optLabel : $optVal);
            $lblAttr = is_array($optLabel) ? ($optLabel['label'] ?? null) : (is_numeric($optVal) ? null : $optLabel);
            @endphp
            <option value="{{ $valAttr }}" @if($lblAttr) label="{{ $lblAttr }}" @endif></option>
        @endforeach
    </datalist>
    @break

    @case('meter')
    <meter id="{{ $id }}" value="{{ $value }}" class="{{ $inputClass }}" {{ $inputAttributeBag }}>{{ $value }}</meter>
    @break

    @case('progress')
    <progress id="{{ $id }}" @if($value !=='' && $value !==null) value="{{ $value }}" @endif class="{{ $inputClass }}" {{ $inputAttributeBag }}>{{ $value }}</progress>
    @break

    @case('output')
    <output @if($formattedName) name="{{ $formattedName }}" @endif id="{{ $id }}" class="{{ $inputClass }}" {{ $inputAttributeBag }}>{{ $name ? old($name, is_array($value) ? implode(', ', $value) : $value) : $value }}</output>
    @break

    @case('fieldset')
    <fieldset @if($name) name="{{ $name }}" @endif id="{{ $id }}" class="{{ $inputClass }}" {{ $inputAttributeBag }}>
        @if($legend)
        <legend>{{ $legend }}</legend>
        @endif
        {{ $slot ?? '' }}
    </fieldset>
    @break

    @case('button')
    @case('submit')
    @case('reset')
    <button type="{{ $type }}" @if($formattedName) name="{{ $formattedName }}" @endif id="{{ $id }}" class="{{ $inputClass }}" {{ $inputAttributeBag }}>{{ $label ?? $placeholder }}</button>
    @break

    @case('date')
    @case('datetime-local')
    <input type="{{ $type }}" @if($formattedName) name="{{ $formattedName }}" @endif id="{{ $id }}" value="{{ $name ? old($name, is_array($value) ? reset($value) : $value) : $value }}" placeholder="{{ $placeholder ?: 'dd-mm-yyyy' }}" class="{{ $inputClass }}" {{ $inputAttributeBag }}>
    @break

    @case('hidden')
    <input type="hidden" @if($formattedName) name="{{ $formattedName }}" @endif id="{{ $id }}" value="{{ $name ? old($name, is_array($value) ? reset($value) : $value) : $value }}" {{ $inputAttributeBag }}>
    @break

    {{--
      =============================================================================
      FUTURE MODIFICATION:
      To add a brand new field type (e.g., custom slider, range picker, color picker),
      simply insert your new `@case('your-type-name')` block right here before
      the `@default` fallback statement, referencing `{{ $inputAttributeBag }}`.
      =============================================================================
    --}}

    @default
    <input type="{{ $type }}" @if($formattedName) name="{{ $formattedName }}" @endif id="{{ $id }}" value="{{ $name ? old($name, is_array($value) ? reset($value) : $value) : $value }}" placeholder="{{ $placeholder }}" class="{{ $inputClass }}" {{ $inputAttributeBag }}>
    @endswitch
</div>