{{--
  =============================================================================
  WHAT: Project-Agnostic Universal Polymorphic Table and Structural Component
  WHEN: Used across 10,000+ distinct Laravel projects requiring dynamic tabular layouts.
  WHY:  Centralizes attribute parsing, global attributes handling, and element polymorphism.
  WHO:  Backend and full-stack developers maintaining shared component libraries.
  WHERE: Saved as resources/views/components/tables/table-field.blade.php
  HOW:  Called in views via <x-tables.table type="table" class="data-table">...</x-tables.table>
  -----------------------------------------------------------------------------
  FUTURE MODIFICATIONS (HOW TO ADD NEW CODE / TABLE TAG TYPES):
  1. PROPS DEFINITION: Add your new variable to the @props array below with an appropriate fallback.
  2. ATTRIBUTE FILTERING: Add any custom prop name to the $excludedAttributes array
     so it doesn't get awkwardly double-rendered onto the underlying HTML tag.
  3. SWITCH CASE: Go to the @switch($type) block and add your new @case('your-type')
     handling markup, binding attributes via {!! $elementAttributeBag !!}.
  =============================================================================
--}}

@props([
    'type' => 'table',
    'id' => null,

    // Component Custom Props (Grouped by Table Element Types)
    'align' => null,
    'bgcolor' => null,
    'border' => null,
    'summary' => null,
    'span' => null,
    'colspan' => null,
    'rowspan' => null,
    'headers' => null,
    'scope' => null,

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
  WHY:  Safely normalizes table-specific properties, global attributes, and inline styles.
  -----------------------------------------------------------------------------
  FUTURE MODIFICATIONS:
  To support custom data transformations, serialization, or accessibility audits,
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

// 2. Table Element Custom Props Resolution
if (!is_null($align)) $dynamicAttributes['align'] = $align;
if (!is_null($bgcolor)) $dynamicAttributes['bgcolor'] = $bgcolor;
if (!is_null($border)) $dynamicAttributes['border'] = $border;
if (!is_null($summary)) $dynamicAttributes['summary'] = $summary;
if (!is_null($span)) $dynamicAttributes['span'] = $span;
if (!is_null($colspan)) $dynamicAttributes['colspan'] = $colspan;
if (!is_null($rowspan)) $dynamicAttributes['rowspan'] = $rowspan;
if (!is_null($headers)) $dynamicAttributes['headers'] = $headers;
if (!is_null($scope)) $dynamicAttributes['scope'] = $scope;

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
    'type', 'id', 'align', 'bgcolor', 'border', 'summary', 'span',
    'colspan', 'rowspan', 'headers', 'scope', 'accesskey', 'autocapitalize',
    'class', 'contenteditable', 'dir', 'draggable', 'hidden', 'itemprop',
    'lang', 'role', 'slot', 'spellcheck', 'style', 'tabindex', 'title',
    'translate', 'aria', 'data'
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
  WHEN: Determines which table element markup to render based on the passed 'type' prop.
--}}
@switch($type)

    @case('table')
    <table {!! $elementAttributeBag !!}>
        {!! $slot ?? '' !!}
    </table>
    @break

    @case('caption')
    <caption {!! $elementAttributeBag !!}>
        {!! $slot ?? '' !!}
    </caption>
    @break

    @case('col')
    <col {!! $elementAttributeBag !!} />
    @break

    @case('colgroup')
    <colgroup {!! $elementAttributeBag !!}>
        {!! $slot ?? '' !!}
    </colgroup>
    @break

    @case('thead')
    <thead {!! $elementAttributeBag !!}>
        {!! $slot ?? '' !!}
    </thead>
    @break

    @case('tbody')
    <tbody {!! $elementAttributeBag !!}>
        {!! $slot ?? '' !!}
    </thead>
    @break

    @case('tfoot')
    <tfoot {!! $elementAttributeBag !!}>
        {!! $slot ?? '' !!}
    </tfoot>
    @break

    @case('tr')
    <tr {!! $elementAttributeBag !!}>
        {!! $slot ?? '' !!}
    </tr>
    @break

    @case('th')
    <th {!! $elementAttributeBag !!}>
        {!! $slot ?? '' !!}
    </th>
    @break

    @case('td')
    <td {!! $elementAttributeBag !!}>
        {!! $slot ?? '' !!}
    </td>
    @break

    {{--
      =============================================================================
      FUTURE MODIFICATION:
      To add a brand new table element type (e.g., custom data summary tags),
      simply insert your new `@case('your-type-name')` block right here before
      the `@default` fallback statement, referencing `{!! $elementAttributeBag !!}`.
      =============================================================================
    --}}

    @default
    <div {!! $elementAttributeBag !!}>
        {!! $slot ?? '' !!}
    </tr>
    @endswitch

{{--
  =============================================================================
  HOW TO REFERENCE, CALL, OR CUSTOMIZE THIS COMPONENT ACROSS 10,000+ PROJECTS:
  -----------------------------------------------------------------------------
  1. BASIC USAGE:
     <x-tables.table type="table">
         <x-tables.table type="tr">
             <x-tables.table type="th">Header Name</x-tables.table>
         </x-tables.table>
     </x-tables.table>

  2. REAL-WORLD SEPARATE USAGE EXAMPLES FOR EACH CUSTOM PROP:

     - Example A (<caption> with align):
       <x-tables.table type="caption" align="bottom">
           Table 1.1: Financial Transactions Ledger
       </x-tables.table>

     - Example B (<col> with span and bgcolor):
       <x-tables.table type="col" span="2" bgcolor="#f8fafc" />

     - Example C (<colgroup> with span and align):
       <x-tables.table type="colgroup" span="3" align="center" />

     - Example D (<table> with border, summary, and bgcolor):
       <x-tables.table type="table" border="1" summary="User list table" bgcolor="#ffffff">
           ...
       </x-tables.table>

     - Example E (<tbody> with align and bgcolor):
       <x-tables.table type="tbody" align="left" bgcolor="#f1f5f9">
           ...
       </x-tables.table>

     - Example F (<td> with colspan, rowspan, headers, and align):
       <x-tables.table type="td" colspan="2" rowspan="1" headers="col-name" align="right">
           $4,500.00
       </x-tables.table>

     - Example G (<tfoot> with bgcolor):
       <x-tables.table type="tfoot" bgcolor="#e2e8f0">
           ...
       </x-tables.table>

     - Example H (<th> with scope, headers, colspan):
       <x-tables.table type="th" scope="col" colspan="1">
           Account Holder
       </x-tables.table>

     - Example I (<thead> with align):
       <x-tables.table type="thead" align="center">
           ...
       </x-tables.table>

     - Example J (<tr> with bgcolor and align):
       <x-tables.table type="tr" bgcolor="#eff6ff" align="left">
           ...
       </x-tables.table>

  3. COMPREHENSIVE COMBINED USAGE:
     <x-tables.table
         type="table"
         border="0"
         summary="Enterprise financial accounts ledger"
         class="pf-table-root shadow-md"
         :style="['width' => '100%', 'border-collapse' => 'collapse']"
     >
         <x-tables.table type="caption" align="top">Monthly Balances</x-tables.table>
         <x-tables.table type="thead" bgcolor="#1e293b">
             <x-tables.table type="tr">
                 <x-tables.table type="th" scope="col" :style="['color' => '#ffffff']">Reference</x-tables.table>
             </x-tables.table>
         </x-tables.table>
     </x-tables.table>

  4. FUTURE MODIFICATIONS TO THIS COMPONENT FILE:
     - To add new custom table properties, add them to the @props array with default fallbacks.
     - To prevent custom properties from leaking as literal HTML attributes, add their names
       to the $excludedAttributes array inside the @php block.
     - To safely output evaluated attributes and styles, ensure expressions utilize raw HTML
       interpolation syntax like {!! $elementAttributeBag !!}.
  =============================================================================
--}}