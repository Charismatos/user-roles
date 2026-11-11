{{--
  =============================================================================
  WHAT: Project-Agnostic Universal Anonymous Body Tag Blade Component
  WHEN: Used across 10,000+ distinct Laravel projects requiring dynamic document body rendering.
  WHY:  Centralizes background attribute parsing, global attributes handling, and layout rendering.
  WHO:  Backend and full-stack developers maintaining shared component libraries.
  WHERE: Saved as resources/views/components/layouts/body.blade.php
  HOW:  Called in views via <x-documents.body background="#ffffff">...</x-layouts.body>
  -----------------------------------------------------------------------------
  FUTURE MODIFICATIONS (HOW TO ADD NEW CODE / BODY PROPS):
  1. PROPS DEFINITION: Add your new variable to the @props array below with an appropriate fallback.
  2. ATTRIBUTE PARSING: Add your property mapping logic inside the $dynamicAttributes array within the PHP initialization block.
  3. RENDER SURFACE: Update the <body> tag structure at the bottom if structural markup or slot handling changes.
  =============================================================================
--}}

@props([
    // Component Custom Props
    'background' => null,
    'bgcolor' => null,

    // HTML5 Global Attributes
    'id' => null,
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

{{-- THE BODY SURFACE --}}
@php
/*
  =============================================================================
  WHAT: Component Initialization & Data Normalization Engine
  WHEN: Executes on every component render lifecycle before HTML is generated.
  WHY:  Safely normalizes custom body properties, global attributes, and inline styles.
  -----------------------------------------------------------------------------
  FUTURE MODIFICATIONS:
  To support custom body classes, theme injectors, or script trackers,
  insert your custom string manipulation helper functions right here inside this block.
  =============================================================================
*/

// Container for dynamic HTML attribute bindings
$dynamicAttributes = [];

// 1. Unique ID and Data-Hub Target Binding
if (!empty($id)) {
    $dynamicAttributes['id'] = $id;
    $dynamicAttributes['data-hub-target'] = $id;
}

// 2. Custom Body Background Attributes
if (!is_null($background)) {
    $dynamicAttributes['background'] = $background;
}
if (!is_null($bgcolor)) {
    $dynamicAttributes['bgcolor'] = $bgcolor;
}

// 3. Global Attributes Resolution
if (!is_null($accesskey)) $dynamicAttributes['accesskey'] = $accesskey;
if (!is_null($autocapitalize)) $dynamicAttributes['autocapitalize'] = $autocapitalize;
if (!is_null($dir)) $dynamicAttributes['dir'] = $dir;
if (!is_null($itemprop)) $dynamicAttributes['itemprop'] = $itemprop;
if (!is_null($lang)) $dynamicAttributes['lang'] = $lang;
if (!is_null($role)) $dynamicAttributes['role'] = $role;
if (!is_null($slot)) $dynamicAttributes['slot'] = $slot;
if (!is_null($tabindex)) $dynamicAttributes['tabindex'] = $tabindex;
if (!is_null($title)) $dynamicAttributes['title'] = $title;

// 3a. Enumerated/Boolean Global Attributes Requiring Specific HTML Strings
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

// 3b. Array Hash Maps (aria-* and data-*)
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

// 3c. Style Formatter (Handling string or array styles safely with {!! !!})
if (!is_null($style)) {
    if (is_array($style)) {
        $styleString = collect($style)->map(fn($v, $k) => "{$k}: {$v}")->implode('; ');
        $dynamicAttributes['style'] = $styleString;
    } else {
        $dynamicAttributes['style'] = $style;
    }
}

/*
  FUTURE MODIFICATION NOTE:
  Ensure any newly introduced custom component props are added to this
  $excludedAttributes array so they do not leak as raw HTML attributes.
*/
$excludedAttributes = [
    'background', 'bgcolor', 'id', 'accesskey', 'aria', 'autocapitalize',
    'class', 'contenteditable', 'data', 'dir', 'draggable', 'hidden',
    'itemprop', 'lang', 'role', 'slot', 'spellcheck', 'style', 'tabindex',
    'title', 'translate'
];

// 4. Merge evaluated properties back into Blade's ComponentAttributeBag while excluding custom props
$bodyAttributeBag = $attributes->except($excludedAttributes)->merge($dynamicAttributes);

// 5. Handle Class Props Merging (Allows string or array)
if (!empty($class)) {
    $bodyAttributeBag = $bodyAttributeBag->class($class);
}
@endphp

{{--
  WHAT: Rendered Body Tag Surface
  WHEN: Outputs the final HTML <body> element with fully parsed attributes and safe evaluation using {!! !!}.
--}}
<body {!! $bodyAttributeBag !!}>
    {!! $slot ?? '' !!}
</body>

{{--
  =============================================================================
  HOW TO REFERENCE, CALL, OR CUSTOMIZE THIS COMPONENT ACROSS 10,000+ PROJECTS:
  -----------------------------------------------------------------------------
  1. BASIC USAGE:
     <x-documents.body>
         <h1>Main Application Content</h1>
     </x-layouts.body>

  2. REAL-WORLD SEPARATE USAGE EXAMPLES FOR EACH CUSTOM PROP:

     - Example A (background): For defining background imagery or graphical gradients on the body tag.
       <x-documents.body background="url('/images/auth-bg-pattern.png')">
           <div class="login-wrapper">Login Form</div>
       </x-layouts.body>

     - Example C (bgcolor): For setting solid legacy background colors on the body element.
       <x-documents.body bgcolor="#0f172a">
           <div class="dashboard-wrapper">Dark Dashboard</div>
       </x-layouts.body>

  3. COMPREHENSIVE COMBINED USAGE:
     <x-documents.body
         background="radial-gradient(circle, #ffffff, #f1f5f9)"
         bgcolor="#f8fafc"
         id="app-root-body"
         class="antialiased font-sans"
         :style="['margin' => '0', 'padding' => '0']"
         :aria="['busy' => 'false']"
         :data="['env' => 'production', 'theme' => 'light']"
     >
         <header>Application Header</header>
         <main>{{ $slot }}</main>
     </x-layouts.body>

  4. FUTURE MODIFICATIONS TO THIS COMPONENT FILE:
     - To add new custom properties, add them to the @props array with default fallbacks.
     - To prevent new custom properties from leaking as literal HTML attributes, add their names
       to the $excludedAttributes array inside the PHP initialization block.
     - To safely output evaluated attributes and styles, ensure expressions utilize raw HTML
       interpolation syntax like {!! $bodyAttributeBag !!}.
  =============================================================================
--}}