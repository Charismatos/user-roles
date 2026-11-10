{{--
  =============================================================================
  WHAT: Project-Agnostic Universal Polymorphic Aside Component
  WHEN: Used across 10,000+ distinct Laravel projects requiring dynamic sidebar and supplementary content rendering.
  WHY:  Centralizes attribute parsing, global attributes handling, and semantic element flexibility.
  WHO:  Backend and full-stack developers maintaining shared component libraries.
  WHERE: Saved as resources/views/components/documents/aside.blade.php
  HOW:  Called in views via <x-documents.aside class="sidebar-container">...</x-documents.aside>
  -----------------------------------------------------------------------------
  FUTURE MODIFICATIONS (HOW TO ADD NEW CODE / TAG TYPES):
  1. PROPS DEFINITION: Add your new variable to the @props array below with an appropriate fallback.
  2. ATTRIBUTE FILTERING: Add any custom prop name to the $excludedAttributes array
     so it doesn't get awkwardly double-rendered onto the underlying HTML tag.
  3. SWITCH CASE: Go to the @switch($type) block and add your new @case('your-type')
     handling markup, binding attributes via {!! $elementAttributeBag !!}.
  =============================================================================
--}}

@props([
    'type' => 'aside',
    'id' => null,

    // Component Custom Props (Semantic / Content Customizations)
    'datetime' => null,

    // HTML5 Global Attributes Supported Across All 10,000+ Projects
    'accesskey' => null,
    'autocapitalize' => null,
    'class' => null,
    'contenteditable' => null,
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
    'aria' => [],
    'data' => [],
])

@php
/*
  =============================================================================
  WHAT: Component Initialization & Data Normalization Engine
  WHEN: Executes on every component render lifecycle before HTML is generated.
  WHY:  Safely normalizes semantic attributes, global attributes, and inline styles.
  -----------------------------------------------------------------------------
  FUTURE MODIFICATIONS:
  To support custom widget metadata injection or tracking handlers,
  insert your custom helper functions right here inside this block.
  =============================================================================
*/

// Container for dynamic HTML attribute bindings
$dynamicAttributes = [];

// 1. Unique ID and Data-Hub Target Binding
if (!empty($id)) {
    $dynamicAttributes['id'] = $id;
    $dynamicAttributes['data-hub-target'] = $id;
}

// 2. Custom Semantic Props Resolution
if (!is_null($datetime)) {
    $dynamicAttributes['datetime'] = $datetime;
}

// 3. Global Attributes Resolution
if (!is_null($accesskey)) $dynamicAttributes['accesskey'] = $accesskey;
if (!is_null($autocapitalize)) $dynamicAttributes['autocapitalize'] = $autocapitalize;
if (!is_null($dir)) $dynamicAttributes['dir'] = $dir;
if (!is_null($itemprop)) $dynamicAttributes['itemprop'] = $itemprop;
if (!is_null($lang)) $dynamicAttributes['lang'] = $lang;
if (!is_null($role)) $dynamicAttributes['role'] = $role;
if (!is_null($slot)) $dynamicAttributes['slot'] = $slot;
if (!is_null($tabindex)) $dynamicAttributes['tabindex'] = (string)$tabindex;
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
    'type', 'id', 'datetime', 'accesskey', 'autocapitalize', 'class',
    'contenteditable', 'dir', 'draggable', 'hidden', 'itemprop', 'lang',
    'role', 'slot', 'spellcheck', 'style', 'tabindex', 'title', 'translate',
    'aria', 'data'
];

// 4. Merge evaluated properties back into Blade's ComponentAttributeBag while excluding custom props
$elementAttributeBag = $attributes->except($excludedAttributes)->merge($dynamicAttributes);

// 5. Handle Class Props Merging (Allows string or array)
if (!empty($class)) {
    $elementAttributeBag = $elementAttributeBag->class($class);
}
@endphp

{{--
  WHAT: Polymorphic Element Switcher Surface
  WHEN: Determines which element markup to render based on the passed 'type' prop.
--}}
@switch($type)

    @case('aside')
    <aside {!! $elementAttributeBag !!}>
        {!! $slot ?? '' !!}
    </aside>
    @break

    {{--
      =============================================================================
      FUTURE MODIFICATION:
      To add a brand new container type, simply insert your new `@case('your-type-name')`
      block right here before the `@default` fallback statement, referencing `{!! $elementAttributeBag !!}`.
      =============================================================================
    --}}

    @default
    <aside {!! $elementAttributeBag !!}>
        {!! $slot ?? '' !!}
    </aside>
    @endswitch

{{--
  =============================================================================
  HOW TO REFERENCE, CALL, OR CUSTOMIZE THIS COMPONENT ACROSS 10,000+ PROJECTS:
  -----------------------------------------------------------------------------
  1. BASIC REAL-WORLD USAGE (Sidebar Quick Navigation Widget):
     <x-documents.aside class="sidebar-widget bg-gray-50 p-4 rounded-lg">
         <h3 class="font-bold text-lg">Quick Navigation</h3>
         <ul class="mt-2 space-y-1">
             <li><a href="#overview">Project Overview</a></li>
             <li><a href="#compliance">NPS Act 2020 Compliance</a></li>
         </ul>
     </x-documents.aside>

  2. REAL-WORLD USAGE (Related Articles / Fintech Resources Sidebar):
     <x-documents.aside
         class="related-articles-box border-l-4 border-blue-600 pl-4 py-2"
         aria-label="Related Fintech Insights"
     >
         <h4 class="font-semibold">Related Resources</h4>
         <p class="text-sm text-gray-600">Explore Bank of Uganda licensing tiers and capitalization structures.</p>
     </x-documents.aside>

  3. COMPREHENSIVE COMBINED REAL-WORLD USAGE:
     <x-documents.aside
         type="aside"
         id="author-bio-sidebar"
         class="author-profile-card shadow-md p-6 rounded-xl border border-gray-100"
         :style="['background-color' => '#ffffff', 'margin-top' => '2rem']"
         :aria="['complementary' => 'true', 'label' => 'Author Biography']"
         :data="['widget-type' => 'author-bio', 'user-handle' => 'charismadev']"
     >
         <div class="flex items-center space-x-4">
             <img src="/images/avatar.jpg" alt="Wandera Garvin" class="w-12 h-12 rounded-full">
             <div>
                 <h4 class="font-bold text-gray-900">Wandera Garvin</h4>
                 <p class="text-xs text-gray-500">Fintech Software Architect at Jukuna Financial Services</p>
             </div>
         </div>
     </x-documents.aside>

  4. FUTURE MODIFICATIONS TO THIS COMPONENT FILE:
     - To add new custom properties, add them to the @props array with default fallbacks.
     - To prevent custom properties from leaking as literal HTML attributes, add their names
       to the $excludedAttributes array inside the @php block.
     - To safely output evaluated attributes and styles, ensure expressions utilize raw HTML
       interpolation syntax like {!! $elementAttributeBag !!}.
  =============================================================================
--}}