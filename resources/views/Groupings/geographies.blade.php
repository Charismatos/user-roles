@vite(['resources/css/Groupings/Editor/geographies.css', 'resources/js/Groupings/Editor/geographies.js'])

<style>
    .hidden {
        display: none;
    }
</style>
<div class="form-group pf-screen-center">
    <div class="pf-card-bounding-box">

        <x-alerts.alert sessionKey="geography_store_success" message="Geography Added Successfuly"
            wrapperClass="pa-alert pa-success geography_store_success_alert hidden" messageClass="pa-msg" role="alert"
            data-auto-dismiss="true" />

        <x-alerts.alert sessionKey="geography_update_success" message="Geography Updated Successfuly"
            wrapperClass="pa-alert pa-success geography_update_success_alert hidden" messageClass="pa-msg"
            role="alert" data-auto-dismiss="true" />

        <x-alerts.alert sessionKey="geography_delete_success" message="Geography Deleted Successfuly"
            wrapperClass="pa-alert pa-success geography_delete_success_alert hidden" messageClass="pa-msg"
            role="alert" data-auto-dismiss="true" />

        {{-- Geography Management Header Section --}}
        <header>
            <h1 class="pf-centered">Geography Focus</h1>
        </header>


        @php
            $fullPathArray = [];
            $pointer = $associateModel?->geography ?? null;
            while ($pointer) {
                array_unshift($fullPathArray, $pointer->slug);
                $pointer = $pointer->parent;
            }
        @endphp

        <form method="POST" class="pf-card pf-centered" novalidate>
            @csrf

            {{-- Top-Level Validation Error Bag Component Reference --}}
            <x-forms.top-errors wrapperClass="pfe-alert-box" />

            {{-- AJAX Request Error Container --}}
            <div class="pfe-alert-box cascading-ajax-errors hidden" role="alert" aria-live="polite"></div>

            <div id="geography_cascading_hub" data-active-path="{{ json_encode($fullPathArray) }}">
                <label>Geography Pathway Branch</label>

                <div class="cascading-level-div" data-level-row="1">
                    <select class="geography-select" data-level="1">
                        <option value="">Choose Broad Geography</option>
                        @if (isset($geographies))
                            @php
                                $rootParentSlug = null;
                                $currentGeography = $associateModel?->geography ?? null;
                                while ($currentGeography) {
                                    $rootParentSlug = $currentGeography->slug;
                                    $currentGeography = $currentGeography->parent;
                                }
                                $selectedRootSlug = old('parent_geography_slug', $rootParentSlug);
                            @endphp

                            @foreach ($geographies as $parentGeography)
                                <option value="{{ $parentGeography->slug }}" data-slug="{{ $parentGeography->slug }}"
                                    {{ $selectedRootSlug == $parentGeography->slug ? 'selected' : '' }}>
                                    {{ $parentGeography->name }}
                                </option>
                            @endforeach
                        @endif
                    </select>

                    <input type="text" class="tier-name-input" data-level="1" placeholder="Rename tier...">
                    <button type="button" class="btn-rename-tier pl-purple" data-level="1"
                        data-hint="Submit Renamed Geography">Rename
                        Geography</button>
                    <button type="button" class="btn-add-tier pl-green" data-level="1"
                        data-hint="Generate Form Field To Add New Geography">+ New Missing
                        Geography</button>
                    <button type="button" class="btn-remove-tier pl-red" data-level="1"
                        data-hint="Delete Selected Geography">✕ Remove Selected</button>

                    <div class="inline-add-container hidden" data-level="1">
                        <input type="text" class="new-item-input" data-level="1" placeholder="New geography name...">
                        <button type="button" class="btn-save-item pl-blue" data-level="1"
                            data-hint="Store Entered Geography">Save</button>
                    </div>
                </div>
            </div>
        </form>
    </div>
</div>

<x-forms.form-field type="hidden" name="geography_id" id="final_geography_target" :value="old('geography_id', $associateModel?->geography_id ?? '')" required />
