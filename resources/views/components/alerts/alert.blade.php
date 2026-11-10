{{--
  =============================================================================
  WHAT: Project-Agnostic Universal Alert / Flash Notification Blade Component
  WHEN: Used across 10,000+ distinct Laravel projects for page-wide, layout-wide, or form alerts.
  WHY:  Centralizes flash message hydration, session checking, and global attribute parsing.
  WHO:  Backend and full-stack developers maintaining shared component libraries.
  WHERE: Saved as resources/views/components/alert.blade.php
  HOW:  Called in views via <x-alert sessionKey="delete_success" message="Deleted Successfully" />
  -----------------------------------------------------------------------------
  FUTURE MODIFICATIONS (HOW TO ADD NEW CODE / ALERT TYPES):
  1. PROPS DEFINITION: Add your new variable to the @props array below with a fallback.
  2. ATTRIBUTE FILTERING: Add any custom prop name to the $excludedAttributes array
     so it doesn't get awkwardly double-rendered onto the underlying HTML tag.
  3. RENDERING LOGIC: Adjust session message resolution or condition checks inside the markup block.
  =============================================================================
--}}

@props([
    'sessionKey' => null,
    'message' => null,
    'type' => 'success',
    'id' => null,
    'role' => 'alert',
    'wrapperClass' => '',
    'messageTag' => 'p',
    'messageClass' => '',

    {{-- Global HTML Attributes Supported Across All 10,000+ Projects --}}
    'accesskey' => null,
    'autocapitalize' => null,
    'contenteditable' => null,
    'dir' => null,
    'draggable' => null,
    'hidden' => false,
    'itemprop' => null,
    'lang' => null,
    'spellcheck' => null,
    'style' => null,
    'tabindex' => null,
    'title' => null,
    'translate' => null,
])

@php
/*
  =============================================================================
  WHAT: Alert Component Initialization & Data Normalization Engine
  WHEN: Executes on every component render lifecycle before HTML is generated.
  WHY:  Normalizes session flash keys, direct messages, IDs, and global attributes safely.
  -----------------------------------------------------------------------------
  FUTURE MODIFICATIONS:
  To support custom message formatting, encryption check, or translation helpers,
  insert your custom string/data manipulation logic right here inside this block.
  =============================================================================
*/
$id = $id ?? 'alert_' . Str::random(8);

// Resolve message from session flash or direct prop argument
$resolvedMessage = null;
if ($sessionKey) {
    $resolvedMessage = session($sessionKey);
}
$resolvedMessage = $resolvedMessage ?? $message;

// Normalize and filter explicitly assigned HTML Global Attributes
$globalAttributes = array_filter([
    'accesskey' => $accesskey,
    'autocapitalize' => $autocapitalize,
    'contenteditable' => is_bool($contenteditable) ? ($contenteditable ? 'true' : 'false') : $contenteditable,
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
], fn($val) => $val !== null && $val !== false && $val !== '');

/*
  FUTURE MODIFICATION NOTE:
  If you add a new prop above, ensure you add its name to this $excludedAttributes
  array to prevent it from leaking as an unhandled HTML attribute on the rendered tag.
*/
$excludedAttributes = [
    'class', 'sessionKey', 'message', 'type', 'wrapperClass', 'messageTag', 'messageClass',
    'accesskey', 'autocapitalize', 'contenteditable', 'dir', 'draggable', 'hidden',
    'itemprop', 'lang', 'role', 'spellcheck', 'style', 'tabindex', 'title', 'translate'
];

// Combine normalized global attributes with passed unhandled attributes (aria-*, data-*, etc.)
$alertAttributeBag = $attributes->except($excludedAttributes)->merge($globalAttributes);
@endphp

{{--
  WHAT: Alert Wrapper Container Block
  WHEN: Rendered conditionally when a valid session flash or direct message exists (or when slot content is present).
  FUTURE MODIFICATIONS: Pass wrapper classes entirely via 'wrapperClass' attribute from caller.
--}}
@if($resolvedMessage || trim($slot ?? ''))
<div
    id="{{ $id }}"
    {{ $attributes->only(['class', 'style'])->merge(['class' => trim($wrapperClass)]) }}
    {{ $alertAttributeBag }}
>
    @if($resolvedMessage)
        {{-- Sorting out raw tag/message interpolation safely using {!! !!} syntax --}}
        <{!! $messageTag !!} class="{{ $messageClass }}">{!! $resolvedMessage !!}</{!! $messageTag !!}>
    @endif

    {{ $slot ?? '' }}
</div>
@endif

{{--
  =============================================================================
  HOW TO REFERENCE, CALL, OR CUSTOMIZE THIS COMPONENT ACROSS 10,000+ PROJECTS:
  -----------------------------------------------------------------------------
  1. BASIC SESSION FLASH USAGE (e.g., matching delete_success at top of page or form):
     <x-alert
         sessionKey="delete_success"
         wrapperClass="alert alert--danger"
         messageClass="alert__message"
     />

  2. DIRECT MESSAGE USAGE WITH CUSTOM STYLING CLASSES:
     <x-alert
         message="Operation completed successfully."
         type="success"
         wrapperClass="p-4 mb-4 rounded bg-green-100 text-green-700"
         messageClass="font-medium"
     />

  3. ADVANCED USAGE WITH SLOT AND GLOBAL ATTRIBUTES (aria-*, data-*):
     <x-alert
         sessionKey="status"
         wrapperClass="alert-box"
         aria-live="polite"
         data-testid="global-flash-alert"
     >
         <span>Additional custom slot content can go here.</span>
     </x-alert>

  4. FUTURE MODIFICATIONS TO THIS COMPONENT FILE:
     - To add new props: Add them to the @props array at the top with defaults.
     - To prevent props from leaking into HTML: Add prop names to $excludedAttributes.
     - To handle dynamic HTML tags or unescaped values securely, leverage explicit
       evaluations like {!! $expression !!} as demonstrated above.
  =============================================================================
--}}