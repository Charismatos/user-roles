{{--
  =============================================================================
  WHAT: Project-Agnostic Universal Anonymous Anchor Link Blade Component
  WHEN: Used across 10,000+ distinct Laravel projects requiring dynamic link rendering.
  WHY:  Centralizes attribute parsing, native anchor property normalization, and accessibility handlers.
  WHO:  Backend and full-stack developers maintaining shared component libraries.
  WHERE: Saved as resources/views/components/links/link.blade.php
  HOW:  Called in views via <x-links.link href="{{ route('home') }}" label="Home" />
  -----------------------------------------------------------------------------
  FUTURE MODIFICATIONS (HOW TO ADD NEW CODE / LINK PROPS):
  1. PROPS DEFINITION: Add your new variable to the @props array below with an appropriate fallback.
  2. ATTRIBUTE PARSING: Add your property mapping logic inside the $dynamicAttributes array within the @php block.
  3. RENDER SURFACE: Update the <a> tag structure at the bottom if structural markup or slot handling changes.
  =============================================================================
--}}

@props([
    // Component Custom Props
    'href' => '#',
    'label' => null,
    'download' => null,
    'hreflang' => null,
    'media' => null,
    'ping' => null,
    'referrerpolicy' => null,
    'rel' => null,
    'shape' => null,
    'target' => null,

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

{{-- THE ANCHOR LINK SURFACE --}}
@php
/*
  =============================================================================
  WHAT: Component Initialization & Data Normalization Engine
  WHEN: Executes on every component render lifecycle before HTML is generated.
  WHY:  Safely normalizes native anchor attributes, global attributes, and inline styles.
  -----------------------------------------------------------------------------
  FUTURE MODIFICATIONS:
  To support custom URL signing, tracking parameters, or localization prefixing,
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

// 2. Standard Anchor Link Attributes
if (!is_null($href)) $dynamicAttributes['href'] = $href;
if (!is_null($download)) $dynamicAttributes['download'] = $download;
if (!is_null($hreflang)) $dynamicAttributes['hreflang'] = $hreflang;
if (!is_null($media)) $dynamicAttributes['media'] = $media;
if (!is_null($ping)) $dynamicAttributes['ping'] = $ping;
if (!is_null($referrerpolicy)) $dynamicAttributes['referrerpolicy'] = $referrerpolicy;
if (!is_null($rel)) $dynamicAttributes['rel'] = $rel;
if (!is_null($shape)) $dynamicAttributes['shape'] = $shape;
if (!is_null($target)) $dynamicAttributes['target'] = $target;

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
    'href', 'label', 'download', 'hreflang', 'media', 'ping',
    'referrerpolicy', 'rel', 'shape', 'target', 'id', 'accesskey',
    'aria', 'autocapitalize', 'class', 'contenteditable', 'data',
    'dir', 'draggable', 'hidden', 'itemprop', 'lang', 'role',
    'slot', 'spellcheck', 'style', 'tabindex', 'title', 'translate'
];

// 4. Merge evaluated properties back into Blade's ComponentAttributeBag while excluding custom props
$linkAttributeBag = $attributes->except($excludedAttributes)->merge($dynamicAttributes);

// 5. Handle Class Props Merging (Allows string or array)
if (!empty($class)) {
    $linkAttributeBag = $linkAttributeBag->class($class);
}
@endphp

{{--
  WHAT: Rendered Anchor Link Surface
  WHEN: Outputs the final HTML <a> element with fully parsed attributes and safe evaluation using {!! !!}.
--}}
<a {!! $linkAttributeBag !!}>
    {!! $slot->isEmpty() ? $label : $slot !!}
</a>

{{--
  =============================================================================
  HOW TO REFERENCE, CALL, OR CUSTOMIZE THIS COMPONENT ACROSS 10,000+ PROJECTS:
  -----------------------------------------------------------------------------
  1. BASIC USAGE:
     <x-links.link href="{{ route('home') }}" label="Go to Home" />

  2. REAL-WORLD SEPARATE USAGE EXAMPLES FOR EACH CUSTOM PROP:

     - Example A (download): For triggering file downloads directly.
       <x-links.link
           href="/storage/reports/annual-2026.pdf"
           label="Download Annual Report"
           download="Annual_Report_2026.pdf"
       />

     - Example B (hreflang): For specifying language metadata of the target linked document.
       <x-links.link
           href="{{ route('fr.welcome') }}"
           label="Lire en Français"
           hreflang="fr"
       />

     - Example C (media): For responsive links tailored to specific device viewports.
       <x-links.link
           href="{{ route('mobile.app') }}"
           label="Download Mobile App Version"
           media="(max-width: 768px)"
       />

     - Example D (ping): For tracking user click analytics via pingback endpoints.
       <x-links.link
           href="https://external-partner.com/offer"
           label="Visit Partner Offer"
           ping="/api/v1/track-outbound-click?target=partner"
       />

     - Example E (referrerpolicy): For controlling HTTP referrer headers sent upon navigation.
       <x-links.link
           href="https://secure.payment-gateway.com"
           label="Proceed to Secure Checkout"
           referrerpolicy="no-referrer"
       />

     - Example F (rel): For defining relationship links (e.g., security protections).
       <x-links.link
           href="https://github.com/Charismatos"
           label="GitHub Profile"
           rel="noopener noreferrer"
       />

     - Example G (shape): For image map clickable coordinate regions.
       <x-links.link
           href="#section-map"
           label="Map Hotspot"
           shape="poly"
       />

     - Example H (target): For opening documents in a new browser tab/window.
       <x-links.link
           href="https://docs.jukunafinancial.com"
           label="API Documentation"
           target="_blank"
       />

  3. COMPREHENSIVE COMBINED USAGE:
     <x-links.link
         href="{{ route('dashboard') }}"
         class="pf-link pf-primary"
         :style="['color' => '#1d4ed8', 'font-weight' => '600']"
         target="_blank"
         rel="noopener"
     >
         <span>📊</span> Launch Secure Dashboard
     </x-links.link>

  4. FUTURE MODIFICATIONS TO THIS COMPONENT FILE:
     - To add new custom link properties, add them to the @props array with default fallbacks.
     - To prevent new custom properties from leaking as literal HTML attributes, add their names
       to the $excludedAttributes array inside the @php block.
     - To safely output evaluated attributes and styles, ensure expressions utilize raw HTML
       interpolation syntax like {!! $linkAttributeBag !!}.
  =============================================================================
--}}